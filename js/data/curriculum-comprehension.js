// Each scene specifies a text, the matching illustration and a plausible alternative.
// The same scene can be revisited with different tasks. Extra scenes support transfer.
export const scenes = {
  'C4-U01': [
    ['Le lapin saute.', '🐇⬆️','🐇💤'],
    ['La lune brille.', '🌕✨','☀️✨'],
    ['Un loup file.', '🐺💨','🐇💨'],
    ['Une vache rumine.', '🐄🌿','🐄💤'],
    ['Le panda tourne.', '🐼🔄','🐼💤']
  ],
  'C4-U02': [
    ['Le chat dort.', '🐈💤','🐈💨'],
    ['Le rat file.', '🐀💨','🐀💤'],
    ['Le renard bondit.', '🦊⬆️','🦊💤'],
    ['Un grand loup arrive.', '🐺⬆️','🐺⬇️'],
    ['Le canard nage.', '🦆💧','🦆💤']
  ],
  'C4-U03': [
    ['Le chat dort.', '🐈💤','🐈💨'],
    ['Le rat file.', '🐀💨','🐇💨'],
    ['Le panda mange.', '🐼🌿','🐼💤'],
    ['La vache broute.', '🐄🌿','🐄💤'],
    ['Le lapin saute.', '🐇⬆️','🐇💤']
  ],
  'C4-U04': [
    ['Le chat lèche le bol.', '🐈👅🥣','🐈💤🥣'],
    ['La vache longe la mare.', '🐄➡️💧','🐄➡️🌳'],
    ['Le lapin passe la porte.', '🐇🚪','🐇🌳'],
    ['Un loup file la nuit.', '🐺🌙','🐺☀️'],
    ['Le panda mange du bambou.', '🐼🎋','🐼🍎']
  ],
  'C4-U05': [
    ['Un lapin saute.', '🐇','🐇🐇'],
    ['Des pandas dorment.', '🐼🐼💤','🐼💤'],
    ['Un cheval trotte.', '🐎','🐎🐎'],
    ['Deux chats dorment.', '🐈🐈💤','🐈💤'],
    ['Des hiboux volent.', '🦉🦉','🦉']
  ],
  'C4-U06': [
    ['La lionne chasse.', '🦁👩🐾','🦁👨🐾'],
    ['La chatte dort.', '🐈👩💤','🐈👨💤'],
    ['Une ourse nage.', '🐻👩💧','🐻👨💧'],
    ['La lapine saute.', '🐇👩⬆️','🐇👨⬆️'],
    ['La louve file.', '🐺👩💨','🐺👨💨']
  ],
  'C4-U07': [
    ['Le chat voit la vache. Elle mange.', '🐄🌿','🐈🌿','🐄','🐈'],
    ['La vache voit le lapin. Il saute.', '🐇⬆️','🐄⬆️','🐇','🐄'],
    ['Le loup regarde la poule. Elle picore.', '🐔🌾','🐺🌾','🐔','🐺'],
    ['La poule regarde le renard. Il file.', '🦊💨','🐔💨','🦊','🐔'],
    ['La vache regarde le chat. Il dort.', '🐈💤','🐄💤','🐈','🐄']
  ],
  'C4-U08': [
    ['Le chat ne dort pas.', '🐈👀','🐈💤'],
    ['Le lapin saute.', '🐇⬆️','🐇💤'],
    ['La vache ne broute pas.', '🐄👀','🐄🌿'],
    ['Le panda mange ?', '🐼🎋❓','🐼🎋❗'],
    ['Le loup ne file pas.', '🐺🛑','🐺💨']
  ],
  'C4-U09': [
    ['La poire est sur la table.', '🍐↥🪑','🍐↧🪑'],
    ['Le chat dort sous le lit.', '🐈↧🛏️','🐈↥🛏️'],
    ['La vache est devant la porte.', '🐄➡️🚪','🚪⬅️🐄'],
    ['Le lapin est derrière le mur.', '🧱🐇','🐇🧱'],
    ['Le bol est sur la table.', '🥣↥🪑','🥣↧🪑']
  ],
  'C4-U10': [
    ['Le chat mange puis dort.', '🍽️➡️💤','💤➡️🍽️'],
    ['Le lapin boit avant de manger.', '💧➡️🍽️','🍽️➡️💧'],
    ['La poule picore après la pluie.', '🌧️➡️🌾','🌾➡️🌧️'],
    ['Le panda se cache parce que la pluie tombe.', '🌧️','☀️'],
    ['Le chat boit parce qu’il a soif.', '💧','💤']
  ],
  'C4-U11': [
    ['Un lapin a soif. Il saute vers la mare et boit.', '🐇','🐺','💧','🌳','🥤','💤'],
    ['La vache voit la pluie. Elle rentre dans la grange.', '🐄','🐈','🏠','🌳','🌧️','☀️'],
    ['Le chat a faim. Il va dans la cuisine et mange.', '🐈','🦊','🍽️','🌊','🍴','💤'],
    ['La poule a froid. Elle part vers le poulailler.', '🐔','🦆','🏠','🌊','🥶','🥵'],
    ['Le canard est fatigué. Il quitte la mare et dort.', '🦆','🐺','💧','🏜️','💤','🍽️']
  ],
  'C4-U12': [
    ['Le chat regarde la poule. Elle picore puis dort.', '🐔🌾','🐈🌾','🐔','🐈','🌾➡️💤','💤➡️🌾'],
    ['La vache regarde le lapin. Il saute puis mange.', '🐇⬆️','🐄⬆️','🐇','🐄','⬆️➡️🍽️','🍽️➡️⬆️'],
    ['Le loup regarde la poule. Elle marche puis picore.', '🐔🐾','🐺🐾','🐔','🐺','🐾➡️🌾','🌾➡️🐾'],
    ['Le panda regarde la vache. Elle broute puis dort.', '🐄🌿','🐼🌿','🐄','🐼','🌿➡️💤','💤➡️🌿'],
    ['La poule regarde le chat. Il boit puis dort.', '🐈💧','🐔💧','🐈','🐔','💧➡️💤','💤➡️💧']
  ]
};

export const transferScenes = {
  'C4-U03': [
    ['Le loup file.', '🐺💨','🐺💤'],
    ['La lune brille.', '🌕✨','☀️✨'],
    ['La poule picore.', '🐔🌾','🐔💤'],
    ['Le canard nage.', '🦆💧','🦆💤'],
    ['La vache rumine.', '🐄🌿','🐈🌿']
  ],
  'C4-U04': [
    ['Le lapin grignote la salade.', '🐇🥗','🐇💧'],
    ['Le rat passe par là.', '🐀➡️','🐀💤'],
    ['La poule picore du blé.', '🐔🌾','🐔🍎'],
    ['Le canard nage dans la mare.', '🦆💧','🦆🌳'],
    ['Un chat dort sur le lit.', '🐈💤🛏️','🐈👀🛏️']
  ],
  'C4-U08': [
    ['La poule ne picore pas.', '🐔🛑','🐔🌾'],
    ['Le canard ne nage pas.', '🦆🛑','🦆💧'],
    ['Le loup dort.', '🐺💤','🐺💨'],
    ['Est-ce que le panda mange ?', '🐼🎋❓','🐼🎋❗'],
    ['La vache ne dort pas.', '🐄👀','🐄💤']
  ],
  'C4-U09': [
    ['La poule est sous la table.', '🐔↧🪑','🐔↥🪑'],
    ['Le panda est devant le mur.', '🐼🧱','🧱🐼'],
    ['Le chat est derrière la porte.', '🚪🐈','🐈🚪'],
    ['Le livre est sur le lit.', '📖↥🛏️','📖↧🛏️'],
    ['Le canard est sous le pont.', '🦆↧🌉','🦆↥🌉']
  ],
  'C4-U10': [
    ['Le rat a soif, alors il boit.', '💧','🍽️'],
    ['La poule a faim, alors elle picore.', '🍽️','💤'],
    ['Le chat a sommeil, alors il se couche.', '💤','💧'],
    ['La vache a chaud, alors elle va près de la mare.', '🥵','🥶'],
    ['Le loup a froid, alors il rentre dans son abri.', '🥶','🥵']
  ],
  'C4-U12': [
    ['Le lapin voit la salade. Il mange puis boit.', '🐇🥗','🐈🥗','🐇','🐈','🥗➡️💧','💧➡️🥗'],
    ['Le canard quitte la mare. Il marche puis dort.', '🦆🐾','🐔🐾','🦆','🐔','🐾➡️💤','💤➡️🐾'],
    ['La poule voit du blé. Elle picore puis boit.', '🐔🌾','🦆🌾','🐔','🦆','🌾➡️💧','💧➡️🌾'],
    ['Le chat joue avec la balle. Il saute puis la pousse.', '🐈⚽','🐇⚽','🐈','🐇','⬆️➡️⚽','⚽➡️⬆️'],
    ['La vache voit la mare. Elle boit puis broute.', '🐄💧','🐺💧','🐄','🐺','💧➡️🌿','🌿➡️💧']
  ]
};

export const languagePairs = {
  'C4-U01': [
    ['le','la'],['la','un'],['un','une'],['une','des'],['les','le']
  ],
  'C4-U02': [
    ['chat','chaton','raton','t'],['rat','raton','chaton','t'],['renard','renarde','grande','d'],
    ['grand','grande','renarde','d'],['canard','canarde','raton','d']
  ],
  'C4-U05': [
    ['lapin','lapins','s'],['pandas','panda','s'],['cheval','chevaux','x'],['chats','chat','s'],['hiboux','hibou','x']
  ],
  'C4-U06': [
    ['lion','lionne','lion'],['chat','chatte','chat'],['ours','ourse','ours'],
    ['lapin','lapine','lapin'],['loup','louve','loup']
  ],
  'C4-U07': [['Elle','Il'],['Il','Elle'],['Elle','Il'],['Il','Elle'],['Il','Elle']],
  'C4-U08': [['ne … pas','puis'],['affirmation','question'],['ne … pas','et'],['question','affirmation'],['ne … pas','ou']],
  'C4-U10': [['puis','avant'],['avant','après'],['après','avant'],['parce que','avant'],['parce qu’','puis']]
};
