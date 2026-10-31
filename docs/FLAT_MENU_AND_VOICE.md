# Menu direct et voix commune

Le menu principal affiche les cinq activités de lettres/sons et les trois niveaux de **Trouve le mot !** au même
niveau. Un toucher sur une carte de mots lance directement ce niveau. Le retour depuis une partie ou une victoire
revient à ce menu. Les activités classiques de secours proposent les mêmes choix directs.

La roue reste accessible et chaque voyage terminé donne toujours un tour. Les compteurs de cadeaux du jour, les
mondes terminés, les refuges et les sept décors sont conservés. Le carnet des progrès, ses contrôles et les activités
phonémiques ont été retirés. Les fichiers de ces activités et leurs outils de génération ont également été supprimés.
Les historiques de pratique des lettres et des mots continuent d’aider les révisions en arrière-plan.

## Une seule narratrice

Les 44 mots ont des consignes MP3 complètes (« Trouve le mot, … ! ») dans la voix **Piper fr_FR-siwis-medium** déjà
utilisée pour les consonnes et sons. La hauteur reste 1,0 et la vitesse de génération 0,85. Aucun réglage de voix
française du système n’est nécessaire, et aucune synthèse vocale du navigateur n’est appelée.

Chaque mot de `js/data/words.js` a une clé `W:<id>`. Le manifeste associe cette clé à son enregistrement.
Le générateur habituel crée les consignes manquantes et les vérifie avec la reconnaissance vocale française.
Pour un enregistrement humain, remplacer le fichier correspondant en gardant sa clé. Une consigne personnalisée
doit inclure le mot entier et sa consigne, sans changer la hauteur lors de la lecture.

Le même moteur Web Audio charge et joue les lettres, sons et mots. Réécouter, quitter, mettre en pause ou changer
d’activité annule la lecture précédente, y compris si son téléchargement n’est pas terminé. Un échec donne un message
générique de connexion/volume avec Réécouter, sans révéler la cible ni changer de voix.

## Prévisualiser et vérifier

```bash
cd ~/la-licorne-des-sons
git fetch origin
git switch prototype/immersive-worlds
git pull --ff-only
npm run dev
```

Ouvrir http://localhost:8080/. Choisir directement chacun des trois niveaux de mots, utiliser Réécouter, revenir
par la pause et terminer un voyage pour vérifier la roue. Le test local ne modifie pas main.

```bash
npm test
npm run check
npm run lint
python3 tools/test-menu-browser.py --screenshots /tmp/licorne-menu
python3 tools/test-prototype-browser.py
python3 tools/test-words-browser.py
```

Les tests de menu vérifient les huit choix directs, l’absence de sous-menu et de carnet, les 44 MP3 avec le vrai
décodeur du navigateur, l’annulation des lectures et la roue. L’écoute et la fluidité sur un vrai iPad restent une
vérification manuelle.
