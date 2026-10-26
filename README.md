# 🦄 La Licorne des Sons

Jeu de lecture en français pour les enfants de 4 à 7 ans. Paillette la licorne traverse 7 mondes en 20 étapes :
à chaque étape, l'enfant entend une lettre ou un son (« Trouve la lettre, M ! … Comme dans, moto ! ») et choisit
la bonne carte parmi trois. Une erreur fait glisser Paillette sur une peau de banane jusqu'au début du monde.

- 38 lettres et sons (voyelles, consonnes, ou / on / an…, sons experts eau / ain / ph / gn / ill), 200 mots illustrés ;
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
