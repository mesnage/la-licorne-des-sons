#!/usr/bin/env python3
"""Build or reuse Robin recordings for the two syllable workshops."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import subprocess

from build_curriculum_robin import AUDIO, ROOT, extract_initial_word, load_key, read_json
from refresh_robin_words import cached_request, digest, encode, neutral


CONTEXTS = {
    'tôt': 'Tôt, comme dans partir tôt le matin.',
    'tu': 'Tu, comme dans tu joues avec le chat.',
    'ta': 'Ta, comme dans ta maison.',
    'ma': 'Ma, comme dans ma maison.',
    'mi': 'Mi, la note de musique.',
    'nos': 'Nos, comme dans nos livres.',
    'ni': 'Ni, comme dans ni rouge ni bleu.',
    'là': 'Là, comme dans pose ton livre là.',
    'lit': 'Lit, comme le lit où tu dors.',
    'pied': 'Pied, comme le pied de la chaise.',
    'paix': 'Paix, comme vivre en paix.',
    'nez': 'Nez, comme le nez au milieu du visage.',
    'nid': 'Nid, comme le nid d’un oiseau.',
    'riz': 'Riz, comme un bol de riz.',
    'prix': 'Prix, comme le prix du livre.',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, required=True)
    parser.add_argument('--env-file', type=Path, default=ROOT / '.env.local')
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    source = """
import { syllableItems } from './js/data/syllable-workshops.js';
console.log(JSON.stringify(Object.values(syllableItems).flat()));
"""
    items = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', source], cwd=ROOT))
    manifest = {key: file for key, file in read_json('manifest.json').items() if not key.startswith('SY:')}
    known = {
        track['spoken'].casefold(): track
        for chapter in range(1, 8)
        for track in read_json(f'curriculum-c{chapter}-robin.json').values()
        if 'spoken' in track
    }
    api_key = load_key(args.env_file)

    def build(item):
        line = neutral(item['speech'])
        context = CONTEXTS.get(item['speech'])
        existing = known.get(line.casefold())
        if existing and item['speech'] != 'J' and (not context or existing.get('synthesisText') == context):
            file = existing['file']
        else:
            script = context or line
            file = 'syllabes-robin/' + digest(script) + '.mp3'
            if not (AUDIO / file).exists():
                raw = cached_request(api_key, script, args.cache, bool(context))
                if context:
                    raw = extract_initial_word(raw, item['speech'])
                encode(raw, AUDIO / file)
        return item['audioKey'], file

    # The simple and advanced lists share a few sounds and use the same cache.
    entries = list({(item['speech'].casefold(), CONTEXTS.get(item['speech'])): item for item in reversed(items)}.values())
    with ThreadPoolExecutor(max_workers=3) as pool:
        recordings = dict(pool.map(build, entries))
    by_speech = {
        (item['speech'].casefold(), CONTEXTS.get(item['speech'])): recordings[item['audioKey']]
        for item in entries
    }
    manifest.update({
        item['audioKey']: by_speech[(item['speech'].casefold(), CONTEXTS.get(item['speech']))]
        for item in items
    })
    target = AUDIO / 'manifest.json'
    temporary = target.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
    temporary.replace(target)
    print(f'{len(items)} pistes disponibles pour les deux ateliers.')


if __name__ == '__main__':
    main()
