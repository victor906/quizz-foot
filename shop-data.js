// Données de la boutique, de l'avatar et des modes de jeu (séparées de app.js pour l'alléger)
// ---------- Jokers ----------
const JOKERS = [
  { id: "fifty", icon: "🌓", label: "50/50", name: "50/50", desc: "Enlève 2 mauvaises réponses.", price: 50 },
  { id: "time", icon: "⏱️", label: "+10 s", name: "Temps bonus", desc: "Ajoute 10 secondes au chrono.", price: 35 },
  { id: "skip", icon: "⏭️", label: "Passe", name: "Passe", desc: "Remplace la question par une autre.", price: 60 },
];

const PALETTE = ["#f7f7f5", "#151515", "#d71920", "#14213d", "#1f4fb4", "#74b6e6", "#118a3e", "#ffd200", "#f47a1f", "#5b2b86", "#7a1f3d", "#ff7ac8", "#00b3a4", "#8d99ae"];

const BASE_PATTERNS = [["plain", "Uni"], ["stripes", "Rayures"], ["hoops", "Cerceaux"], ["halves", "Moitiés"], ["band", "Bande"], ["sash", "Écharpe"], ["diag", "Diagonale"], ["chevron", "Chevron"], ["chest", "Poitrine"]];

const COLLECTOR = [
  { id: "stars", name: "Étoiles", icon: "⭐", price: 200, desc: "Un maillot constellé d'étoiles." },
  { id: "confetti", name: "Confettis La Fête", icon: "🎉", price: 250, desc: "Le motif officiel de la fête." },
  { id: "rainbow", name: "Arc-en-ciel", icon: "🌈", price: 300, desc: "Toutes les couleurs à la fois." },
  { id: "gold", name: "Or massif", icon: "🥇", price: 600, desc: "Réservé aux légendes." },
];

// Maillots légendaires : couleurs, nom et numéro d'un joueur ou d'un moment mythique
const W = "#f7f7f5", GOLD = "#d4a017";
const LEGENDS = [
  { id: "zidane98", name: "Zidane 1998", desc: "Le 10 des deux têtes en finale.", price: 600, kit: { b: "#1d3a8f", p: "plain", c: W, t: "#d71920", sn: "Zidane", n: "10", nc: W, stars: 1 } },
  { id: "maradona86", name: "Maradona 1986", desc: "La main de Dieu et le but du siècle.", price: 600, kit: { b: W, p: "stripes", c: "#74b6e6", t: "#151515", sn: "Maradona", n: "10", nc: "#151515", stars: 2 } },
  { id: "pele70", name: "Pelé 1970", desc: "Le Roi et sa troisième étoile.", price: 600, kit: { b: "#ffd200", p: "plain", c: "#118a3e", t: "#118a3e", sn: "Pelé", n: "10", nc: "#118a3e", stars: 3 } },
  { id: "cr7", name: "CR7 Siuuu", desc: "Le numéro 7 le plus célèbre du monde.", price: 777, kit: { b: W, p: "plain", c: GOLD, t: GOLD, sn: "Ronaldo", n: "7", nc: GOLD } },
  { id: "messi22", name: "Messi Qatar 2022", desc: "Enfin la Coupe du monde.", price: 800, kit: { b: W, p: "stripes", c: "#74b6e6", t: GOLD, sn: "Messi", n: "10", nc: "#151515", stars: 3 } },
  { id: "cruyff74", name: "Cruyff 1974", desc: "Le football total en orange.", price: 500, kit: { b: "#f47a1f", p: "plain", c: "#151515", t: "#151515", sn: "Cruyff", n: "14", nc: "#151515" } },
  { id: "platini84", name: "Platini 1984", desc: "9 buts à l'Euro, record absolu.", price: 500, kit: { b: "#1d3a8f", p: "chest", c: W, c2: "#d71920", t: W, sn: "Platini", n: "10", nc: W } },
  { id: "papin91", name: "Papin OM 1991", desc: "Le roi des papinades, Ballon d'Or.", price: 450, kit: { b: W, p: "plain", c: "#74b6e6", t: "#74b6e6", sn: "Papin", n: "9", nc: "#3f8fd0" } },
  { id: "r9", name: "Ronaldo 2002", desc: "Il Fenomeno, doublé en finale.", price: 600, kit: { b: "#ffd200", p: "plain", c: "#118a3e", t: "#118a3e", sn: "Ronaldo", n: "9", nc: "#1f4fb4", stars: 5 } },
  { id: "vanbasten88", name: "Van Basten 1988", desc: "La volée impossible en finale.", price: 500, kit: { b: "#f47a1f", p: "plain", c: W, t: W, sn: "Van Basten", n: "12", nc: W } },
  { id: "henry04", name: "Henry 2004", desc: "Les Invincibles, 49 matchs sans défaite.", price: 550, kit: { b: "#d71920", p: "plain", c: W, s: W, t: W, sn: "Henry", n: "14", nc: W } },
  { id: "gerrard05", name: "Gerrard 2005", desc: "Le miracle d'Istanbul.", price: 500, kit: { b: "#d71920", p: "plain", c: W, t: W, sn: "Gerrard", n: "8", nc: W } },
  { id: "drogba12", name: "Drogba 2012", desc: "La tête puis le tir au but décisif.", price: 500, kit: { b: "#034694", p: "plain", c: W, t: W, sn: "Drogba", n: "11", nc: W } },
  { id: "kaiser74", name: "Beckenbauer 1974", desc: "Le Kaiser champion du monde.", price: 500, kit: { b: W, p: "plain", c: "#151515", t: "#151515", sn: "Kaiser", n: "5", nc: "#151515", stars: 1 } },
  { id: "zizou02", name: "Zidane 2002", desc: "La volée de Glasgow.", price: 600, kit: { b: W, p: "plain", c: GOLD, t: GOLD, sn: "Zidane", n: "5", nc: GOLD } },
  { id: "mbappe18", name: "Mbappé 2018", desc: "La deuxième étoile à 19 ans.", price: 650, kit: { b: "#14213d", p: "plain", c: W, t: "#d71920", sn: "Mbappé", n: "10", nc: W, stars: 2 } },
  { id: "baggio94", name: "Baggio 1994", desc: "Le Divin Codino.", price: 450, kit: { b: "#1f6fd1", p: "plain", c: W, t: W, sn: "Baggio", n: "10", nc: W, stars: 3 } },
  { id: "ballondor", name: "Ballon d'Or", desc: "Le maillot de la légende ultime.", price: 1500, kit: { b: "#d4a017", p: "gold", c: "#151515", t: "#151515", sn: "Légende", n: "1", nc: "#151515" } },
  { id: "lafete", name: "La Fête", desc: "Le maillot du patron de la fête.", price: 999, kit: { b: "#ff2d95", p: "confetti", c: "#ffd23f", t: "#ffd23f", sn: "La Fête", n: "99", nc: "#fff" } },
];

// Célébrations : la pluie de fin de partie
const CELEBS = [
  { id: "balls", name: "Pluie de ballons", icon: "⚽", chars: ["⚽"], price: 150 },
  { id: "stars", name: "Pluie d'étoiles", icon: "⭐", chars: ["⭐", "🌟", "✨"], price: 150 },
  { id: "goats", name: "Pluie de chèvres", icon: "🐐", chars: ["🐐"], price: 250 },
  { id: "cups", name: "Pluie de coupes", icon: "🏆", chars: ["🏆", "🥇"], price: 250 },
  { id: "party", name: "Méga fête", icon: "🥳", chars: ["🥳", "🎉", "🎊", "🍾"], price: 300 },
];

const BONUS_ITEMS = [
  { id: "pack", icon: "🎁", name: "Pack trio", desc: "Un exemplaire de chaque joker.", price: 120, give: { fifty: 1, time: 1, skip: 1 } },
  { id: "mega", icon: "📦", name: "Méga pack", desc: "5 exemplaires de chaque joker.", price: 500, give: { fifty: 5, time: 5, skip: 5 } },
  { id: "life", icon: "❤️", name: "Seconde chance", desc: "En Mort subite et Plus ou moins, annule ta première erreur. Utilisée automatiquement.", price: 80, give: { life: 1 } },
  { id: "boost", icon: "🚀", name: "Pièces x2", desc: "Tes 3 prochaines parties rapportent deux fois plus de pièces.", price: 200 },
];

const GEO_INFO = {
  europe: "🇪🇺 10 clubs à placer sur la carte d'Europe. Plus ton épingle est proche du stade, plus tu marques (1 000 pts max par club). Un doigt pour déplacer la carte, deux doigts pour zoomer.",
  france: "🇫🇷 Tour de France : 10 clubs de Ligue 1 et Ligue 2 à placer sur la carte de France. Plus tu es précis, plus tu marques.",
  pays: "🧭 Pays mystère : on te donne un club, touche son pays sur la carte. 1 000 pts par bonne réponse.",
  monde: "🌍 Coupe du monde : pays organisateurs et origines des stars, sur la carte du monde. Zoome à deux doigts pour les petits pays !",
};

const PLAY_INFO = {
  classic: "🎯 Le quiz classique : choisis ton thème, le nombre de questions et la difficulté.",
  sudden: "💀 Toutes les questions de ta sélection, jusqu'à la première erreur. Combien de bonnes réponses d'affilée ?",
  rush: "⏳ 60 secondes au total. Bonne réponse : <b>+2 s</b>. Erreur : <b>−3 s</b>. Pas de temps limite par question.",
  daily: "",
  kits: "👕 Un maillot, quatre clubs… ou l'inverse ! Une quarantaine de maillots bien reconnaissables, aux couleurs de leur tenue domicile. Le drapeau du pays t'aide un peu.",
  geo: "",
  derby: "⚔️ On te donne un club, trouve son grand rival ! La carte te montre ensuite le derby.",
  whoami: "🕵️ Des indices s'affichent un par un. Trouve le joueur le plus tôt possible : moins d'indices = plus de pièces (jusqu'à +12 🪙).",
  career: "🧳 Une suite de clubs, un seul joueur. Qui a eu ce parcours ?",
  names: "✍️ On te donne le nom de famille d'un joueur (des années 80 à aujourd'hui), écris son prénom ! Pas de panique pour l'orthographe : accents et petites fautes sont acceptés.",
  hilo: "↕️ Qui a le plus de titres, de Ballons d'Or, quel club est le plus ancien… Une nouvelle comparaison à chaque manche. Une erreur et c'est fini !",
  boss: "",
  duel: "🤺 Posez le téléphone à plat entre vous deux. Chacun a ses boutons de son côté : le premier qui trouve la bonne réponse marque le point. Une erreur et tu es bloqué pour la question !",
  party: "🎉 Passez-vous le téléphone ! Chacun répond à son tour, le meilleur score gagne. (Sans jokers ni pièces.)",
  review: "",
};

const MODE_CARDS = [
  { group: "Quiz", items: [
    ["classic", "🎯", "Classique", "Le quiz habituel, avec filtres", "#1fa85a"],
    ["sudden", "💀", "Mort subite", "Une erreur et c'est fini", "#3a3a3a"],
    ["rush", "⏳", "Contre-la-montre", "60 secondes chrono", "#e0453a"],
    ["daily", "📅", "Défi du jour", "10 questions, zéro erreur, 1 essai par jour", "#2f7de1"],
    ["boss", "🥳", "Battre La Fête", "Elle a 76 % de réussite", "#ff2d95"],
    ["review", "📚", "Révision", "Rejoue tes erreurs", "#7a5af8"],
  ] },
  { group: "Jeux foot", items: [
    ["kits", "👕", "Maillots", "Reconnais les clubs", "#d71920"],
    ["geo", "🗺️", "Cartes", "Europe, France, monde", "#0d6e9e"],
    ["derby", "⚔️", "Derbys", "Trouve le grand rival", "#b8860b"],
    ["whoami", "🕵️", "Qui suis-je ?", "Indice après indice", "#5b2b86"],
    ["career", "🧳", "Parcours", "Devine le joueur", "#0f6b34"],
    ["names", "✍️", "Trouve le prénom", "Écris le prénom du joueur", "#f47a1f"],
    ["hilo", "↕️", "Plus ou moins", "Lequel a le plus ?", "#00a19a"],
  ] },
  { group: "À plusieurs", items: [
    ["party", "🎉", "Soirée", "2 à 6 joueurs, avec ligue", "#ff7a00"],
    ["duel", "🤺", "Duel", "Face à face sur un téléphone", "#14213d"],
  ] },
];
