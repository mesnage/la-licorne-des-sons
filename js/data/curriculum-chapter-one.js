// Editorial draft. Oral rows contain a word and the phoneme to identify.
// Written rows explicitly mark grapheme boundaries, including CH and OU.
export const sounds = {
  a: ['a', 'a'], i: ['i', 'i'], é: ['e', 'e'], o: ['o', 'o'],
  u: ['y', 'u'], ou: ['u', 'ou'], f: ['f', 'f'], v: ['v', 'v'],
  s: ['s', 's'], l: ['l', 'l'], r: ['ʁ', 'r'], j: ['ʒ', 'j'], ch: ['ʃ', 'ch']
};

export const units = {
  'C1-U02': [
    [['abeille','a'],['image','i'],['avion','a'],['île','i'],['arbre','a']],
    [['abricot','a'],['igloo','i'],['ananas','a'],['hibou','i'],['animal','a']],
    ['a','i','A','I','a manuscrit'],
    [['histoire','i'],['alligator','a'],['hiver','i'],['ami','a'],['avocat','a']]
  ],
  'C1-U03': [
    [['été','é'],['eau','o'],['école','é'],['auto','o'],['éléphant','é']],
    [['épi','é'],['haut','o'],['étoile','é'],['hôtel','o'],['écharpe','é']],
    ['É','o','A','i','é'],
    [['écureuil','é'],['autobus','o'],['éponge','é'],['autruche','o'],['élastique','é']]
  ],
  'C1-U04': [
    [['usine','u'],['ours','ou'],['uniforme','u'],['outil','ou'],['utile','u']],
    [['univers','u'],['oubli','ou'],['urgence','u'],['ouverture','ou'],['humide','u']],
    ['U','ou','u','OU','u manuscrit'],
    [['usine','u',0],['lune','u',1],['rue','u',2],['ours','ou',0],['hibou','ou',2]]
  ],
  'C1-U05': [
    [['farine','f'],['arbre','a'],['fourmi','f'],['avion','a'],['fusée','f']],
    [['famille','f'],['figue','f'],['photo','f'],['fumée','f'],['four','f']],
    ['f a','f i','f o','f u','f ou'],
    ['f é','a f','i f','ou f','u f']
  ],
  'C1-U06': [
    [['valise','v'],['farine','f'],['vélo','v'],['fourmi','f'],['visage','v']],
    [['vache','v'],['village','v'],['volcan','v'],['vue','v'],['vote','v']],
    ['v a','v i','v o','v u','v é'],
    ['f ou','v u','v i f','v a','f a']
  ],
  'C1-U07': [
    [['salade','s'],['valise','v'],['citron','s'],['vélo','v'],['soupe','s']],
    [['sapin','s'],['sirène','s'],['seau','s'],['sucre','s'],['souris','s']],
    ['s a','s i','s o','s u','s ou'],
    ['s é','s i','v ou','f é','s u']
  ],
  'C1-U08': [
    [['lune','l'],['lapin','l'],['livre','l'],['moto','non'],['vélo','non']],
    [['lama','l'],['limace','l'],['lot','l'],['lutin','l'],['loup','l']],
    ['l a','l i','l o','l u','l é'],
    ['f i l','s a l é','l a v é','f ou','v u']
  ],
  'C1-U09': [
    [['rat','r'],['lapin','l'],['rideau','r'],['lune','l'],['roue','r']],
    [['radis','r'],['rivière','r'],['rose','r'],['ruban','r'],['régime','r']],
    ['r a','r i','r o','r u','r é'],
    ['r a v i','r i v a l','r u r a l','r i r a','v i r a']
  ],
  'C1-U10': [
    [['jardin','j'],['roue','r'],['girafe','j'],['rat','r'],['jupe','j']],
    [['jambe','j'],['gilet','j'],['joli','j'],['jus','j'],['joue','j']],
    ['j a','j i','j o','j u','j ou'],
    ['j u r a','j u r é','j ou r','j ou j ou','v i r a l']
  ],
  'C1-U11': [
    [['chat','ch'],['jardin','j'],['chien','ch'],['jupe','j'],['chou','ch']],
    [['château','ch'],['chiffon','ch'],['chauffage','ch'],['chute','ch'],['chouchou','ch']],
    ['ch a','ch i','ch o','ch u','ch ou'],
    ['ch ou','ch é r i','ch i ch i','r ou l a','l i r a']
  ],
  'C1-U12': [
    [['fourmi','f'],['rose','r'],['lapin','l'],['jupe','j'],['chat','ch']],
    [['fumée','f'],['village','v'],['souris','s'],['lutin','l'],['chiffon','ch']],
    ['ch é','l ou','r ou','s é','v ou'],
    ['i l','s i','s a l i','s a l i r a','r ou l é']
  ]
};

// Meaning notes for the written items that are words, rather than CV practice.
export const meanings = {
  fou:'très agité', vu:'que l’on a aperçu', vif:'rapide', va:'se déplace', fa:'note de musique',
  fil:'brin fin', salé:'qui contient du sel', lavé:'rendu propre',
  ravi:'très content', rival:'personne en compétition', rural:'de la campagne',
  rira:'va rire', vira:'a tourné', jura:'a fait un serment', juré:'promis par serment',
  jour:'période de lumière', joujou:'jouet', viral:'qui se diffuse vite',
  chou:'légume', chéri:'très aimé', chichi:'manière affectée', roula:'a roulé', lira:'va lire',
  il:'pronom', si:'mot qui introduit une condition', sali:'rendu sale',
  salira:'va rendre sale', roulé:'enroulé ou déplacé en roulant'
};

export const chapterInstructions = {
  oral_count: 'Écoute le mot. Combien de syllabes entends-tu ?',
  oral_segment: 'Écoute le mot. Ajoute un point pour chaque syllabe que tu prononces, puis vérifie.',
  oral_syllable_match: 'Écoute le premier mot, puis les deux autres. Lequel commence par la même syllabe ?',
  oral_initial: 'Écoute le mot. Quel son entends-tu au début ?',
  oral_yes_no: 'Écoute le son, puis le mot. Le mot commence-t-il par ce son ?',
  oral_contrast: 'Écoute le mot et compare les sons. Quel son entends-tu au début ?',
  sound_to_grapheme: 'Écoute, puis choisis l’écriture du son.',
  grapheme_to_sound: 'Regarde la lettre ou le groupe de lettres. Écoute les options et choisis le son qui correspond.',
  oral_sound_position: 'Écoute le son, puis le mot. Où entends-tu ce son dans le mot ?',
  blend_cv: 'Assemble les deux sons, puis choisis la syllabe que tu as formée.',
  decode_syllable_audio: 'Lis la syllabe à ton rythme, puis écoute les options.',
  decode_word_audio: 'Lis le mot à ton rythme, puis écoute les options.'
};
