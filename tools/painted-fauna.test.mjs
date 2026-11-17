import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FAUNA,faunaPose} from '../js/meadow/fauna-data.js';
import {PAINTED_WORLDS} from '../js/meadow/themes.js';
test('every playable world has exactly five distinct species',()=>{
  for(const world of PAINTED_WORLDS){const species=FAUNA[world.habitat];assert.equal(species.length,5,world.habitat);assert.equal(new Set(species.map(s=>s.id)).size,5);}
  assert.deepEqual(FAUNA.prehistoric.map(s=>s.id),['brachiosaurus','stegosaurus','triceratops','parasaurolophus','tyrannosaurus']);
  assert.ok(FAUNA.jungle.some(s=>s.id==='asian-elephant'));
  assert.ok(FAUNA.ice.some(s=>s.id==='polar-bear'));assert.ok(FAUNA.ice.some(s=>s.id==='emperor-penguin'));
});
test('each species has time-varying articulated motion but reduced motion is stable',()=>{
  for(const species of Object.values(FAUNA).flat()){
    assert.notDeepEqual(faunaPose(species,1),faunaPose(species,2),species.id);
    assert.deepEqual(faunaPose(species,1,2,true),faunaPose(species,100,2,true),species.id);
    for(const t of [0,1,10,100,1000])for(const value of Object.values(faunaPose(species,t)))if(typeof value==='number')assert.ok(Number.isFinite(value));
  }
});
