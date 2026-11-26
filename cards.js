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
  let art;
  if (card.kit.face === "cr7") art = cr7FaceSvg("card-face");
  else if (card.kit.face === "fete") art = `<img class="card-face card-fete" src="${headSrc}" alt="" />`;
  else {
    const k = card.kit;
    art = kitSvg({ b: k.b, p: k.p, c: k.c, s: k.s, t: k.c, n: k.n, sn: k.sn, stars: k.stars, nc: k.b === "#f7f7f5" || k.b === "#ffd200" ? "#151515" : "#fff" }, "card-kit");
  }
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
