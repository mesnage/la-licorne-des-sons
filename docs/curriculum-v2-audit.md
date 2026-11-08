# Refonte du parcours de lecture · Audit de départ

Branche de travail `feature/curriculum-v2`, créée depuis `origin/main` après mise à jour de la référence distante. Référence auditée `18191956d7e7fb30b07e493e96f3d66d4be7db15`. Le checkout initial sur `main` conserve ses fichiers de travail non suivis dans `tools/voice/`.

Les pièces jointes lues sont `La_Licorne_Cahier_des_Charges.md`, `La_Licorne_Instructions_Codex.md` et `programme_licorne_56_unites.json`. Leurs noms diffèrent de certains noms de référence dans le cahier. Le catalogue reçu a pour SHA-256 `89afc737f1f728b2aa250126df65a616d2fd190d6d4094ba066942df73342e26`.

## Vérifications de référence

| Commande | Résultat sur Node 20.12.2 |
|---|---|
| `npm test` | 71 tests réussis dans 9 suites de fichiers. |
| `npm run check` | Réussi. 58 graphèmes, 495 mots illustrés, 1 141 clés audio et 18 870 tirages contrôlés. |
| `npm run lint` | Réussi. Deux avertissements existants sur les imports inutilisés `chooseTarget` et `practiceWeight` dans `tools/words.test.mjs`. |

La CI exécute les trois contrôles. La référence ci-dessus est automatisée. Les essais sur Safari iOS réel et la revue humaine des enregistrements pour le nouvel usage restent à faire.

## Points d’intégration

| Composant actuel | Intégration V2 |
|---|---|
| `index.html` → `js/prototype/boot.js` → `js/prototype/app.js` | Le menu Phaser expose quatre chapitres thématiques et quatorze activités. Le parcours V2 aura sa propre navigation. Garder ces activités dans le mode libre Phaser. `classic.html` est le secours historique avec un sous-ensemble d’activités et charge encore une police depuis Google Fonts. |
| `js/prototype/model.js`, `js/prototype/world.js`, `assets/storybook/` | Réutiliser la scène, les sept décors, Paillette et les styles. Isoler la règle des 20 questions vers un château de la logique actuelle des mondes de 10 cristaux et des refuges à 5. La suite actuelle attend le recul après erreur dans l’aventure libre. |
| `js/data/sounds.js`, `phonemes.js`, `words.js`, `sentences.js` | Banque à inventorier. Les niveaux existants et les fiches illustrées n’encodent pas les prérequis de décodage. Garder des lexiques oral et écrit distincts, annoter les stimuli écrits et leurs exceptions, et valider les distracteurs. Les consignes de lettres existantes peuvent utiliser des noms de lettres, là où la V2 demande des phonèmes. |
| `js/learning/mastery.js`, `js/words/progress.js`, `js/reward-store.js` | La maîtrise actuelle porte notamment sur la reconnaissance de lettres. Mots, phonèmes, phrases, coquilles, mondes et récompenses ont des sauvegardes séparées. Prévoir un espace V2 distinct pour la reprise exacte et une migration prudente. Distinguer premier essai, correction et avance narrative. |
| `js/audio.js`, `audio/manifest.json` | Réutiliser le déverrouillage Web Audio et la lecture locale. Le manifeste actuel associe une clé à un chemin sans métadonnées éditoriales. Ajouter la résolution par voix et contrôler le repli et l’absence de modèle audio prématuré. Le dépôt n’a pas de service worker pour garantir une reprise hors connexion. |

Certaines notes dans `README.md` et `CLAUDE.md` décrivent des états antérieurs. Les entrées, les données et les tests actuels font foi pour la référence technique. Le parcours V2 devra conserver ses ressources à la même origine pour permettre une politique sans appels à des tiers.

## Catalogue et pilote

Les 4 chapitres comptent respectivement 12, 14, 18 et 12 unités. Le fichier contient 56 IDs d’unité et 224 IDs de bloc uniques. Chaque unité comporte quatre blocs et chaque bloc prévoit cinq questions, soit 1 120 emplacements. Le prérequis de chaque unité après la première est l’unité précédente. Le catalogue définit 25 gabarits, dont 11 sont utilisés dans le pilote `C1-U01` à `C1-U08`. Les blocs décrivent un type et un objectif. Les items, distracteurs et preuves de validation seront versionnés séparément. Les unités sont marquées comme brouillons à auditer.

L’inventaire de référence compte 1 141 MP3 pour 1 141 chemins du manifeste, sans fichier manquant ni fichier orphelin. Il contient 36 clés `P:robin:…`, dont les dix phonèmes cibles du pilote (A, I, É, O, U, OU, F, V, S, L). Les voix `voice_b` et `voice_c` n’ont pas de pistes identifiées dans le manifeste. Les enregistrements actuels couvrent des usages différents. Les clés `w:`, `W:` et `P:` doivent rester distinctes lors de la réutilisation.

| Bloc | Couverture vérifiée par clé | Travail éditorial |
|---|---|---|
| `C1-U08-B1` | Lune, lapin, livre et moto ont une piste `W:`. Vélo a une piste `w:` seulement. | Écouter les cinq pistes et vérifier qu’elles conviennent à une tâche d’identification du phonème initial. |
| `C1-U08-B2` | Une clé `P:robin:l` existe. | Vérifier les cinq émissions prévues et la pertinence des distracteurs. |
| `C1-U08-B3` | LA a une piste `W:la`. LI, LO, LU et LÉ n’ont pas de clé `W:` ou `w:` correspondante. | Vérifier que la piste de LA convient à la fusion, recenser les pistes nécessaires aux autres stimuli et écouter les réalisations. |
| `C1-U08-B4` | FIL et FOU ont une piste `W:`. SALÉ, LAVÉ et VU n’ont pas de clé `W:` ou `w:` correspondante. | Vérifier les cinq mots, notamment S initial dans SALÉ et L final prononcé dans FIL. Auditer les pistes et les distracteurs avant publication. |

Trois points à résoudre avant de valider le pilote et sa suite.

- **Compréhension orale dès le départ.** Les blocs de vocabulaire et de compréhension orale sont concentrés dans C4, derrière des prérequis de lecture. Prévoir un accès séparé de la progression de décodage en gardant les IDs du catalogue.
- **Réponse en lecture autonome.** Les gabarits audio demandent de choisir une prononciation. Le cahier demande aussi de ne révéler la prononciation qu’à la sélection ou à la correction. Fixer le moment où les options deviennent audibles et la manière de recueillir un premier essai qui mesure le décodage.
- **Prérequis et publication.** FIL apparaît en C1 alors que le travail explicite des syllabes fermées est en C2. Vérifier le rôle de cette compétence dans les prérequis de C1-U08-B4 et la faisabilité de cinq mots en C1-U06-B4. Laisser les blocs incomplets en brouillon jusqu’à la revue linguistique, sans substitution automatique.

L’audit pédagogique de la progression s’appuiera sur la synthèse du CSEN et les programmes de maternelle et de CP. Le format du jeu et les seuils de réussite relèvent des choix de conception. [Synthèse du CSEN](https://www.csen.education.gouv.fr/wp-content/uploads/2025/03/429f5c3c-fc06-4416-801b-e81fa20f0e84-CSENSyntheseApprendre-a-lire.pdf) · [Bulletin officiel des cycles 1 et 2](https://www.education.gouv.fr/bo/2024/Hebdo41/MENE2415135A)

## Découpage proposé pour les PRs

| Lot | Livrable et vérification |
|---|---|
| 0 | Audit et référence vérifiée dans la branche dédiée. |
| 1 | Importer le catalogue en brouillon, valider IDs, ordre et dépendances. Monter la navigation chapitre, unité, bloc en réutilisant le style illustré. Tester sur mobile et conserver l’accès au jeu libre. |
| 2 | Définir les banques du pilote et le contrôle de décodabilité. Tester segmentation, prérequis, lettres muettes, contextes et rejets. |
| 3 | Brancher les gabarits nécessaires aux huit unités du pilote. Tester l’homogénéité des blocs, les cinq stimuli distincts, l’audio et les corrections. |
| 4 | Ajouter la session reprenable, la graine, les sauvegardes V2, le déblocage, la reprise et le suivi séparé de la maîtrise. Tester les interruptions et les sauvegardes historiques. |
| 5 | Intégrer le voyage de Paillette et le château. Tester mobile, tablette, clavier et réduction des animations. |
| 6 | Introduire le routage des voix et un rapport de couverture. Tester les replis, la lecture locale et Safari iOS. |
| 7 | Étendre le corpus par lots à partir du pilote. Auditer tous les blocs avant publication, puis assembler la traçabilité et les résultats de la revue finale. |


## Première version jouable

Le périmètre du pilote technique se limite à `C1-U01`. Les quatre blocs reprennent les objectifs du catalogue. Le corpus oral associe vingt mots cibles et dix options sonores à des pistes existantes. Pour le bloc d’appariement, l’enfant compare des mots entiers qui partagent leur première syllabe. Les formes écrites des stimuli restent dans les données et sont absentes de l’écran de jeu. Les annotations et l’usage des clips restent à faire valider par les personnes prévues au cahier des charges.

La reprise est enregistrée sous `licorne.curriculum.pilot.v1`. Elle conserve l’ordre des options, les erreurs, les marques de segmentation et les cristaux. Les scores au premier essai sont affichés séparément de la progression jusqu’au château. Le pilote n’utilise que les enregistrements présents dans le manifeste. L’inventaire des voix et du matériel manquant pour `C1-U02` à `C1-U08` reste à compléter.

### Préparation de C1-U02 · Les voyelles A et I

| Bloc | Matériel repéré | À vérifier avant ouverture |
|---|---|---|
| B1 · Sons initiaux | Abeille, avion, arbre pour /a/. Image et île pour /i/. Les cinq clés `W:` existent. | Écouter les cinq pistes et confirmer le contraste à l’attaque. |
| B2 · Du son à la lettre | `P:robin:a` et `P:robin:i` donnent les deux modèles isolés. | Préparer cinq présentations distinctes en gardant la même consigne et une voix de référence cohérente. |
| B3 · De la lettre au son | Les deux modèles isolés peuvent servir d’options audio. | Définir cinq cartes distinctes où l’enfant identifie A ou I sans devoir lire de graphèmes encore inconnus. |
| B4 · Nouveaux mots oraux | Alligator, ami et avocat pour /a/. Histoire et hiver pour /i/. Les cinq clés `W:` existent. Hippopotame peut servir de réserve orale. | Vérifier les prononciations et l’homogénéité des enregistrements. |

Pour les blocs d’écoute, le début de la graphie peut différer du premier phonème. Histoire et hiver commencent oralement par /i/. Incroyable commence par une voyelle nasale. L’inventaire ci-dessus vérifie la présence des fichiers. La validation des stimuli et la préparation des blocs B2 et B3 restent à faire.


## Chapitre 1 jouable

Les douze unités du chapitre « Les premiers sons » proposent 48 blocs de cinq questions. Le jeu réutilise le moteur de déplacement de Paillette, avec des jalons tous les cinq cristaux. Il mémorise la progression par unité et conserve la sauvegarde existante de C1-U01. La dernière unité ouvre le bilan du chapitre. Les trois autres chapitres restent consultables.

Le registre audio dédié contient 200 pistes locales générées hors ligne avec Piper fr_FR-siwis-medium, dont des consignes, des mots oraux sans préambule et des formes de lecture avec une prononciation explicite. Le moteur réutilise les phonèmes isolés de Robin. Les variations entre ces deux sources servent au prototype. La variation contrôlée à trois voix reste à mettre en place. Le format, les empreintes et les transcriptions phonétiques peuvent être contrôlés automatiquement. La validation humaine des prononciations, des consignes et des distracteurs reste requise avant publication.

La banque écrite indique les graphèmes de chaque forme et les compare aux correspondances enseignées. Elle maintient les cinq candidats demandés pour C1-U08-B4 (FIL, SALÉ, LAVÉ, FOU, VU). Le L final prononcé dans FIL utilise la correspondance déjà présentée dans l’unité. Le S de SALÉ reste en position initiale. Le bloc de lecture après F propose aussi des syllabes où F termine la syllabe, afin de varier les combinaisons à réinvestir. Les options sonores de lecture s’ouvrent après l’action « J’ai lu ». L’exercice mesure un choix parmi des prononciations. Il ne certifie pas la production orale autonome de l’enfant.

Les pistes de cette version portent le statut `pending_human_review`. Leur disponibilité pour un essai local n’équivaut pas à une validation éditoriale du chapitre. Safari iOS réel et les essais avec des enfants restent à vérifier.


## Parcours complet pour les essais locaux

Les quatre chapitres sont reliés dans l’ordre du catalogue. Les 56 unités comptent 224 blocs et 1 120 questions. Le dernier château d’un chapitre ouvre le suivant. Les sauvegardes existantes des unités de C1 sont reprises. Les phrases à remettre en ordre conservent aussi les mots déjà placés quand on quitte la page.

Les chapitres 2 et 3 utilisent des formes écrites segmentées à la main. Les exercices vérifient les correspondances disponibles et les principaux contextes de C, G, GU et des finales. Les distracteurs des exercices de lecture audio sont distincts par leur prononciation. Les blocs de compréhension du chapitre 4 utilisent des scènes en pictogrammes, des phrases à ordonner et des questions sur les récits. Certains textes servent à plusieurs tâches d’une même unité et les blocs de transfert ciblés utilisent un second corpus. Les cinq phrases de transfert de C4-U03 sont explicitement segmentées. Les phrases avancées et la lisibilité des pictogrammes restent à revoir avec un enseignant.

Les audios des quatre chapitres sont locaux. Les registres par chapitre identifient les pistes Piper et leur statut de revue. Les phonèmes isolés de Robin servent toujours de référence lorsqu’ils existent. Les validations automatisées couvrent la structure, les enregistrements référencés, le déverrouillage et la jouabilité. L’écoute humaine, la validation pédagogique, la variation à trois voix et les essais Safari iOS restent nécessaires pour une publication.


## Composition simplifiée

Les 56 unités, leurs prérequis et les quatre blocs de cinq questions sont conservés. Chaque unité utilise un seul type d’exercice et une consigne identique sur ses quatre blocs. La première unité propose vingt mots distincts et deux nombres au choix à chaque question. Les autres unités puisent dans leur corpus et certains exemples reviennent entre les blocs. Les exercices de décodage présentent une seule carte avec un bouton pour écouter les deux choix de prononciation.

Le catalogue d’origine reste la référence des objectifs et du corpus source. Les types et les consignes du parcours joué sont définis dans `js/data/curriculum-simple.js`. Les unités déjà terminées sont conservées. Une ancienne partie interrompue reprend au début de son unité, car ses réponses ne correspondent plus aux nouvelles questions.
