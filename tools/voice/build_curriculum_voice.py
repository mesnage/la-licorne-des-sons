#!/usr/bin/env python3
"""Build the selected chapter's local draft clips with the existing Piper model."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import unicodedata

from build_voice import Voice

ROOT = Path(__file__).resolve().parents[2]
PROGRAM = """
import {readFileSync} from 'node:fs';
import {createCurriculum} from './js/learning/curriculum.js';
import {curriculumAudioSources} from './js/learning/curriculum-questions.js';
import {simpleExercise, simpleInstructionKey} from './js/data/curriculum-simple.js';
const curriculum = createCurriculum(JSON.parse(readFileSync('js/data/curriculum.v2.json')));
const selection = process.argv[1];
const sources = selection === 'simple'
    ? Object.fromEntries(curriculum.chapters.flatMap(chapter => chapter.units).map(unit => {
        const text = simpleExercise(unit).instruction;
        return [simpleInstructionKey(text), { text }];
    }))
    : curriculumAudioSources(curriculum.getChapter(selection));
console.log(JSON.stringify(sources));
"""

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('chapter', nargs='?', default='C1', choices=['C1', 'C2', 'C3', 'C4', 'simple'])
    chapter = parser.parse_args().chapter
    sources = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e', PROGRAM, chapter], cwd=ROOT, text=True))
    voice = Voice()
    catalogue = f'curriculum-{chapter.lower()}'
    target = ROOT / 'audio' / catalogue
    target.mkdir(exist_ok=True)
    manifest = {}
    for key, source in sources.items():
        ascii_name = unicodedata.normalize('NFD', key).encode('ascii', 'ignore').decode()
        name = ''.join(c if c.isalnum() else '-' for c in ascii_name)[:70]
        digest = hashlib.sha256(json.dumps(source, sort_keys=True).encode()).hexdigest()[:8]
        file = target / f'{name}-{digest}.mp3'
        phonemes = list(source['ipa']) if 'ipa' in source else voice.phon(source['text'] + '.')
        if not file.exists():
            samples = voice.synth(phonemes, 0.87)
            if len(samples) < voice.sr * 0.12 or max(abs(samples)) < 0.015:
                raise ValueError(f'Piste silencieuse ou trop courte : {key}')
            voice.save_mp3(samples, str(file), 1.0)
        manifest[key] = {
            'file': str(file.relative_to(ROOT / 'audio')), 'speaker': 'piper-fr_FR-siwis-medium',
            'text': source['text'], 'phonemes': ''.join(phonemes), 'review': 'pending_human_review',
            'sha256': hashlib.sha256(file.read_bytes()).hexdigest()
        }
    (ROOT / 'audio' / (catalogue + '.json')).write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    print(f'{len(manifest)} pistes Piper locales.')

if __name__ == '__main__':
    main()
