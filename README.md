# ⚽ Quizz Foot

Un petit site de quiz sur le football : **150 questions** réparties en 11 catégories
(Coupe du monde, Ligue des champions, Ballon d'Or, Équipe de France, clubs, légendes,
règles du jeu, foot féminin…). Niveau : pas trop facile, pas trop dur.

## Jouer

Aucune installation : ouvre simplement `index.html` dans ton navigateur.

Ou lance un petit serveur local :

```bash
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

## Fonctionnalités

- Choix du nombre de questions (10, 20, 50 ou les 150)
- Filtre par catégorie
- Chrono de 20 secondes par question (désactivable)
- Score, série de bonnes réponses, explication après chaque question
- Récapitulatif des erreurs en fin de partie
- Meilleur score sauvegardé dans le navigateur
- Raccourcis clavier : `A`/`B`/`C`/`D` (ou `1`–`4`) pour répondre, `Entrée` pour continuer

## Ajouter des questions

Tout se passe dans `questions.js`. Chaque question suit ce format
(la bonne réponse en premier, l'ordre est mélangé à l'affichage) :

```js
["Catégorie", "La question ?", ["Bonne réponse", "Faux 1", "Faux 2", "Faux 3"], "Explication."],
```
