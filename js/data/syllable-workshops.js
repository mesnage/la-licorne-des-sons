const vowels = ['a', 'o', 'i', 'u'];
const vowelSounds = ['a', 'o', 'i', 'y'];

// Use French homophones when an isolated spelling may be read as letter names.
const consonants = [
  ['f', 'f', ['fa', 'faux', 'fie', 'fut']],
  ['t', 't', ['ta', 'tôt', 'ti', 'tu']],
  ['p', 'p', ['pas', 'peau', 'pie', 'pu']],
  ['j', 'ʒ', ['ja', 'Jo', 'J', 'jus']],
  ['m', 'm', ['ma', 'mot', 'mi', 'mue']],
  ['b', 'b', ['bas', 'beau', 'bi', 'bu']],
  ['n', 'n', ['na', 'nos', 'ni', 'nu']],
  ['l', 'l', ['là', 'lot', 'lit', 'lu']],
  ['s', 's', ['sa', 'sot', 'si', 'su']]
];

const robinRecordings = {do:'dos', di:'dis', du:'du', ra:'rat', ri:'riz', cha:'chat', cho:'chaud', vi:'vie', vo:'veau'};
const newSyllables = [
  ['d','d','aoiu'], ['r','ʁ','aoiu'], ['z','z','aoiu'], ['ch','ʃ','aoiu'],
  ['v','v','aoi'], ['g','ɡ','aou']
].flatMap(([letter, ipa, endings]) => [...endings].map(vowel => [
  letter + vowel, ipa + vowelSounds[vowels.indexOf(vowel)], robinRecordings[letter + vowel]
]));
const simple = consonants.flatMap(([letter, consonant, speech]) => vowels.map((vowel, index) => [
  letter + vowel, consonant + vowelSounds[index], speech[index]
])).concat([
  ['ca', 'ka', 'cas'], ['co', 'ko', 'co'], ['cu', 'ky', 'cu'], ['vu', 'vy', 'vu'], ...newSyllables
]);

// Each final letter in this list is silent when the word is spoken on its own.
const silent = [
  ['chat','ʃa'], ['rat','ʁa'], ['drap','dʁa'], ['plat','pla'],
  ['tas','ta'], ['bas','ba'], ['pas','pa'], ['bras','bʁa'],
  ['gras','ɡʁa'], ['lit','li'], ['nid','ni'], ['riz','ʁi'],
  ['prix','pʁi'], ['bord','bɔʁ'], ['petit','pəti'], ['tapis','tapi'],
  ['souris','suʁi'], ['radis','ʁadi'], ['gris','ɡʁi'], ['gros','ɡʁo'],
  ['dos','do'], ['pot','po'], ['mot','mo'], ['bout','bu'],
  ['lot','lo'], ['trop','tʁo'], ['chaud','ʃo'], ['faux','fo'],
  ['haut','o'], ['nez','ne'], ['pied','pje'], ['lait','lɛ'],
  ['frais','fʁɛ'], ['paix','pɛ'], ['dent','dɑ̃'], ['vent','vɑ̃'],
  ['lent','lɑ̃'], ['sang','sɑ̃'], ['blanc','blɑ̃'], ['rond','ʁɔ̃']
];

export const SYLLABLE_ACTIVITIES = [
  { id:'blend-simple', title:'Syllabes faciles', detail:`${simple.length} syllabes · fa, cha, du…`, icon:'letters', color:'mint' },
  { id:'blend-silent', title:'Lettres muettes', detail:'40 mots · chat, lit, pied…', icon:'book', color:'lavender' }
];

export const syllableActivity = id => SYLLABLE_ACTIVITIES.find(activity => activity.id === id);

export const syllableItems = Object.fromEntries(SYLLABLE_ACTIVITIES.map(({ id }, index) => [
  id, [simple, silent][index].map(([text, ipa, speech = text]) => ({
    id: text, text, ipa, speech, audioKey: 'SY:' + text,
    silent: index === 1 ? text.at(-1) : null
  }))
]));
