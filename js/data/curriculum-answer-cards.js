// Short, literal answers for the active comprehension questions, in corpus order.
// Each pair puts the correct card first. Optional third strings specify the question.
export const answerCards = {
  'C4-U01': [
    ['Le lapin saute','Le lapin dort'], ['La lune','Le soleil'], ['Un loup et une vache','Deux loups'],
    ['Les pandas mangent','Les pandas dorment'], ['Des poules picorent','Des poules dorment']
  ],
  'C4-U03': [
    ['Il dort','Il court','Que fait le chat ?'], ['Le rat','Le lapin','Qui file ?'], ['Il mange','Il dort','Que fait le panda ?'],
    ['Elle broute','Elle dort','Que fait la vache ?'], ['Il saute','Il dort','Que fait le lapin ?'],
    ['Il file','Il dort','Que fait le loup ?'], ['La lune','Le soleil','Qu’est-ce qui brille ?'],
    ['Elle picore','Elle dort','Que fait la poule ?'], ['Il nage','Il dort','Que fait le canard ?'],
    ['La vache','Le chat','Qui rumine ?']
  ],
  'C4-U04': [
    ['Le bol','La balle','Que lèche le chat ?'], ['La mare','Le bois','Que longe la vache ?'],
    ['La porte','L’arbre','Par où passe le lapin ?'], ['La nuit','Le jour','Quand le loup file-t-il ?'],
    ['Du bambou','Une pomme','Que mange le panda ?'], ['De la salade','De l’eau','Que grignote le lapin ?'],
    ['Il passe','Il dort','Que fait le rat ?'], ['Du blé','Une pomme','Que picore la poule ?'],
    ['Dans la mare','Sous un arbre','Où nage le canard ?'], ['Sur le lit','Sous le lit','Où dort le chat ?']
  ],
  'C4-U07': [
    ['La vache','Le chat'], ['Le lapin','La vache'], ['La poule','Le loup'],
    ['Le renard','La poule'], ['Le chat','La vache']
  ],
  'C4-U09': [
    ['Sur la table','Sous la table'], ['Sous le lit','Sur le lit'], ['Devant la porte','Derrière la porte'],
    ['Derrière le mur','Devant le mur'], ['Sur la table','Sous la table'],
    ['Sous la table','Sur la table'], ['Devant le mur','Derrière le mur'], ['Derrière la porte','Devant la porte'],
    ['Sur le lit','Sous le lit'], ['Sous le pont','Sur le pont']
  ],
  'C4-U10': [
    ['Il mange','Il dort','Que fait le chat en premier ?'],
    ['Il boit','Il mange','Que fait le lapin en premier ?'],
    ['Après la pluie','Avant la pluie','Quand la poule picore-t-elle ?'],
    ['Il pleut','Il fait beau','Pourquoi le panda se cache-t-il ?'],
    ['Il a soif','Il a faim','Pourquoi le chat boit-il ?'],
    ['Il a soif','Il a faim','Pourquoi le rat boit-il ?'],
    ['Elle a faim','Elle a froid','Pourquoi la poule picore-t-elle ?'],
    ['Il a sommeil','Il a faim','Pourquoi le chat se couche-t-il ?'],
    ['Elle a chaud','Elle a froid','Pourquoi la vache va-t-elle près de la mare ?'],
    ['Il a froid','Il a chaud','Pourquoi le loup rentre-t-il ?']
  ],
  'C4-U11': [
    ['Le lapin','Le loup'], ['La vache','Le chat'], ['Le chat','Le renard'],
    ['La poule','Le canard'], ['Le canard','Le loup']
  ],
  'C4-U12': [
    ['La poule','Le chat'], ['Le lapin','La vache'], ['La poule','Le loup'],
    ['La vache','Le panda'], ['Le chat','La poule'],
    ['Le lapin','Le chat'], ['Le canard','La poule'], ['La poule','Le canard'],
    ['Le chat','Le lapin'], ['La vache','Le loup']
  ]
};

export const answerAudioKey = text => 'simple:réponse:' + text;

export const questionAudioKey = text => 'simple:question:' + text;
