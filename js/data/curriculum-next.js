// Familiar words and short texts for independent reading and rereading.
export const rereading = [
  'le|la|un|une|il|elle|les|des|du|sur|sous|dans|et|puis|qui|que|mon|ton|son|avec',
  'lapin|chat|loup|rat|poule|vache|canard|renard|panda|tortue|hibou|ours|mouton|cheval|crabe|singe|tigre|colombe|biche|phoque',
  'lune|bol|lit|table|porte|mur|pomme|poire|livre|balle|fleur|panier|mare|bois|pluie|nuit|salade|fromage|soleil|pont',
  'Le chat dort.|Le lapin saute.|La vache broute.|La poule picore.|Le loup file.|Le canard nage.|Le renard passe.|Le panda mange.|La lune brille.|Le chat boit.|La vache rumine.|La poule marche.|Le lapin dort.|Le loup hurle.|Le canard marche.|La tortue avance.|Le rat file.|Le hibou vole.|Le cheval trotte.|La pluie tombe.',
  'Le chat dort sur le lit.|La poule picore du blé.|Le lapin passe la porte.|Le panda mange du bambou.|Le canard nage dans la mare.|La vache marche vers la mare.|Le loup file dans le bois.|Le renard passe sous le pont.|La lune brille dans la nuit.|Le chat joue avec la balle.|La tortue avance vers la mare.|Le rat mange du fromage.|La poule marche près du mur.|Le lapin mange de la salade.|La vache broute près du bois.|Le canard quitte la mare.|Le chat lèche le bol.|Le cheval trotte sur le chemin.|Le loup va vers son abri.|Le livre est sur le lit.',
  'Le chat mange, puis il dort.|Le lapin saute, puis il boit.|La poule marche, puis elle picore.|Le canard nage, puis il dort.|Le panda mange, puis il se repose.|Le chat joue, puis il se couche.|La vache broute, puis elle boit.|Le loup marche, puis il file.|Le lapin mange, puis il dort.|La poule picore, puis elle boit.|Le canard quitte la mare. Il dort.|Le chat a soif. Il boit.|La poule voit du blé. Elle picore.|Le lapin voit la salade. Il mange.|La vache voit la mare. Elle boit.|Le chat voit la balle. Il saute.|Le loup a froid. Il rentre.|Le canard nage. Il voit la poule.|Le lapin a faim. Il mange.|La pluie tombe. Le chat rentre.'
].map(line => line.split('|'));

export const animals = {
  bunny: ['le lapin','lapins'], turtle: ['la tortue','tortues'],
  fox: ['le renard','renards'], cow: ['la vache','vaches'],
  owl: ['le hibou','hiboux'], crab: ['le crabe','crabes'],
  monkey: ['le singe','singes'], tiger: ['le tigre','tigres'],
  seal: ['le phoque','phoques'], dove: ['la colombe','colombes']
};

export const objects = {
  apple: ['la pomme',true], pear: ['la poire',true], bowl: ['le bol',false],
  book: ['le livre',false], ball: ['la balle',true], flower: ['la fleur',true],
  moon: ['la lune',true], basket: ['le panier',false], key: ['la clé',true], door: ['la porte',true]
};

// Contrasts are visible in the drawings. A single tap on either drawing is the only response.
export function actionPool(position) {
  if (position <= 2) {
    const items = position === 1 ? animals : objects;
    const ids = Object.keys(items);
    return ids.map((id, index) => ({
      text: 'Touche ' + items[id][0] + '.',
      pictures: [{ id }, { id: ids[(index + 3) % ids.length] }]
    }));
  }
  if (position === 3) {
    return ['ball','bowl','book','door','basket'].flatMap(id => ['red','blue'].map(color => {
      const name = objects[id][0];
      const adjective = color === 'red' ? 'rouge' : objects[id][1] ? 'bleue' : 'bleu';
      return {
        text: 'Touche ' + name + ' ' + adjective + '.',
        pictures: [{ id, color }, { id, color: color === 'red' ? 'blue' : 'red' }]
      };
    }));
  }
  if (position === 4) {
    return ['bunny','cow','turtle','owl','crab'].flatMap(id => [1,2].map(count => {
      const [name, plural] = animals[id];
      const singular = name.startsWith('la ') ? 'une ' : 'un ';
      return {
        text: 'Touche ' + (count === 1 ? singular + name.slice(3) : 'deux ' + plural) + '.',
        pictures: [{ id, count }, { id, count: 3-count }]
      };
    }));
  }
  if (position === 5) {
    return ['bunny','turtle','fox','owl','crab'].flatMap(id => ['on','under'].map(place => ({
      text: 'Touche ' + animals[id][0] + (place === 'on' ? ' sur la table.' : ' sous la table.'),
      pictures: [{ id, place }, { id, place: place === 'on' ? 'under' : 'on' }]
    })));
  }
  return ['bunny','turtle','fox','owl','crab'].flatMap(id => ['tree','pond'].map(near => ({
    text: 'Touche ' + animals[id][0] + (near === 'tree' ? ' près de l’arbre.' : ' près de la mare.'),
    pictures: [{ id, near }, { id, near: near === 'tree' ? 'pond' : 'tree' }]
  })));
}
