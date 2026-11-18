/* La Licorne des Sons — clés des phrases enregistrées */
// Chaque phrase dite par le jeu est un fichier audio (dossier audio/, voir audio/manifest.json).
// N(texte) et U(texte) partagent les enregistrements de Robin.
// Toute nouvelle phrase doit utiliser Robin (ElevenLabs), avec provenance et écoute de contrôle.
export const N = t => 'n:' + t;
export const U = t => 'u:' + t;
