# Lettres, phonèmes et progrès locaux

L’aventure propose deux apprentissages distincts : les cinq activités existantes conservent les noms de lettres et
groupes de lettres ; **Les phonèmes** utilise des sons de parole, par exemple /m/, plutôt que le nom « èm ».
Les trois niveaux de mots restent disponibles. Cette version ajoute les phonèmes et leur révision ; les modules
de fusion syllabique et de lecture de phrases restent une étape future du parcours pédagogique.

## Premier parcours phonémique

`js/data/phonemes.js` définit 31 phonèmes ciblés, chacun avec un identifiant stable, une représentation IPA, une
écriture principale affichée sur les cartes, un niveau, deux mots d’exemple et deux références audio. Ce premier
inventaire n’est pas une couverture exhaustive de tous les phonèmes et variantes du français. En particulier,
les semi-voyelles et certaines distinctions régionales demandent encore des activités adaptées.

Les trois étapes proposent les premiers sons prolongeables, les consonnes occlusives, puis des voyelles proches,
les voyelles nasales et /ɲ/. Chaque voyage compte dix cristaux et garde le refuge au cinquième. Chaque étape
introduit au plus six nouveaux phonèmes à la fois ; les sons déjà rencontrés restent disponibles pour la révision.
Un son peut avoir plusieurs écritures : la carte affiche une écriture possible, pas une règle exclusive de décodage.
Deux cartes ne portent jamais la même écriture ou le même phonème dans une question.

Les prompts sont des MP3 livrés avec le site, sans synthèse vocale du navigateur. La narration française Piper,
le son isolé explicite eSpeak NG français et le mot d’exemple sont synthétisés séparément puis assemblés avec des
pauses. La table des noms de lettres n’intervient pas dans les phonèmes. Les occlusives utilisent une sortie vers
une pause, sans ajouter le nom de la lettre. Les sons trop courts à prolonger sont répétés ; leur volume est
équilibré avec la narration. La voix française et les modèles de génération restent ceux de l’outillage existant.

```bash
python3 tools/voice/build_phonemes.py --redo
# Pour refaire quelques contextes :
python3 tools/voice/build_phonemes.py --only 'P:m:0,P:m:1'
```

Le script utilise l’environnement Python Piper/Whisper déjà documenté dans README.md. Le site déployé ne contient
ni ces bibliothèques ni ces modèles. Le générateur habituel conserve les références phonémiques lors d’un nettoyage
et renvoie vers ce générateur spécialisé si elles manquent.

**Vérification pédagogique requise avant diffusion commerciale :** `audio/phoneme-review.json` conserve les entrées
phonémiques, la durée et la transcription des contextes. La reconnaissance vocale vérifie les mots d’exemple ; elle
ne certifie pas la justesse phonétique d’un son isolé. Faire écouter chaque son, particulièrement les occlusives et
les voyelles voisines, par un professionnel francophone de l’apprentissage de la lecture. Les MP3 peuvent être
remplacés par des enregistrements humains en gardant les références du fichier de données.

## Carnet et révision

`js/learning/mastery.js` conserve 89 compétences dans `licorne.mastery.v1` : 58 lettres/groupes et 31 phonèmes.
Les espaces de noms `letters:` et `phonemes:` sont indépendants : reconnaître le nom de M ne valide pas /m/.
Les mots continuent d’utiliser `licorne.words.v1`. Aucune donnée nominative, aucun compte ni serveur ne sont ajoutés.

Une seule première tentative indépendante est comptée par question et par voyage. Une erreur est enregistrée même
si le voyage est ensuite abandonné. Les questions rejouées après un retour au refuge ne comptent pas une seconde
fois. Pour un son, le statut « Bien reconnu » demande trois premières tentatives correctes de suite, au moins deux
voyages et deux mots d’exemple différents. Ce statut décrit l’association son/écriture réussie dans le jeu, pas une
évaluation clinique ou scolaire de l’enfant.

Les erreurs ont davantage de poids dans les voyages suivants. Les sons bien reconnus restent en rotation avec un
poids plus faible ; une révision revient après un délai croissant de 1, 3, 7 puis 14 jours. Le jeu ne montre aucun
compte à rebours ni échéance à l’enfant. Les cinq activités existantes utilisent aussi cette pondération une fois
qu’un historique de lettres est disponible, avec leurs règles de cartes et leur durée habituelles.

Depuis **Carnet des progrès**, sélectionner Phonèmes, Lettres et groupes, Mots ou Tous les apprentissages, puis
**Réinitialiser ces progrès**. La confirmation permet de garder les données en cas de toucher accidentel. Les cadeaux,
les tours de roue en attente et les mondes terminés sont conservés. Le bouton reste visible sur un téléphone de
320 × 568 ; seule la liste de compétences défile. Si le stockage est bloqué ou plein, la visite reste jouable et les
progrès peuvent être réinitialisés en mémoire.

## Direction artistique

Les sept mondes gardent leurs noms et leur progression. Les illustrations originales privilégient des paysages
calmes, des plans superposés, des feuillages organiques, des couleurs naturelles et une lumière douce, inspirés par
le sens de la nature et de l’émerveillement des dessins animés évoqués par le propriétaire. Aucun personnage ou décor
de film n’est repris. Chaque monde reçoit un repère distinct : moulin, arbre-maison, boutique de bonbons, phare,
palais de glace, pavillon des nuages ou porte des étoiles.

`js/prototype/scenery.js` fournit les couches et les plantes. Les textures SVG sont rasterisées à demi-résolution,
sans filtres lourds. Oiseaux et particules restent calmes pendant les questions et respectent la réduction d’animations.
Paillette a des réactions curieuse, encourageante et fière selon la découverte, l’erreur et la réussite.
`js/illustrations.js` remplace les emojis de l’interface principale et des récompenses par une série cohérente de SVG
indépendants de la plateforme. Les activités classiques de secours conservent leurs illustrations historiques.

## Vérifier et prévisualiser

```bash
npm test
npm run check
npm run lint
npm run dev
# Dans un second terminal, avec Playwright et Chromium :
python3 tools/test-learning-browser.py --screenshots /tmp/licorne-apprentissages
python3 tools/test-prototype-browser.py
python3 tools/test-checkpoints-browser.py
python3 tools/test-rainbow-browser.py
```

Ouvrir http://localhost:8080/, choisir Les phonèmes, puis une étape. Pour tester la remise à zéro, revenir au menu par
la pause et ouvrir le carnet. Les tests de navigateur vérifient les 62 MP3 avec le vrai décodeur audio, les trois
étapes, les retours au refuge, les resets sélectifs/globaux et les cadeaux préservés. Les voix des mots sont simulées
dans certains autres tests ; l’écoute et la fluidité sur de vrais iPad/Safari restent à vérifier sur ces appareils.
