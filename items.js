// Cartes « objets de match » et « stades » : cartes hors série, à acheter en boutique.
// Trois gammes selon le prix : classique (≤ 200), premium (≤ 500), prestige (> 500).
const ITEM_TIERS = {
  classique: { label: "Classique", gem: "◇" },
  premium: { label: "Premium", gem: "◈" },
  prestige: { label: "Prestige", gem: "✪" },
};
const itemTier = (price) => (price > 500 ? "prestige" : price > 200 ? "premium" : "classique");

// ---- Dessins des objets (viewBox 100×100)
const ITEM_ART = {
  gourde: () => `<rect x="36" y="26" width="28" height="62" rx="11" fill="#1fa0e8"/><rect x="36" y="44" width="28" height="22" fill="#fff"/>
    <text x="50" y="60" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="11" fill="#1fa0e8">H₂O</text>
    <rect x="40" y="16" width="20" height="12" rx="3" fill="#222"/><rect x="46" y="8" width="8" height="10" rx="2" fill="#ff7a00"/>
    <rect x="40" y="30" width="5" height="54" rx="2.5" fill="#fff" opacity=".35"/><path d="M38 80 h24" stroke="#0b6aa8" stroke-width="2"/>
    ${[0, 1, 2].map((i) => `<circle cx="${70 + i * 5}" cy="${30 + i * 9}" r="${2.6 - i * .5}" fill="#9fe0ff" opacity=".9"/>`).join("")}`,
  sifflet: () => `<path d="M60 48 C76 40 84 60 74 70" fill="none" stroke="#e8e8e8" stroke-width="3"/>
    <path d="M18 70 C40 40 70 30 84 26" fill="none" stroke="#d71920" stroke-width="2.5" stroke-dasharray="4 3"/>
    <path d="M20 48 h30 a16 16 0 1 1 -14 24 L20 60 Z" fill="#c9ced6"/><path d="M20 48 h30 a16 16 0 0 1 4 1 L20 56 Z" fill="#fff" opacity=".6"/>
    <circle cx="52" cy="62" r="11" fill="#9aa2ad"/><circle cx="52" cy="62" r="6" fill="#59616c"/><rect x="18" y="48" width="6" height="12" rx="2" fill="#8a929d"/>
    <path d="M30 40 l-4 -7 M38 38 l0 -8 M46 40 l4 -7" stroke="#ffd23f" stroke-width="2.5" stroke-linecap="round"/>`,
  piece: () => `<g class="ia-spin"><circle cx="50" cy="52" r="30" fill="#d4a017"/><circle cx="50" cy="52" r="26" fill="#ffd84a"/><circle cx="50" cy="52" r="26" fill="none" stroke="#b07a00" stroke-width="1.5" stroke-dasharray="2 2"/>
    <text x="50" y="49" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="12" fill="#8a5600">PILE</text>
    <text x="50" y="63" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="9" fill="#8a5600">OU FACE</text>
    <path d="M30 36 a26 26 0 0 1 22 -10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>`,
  jaune: () => `<g transform="rotate(-12 50 52)"><rect x="31" y="22" width="38" height="56" rx="5" fill="#ffd200" stroke="#e0a800" stroke-width="1.5"/><path d="M35 26 l30 0 l-22 48 l-8 0 Z" fill="#fff" opacity=".3"/></g>`,
  rouge: () => `<g transform="rotate(10 50 52)"><rect x="31" y="22" width="38" height="56" rx="5" fill="#e0121c" stroke="#9e0a12" stroke-width="1.5"/><path d="M35 26 l30 0 l-22 48 l-8 0 Z" fill="#fff" opacity=".25"/></g>`,
  drapeau: () => `<rect x="30" y="18" width="4" height="72" rx="2" fill="#333"/><rect x="28" y="84" width="8" height="8" rx="2" fill="#111"/>
    <g class="ia-wave"><path d="M34 20 h40 v28 h-40 Z" fill="#ffd200"/>${[0, 1, 2, 3].flatMap((i) => [0, 1].map((j) => (i + j) % 2 ? "" : `<rect x="${34 + i * 10}" y="${20 + j * 14}" width="10" height="14" fill="#e0121c"/>`)).join("")}</g>`,
  spray: () => `<rect x="38" y="30" width="24" height="56" rx="6" fill="#eef2f5"/><rect x="38" y="42" width="24" height="26" fill="#1d3a8f"/>
    <text x="50" y="59" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="9" fill="#fff">9,15 M</text>
    <rect x="43" y="20" width="14" height="11" rx="3" fill="#c9ced6"/><rect x="47" y="14" width="6" height="7" rx="1.5" fill="#222"/>
    <path d="M56 17 C68 12 80 14 88 20" stroke="#fff" stroke-width="2.5" stroke-dasharray="1 4" stroke-linecap="round" fill="none"/>
    <path d="M8 92 C30 84 70 84 94 92" stroke="#fff" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round" fill="none"/>`,
  echarpe: () => `<path d="M14 30 C40 20 60 20 86 30 L80 46 C58 38 42 38 20 46 Z" fill="#d71920"/>
    <path d="M22 44 L14 86 L32 86 L36 46 Z" fill="#d71920"/><path d="M78 44 L86 86 L68 86 L64 46 Z" fill="#d71920"/>
    ${[56, 66, 76].map((y) => `<path d="M${16 + (y - 46) * .05} ${y} h18" stroke="#fff" stroke-width="4"/><path d="M${66 + (y - 46) * .02} ${y} h18" stroke="#fff" stroke-width="4"/>`).join("")}
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${15 + i * 4} 86 v7 M${69 + i * 4} 86 v7" stroke="#d71920" stroke-width="2"/>`).join("")}
    <text x="50" y="37" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="9" fill="#fff" letter-spacing="1">ALLEZ !</text>`,
  brassard: () => `<ellipse cx="50" cy="66" rx="34" ry="10" fill="#c9a200"/><path d="M16 40 v26 a34 10 0 0 0 68 0 v-26" fill="#ffd200"/><ellipse cx="50" cy="40" rx="34" ry="10" fill="#ffe46b"/><ellipse cx="50" cy="40" rx="26" ry="6" fill="#3a3000" opacity=".35"/>
    <circle cx="50" cy="60" r="11" fill="#151515"/><text x="50" y="65" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="14" fill="#ffd200">C</text>`,
  panneau: () => `<rect x="14" y="26" width="72" height="46" rx="6" fill="#151515" stroke="#555" stroke-width="2"/><rect x="45" y="72" width="10" height="16" fill="#333"/>
    <text x="32" y="60" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="24" fill="#ff2a2a">9</text>
    <text x="68" y="60" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="24" fill="#2bff6a">11</text>
    <path d="M24 34 l-5 4 l5 4 Z" fill="#ff2a2a"/><path d="M76 34 l5 4 l-5 4 Z" fill="#2bff6a"/><path d="M50 32 v34" stroke="#444" stroke-width="1.5"/>`,
  crampons: () => `<path d="M12 66 C14 52 30 48 44 46 L54 30 C60 26 70 28 72 34 L74 50 C84 54 90 60 88 70 Z" fill="#ff5a1f"/>
    <path d="M44 46 C50 52 66 52 74 50" fill="none" stroke="#fff" stroke-width="3"/><path d="M30 56 l30 -6 M32 62 l34 -6" stroke="#151515" stroke-width="3"/>
    <path d="M12 66 h76 v6 H12 Z" fill="#151515"/>${[18, 34, 52, 70, 82].map((x) => `<path d="M${x} 72 l2 7 h4 l2 -7 Z" fill="#c9ced6"/>`).join("")}
    <path d="M56 32 C62 30 66 32 68 36" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/>`,
  gants: () => [[30, -10, "#1fd17a"], [64, 12, "#1fa0e8"]].map(([x, r, c]) => `<g transform="rotate(${r} ${x} 55)">
      <rect x="${x - 15}" y="44" width="30" height="34" rx="8" fill="${c}"/>${[0, 1, 2, 3].map((i) => `<rect x="${x - 15 + i * 7.6}" y="${22 + Math.abs(1.5 - i) * 4}" width="7" height="${28 - Math.abs(1.5 - i) * 4}" rx="3.5" fill="${c}"/>`).join("")}
      <rect x="${x - 20}" y="52" width="9" height="16" rx="4.5" fill="${c}" transform="rotate(-30 ${x - 16} 60)"/>
      <rect x="${x - 15}" y="74" width="30" height="12" rx="3" fill="#151515"/><path d="M${x - 10} 60 h20" stroke="#fff" stroke-width="2" opacity=".5"/></g>`).join(""),
  var: () => `<rect x="10" y="22" width="80" height="52" rx="5" fill="#151515" stroke="#666" stroke-width="2"/><rect x="15" y="27" width="70" height="42" fill="#1e6f3a"/>
    <path d="M15 52 h70" stroke="#fff" stroke-width="1" opacity=".6"/><circle cx="40" cy="46" r="3.5" fill="#fff"/><path d="M58 30 v38" stroke="#ff2a2a" stroke-width="1.5" stroke-dasharray="3 2"/>
    <rect x="30" y="56" width="40" height="12" rx="3" fill="#000" opacity=".6"/><text x="50" y="65.5" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="10" fill="#fff">VAR ▶</text>
    <rect x="42" y="74" width="16" height="8" fill="#444"/><rect x="32" y="82" width="36" height="5" rx="2" fill="#333"/>`,
  ballon2010: () => `<defs><radialGradient id="b10g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".75" stop-color="#e9edf2"/><stop offset="1" stop-color="#aab3be"/></radialGradient></defs>
    <circle cx="50" cy="52" r="34" fill="url(#b10g)"/>
    ${[0, 90, 180, 270].map((a, i) => `<g transform="rotate(${a + 20} 50 52)"><path d="M50 52 m0 -32 c10 4 14 12 10 20 c-4 -4 -12 -4 -16 0 c-4 -8 0 -16 6 -20 Z" fill="#151515"/>
      <path d="M50 22 c6 3 9 8 8 13" fill="none" stroke="${["#ffd200", "#e0121c", "#1fa0e8", "#1fd17a"][i]}" stroke-width="3" stroke-linecap="round"/></g>`).join("")}
    ${[45, 135, 225, 315].map((a) => `<g transform="rotate(${a} 50 52)"><path d="M50 52 m-4 -16 c3 -3 6 -3 8 0" fill="none" stroke="#c9a200" stroke-width="2"/></g>`).join("")}
    <circle cx="50" cy="52" r="34" fill="none" stroke="#7a8592" stroke-width="1"/><ellipse cx="38" cy="36" rx="9" ry="5" fill="#fff" opacity=".8" transform="rotate(-30 38 36)"/>
    <text x="50" y="95" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="8" fill="#ffd23f" letter-spacing="1">MONDIAL 2010</text>`,
  ballondor: () => `<defs><radialGradient id="bdg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6c4"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#9a6a00"/></radialGradient></defs>
    <path d="M32 84 h36 l-4 -8 h-28 Z" fill="#3a2a00"/><rect x="28" y="84" width="44" height="8" rx="2" fill="#2a1d00"/>
    <circle cx="50" cy="46" r="30" fill="url(#bdg)"/><path d="M50 32 l9 6.5 -3.4 10.5 h-11.2 l-3.4 -10.5 Z" fill="#c99400"/>
    ${[[50, 18], [74, 36], [66, 66], [34, 66], [26, 36]].map(([x, y]) => `<path d="M50 46 L${x} ${y}" stroke="#c99400" stroke-width="1.6" opacity=".7"/>`).join("")}
    <ellipse cx="40" cy="32" rx="8" ry="4.5" fill="#fff" opacity=".85" transform="rotate(-30 40 32)"/>`,
  trophee: () => `<defs><linearGradient id="trg" x1="0" x2="1"><stop offset="0" stop-color="#9a6a00"/><stop offset=".45" stop-color="#fff0a0"/><stop offset="1" stop-color="#b07a00"/></linearGradient></defs>
    <path d="M30 18 h40 v12 c0 16 -8 26 -20 28 c-12 -2 -20 -12 -20 -28 Z" fill="url(#trg)"/>
    <path d="M30 22 c-12 0 -14 16 2 20 M70 22 c12 0 14 16 -2 20" fill="none" stroke="#d4a017" stroke-width="4"/>
    <rect x="45" y="56" width="10" height="12" fill="#d4a017"/><path d="M36 68 h28 l4 10 h-36 Z" fill="url(#trg)"/><rect x="30" y="78" width="40" height="10" rx="2" fill="#0b6b3a"/>
    <rect x="30" y="81" width="40" height="2" fill="#ffd23f"/><path d="M38 22 c0 12 3 20 8 26" fill="none" stroke="#fff" stroke-width="2.5" opacity=".6"/>`,
};

// Objets : [id, nom, prix, dessin, anecdote] — arbitre et coach sont dessinés comme les joueurs
const ITEMS_RAW = [
  ["gourde", "Gourde", 100, "gourde", "Une pause fraîcheur peut être accordée par l'arbitre quand il fait très chaud."],
  ["sifflet", "Sifflet d'arbitre", 120, "sifflet", "Les arbitres de football utilisent un sifflet depuis la fin du XIXᵉ siècle."],
  ["piece", "Pièce du toss", 130, "piece", "Le capitaine qui gagne le tirage choisit le côté, l'autre donne le coup d'envoi."],
  ["jaune", "Carton jaune", 150, "jaune", "Les cartons ont été inventés pour la Coupe du monde 1970."],
  ["drapeau", "Drapeau de touche", 180, "drapeau", "Un drapeau levé à l'horizontale signale un hors-jeu."],
  ["spray", "Bombe de spray", 190, "spray", "La mousse qui s'évapore marque la distance du mur, à 9,15 m."],
  ["rouge", "Carton rouge", 200, "rouge", "Deux cartons jaunes dans le même match valent un rouge."],
  ["echarpe", "Écharpe de supporter", 220, "echarpe", "Le douzième homme, celui qui pousse dans les tribunes."],
  ["brassard", "Brassard de capitaine", 250, "brassard", "Le capitaine représente son équipe auprès de l'arbitre."],
  ["panneau", "Panneau de remplacement", 280, "panneau", "Le numéro rouge sort, le vert entre sur la pelouse."],
  ["crampons", "Crampons", 320, "crampons", "Moulés pour terrain sec, vissés pour les pelouses grasses."],
  ["gants", "Gants de gardien", 350, "gants", "Le seul joueur autorisé à toucher le ballon des mains, dans sa surface."],
  ["arbitre", "L'arbitre", 400, "arbitre", "Le maître du temps : c'est lui qui décide du temps additionnel."],
  ["coach", "Le coach", 450, "coach", "Il reste dans sa zone technique… en théorie."],
  ["var", "Écran VAR", 500, "var", "L'assistance vidéo est utilisée en Coupe du monde depuis 2018."],
  ["ballon2010", "Ballon Mondial 2010", 750, "ballon2010", "Le ballon de la Coupe du monde 2010 en Afrique du Sud, réputé pour ses trajectoires imprévisibles."],
  ["trophee", "Trophée de champion", 900, "trophee", "Le rêve de tous les joueurs : soulever la coupe."],
  ["ballondor", "Ballon d'Or", 1000, "ballondor", "La récompense individuelle la plus prestigieuse du football."],
];
const ITEM_CARDS = ITEMS_RAW.map(([id, name, price, art, fact], i) => ({ id, uid: `i:${id}`, name, price, art, fact, num: i + 1, kind: "item", tier: itemTier(price) }));

// ---- Stades (cartes en paysage)
// [id, nom, ville, drapeau, capacité, ouverture, prix, style, anecdote]
const STADIUMS_RAW = [
  ["allianz", "Allianz Arena", "Munich", "🇩🇪", "75 000", 2005, 900, { view: "allianz" }, "Ses 2 874 coussins gonflés s'illuminent en rouge les soirs de match."],
  ["campnou", "Camp Nou", "Barcelone", "🇪🇸", "99 000", 1957, 900, { seats: ["#a50044", "#004d98"], tiers: 3, sky: "dusk" }, "Le plus grand stade d'Europe."],
  ["bernabeu", "Santiago Bernabéu", "Madrid", "🇪🇸", "83 000", 1947, 900, { seats: ["#f2f2f2", "#d4a017"], roof: "steel", sky: "night" }, "Rénové avec un toit rétractable et une façade en acier."],
  ["wembley", "Wembley", "Londres", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "90 000", 2007, 850, { seats: ["#d71920", "#d71920"], feature: "arch", sky: "day" }, "Son arche de 133 m de haut domine Londres."],
  ["maracana", "Maracanã", "Rio de Janeiro", "🇧🇷", "78 000", 1950, 850, { seats: ["#ffd200", "#1d3a8f", "#f2f2f2"], roof: "ring", sky: "day" }, "Près de 200 000 spectateurs pour la finale du Mondial 1950."],
  ["sansiro", "San Siro", "Milan", "🇮🇹", "75 000", 1926, 800, { seats: ["#d71920", "#1d3a8f"], feature: "towers", sky: "night" }, "Ses 11 tours en spirale et sa charpente rouge sont célèbres."],
  ["oldtrafford", "Old Trafford", "Manchester", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "74 000", 1910, 750, { seats: ["#d71920", "#b5121b"], roof: "truss", sky: "dusk" }, "Surnommé « le Théâtre des rêves »."],
  ["dortmund", "Signal Iduna Park", "Dortmund", "🇩🇪", "81 000", 1974, 750, { seats: ["#ffd200", "#ffd200"], feature: "yellow", sky: "night" }, "Son Mur jaune accueille près de 25 000 supporters debout."],
  ["anfield", "Anfield", "Liverpool", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "61 000", 1884, 700, { seats: ["#c8102e", "#c8102e"], roof: "truss", sky: "night" }, "Le Kop chante « You'll Never Walk Alone » avant chaque match."],
  ["parc", "Parc des Princes", "Paris", "🇫🇷", "48 000", 1972, 700, { seats: ["#1d3a8f", "#d71920"], feature: "ribs", sky: "night" }, "Ses 50 consoles de béton forment sa silhouette unique."],
  ["velodrome", "Vélodrome", "Marseille", "🇫🇷", "67 000", 1937, 700, { seats: ["#74b6e6", "#f2f2f2"], feature: "wave", sky: "day" }, "Son toit blanc ondulé a été posé pour l'Euro 2016."],
  ["bombonera", "La Bombonera", "Buenos Aires", "🇦🇷", "54 000", 1940, 650, { seats: ["#1d3a8f", "#ffd200"], feature: "steep", sky: "dusk" }, "Ses tribunes si raides font « trembler » le stade."],
];
const STADIUM_CARDS = STADIUMS_RAW.map(([id, name, city, flag, cap, year, price, look, fact], i) => ({ id, uid: `s:${id}`, name, city, flag, cap, year, price, look, fact, num: i + 1, kind: "stade", tier: itemTier(price) }));
const EXTRA_CARDS = [...ITEM_CARDS, ...STADIUM_CARDS];
// ---- Éditions spéciales : cartes rares, uniquement dans le Méga booster
Object.assign(ITEM_ART, {
  corner: () => `<path d="M14 90 C14 70 24 60 44 60" fill="none" stroke="#fff" stroke-width="3"/><path d="M10 92 h80 M12 94 v-80" stroke="#fff" stroke-width="2" opacity=".5"/>
    <rect x="22" y="14" width="4" height="78" rx="2" fill="#f2f2f2"/><g class="ia-wave"><path d="M26 16 h34 l-8 12 l8 12 h-34 Z" fill="#d71920"/></g><circle cx="24" cy="12" r="3" fill="#ffd23f"/>`,
  billet: () => `<g transform="rotate(-8 50 52)"><rect x="12" y="30" width="76" height="40" rx="5" fill="#fff6d4"/><path d="M66 30 v40" stroke="#c9a200" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="66" cy="30" r="4" fill="#0f6b34"/><circle cx="66" cy="70" r="4" fill="#0f6b34"/>
    <text x="38" y="47" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="12" fill="#d71920">FINALE</text>
    <text x="38" y="59" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-size="7" fill="#333">TRIBUNE A · RANG 7</text>
    <text x="77" y="54" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="9" fill="#333" transform="rotate(-90 77 51)">N° 0007</text>
    <rect x="18" y="62" width="40" height="4" fill="#333" opacity=".5"/></g>`,
  tifo: () => `<rect x="8" y="20" width="84" height="56" rx="3" fill="#1d3a8f"/>${Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (_, j) => `<rect x="${8 + i * 14}" y="${20 + j * 14}" width="14" height="14" fill="${(i + j) % 2 ? "#1d3a8f" : "#2a4fb8"}"/>`).join("")).join("")}
    <path d="M50 66 C30 52 30 34 42 34 C47 34 50 38 50 40 C50 38 53 34 58 34 C70 34 70 52 50 66 Z" fill="#d71920"/>
    ${[18, 82].map((x) => `<path d="M${x} 30 l2 5 5 0 -4 3 2 5 -5 -3 -5 3 2 -5 -4 -3 5 0 Z" fill="#ffd23f"/>`).join("")}
    ${[14, 30, 46, 62, 78].map((x) => `<circle cx="${x + 4}" cy="86" r="5" fill="#2a2d36"/>`).join("")}`,
  megaphone: () => `<path d="M24 42 L70 22 V78 L24 58 Z" fill="#ffd23f"/><rect x="14" y="40" width="12" height="20" rx="3" fill="#333"/><ellipse cx="70" cy="50" rx="6" ry="28" fill="#e0a800"/>
    <path d="M32 58 l4 18 h8 l-3 -15" fill="#333"/>${[0, 1, 2].map((i) => `<path d="M${80 + i * 6} ${38 - i * 4} q6 12 0 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="${1 - i * .25}"/>`).join("")}`,
  tactique: () => `<rect x="10" y="18" width="80" height="62" rx="4" fill="#f7f7f5" stroke="#888" stroke-width="2"/><rect x="16" y="24" width="68" height="50" fill="#2f8f47"/>
    <path d="M50 24 v50 M16 49 h68" stroke="#fff" stroke-width=".8" opacity=".5"/><circle cx="50" cy="49" r="8" fill="none" stroke="#fff" stroke-width=".8" opacity=".5"/>
    ${[[26, 34], [26, 64], [40, 49]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#d71920"/>`).join("")}
    ${[[64, 36], [70, 60]].map(([x, y]) => `<path d="M${x - 3} ${y - 3} l6 6 m0 -6 l-6 6" stroke="#fff" stroke-width="2"/>`).join("")}
    <path d="M40 49 C50 40 56 38 62 38" fill="none" stroke="#ffd23f" stroke-width="2" stroke-dasharray="3 2"/><path d="M62 38 l-5 -2 1 5 Z" fill="#ffd23f"/>
    <rect x="80" y="82" width="12" height="4" rx="2" fill="#1d3a8f" transform="rotate(-30 86 84)"/>`,
  montre: () => `<rect x="38" y="10" width="24" height="80" rx="6" fill="#222"/><circle cx="50" cy="50" r="24" fill="#333"/><circle cx="50" cy="50" r="19" fill="#0b1a10"/>
    <text x="50" y="49" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="11" fill="#2bff6a">90+3</text>
    <text x="50" y="60" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-size="6" fill="#2bff6a" opacity=".7">TEMPS ADD.</text><rect x="73" y="46" width="4" height="8" rx="1" fill="#555"/>`,
  plots: () => [[24, 1], [50, 1.2], [76, 1]].map(([x, k]) => `<g transform="translate(${x} 82) scale(${k})"><path d="M-14 0 L-4 -40 h8 L14 0 Z" fill="#ff7a00"/><path d="M-10 -14 h20 l-2 -8 h-16 Z" fill="#fff"/><rect x="-18" y="-2" width="36" height="5" rx="1" fill="#e05f00"/></g>`).join(""),
  medaille: () => `<path d="M32 8 L46 46 h8 L68 8 H56 L50 30 L44 8 Z" fill="#1d3a8f"/><path d="M44 8 L50 30 L56 8" fill="#d71920"/>
    <circle cx="50" cy="64" r="22" fill="#d4a017"/><circle cx="50" cy="64" r="17" fill="#ffd84a"/><path d="M50 52 l3.5 7.5 8 .8 -6 5.4 1.8 7.9 -7.3 -4.2 -7.3 4.2 1.8 -7.9 -6 -5.4 8 -.8 Z" fill="#d4a017"/>`,
  retro: () => `<defs><radialGradient id="rtg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bfc6cf"/></radialGradient></defs>
    <circle cx="50" cy="50" r="34" fill="url(#rtg)"/><path d="M50 38 l11.4 8.3 -4.4 13.4 h-14 l-4.4 -13.4 Z" fill="#151515"/>
    ${[[50, 16, 0], [82, 40, 72], [70, 78, 144], [30, 78, 216], [18, 40, 288]].map(([x, y, r]) => `<path d="M${x} ${y} l7 5 -2.7 8.2 h-8.6 l-2.7 -8.2 Z" fill="#151515" transform="rotate(${r} ${x} ${y + 6})"/>`).join("")}
    <circle cx="50" cy="50" r="34" fill="none" stroke="#666" stroke-width="1"/><ellipse cx="38" cy="34" rx="8" ry="4.5" fill="#fff" opacity=".8" transform="rotate(-30 38 34)"/>
    <text x="50" y="96" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="8" fill="#ffd23f" letter-spacing="1">RÉTRO 1970</text>`,
  chasuble: () => `<path d="M30 14 h12 c2 8 14 8 16 0 h12 l4 74 H26 Z" fill="#c6ff1a"/>${Array.from({ length: 7 }, (_, i) => Array.from({ length: 5 }, (_, j) => `<circle cx="${34 + j * 8}" cy="${32 + i * 8}" r="1.6" fill="#7aa300"/>`).join("")).join("")}
    <path d="M26 88 h48" stroke="#7aa300" stroke-width="3"/><text x="50" y="64" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="18" fill="#3a5200">12</text>`,
  programme: () => `<g transform="rotate(6 50 50)"><rect x="22" y="12" width="56" height="76" rx="2" fill="#0f6b34"/><rect x="22" y="12" width="56" height="20" fill="#ffd23f"/>
    <text x="50" y="26" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="9" fill="#0f6b34">PROGRAMME</text>
    <circle cx="50" cy="56" r="14" fill="#fff"/><path d="M50 47 l6 4.4 -2.3 7 h-7.4 l-2.3 -7 Z" fill="#151515"/>
    <text x="50" y="82" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-size="7" fill="#fff">JOUR DE MATCH</text></g><rect x="18" y="16" width="56" height="76" rx="2" fill="#000" opacity=".15" transform="rotate(-4 50 50)"/>`,
  echange: () => [["#d71920", -14, -8], ["#1d3a8f", 14, 8]].map(([c, dx, r]) => `<g transform="translate(${dx} 0) rotate(${r} 50 50)"><path d="M36 22 L26 26 L16 40 L24 48 L30 42 V82 H70 V42 L76 48 L84 40 L74 26 L64 22 C60 28 40 28 36 22 Z" fill="${c}" stroke="rgba(0,0,0,.25)"/><text x="50" y="62" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="16" fill="#fff">${dx < 0 ? 10 : 7}</text></g>`).join("") +
    `<path d="M40 88 c6 6 14 6 20 0" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><path d="M58 84 l3 5 -6 0 Z" fill="#ffd23f"/>`,
});
const WEEKLY_RAW = [
  ["corner", "Drapeau de corner", 150, "corner", "Un but marqué directement sur corner s'appelle un « but olympique »."],
  ["billet", "Billet de finale", 220, "billet", "Le précieux sésame que tout supporter rêve de garder en souvenir."],
  ["tifo", "Tifo géant", 480, "tifo", "Certains tifos couvrent toute une tribune et demandent des semaines de préparation."],
  ["megaphone", "Mégaphone du capo", 260, "megaphone", "Le capo lance les chants et donne le rythme à tout le virage."],
  ["tactique", "Tableau tactique", 300, "tactique", "Le schéma qui fait gagner les matchs… sur le papier."],
  ["montre", "Montre de l'arbitre", 280, "montre", "Les montres d'arbitre vibrent quand le ballon franchit la ligne de but."],
  ["plots", "Plots d'entraînement", 160, "plots", "Les fameux plots orange : le cauchemar des séances physiques."],
  ["medaille", "Médaille de champion", 650, "medaille", "Remise à chaque joueur de l'équipe victorieuse d'une finale."],
  ["retro", "Ballon rétro 1970", 700, "retro", "Le ballon noir et blanc à 32 pièces est né pour être bien visible à la télévision."],
  ["chasuble", "Chasuble fluo", 120, "chasuble", "Indispensable pour les remplaçants qui s'échauffent le long de la ligne."],
  ["programme", "Programme de match", 140, "programme", "Les collectionneurs gardent les programmes des grands matchs depuis des décennies."],
  ["echange", "Maillots échangés", 800, "echange", "L'échange de maillots à la fin du match, un geste de respect entre adversaires."],
];
const WEEKLY_CARDS = WEEKLY_RAW.map(([id, name, price, art, fact], i) => ({ id, uid: `w:${id}`, name, price, art, fact, num: i + 1, kind: "item", weekly: true, tier: itemTier(price) }));
EXTRA_CARDS.push(...WEEKLY_CARDS);

// ---- Packs supporter de club : maillot d'avatar + pluie de célébration + carte du stade (si elle existe) + jokers
// [id, club, drapeau, maillot, célébration, stade, prix]
const CLUB_PACKS_RAW = [
  ["om", "Olympique de Marseille", "🇫🇷", { b: "#f7f7f5", p: "plain", c: "#2faee0", t: "#2faee0", nc: "#2faee0" }, ["💙", "🤍", "⚽"], "velodrome", 650],
  ["psg", "Paris Saint-Germain", "🇫🇷", { b: "#0b1f4b", p: "band", c: "#d71920", t: "#f7f7f5", nc: "#f7f7f5" }, ["❤️", "💙", "🗼"], "parc", 650],
  ["real", "Real Madrid", "🇪🇸", { b: "#f7f7f5", p: "plain", c: "#d4a017", t: "#d4a017", nc: "#d4a017" }, ["🤍", "👑", "🏆"], "bernabeu", 750],
  ["barca", "FC Barcelone", "🇪🇸", { b: "#a50044", p: "stripes", c: "#004d98", t: "#ffd200", nc: "#ffd200" }, ["❤️", "💙", "⭐"], "campnou", 750],
  ["bayern", "Bayern Munich", "🇩🇪", { b: "#dc052d", p: "plain", c: "#f7f7f5", t: "#f7f7f5", nc: "#f7f7f5" }, ["❤️", "🤍", "🏆"], "allianz", 750],
  ["liverpool", "Liverpool", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", { b: "#c8102e", p: "plain", c: "#f7f7f5", t: "#f7f7f5", nc: "#f7f7f5" }, ["❤️", "🔴", "🎶"], "anfield", 700],
  ["manu", "Manchester United", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", { b: "#da291c", p: "plain", c: "#f7f7f5", t: "#151515", nc: "#f7f7f5" }, ["😈", "❤️", "⚽"], "oldtrafford", 700],
  ["milan", "AC Milan", "🇮🇹", { b: "#d71920", p: "stripes", c: "#151515", t: "#f7f7f5", nc: "#f7f7f5" }, ["❤️", "🖤", "😈"], "sansiro", 700],
  ["bvb", "Borussia Dortmund", "🇩🇪", { b: "#ffd200", p: "plain", c: "#151515", t: "#151515", nc: "#151515" }, ["💛", "🖤", "🐝"], "dortmund", 700],
  ["boca", "Boca Juniors", "🇦🇷", { b: "#1d3a8f", p: "band", c: "#ffd200", t: "#ffd200", nc: "#ffd200" }, ["💙", "💛", "🎉"], "bombonera", 650],
  ["flamengo", "Flamengo", "🇧🇷", { b: "#d71920", p: "hoops", c: "#151515", t: "#f7f7f5", nc: "#f7f7f5" }, ["❤️", "🖤", "🥁"], "maracana", 650],
  ["juve", "Juventus", "🇮🇹", { b: "#f7f7f5", p: "stripes", c: "#151515", t: "#d4a017", nc: "#d4a017" }, ["🤍", "🖤", "🦓"], null, 450],
  ["arsenal", "Arsenal", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", { b: "#ef0107", p: "plain", c: "#f7f7f5", s: "#f7f7f5", t: "#f7f7f5", nc: "#f7f7f5" }, ["❤️", "🤍", "💥"], null, 450],
  ["ol", "Olympique lyonnais", "🇫🇷", { b: "#f7f7f5", p: "sash", c: "#1d3a8f", t: "#d71920", nc: "#1d3a8f" }, ["🦁", "💙", "❤️"], null, 400],
  ["lens", "RC Lens", "🇫🇷", { b: "#ffd200", p: "plain", c: "#d71920", s: "#d71920", t: "#d71920", nc: "#d71920" }, ["💛", "❤️", "🔥"], null, 400],
  ["asse", "AS Saint-Étienne", "🇫🇷", { b: "#118a3e", p: "plain", c: "#f7f7f5", t: "#f7f7f5", nc: "#f7f7f5" }, ["💚", "🤍", "⭐"], null, 400],
  ["nantes", "FC Nantes", "🇫🇷", { b: "#ffd200", p: "plain", c: "#118a3e", t: "#118a3e", nc: "#118a3e" }, ["💛", "💚", "🐤"], null, 400],
];
const CLUB_PACKS = CLUB_PACKS_RAW.map(([id, club, flag, kit, chars, stadium, price]) => ({
  id, club, flag, kit: { ...kit, sn: "", n: "" }, chars, stadium: STADIUM_CARDS.find((x) => x.id === stadium) || null,
  price: Math.round((price * 0.6) / 10) * 10, // maillot + pluie + jokers (les cartes ne viennent que des boosters)
  kitId: `club-${id}`, celebId: `club-${id}`,
}));


// Stade en vue « télé » (viewBox 280×200)
function stadiumSvg(st) {
  const L = st.look, id = `st${st.id}${++stadiumSvg.n}`;
  const skies = { night: ["#060b24", "#1b2b5e"], day: ["#4fa6ff", "#cfe9ff"], dusk: ["#2a1546", "#ff8a5c"] };
  if (L.view === "allianz") {
    return `<svg class="stadium-art" viewBox="0 0 280 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050818"/><stop offset="1" stop-color="#1a1f4a"/></linearGradient>
      <radialGradient id="${id}g" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#ff5a6a"/><stop offset=".7" stop-color="#e0121c"/><stop offset="1" stop-color="#7a0010"/></radialGradient>
      <clipPath id="${id}c"><path d="M30 118 C30 60 250 60 250 118 C250 150 30 150 30 118 Z"/></clipPath></defs>
      <rect width="280" height="200" fill="url(#${id}s)"/>
      ${Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 53) % 280}" cy="${(i * 29) % 70}" r="${i % 3 ? .8 : 1.3}" fill="#fff" opacity=".8"/>`).join("")}
      <ellipse cx="140" cy="118" rx="140" ry="60" fill="#e0121c" opacity=".25" class="st-glow"/>
      <path d="M0 150 C60 140 220 140 280 150 V200 H0 Z" fill="#0c1020"/>
      <path d="M30 118 C30 60 250 60 250 118 C250 150 30 150 30 118 Z" fill="url(#${id}g)" class="st-glow"/>
      <g clip-path="url(#${id}c)" stroke="#ffd0d4" stroke-opacity=".55" stroke-width="1.2" fill="none">
        ${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 14 - 60} 40 l60 120"/><path d="M${i * 14 + 60} 40 l-60 120"/>`).join("")}</g>
      <path d="M30 118 C30 60 250 60 250 118" fill="none" stroke="#2a0008" stroke-width="3"/>
      <path d="M60 80 C100 70 180 70 220 80" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>
      <path d="M110 200 L132 146 h16 L170 200 Z" fill="#1d2440"/><path d="M138 200 L139 146 h2 L142 200 Z" fill="#ffd23f" opacity=".6"/>
    </svg>`;
  }
  const [s1, s2] = skies[L.sky || "night"];
  const seats = L.seats || ["#888", "#666"];
  const night = (L.sky || "night") === "night";
  // Rayures de pelouse en perspective
  const stripes = Array.from({ length: 12 }, (_, i) => {
    const t0 = i / 12, t1 = (i + 1) / 12;
    const xt = (t) => 40 + t * 200, xb = (t) => -30 + t * 340;
    return i % 2 ? "" : `<path d="M${xt(t0)} 112 L${xt(t1)} 112 L${xb(t1)} 200 L${xb(t0)} 200 Z" fill="#fff" opacity=".07"/>`;
  }).join("");
  const standTop = L.feature === "steep" ? 14 : 38;
  const tiers = L.tiers || 2;
  const tierBands = Array.from({ length: tiers }, (_, i) => {
    const y0 = standTop + 6 + i * ((110 - standTop - 6) / tiers), y1 = standTop + 6 + (i + 1) * ((110 - standTop - 6) / tiers);
    return `<path d="M${16 + i * 4} ${y0} L${264 - i * 4} ${y0} L${262 - i * 4} ${y1} L${18 + i * 4} ${y1} Z" fill="${seats[i % seats.length]}"/>
      <path d="M${16 + i * 4} ${y1 - 1} L${264 - i * 4} ${y1 - 1}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`;
  }).join("");
  let feature = "";
  if (L.feature === "arch") feature = `<path d="M24 112 Q140 -70 256 112" fill="none" stroke="#fff" stroke-width="5"/><path d="M24 112 Q140 -70 256 112" fill="none" stroke="#c9ced6" stroke-width="2"/>
    ${[60, 100, 140, 180, 220].map((x) => `<path d="M${x} ${x === 140 ? 22 : x === 100 || x === 180 ? 32 : 58} L${x} 40" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/>`).join("")}`;
  if (L.feature === "towers") feature = [12, 268].map((x) => `<rect x="${x - 10}" y="16" width="20" height="100" fill="#9aa3ad"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${x - 10} ${26 + i * 16} L${x + 10} ${18 + i * 16}" stroke="#5f6a72" stroke-width="3"/>`).join("")}`).join("") +
    `<path d="M10 24 L270 24" stroke="#d71920" stroke-width="5"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${20 + i * 18} 24 l9 10 l9 -10" fill="none" stroke="#d71920" stroke-width="2.5"/>`).join("")}`;
  if (L.feature === "yellow") feature = `${[30, 90, 150, 210, 250].map((x) => `<rect x="${x}" y="8" width="5" height="32" fill="#ffd200"/><path d="M${x + 2} 8 L${x - 14} 32 M${x + 2} 8 L${x + 18} 32" stroke="#ffd200" stroke-width="1.5"/>`).join("")}`;
  if (L.feature === "ribs") feature = Array.from({ length: 18 }, (_, i) => `<path d="M${18 + i * 14.5} 40 C${16 + i * 14.5} 26 ${24 + i * 14.5} 20 ${26 + i * 14.5} 14" stroke="#cfd3d8" stroke-width="4" fill="none"/>`).join("") + `<path d="M14 40 L266 40" stroke="#b5bac0" stroke-width="5"/>`;
  if (L.feature === "wave") feature = `<path d="M8 40 C30 14 50 14 70 30 C90 14 110 14 140 30 C170 14 190 14 210 30 C230 14 250 14 272 40 Z" fill="#fff" stroke="#dfe6ee" stroke-width="2"/>`;
  if (L.roof === "ring") feature = `<path d="M6 44 C60 20 220 20 274 44 L270 34 C220 10 60 10 10 34 Z" fill="#fff"/><path d="M6 44 C60 20 220 20 274 44" stroke="#c9ced6" stroke-width="2" fill="none"/>`;
  if (L.roof === "steel") feature = `<path d="M8 40 L272 40 L266 14 L14 14 Z" fill="#b8c0c8"/>${Array.from({ length: 20 }, (_, i) => `<path d="M${14 + i * 13} 14 L${10 + i * 13.4} 40" stroke="#eef2f5" stroke-width="2"/>`).join("")}`;
  if (L.roof === "truss") feature = `<path d="M10 40 L270 40 L270 30 L10 30 Z" fill="#f2f2f2"/>${Array.from({ length: 26 }, (_, i) => `<path d="M${10 + i * 10} 30 l5 10 l5 -10" stroke="#c9ced6" stroke-width="1.2" fill="none"/>`).join("")}`;
  const lights = (night || L.sky === "dusk") ? [22, 258].map((x) => `<rect x="${x - 2}" y="4" width="4" height="40" fill="#555"/><rect x="${x - 9}" y="2" width="18" height="8" rx="1" fill="#fff8d0"/><path d="M${x} 10 L${x < 140 ? 120 : 160} 160 L${x < 140 ? 60 : 220} 160 Z" fill="#fff8d0" opacity=".08"/>`).join("") : "";
  return `<svg class="stadium-art" viewBox="0 0 280 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient>
    <pattern id="${id}p" width="7" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#fff" opacity=".55"/><circle cx="5.5" cy="4.5" r="1.1" fill="#000" opacity=".3"/></pattern>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8f47"/><stop offset="1" stop-color="#1c6b31"/></linearGradient></defs>
    <rect width="280" height="200" fill="url(#${id}s)"/>
    ${night ? Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 61) % 280}" cy="${(i * 17) % 34}" r=".9" fill="#fff" opacity=".8"/>`).join("") : ""}
    <path d="M10 ${standTop} L270 ${standTop} L262 112 L18 112 Z" fill="#2a2d36"/>
    ${tierBands}
    <path d="M10 ${standTop} L270 ${standTop} L262 112 L18 112 Z" fill="url(#${id}p)"/>
    <path d="M0 40 L22 44 L40 112 L-30 200 L0 200 Z" fill="${seats[1 % seats.length]}"/><path d="M280 40 L258 44 L240 112 L310 200 L280 200 Z" fill="${seats[1 % seats.length]}"/>
    <path d="M0 40 L22 44 L40 112 L-30 200 L0 200 Z M280 40 L258 44 L240 112 L310 200 L280 200 Z" fill="url(#${id}p)"/>
    ${feature}${lights}
    <path d="M40 112 L240 112 L310 200 L-30 200 Z" fill="url(#${id}g)"/>${stripes}
    <g fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.4">
      <path d="M46 116 L234 116 L296 196 L-16 196 Z"/><path d="M140 116 L140 196"/><ellipse cx="140" cy="150" rx="30" ry="12"/>
      <path d="M46 116 L72 116 L60 196 L-16 196" transform="translate(0 0)"/><path d="M234 116 L208 116 L220 196 L296 196"/>
      <path d="M33 134 L66 134 L60 160 L14 160"/><path d="M247 134 L214 134 L220 160 L266 160"/></g>
    <circle cx="140" cy="150" r="1.6" fill="#fff"/>
  </svg>`;
}
stadiumSvg.n = 0;

// Arbitre et coach : silhouettes de joueurs habillées en conséquence
function itemArtSvg(it) {
  if (it.art === "arbitre") return playerSvg({ id: 900, name: "L'arbitre", pos: "MIL", kit: { b: "#151515", c: "#ffd200", s: "#151515", n: "", hold: "#e0121c" }, poseKey: "referee" });
  if (it.art === "coach") return playerSvg({ id: 901, name: "Le coach", pos: "MIL", kit: { b: "#262a36", c: "#e9e9e9", s: "#262a36", n: "", suit: true }, poseKey: "coach" });
  return `<svg class="item-art" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ITEM_ART[it.art]()}</svg>`;
}

// Face avant d'une carte objet (portrait) ou stade (paysage)
function extraFront(x) {
  const t = ITEM_TIERS[x.tier];
  if (x.kind === "stade") {
    return `<div class="xc-front xs t-${x.tier}">
      <div class="xs-art">${stadiumSvg(x)}</div><div class="xc-shine"></div>
      <div class="xs-top"><span class="xs-flag">${x.flag}</span><span class="xs-name">${x.name}</span></div>
      <div class="xs-foot"><span>${x.city}</span><span>👥 ${x.cap}</span><span>📅 ${x.year}</span><span>S${String(x.num).padStart(2, "0")}</span></div>
    </div>`;
  }
  return `<div class="xc-front xi t-${x.tier}">
    <div class="xi-bg"></div><div class="xc-shine"></div>
    <div class="xi-top"><span>${x.weekly ? "⭐ ÉDITION SPÉCIALE" : "OBJET DE MATCH"}</span><span class="xi-gem">${t.gem}</span></div>
    <div class="xi-art">${itemArtSvg(x)}</div>
    <div class="xi-name">${x.name}</div>
    <div class="xi-foot"><span>${t.label}</span><span>${x.weekly ? "H" : "M"}${String(x.num).padStart(2, "0")}</span></div>
  </div>`;
}
// Emplacement vide : silhouette + prix
function extraBack(x) {
  const art = x.kind === "stade" ? '<span class="xb-emoji">🏟️</span>' : itemArtSvg(x);
  return `<div class="xc-back ${x.kind === "stade" ? "xs" : "xi"}"><div class="xb-art">${art}</div><div class="xb-name">${x.name}</div><div class="xb-price">${x.weekly ? "💎 Méga booster" : "🎁 Dans les boosters"}</div></div>`;
}
