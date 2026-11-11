# 🦄 La Licorne des Sons

Jeu de lecture en français pour les enfants de 4 à 7 ans. Toutes les activités utilisent maintenant l’aventure
Phaser : Paillette marche vers le château et libère un cristal à chaque bonne réponse. Un monde contient dix
cristaux et un refuge à cinq. Une erreur ramène au refuge s’il est atteint, sinon au début du monde en cours.
Les parties de lettres et sons comportent vingt cristaux, les trois niveaux de mots dix.

- 58 lettres et graphèmes, toutes les consonnes de l’alphabet, Y et Ç, 495 mots illustrés ;
- cartes en majuscules **et** minuscules ;
- jamais deux « e » (e, é, è, eu, en, eau) sur les cartes : un « e » est toujours présenté avec deux autres voyelles ;
- voix enregistrée de Robin pour les lettres, les sons et les mots.

Site 100 % statique, **sans étape de compilation** : HTML, CSS, modules JavaScript et Phaser 4.2.1 fourni avec le jeu.

---

## Jouer sur son ordinateur

Les modules JavaScript ne fonctionnent pas en double-cliquant sur `index.html` : il faut un petit serveur web.

```bash
npm run dev                 # avec Node.js, puis ouvrir http://localhost:8080
# ou, sans Node :
python3 -m http.server 8080
```

Sur la branche `feature/curriculum-v2`, choisis la tuile « Parcours d’aventure » depuis l’accueil. Les sept chapitres du parcours pilote sont jouables dans l’ordre, avec 74 unités de quatre blocs de cinq questions. Dans chaque unité, les quatre blocs gardent le même type d’exercice et la même consigne. Le chapitre 5 propose de lire puis de relire des mots et des phrases avec un modèle audio au choix. Le chapitre 6 propose de lire une consigne et de toucher l’un des deux dessins. Au chapitre 7, l’enfant remet trois à cinq mots dans l’ordre, avec un modèle écrit puis à l’écoute. La carte suit la progression de Paillette jusqu’au château de chaque chapitre. Chaque unité propose un atelier de révision avec un retour direct à son étape. Le jeu utilise des audios locaux et mémorise chaque unité dans le navigateur. En ligne, chaque unité se débloque après la précédente. Le mode de contrôle des blocs est réservé à localhost.

## Mettre en ligne

### Cloudflare Pages
1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → choisir le dépôt `la-licorne-des-sons`.
2. Réglages de build :
   - **Framework preset** : `None`
   - **Build command** : *(laisser vide)*
   - **Build output directory** : `/`
3. **Save and Deploy**. Chaque `git push` sur `main` remet le site à jour.

Le fichier `_headers` règle la mise en cache (les sons sont gardés un jour par le navigateur).

### GitHub Pages
Dépôt → **Settings** → **Pages** → *Source* : **Deploy from a branch** → branche `main`, dossier `/ (root)`.
Le site est publié à l'adresse `https://<votre-nom>.github.io/la-licorne-des-sons/`.

> Le dossier `audio/` contient environ 300 fichiers : l'envoi par « Upload files » sur le site de GitHub est limité
> à 100 fichiers à la fois. Utilisez plutôt `git` (voir plus bas) ou GitHub Desktop.

---

## Structure

```
index.html              la page (écrans accueil / jeu / victoire)
css/style.css           tout le style (boutons « bonbons », décor, animations de Paillette)
favicon.svg
js/
  main.js               démarrage : dessine Paillette et le décor, branche les boutons
  game.js               déroulé d'une partie (questions, bonne réponse, erreur, victoire)
  questions.js          choix des mots et des fausses réponses (règle des « e »)
  scene.js              caméra, ciel, déplacements et gags de Paillette
  world.js              le décor des 7 mondes, dessiné en SVG
  unicorn.js            Paillette, dessinée en SVG
  audio.js              lecture des voix (Web Audio) et petits effets sonores
  storage.js            étoiles gagnées et mots déjà vus (mémoire du navigateur)
  utils.js              petits outils
  voice-keys.js         N(…) = phrase de la narratrice, U(…) = phrase de Paillette
  data/
    sounds.js           ⭐ les sons et les mots : c'est ici qu'on ajoute du contenu
    path.js             le parcours : 20 étapes, 7 mondes, phrases d'arrivée dans chaque monde
audio/
  manifest.json         clé de phrase → fichier MP3
  *.mp3                 une phrase par fichier
tools/
  check.mjs             vérifications automatiques (npm run check)
  voice/
    build_voice.py      fabrique les voix qui manquent, et les vérifie par reconnaissance vocale
    download_models.sh  télécharge la voix et la reconnaissance vocale (une seule fois)
    requirements.txt
_headers                réglages de cache pour Cloudflare Pages
.github/workflows/      vérification automatique à chaque envoi sur GitHub
```

---

## Améliorer le jeu

### Ajouter un mot
Dans `js/data/sounds.js`, ajoutez `mot emoji` dans la liste du son, avec la partie à trouver entre crochets :

```js
S('m','M',null, '[m]oto 🏍️|[m]aison 🏠|[m]agicienne 🧙'),
```

Puis fabriquez sa voix et vérifiez :

```bash
python3 tools/voice/build_voice.py     # génère « Comme dans, magicienne ! »
npm run check
```

### Ajouter une phrase
Écrivez-la dans le code avec `N("…")` (narratrice) ou `U("…")` (Paillette), par exemple `say([N("Tu es très forte !")])`,
puis lancez `python3 tools/voice/build_voice.py`.

### Ajouter un son
Ajoutez une ligne `S(...)` dans `js/data/sounds.js`, puis sa prononciation dans `LETTER` en haut de
`tools/voice/build_voice.py`. Les voyelles sont dites par leur son (« ou »), les consonnes par le nom de la lettre (« èm »),
les groupes de consonnes sont épelés (« C, H »).

### Vérifier avant d'envoyer

```bash
npm run check   # chaque mot a sa voix, et les règles des cartes sont respectées (milliers de tirages)
npm run lint    # erreurs de JavaScript (variables oubliées…)
```

La même vérification tourne automatiquement sur GitHub à chaque `git push` (onglet **Actions**).

Pour tester une partie depuis la console du navigateur, ouvrez le jeu avec `?debug` à la fin de l'adresse :
`window.__game.right()` donne la bonne réponse, `window.__game.step()` l'étape en cours.

---

## La voix

Toutes les phrases sont pré-enregistrées dans `audio/`. Elles sont fabriquées avec la voix française
**piper `fr_FR-siwis-medium`**, puis vérifiées par une reconnaissance vocale française (**Whisper small**) :
chaque phrase est générée plusieurs fois et on garde la version comprise correctement. Les lettres sont toujours dites
dans une phrase complète, car la voix prononce mal les sons isolés.

```bash
bash tools/voice/download_models.sh              # une seule fois (~700 Mo, rangé dans tools/voice/models/)
pip install -r tools/voice/requirements.txt      # une seule fois ; ffmpeg doit aussi être installé
python3 tools/voice/build_voice.py --list        # ce qui manque
python3 tools/voice/build_voice.py               # générer ce qui manque
python3 tools/voice/build_voice.py --redo "w:moto,L:m"   # refaire des phrases précises
python3 tools/voice/build_voice.py --prune       # retirer les audios inutilisés
```

Une ligne marquée « ⚠ à écouter » signifie que la reconnaissance vocale n'a pas bien compris : écoutez le fichier,
et relancez avec `--redo` (ou changez de mot) si besoin.

---

## Envoyer sur GitHub

```bash
cd la-licorne-des-sons
git remote add origin https://github.com/<votre-nom>/la-licorne-des-sons.git
git push -u origin main
```

---

## Crédits

- Pour générer les pistes d’un chapitre, exécuter `python3 tools/voice/build_curriculum_voice.py C2` avec les dépendances vocales et le modèle déjà installés. Remplacer `C2` par le chapitre souhaité, ou utiliser `simple` pour les consignes du parcours simplifié. La provenance et le statut de revue figurent dans les registres `audio/curriculum-c1.json` à `audio/curriculum-c4.json`.
- Voix : modèle [piper](https://github.com/rhasspy/piper) `fr_FR-siwis-medium`, entraîné sur le corpus
  **SIWIS French Speech Synthesis** (licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
- Vérification des voix : Whisper (OpenAI, licence MIT) via [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) (Apache 2.0).
- Police : [Fredoka](https://fonts.google.com/specimen/Fredoka) (SIL Open Font License).
- Paillette, le décor et les illustrations sont dessinés en SVG dans le code.

Licence du code : à choisir (par exemple MIT) en ajoutant un fichier `LICENSE`.

## La roue des cadeaux

Chaque partie terminée offre **un tour de roue** : les 20 étapes de l’une des cinq aventures de lettres et sons,
ou les 10 questions d’une partie de « Trouve le mot ! », quel que soit le niveau ou le nombre d’essais.
La roue s’ouvre à la fin de la partie et reste accessible depuis « Ma récompense » ou « Mes cadeaux du jour ».
Un tour ne peut être utilisé qu’une fois ; les tours non utilisés restent disponibles.

La roue comporte **six cases égales** : **2 chocolats**, **2 bonbons**, **1 cadeau de 10 minutes de télé** et
**1 pièce pour la tirelire**. Les deux premières récompenses ont chacune 2 chances sur 6 ; les deux autres 1 sur 6.
Les cadeaux sont à offrir en famille. Il n’y a pas de solde en argent ni de formulaire de retrait dans le jeu.

Le compteur indique les cadeaux gagnés **aujourd’hui**, selon la date locale du navigateur, puis repart à zéro
le lendemain. Les tours disponibles restent conservés. Le format version 2 de `licorne.rewards.v1` préserve les
bonbons et chocolats déjà gagnés ; les anciennes histoires et animations restent comptées dans « Autres cadeaux
déjà gagnés », sans devenir de la télé ou des pièces. Les anciennes pièces du format à cinq récompenses sont
conservées comme des gains, sans reprendre l’ancien solde. Tout reste local à cet appareil et à ce navigateur.
Effacer les données du site efface ce suivi. Si la sauvegarde est bloquée, les cadeaux restent utilisables pendant
la visite. La roue respecte la préférence « Réduire les animations ».

Vérifier avec `npm test`, `npm run check` et `npm run lint`. Le test navigateur optionnel `python3 tools/test-rewards-browser.py`
complète les cinq aventures et vérifie leurs récompenses, le compteur et la sauvegarde. Le test des mots, décrit ci-dessous,
vérifie aussi les récompenses après chacun des trois niveaux. Le serveur local doit être en marche ; Python Playwright
et Chromium sont nécessaires pour ces tests navigateur.

## 📖 Trouve le mot ! — Le château des mots

Une activité indépendante pour reconnaître des **mots entiers**, accessible par le chapitre « Les mots ».
Les cinq aventures de lettres et sons conservent leur contenu et leurs voix enregistrées. Toutes les activités partagent
la roue des cadeaux.

- Trois niveaux, avec 194 mots et expressions : **70** au premier niveau, **64** au deuxième et **60** au troisième. Chaque partie propose **10 questions** et quatre cartes.
- Toucher « Réécouter » pour réentendre « Trouve le mot… maison ! ». Regarder les lettres, puis choisir le mot.
- Une erreur ramène au dernier refuge ou au début du monde. La bonne carte devient verte et affiche ✓ avant le trajet.
- Paillette collecte dix cristaux dans le monde en cours et rejoint le château. Les mondes changent tous les dix
  cristaux et les voyages suivants découvrent les décors suivants. Le refuge protège les cinq premiers cristaux.
- Le résultat célèbre les cristaux réunis. Les réponses répétées après un retour au refuge ne gonflent ni le score
  interne ni le nombre de réussites utilisé pour le suivi des mots.
- « Rejouer » lance une nouvelle partie ; « Choisir un niveau » revient aux trois niveaux.

Les mots sont introduits dans l’ordre du fichier : jusqu’à six mots encore inconnus entrent dans les cibles à chaque
nouvelle partie, en plus des mots déjà rencontrés. Les mots manqués reviennent plus souvent dans les parties suivantes.
Trois réussites consécutives du premier coup indiquent une reconnaissance régulière ; ces mots restent révisés, moins
souvent. La génération évite deux cibles consécutives identiques ; un retour au refuge fait revisiter les questions perdues.
La progression complète par mot reste dans `licorne.words.v1`, sur cet appareil et dans ce navigateur, sans compte ni
backend. Une erreur est mémorisée même si l’enfant quitte la partie avant de réussir le mot. Le suivi de reconnaissance régulière et des mots à revoir reste enregistré localement. Effacer les données du site efface ce suivi. Un message signale une sauvegarde
bloquée ; le jeu continue alors à suivre les progrès pendant la visite.

### Écouter et remplacer les voix

Les 416 consignes « Trouve le mot », les exemples « Comme dans » et les phrases à écouter utilisent des MP3 de Robin dans le ton naturel retenu pour le jeu. Aucune voix système ou synthèse du navigateur n’est utilisée. Sur iPad/iPhone/Mac,
il suffit de vérifier le volume. En cas d’échec de chargement, le message propose de réécouter sans révéler la réponse.
Les tests de navigateur utilisent les vrais fichiers MP3 ; l’écoute et la fluidité restent à vérifier sur les appareils.

Le vocabulaire est dans **`js/data/words.js`**, les règles dans `js/words/model.js`, le suivi dans `progress.js`, les voix
dans `voice.js`, l’interface dans `game.js`, le parcours partagé dans `journey.js` et les styles dans `css/words.css`. Aucun outil de compilation n’est nécessaire.
Pour ajouter un mot, ajouter par exemple à `WORDS` :

```js
word('fleur', 'fleur', 2),
```

Chaque mot reçoit automatiquement une référence `audioKey: 'W:<id>'` dans `audio/manifest.json`. Après un ajout,
lancer `python3 tools/voice/build_voice.py` puis `npm run check`. Pour employer un enregistrement humain, remplacer
le MP3 référencé par cette clé ; il doit contenir la consigne entière, par exemple « Trouve le mot, fleur ! ».
Chaque nouvel appui annule la lecture précédente. `speech` peut préciser une prononciation lors de la génération,
comme « Léna » pour la carte « lena ». Ajouter des niveaux dans `WORD_LEVELS` et les mots correspondants dans `WORDS`.
Prévoir au moins quatre mots de prononciations différentes par niveau.

Donner **le même `soundGroup` aux homophones** lors de l’ajout de vocabulaire. Par exemple :

```js
word('et', 'et', 1, { soundGroup: 'eh' }),
word('est', 'est', 1, { soundGroup: 'eh' }),
```

Le générateur évite alors de les proposer dans la même question, y compris comme deux fausses réponses. Les doublons
écrits sont également exclus. La liste initiale ne contient aucune paire homophone. Ce module complète le décodage :
il invite à observer chaque lettre et ne remplace pas les activités de lettres et sons.

### Tester cette branche sur votre Mac, sans changer le site principal

Dans Terminal, **depuis le dossier du projet**, lancer :

```bash
cd ~/la-licorne-des-sons
git fetch origin
git switch feature/trouve-le-mot
git pull --ff-only
npm run dev
```

Ouvrir `http://localhost:8080/`, puis « 📖 Trouve le mot ! ». Si le projet est rangé ailleurs, adapter la commande `cd`.
Cette prévisualisation est locale et ne modifie pas la branche `main`. Pour arrêter le serveur : Ctrl+C.

Vérifications : `npm run check`, `npm run lint`, `npm test`. Le test navigateur facultatif nécessite Python Playwright,
Chromium et le serveur local en marche :

```bash
python3 tools/test-words-browser.py
# ou pour enregistrer les captures d’écran :
python3 tools/test-words-browser.py --screenshots /tmp/licorne-mots
```

Le script accepte `--url` pour une autre adresse du serveur et `--chromium` pour un autre chemin de Chromium.
Il vérifie les trois niveaux, les essais, le score, le suivi après rechargement, les cinq anciens modes, les tailles
phone/tablette et les chemins audio indisponibles. L’écoute reste à vérifier manuellement sur les appareils réels.

### Vocabulaire des lettres et des sons

Les cinq activités de phonologie partagent maintenant **495 mots illustrés** et **58 entrées** : 7 voyelles,
23 entrées dans « Les consonnes », 13 dans « Les sons » et 15 dans « Sons experts ».
Toutes les consonnes de l’alphabet sont présentes, avec H, Q, W, X et Z ; Y, CH et Ç sont également proposés.
Le H est présenté par son nom de lettre, même lorsqu’il est muet. Le W se rencontre dans des mots français
empruntés à d’autres langues et peut se prononcer différemment selon le mot : l’activité demande la lettre écrite.

Parmi les nouveaux groupes : ui, oin, ei, er, ez, un, ein, ien, eil, ail, ouil, euil et tion.
Les groupes complexes sont épelés comme CH et PH lorsque la voix rend mal leur son isolé, puis illustrés par
un mot prononcé en entier. Les graphèmes de son identique gardent la même clé phonétique pour éviter les
fausses réponses ambiguës (par exemple C/K/Q/QU, É/ER/EZ et IN/AIN/EIN/UN).

Les **335 nouveaux fichiers MP3** sont inclus dans le dépôt : aucune génération de voix n’est nécessaire sur
l’appareil de l’enfant. Ils ont été générés avec la voix française du projet puis vérifiés avec Whisper.
Les modèles et l’environnement Python de génération ne sont pas des dépendances du jeu statique.
`npm run check` vérifie les 685 audios nécessaires et 18 870 tirages des cartes ; `npm test` couvre aussi la
présence de toutes les consonnes, le surlignage des nouveaux mots et les dix étapes vers le château.

## L’aventure principale — mondes, refuges et gags

Sur la branche **`prototype/immersive-worlds`**, **`index.html` est l’entrée principale** pour tous les modules.
L’ancienne adresse `prototype.html` redirige vers cette entrée. `classic.html` garde les activités précédentes comme
solution de secours, accessible si le moteur ne peut pas démarrer.

Les sept thèmes sont la prairie, la forêt des lucioles, la jungle des cascades, la plage des coquillages, les glaces,
le voyage dans les nuages et la lune des petits lapins. **Chaque monde compte dix cristaux**, avec un drapeau-refuge au cinquième. Les vingt cristaux d’une partie
phonologique traversent deux mondes ; une partie de dix mots traverse un monde. Le nombre de mondes terminés est gardé
localement dans `licorne.adventure.v1`, pour varier le prochain décor même en changeant de module. Ce compteur ne
contient aucune information sur l’enfant.

**Une erreur protège le chemin déjà validé :** avant le cinquième cristal, Paillette revient au départ de ce monde ;
à partir de cinq, elle revient au refuge. Les cristaux gagnés depuis ce point réapparaissent et doivent être retrouvés.
Exemples : 4 → 0, 8 → 5, 14 → 10 et 19 → 15. Le monde précédent n’est jamais perdu. Un petit nuage accompagne
le retour. La progression des mots distingue les questions déjà réussies pour ne pas compter deux fois les réponses
rejouées. Chaque voyage terminé offre toujours un seul tour de roue.

Un grand pont arc-en-ciel est posé sur le chemin entre les cristaux 2 et 5 : Paillette grimpe dessus, passe le sommet
puis redescend vers le refuge. Le pont reste dans le décor ; les cristaux suivent sa courbe. La caméra recule doucement
pour montrer la montée. Des oiseaux animés volent autour du chemin, mais restent immobiles pendant les questions.
Pendant le trajet, Paillette fait aussi des prouts colorés, rebondit et fait apparaître un chapeau magique. Les réponses sont plus grandes : lettres en deux lignes majuscule/minuscule et grands mots, avec une disposition
sur une colonne sur les petits téléphones si nécessaire. Les effets restent calmes pendant la lecture des questions,
et la préférence système « Réduire les animations » est respectée.

Le bouton ⏸ met le voyage en pause : l’animation et les voix s’arrêtent, y compris pendant une montée ou un retour.
« Reprendre l’aventure » continue au même endroit ; « Choisir une autre activité » recommence une partie. Le changement
d’onglet met aussi le jeu en pause. Le menu contient une explication dépliable pour les parents.

Le moteur Phaser 4.2.1 est fourni dans `vendor/phaser/` avec sa licence MIT et sa provenance vérifiée. Les sept panoramas
sont limités à 2400 × 933 pixels pour limiter la mémoire graphique ; les personnages et objets utilisent des textures
de densité double et les chemins sont dessinés nativement. WebGL est utilisé quand il est disponible, avec un
rendu Canvas de secours (`?debug&renderer=canvas`). Les réponses restent des boutons HTML accessibles au toucher et au
clavier. Les voix de lettres/sons restent les MP3 français du projet ; le système de voix des mots est réutilisé.

Pour tester sur votre Mac, arrêter l’ancien serveur avec Ctrl+C, puis dans Terminal :

```bash
cd ~/la-licorne-des-sons
git fetch origin
git switch prototype/immersive-worlds
git pull --ff-only
npm run dev
```

Le fichier `serve.json` désactive les redirections d’URL du serveur local pour conserver les paramètres de test.
Ouvrir **`http://localhost:8080/`**. Choisir n’importe quelle activité. Vérifier les retours avant/après le refuge,
le changement de monde au dixième cristal et les gags du trajet. Les refuges valent pour le voyage en cours ; choisir
une autre activité ou recharger la page recommence une partie. Les progrès des mots, cadeaux et décors terminés restent
sauvegardés. Ce test local ne modifie pas la branche `main`.

Code : `js/prototype/model.js` définit les mondes et les refuges ; `world.js` anime le trajet Phaser ; `art.js` crée les
textures SVG ; `travel.js` définit le pont et les trajectoires des oiseaux ; `app.js` relie les modules et les panneaux. `AdventureSession` ajoute le retour au refuge au modèle de
questions partagé. Les interfaces de secours conservent leur logique indépendante.

Vérifications : `npm test`, `npm run check`, `npm run lint`. Avec le serveur, Python Playwright et Chromium dans
l’environnement cloud :

```bash
python3 tools/test-prototype-browser.py
python3 tools/test-checkpoints-browser.py --screenshots /tmp/paillette-refuges
python3 tools/test-rainbow-browser.py --screenshots /tmp/paillette-arc-en-ciel
```

Ces tests couvrent les huit aventures de lettres, sons et mots, les refuges dans deux mondes, la remise en jeu des cristaux perdus,
les crédits uniques et récompenses, les quatre gags avec leurs vraies animations, les gros mots/graphèmes sur
téléphone/tablette et les retours au menu pendant une glissade. Le troisième script vérifie les vraies montées, les
pauses pendant les différentes phases, les oiseaux calmes pendant la lecture, la rotation de l’écran et douze
changements d’activité consécutifs sans accumulation de décors. Les scripts `test-words-browser.py` et
`test-rewards-browser.py` vérifient les activités de secours sur `classic.html`.
L’écoute et la fluidité sur de vrais appareils Safari/iPad restent à vérifier sur ces appareils.

Les passes de revue et le protocole de test en famille sont décrits dans [docs/PLAYTEST_REVIEW.md](docs/PLAYTEST_REVIEW.md).


## Chapitres et voix commune

L’accueil affiche **quatre grandes tuiles en grille 2×2**. Un toucher ouvre les activités du chapitre :

| Chapitre | Activités |
| --- | --- |
| Les lettres | Les voyelles, Les consonnes |
| Les sons | Syllabes faciles, Lettres muettes, Voyelles nasales, Tout mélangé |
| Les mots | Les trois niveaux de Trouve le mot ! |
| Les phrases | Phrases de 3 ou 5 mots avec modèle, phrases de 3 ou 5 mots à écouter, Trouve la faute ! |

« Les chapitres » revient à l’accueil. Quitter une aventure revient à son chapitre. Les progrès, les mondes et les
tours de roue restent conservés. Toutes les activités utilisent la voix enregistrée de Robin.
Le secours classique conserve ses huit activités précédentes et partage la nouvelle roue des cadeaux.

Voir [docs/FLAT_MENU_AND_VOICE.md](docs/FLAT_MENU_AND_VOICE.md). Vérification ciblée :
`python3 tools/test-chapters-browser.py --screenshots /tmp/licorne-chapitres`.

## Rendu plus net, animaux et nouveaux voyages

Le canvas utilise désormais les vrais pixels de l’écran, jusqu’à une densité de 2 avec un budget de six millions de
pixels sur les grandes surfaces. Sur un écran Retina 1024 × 768, son tampon est bien de 2048 × 1536. Les chemins
sont des rubans vectoriels continus ; les personnages et objets sont rasterisés plus finement. Le redimensionnement
et le rendu Canvas de secours conservent cette densité.

Chaque monde accueille six compagnons : lapins, renards, hiboux, singes, toucans, petits tigres, tortues, crabes,
manchots, phoques, colombes ou lapins astronautes. Ils saluent Paillette pendant le trajet et se calment pendant les
questions. Au sixième cristal, chaque habitat propose une surprise : papillon sur la corne, couronne de fleurs,
éclaboussures, bulle géante ou bonds lunaires. Les animations respectent les pauses et la réduction des mouvements.

La jungle possède des palmiers et des cascades ; la plage un rivage et du sable ; Paillette marche sur un chemin de
nuages et traverse une Lune avec des cratères, une vue de la Terre et des lapins casqués. Les mondes changent toujours
tous les dix cristaux, avec le refuge à cinq. Les chapitres, les activités, la voix de Robin et la roue restent
identiques.

Vérification ciblée : `python3 tools/test-variety-browser.py --screenshots /tmp/licorne-mondes`. Voir aussi
[docs/RENDERING_AND_WORLDS.md](docs/RENDERING_AND_WORLDS.md).


## Construire une phrase

Quatre activités se choisissent dans le chapitre « Les phrases » :

- **La phrase en ordre · 3 mots** : le modèle est affiché au-dessus des mots mélangés.
- **La phrase en ordre · 5 mots** : la même activité avec cinq mots.
- **Écoute la phrase · 3 mots** : la phrase est prononcée, sans modèle écrit.
- **Écoute la phrase · 5 mots** : la même activité avec cinq mots.

L’enfant touche les mots dans l’ordre. Chaque mot correct remplit une case ; les mots choisis restent à leur place
et deviennent grisés. Les tuiles sont en minuscules et sans ponctuation. Un même mot répété peut être choisi
sur l’une ou l’autre de ses tuiles. Une phrase complète donne un cristal ; dix phrases différentes terminent
l’aventure et donnent un seul tour de roue. Une erreur utilise les refuges habituels, sans compter deux fois
les réussites rejouées. Réécouter, faire une pause et changer de monde conservent les mots déjà placés.

Il y a **48 phrases enregistrées** : 24 de trois mots et 24 de cinq mots. Les phrases utilisent également la voix de Robin ; aucune voix système n’est utilisée. En mode écoute, un problème audio propose Réécouter sans afficher
la réponse. Les progrès restent séparés par activité dans `licorne.sentences.v1`, sans modifier ceux des mots.

Vocabulaire : `js/data/sentences.js`. Mélange et choix : `js/sentences/model.js`. Session et refuges :
`SentenceAdventureSession` dans `js/prototype/model.js`. Interface : `js/prototype/app.js` et `css/sentences.css`.
Le secours classique conserve ses huit activités précédentes.

```bash
npm test
npm run check
npm run lint
python3 tools/test-sentences-browser.py --screenshots /tmp/licorne-phrases
# Sur macOS, ajouter --browser-path '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```


## Trouve la faute !

Une phrase de **trois mots** est présentée dans son ordre normal, avec **un seul mot mal écrit**. L’enfant touche
le mot qui contient la faute de frappe. Les trois mots ont le même aspect avant la réponse. Après une bonne
réponse, le mot est corrigé et la phrase entière est affichée avec son orthographe correcte. Une erreur reprend
les règles habituelles des refuges, puis permet de réessayer. Dix phrases complétées donnent un tour de roue.

Le module comprend **24 phrases et 72 variantes de fautes**, réparties entre les trois positions. Chaque aventure
présente dix phrases différentes. Les fautes sont choisies à la main pour éviter de remplacer un mot par un autre
mot français valide. Les phrases sont lues avec les enregistrements français `S:` déjà vérifiés ; les mots mal
écrits ne sont jamais prononcés. « Réécouter », les pauses et le choix du monde conservent la question.
Le suivi est indépendant, dans `licorne.typos.v1`, et les réussites rejouées après un refuge ne donnent pas de
crédits supplémentaires.

Données : `js/data/typos.js`. Questions : `js/sentences/typos.js`. Le chapitre **Les phrases** contient la tuile rose **Trouve la faute !**. Vérification : `node tools/typos.test.mjs` et, avec le serveur et Python Playwright,
`python3 tools/test-typos-browser.py --screenshots /tmp/licorne-fautes`.

### Syllabes faciles et lettres muettes

Dans **Ateliers de révision → Les sons**, **Syllabes faciles** propose 40 assemblages consonne-voyelle. L’enfant écoute Robin, choisit entre deux écritures, puis voit l’assemblage, par exemple « f + a → fa ». **Lettres muettes** fait reconnaître 40 mots courts. Après la réponse, la lettre finale muette est soulignée.

### Voyelles nasales

Dans **Ateliers de révision → Les sons → Voyelles nasales**, Robin lit des mots entiers. L’enfant écoute par exemple « mouton », « gant » ou « lapin », puis choisit l’écriture de la voyelle nasale. Les choix comparent les familles **on**, **an/en** et **in/ain/ein/un**. Les phonèmes de référence restent accessibles dans le parcours et le catalogue d’écoute.

Le [catalogue d’écoute](ecoute.html) permet de rechercher et écouter les 919 enregistrements avec Robin.

Dans le parcours d’aventure, les mots, les consignes et les réponses à écouter utilisent la voix Robin sur ElevenLabs. Les pistes sont locales et recensées dans les registres `audio/curriculum-c1-robin.json` à `audio/curriculum-c7-robin.json`. Le script `tools/voice/build_curriculum_robin.py` présente le lot à produire sans appel réseau par défaut. Utiliser `--chapters C6 C7` pour sélectionner plusieurs chapitres.

`tools/voice/refresh_robin_words.py --cache <dossier>` recense les mots et les phrases des ateliers et du parcours. Ajouter `--generate` pour produire les pistes avec la ponctuation du ton naturel, puis actualiser les fichiers que le jeu charge.
