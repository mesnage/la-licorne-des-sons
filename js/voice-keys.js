/* La Licorne des Sons — clés des phrases enregistrées */
// Chaque phrase dite par le jeu est un fichier audio (dossier audio/, voir audio/manifest.json).
// N(texte) = la narratrice, U(texte) = Paillette (voix plus aiguë).
// Après avoir ajouté ou modifié une phrase N(...) / U(...), lancez : python3 tools/voice/build_voice.py
export const N = t => 'n:' + t;
export const U = t => 'u:' + t;
