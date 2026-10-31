# Rendu Retina et variété des mondes

## Cause du rendu flou

Le canvas précédent restait à 1024 × 768 sur un écran Retina affichant cette taille en CSS : l’option `resolution`
du constructeur n’est pas prise en compte par Phaser 4. Certaines textures SVG étaient également agrandies depuis
une image plus petite, notamment les panoramas et le chemin qu’ils contenaient.

`js/prototype/rendering.js` calcule maintenant une vraie surface de pixels, affichée à sa taille CSS. Un écran de
1024 × 768 à densité 2 utilise un canvas de 2048 × 1536. La densité est plafonnée à 2 et les grandes surfaces visent
un budget de six millions de pixels, sans réduire les écrans ordinaires en dessous de leur résolution native.
Le redimensionnement, la rotation et le changement de densité actualisent le tampon et la caméra ensemble.
Le ResizeObserver et l’écouteur resize sont retirés à la destruction du jeu.

Les personnages, animaux et objets SVG sont rasterisés à une densité double, puis affichés à leurs dimensions
logiques. Les panoramas restent limités à 2400 × 933 pour contenir la mémoire. Les chemins sont des polygones natifs
continus : cela évite l’agrandissement d’un ancien tracé pixellisé et les petites bandes visibles aux jointures de
traits épais transparents. WebGL et Canvas utilisent tous deux ce dimensionnement.

## Sept habitats et leurs compagnons

| Monde | Décor | Animaux |
| --- | --- | --- |
| Prairie des fleurs | Arbres, fleurs et moulin | Lapins et renards |
| Forêt des lucioles | Feuillage, champignons et arbre-maison | Hiboux, renards et lapins |
| Jungle des cascades | Palmiers, lianes et cascades | Singes, toucans et petits tigres |
| Plage des coquillages | Rivage, sable, palmiers et phare | Tortues et crabes |
| Pays des glaces | Cristaux et palais de glace | Manchots et phoques |
| Voyage dans les nuages | Chemin de nuages et pavillon flottant | Lapins ailés et colombes |
| Lune des petits lapins | Cratères, observatoire, étoiles et Terre lointaine | Lapins astronautes |

Les identifiants numériques restent stables : les voyages terminés conservent leur progression entre les sessions.
Un monde compte toujours dix cristaux et un refuge au cinquième. Six compagnons se répartissent sur le chemin ; ils
saluent Paillette à son passage. Un toucher sur un compagnon pendant le trajet peut aussi le faire réagir.
Ils restent immobiles pendant les questions et en mode de réduction des animations.

Le sixième cristal réserve une nouvelle surprise selon le monde : un papillon chatouille la corne, une couronne de
fleurs apparaît, une vague éclabousse les sabots, une bulle fait flotter Paillette ou la faible gravité lui permet de
faire de grands bonds. Les prouts, le pont arc-en-ciel, les rebonds et le chapeau restent présents. Les surprises ne
changent ni les réponses, ni les récompenses, ni les refuges.

## Vérifications

```bash
npm test
npm run check
npm run lint
python3 tools/test-variety-browser.py --screenshots /tmp/licorne-variete
python3 tools/test-prototype-browser.py
python3 tools/test-checkpoints-browser.py
python3 tools/test-menu-browser.py
python3 tools/test-rainbow-browser.py
```

La suite dédiée vérifie les vrais tampons Retina sous WebGL et Canvas, la rotation, les sept habitats, les six
compagnons, leur immobilité pendant la lecture, les cinq nouvelles surprises en temps réel, la pause et le nettoyage
des effets. L’écoute et la fluidité sur un vrai iPad/Safari restent à examiner sur l’appareil.

Prévisualisation : mettre à jour `prototype/immersive-worlds`, lancer `npm run dev`, puis ouvrir http://localhost:8080/.
Les voyages suivants découvrent les autres mondes. Les captures du dossier docs/previews montrent des états réels du
jeu ; aucun outil de génération d’image ou de bibliothèque d’illustrations externe n’est nécessaire à l’exécution.
