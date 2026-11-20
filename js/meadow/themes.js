/** Stable IDs match the existing saved world choices. */
export const PAINTED_WORLDS = [
  {id:0,habitat:'meadow',name:'La prairie peinte',icon:'flower',sky:'#cbdedb'},
  {id:1,habitat:'forest',name:'La forêt des lucioles',icon:'mushroom',sky:'#799b88'},
  {id:2,habitat:'jungle',name:'La jungle des cascades',icon:'leaf',sky:'#83b9a5'},
  {id:3,habitat:'beach',name:'La plage des coquillages',icon:'shell',sky:'#c4e9ed'},
  {id:4,habitat:'ice',name:'Le pays des glaces',icon:'ice',sky:'#d3e6f5'},
  {id:5,habitat:'clouds',name:'Le voyage dans les nuages',icon:'cloud',sky:'#d9ddf1'},
  {id:6,habitat:'moon',name:'La lune des petits lapins',icon:'moon',sky:'#383d72'},
  {id:7,habitat:'prehistoric',name:'La vallée des dinosaures',icon:'leaf',sky:'#ecd1a4'},
  {id:8,habitat:'desert',name:'Le désert des cactus',icon:'cactus',sky:'#f59b82'},
  {id:9,habitat:'fairy',name:'Le royaume des licornes',icon:'rainbow',sky:'#ced8f3'},
  {id:10,habitat:'peluches',name:'Le monde des peluches',icon:'teddy',sky:'#f6dccf'}
];
export const paintedWorld = id => PAINTED_WORLDS.find(world=>world.id===id) ?? PAINTED_WORLDS[0];
