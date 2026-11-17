import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sharedChoiceSize} from '../js/meadow/choice-fit.js';
test('one shared font fits the longest option and the narrowest stone',()=>{
  const metrics=[{width:90,units:2},{width:80,units:4.7},{width:110,units:3}];
  const size=sharedChoiceSize(metrics,48);
  for(const {width,units} of metrics)assert.ok(size*units<=width);
  assert.equal(size,17);
  assert.equal(sharedChoiceSize(metrics.map(m=>({...m,width:m.width*2})),48),34);
});
test('short labels keep the maximum and empty labels remain finite',()=>{
  assert.equal(sharedChoiceSize([{width:100,units:1},{width:90,units:0}],32),32);
});
