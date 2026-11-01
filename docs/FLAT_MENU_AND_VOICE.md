# Chapitres et voix commune

L’accueil contient quatre tuiles disposées en 2×2 : **Les lettres**, **Les sons**, **Les mots**, **Les phrases**.
Les treize activités sont réparties dans ces chapitres (2, 3, 3 et 5). Le bouton « Les chapitres » revient à l’accueil ;
quitter une aventure revient au chapitre en cours. Les mots et les phrases gardent leurs niveaux de difficulté.
Le secours classique conserve ses huit activités de lettres, sons et mots.

La roue reste accessible et chaque voyage terminé donne un tour. Elle comporte deux cases chocolat, deux cases
bonbons, une case pour dix minutes de télé et une case pour une pièce dans la tirelire. Les gains précédents et
les tours disponibles sont conservés sans convertir les anciens cadeaux en nouvelles récompenses.

## Une seule narratrice

Les 194 mots ont des consignes MP3 complètes (« Trouve le mot, … ! ») dans la voix **Piper fr_FR-siwis-medium** déjà
utilisée pour les consonnes et sons. La hauteur reste 1,0 et la vitesse de génération 0,85. Aucun réglage de voix
française du système n’est nécessaire, et aucune synthèse vocale du navigateur n’est appelée.

Chaque mot de `js/data/words.js` a une clé `W:<id>`. Le manifeste associe cette clé à son enregistrement.
Le vocabulaire comprend 70 entrées au niveau 1, 64 au niveau 2 et 60 au niveau 3 : 50 ajouts par niveau,
des petits mots familiers aux mots plus longs et aux expressions. Les identifiants des mots existants sont conservés
pour garder les progrès enregistrés. Les nouveaux mots suivent la même introduction progressive.
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

Ouvrir http://localhost:8080/. Ouvrir « Les mots », puis choisir chacun des trois niveaux, utiliser Réécouter, revenir
par la pause et terminer un voyage pour vérifier la roue. Le test local ne modifie pas main.

```bash
npm test
npm run check
npm run lint
python3 tools/test-menu-browser.py --screenshots /tmp/licorne-menu
python3 tools/test-chapters-browser.py --screenshots /tmp/licorne-chapitres
python3 tools/test-word-lengths-browser.py --screenshots /tmp/licorne-word-lengths
python3 tools/test-prototype-browser.py
python3 tools/test-words-browser.py
```

Les tests de menu vérifient les quatre chapitres et les treize activités, sans carnet, les 194 MP3 avec le vrai
décodeur du navigateur, l’annulation des lectures et la roue. L’écoute et la fluidité sur un vrai iPad restent une
vérification manuelle.
Le test des longueurs rend les mots et expressions les plus longs dans les interfaces principale et classique,
sur téléphone, tablette et ordinateur, pour vérifier le texte et les zones tactiles.
