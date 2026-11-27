// Cartes à collectionner : un joueur légendaire par trophée.
// Rareté liée au niveau du trophée : bronze → commune, argent → rare, or → épique, légende → légendaire, ultime/secret → mythique.
// [trophée, nom, drapeau, poste, note, maillot { b, p, c, s, n, sn }, anecdote]
const CARD_RARITY = {
  bronze: { id: "commune", label: "Commune", gem: "●" },
  argent: { id: "rare", label: "Rare", gem: "◆" },
  or: { id: "epique", label: "Épique", gem: "★" },
  legende: { id: "legendaire", label: "Légendaire", gem: "✦" },
  ultime: { id: "mythique", label: "Mythique", gem: "♛" },
  secret: { id: "mythique", label: "Mythique", gem: "♛" },
};
const CK = { w: "#f7f7f5", k: "#151515", r: "#d71920", bl: "#1d3a8f", nv: "#14213d", y: "#ffd200", g: "#118a3e", sky: "#74b6e6", o: "#f47a1f", ch: "#034694", cl: "#7a1f3d" };
const CARDS_RAW = [
  // ---- Communes (trophées bronze)
  ["goals-10", "Jean-Pierre Papin", "🇫🇷", "ATT", 86, { b: CK.w, c: CK.sky, n: "9", sn: "Papin" }, "Ballon d'Or 1991, roi des reprises de volée à l'OM."],
  ["goals-50", "Wayne Rooney", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "ATT", 87, { b: CK.r, c: CK.w, n: "10", sn: "Rooney" }, "Meilleur buteur de l'histoire de Manchester United (253 buts)."],
  ["streak-5", "Sadio Mané", "🇸🇳", "ATT", 86, { b: CK.r, c: CK.w, n: "10", sn: "Mané" }, "Champion d'Afrique 2022 avec le Sénégal."],
  ["games-1", "Didier Deschamps", "🇫🇷", "MIL", 85, { b: CK.bl, c: CK.w, n: "7", sn: "Deschamps" }, "Capitaine champion du monde en 1998, sélectionneur champion en 2018."],
  ["zen-5", "Frank Lampard", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "MIL", 86, { b: CK.ch, c: CK.w, n: "8", sn: "Lampard" }, "Meilleur buteur de l'histoire de Chelsea (211 buts)."],
  ["cr7-1", "Sergio Ramos", "🇪🇸", "DEF", 87, { b: CK.w, c: "#d4a017", n: "4", sn: "Ramos" }, "4 Ligues des champions avec le Real Madrid."],
  ["seen-100", "Éric Cantona", "🇫🇷", "ATT", 85, { b: CK.r, c: CK.w, n: "7", sn: "Cantona" }, "« The King » d'Old Trafford, col toujours relevé."],
  ["rush-10", "Mohamed Salah", "🇪🇬", "ATT", 88, { b: CK.r, c: CK.w, n: "11", sn: "Salah" }, "32 buts en Premier League dès sa première saison à Liverpool."],
  ["daily-3", "N'Golo Kanté", "🇫🇷", "MIL", 86, { b: CK.ch, c: CK.w, n: "7", sn: "Kanté" }, "Champion d'Angleterre avec Leicester puis avec Chelsea, deux années de suite."],
  ["party-1", "David Beckham", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "MIL", 86, { b: CK.r, c: CK.w, n: "7", sn: "Beckham" }, "Le roi des coups francs enroulés."],
  ["kits-25", "Franck Ribéry", "🇫🇷", "MIL", 86, { b: CK.r, c: CK.w, n: "7", sn: "Ribéry" }, "9 titres de champion d'Allemagne avec le Bayern."],
  ["geo-bull", "Antoine Griezmann", "🇫🇷", "ATT", 87, { b: CK.bl, c: CK.w, n: "7", sn: "Griezmann" }, "Meilleur joueur et meilleur buteur de l'Euro 2016."],
  ["derby-10", "Lilian Thuram", "🇫🇷", "DEF", 86, { b: CK.bl, c: CK.w, n: "15", sn: "Thuram" }, "Ses deux seuls buts en Bleu : en demi-finale du Mondial 1998."],
  ["career-10", "Samuel Eto'o", "🇨🇲", "ATT", 87, { b: CK.g, c: CK.y, n: "9", sn: "Eto'o" }, "Deux triplés coupe-championnat-C1 : Barça 2009 et Inter 2010."],
  ["duel-1", "Marcel Desailly", "🇫🇷", "DEF", 86, { b: CK.bl, c: CK.w, n: "8", sn: "Desailly" }, "Vainqueur de la C1 deux ans de suite avec deux clubs : OM 1993, Milan 1994."],
  ["avatar-1", "Eden Hazard", "🇧🇪", "ATT", 87, { b: CK.ch, c: CK.w, n: "10", sn: "Hazard" }, "Élu meilleur joueur de Premier League en 2015."],
  ["shop-1", "Fabien Barthez", "🇫🇷", "GB", 85, { b: "#222", c: CK.y, n: "16", sn: "Barthez" }, "Champion du monde 1998 et champion d'Europe 2000."],
  // ---- Rares (trophées argent)
  ["goals-100", "Robert Lewandowski", "🇵🇱", "ATT", 91, { b: CK.r, c: CK.w, n: "9", sn: "Lewandowski" }, "41 buts en Bundesliga en 2020-21, record absolu."],
  ["goals-250", "Raymond Kopa", "🇫🇷", "MIL", 88, { b: CK.bl, c: CK.w, n: "10", sn: "Kopa" }, "Premier Français Ballon d'Or, en 1958."],
  ["streak-10", "Erling Haaland", "🇳🇴", "ATT", 91, { b: "#6cabdd", c: CK.w, n: "9", sn: "Haaland" }, "36 buts lors de sa première saison de Premier League, record."],
  ["games-10", "Francesco Totti", "🇮🇹", "ATT", 89, { b: "#8e1f2f", c: CK.o, n: "10", sn: "Totti" }, "25 saisons dans un seul club : l'AS Rome."],
  ["perfect-10", "Gianluigi Buffon", "🇮🇹", "GB", 90, { b: "#1a1a1a", c: "#9ad1ff", n: "1", sn: "Buffon" }, "Champion du monde 2006, plus de 1 000 matchs professionnels."],
  ["hard-10", "Andrea Pirlo", "🇮🇹", "MIL", 89, { b: "#1f6fd1", c: CK.w, n: "21", sn: "Pirlo" }, "Champion du monde 2006, le maître du jeu."],
  ["multi-10", "Luka Modrić", "🇭🇷", "MIL", 91, { b: CK.w, p: "chest", c: CK.r, n: "10", sn: "Modrić" }, "Ballon d'Or 2018, il a cassé le duel Messi-Ronaldo."],
  ["origins-10", "Lev Yachine", "🇷🇺", "GB", 90, { b: CK.k, c: "#444", n: "1", sn: "Yachine" }, "L'Araignée noire, seul gardien Ballon d'Or (1963)."],
  ["fast-10", "Kaká", "🇧🇷", "MIL", 90, { b: CK.r, p: "stripes", c: CK.k, n: "22", sn: "Kaká" }, "Ballon d'Or 2007, le dernier avant l'ère Messi-Ronaldo."],
  ["cr7-streak", "George Best", "🇬🇧", "ATT", 89, { b: CK.r, c: CK.w, n: "7", sn: "Best" }, "Le premier grand n°7 de Manchester United, Ballon d'Or 1968."],
  ["seen-300", "Bobby Charlton", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "MIL", 89, { b: CK.w, c: CK.nv, n: "9", sn: "Charlton" }, "Champion du monde et Ballon d'Or en 1966."],
  ["sudden-10", "Didier Drogba", "🇨🇮", "ATT", 88, { b: CK.ch, c: CK.w, n: "11", sn: "Drogba" }, "Le tir au but décisif de la finale de C1 2012."],
  ["review-10", "Steven Gerrard", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "MIL", 89, { b: CK.r, c: CK.w, n: "8", sn: "Gerrard" }, "Capitaine du miracle d'Istanbul en 2005."],
  ["geo-6000", "Zlatan Ibrahimović", "🇸🇪", "ATT", 89, { b: CK.y, c: CK.bl, n: "10", sn: "Ibrahimović" }, "Champion dans quatre pays : Pays-Bas, Italie, Espagne, France."],
  ["world-8000", "Just Fontaine", "🇫🇷", "ATT", 88, { b: CK.bl, c: CK.w, n: "17", sn: "Fontaine" }, "13 buts en une seule Coupe du monde (1958), record."],
  ["whoami-5", "Garrincha", "🇧🇷", "ATT", 89, { b: CK.y, c: CK.g, n: "7", sn: "Garrincha" }, "« La joie du peuple », champion du monde 1958 et 1962."],
  ["names-25", "Romário", "🇧🇷", "ATT", 90, { b: CK.y, c: CK.g, n: "11", sn: "Romário" }, "Champion du monde et meilleur joueur du Mondial 1994."],
  ["hilo-10", "Roberto Baggio", "🇮🇹", "ATT", 90, { b: "#1f6fd1", c: CK.w, n: "10", sn: "Baggio" }, "Ballon d'Or 1993, le Divin Codino."],
  ["kit-buy", "Luís Figo", "🇵🇹", "MIL", 89, { b: CK.r, c: CK.g, n: "7", sn: "Figo" }, "Ballon d'Or 2000, passé du Barça au Real."],
  ["joker-10", "George Weah", "🇱🇷", "ATT", 89, { b: CK.r, p: "stripes", c: CK.k, n: "9", sn: "Weah" }, "Seul Africain Ballon d'Or, en 1995."],
  // ---- Épiques (trophées or)
  ["goals-500", "Gerd Müller", "🇩🇪", "ATT", 93, { b: CK.w, c: CK.k, n: "13", sn: "Müller" }, "Der Bomber : 365 buts en Bundesliga."],
  ["streak-20", "Paolo Maldini", "🇮🇹", "DEF", 93, { b: CK.r, p: "stripes", c: CK.k, n: "3", sn: "Maldini" }, "5 Coupes des champions et 25 saisons à l'AC Milan."],
  ["games-50", "Eusébio", "🇵🇹", "ATT", 92, { b: CK.r, c: CK.w, n: "10", sn: "Eusébio" }, "La Panthère noire, meilleur buteur du Mondial 1966."],
  ["perfect-20", "Michel Platini", "🇫🇷", "MIL", 94, { b: CK.bl, c: CK.w, n: "10", sn: "Platini" }, "Trois Ballons d'Or de suite : 1983, 1984, 1985."],
  ["marathon", "Andrés Iniesta", "🇪🇸", "MIL", 92, { b: "#c8102e", c: CK.y, n: "6", sn: "Iniesta" }, "Le but de la victoire en finale du Mondial 2010."],
  ["hard-50", "Xavi", "🇪🇸", "MIL", 92, { b: "#a50044", p: "stripes", c: "#004d98", n: "6", sn: "Xavi" }, "Champion du monde 2010 et double champion d'Europe."],
  ["cr7-50", "Ronaldo (R9)", "🇧🇷", "ATT", 94, { b: CK.y, c: CK.g, n: "9", sn: "Ronaldo" }, "Il Fenomeno : 2 Ballons d'Or, champion du monde 2002."],
  ["cr7-seen", "Alfredo Di Stéfano", "🇪🇸", "ATT", 93, { b: CK.w, c: "#d4a017", n: "9", sn: "Di Stéfano" }, "Buteur dans cinq finales de C1 de suite avec le Real."],
  ["sudden-25", "Franz Beckenbauer", "🇩🇪", "DEF", 94, { b: CK.w, c: CK.k, n: "5", sn: "Kaiser" }, "Champion du monde comme joueur (1974) et sélectionneur (1990)."],
  ["rush-20", "Kylian Mbappé", "🇫🇷", "ATT", 93, { b: CK.nv, c: CK.w, n: "10", sn: "Mbappé" }, "Un triplé en finale de Coupe du monde, en 2022."],
  ["daily-7", "Ferenc Puskás", "🇭🇺", "ATT", 93, { b: CK.r, c: CK.w, n: "10", sn: "Puskás" }, "Le Major galopant : 84 buts en 85 matchs pour la Hongrie."],
  ["kits-perfect", "Ronaldinho", "🇧🇷", "MIL", 93, { b: "#a50044", p: "stripes", c: "#004d98", n: "10", sn: "Ronaldinho" }, "Ballon d'Or 2005, applaudi debout par le Bernabéu."],
  ["geo-pays", "Thierry Henry", "🇫🇷", "ATT", 93, { b: CK.r, s: CK.w, c: CK.w, n: "14", sn: "Henry" }, "Meilleur buteur de l'histoire d'Arsenal (228 buts)."],
  ["boss-5", "Marco van Basten", "🇳🇱", "ATT", 93, { b: CK.o, c: CK.w, n: "12", sn: "Van Basten" }, "3 Ballons d'Or et la volée de la finale de l'Euro 1988."],
  ["league-1", "Karim Benzema", "🇫🇷", "ATT", 92, { b: CK.w, c: "#d4a017", n: "9", sn: "Benzema" }, "Ballon d'Or 2022 et 5 Ligues des champions."],
  // ---- Légendaires (trophées légende)
  ["goals-1000", "Pelé", "🇧🇷", "ATT", 98, { b: CK.y, c: CK.g, n: "10", sn: "Pelé" }, "Le seul joueur triple champion du monde (1958, 1962, 1970)."],
  ["streak-49", "Johan Cruyff", "🇳🇱", "ATT", 96, { b: CK.o, c: CK.k, n: "14", sn: "Cruyff" }, "Trois Ballons d'Or, le père du football total."],
  ["cr7-perfect", "Lionel Messi", "🇦🇷", "ATT", 99, { b: CK.w, p: "stripes", c: CK.sky, n: "10", sn: "Messi", stars: 3 }, "8 Ballons d'Or et champion du monde 2022."],
  ["seen-all", "Diego Maradona", "🇦🇷", "ATT", 98, { b: CK.w, p: "stripes", c: CK.sky, n: "10", sn: "Maradona" }, "Champion du monde 1986, auteur du but du siècle."],
  ["geo-8500", "Zinédine Zidane", "🇫🇷", "MIL", 97, { b: CK.bl, c: CK.w, n: "10", sn: "Zidane" }, "Deux têtes en finale du Mondial 1998, Ballon d'Or la même année."],
  // ---- Mythiques
  ["cr7-ultime", "Cristiano Ronaldo", "🇵🇹", "ATT", 99, { face: "cr7" }, "5 Ballons d'Or, 5 Ligues des champions, recordman de buts en sélection. Siuuu !"],
  ["secret-fete", "La Fête", "🥳", "ROI", 100, { face: "fete" }, "Le roi de la fête. Personne ne lui résiste, pas même CR7."],
];
const CARDS = CARDS_RAW.map(([trophy, name, flag, pos, note, kit, fact], i) => ({ id: i + 1, trophy, name, flag, pos, note, kit, fact }));

// Dessin d'une carte (face avant)
function cardFront(card, tier, headSrc) {
  const r = CARD_RARITY[tier] || CARD_RARITY.bronze;
  const art = playerSvg(card, headSrc);
  return `<div class="tcg-front r-${r.id}">
    <div class="tcg-bg"></div><div class="tcg-holo"></div><div class="tcg-shine"></div>
    <div class="tcg-top"><span class="tcg-note">${card.note}</span><span class="tcg-pos">${card.pos}</span><span class="tcg-flag">${card.flag}</span></div>
    <span class="tcg-gem" title="${r.label}">${r.gem}</span>
    <div class="tcg-art">${art}</div>
    <div class="tcg-name">${card.name}</div>
    <div class="tcg-foot"><span>${r.label}</span><span>#${String(card.id).padStart(2, "0")}</span></div>
  </div>`;
}
// Dos de carte (carte pas encore gagnée, ou verso)
function cardBack(locked) {
  return `<div class="tcg-back${locked ? " locked" : ""}"><div class="tb-ring"><span class="tb-logo">LA FÊTE</span><span class="tb-sub">${locked ? "?" : "QUIZ"}</span></div></div>`;
}

// ---- Illustration : joueur stylisé (silhouette sans visage) en action, aux couleurs de son maillot
// Squelette par pose : h tête, sL/sR épaules, eL/eR coudes, wL/wR mains, pL/pR hanches, kL/kR genoux, aL/aR chevilles, tL/tR pointes, ball.
// Le côté L est dessiné derrière, le côté R devant.
const PLAYER_POSES = {
  shoot: { h: [86, 40], sL: [74, 64], sR: [100, 62], eL: [58, 84], wL: [46, 104], eR: [118, 74], wR: [134, 60], pL: [80, 122], pR: [98, 120], kL: [74, 168], aL: [70, 212], tL: [86, 218], kR: [128, 150], aR: [160, 168], tR: [174, 160], ball: [184, 170] },
  volley: { h: [70, 64], sL: [76, 84], sR: [92, 76], eL: [64, 104], wL: [44, 112], eR: [112, 62], wR: [126, 42], pL: [104, 130], pR: [116, 126], kL: [94, 174], aL: [98, 216], tL: [114, 220], kR: [150, 112], aR: [176, 84], tR: [186, 70], ball: [194, 60] },
  dribble: { h: [98, 40], sL: [86, 64], sR: [110, 64], eL: [70, 82], wL: [62, 100], eR: [130, 80], wR: [146, 70], pL: [90, 122], pR: [106, 122], kL: [70, 160], aL: [52, 196], tL: [46, 212], kR: [120, 168], aR: [114, 212], tR: [130, 218], ball: [146, 210] },
  header: { h: [100, 44], sL: [86, 70], sR: [112, 70], eL: [66, 64], wL: [52, 50], eR: [134, 66], wR: [150, 54], pL: [92, 132], pR: [108, 132], kL: [84, 172], aL: [94, 210], tL: [108, 214], kR: [116, 176], aR: [108, 218], tR: [122, 224], ball: [112, 22] },
  celebrate: { h: [100, 42], sL: [86, 66], sR: [114, 66], eL: [66, 46], wL: [58, 22], eR: [134, 46], wR: [142, 22], pL: [92, 126], pR: [108, 126], kL: [84, 172], aL: [82, 216], tL: [70, 222], kR: [120, 170], aR: [124, 216], tR: [138, 222] },
  siuu: { h: [100, 30], sL: [86, 54], sR: [114, 54], eL: [64, 76], wL: [46, 94], eR: [136, 76], wR: [154, 94], pL: [92, 114], pR: [108, 114], kL: [76, 150], aL: [80, 188], tL: [68, 196], kR: [124, 150], aR: [120, 188], tR: [132, 196] },
  pose: { h: [100, 40], sL: [86, 64], sR: [114, 64], eL: [66, 92], wL: [88, 118], eR: [134, 92], wR: [112, 118], pL: [92, 124], pR: [108, 124], kL: [86, 172], aL: [84, 216], tL: [70, 222], kR: [122, 168], aR: [130, 208], tR: [146, 204], ball: [150, 210] },
  keeper: { h: [150, 70], sL: [128, 82], sR: [134, 98], eL: [150, 58], wL: [170, 44], eR: [160, 102], wR: [180, 88], pL: [80, 104], pR: [84, 120], kL: [50, 92], aL: [24, 106], tL: [12, 98], kR: [54, 140], aR: [30, 160], tR: [18, 154], ball: [186, 56], gloves: 1 },
  tackle: { h: [46, 92], sL: [56, 112], sR: [64, 106], eL: [40, 140], wL: [30, 164], eR: [44, 82], wR: [30, 64], pL: [90, 170], pR: [98, 164], kL: [124, 192], aL: [156, 204], tL: [168, 196], kR: [130, 166], aR: [162, 176], tR: [176, 172], ball: [186, 184] },
  bicycle: { h: [70, 168], sL: [80, 148], sR: [88, 150], eL: [56, 160], wL: [36, 176], eR: [110, 170], wR: [128, 186], pL: [110, 104], pR: [116, 110], kL: [92, 70], aL: [104, 34], tL: [98, 20], kR: [142, 84], aR: [158, 46], tR: [166, 32], ball: [176, 20] },
};
const POSE_BY_POS = { ATT: ["shoot", "volley", "celebrate", "header", "dribble", "bicycle"], MIL: ["dribble", "pose", "shoot", "celebrate", "volley"], DEF: ["header", "tackle", "pose", "celebrate"], GB: ["keeper"] };
const POSE_OF = { "Pelé": "bicycle", "Lionel Messi": "dribble", "Diego Maradona": "dribble", "Zinédine Zidane": "volley", "Johan Cruyff": "dribble", "Cristiano Ronaldo": "siuu", "La Fête": "celebrate", "Éric Cantona": "pose", "Marco van Basten": "volley", "Ronaldinho": "dribble", "Didier Drogba": "header", "Franz Beckenbauer": "pose", "Lev Yachine": "keeper", "Kylian Mbappé": "celebrate", "Thierry Henry": "celebrate", "David Beckham": "shoot", "Andrés Iniesta": "shoot", "Paolo Maldini": "tackle", "Sergio Ramos": "header", "N'Golo Kanté": "tackle" };
function poseOf(card) {
  if (POSE_OF[card.name]) return POSE_OF[card.name];
  const list = POSE_BY_POS[card.pos] || POSE_BY_POS.ATT;
  return list[card.id % list.length];
}

// ---- Visages cartoon : [teint 1-6, coiffure, couleur des cheveux, barbe]
const SKIN = ["#f8dcc8", "#efc6a6", "#dca77f", "#bf8158", "#935f3e", "#65402a"];
const HAIRC = { k: "#1d1714", br: "#4e3220", lb: "#86603a", bl: "#dcb45c", gr: "#a9a9a9" };
const FACE_OF = {
  "Jean-Pierre Papin": [2, "short", "br"], "Wayne Rooney": [2, "buzz", "br"], "Sadio Mané": [6, "buzz", "k", "stubble"],
  "Didier Deschamps": [2, "short", "br"], "Frank Lampard": [1, "short", "br"], "Sergio Ramos": [3, "slick", "k", "full"],
  "Éric Cantona": [2, "short", "k"], "Mohamed Salah": [4, "curly", "k", "full"], "N'Golo Kanté": [6, "buzz", "k"],
  "David Beckham": [1, "quiff", "bl", "stubble"], "Franck Ribéry": [2, "buzz", "br"], "Antoine Griezmann": [2, "short", "bl"],
  "Lilian Thuram": [6, "bald", "k"], "Samuel Eto'o": [6, "buzz", "k"], "Marcel Desailly": [6, "bald", "k"],
  "Eden Hazard": [2, "short", "br", "stubble"], "Fabien Barthez": [2, "bald", "k"], "Robert Lewandowski": [2, "short", "br"],
  "Raymond Kopa": [2, "slick", "k"], "Erling Haaland": [1, "bun", "bl"], "Francesco Totti": [2, "short", "lb"],
  "Gianluigi Buffon": [2, "long", "br", "stubble"], "Andrea Pirlo": [2, "long", "br", "full"], "Luka Modrić": [1, "long", "lb"],
  "Lev Yachine": [1, "short", "k"], "Kaká": [3, "short", "br"], "George Best": [1, "long", "k", "full"],
  "Bobby Charlton": [1, "receding", "lb"], "Didier Drogba": [6, "short", "k", "goatee"], "Steven Gerrard": [1, "buzz", "lb"],
  "Zlatan Ibrahimović": [3, "bun", "k", "full"], "Just Fontaine": [2, "slick", "k"], "Garrincha": [4, "short", "k"],
  "Romário": [4, "buzz", "k"], "Roberto Baggio": [2, "bun", "k", "goatee"], "Luís Figo": [2, "slick", "br"],
  "George Weah": [6, "buzz", "k"], "Gerd Müller": [2, "short", "k"], "Paolo Maldini": [2, "long", "k"],
  "Eusébio": [5, "short", "k"], "Michel Platini": [2, "curly", "br"], "Andrés Iniesta": [1, "receding", "br"],
  "Xavi": [2, "short", "k", "stubble"], "Ronaldo (R9)": [4, "bald", "k"], "Alfredo Di Stéfano": [2, "receding", "br"],
  "Franz Beckenbauer": [1, "short", "br"], "Kylian Mbappé": [5, "bald", "k"], "Ferenc Puskás": [2, "slick", "k"],
  "Ronaldinho": [5, "ronnie", "k"], "Thierry Henry": [5, "bald", "k"], "Marco van Basten": [2, "short", "br"],
  "Karim Benzema": [3, "buzz", "k", "full"], "Pelé": [5, "short", "k"], "Johan Cruyff": [2, "long", "br"],
  "Lionel Messi": [2, "short", "br", "full"], "Diego Maradona": [3, "curly", "k"], "Zinédine Zidane": [2, "receding", "br"],
  "Cristiano Ronaldo": [3, "quiff", "k"],
};
// Tête dessinée en coordonnées locales (centre 0,0, rayon 17), tournée avec le corps
function faceSvg(card, cx, cy, rot, happy, uid) {
  const [tone, style, hc, beard] = FACE_OF[card.name] || [2, "short", "br"];
  const sk = SKIN[tone - 1], h = HAIRC[hc] || HAIRC.br, R = 17;
  const dark = tone >= 5;
  const line = dark ? "#2a1a10" : "#3a2418";
  let back = "", front = "";
  const cap = (top, side) => `<path d="M${-R - 1} ${side} C${-R - 1} ${top - 2} ${R + 1} ${top - 2} ${R + 1} ${side} C${R - 3} ${top + 6} ${-R + 3} ${top + 6} ${-R - 1} ${side} Z" fill="${h}"/>`;
  switch (style) {
    case "short": front = cap(-R - 3, -3) + `<path d="M${-R + 2} -7 Q-4 -11 6 -9 Q12 -9 ${R - 1} -5" fill="none" stroke="${h}" stroke-width="3"/>`; break;
    case "buzz": front = `<path d="M${-R} -2 C${-R} -24 ${R} -24 ${R} -2 C${R - 4} -10 ${-R + 4} -10 ${-R} -2 Z" fill="${h}" opacity=".8"/>`; break;
    case "bald": front = `<ellipse cx="-6" cy="-11" rx="5" ry="2.6" fill="#fff" opacity=".22"/>`; break;
    case "receding": front = `<path d="M${-R - 1} 0 C${-R - 1} -14 -10 -19 -8 -14 C-12 -10 ${-R + 2} -6 ${-R + 1} 1 Z M${R + 1} 0 C${R + 1} -14 10 -19 8 -14 C12 -10 ${R - 2} -6 ${R - 1} 1 Z" fill="${h}"/>`; break;
    case "slick": front = cap(-R - 4, -4) + `<path d="M-5 ${-R - 2} Q-2 -12 ${R} -8" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>`; break;
    case "quiff": front = cap(-R - 2, -4) + `<path d="M-12 -12 C-14 -30 10 -34 16 -18 C10 -22 2 -22 -4 -14 Z" fill="${h}"/>`; break;
    case "curly": { const c = [-15, -9, -3, 3, 9, 15].map((x, i) => `<circle cx="${x}" cy="${-14 - (i % 2) * 3 - (Math.abs(x) < 10 ? 3 : 0)}" r="6.5" fill="${h}"/>`).join(""); front = c + `<circle cx="-17" cy="-6" r="5" fill="${h}"/><circle cx="17" cy="-6" r="5" fill="${h}"/>`; break; }
    case "long": back = `<path d="M${-R - 3} -6 C${-R - 4} 10 ${-R - 2} 20 ${-R + 4} 22 L${R - 4} 22 C${R + 2} 20 ${R + 4} 10 ${R + 3} -6 Z" fill="${h}"/>`; front = cap(-R - 3, -1) + `<path d="M-2 ${-R - 1} Q-10 -8 ${-R} 2" fill="none" stroke="${h}" stroke-width="4"/>`; break;
    case "bun": front = cap(-R - 3, -3) + `<circle cx="0" cy="${-R - 6}" r="6" fill="${h}"/>`; break;
    case "ronnie": back = `<path d="M${-R - 5} -4 C${-R - 8} 14 ${-R} 24 ${-R + 6} 22 L${R - 6} 22 C${R} 24 ${R + 8} 14 ${R + 5} -4 Z" fill="${h}"/>` + [-18, -12, 12, 18].map((x) => `<circle cx="${x}" cy="12" r="5" fill="${h}"/>`).join("");
      front = [-14, -7, 0, 7, 14].map((x) => `<circle cx="${x}" cy="${-15 - (Math.abs(x) < 8 ? 3 : 0)}" r="6.5" fill="${h}"/>`).join("") + `<path d="M${-R - 1} -9 Q0 -15 ${R + 1} -9" fill="none" stroke="#fff" stroke-width="3.2"/>`; break;
  }
  let fb = "";
  if (beard === "full") fb = `<path d="M${-R + 1} 0 C${-R + 1} 14 -8 ${R + 2} 0 ${R + 2} C8 ${R + 2} ${R - 1} 14 ${R - 1} 0 C${R - 4} 7 8 9 0 9 C-8 9 ${-R + 4} 7 ${-R + 1} 0 Z" fill="${h}"/><path d="M-5 8.5 Q0 6.5 5 8.5" stroke="${h}" stroke-width="2.6" fill="none"/>`;
  else if (beard === "stubble") fb = `<path d="M${-R + 1} 1 C${-R + 1} 14 -8 ${R + 1} 0 ${R + 1} C8 ${R + 1} ${R - 1} 14 ${R - 1} 1 C${R - 4} 8 8 10 0 10 C-8 10 ${-R + 4} 8 ${-R + 1} 1 Z" fill="${h}" opacity=".3"/>`;
  else if (beard === "goatee") fb = `<path d="M-4 13 Q0 ${R + 3} 4 13 Z" fill="${h}"/><path d="M-5 8.5 Q0 6.5 5 8.5" stroke="${h}" stroke-width="2.2" fill="none"/>`;
  const mouth = happy
    ? `<path d="M-5.5 9 Q0 17 5.5 9 Z" fill="#5a1a1a"/><path d="M-4 9.6 L4 9.6" stroke="#fff" stroke-width="1.6"/>`
    : `<path d="M-5 10 Q0 14 5 10" fill="none" stroke="${line}" stroke-width="1.6" stroke-linecap="round"/>`;
  const eyes = [-6.5, 6.5].map((x) => `<ellipse cx="${x}" cy="1" rx="2.3" ry="2.8" fill="#1a1110"/><circle cx="${x + .8}" cy=".1" r=".8" fill="#fff"/>`).join("");
  const brows = `<path d="M-10 -5 Q-6.5 ${happy ? -8 : -7} -3 -5.5 M3 -5.5 Q6.5 ${happy ? -8 : -7} 10 -5" fill="none" stroke="${style === "bald" || hc === "bl" ? line : h}" stroke-width="2" stroke-linecap="round"/>`;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">${back}
    <circle cx="${-R}" cy="2" r="3.6" fill="${sk}"/><circle cx="${R}" cy="2" r="3.6" fill="${sk}"/>
    <circle r="${R}" fill="${sk}"/><circle r="${R}" fill="url(#${uid}-fs)"/>
    ${fb}${eyes}${brows}<path d="M0 2 Q-1.6 6 0 6.6" fill="none" stroke="${line}" stroke-opacity=".45" stroke-width="1.3"/>
    <ellipse cx="-10" cy="7" rx="3" ry="1.8" fill="#ff7a7a" opacity="${dark ? .12 : .22}"/><ellipse cx="10" cy="7" rx="3" ry="1.8" fill="#ff7a7a" opacity="${dark ? .12 : .22}"/>
    ${mouth}${front}</g>`;
}
function playerSvg(card, headSrc) {
  const isCr7 = card.kit.face === "cr7", isFete = card.kit.face === "fete";
  const k = isCr7 ? { b: "#c8102e", c: "#0b6b3a", s: "#0b6b3a", n: "7" } : isFete ? { b: "#ff2d95", c: "#ffd23f", n: "1" } : card.kit;
  const P = PLAYER_POSES[poseOf(card)];
  const uid = "pl" + card.id + "-" + (++playerSvg.n);
  const light = (c) => /^#(f|e|d|c)/i.test(c) || c === "#ffd200" || c === "#ffd23f";
  const jersey = k.b, trim = k.c || "#fff";
  const shorts = k.s || (light(jersey) ? (light(trim) ? "#151515" : trim) : (light(trim) ? trim : "#151515"));
  const socks = jersey;
  const tone = (FACE_OF[card.name] || [2])[0];
  const skin = isFete ? "#efc6a6" : SKIN[tone - 1];
  const keeper = card.pos === "GB" || P.gloves;
  const glove = keeper ? (light(trim) ? trim : "#d9f99d") : null;
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ln = (a, b, w, col, extra = "") => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
  const arm = (s, e, w) => {
    const sl = lerp(s, e, 0.55);
    return ln(s, e, 11, skin) + ln(e, w, 9.5, skin) +
      (keeper ? `<circle cx="${w[0]}" cy="${w[1]}" r="7" fill="${glove}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>` : `<circle cx="${w[0]}" cy="${w[1]}" r="5" fill="${skin}"/>`) +
      ln(s, sl, 15, jersey) + ln(lerp(s, e, 0.47), sl, 15.5, trim).replace("round", "butt");
  };
  const leg = (p, kn, a, t) => {
    const so = lerp(kn, a, 0.22);
    return ln(p, kn, 16, skin) + ln(kn, a, 13, skin) + ln(so, a, 13.5, socks) + ln(lerp(so, a, 0.85), lerp(so, a, 0.95), 13.5, trim) +
      ln(a, t, 9, "#111") + ln(p, lerp(p, kn, 0.55), 20, shorts);
  };
  // torse
  const [sL, sR, pL, pR] = [P.sL, P.sR, P.pL, P.pR];
  const cx = (sL[0] + sR[0] + pL[0] + pR[0]) / 4, cy = (sL[1] + sR[1] + pL[1] + pR[1]) / 4;
  const ang = -Math.atan2((pL[0] + pR[0]) / 2 - (sL[0] + sR[0]) / 2, (pL[1] + pR[1]) / 2 - (sL[1] + sR[1]) / 2) * 180 / Math.PI;
  const torso = `M${sL[0] - 3} ${sL[1]} L${sR[0] + 3} ${sR[1]} L${pR[0] + 4} ${pR[1]} L${pL[0] - 4} ${pL[1]} Z`;
  const neck = lerp([(sL[0] + sR[0]) / 2, (sL[1] + sR[1]) / 2], P.h, 0.45);
  let pattern = "";
  if (k.p === "stripes") pattern = [-12, -4, 4, 12].map((dx) => `<rect x="${cx + dx - 2.5}" y="${cy - 60}" width="5" height="120" fill="${trim}" transform="rotate(${ang} ${cx} ${cy})"/>`).join("");
  else if (k.p === "chest") pattern = [-15, -5, 5, 15].flatMap((dx, i) => [-30, -20, -10, 0, 10, 20, 30].map((dy, j) => (i + j) % 2 ? `<rect x="${cx + dx - 5}" y="${cy + dy - 5}" width="10" height="10" fill="${trim}" transform="rotate(${ang} ${cx} ${cy})"/>` : "")).join("");
  const numCol = light(jersey) ? "#151515" : "#fff";
  const ball = P.ball ? `<g class="pl-ball"><circle cx="${P.ball[0]}" cy="${P.ball[1]}" r="10" fill="#fff" stroke="#222" stroke-width="1.2"/><path d="M${P.ball[0]} ${P.ball[1] - 4} l3.8 2.8 -1.5 4.4 h-4.6 l-1.5 -4.4 z" fill="#222"/><path d="M${P.ball[0] - 10} ${P.ball[1] - 1} l4 1 M${P.ball[0] + 10} ${P.ball[1] - 1} l-4 1 M${P.ball[0] - 5} ${P.ball[1] + 9} l2 -3.5 M${P.ball[0] + 5} ${P.ball[1] + 9} l-2 -3.5 M${P.ball[0]} ${P.ball[1] - 10} v5" stroke="#222" stroke-width="1.2"/></g>` : "";
  // tête plus grosse, décalée dans l'axe du cou
  const base = [(sL[0] + sR[0]) / 2, (sL[1] + sR[1]) / 2];
  const dx = P.h[0] - base[0], dy = P.h[1] - base[1], dl = Math.hypot(dx, dy) || 1;
  const hc = [base[0] + dx / dl * (dl + 4), base[1] + dy / dl * (dl + 4)];
  const happy = ["celebrate", "siuu", "dribble", "pose"].includes(poseOf(card));
  const head = isFete
    ? `<image href="${headSrc}" x="${hc[0] - 22}" y="${hc[1] - 34}" width="44" height="58" preserveAspectRatio="xMidYMid meet"/>`
    : faceSvg(card, hc[0], hc[1], Math.atan2(dx, -dy) * 180 / Math.PI, happy, uid);
  const groundY = Math.max(P.aL[1], P.aR[1], P.tL[1], P.tR[1]) + 6;
  return `<svg class="card-player" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="${uid}-fs" cx=".38" cy=".3" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
      <clipPath id="${uid}-to"><path d="${torso}"/></clipPath>
      <radialGradient id="${uid}-spot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="100" cy="112" r="96" fill="url(#${uid}-spot)" class="pl-spot"/>
    <ellipse cx="${(P.aL[0] + P.aR[0]) / 2}" cy="${P.h[1] > 150 ? 228 : Math.min(232, groundY)}" rx="46" ry="6" fill="rgba(0,0,0,.35)"/>
    <g class="pl-body" stroke-linejoin="round">
      <g opacity=".82">${arm(P.sL, P.eL, P.wL)}${leg(P.pL, P.kL, P.aL, P.tL)}</g>
      ${ln(neck, [(sL[0] + sR[0]) / 2, (sL[1] + sR[1]) / 2], 9, skin)}
      <path d="${torso}" fill="${jersey}" stroke="${jersey}" stroke-width="8"/>
      <g clip-path="url(#${uid}-to)">${pattern}</g>
      <path d="M${sL[0] - 3} ${sL[1]} L${sR[0] + 3} ${sR[1]}" stroke="${trim}" stroke-width="3" stroke-linecap="round"/>
      ${ln([pL[0] - 4, pL[1] + 2], [pR[0] + 4, pR[1] + 2], 9, shorts)}
      <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="20" fill="${numCol}" transform="rotate(${ang} ${cx} ${cy})">${k.n || ""}</text>
      ${leg(P.pR, P.kR, P.aR, P.tR)}${arm(P.sR, P.eR, P.wR)}
      ${head}
    </g>
    ${ball}
  </svg>`;
}
playerSvg.n = 0;
