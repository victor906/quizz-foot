// Liste des trophées.
// value(s, u) renvoie la progression à partir des statistiques du joueur (s) et des trophées déjà débloqués (u) ;
// le trophée est débloqué quand value >= goal.
// Niveaux : "bronze", "argent", "or", "legende", "ultime".
const TROPHIES = [
  // Bonnes réponses au total
  { id: "goals-10", icon: "⚽", name: "Premier but", desc: "10 bonnes réponses au total", tier: "bronze", goal: 10, value: (s) => s.correct },
  { id: "goals-50", icon: "🥅", name: "Buteur régulier", desc: "50 bonnes réponses au total", tier: "bronze", goal: 50, value: (s) => s.correct },
  { id: "goals-100", icon: "💯", name: "Centurion", desc: "100 bonnes réponses au total", tier: "argent", goal: 100, value: (s) => s.correct },
  { id: "goals-250", icon: "👟", name: "Soulier d'argent", desc: "250 bonnes réponses au total", tier: "argent", goal: 250, value: (s) => s.correct },
  { id: "goals-500", icon: "🥇", name: "Soulier d'or", desc: "500 bonnes réponses au total", tier: "or", goal: 500, value: (s) => s.correct },
  { id: "goals-1000", icon: "👑", name: "Légende vivante", desc: "1 000 bonnes réponses au total", tier: "legende", goal: 1000, value: (s) => s.correct },

  // Séries de bonnes réponses d'affilée
  { id: "streak-5", icon: "🔥", name: "Bien lancé", desc: "5 bonnes réponses d'affilée", tier: "bronze", goal: 5, value: (s) => s.bestStreak },
  { id: "streak-10", icon: "🔥", name: "Inarrêtable", desc: "10 bonnes réponses d'affilée", tier: "argent", goal: 10, value: (s) => s.bestStreak },
  { id: "streak-20", icon: "🛡️", name: "Invincible", desc: "20 bonnes réponses d'affilée", tier: "or", goal: 20, value: (s) => s.bestStreak },
  { id: "streak-49", icon: "🏹", name: "Les Invincibles", desc: "49 bonnes réponses d'affilée, comme la série d'Arsenal", tier: "legende", goal: 49, value: (s) => s.bestStreak },

  // Parties terminées
  { id: "games-1", icon: "🎬", name: "Coup d'envoi", desc: "Terminer une première partie", tier: "bronze", goal: 1, value: (s) => s.games },
  { id: "games-10", icon: "🎟️", name: "Habitué du stade", desc: "Terminer 10 parties", tier: "argent", goal: 10, value: (s) => s.games },
  { id: "games-50", icon: "🧣", name: "Supporter à vie", desc: "Terminer 50 parties", tier: "or", goal: 50, value: (s) => s.games },

  // Performances sur une partie
  { id: "perfect-10", icon: "🎯", name: "Sans-faute", desc: "Faire 100 % sur une partie d'au moins 10 questions", tier: "argent", goal: 1, value: (s) => s.perfect10 },
  { id: "perfect-20", icon: "🏆", name: "Ballon d'Or", desc: "Faire 100 % sur une partie d'au moins 20 questions", tier: "or", goal: 1, value: (s) => s.perfect20 },
  { id: "marathon", icon: "🏃", name: "Marathonien", desc: "Réussir au moins 80 % d'une partie de 50 questions ou plus", tier: "or", goal: 1, value: (s) => s.marathon },

  // Types de questions
  { id: "hard-10", icon: "🧠", name: "Tête bien faite", desc: "10 bonnes réponses à des questions difficiles", tier: "argent", goal: 10, value: (s) => s.hard },
  { id: "hard-50", icon: "🎓", name: "Expert", desc: "50 bonnes réponses à des questions difficiles", tier: "or", goal: 50, value: (s) => s.hard },
  { id: "multi-10", icon: "☑️", name: "Multi-tâche", desc: "10 questions à plusieurs réponses réussies", tier: "argent", goal: 10, value: (s) => s.multi },
  { id: "origins-10", icon: "📜", name: "Historien", desc: "10 bonnes réponses sur l'époque 1863-1929", tier: "argent", goal: 10, value: (s) => s.origins },

  // Modes de jeu
  { id: "fast-10", icon: "⚡", name: "Éclair", desc: "10 bonnes réponses en moins de 3 secondes (mode Chrono)", tier: "argent", goal: 10, value: (s) => s.fast },
  { id: "zen-5", icon: "😌", name: "Mode zen", desc: "Terminer 5 parties en mode Détente", tier: "bronze", goal: 5, value: (s) => s.zenGames },

  // Superfan CR7
  { id: "cr7-1", icon: "⭐", name: "Superfan", desc: "Terminer une partie en mode Superfan CR7", tier: "bronze", goal: 1, tip: "Lance une partie en mode Superfan et va jusqu'au bout, peu importe le score.", value: (s) => s.cr7Games },
  { id: "cr7-50", icon: "🙌", name: "Siuuu !", desc: "50 bonnes réponses en mode Superfan CR7", tier: "or", goal: 50, tip: "Les bonnes réponses s'additionnent d'une partie à l'autre.", value: (s) => s.cr7Correct },
  { id: "cr7-streak", icon: "7️⃣", name: "Le n°7", desc: "7 bonnes réponses d'affilée en mode Superfan CR7", tier: "argent", goal: 7, tip: "Enchaîne 7 bonnes réponses sans te tromper dans une partie Superfan.", value: (s) => s.cr7BestStreak },
  { id: "cr7-seen", icon: "📕", name: "Biographe", desc: "Découvrir toutes les questions du mode Superfan CR7", tier: "or", goal: 0, tip: "Une partie « Tout » en Superfan montre les 112 questions d'un coup.", value: (s) => s.cr7Seen },
  { id: "cr7-perfect", icon: "🐐", name: "Le GOAT", desc: "100 % sur une partie Superfan d'au moins 20 questions", tier: "legende", goal: 1, tip: "Astuce : mode Détente, 20 questions et difficulté « Facile » seulement.", value: (s) => s.cr7Perfect },
  { id: "cr7-ultime", icon: "🌟", name: "Trophée CR7 Ultime", desc: "Débloquer tous les autres trophées Superfan CR7 · récompense : 5 000 🪙 + avatar Tête de CR7", tier: "ultime", goal: 5, value: (s, u) => CR7_TROPHY_IDS.filter((id) => u[id]).length },

  // Découverte
  { id: "seen-100", icon: "🔎", name: "Curieux", desc: "Découvrir 100 questions différentes", tier: "bronze", goal: 100, value: (s) => s.everSeen },
  { id: "seen-300", icon: "📖", name: "Encyclopédie", desc: "Découvrir 300 questions différentes", tier: "argent", goal: 300, value: (s) => s.everSeen },
  { id: "seen-all", icon: "🌍", name: "Tour du monde", desc: "Découvrir toutes les questions du jeu", tier: "legende", goal: 0, value: (s) => s.everSeen },
];

// Trophées Superfan nécessaires pour le Trophée CR7 Ultime
const CR7_TROPHY_IDS = ["cr7-1", "cr7-50", "cr7-streak", "cr7-seen", "cr7-perfect"];

const TROPHY_TIERS = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  legende: "Légende",
  ultime: "Ultime",
};

// Trophées des nouveaux types de partie et de la boutique
TROPHIES.push(
  { id: "sudden-10", icon: "💀", name: "Sang-froid", desc: "10 bonnes réponses d'affilée en Mort subite", tier: "argent", goal: 10, value: (s) => s.suddenBest },
  { id: "sudden-25", icon: "🧊", name: "Nerfs d'acier", desc: "25 bonnes réponses d'affilée en Mort subite", tier: "or", goal: 25, value: (s) => s.suddenBest },
  { id: "rush-10", icon: "⏳", name: "Contre-attaque", desc: "10 bonnes réponses en une partie Contre-la-montre", tier: "bronze", goal: 10, value: (s) => s.rushBest },
  { id: "rush-20", icon: "🚀", name: "Vitesse lumière", desc: "20 bonnes réponses en une partie Contre-la-montre", tier: "or", goal: 20, value: (s) => s.rushBest },
  { id: "daily-3", icon: "📅", name: "Rendez-vous", desc: "Faire le Défi du jour 3 jours d'affilée", tier: "bronze", goal: 3, value: (s) => s.dailyBestStreak },
  { id: "daily-7", icon: "🗓️", name: "Fidèle au poste", desc: "Faire le Défi du jour 7 jours d'affilée", tier: "or", goal: 7, value: (s) => s.dailyBestStreak },
  { id: "party-1", icon: "🎉", name: "Ambianceur", desc: "Terminer une partie en mode Soirée", tier: "bronze", goal: 1, value: (s) => s.partyGames },
  { id: "review-10", icon: "📚", name: "Bosseur", desc: "Corriger 10 erreurs en mode Révision", tier: "argent", goal: 10, value: (s) => s.reviewFixed },
  { id: "kits-25", icon: "👕", name: "Styliste", desc: "25 maillots reconnus en mode Maillots", tier: "bronze", goal: 25, value: (s) => s.kitCorrect },
  { id: "kits-perfect", icon: "🦅", name: "Œil de lynx", desc: "100 % sur une partie Maillots d'au moins 10 questions", tier: "or", goal: 1, value: (s) => s.kitPerfect },
  { id: "geo-bull", icon: "📍", name: "Pile poil", desc: "Placer un club à moins de 25 km de son stade (Tour d'Europe)", tier: "bronze", goal: 1, value: (s) => s.geoBullseye },
  { id: "geo-6000", icon: "🧭", name: "Globe-trotter", desc: "Faire 6 000 points sur un Tour d'Europe", tier: "argent", goal: 6000, value: (s) => s.geoBest },
  { id: "geo-8500", icon: "🛰️", name: "GPS humain", desc: "Faire 8 500 points sur un Tour d'Europe", tier: "legende", goal: 8500, value: (s) => s.geoBest },
  { id: "geo-pays", icon: "🧭", name: "Géographe", desc: "10/10 au Pays mystère", tier: "or", goal: 1, value: (s) => s.geoCountryPerfect },
  { id: "world-8000", icon: "🌍", name: "Mondialiste", desc: "Faire 8 000 points sur la carte Coupe du monde", tier: "argent", goal: 8000, value: (s) => s.worldBest },
  { id: "derby-10", icon: "⚔️", name: "Chauffeur de tribune", desc: "Trouver 10 grands rivals en mode Derbys", tier: "bronze", goal: 10, value: (s) => s.derbyCorrect },
  { id: "whoami-5", icon: "🕵️", name: "Détective", desc: "Trouver 5 joueurs dès le premier indice (Qui suis-je ?)", tier: "argent", goal: 5, value: (s) => s.whoamiFirst },
  { id: "career-10", icon: "🧳", name: "Agent de joueurs", desc: "Reconnaître 10 parcours de joueurs", tier: "bronze", goal: 10, value: (s) => s.careerCorrect },
  { id: "names-25", icon: "✍️", name: "Carnet d'adresses", desc: "Trouver 25 prénoms (Trouve le prénom)", tier: "argent", goal: 25, value: (s) => s.namesCorrect },
  { id: "hilo-10", icon: "↕️", name: "Sixième sens", desc: "Série de 10 en Plus ou moins", tier: "argent", goal: 10, value: (s) => s.hiloBest },
  { id: "boss-5", icon: "🥳", name: "Fêtard en chef", desc: "Battre La Fête 5 fois", tier: "or", goal: 5, value: (s) => s.bossBeaten },
  { id: "duel-1", icon: "🤺", name: "Duelliste", desc: "Terminer un duel", tier: "bronze", goal: 1, value: (s) => s.duelGames },
  { id: "league-1", icon: "🏟️", name: "Saison bouclée", desc: "Terminer une saison de la Ligue entre potes", tier: "or", goal: 1, value: (s) => s.leagueSeasons },
  { id: "avatar-1", icon: "🎨", name: "Tailleur", desc: "Créer ton propre maillot", tier: "bronze", goal: 1, value: (s) => s.avatarMade },
  { id: "kit-buy", icon: "🛍️", name: "Collectionneur", desc: "Acheter un maillot collector", tier: "argent", goal: 1, value: (s) => s.kitsBought },
  { id: "shop-1", icon: "🛒", name: "Premier achat", desc: "Acheter un joker à la boutique", tier: "bronze", goal: 1, value: (s) => s.purchases },
  { id: "joker-10", icon: "🃏", name: "Joueur de cartes", desc: "Utiliser 10 jokers", tier: "argent", goal: 10, value: (s) => s.jokersUsed },
  // Cartes hors série (boutique)
  { id: "hs-1", icon: "🎴", name: "Hors série", desc: "Obtenir une première carte hors série", tier: "bronze", goal: 1, value: (s) => s.hsTotal },
  { id: "hs-items-10", icon: "🧰", name: "Vestiaire garni", desc: "Collectionner 10 cartes objets de match", tier: "argent", goal: 10, value: (s) => s.hsItems },
  { id: "hs-stades-3", icon: "🏟️", name: "Tour des stades", desc: "Collectionner 3 cartes stades", tier: "argent", goal: 3, value: (s) => s.hsStades },
  { id: "hs-week-5", icon: "⭐", name: "Fidèle du lundi", desc: "Collectionner 5 éditions de la semaine", tier: "argent", goal: 5, value: (s) => s.hsWeek },
  { id: "hs-clubs-3", icon: "📦", name: "Supporter multi-clubs", desc: "Acheter 3 packs supporter de club", tier: "argent", goal: 3, value: (s) => s.clubPacks },
  { id: "hs-items-all", icon: "🎒", name: "Tout le matériel", desc: "Collectionner les 18 cartes objets de match", tier: "or", goal: 18, value: (s) => s.hsItems },
  { id: "hs-stades-all", icon: "🗺️", name: "Groundhopper", desc: "Collectionner les 12 cartes stades", tier: "or", goal: 12, value: (s) => s.hsStades },
);

// Pièces gagnées à chaque trophée débloqué
const TROPHY_REWARD = { bronze: 25, argent: 60, or: 125, legende: 250, ultime: 5000 };

// Trophée secret : tous les autres trophées débloqués. Récompense : 10 000 pièces.
TROPHIES.push({ id: "secret-fete", icon: "👑", name: "Trophée La Fête Suprême", desc: "Débloquer absolument tous les autres trophées du jeu", tier: "secret", goal: 0, secret: true,
  value: (s, u) => TROPHIES.filter((t) => t.id !== "secret-fete" && u[t.id]).length });
TROPHY_TIERS.secret = "Secret";
TROPHY_REWARD.secret = 10000;
