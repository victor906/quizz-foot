# ⚽ Le Foot Quizz de la Fête

Un site de quiz sur le football : **644 questions**, de la naissance du foot en 1863
jusqu'en 2026, réparties en 15 catégories (histoire, Coupe du monde, Ligue des champions,
Ballon d'Or, Équipe de France, clubs, entraîneurs, stades, mercato, légendes, règles, foot féminin…), dont des questions
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
- Filtres par difficulté (facile, moyen, difficile) et par époque (1863-1929, 1930-1969, 1970-1999, 2000-2019, 2020-2026, toutes époques)
- Sons : bonne réponse, mauvaise réponse, sifflet d'arbitre, clameur du public
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
["Catégorie", "La question ?", ["Bonne réponse", "Faux 1", "Faux 2", "Faux 3"], "Explication.", "m", "C"],
```

Difficulté : `"f"` facile, `"m"` moyen, `"d"` difficile.
Époque : `"O"` 1863-1929, `"A"` 1930-1969, `"B"` 1970-1999, `"C"` 2000-2019, `"D"` 2020-2026, `"X"` toutes époques.

Questions à plusieurs réponses, dans `questions-multi.js` :

```js
["Catégorie", "La question ?", ["Bonne 1", "Bonne 2"], ["Fausse 1", "Fausse 2"], "Explication.", "m", "X"],
```
