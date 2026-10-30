# 🦄 La Licorne des Sons

Jeu de lecture en français pour les enfants de 4 à 7 ans. Paillette la licorne traverse 7 mondes en 20 étapes :
à chaque étape, l'enfant entend une lettre ou un son (« Trouve la lettre, M ! … Comme dans, moto ! ») et choisit
la bonne carte parmi trois. Une erreur fait glisser Paillette sur une peau de banane jusqu'au début du monde.

- 58 lettres et graphèmes, toutes les consonnes de l’alphabet, Y et Ç, 495 mots illustrés ;
- cartes en majuscules **et** minuscules ;
- jamais deux « e » (e, é, è, eu, en, eau) sur les cartes : un « e » est toujours présenté avec deux autres voyelles ;
- voix française enregistrée (aucune voix de synthèse de l'appareil, donc jamais d'anglais).

Site 100 % statique, **sans étape de compilation** : du HTML, du CSS et des modules JavaScript natifs.

---

## Jouer sur son ordinateur

Les modules JavaScript ne fonctionnent pas en double-cliquant sur `index.html` : il faut un petit serveur web.

```bash
npm run dev                 # avec Node.js, puis ouvrir http://localhost:8080
# ou, sans Node :
python3 -m http.server 8080
```

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

La roue comporte **six cases égales** : bonbons, chocolat, histoire supplémentaire le soir et **trois cases de prout
magique de licorne**. L’animation a donc 3 chances sur 6, chaque autre cadeau 1 sur 6 : elle reste trois fois plus probable.
Les cadeaux matériels et l’histoire sont à offrir en famille. La tirelire, le solde et le cadeau en centimes ont été retirés.

Le compteur indique les cadeaux gagnés **aujourd’hui**, selon la date locale du navigateur. Il repart à zéro le jour
suivant. Les cadeaux et les tours disponibles sont enregistrés dans `licorne.rewards.v1`, sans serveur ni synchronisation
entre appareils. Les anciens enregistrements conservent les tours disponibles et les comptes des cadeaux restants ;
le solde et les anciens cadeaux en argent sont ignorés. Les nouvelles sauvegardes ne contiennent plus de solde.
Effacer les données du site efface ces informations. Si la sauvegarde est bloquée, un message le signale : les cadeaux
restent utilisables pendant la visite. La roue et le gag respectent la préférence « Réduire les animations ».

Vérifier avec `npm test`, `npm run check` et `npm run lint`. Le test navigateur optionnel `python3 tools/test-rewards-browser.py`
complète les cinq aventures et vérifie leurs récompenses, le compteur et la sauvegarde. Le test des mots, décrit ci-dessous,
vérifie aussi les récompenses après chacun des trois niveaux. Le serveur local doit être en marche ; Python Playwright
et Chromium sont nécessaires pour ces tests navigateur.

## 📖 Trouve le mot ! — Le château des mots

Une activité indépendante pour reconnaître des **mots entiers**, accessible par « Trouve le mot ! » sur l’accueil.
Les cinq aventures de lettres et sons conservent leurs règles et leurs voix enregistrées. Toutes les activités partagent
la roue des cadeaux, sans tirelire ni argent.

- Trois niveaux, avec 44 mots et expressions au départ. Chaque partie propose **10 questions** et quatre cartes.
- Toucher « Réécouter » pour réentendre « Trouve le mot… maison ! ». Regarder les lettres, puis choisir le mot.
- Une erreur permet simplement de réessayer. La bonne carte devient verte, affiche ✓ et fait apparaître Paillette.
- Paillette traverse les mêmes sept mondes que dans les autres activités : elle saute, collecte dix cristaux et rejoint
  le château de cristal. Le décor, la caméra et les animations sont partagés. Pas de chronomètre ni de retour en arrière.
- Le résultat compte les mots trouvés **du premier coup** : après deux questions avec une erreur, le résultat est
  « 8 mots sur 10 du premier coup ». Les dix mots sont finalement réussis, ce que le message final rappelle.
- « Rejouer » lance une nouvelle partie ; « Choisir un niveau » revient aux trois niveaux.

Les mots sont introduits dans l’ordre du fichier : jusqu’à six mots encore inconnus entrent dans les cibles à chaque
nouvelle partie, en plus des mots déjà rencontrés. Les mots manqués reviennent plus souvent dans les parties suivantes.
Trois réussites consécutives du premier coup indiquent une reconnaissance régulière ; ces mots restent révisés, moins
souvent. Un même mot n’est jamais la cible de deux questions consécutives, y compris en rejouant dans la même visite.
La progression complète par mot reste dans `licorne.words.v1`, sur cet appareil et dans ce navigateur, sans compte ni
backend. Une erreur est mémorisée même si l’enfant quitte la partie avant de réussir le mot. Le volet « Pour les grands »
montre les mots reconnus et ceux à revoir. Effacer les données du site efface ce suivi. Un message signale une sauvegarde
bloquée ; le jeu continue alors à suivre les progrès pendant la visite.

### Écouter et remplacer les voix

**Pour cette nouvelle activité seulement**, une voix de synthèse française du navigateur est utilisée, à vitesse 0,8.
Une voix locale de France est privilégiée, puis une autre voix française. Aucune voix anglaise n’est utilisée en secours.
Sur un iPad/iPhone/Mac, vérifier qu’une voix française est disponible et que le volume est activé. Si la voix n’est pas
encore chargée, toucher de nouveau « Réécouter ». Si aucun son français ne fonctionne, un message invite à faire activer
une voix française par un adulte, sans jamais afficher la réponse dans le message.

La qualité et la disponibilité de la voix dépendent du système et du navigateur. La voix locale est privilégiée ;
une voix fournie à distance par le navigateur peut nécessiter Internet. Le jeu n’envoie aucune donnée de progression.
Tester l’écoute sur l’appareil de l’enfant avant utilisation. Les tests automatisés vérifient les appels vocaux et leur
annulation avec une voix simulée ; ils ne valident pas la qualité audible des voix Safari/iPad.

Le vocabulaire est dans **`js/data/words.js`**, les règles dans `js/words/model.js`, le suivi dans `progress.js`, les voix
dans `voice.js`, l’interface dans `game.js`, le parcours partagé dans `journey.js` et les styles dans `css/words.css`. Aucun outil de compilation n’est nécessaire.
Pour ajouter un mot, ajouter par exemple à `WORDS` :

```js
word('fleur', 'fleur', 2, { audio: 'audio/mots/fleur.mp3' }),
```

`audio` est facultatif. Le MP3 doit contenir **la consigne entière**, par exemple « Trouve le mot… fleur ! »,
avec une voix française claire. Les enregistrements sont lus à vitesse 0,9 et sont prioritaires sur la synthèse.
Si un fichier ne peut pas être lu, le jeu essaie la voix française. Chaque nouvel appui annule la lecture précédente.
`speech` peut préciser une prononciation, comme « Léna » pour la carte « lena ». Les prénoms s’affichent en minuscules,
comme les autres cartes, pour cet exercice. Ajouter des niveaux dans `WORD_LEVELS` et les mots correspondants dans `WORDS`.
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
`npm run check` vérifie les 641 audios nécessaires et 18 870 tirages des cartes ; `npm test` couvre aussi la
présence de toutes les consonnes, le surlignage des nouveaux mots et les dix étapes vers le château.
