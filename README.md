# ⚽ Le Foot Quizz de la Fête

Un site de quiz sur le football : **près de 580 questions**, de la naissance du foot en 1863
jusqu'en 2026, réparties en 12 catégories (histoire, Coupe du monde, Ligue des champions,
Ballon d'Or, Équipe de France, clubs, légendes, règles, foot féminin…), dont des questions
à plusieurs bonnes réponses.

## Jouer

Aucune installation : ouvre simplement `index.html` dans ton navigateur.

Ou lance un petit serveur local :

```bash
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

## Fonctionnalités

- Choix du nombre de questions (10, 20, 50, 100 ou tout)
- Priorité aux questions jamais vues : on ne retombe pas sur les mêmes d'une partie à l'autre
- Questions à plusieurs bonnes réponses (à cocher, puis « Valider »)
- Sons : bonne réponse, mauvaise réponse, sifflet d'arbitre, clameur du public (désactivables)
- Filtre par catégorie
- Chrono de 20 secondes par question (désactivable)
- Score, série de bonnes réponses, explication après chaque question
- Récapitulatif des erreurs en fin de partie
- Meilleur score sauvegardé dans le navigateur
- Raccourcis clavier : `A`/`B`/`C`/`D` (ou `1`–`4`) pour répondre, `Entrée` pour continuer

## Ajouter des questions

Les questions sont dans `questions.js` et `questions-plus.js`. Chaque question suit ce format
(la bonne réponse en premier, l'ordre est mélangé à l'affichage) :

```js
["Catégorie", "La question ?", ["Bonne réponse", "Faux 1", "Faux 2", "Faux 3"], "Explication."],
```

Questions à plusieurs réponses, dans `questions-multi.js` :

```js
["Catégorie", "La question ?", ["Bonne 1", "Bonne 2"], ["Fausse 1", "Fausse 2"], "Explication."],
```
