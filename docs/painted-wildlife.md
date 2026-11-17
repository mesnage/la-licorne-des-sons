# Faune animée des mondes peints

Cinq types d’animaux par monde, rencontrés à nouveau au fil du chemin.

| Monde | Animaux |
| --- | --- |
| Prairie | Lapin, hérisson, chevreuil, abeille, papillon |
| Forêt | Renard roux, écureuil roux, chouette hulotte, blaireau, cerf |
| Jungle | Éléphant d’Asie, tigre de Sumatra, gibbon, calao, tapir malais |
| Plage | Crabe, tortue marine, bécasseau, bernard-l’ermite, phoque |
| Glaces | Ours polaire, manchot empereur, renard arctique, morse, harfang |
| Nuages | Hirondelle, martinet, grue, albatros, aigle |
| Lune | Lapin lunaire, renard étoilé, chouette comète, papillon lunaire, dragon lunaire |
| Dinosaures | Brachiosaure, stégosaure, tricératops, parasaurolophus, tyrannosaure |
| Désert | Fennec, chameau, suricate, tortue du désert, gerboise |
| Royaume | Licorne, pégase, dragon féerique, phénix, jackalope |

La jungle suit une inspiration de forêt asiatique ([référence UNESCO sur Sumatra](https://whc.unesco.org/uploads/nominations/1167.pdf)). Les glaces réunissent volontairement les deux pôles pour conserver l’ours et le manchot demandés. Le désert et les dinosaures sont des assemblages de conte, pas des reconstitutions d’un lieu ou d’une époque précise. La lune et le royaume utilisent des créatures imaginaires.

`fauna-data.js` définit les espèces et les poses. `fauna.js` dessine les parties une fois, puis anime leurs articulations. Dix acteurs par scène sont recyclés hors écran, indépendamment de la longueur du parcours. Les animaux restent en retrait des pierres-réponses. La pause suspend leur horloge ; le mode de mouvement réduit conserve des poses fixes. Les anciens animaux décoratifs statiques ont été retirés.

Vérifications : tests des cinq espèces par monde, diversité des poses, coordonnées finies et stabilité du mouvement réduit ; suite du jeu et validation des contenus ; revue navigateur des dix habitats, format téléphone et pause/reprise.

Les échelles varient désormais fortement par espèce : petits insectes et rongeurs, oiseaux modestes, grands cerfs et dromadaires, éléphants et morses imposants. Le brachiosaure domine les autres dinosaures. Les tailles restent adaptées à la lisibilité du conte plutôt qu’à une échelle zoologique stricte. L’espacement et la marge de recyclage tiennent compte de la taille des silhouettes.
