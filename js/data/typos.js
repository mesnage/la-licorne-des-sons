import { SENTENCES } from './sentences.js';

export const TYPO_ACTIVITY={id:'find-typo',title:'Trouve la faute !',detail:'Un mot mal écrit · 3 mots',icon:'book',color:'rose'};
// Curated nonwords: exactly one misspelling replaces one word, never its grammar.
const misspellings={
  'chat-dort':['lle','chta','drot'],
  'lapin-saute':['lle','lapni','suate'],
  'tortue-avance':['laa','torute','avnace'],
  'lune-brille':['laa','luen','brile'],
  'soleil-brille':['lle','soleli','brile'],
  'chien-joue':['lle','chienn','joeu'],
  'vache-mange':['laa','vahce','mnage'],
  'bebe-rit':['lle','bééb','rti'],
  'oiseau-chante':['uun','oiseua','chnate'],
  'renard-court':['lle','renrad','cuort'],
  'papillon-vole':['lle','papilon','vloe'],
  'poisson-nage':['lle','poissno','ngae'],
  'souris-danse':['laa','souirs','dnase'],
  'poule-picore':['laa','puole','picroe'],
  'canard-plonge':['lle','canrad','plogne'],
  'cheval-galope':['lle','cheavl','galpoe'],
  'fille-dessine':['laa','fillee','desisne'],
  'garcon-chante':['lle','graçon','chnate'],
  'maman-lit':['mamna','ilt','bein'],
  'papa-cuisine':['ppaa','cuisnie','bein'],
  'licorne-danse':['laa','liconre','dnase'],
  'pluie-tombe':['laa','pluei','tobme'],
  'fleur-pousse':['unee','fleurr','poussr'],
  'grenouille-saute':['laa','grenouile','suate']
};
export const TYPO_SENTENCES=Object.entries(misspellings).map(([id,typos])=>({sentence:SENTENCES.find(sentence=>sentence.id===id),typos}));
