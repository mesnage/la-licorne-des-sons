// Oral-only corpus. These are annotations for the pilot, pending external review.
export const pilotUnitId = 'C1-U01';
export const oralWords = {
  chat: ['ʃa'],
  moto: ['mɔ', 'to'],
  chocolat: ['ʃɔ', 'kɔ', 'la'],
  harmonica: ['aʁ', 'mɔ', 'ni', 'ka'],
  lapin: ['la', 'pɛ̃'],
  bol: ['bɔl'],
  tortue: ['tɔʁ', 'ty'],
  abricot: ['a', 'bʁi', 'ko'],
  hippopotame: ['i', 'pɔ', 'pɔ', 'tam'],
  parapluie: ['pa', 'ʁa', 'plɥi'],
  cabane: ['ka', 'ban'],
  carotte: ['ka', 'ʁɔt'],
  chapeau: ['ʃa', 'po'],
  chateau: ['ʃa', 'to'],
  bateau: ['ba', 'to'],
  banane: ['ba', 'nan'],
  mouton: ['mu', 'tɔ̃'],
  moulin: ['mu', 'lɛ̃'],
  copain: ['kɔ', 'pɛ̃'],
  cochon: ['kɔ', 'ʃɔ̃'],
  panda: ['pɑ̃', 'da'],
  panier: ['pa', 'nje'],
  salade: ['sa', 'lad'],
  valise: ['va', 'liz'],
  tomate: ['tɔ', 'mat'],
  loup: ['lu'],
  maison: ['mɛ', 'zɔ̃'],
  escargot: ['ɛs', 'kaʁ', 'ɡo'],
  kangourou: ['kɑ̃', 'ɡu', 'ʁu'],
  sac: ['sak']
};

// Each row names the target and, for matching, one correct option and one distractor.
export const oralBlocks = [
  [['chat'], ['moto'], ['chocolat'], ['harmonica'], ['lapin']],
  [['bol'], ['tortue'], ['abricot'], ['hippopotame'], ['parapluie']],
  [
    ['cabane', 'carotte', 'panda'],
    ['chapeau', 'chateau', 'panier'],
    ['bateau', 'banane', 'salade'],
    ['mouton', 'moulin', 'valise'],
    ['copain', 'cochon', 'tomate']
  ],
  [['loup'], ['maison'], ['escargot'], ['kangourou'], ['sac']]
];
