#!/usr/bin/env python3
"""Generate the audible curriculum clips with the existing Robin voice."""
import argparse
from array import array
import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import threading
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
AUDIO = ROOT / 'audio'
VOICE = 'ZLsOpArVEayz7qulwa9E'
MODEL = 'eleven_v4'
SPOKEN = {
    'ché':'chez', 'lou':'loup', 'rou':'roue', 'sé':'ses', 'vou':'vous',
    'ba':'bas', 'bo':'beau', 'di':'dis', 'do':'dos', 'ka':'cas', 'qua':'cas',
    'ki':'qui', 'ko':'co', 'quo':'co',
    'mo':'mot', 'no':'nos', 'po':'pot', 'to':'tôt',
    'bonv':'bonve', 'lanf':'lanfe', 'painr':'painre', 'toim':'toime', 'veilp':'veilpe'
}
# Selected after comparing the isolated and contextual pronunciations.
CONTEXTS = {
    'cabane':'Cabane, comme une petite maison.',
    'chou':'Chou, comme le légume.',
    'chute':'Chute, quand on tombe.',
    'figue':'Figue, comme le fruit.',
    'igloo':'Igloo, comme la maison de neige.',
    'jupe':'Jupe, comme le vêtement.',
    'lapin':'Lapin, comme le petit animal.',
    'livre':'Livre, comme un livre à lire.',
    'loup':'Loup, comme le loup de la forêt.',
    'lutin':'Lutin, comme un petit personnage.',
    'outil':'Outil, comme un marteau.',
    'sac':'Sac, comme un sac à dos.',
    'salira':'Salira, comme il salira la table.',
    'vue':'Vue, comme la vue du paysage.',
    'école':'École, comme l’école des enfants.'
}
SOURCE = """
import {readFileSync} from 'node:fs';
import {createCurriculum} from './js/learning/curriculum.js';
import {createSimpleQuestions} from './js/learning/curriculum-simple.js';
const curriculum = createCurriculum(JSON.parse(readFileSync('js/data/curriculum.v2.json')));
const requested = process.argv.slice(1);
const result = {};
for (const id of requested) {
    const chapter = curriculum.getChapter(id);
    const keys = chapter.units.flatMap(unit => createSimpleQuestions(chapter, unit, null, 0))
      .flatMap(q => [q.instructionAudio, q.prompt, q.context, q.questionAudio, ...q.choices, ...(q.optionAudio ?? [])].filter(Boolean));
    result[id] = [...new Set(keys)].sort();
}
console.log(JSON.stringify(result));
"""

def read_json(name):
    return json.loads((AUDIO / name).read_text(encoding='utf-8'))

def load_key(env_file):
    value = os.environ.get('ELEVENLABS_API_KEY')
    if not value and env_file.is_file():
        match = re.search(r'^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*([^\r\n]+)',
                          env_file.read_text(encoding='utf-8'), re.M)
        if match:
            value = re.split(r'\s+#', match[1], maxsplit=1)[0].strip().strip('"\'')
    if not value:
        raise ValueError('Clé ElevenLabs indisponible.')
    return value

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *_args, **_kwargs):
        raise ValueError('Redirection refusée.')

def request(key, text, with_timing=False):
    body = json.dumps({
        'text': text, 'model_id': MODEL, 'language_code': 'fr', 'seed': 42,
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75}
    }).encode()
    endpoint = '/with-timestamps' if with_timing else ''
    output_type = 'application/json' if with_timing else 'audio/mpeg'
    url = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE + endpoint + '?output_format=mp3_44100_128'
    req = urllib.request.Request(url, body, {
        'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': output_type
    })
    try:
        with urllib.request.build_opener(NoRedirect).open(req, timeout=60) as response:
            if response.headers.get_content_type() != output_type:
                raise ValueError('Format ElevenLabs inattendu.')
            return response.read()
    except urllib.error.HTTPError as error:
        raise ValueError(f'ElevenLabs HTTP {error.code}.') from None
    except urllib.error.URLError:
        raise ValueError('Connexion ElevenLabs interrompue.') from None

def extract_initial_word(payload, word):
    result = json.loads(payload)
    alignment = result['alignment']
    characters = ''.join(alignment['characters'])
    if not characters.casefold().startswith(word.casefold()+','):
        raise ValueError('Le mot demandé ne correspond pas à l’alignement ElevenLabs.')
    starts = alignment['character_start_times_seconds']
    ends = alignment['character_end_times_seconds']
    if any(end < start for start, end in zip(starts, ends)):
        ends = [start+duration for start, duration in zip(starts, ends)]
    end = max(ends[len(word)-1], starts[len(word)])
    if not 0.15 < end < 2.5:
        raise ValueError('Fin du mot hors de la plage attendue.')
    raw = base64.b64decode(result['audio_base64'])
    return subprocess.run(['ffmpeg','-v','error','-i','pipe:0','-t',str(end+.025),'-f','mp3','pipe:1'],
                          input=raw, capture_output=True, check=True).stdout

def normalize(raw, path):
    decode = subprocess.run(['ffmpeg','-v','error','-i','pipe:0','-ac','1','-ar','44100',
                             '-f','f32le','pipe:1'], input=raw, capture_output=True, check=True)
    samples = array('f')
    samples.frombytes(decode.stdout)
    voiced = [i for i, value in enumerate(samples) if abs(value) > 0.012]
    if not voiced:
        raise ValueError('Piste silencieuse.')
    core = samples[voiced[0]:voiced[-1]+1]
    duration = len(core) / 44100
    if not 0.10 <= duration <= 24:
        raise ValueError(f'Durée inattendue : {duration:.2f} s.')
    rms = math.sqrt(sum(value*value for value in core) / len(core))
    gain = min(0.12 / rms, 0.85 / max(abs(value) for value in core))
    # Leave space before and after speech so the first and last sounds remain clear.
    samples = samples[max(0, voiced[0]-2205):voiced[-1]+1+3528]
    out = array('f', [0])*2205 + array('f', (value*gain for value in samples)) + array('f', [0])*2205
    subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar','44100','-ac','1','-i','pipe:0',
                    '-b:a','128k',str(path)], input=out.tobytes(), check=True, capture_output=True)
    subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'], check=True, capture_output=True)
    return round(duration, 3)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--generate', action='store_true', help='Submit paid audio-generation requests.')
    parser.add_argument('--env-file', type=Path, default=ROOT / '.env.local')
    parser.add_argument('--cache', type=Path, required=True, help='Directory for paid raw audio, outside the repository.')
    parser.add_argument('--chapters', nargs='+', choices=['C1', 'C2', 'C3', 'C4'], default=['C1'])
    args = parser.parse_args()
    chapters = list(dict.fromkeys(args.chapters))
    keys = json.loads(subprocess.check_output(['node','--input-type=module','-e',SOURCE,*chapters], cwd=ROOT))
    shared = read_json('curriculum-simple.json')
    sources = {chapter: {**read_json('curriculum-'+chapter.lower()+'.json'), **shared} for chapter in chapters}
    legacy = read_json('manifest.json')
    stop = threading.Event()
    guard = threading.Lock()
    clip_locks = {}
    jobs = [(chapter, key) for chapter in chapters for key in keys[chapter]]

    def utterance(chapter, key):
        text = sources[chapter][key]['text']
        written = key.startswith(('C1:écrit:', 'C23:écrit:'))
        spoken = SPOKEN.get(text, text) if written else text
        if not spoken.endswith(('?', '.', '!')):
            spoken += '.'
        return text, spoken, CONTEXTS.get(spoken.removesuffix('.'))

    existing = {}
    for chapter in ['C1', 'C2', 'C3', 'C4']:
        name = 'curriculum-'+chapter.lower()+'-robin.json'
        if (AUDIO / name).is_file():
            for track in read_json(name).values():
                if track.get('model') == MODEL and (AUDIO / track['file']).is_file():
                    existing[(track['spoken'], track.get('synthesisText'))] = track

    pending = {utterance(chapter,key)[1:] for chapter,key in jobs if not key.startswith('P:robin:')}
    pending.difference_update(existing)
    print(f'{len(jobs)} entrées sur {len(chapters)} chapitre(s) ; {len(pending)} énoncés nouveaux au maximum.', flush=True)
    if not args.generate:
        return
    api_key = load_key(args.env_file)
    args.cache.mkdir(parents=True, exist_ok=True)

    def generate(job):
        chapter, key = job
        if stop.is_set():
            return None
        if key.startswith('P:robin:'):
            file = legacy[key]
            text = key.split(':')[-1]
            entry = {'file': file, 'text': text, 'speaker': 'robin', 'provider': 'elevenlabs',
                     'review': 'approved_existing_phoneme'}
        else:
            text, spoken, context = utterance(chapter, key)
            with guard:
                clip_lock = clip_locks.setdefault((spoken, context), threading.Lock())
            with clip_lock:
                if (spoken, context) in existing:
                    entry = {**existing[(spoken, context)], 'text': text}
                else:
                    digest = hashlib.sha256((MODEL+'\n'+VOICE+'\n'+(context or spoken)).encode()).hexdigest()[:20]
                    raw_path = args.cache / (digest + ('.json' if context else '.mp3'))
                    if not raw_path.exists():
                        if stop.is_set():
                            return None
                        raw_path.write_bytes(request(api_key, context or spoken, with_timing=bool(context)))
                    target = AUDIO / ('curriculum-' + chapter.lower() + '-robin')
                    target.mkdir(exist_ok=True)
                    path = target / (digest + '.mp3')
                    raw = raw_path.read_bytes()
                    if context:
                        raw = extract_initial_word(raw, spoken.removesuffix('.'))
                    length = normalize(raw, path)
                    entry = {'file': str(path.relative_to(AUDIO)), 'text': text, 'spoken': spoken,
                             'speaker': 'robin', 'provider': 'elevenlabs', 'model': MODEL,
                             'language': 'fr', 'review': 'pending_human_review', 'speechSeconds': length}
                    if context:
                        entry['synthesisText'] = context
                    existing[(spoken, context)] = entry
        entry['sha256'] = hashlib.sha256((AUDIO / entry['file']).read_bytes()).hexdigest()
        return chapter, key, entry

    def checked(key):
        try:
            return generate(key)
        except (ValueError, OSError, subprocess.SubprocessError) as error:
            stop.set()
            print(f'Arrêt à {key[1]} : {error if isinstance(error, ValueError) else type(error).__name__}', flush=True)
            return None

    entries = {chapter: {} for chapter in chapters}
    count = 0
    with ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(checked, jobs):
            if result:
                chapter, name, metadata = result
                entries[chapter][name] = metadata
                count += 1
                if count % 25 == 0 or count == len(jobs):
                    print(f'{count} / {len(jobs)} pistes prêtes', flush=True)
    if count != len(jobs):
        raise SystemExit('Lot incomplet. Les réponses audio payées sont conservées en cache.')
    for chapter, tracks in entries.items():
        manifest = AUDIO / ('curriculum-' + chapter.lower() + '-robin.json')
        manifest.write_text(json.dumps(tracks, ensure_ascii=False, sort_keys=True, indent=2)+'\n', encoding='utf-8')

if __name__ == '__main__':
    main()
