// Editable phoneme curriculum. These IPA sounds are distinct from letter names.
// A phoneme may have several spellings. g is the canonical choice shown in this activity.
// Each example has a recorded full prompt; add/rebuild its audio when editing this data.
export const PHONEME_LEVELS = [
  {id:1,title:'Mes premiers phonèmes',detail:'Voyelles et sons que l’on peut prolonger'},
  {id:2,title:'Les sons qui claquent',detail:'p, b, t, d… avec les premiers sons'},
  {id:3,title:'Des sons à explorer',detail:'Voyelles proches, sons du nez et gn'}
];
export const PHONEMES = [
  {
    "id": "m",
    "ipa": "m",
    "g": "m",
    "level": 1,
    "examples": [
      "moto",
      "maison"
    ],
    "audio": [
      "P:m:0",
      "P:m:1"
    ]
  },
  {
    "id": "a",
    "ipa": "a",
    "g": "a",
    "level": 1,
    "examples": [
      "ananas",
      "chat"
    ],
    "audio": [
      "P:a:0",
      "P:a:1"
    ]
  },
  {
    "id": "l",
    "ipa": "l",
    "g": "l",
    "level": 1,
    "examples": [
      "lune",
      "lapin"
    ],
    "audio": [
      "P:l:0",
      "P:l:1"
    ]
  },
  {
    "id": "i",
    "ipa": "i",
    "g": "i",
    "level": 1,
    "examples": [
      "lit",
      "souris"
    ],
    "audio": [
      "P:i:0",
      "P:i:1"
    ]
  },
  {
    "id": "s",
    "ipa": "s",
    "g": "s",
    "level": 1,
    "examples": [
      "soleil",
      "sac"
    ],
    "audio": [
      "P:s:0",
      "P:s:1"
    ]
  },
  {
    "id": "f",
    "ipa": "f",
    "g": "f",
    "level": 1,
    "examples": [
      "fourmi",
      "fleur"
    ],
    "audio": [
      "P:f:0",
      "P:f:1"
    ]
  },
  {
    "id": "ou",
    "ipa": "u",
    "g": "ou",
    "level": 1,
    "examples": [
      "mouton",
      "roue"
    ],
    "audio": [
      "P:ou:0",
      "P:ou:1"
    ]
  },
  {
    "id": "v",
    "ipa": "v",
    "g": "v",
    "level": 1,
    "examples": [
      "vache",
      "vélo"
    ],
    "audio": [
      "P:v:0",
      "P:v:1"
    ]
  },
  {
    "id": "u",
    "ipa": "y",
    "g": "u",
    "level": 1,
    "examples": [
      "lune",
      "plume"
    ],
    "audio": [
      "P:u:0",
      "P:u:1"
    ]
  },
  {
    "id": "n",
    "ipa": "n",
    "g": "n",
    "level": 1,
    "examples": [
      "nuage",
      "nez"
    ],
    "audio": [
      "P:n:0",
      "P:n:1"
    ]
  },
  {
    "id": "r",
    "ipa": "ʁ",
    "g": "r",
    "level": 1,
    "examples": [
      "renard",
      "roue"
    ],
    "audio": [
      "P:r:0",
      "P:r:1"
    ]
  },
  {
    "id": "e",
    "ipa": "e",
    "g": "é",
    "level": 1,
    "examples": [
      "bébé",
      "vélo"
    ],
    "audio": [
      "P:e:0",
      "P:e:1"
    ]
  },
  {
    "id": "p",
    "ipa": "p",
    "g": "p",
    "level": 2,
    "examples": [
      "pomme",
      "poule"
    ],
    "audio": [
      "P:p:0",
      "P:p:1"
    ]
  },
  {
    "id": "b",
    "ipa": "b",
    "g": "b",
    "level": 2,
    "examples": [
      "bébé",
      "ballon"
    ],
    "audio": [
      "P:b:0",
      "P:b:1"
    ]
  },
  {
    "id": "t",
    "ipa": "t",
    "g": "t",
    "level": 2,
    "examples": [
      "tomate",
      "tortue"
    ],
    "audio": [
      "P:t:0",
      "P:t:1"
    ]
  },
  {
    "id": "d",
    "ipa": "d",
    "g": "d",
    "level": 2,
    "examples": [
      "dauphin",
      "domino"
    ],
    "audio": [
      "P:d:0",
      "P:d:1"
    ]
  },
  {
    "id": "k",
    "ipa": "k",
    "g": "c",
    "level": 2,
    "examples": [
      "canard",
      "koala"
    ],
    "audio": [
      "P:k:0",
      "P:k:1"
    ]
  },
  {
    "id": "g",
    "ipa": "ɡ",
    "g": "g",
    "level": 2,
    "examples": [
      "gâteau",
      "guitare"
    ],
    "audio": [
      "P:g:0",
      "P:g:1"
    ]
  },
  {
    "id": "z",
    "ipa": "z",
    "g": "z",
    "level": 2,
    "examples": [
      "zèbre",
      "zéro"
    ],
    "audio": [
      "P:z:0",
      "P:z:1"
    ]
  },
  {
    "id": "ch",
    "ipa": "ʃ",
    "g": "ch",
    "level": 2,
    "examples": [
      "chat",
      "chien"
    ],
    "audio": [
      "P:ch:0",
      "P:ch:1"
    ]
  },
  {
    "id": "j",
    "ipa": "ʒ",
    "g": "j",
    "level": 2,
    "examples": [
      "journal",
      "jardin"
    ],
    "audio": [
      "P:j:0",
      "P:j:1"
    ]
  },
  {
    "id": "o",
    "ipa": "o",
    "g": "o",
    "level": 3,
    "examples": [
      "vélo",
      "robot"
    ],
    "audio": [
      "P:o:0",
      "P:o:1"
    ]
  },
  {
    "id": "o-open",
    "ipa": "ɔ",
    "g": "o",
    "level": 3,
    "examples": [
      "pomme",
      "carotte"
    ],
    "audio": [
      "P:o-open:0",
      "P:o-open:1"
    ]
  },
  {
    "id": "e-open",
    "ipa": "ɛ",
    "g": "è",
    "level": 3,
    "examples": [
      "chèvre",
      "zèbre"
    ],
    "audio": [
      "P:e-open:0",
      "P:e-open:1"
    ]
  },
  {
    "id": "e-soft",
    "ipa": "ə",
    "g": "e",
    "level": 3,
    "examples": [
      "cheval",
      "renard"
    ],
    "audio": [
      "P:e-soft:0",
      "P:e-soft:1"
    ]
  },
  {
    "id": "eu",
    "ipa": "ø",
    "g": "eu",
    "level": 3,
    "examples": [
      "feu",
      "bleu"
    ],
    "audio": [
      "P:eu:0",
      "P:eu:1"
    ]
  },
  {
    "id": "eu-open",
    "ipa": "œ",
    "g": "eu",
    "level": 3,
    "examples": [
      "fleur",
      "cœur"
    ],
    "audio": [
      "P:eu-open:0",
      "P:eu-open:1"
    ]
  },
  {
    "id": "an",
    "ipa": "ɑ̃",
    "g": "an",
    "level": 3,
    "examples": [
      "maman",
      "enfant"
    ],
    "audio": [
      "P:an:0",
      "P:an:1"
    ]
  },
  {
    "id": "on",
    "ipa": "ɔ̃",
    "g": "on",
    "level": 3,
    "examples": [
      "ballon",
      "mouton"
    ],
    "audio": [
      "P:on:0",
      "P:on:1"
    ]
  },
  {
    "id": "in",
    "ipa": "ɛ̃",
    "g": "in",
    "level": 3,
    "examples": [
      "pain",
      "lapin"
    ],
    "audio": [
      "P:in:0",
      "P:in:1"
    ]
  },
  {
    "id": "gn",
    "ipa": "ɲ",
    "g": "gn",
    "level": 3,
    "examples": [
      "montagne",
      "champignon"
    ],
    "audio": [
      "P:gn:0",
      "P:gn:1"
    ]
  }
];
