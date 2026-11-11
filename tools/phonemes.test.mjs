import test from 'node:test';
import { URL } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PHONEMES } from '../js/data/phonemes.js';

test('36 approved clips are shipped unchanged and mapped to the recorded audio engine',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../audio/manifest.json',import.meta.url)));
 const provenance=JSON.parse(readFileSync(new URL('../audio/phonemes-robin/provenance.json',import.meta.url)));
 assert.equal(PHONEMES.length,36);assert.equal(new Set(PHONEMES.map(p=>p.id)).size,36);
 for(const p of PHONEMES){
  const clip=readFileSync(new URL('../audio/'+manifest[p.audioKey],import.meta.url));
  assert.equal(createHash('sha256').update(clip).digest('hex'),provenance.files.find(f=>f.id===p.id).sha256);
 }
});
