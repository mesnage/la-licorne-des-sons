import test from 'node:test';
import { URL } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PHONEMES } from '../js/data/phonemes.js';
import { compatible, phonemeChoices, CONFUSABLE_GROUPS } from '../js/phonemes/model.js';
import { createAdventure } from '../js/prototype/model.js';

test('36 approved clips are shipped unchanged and mapped to the recorded audio engine',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../audio/manifest.json',import.meta.url)));
 const provenance=JSON.parse(readFileSync(new URL('../audio/phonemes-robin/provenance.json',import.meta.url)));
 assert.equal(PHONEMES.length,36);assert.equal(new Set(PHONEMES.map(p=>p.id)).size,36);
 for(const p of PHONEMES){
  const clip=readFileSync(new URL('../audio/'+manifest[p.audioKey],import.meta.url));
  assert.equal(createHash('sha256').update(clip).digest('hex'),provenance.files.find(f=>f.id===p.id).sha256);
 }
});
test('all 36 targets have three unambiguous choices, including between distractors',()=>{
 for(const target of PHONEMES)for(let i=0;i<100;i++){
  const choices=phonemeChoices(target);assert.equal(choices.length,3);assert.ok(choices.includes(target));
  for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)assert.ok(compatible(choices[a],choices[b]));
 }
 for(const group of CONFUSABLE_GROUPS)for(const a of group)for(const b of group)
  assert.equal(compatible(PHONEMES.find(p=>p.id===a),PHONEMES.find(p=>p.id===b)),false);
});
test('listening adventure uses ten distinct targets and existing scoring/checkpoints',()=>{
 const session=createAdventure('listen-phonemes');assert.equal(session.questions.length,10);
 assert.equal(new Set(session.questions.map(q=>q.target.id)).size,10);
 const wrong=session.current.choices.find(c=>c.id!==session.current.target.id);
 assert.equal(session.answer(wrong.id).correct,false);session.recover();
 while(session.phase!=='finished'){assert.equal(session.answer(session.current.target.id).correct,true);session.next();}
 assert.equal(session.score,9);
});
