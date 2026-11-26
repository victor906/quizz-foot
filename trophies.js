// Liste des trophées.
// value(s) renvoie la progression à partir des statistiques du joueur ; le trophée est débloqué quand value >= goal.
// Niveaux : "bronze", "argent", "or", "legende".
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
  { id: "full", icon: "📚", name: "Jusqu'au bout", desc: "Terminer une partie « Tout » sans abandonner", tier: "legende", goal: 1, value: (s) => s.fullGames },

  // Types de questions
  { id: "hard-10", icon: "🧠", name: "Tête bien faite", desc: "10 bonnes réponses à des questions difficiles", tier: "argent", goal: 10, value: (s) => s.hard },
  { id: "hard-50", icon: "🎓", name: "Expert", desc: "50 bonnes réponses à des questions difficiles", tier: "or", goal: 50, value: (s) => s.hard },
  { id: "multi-10", icon: "☑️", name: "Multi-tâche", desc: "10 questions à plusieurs réponses réussies", tier: "argent", goal: 10, value: (s) => s.multi },
  { id: "origins-10", icon: "📜", name: "Historien", desc: "10 bonnes réponses sur l'époque 1863-1929", tier: "argent", goal: 10, value: (s) => s.origins },

  // Modes de jeu
  { id: "fast-10", icon: "⚡", name: "Éclair", desc: "10 bonnes réponses en moins de 3 secondes (mode Chrono)", tier: "argent", goal: 10, value: (s) => s.fast },
  { id: "zen-5", icon: "😌", name: "Mode zen", desc: "Terminer 5 parties en mode Détente", tier: "bronze", goal: 5, value: (s) => s.zenGames },

  // Superfan CR7
  { id: "cr7-1", icon: "🐐", name: "Superfan", desc: "Terminer une partie en mode Superfan CR7", tier: "bronze", goal: 1, value: (s) => s.cr7Games },
  { id: "cr7-50", icon: "🙌", name: "Siuuu !", desc: "50 bonnes réponses en mode Superfan CR7", tier: "or", goal: 50, value: (s) => s.cr7Correct },
  { id: "cr7-perfect", icon: "7️⃣", name: "Le GOAT", desc: "100 % sur une partie Superfan d'au moins 20 questions", tier: "legende", goal: 1, value: (s) => s.cr7Perfect },

  // Découverte
  { id: "seen-100", icon: "🔎", name: "Curieux", desc: "Découvrir 100 questions différentes", tier: "bronze", goal: 100, value: (s) => s.everSeen },
  { id: "seen-300", icon: "📖", name: "Encyclopédie", desc: "Découvrir 300 questions différentes", tier: "argent", goal: 300, value: (s) => s.everSeen },
  { id: "seen-all", icon: "🌍", name: "Tour du monde", desc: "Découvrir toutes les questions du jeu", tier: "legende", goal: 0, value: (s) => s.everSeen },
];

const TROPHY_TIERS = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  legende: "Légende",
};
