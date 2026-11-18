import { URL } from 'node:url';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seededRandom,shuffle} from '../js/random.js';
import {createCurriculum} from '../js/learning/curriculum.js';
import {createAdventure} from '../js/prototype/model.js';
import {createSimpleQuestions} from '../js/learning/curriculum-simple.js';
const catalogue=createCurriculum(JSON.parse(readFileSync(new URL('../js/data/curriculum.v2.json',import.meta.url))));
test('seeded shuffles are reproducible, do not mutate, and reach all answer positions',()=>{
 const input=['a','b','c'];const counts=[0,0,0];
 for(let seed=0;seed<600;seed++){const a=shuffle(input,seededRandom(seed));assert.deepEqual(a,shuffle(input,seededRandom(seed)));counts[a.indexOf('a')]++;}
 assert.deepEqual(input,['a','b','c']);assert.ok(counts.every(n=>n>100&&n<300));
});
test('alphabet questions vary between sessions and avoid adjacent repeated letters',()=>{
 const starts=new Set();const slots=[0,0,0];
 for(let i=0;i<80;i++){const {questions}=createAdventure('alphabet');starts.add(questions[0].target.g);
 for(const [index,q] of questions.entries()){if(index)assert.notEqual(q.target.g,questions[index-1].target.g);slots[q.choices.indexOf(q.target)]++;}}
 assert.ok(starts.size>10);assert.ok(slots.every(n=>n>600&&n<1000));
});
test('curriculum keeps seeded resumability but does not alternate answer positions mechanically',()=>{
 const chapter=catalogue.chapters.find(c=>c.id==='C1'),unit=chapter.units[1];let repeatedNeighbors=0;const positions=new Set(),orders=new Set();
 for(let seed=0;seed<20;seed++){
 const qs=createSimpleQuestions(chapter,unit,null,seed);assert.deepEqual(qs,createSimpleQuestions(chapter,unit,null,seed));
 orders.add(qs.map(q=>q.context).join('|'));qs.forEach((q,i)=>{positions.add(q.answer);if(i&&q.answer===qs[i-1].answer)repeatedNeighbors++;});}
 assert.ok(orders.size>5);assert.equal(positions.size,2);assert.ok(repeatedNeighbors>30);
});

test('older saved sessions retain their original question schedule',()=>{
 const chapter=catalogue.getChapter('C1'),unit=chapter.units[1];
 const legacy=createSimpleQuestions(chapter,unit,null,27,0),current=createSimpleQuestions(chapter,unit,null,27,1);
 assert.deepEqual(legacy,createSimpleQuestions(chapter,unit,null,27,0));
 assert.notDeepEqual(legacy,current);
});
