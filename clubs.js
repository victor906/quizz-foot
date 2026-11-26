// Clubs pour les modes « Maillots » et « Tour d'Europe ».
// [nom, ville, drapeau, latitude, longitude, maillot]
// Maillot : { b: couleur principale, p: motif, c: 2e couleur, e: liseré, s: manches, t: col }
// Motifs : plain (uni), stripes (rayures), hoops (cerceaux), halves (moitiés), band (bande centrale),
//          sash (écharpe), diag (diagonale), chevron (V), chest (bande sur la poitrine)
const KC = {
  white: "#f7f7f5", black: "#151515", red: "#d71920", navy: "#14213d", blue: "#1f4fb4", royal: "#0a3d91",
  sky: "#74b6e6", green: "#118a3e", yellow: "#ffd200", orange: "#f47a1f", purple: "#5b2b86", claret: "#7a1f3d",
  gold: "#f6c400", grenat: "#7b1830",
};
const CLUBS_RAW = [
  // France
  ["Paris Saint-Germain", "Paris", "🇫🇷", 48.841, 2.253, { b: KC.navy, p: "band", c: KC.red, e: KC.white, t: KC.red }],
  ["Olympique de Marseille", "Marseille", "🇫🇷", 43.270, 5.396, { b: KC.white, t: KC.sky }],
  ["Olympique Lyonnais", "Lyon", "🇫🇷", 45.765, 4.982, { b: KC.white, p: "chest", c: KC.red, c2: KC.blue, t: KC.blue }],
  ["AS Saint-Étienne", "Saint-Étienne", "🇫🇷", 45.461, 4.390, { b: KC.green, t: KC.white }],
  ["FC Nantes", "Nantes", "🇫🇷", 47.256, -1.525, { b: KC.yellow, t: KC.green }],
  ["RC Lens", "Lens", "🇫🇷", 50.433, 2.815, { b: KC.gold, s: KC.red, t: KC.red }],
  ["LOSC Lille", "Lille", "🇫🇷", 50.612, 3.130, { b: KC.red, t: KC.navy }],
  ["Girondins de Bordeaux", "Bordeaux", "🇫🇷", 44.897, -0.561, { b: KC.navy, p: "chevron", c: KC.white, t: KC.white }],
  ["AS Monaco", "Monaco", "🇲🇨", 43.728, 7.416, { b: KC.white, p: "diag", c: KC.red, t: KC.red }],
  ["Stade Rennais", "Rennes", "🇫🇷", 48.108, -1.713, { b: KC.red, s: KC.black, t: KC.black }],
  ["Toulouse FC", "Toulouse", "🇫🇷", 43.583, 1.434, { b: KC.purple, t: KC.white }],
  ["OGC Nice", "Nice", "🇫🇷", 43.705, 7.193, { b: KC.red, p: "stripes", c: KC.black, t: KC.black }],
  ["RC Strasbourg", "Strasbourg", "🇫🇷", 48.560, 7.755, { b: KC.blue, t: KC.white }],
  ["Montpellier HSC", "Montpellier", "🇫🇷", 43.622, 3.812, { b: KC.navy, s: KC.orange, t: KC.orange }],
  ["AJ Auxerre", "Auxerre", "🇫🇷", 47.787, 3.588, { b: KC.white, t: KC.blue, s: KC.white }],
  ["Stade Brestois", "Brest", "🇫🇷", 48.403, -4.462, { b: KC.red, t: KC.white }],
  ["Stade de Reims", "Reims", "🇫🇷", 49.247, 4.025, { b: KC.red, s: KC.white, t: KC.white }],
  ["FC Metz", "Metz", "🇫🇷", 49.110, 6.160, { b: KC.grenat, t: KC.white }],
  ["FC Lorient", "Lorient", "🇫🇷", 47.749, -3.369, { b: KC.orange, t: KC.black }],
  ["Le Havre AC", "Le Havre", "🇫🇷", 49.499, 0.170, { b: KC.sky, p: "halves", c: KC.navy, t: KC.navy }],
  ["Angers SCO", "Angers", "🇫🇷", 47.460, -0.531, { b: KC.white, p: "stripes", c: KC.black, t: KC.black }],
  ["FC Sochaux", "Montbéliard", "🇫🇷", 47.512, 6.811, { b: KC.yellow, s: KC.navy, t: KC.navy }],
  ["Stade Malherbe Caen", "Caen", "🇫🇷", 49.180, -0.396, { b: KC.blue, p: "halves", c: KC.red, t: KC.white }],
  ["EA Guingamp", "Guingamp", "🇫🇷", 48.566, -3.164, { b: KC.red, p: "stripes", c: KC.black, t: KC.black }],
  ["SC Bastia", "Bastia", "🇫🇷", 42.652, 9.443, { b: KC.blue, t: KC.white }],
  ["AC Ajaccio", "Ajaccio", "🇫🇷", 41.931, 8.774, { b: KC.white, t: KC.red, s: KC.red }],
  ["Grenoble Foot 38", "Grenoble", "🇫🇷", 45.187, 5.740, { b: KC.blue, t: KC.white, s: KC.white }],
  ["Valenciennes FC", "Valenciennes", "🇫🇷", 50.349, 3.531, { b: KC.red, t: KC.white, s: KC.white }],
  ["Clermont Foot", "Clermont-Ferrand", "🇫🇷", 45.816, 3.121, { b: KC.red, p: "chest", c: KC.blue, t: KC.blue }],
  ["Amiens SC", "Amiens", "🇫🇷", 49.894, 2.263, { b: KC.white, t: KC.black, s: KC.black }],
  ["ESTAC Troyes", "Troyes", "🇫🇷", 48.307, 4.099, { b: KC.blue, t: KC.white, s: KC.blue }],
  ["Dijon FCO", "Dijon", "🇫🇷", 47.325, 5.068, { b: KC.red, t: KC.white, s: KC.red }],
  ["Nîmes Olympique", "Nîmes", "🇫🇷", 43.816, 4.359, { b: KC.red, t: KC.white, s: KC.white }],
  ["Paris FC", "Paris", "🇫🇷", 48.818, 2.346, { b: KC.navy, t: KC.sky, s: KC.navy }],
  ["Stade Lavallois", "Laval", "🇫🇷", 48.077, -0.771, { b: KC.orange, t: KC.black, s: KC.black }],
  // Espagne
  ["Real Madrid", "Madrid", "🇪🇸", 40.453, -3.688, { b: KC.white, t: KC.gold }],
  ["FC Barcelone", "Barcelone", "🇪🇸", 41.381, 2.123, { b: "#a50044", p: "stripes", c: "#004d98", t: KC.gold }],
  ["Atlético de Madrid", "Madrid", "🇪🇸", 40.436, -3.600, { b: KC.white, p: "stripes", c: KC.red, t: KC.blue }],
  ["Athletic Bilbao", "Bilbao", "🇪🇸", 43.264, -2.950, { b: KC.white, p: "stripes", c: KC.red, t: KC.black }],
  ["Valence CF", "Valence", "🇪🇸", 39.474, -0.358, { b: KC.white, t: KC.black }],
  ["Séville FC", "Séville", "🇪🇸", 37.384, -5.971, { b: KC.white, t: KC.red }],
  ["Real Betis", "Séville", "🇪🇸", 37.356, -5.982, { b: KC.white, p: "stripes", c: KC.green, t: KC.green }],
  ["Real Sociedad", "Saint-Sébastien", "🇪🇸", 43.301, -1.974, { b: KC.white, p: "stripes", c: KC.blue, t: KC.blue }],
  ["Villarreal CF", "Villarreal", "🇪🇸", 39.944, -0.104, { b: KC.yellow, t: KC.blue }],
  ["Celta Vigo", "Vigo", "🇪🇸", 42.212, -8.740, { b: KC.sky, t: KC.white }],
  ["Rayo Vallecano", "Madrid", "🇪🇸", 40.392, -3.659, { b: KC.white, p: "sash", c: KC.red, t: KC.red }],
  ["Espanyol", "Barcelone", "🇪🇸", 41.348, 2.075, { b: KC.white, p: "stripes", c: "#0055a5", t: "#0055a5", s: KC.white }],
  ["Deportivo La Corogne", "La Corogne", "🇪🇸", 43.369, -8.417, { b: KC.white, p: "stripes", c: KC.blue, t: KC.white, s: KC.blue }],
  // Italie
  ["Juventus", "Turin", "🇮🇹", 45.110, 7.641, { b: KC.white, p: "stripes", c: KC.black, t: KC.black }],
  ["AC Milan", "Milan", "🇮🇹", 45.478, 9.124, { b: KC.red, p: "stripes", c: KC.black, t: KC.black }],
  ["Inter Milan", "Milan", "🇮🇹", 45.478, 9.124, { b: KC.blue, p: "stripes", c: KC.black, t: KC.black }],
  ["AS Rome", "Rome", "🇮🇹", 41.934, 12.455, { b: "#8e1f2f", t: KC.orange }],
  ["Lazio Rome", "Rome", "🇮🇹", 41.934, 12.455, { b: KC.sky, t: KC.white }],
  ["SSC Naples", "Naples", "🇮🇹", 40.828, 14.193, { b: "#12a0d7", t: KC.white }],
  ["Fiorentina", "Florence", "🇮🇹", 43.781, 11.282, { b: KC.purple, t: KC.white }],
  ["Atalanta", "Bergame", "🇮🇹", 45.709, 9.681, { b: KC.black, p: "stripes", c: "#1e71b8", t: KC.black }],
  ["Bologne FC", "Bologne", "🇮🇹", 44.492, 11.310, { b: KC.red, p: "stripes", c: KC.navy, t: KC.white }],
  ["Genoa", "Gênes", "🇮🇹", 44.416, 8.952, { b: KC.red, p: "halves", c: KC.navy, t: KC.navy }],
  // Allemagne
  ["Bayern Munich", "Munich", "🇩🇪", 48.219, 11.625, { b: KC.red, t: KC.white }],
  ["Borussia Dortmund", "Dortmund", "🇩🇪", 51.493, 7.452, { b: KC.yellow, t: KC.black, s: KC.yellow }],
  ["Schalke 04", "Gelsenkirchen", "🇩🇪", 51.555, 7.068, { b: KC.royal, t: KC.white }],
  ["Bayer Leverkusen", "Leverkusen", "🇩🇪", 51.038, 7.002, { b: KC.red, s: KC.black, t: KC.black }],
  ["Hambourg SV", "Hambourg", "🇩🇪", 53.587, 9.899, { b: KC.white, t: KC.red }],
  ["Werder Brême", "Brême", "🇩🇪", 53.066, 8.838, { b: KC.green, t: KC.white }],
  ["Eintracht Francfort", "Francfort", "🇩🇪", 50.069, 8.645, { b: KC.black, t: KC.red }],
  ["VfB Stuttgart", "Stuttgart", "🇩🇪", 48.792, 9.232, { b: KC.white, p: "chest", c: KC.red, t: KC.red }],
  ["Borussia Mönchengladbach", "Mönchengladbach", "🇩🇪", 51.175, 6.385, { b: KC.white, t: KC.green }],
  ["RB Leipzig", "Leipzig", "🇩🇪", 51.346, 12.348, { b: KC.white, t: KC.red, s: KC.white }],
  ["Union Berlin", "Berlin", "🇩🇪", 52.457, 13.568, { b: KC.red, t: KC.white }],
  ["Hertha Berlin", "Berlin", "🇩🇪", 52.515, 13.239, { b: KC.white, p: "stripes", c: KC.blue, t: KC.blue }],
  // Angleterre et Écosse
  ["Liverpool", "Liverpool", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 53.431, -2.961, { b: KC.red, t: KC.red }],
  ["Everton", "Liverpool", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 53.425, -3.002, { b: KC.royal, t: KC.white }],
  ["Manchester United", "Manchester", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 53.463, -2.291, { b: KC.red, t: KC.white }],
  ["Manchester City", "Manchester", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 53.483, -2.200, { b: "#6cabdd", t: KC.white }],
  ["Arsenal", "Londres", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 51.555, -0.108, { b: KC.red, s: KC.white, t: KC.white }],
  ["Chelsea", "Londres", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 51.482, -0.191, { b: "#034694", t: KC.white }],
  ["Tottenham", "Londres", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 51.604, -0.066, { b: KC.white, t: KC.navy }],
  ["West Ham", "Londres", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 51.539, -0.017, { b: KC.claret, s: KC.sky, t: KC.sky }],
  ["Newcastle", "Newcastle", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 54.976, -1.622, { b: KC.white, p: "stripes", c: KC.black, t: KC.black }],
  ["Aston Villa", "Birmingham", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 52.509, -1.885, { b: KC.claret, s: KC.sky, t: KC.sky }],
  ["Leeds United", "Leeds", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 53.778, -1.572, { b: KC.white, t: KC.yellow }],
  ["Nottingham Forest", "Nottingham", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 52.940, -1.133, { b: KC.red, t: KC.white, s: KC.red }],
  ["Sunderland", "Sunderland", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 54.915, -1.388, { b: KC.white, p: "stripes", c: KC.red, t: KC.black, s: KC.red }],
  ["Crystal Palace", "Londres", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 51.398, -0.086, { b: KC.red, p: "stripes", c: KC.blue, t: KC.blue }],
  ["Brighton", "Brighton", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", 50.862, -0.083, { b: KC.white, p: "stripes", c: "#0057b8", t: "#0057b8", s: "#0057b8" }],
  ["Celtic", "Glasgow", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", 55.850, -4.206, { b: KC.white, p: "hoops", c: KC.green, t: KC.green }],
  ["Rangers", "Glasgow", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", 55.853, -4.309, { b: KC.royal, t: KC.red }],
  // Pays-Bas, Belgique, Portugal
  ["Ajax Amsterdam", "Amsterdam", "🇳🇱", 52.314, 4.942, { b: KC.white, p: "band", c: KC.red, t: KC.white }],
  ["PSV Eindhoven", "Eindhoven", "🇳🇱", 51.442, 5.468, { b: KC.white, p: "stripes", c: KC.red, t: KC.white }],
  ["Feyenoord", "Rotterdam", "🇳🇱", 51.894, 4.523, { b: KC.red, p: "halves", c: KC.white, t: KC.black }],
  ["Benfica", "Lisbonne", "🇵🇹", 38.753, -9.185, { b: KC.red, t: KC.white, s: KC.red }],
  ["Sporting CP", "Lisbonne", "🇵🇹", 38.761, -9.161, { b: KC.white, p: "hoops", c: KC.green, t: KC.green, s: KC.white }],
  ["FC Porto", "Porto", "🇵🇹", 41.162, -8.584, { b: KC.white, p: "stripes", c: KC.blue, t: KC.blue }],
  ["SC Braga", "Braga", "🇵🇹", 41.563, -8.430, { b: KC.red, s: KC.white, t: KC.red }],
  ["Anderlecht", "Bruxelles", "🇧🇪", 50.834, 4.298, { b: KC.purple, t: KC.white, s: KC.purple }],
  ["Club Bruges", "Bruges", "🇧🇪", 51.193, 3.181, { b: KC.blue, p: "stripes", c: KC.black, t: KC.blue }],
  ["Standard de Liège", "Liège", "🇧🇪", 50.610, 5.543, { b: KC.red, t: KC.red, s: KC.red }],
  // Turquie, Grèce, Suisse, Autriche
  ["Galatasaray", "Istanbul", "🇹🇷", 41.103, 28.991, { b: KC.yellow, p: "halves", c: KC.red, t: KC.red }],
  ["Fenerbahçe", "Istanbul", "🇹🇷", 40.988, 29.037, { b: KC.yellow, p: "stripes", c: KC.navy, t: KC.navy }],
  ["Beşiktaş", "Istanbul", "🇹🇷", 41.039, 29.002, { b: KC.white, p: "stripes", c: KC.black, t: KC.white }],
  ["Olympiakos", "Le Pirée", "🇬🇷", 37.946, 23.664, { b: KC.white, p: "stripes", c: KC.red, t: KC.red }],
  ["Panathinaïkos", "Athènes", "🇬🇷", 37.987, 23.753, { b: KC.green, t: KC.white, s: KC.green }],
  ["FC Bâle", "Bâle", "🇨🇭", 47.541, 7.620, { b: KC.red, p: "halves", c: KC.blue, t: KC.white }],
  ["Young Boys", "Berne", "🇨🇭", 46.963, 7.465, { b: KC.yellow, t: KC.black, s: KC.black }],
  ["Rapid Vienne", "Vienne", "🇦🇹", 48.198, 16.266, { b: KC.green, t: KC.white, s: KC.green }],
  ["RB Salzbourg", "Salzbourg", "🇦🇹", 47.816, 12.998, { b: KC.white, t: KC.red, s: KC.red }],
  // Europe centrale, de l'Est et du Nord
  ["Dinamo Zagreb", "Zagreb", "🇭🇷", 45.819, 16.018, { b: KC.blue, t: KC.white, s: KC.blue }],
  ["Hajduk Split", "Split", "🇭🇷", 43.519, 16.432, { b: KC.white, t: KC.blue, s: KC.white }],
  ["Étoile rouge de Belgrade", "Belgrade", "🇷🇸", 44.783, 20.465, { b: KC.white, p: "stripes", c: KC.red, t: KC.red, s: KC.red }],
  ["Partizan Belgrade", "Belgrade", "🇷🇸", 44.789, 20.459, { b: KC.white, p: "stripes", c: KC.black, t: KC.black, s: KC.black }],
  ["Dynamo Kiev", "Kiev", "🇺🇦", 50.433, 30.522, { b: KC.white, t: KC.blue, s: KC.blue }],
  ["Sparta Prague", "Prague", "🇨🇿", 50.100, 14.416, { b: "#7b1c30", t: KC.white, s: "#7b1c30" }],
  ["Slavia Prague", "Prague", "🇨🇿", 50.068, 14.471, { b: KC.red, p: "halves", c: KC.white, t: KC.white, s: KC.white }],
  ["FC Copenhague", "Copenhague", "🇩🇰", 55.703, 12.572, { b: KC.white, t: KC.navy, s: KC.navy }],
  ["Malmö FF", "Malmö", "🇸🇪", 55.584, 12.988, { b: KC.sky, t: KC.white, s: KC.sky }],
  ["Legia Varsovie", "Varsovie", "🇵🇱", 52.220, 21.041, { b: KC.white, p: "chest", c: KC.green, c2: KC.red, t: KC.green }],
  ["Ferencváros", "Budapest", "🇭🇺", 47.482, 19.098, { b: KC.white, p: "stripes", c: KC.green, t: KC.green, s: KC.green }],
];
const CLUBS = CLUBS_RAW.map(([name, city, flag, lat, lon, kit], i) => ({ id: i, name, city, flag, lat, lon, kit }));

// Dessin d'un maillot (SVG)
let kitUid = 0;
function kitSvg(kit, cls = "kit") {
  const id = `kit${++kitUid}`;
  const b = kit.b, c = kit.c || KC.white, t = kit.t || c, p = kit.p || "plain";
  const SHIRT = "M33 14 L19 19 L4 36 L15 49 L25 41 L25 93 Q50 97 75 93 L75 41 L85 49 L96 36 L81 19 L67 14 Q60 24 50 24 Q40 24 33 14 Z";
  let pat = "";
  if (p === "stripes") for (let x = 31; x < 100; x += 14) pat += `<rect x="${x}" y="0" width="7" height="100" fill="${c}"/><rect x="${100 - x - 7}" y="0" width="7" height="100" fill="${c}"/>`;
  else if (p === "hoops") for (let y = 30; y < 100; y += 14) pat += `<rect x="0" y="${y}" width="100" height="7" fill="${c}"/>`;
  else if (p === "halves") pat = `<rect x="50" y="0" width="50" height="100" fill="${c}"/>`;
  else if (p === "band") pat = (kit.e ? `<rect x="39" y="0" width="22" height="100" fill="${kit.e}"/>` : "") + `<rect x="41.5" y="0" width="17" height="100" fill="${c}"/>`;
  else if (p === "sash") pat = `<polygon points="34,10 20,16 62,100 78,100" fill="${c}"/>`;
  else if (p === "diag") pat = `<polygon points="0,0 100,0 100,22 0,78" fill="${c}"/>`;
  else if (p === "chevron") pat = `<polyline points="24,22 50,54 76,22" fill="none" stroke="${c}" stroke-width="9"/>`;
  else if (p === "stars") for (let i = 0; i < 16; i++) pat += `<text x="${(i * 37) % 86 + 8}" y="${(i * 53) % 74 + 26}" font-size="9" fill="${c}" text-anchor="middle">★</text>`;
  else if (p === "confetti") { const cs = ["#ffd23f", "#e0453a", "#1fa85a", "#2f7de1", "#ff7ac8", "#fff"]; for (let i = 0; i < 26; i++) pat += `<rect x="${(i * 41) % 88 + 4}" y="${(i * 29) % 78 + 18}" width="5" height="3" rx="1" fill="${cs[i % cs.length]}" transform="rotate(${(i * 47) % 180} ${(i * 41) % 88 + 6} ${(i * 29) % 78 + 19})"/>`; }
  else if (p === "rainbow") ["#e0453a", "#f47a1f", "#ffd200", "#1fa85a", "#2f7de1", "#5b2b86"].forEach((col, i) => { pat += `<rect x="0" y="${18 + i * 13}" width="100" height="13" fill="${col}"/>`; });
  else if (p === "gold") pat = `<rect width="100" height="100" fill="url(#${id}au)"/>`;
  else if (p === "chest") pat = `<rect x="0" y="40" width="100" height="9" fill="${c}"/>` + (kit.c2 ? `<rect x="0" y="49" width="100" height="6" fill="${kit.c2}"/>` : "");
  const sleeves = kit.s
    ? `<path d="M33 14 L19 19 L4 36 L15 49 L25 41 L26 22 Z M67 14 L81 19 L96 36 L85 49 L75 41 L74 22 Z" fill="${kit.s}"/>`
    : "";
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">
    <defs><clipPath id="${id}c"><path d="${SHIRT}"/></clipPath>
    <linearGradient id="${id}au" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".35" stop-color="#f2c230"/><stop offset=".6" stop-color="#b8860b"/><stop offset="1" stop-color="#ffe27a"/></linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
    <g clip-path="url(#${id}c)"><rect width="100" height="100" fill="${b}"/>${pat}${sleeves}
      <path d="M4 36 L15 49" stroke="${t}" stroke-width="5"/><path d="M96 36 L85 49" stroke="${t}" stroke-width="5"/>
      ${kitPrint(kit, t)}
      <rect width="100" height="100" fill="url(#${id}g)"/></g>
    <path d="M33 14 Q40 24 50 24 Q60 24 67 14" fill="none" stroke="${t}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="${SHIRT}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`;
}
// Flocage : nom au-dessus du numéro, étoiles éventuelles
function kitPrint(kit, t) {
  const col = kit.nc || t;
  const esc = (x) => String(x).replace(/[<>&"]/g, "");
  let out = "";
  if (kit.stars) {
    const n = Math.min(5, kit.stars);
    for (let i = 0; i < n; i++) out += `<text x="${50 + (i - (n - 1) / 2) * 7}" y="${kit.sn ? 33 : 38}" text-anchor="middle" font-size="7" fill="#ffd23f" stroke="rgba(0,0,0,.4)" stroke-width=".4">★</text>`;
  }
  const name = kit.sn ? esc(kit.sn).toUpperCase().slice(0, 12) : "";
  if (name) {
    const fs = Math.min(11, 66 / Math.max(4, name.length) * 1.45);
    out += `<text x="50" y="${kit.n ? 46 : 58}" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="${fs.toFixed(1)}" letter-spacing=".4" fill="${col}" stroke="rgba(0,0,0,.3)" stroke-width=".4">${name}</text>`;
  }
  if (kit.n) out += `<text x="50" y="${name ? 74 : 68}" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="${name ? 27 : 30}" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width=".8">${esc(kit.n).slice(0, 2)}</text>`;
  return out;
}
// Deux maillots identiques ne doivent jamais être proposés dans la même question
const kitSignature = (k) => [k.b, k.p || "plain", k.c || "", k.s && k.s !== k.b ? k.s : "", k.c2 || ""].join("|");

// Couleurs regroupées par famille, pour savoir si deux maillots se ressemblent à l'œil
function colorGroup(hex) {
  const n = parseInt((hex || "#ffffff").slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (l > 0.86) return "blanc";
  if (l < 0.17) return "noir";
  if (sat < 0.15) return "gris";
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 15 || h >= 335) return l < 0.36 ? "bordeaux" : "rouge";
  if (h < 42) return "orange";
  if (h < 70) return "jaune";
  if (h < 170) return "vert";
  if (h < 250) return l > 0.55 ? "ciel" : "bleu";
  if (h < 300) return "violet";
  return l < 0.4 ? "bordeaux" : "rose";
}
// « Allure » d'un maillot : motif + familles de couleurs visibles
function kitLook(k) {
  const p = k.p || "plain";
  const parts = [p, colorGroup(k.b)];
  if (p !== "plain") parts.push(colorGroup(k.c));
  if (k.c2) parts.push(colorGroup(k.c2));
  if (k.s && colorGroup(k.s) !== colorGroup(k.b)) parts.push("manches-" + colorGroup(k.s));
  return parts.join("|");
}

// Avatar « Tête de CR7 » : caricature originale en dessin animé (pas une photo)
function cr7FaceSvg(cls = "face") {
  const id = `cf${++cr7FaceSvg.n}`;
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <radialGradient id="${id}s" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#f0bd8f"/><stop offset=".7" stop-color="#d99a6c"/><stop offset="1" stop-color="#b9774c"/></radialGradient>
    <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2c17"/><stop offset="1" stop-color="#1c0f07"/></linearGradient>
    <linearGradient id="${id}j" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e1242f"/><stop offset="1" stop-color="#a50e1b"/></linearGradient>
    <clipPath id="${id}c"><circle cx="50" cy="50" r="49"/></clipPath>
    <radialGradient id="${id}bg" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff6cf"/><stop offset=".6" stop-color="#ffd23f"/><stop offset="1" stop-color="#d49a00"/></radialGradient>
  </defs>
  <g clip-path="url(#${id}c)">
  <circle cx="50" cy="50" r="49" fill="url(#${id}bg)"/>
  <!-- Épaules : maillot rouge, col vert, le 7 -->
  <path d="M10 100 C12 82 26 76 40 74 H60 C74 76 88 82 90 100 Z" fill="url(#${id}j)"/>
  <path d="M40 74 L50 84 L60 74" fill="none" stroke="#0a7a3c" stroke-width="4" stroke-linejoin="round"/>
  <text x="70" y="90" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="12" fill="#ffd23f">7</text>
  <!-- Cou -->
  <path d="M41 62 H59 V77 C55 81 45 81 41 77 Z" fill="#c98558"/>
  <!-- Oreilles + boucle d'oreille diamant -->
  <ellipse cx="27" cy="46" rx="5" ry="7.5" fill="url(#${id}s)"/>
  <ellipse cx="73" cy="46" rx="5" ry="7.5" fill="url(#${id}s)"/>
  <path d="M27 52.5 l1.4 1.9 l-1.4 1.9 l-1.4 -1.9 Z" fill="#e8f6ff" stroke="#7ec8f0" stroke-width=".6"/>
  <path d="M73 52.5 l1.4 1.9 l-1.4 1.9 l-1.4 -1.9 Z" fill="#e8f6ff" stroke="#7ec8f0" stroke-width=".6"/>
  <!-- Visage : mâchoire carrée -->
  <path d="M29 36 C29 22 38 15 50 15 C62 15 71 22 71 36 V48 C71 58 64 67 56 69 H44 C36 67 29 58 29 48 Z" fill="url(#${id}s)"/>
  <!-- Cheveux : côtés dégradés courts, mèche relevée sur le dessus -->
  <path d="M29 38 C27 26 31 17 40 13 C46 10 56 10 62 13 C69 16 72 25 71 38 C69 31 67 28 64 27 C58 25 44 25 37 27 C33 28 31 31 29 38 Z" fill="#6d4a33" opacity=".55"/>
  <path d="M33 27 C33 15 41 7 53 7 C61 7 69 10 72 17 C70 16 68 16 66 17 C67 20 66 24 63 26 C56 23 44 23 36 27 Z" fill="url(#${id}h)"/>
  <path d="M44 11 C50 8 60 9 66 14" fill="none" stroke="#7a5236" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
  <path d="M40 15 C46 12 54 12 59 15" fill="none" stroke="#7a5236" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>
  <!-- Sourcils -->
  <path d="M35 37 C38 34 43 34 46 36" fill="none" stroke="#2a170b" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M54 36 C57 34 62 34 65 37" fill="none" stroke="#2a170b" stroke-width="2.6" stroke-linecap="round"/>
  <!-- Yeux -->
  <ellipse cx="41" cy="42" rx="4.2" ry="3" fill="#fff"/><ellipse cx="59" cy="42" rx="4.2" ry="3" fill="#fff"/>
  <circle cx="41.6" cy="42.2" r="2.1" fill="#4a2a14"/><circle cx="58.4" cy="42.2" r="2.1" fill="#4a2a14"/>
  <circle cx="42.2" cy="41.5" r=".7" fill="#fff"/><circle cx="59" cy="41.5" r=".7" fill="#fff"/>
  <!-- Nez -->
  <path d="M50 44 C49 49 47 51 47 52.5 C48.5 53.6 51.5 53.6 53 52.5" fill="none" stroke="#a8673f" stroke-width="1.4" stroke-linecap="round"/>
  <!-- Grand sourire confiant -->
  <path d="M40 57 C44 62.5 56 62.5 60 57 C56 58.6 44 58.6 40 57 Z" fill="#fff" stroke="#8a3d22" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M38.5 56.2 C39.5 55.6 40.5 56.3 40 57" fill="none" stroke="#a8673f" stroke-width="1" stroke-linecap="round"/>
  <path d="M61.5 56.2 C60.5 55.6 59.5 56.3 60 57" fill="none" stroke="#a8673f" stroke-width="1" stroke-linecap="round"/>
  <!-- Fossette au menton -->
  <path d="M49 65 C49.6 66 50.4 66 51 65" fill="none" stroke="#a8673f" stroke-width="1" stroke-linecap="round"/>
  </g>
  <circle cx="50" cy="50" r="48.5" fill="none" stroke="#b8860b" stroke-width="1.4"/>
</svg>`;
}
cr7FaceSvg.n = 0;
