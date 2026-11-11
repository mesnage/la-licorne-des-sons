#!/usr/bin/env python3
"""Record the game's words and reading prompts in Robin's natural speaking voice."""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
from html import escape, unescape
import io
import json
from pathlib import Path
import re
import subprocess
import time
import wave

from build_curriculum_robin import AUDIO, MODEL, ROOT, VOICE, extract_initial_word, load_key, normalize, request


def neutral(text):
    text = re.sub(r'\s*!+', '.', text.strip())
    return text if text.endswith(('.', '?', '…')) else text + '.'


def prompts():
    code = """
import { WORDS } from './js/data/words.js';
import { SENTENCES } from './js/data/sentences.js';
console.log(JSON.stringify([
  Object.fromEntries(WORDS.map(word => [word.audioKey, word.speech ?? word.text])),
  Object.fromEntries(SENTENCES.map(sentence => [sentence.audioKey, sentence.text]))
]));
"""
    words, sentences = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e', code], cwd=ROOT))
    return {
        **{key: neutral('Trouve le mot ' + text) for key, text in words.items()},
        **{key: neutral(text) for key, text in sentences.items()}
    }


def digest(text):
    return hashlib.sha256(f'{MODEL}\n{VOICE}\n{text}'.encode()).hexdigest()[:20]


def cached_request(api_key, text, cache, timing):
    path = cache / (digest(text) + ('.json' if timing else '.mp3'))
    if path.exists():
        return path.read_bytes()
    for attempt in range(4):
        try:
            data = request(api_key, text, with_timing=timing)
            temporary = path.with_suffix(path.suffix + '.tmp')
            temporary.write_bytes(data)
            temporary.replace(path)
            return data
        except ValueError as error:
            if str(error) not in ('ElevenLabs HTTP 429.', 'ElevenLabs HTTP 502.', 'ElevenLabs HTTP 503.',
                                  'ElevenLabs HTTP 504.', 'Connexion ElevenLabs interrompue.') or attempt == 3:
                raise
            time.sleep(2 ** (attempt + 1))


def decode(raw):
    return subprocess.run(
        ['ffmpeg', '-v', 'error', '-xerror', '-i', 'pipe:0', '-ac', '1', '-ar', '44100', '-f', 's16le', 'pipe:1'],
        input=raw, capture_output=True, check=True).stdout


def wav(pcm):
    output = io.BytesIO()
    with wave.open(output, 'wb') as stream:
        stream.setparams((1, 2, 44100, 0, 'NONE', 'not compressed'))
        stream.writeframes(pcm)
    return output.getvalue()


def split_batch(raw, lines):
    result = json.loads(raw)
    alignment = result['alignment']
    characters = ''.join(alignment['characters'])
    starts = alignment['character_start_times_seconds']
    ends = alignment['character_end_times_seconds']
    spans = []
    cursor = 0
    for line in lines:
        index = characters.find(line, cursor)
        if index < 0:
            raise ValueError('Le texte ne correspond pas à l’alignement.')
        cursor = index + len(line)
        start = starts[index]
        end = max(ends[cursor - 1], starts[cursor - 1])
        if not .10 <= end - start <= 24:
            raise ValueError('Durée de segment incohérente.')
        if spans and start < spans[-1][1] - .06:
            raise ValueError('Deux segments se chevauchent.')
        spans.append((start, end))
    pcm = decode(base64.b64decode(result['audio_base64']))
    for i, (start, end) in enumerate(spans):
        before = max(0, start - .055)
        after = end + .085
        if i:
            before = max(before, (spans[i - 1][1] + start) / 2)
        if i + 1 < len(spans):
            after = min(after, (end + spans[i + 1][0]) / 2)
        yield wav(pcm[round(before * 44100) * 2:round(after * 44100) * 2])


def encode(raw, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp.mp3')
    seconds = normalize(raw, temporary)
    temporary.replace(path)
    return seconds


def replace_listening_catalogue(common, lines):
    path = ROOT / 'ecoute.html'
    def update(match):
        key = unescape(match[3])
        if key not in lines:
            return match[0]
        return f'<article><p>{escape(lines[key], quote=False)}</p><audio controls preload="none" src="audio/{common[key]}"></audio><small>{match[3]}</small></article>'
    content = re.sub(r'<article><p>([^<]*)</p><audio controls preload="none" src="audio/([^"]+)"></audio><small>([^<]+)</small></article>',
                     update, path.read_text(encoding='utf-8'))
    return path, content


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, required=True)
    parser.add_argument('--env-file', type=Path, default=ROOT / '.env.local')
    parser.add_argument('--generate', action='store_true')
    args = parser.parse_args()
    names = ['manifest.json', *(f'curriculum-c{chapter}-robin.json' for chapter in range(1, 8))]
    manifests = {name: json.loads((AUDIO / name).read_text(encoding='utf-8')) for name in names}
    common = manifests['manifest.json']
    lines = prompts()
    lines.update({key: neutral('Comme dans ' + key[2:]) for key in common if key.startswith('w:')})
    lines['w:nez'] = 'Comme dans le mot nez.'
    contexts = {'C23:écrit:fotœj:fauteuil': 'Fauteuil, comme un fauteuil dans le salon.'}
    curriculum = [
        (name, key, track, neutral(track['spoken']), contexts.get(key, track.get('synthesisText')))
        for name in names[1:] for key, track in manifests[name].items()
        if not key.startswith(('P:robin:', 'simple:consigne:'))
    ]
    scripts = list(dict.fromkeys([(line, None) for line in lines.values()]
                                  + [(line, context) for _, _, _, line, context in curriculum]))
    print(f'{len(lines)} pistes d’ateliers, {len(curriculum)} entrées du parcours, {len(scripts)} prises distinctes.', flush=True)
    if not args.generate:
        return
    args.cache.mkdir(parents=True, exist_ok=True)
    recordings = args.cache / 'recordings'
    recordings.mkdir(exist_ok=True)
    api_key = load_key(args.env_file)
    results = {}

    def record(group):
        cached = []
        missing = []
        for line, context in group:
            path = recordings / (digest(context or line) + '.mp3')
            duration = path.with_suffix('.seconds')
            if path.exists() and duration.exists():
                cached.append(((line, context), path, float(duration.read_text())))
            else:
                missing.append((line, context))
        if not missing:
            return cached
        group = missing
        if len(group) == 1:
            line, context = group[0]
            raw = cached_request(api_key, context or line, args.cache, bool(context))
            if context:
                raw = extract_initial_word(raw, line.removesuffix('.'))
            clips = [raw]
        else:
            lines = [line for line, _ in group]
            raw = cached_request(api_key, '\n\n'.join(lines), args.cache, True)
            try:
                clips = list(split_batch(raw, lines))
            except (ValueError, KeyError, IndexError):
                middle = len(group) // 2
                return cached + record(group[:middle]) + record(group[middle:])
        output = cached.copy()
        for (line, context), raw in zip(group, clips, strict=True):
            identity = digest(context or line)
            path = recordings / (identity + '.mp3')
            duration = path.with_suffix('.seconds')
            try:
                seconds = encode(raw, path)
            except ValueError:
                if len(group) == 1:
                    raise
                return cached + record([(line, context)]) + record([item for item in group if item != (line, context)])
            duration.write_text(str(seconds))
            output.append(((line, context), path, seconds))
        return output

    groups = [[item] for item in scripts if item[1]]
    plain = [item for item in scripts if not item[1]]
    groups.extend(plain[i:i + 10] for i in range(0, len(plain), 10))
    next_report = 50
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = [pool.submit(record, group) for group in groups]
        for future in as_completed(futures):
            for key, path, seconds in future.result():
                results[key] = (path, seconds)
            if len(results) >= next_report or len(results) == len(scripts):
                print(f'{len(results)} / {len(scripts)} prises prêtes.', flush=True)
                next_report += 50

    for key, line in lines.items():
        path, _ = results[(line, None)]
        prefix = {'w': 'mot', 'W': 'mot-entier', 'S': 'phrase'}[key.split(':', 1)[0]]
        new = f'{prefix}-robin-{path.stem}.mp3'
        (AUDIO / new).write_bytes(path.read_bytes())
        common[key] = new
    for name, key, track, line, context in curriculum:
        path, seconds = results[(line, context)]
        new = 'curriculum-robin-naturel/' + path.name
        target = AUDIO / new
        target.parent.mkdir(exist_ok=True)
        data = path.read_bytes()
        target.write_bytes(data)
        manifests[name][key] = {
            **track, 'file': new, 'spoken': line, 'speechSeconds': seconds,
            'sha256': hashlib.sha256(data).hexdigest(), 'review': 'pending_human_review',
            **({'synthesisText': context} if context else {})
        }
    updates = [
        (AUDIO / name, json.dumps(manifest, ensure_ascii=False, indent=1 if name == 'manifest.json' else 2) + '\n')
        for name, manifest in manifests.items()
    ]
    updates.append(replace_listening_catalogue(common, lines))
    for path, content in updates:
        temporary = path.with_suffix(path.suffix + '.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(path)


if __name__ == '__main__':
    main()
