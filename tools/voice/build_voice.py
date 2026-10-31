#!/usr/bin/env python3
"""Fabrique la voix du jeu (fichiers audio/*.mp3 + audio/manifest.json).

Ce que le script fait :
  1. lit les sons dans js/data/sounds.js, les mots entiers dans js/data/words.js, et les phrases N("…") / U("…") dans js/**/*.js ;
  2. génère, avec une voix française (piper « fr_FR-siwis-medium »), chaque phrase qui n'a pas encore d'audio ;
  3. (par défaut) vérifie chaque phrase avec une reconnaissance vocale française (Whisper) :
     plusieurs essais, on garde celui qui est compris correctement ;
  4. met à jour audio/manifest.json.

Utilisation (depuis la racine du projet) :
  bash tools/voice/download_models.sh            # une seule fois : télécharge la voix et la reconnaissance vocale
  pip install -r tools/voice/requirements.txt    # une seule fois (et ffmpeg doit être installé)
  python3 tools/voice/build_voice.py             # génère ce qui manque
  python3 tools/voice/build_voice.py --list      # montre seulement ce qui manque
  python3 tools/voice/build_voice.py --redo "w:moto,L:m"   # refait des phrases précises
  python3 tools/voice/build_voice.py --prune     # supprime les audios qui ne servent plus
  python3 tools/voice/build_voice.py --no-verify # plus rapide, sans reconnaissance vocale

Toutes les phrases sont dites EN PHRASES COMPLÈTES (jamais un son isolé, que la voix prononce mal) :
  L:<son>  « Trouve la lettre, M ! »   F:<son>  « Il fallait trouver la lettre, M ! »
  w:<mot>  « Comme dans, moto ! »      W:<id> « Trouve le mot, maison ! »
  n:/u:    phrases de la narratrice / de Paillette (voix plus aiguë)
"""
import argparse, difflib, hashlib, json, os, re, subprocess, sys, tempfile, unicodedata
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODELS = os.environ.get('LICORNE_MODELS', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models'))
AUDIO = os.path.join(ROOT, 'audio')
MANIFEST = os.path.join(AUDIO, 'manifest.json')

# --- Prononciation de chaque lettre / son (alphabet phonétique) -------------------------------
# voyelles et sons voyelles : on dit le son ; consonnes : le nom de la lettre ; groupes de consonnes : épelés.
LETTER = {
 'a':'ˈa','e':'ˈə','i':'ˈi','o':'ˈo','u':'ˈy','é':'ˈe','è':'ˈɛ',
 'ou':'ˈu','on':'ˈɔ̃','an':'ˈɑ̃','in':'ˈɛ̃','oi':'wˈa','eu':'ˈø','au':'ˈo','en':'ˈɑ̃','ain':'ˈɛ̃','eau':'ˈo','ai':'ˈɛ',
 'm':'ˈɛm','l':'ˈɛl','s':'ˈɛs','r':'ˈɛʁ','f':'ˈɛf','p':'pˈe','t':'tˈe','b':'bˈe','n':'ˈɛn','v':'vˈe','d':'dˈe','g':'ʒˈe',
 'c':'sˈe','k':'kˈa','j':'ʒˈi',
 'h':'ˈaʃ','q':'kˈy','w':'dˈublə vˈe','x':'ˈiks','y':'iɡʁˈɛk','z':'zˈɛd','ç':'sˈe sedˈij',
 'ui':'ɥˈi','oin':'wˈɛ̃','ei':'ˈɛ','er':'ˈe','ez':'ˈe','un':'ˈœ̃',
 'ein':'ˈɛ̃','ien':'jˈɛ̃','eil':'ˈɛj','ail':'ˈaj','ouil':'ˈuj','euil':'ˈœj','tion':'sjˈɔ̃',
 'ch':'sˈe, ˈaʃ','ph':'pˈe, ˈaʃ','qu':'kˈy, ˈy','gn':'ʒˈe, ˈɛn','ill':'ˈi, ˈɛl, ˈɛl',
}
# Spell complex groups as in the existing CH/PH prompts: isolated glides are unreliable in TTS.
LETTER.update({
 'ail':'ˈa, ˈi, ˈɛl', 'eil':'ˈə, ˈi, ˈɛl', 'euil':'ˈə, ˈy, ˈi, ˈɛl',
 'ouil':'ˈo, ˈy, ˈi, ˈɛl', 'oin':'ˈo, ˈi, ˈɛn', 'ien':'ˈi, ˈə, ˈɛn',
 'ui':'ˈy, ˈi', 'tion':'tˈe, ˈi, ˈo, ˈɛn',
})
SPELLED = {'ch', 'ph', 'qu', 'gn', 'ill', 'ail', 'eil', 'euil', 'ouil', 'oin', 'ien', 'ui', 'tion'}
# « Trouve le son, an » est mal rendu par la voix ; « Cherche bien le son, an » est compris.
INTRO_OVERRIDE = {('an', False): 'Cherche bien le son', ('en', False): 'Cherche bien le son'}

def intro(g, fail):
    if (g, fail) in INTRO_OVERRIDE: return INTRO_OVERRIDE[(g, fail)]
    noun = 'les lettres' if g in SPELLED else ('le son' if len(g) > 1 else 'la lettre')
    return ('Il fallait trouver ' if fail else 'Trouve ') + noun

# --- Lecture du projet -------------------------------------------------------------------------
def read_project():
    src = open(os.path.join(ROOT, 'js', 'data', 'sounds.js'), encoding='utf-8').read()
    sounds, words = [], set()
    for g, ph, lst in re.findall(r"S\('([^']+)','([^']+)',(?:'[^']*'|null),\s*'([^']+)'\)", src):
        sounds.append(g)
        for item in lst.split('|'):
            item = item.strip(); words.add(item[:item.rfind(' ')].replace('[', '').replace(']', ''))
    lines = set()
    for d, _, files in os.walk(os.path.join(ROOT, 'js')):
        for f in files:
            if f.endswith('.js'):
                for k, _, t in re.findall(r"\b([NU])\((['\"])(.+?)\2\)", open(os.path.join(d, f), encoding='utf-8').read()):
                    lines.add((k, t))
    return sorted(set(sounds)), sorted(words), sorted(lines)

def wanted_keys():
    sounds, words, lines = read_project()
    keys = [p + g for g in sounds for p in ('L:', 'F:')] + ['w:' + w for w in words] + [k.lower() + ':' + t for k, t in lines]
    missing = [g for g in sounds if g not in LETTER]
    if missing: sys.exit(f'Ajoutez la prononciation de {missing} dans LETTER (tools/voice/build_voice.py).')
    return keys + ['W:' + word_id for word_id in whole_word_prompts()]

_WORD_PROMPTS = None
def whole_word_prompts():
    global _WORD_PROMPTS
    if _WORD_PROMPTS is None:
        words = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {WORDS} from './js/data/words.js';process.stdout.write(JSON.stringify(WORDS));"], cwd=ROOT, text=True))
        _WORD_PROMPTS = {word['id']: word.get('speech', word['text']) for word in words}
    return _WORD_PROMPTS

PREFIX = {'L': 'lettre', 'F': 'erreur', 'w': 'mot', 'W': 'mot-entier', 'n': 'voix', 'u': 'paillette'}
def filename(key):
    p, t = key.split(':', 1)
    s = unicodedata.normalize('NFD', t.lower().replace('œ', 'oe'))
    s = re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in s if unicodedata.category(c) != 'Mn')).strip('-')[:40] or 'x'
    return f"{PREFIX[p]}-{s}-{hashlib.sha1(key.encode()).hexdigest()[:6]}.mp3"

# --- Voix --------------------------------------------------------------------------------------
class Voice:
    def __init__(self):
        from piper import PiperVoice
        from piper.config import SynthesisConfig
        d = os.path.join(MODELS, 'vits-piper-fr_FR-siwis-medium')
        if not os.path.exists(d): sys.exit('Voix introuvable : lancez d’abord  bash tools/voice/download_models.sh')
        self.v = PiperVoice.load(os.path.join(d, 'fr_FR-siwis-medium.onnx'), os.path.join(d, 'fr_FR-siwis-medium.onnx.json'))
        self.Cfg = SynthesisConfig; self.sr = self.v.config.sample_rate

    def phon(self, text):
        out = []
        for sent in self.v.phonemize(text):
            if out: out.append(' ')
            out += sent
        return out

    def job(self, key):
        """phonèmes à dire, vitesse, hauteur de voix (1.2 = Paillette)"""
        p, t = key.split(':', 1)
        if p in ('L', 'F'):
            return self.phon(intro(t, p == 'F')) + [',', ' '] + list(LETTER[t]) + ['!'], 0.85, 1.0
        if p == 'W':
            return self.phon('Trouve le mot') + [',', ' '] + self.phon(whole_word_prompts()[t] + ' !'), 0.85, 1.0
        if p == 'w':
            return self.phon('Comme dans') + [',', ' '] + self.phon(t + ' !'), 0.88, 1.0
        return self.phon(t), 0.95, (1.0 if p == 'n' else 1.2)

    def synth(self, phonemes, speed):
        ids = self.v.phonemes_to_ids(phonemes)
        a = self.v.phoneme_ids_to_audio(ids, self.Cfg(length_scale=1/speed, noise_scale=0.5, noise_w_scale=0.6))
        a = np.asarray(a, np.float32)
        idx = np.where(np.abs(a) > 0.008)[0]            # on retire les blancs, sans couper la fin
        return a[max(0, idx[0] - int(self.sr * .02)): idx[-1] + int(self.sr * .18)] if len(idx) else a

    def save_mp3(self, a, path, pitch):
        import soundfile as sf
        a = a * min(0.14 / (np.sqrt((a ** 2).mean()) + 1e-9), 0.93 / (np.abs(a).max() + 1e-9))   # même volume partout
        a = np.concatenate([np.zeros(int(self.sr * .06), np.float32), a, np.zeros(int(self.sr * .05), np.float32)])
        with tempfile.NamedTemporaryFile(suffix='.wav') as w:
            sf.write(w.name, a, self.sr)
            af = ['-af', f'asetrate={int(self.sr*pitch)},aresample={self.sr},atempo={1/pitch:.4f}'] if pitch != 1.0 else []
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w.name, *af, '-ac', '1', '-ar', '16000', '-b:a', '24k', path], check=True)

# --- Reconnaissance vocale (vérification) -----------------------------------------------------
class Ear:
    def __init__(self):
        import sherpa_onnx
        d = os.path.join(MODELS, 'sherpa-onnx-whisper-small')
        if not os.path.exists(d): sys.exit('Reconnaissance vocale introuvable : lancez  bash tools/voice/download_models.sh  (ou utilisez --no-verify)')
        self.r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=os.path.join(d, 'small-encoder.int8.onnx'),
            decoder=os.path.join(d, 'small-decoder.int8.onnx'), tokens=os.path.join(d, 'small-tokens.txt'),
            language='fr', task='transcribe', num_threads=4)

    def hear(self, a, sr):
        import scipy.signal as ss
        x = ss.resample_poly(a, 16000, sr).astype(np.float32)
        s = self.r.create_stream(); s.accept_waveform(16000, x); self.r.decode_stream(s)
        return s.result.text.strip()

STRIP = set("ˈˌː.,!?;:…«»\"'- ")
def score(voice, target_phonemes, heard):
    """ressemblance PHONÉTIQUE entre ce qu'on voulait dire et ce que la reconnaissance a entendu (homophones acceptés)"""
    a = ''.join(p for p in target_phonemes if p not in STRIP)
    b = ''.join(p for p in voice.phon(heard) if p not in STRIP) if heard.strip() else ''
    return difflib.SequenceMatcher(None, a, b).ratio()

# --- Programme principal -----------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--list', action='store_true', help='montre ce qui manque, sans rien générer')
    ap.add_argument('--redo', default='', help='clés à refaire, séparées par des virgules (ex. "w:moto,L:m")')
    ap.add_argument('--prune', action='store_true', help='supprime les audios qui ne servent plus')
    ap.add_argument('--no-verify', action='store_true', help='pas de reconnaissance vocale (plus rapide, moins sûr)')
    ap.add_argument('--tries', type=int, default=6, help='nombre d’essais maximum par phrase (défaut 6)')
    args = ap.parse_args()

    os.makedirs(AUDIO, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
    keys = wanted_keys()
    redo = {k.strip() for k in args.redo.split(',') if k.strip()}
    todo = [k for k in keys if k in redo or k not in manifest or not os.path.exists(os.path.join(AUDIO, manifest[k]))]
    unused = [k for k in manifest if k not in keys]
    print(f'{len(keys)} phrases dans le jeu, {len(todo)} à générer, {len(unused)} inutilisée(s).')
    if args.list:
        for k in todo: print('  à générer :', k)
        for k in unused: print('  inutilisée :', k)
        return
    if todo:
        voice = Voice(); ear = None if args.no_verify else Ear()
        for n, key in enumerate(todo, 1):
            P, speed, pitch = voice.job(key)
            best = None
            for t in range(1 if ear is None else args.tries):
                a = voice.synth(P, speed * (1 - 0.03 * (t % 3)))
                if ear is None: best = (1.0, '', a); break
                heard = ear.hear(a, voice.sr); sc = score(voice, P, heard)
                if best is None or sc > best[0]: best = (sc, heard, a)
                if sc >= 0.9: break
            sc, heard, a = best
            fn = filename(key); voice.save_mp3(a, os.path.join(AUDIO, fn), pitch); manifest[key] = fn
            flag = '' if ear is None else ('  ✓' if sc >= 0.86 else '  ⚠ à écouter')
            print(f'[{n}/{len(todo)}] {key}{flag}' + (f'   (entendu : « {heard} »)' if ear else ''), flush=True)
            json.dump(manifest, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    if args.prune:
        for k in unused:
            f = os.path.join(AUDIO, manifest.pop(k))
            if os.path.exists(f) and list(manifest.values()).count(os.path.basename(f)) == 0: os.remove(f)
            print('  supprimé :', k)
    json.dump(manifest, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    print('Terminé. Vérifiez ensuite avec :  npm run check')

if __name__ == '__main__':
    main()
