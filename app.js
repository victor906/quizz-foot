(() => {
  const TIME_SINGLE = 20;
  const TIME_MULTI = 30;
  const LETTERS = ["A", "B", "C", "D", "E", "F"];
  const $ = (id) => document.getElementById(id);

  // ---------- Difficultés et époques ----------
  const DIFFS = [
    { id: "f", label: "Facile", stars: "★" },
    { id: "m", label: "Moyen", stars: "★★" },
    { id: "d", label: "Difficile", stars: "★★★" },
  ];
  const ERAS_GENERAL = [
    { id: "O", label: "Les origines", range: "1863-1929" },
    { id: "A", label: "1930-1969", range: "" },
    { id: "B", label: "1970-1999", range: "" },
    { id: "C", label: "2000-2019", range: "" },
    { id: "D", label: "2020-2026", range: "" },
    { id: "X", label: "Toutes époques", range: "règles, records, culture" },
  ];
  // Époques du mode Superfan (carrière de Cristiano Ronaldo)
  const ERAS_CR7 = [
    { id: "B", label: "Enfance", range: "avant 2002" },
    { id: "C", label: "2002-2019", range: "" },
    { id: "D", label: "2020-2026", range: "" },
    { id: "X", label: "Toute la carrière", range: "" },
  ];
  let ERAS = ERAS_GENERAL;
  const diffOf = (id) => DIFFS.find((d) => d.id === id) || DIFFS[1];
  const eraOf = (id) => ERAS.find((e) => e.id === id) || ERAS[ERAS.length - 1];

  // ---------- Construction des banques de questions ----------
  const build = (single, multi) => single.map(([cat, q, answers, explain, diff, era]) => ({
    key: q,
    cat,
    q,
    multi: false,
    correct: [answers[0]],
    answers,
    explain,
    diff,
    era,
  })).concat(
    multi.map(([cat, q, good, bad, explain, diff, era]) => ({
      key: q,
      cat,
      q,
      multi: true,
      correct: good,
      answers: [...good, ...bad],
      explain,
      diff,
      era,
    }))
  );

  // Deux quiz : le quiz général et le mode Superfan Cristiano Ronaldo
  const BANKS = {
    general: { questions: build([...QUESTIONS_RAW, ...QUESTIONS_PLUS_RAW, ...QUESTIONS_EXTRA_RAW], QUESTIONS_MULTI_RAW), eras: ERAS_GENERAL },
    cr7: { questions: build(CR7_RAW, CR7_MULTI_RAW), eras: ERAS_CR7 },
  };
  Object.values(BANKS).forEach((b) => {
    b.categories = [...new Set(b.questions.map((q) => q.cat))];
    b.cats = new Set(b.categories);
    b.eraSel = new Set(b.eras.map((e) => e.id));
  });
  let QUESTIONS = BANKS.general.questions;

  // ---------- Question bonus ----------
  const BONUS_CHANCE = 0.5;
  const BONUS_QUESTION = {
    key: "__bonus-ballon-dor-2018__",
    bonus: true,
    cat: "🎁 Question bonus",
    q: "Qui a remporté le Ballon d'Or 2018 ?",
    multi: false,
    correct: ["Luka Modrić"],
    answers: ["Tigrou", "Maître Fufucheng", "La Fête", "Le Poulet", "Luka Modrić"],
    explain: "Luka Modrić, bien sûr ! Ni Tigrou, ni Maître Fufucheng, ni La Fête, ni Le Poulet… même si la concurrence était rude.",
    diff: "f",
    era: "C",
  };
  const ALL_QUESTION_COUNT = () => BANKS.general.questions.length + BANKS.cr7.questions.length;
  // Total affiché du quiz général : ses questions + la question bonus
  const GENERAL_TOTAL = () => BANKS.general.questions.length + 1;
  let categories = BANKS.general.categories;

  const state = {
    count: "20",
    theme: "general",
    cats: BANKS.general.cats,
    diffs: new Set(DIFFS.map((d) => d.id)),
    eras: BANKS.general.eraSel,
    timer: true,
    list: [],
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: [],
    tick: null,
    timeLeft: TIME_SINGLE,
    timeMax: TIME_SINGLE,
    answered: false,
    selected: new Set(),
    play: "classic",
    inGame: false,
    coinsEarned: 0,
    players: [],
  };

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, v) { try { localStorage.setItem(key, v); } catch { /* ignore */ } },
  };

  // ---------- Mémoire des questions déjà vues ----------
  const SEEN_KEY = "fqf-seen";
  let seen = new Set();
  try { seen = new Set(JSON.parse(storage.get(SEEN_KEY) || "[]")); } catch { seen = new Set(); }
  const saveSeen = () => storage.set(SEEN_KEY, JSON.stringify([...seen]));

  // ---------- Trophées ----------
  const STATS_KEY = "fqf-stats";
  const TROPHY_KEY = "fqf-trophies";
  const EVER_KEY = "fqf-ever";
  const STAT_DEFAULTS = {
    correct: 0, games: 0, bestStreak: 0, hard: 0, multi: 0, origins: 0, fast: 0,
    zenGames: 0, cr7Games: 0, cr7Correct: 0, cr7Perfect: 0, cr7BestStreak: 0,
    perfect10: 0, perfect20: 0, marathon: 0, fullGames: 0,
    kitCorrect: 0, kitPerfect: 0, geoBest: 0, geoBullseye: 0,
    geoCountryPerfect: 0, worldBest: 0, derbyCorrect: 0, whoamiFirst: 0, careerCorrect: 0, orderCorrect: 0, namesCorrect: 0, hiloBest: 0,
    bossBeaten: 0, duelGames: 0, leagueSeasons: 0, avatarMade: 0, kitsBought: 0,
    suddenBest: 0, rushBest: 0, dailyBestStreak: 0, partyGames: 0, reviewFixed: 0, purchases: 0, jokersUsed: 0,
  };
  let stats = { ...STAT_DEFAULTS };
  try { stats = { ...STAT_DEFAULTS, ...JSON.parse(storage.get(STATS_KEY) || "{}") }; } catch { /* valeurs par défaut */ }
  let unlocked = {};
  try { unlocked = JSON.parse(storage.get(TROPHY_KEY) || "{}"); } catch { unlocked = {}; }
  let everSeen = new Set();
  try { everSeen = new Set(JSON.parse(storage.get(EVER_KEY) || "[]")); } catch { everSeen = new Set(); }
  const saveStats = () => storage.set(STATS_KEY, JSON.stringify(stats));

  // ---------- Pièces, jokers, erreurs à réviser, défi du jour ----------
  const readJSON = (key, def) => { try { return { ...def, ...JSON.parse(storage.get(key) || "{}") }; } catch { return { ...def }; } };
  let coins = Number(storage.get("fqf-coins"));
  if (storage.get("fqf-coins") === null || Number.isNaN(coins)) {
    // Cadeau de bienvenue : 50 pièces + la récompense des trophées déjà gagnés
    coins = 50 + TROPHIES.filter((t) => unlocked[t.id]).reduce((n, t) => n + (TROPHY_REWARD[t.tier] || 0), 0);
    storage.set("fqf-coins", String(coins));
  }
  let jokers = readJSON("fqf-jokers", { fifty: 1, time: 1, skip: 1 });
  const saveJokers = () => storage.set("fqf-jokers", JSON.stringify(jokers));
  let missed = new Set();
  try { missed = new Set(JSON.parse(storage.get("fqf-missed") || "[]")); } catch { missed = new Set(); }
  const saveMissed = () => storage.set("fqf-missed", JSON.stringify([...missed]));
  let daily = readJSON("fqf-daily", { last: "", streak: 0, best: 0, scores: {} });
  const saveDaily = () => storage.set("fqf-daily", JSON.stringify(daily));
  function addCoins(n) {
    if (!n) return;
    coins += n;
    storage.set("fqf-coins", String(coins));
    if (state && state.inGame) state.coinsEarned += n;
    renderWallet();
  }
  function renderWallet() {
    const h = document.getElementById("home-coins");
    if (h) h.textContent = `🪙 ${coins}`;
    const sc = document.getElementById("shop-coins");
    if (sc) sc.textContent = `🪙 ${coins}`;
  }
  const saveEver = () => storage.set(EVER_KEY, JSON.stringify([...everSeen]));

  const fullStats = () => ({
    ...stats,
    everSeen: everSeen.size,
    cr7Seen: BANKS.cr7.questions.filter((q) => everSeen.has(q.key)).length,
  });
  const trophyGoal = (t) =>
    t.id === "seen-all" ? ALL_QUESTION_COUNT()
    : t.id === "cr7-seen" ? BANKS.cr7.questions.length
    : t.goal;

  // Débloque les trophées atteints et renvoie les nouveaux
  function checkTrophies() {
    const s = fullStats();
    const fresh = [];
    // Plusieurs passes : un trophée peut en débloquer un autre (Trophée CR7 Ultime)
    let changed = true;
    while (changed) {
      changed = false;
      TROPHIES.forEach((t) => {
        if (!unlocked[t.id] && t.value(s, unlocked) >= trophyGoal(t)) {
          unlocked[t.id] = new Date().toISOString().slice(0, 10);
          fresh.push(t);
          addCoins(TROPHY_REWARD[t.tier] || 0);
          changed = true;
        }
      });
    }
    if (fresh.length) storage.set(TROPHY_KEY, JSON.stringify(unlocked));
    return fresh;
  }

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function show(screen) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(`screen-${screen}`).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Accueil ----------
  // Choix du quiz : général ou Superfan CR7 (mémorisé)
  function useTheme(theme) {
    const b = BANKS[theme] ? BANKS[theme] : BANKS.general;
    state.theme = BANKS[theme] ? theme : "general";
    QUESTIONS = b.questions;
    ERAS = b.eras;
    categories = b.categories;
    state.cats = b.cats;
    state.eras = b.eraSel;
    document.body.classList.toggle("theme-cr7", state.theme === "cr7");
    document.querySelectorAll("#theme-chips .mode").forEach((m) => {
      const on = m.dataset.theme === state.theme;
      m.classList.toggle("active", on);
      m.setAttribute("aria-checked", on ? "true" : "false");
    });
    $("tagline").innerHTML = state.theme === "cr7"
      ? `🐐 Mode Superfan : <b>${QUESTIONS.length}</b> questions sur Cristiano Ronaldo, de Madère à aujourd'hui.`
      : `<b>${GENERAL_TOTAL()}</b> questions, de la naissance du foot en 1863 jusqu'en 2026.`;
    $("cat-title").textContent = state.theme === "cr7" ? "Thèmes" : "Catégories";
    $("era-title").textContent = state.theme === "cr7" ? "Périodes" : "Époques";
    storage.set("fqf-theme", state.theme);
  }
  $("count-general").textContent = `${GENERAL_TOTAL()} questions`;
  $("count-cr7").textContent = `${BANKS.cr7.questions.length} questions`;
  document.querySelectorAll("#theme-chips .mode").forEach((m) => {
    m.onclick = () => { useTheme(m.dataset.theme); renderFilters(); renderBest(); };
  });
  useTheme(storage.get("fqf-theme") || "general");

  function currentPool() {
    return QUESTIONS.filter((q) =>
      state.cats.has(q.cat) &&
      state.diffs.has(q.diff) &&
      state.eras.has(q.era));
  }

  // Rangée de puces à sélection multiple (avec un bouton « Toutes »)
  function renderChipRow(wrapId, items, selected, countOf, allLabel) {
    const wrap = $(wrapId);
    wrap.innerHTML = "";
    const all = document.createElement("button");
    all.className = "chip" + (selected.size === items.length ? " active" : "");
    all.textContent = allLabel;
    all.onclick = () => {
      if (selected.size === items.length) selected.clear();
      else items.forEach((it) => selected.add(it.id));
      renderFilters();
    };
    wrap.appendChild(all);
    items.forEach((it) => {
      const b = document.createElement("button");
      b.className = "chip" + (selected.has(it.id) ? " active" : "");
      b.innerHTML = `${it.html} <small>${countOf(it.id)}</small>`;
      b.onclick = () => {
        selected.has(it.id) ? selected.delete(it.id) : selected.add(it.id);
        renderFilters();
      };
      wrap.appendChild(b);
    });
  }

  function renderFilters() {
    renderChipRow("diff-chips",
      DIFFS.map((d) => ({ id: d.id, html: `<span class="stars">${d.stars}</span><span class="dl">${d.label}</span>` })),
      state.diffs, (id) => QUESTIONS.filter((q) => q.diff === id).length, "Toutes");
    renderChipRow("era-chips",
      ERAS.map((e) => ({ id: e.id, html: e.range ? `${e.label} <em>${e.range}</em>` : e.label })),
      state.eras, (id) => QUESTIONS.filter((q) => q.era === id).length, "Toutes");
    renderCats();
  }

  function renderCats() {
    const wrap = $("cat-chips");
    wrap.innerHTML = "";
    const all = document.createElement("button");
    all.className = "chip" + (state.cats.size === categories.length ? " active" : "");
    all.textContent = "Toutes";
    all.onclick = () => {
      if (state.cats.size === categories.length) state.cats.clear();
      else categories.forEach((c) => state.cats.add(c));
      renderCats();
    };
    wrap.appendChild(all);

    categories.forEach((c) => {
      const n = QUESTIONS.filter((q) => q.cat === c).length;
      const b = document.createElement("button");
      b.className = "chip" + (state.cats.has(c) ? " active" : "");
      b.innerHTML = `${c} <small>${n}</small>`;
      b.onclick = () => {
        state.cats.has(c) ? state.cats.delete(c) : state.cats.add(c);
        renderCats();
      };
      wrap.appendChild(b);
    });
    updateSummaries();
    renderFresh();
  }

  // Résumé affiché à côté des menus déroulants fermés
  function summaryText(selected, total, labelOf) {
    if (selected.size === total) return "Toutes";
    if (selected.size === 0) return "Aucune";
    if (selected.size === 1) return labelOf([...selected][0]);
    return `${selected.size} sélectionnées`;
  }
  function updateSummaries() {
    $("era-summary").textContent = summaryText(state.eras, ERAS.length,
      (id) => { const e = eraOf(id); return e.id === "O" ? "1863-1929" : e.label; });
    $("cat-summary").textContent = summaryText(state.cats, categories.length, (c) => c);
  }

  function renderFresh() {
    const pool = currentPool();
    const fresh = pool.filter((q) => !seen.has(q.key)).length;
    const info = $("fresh-info");
    updateStartState();
    if (!pool.length) { info.textContent = "Aucune question ne correspond à ces filtres. Élargis ta sélection."; return; }
    info.innerHTML = fresh === pool.length
      ? `🆕 ${fresh} questions jamais vues dans cette sélection.`
      : `🆕 Encore <b>${fresh}</b> questions jamais vues sur ${pool.length}. <button class="link" id="reset-seen">Tout remettre à zéro</button>`;
    const r = $("reset-seen");
    if (r) r.onclick = () => { seen.clear(); saveSeen(); renderFresh(); };
  }

  document.querySelectorAll("#count-chips .chip").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("#count-chips .chip").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.count = b.dataset.count;
    };
  });

  // Mode de jeu : Chrono ou Détente (mémorisé)
  function setMode(mode) {
    state.timer = mode !== "detente";
    document.querySelectorAll("#mode-chips .mode").forEach((m) => {
      const on = m.dataset.mode === mode;
      m.classList.toggle("active", on);
      m.setAttribute("aria-checked", on ? "true" : "false");
    });
    storage.set("fqf-mode", mode);
  }
  document.querySelectorAll("#mode-chips .mode").forEach((m) => {
    m.onclick = () => setMode(m.dataset.mode);
  });
  setMode(storage.get("fqf-mode") === "detente" ? "detente" : "chrono");

  // ---------- Type de partie ----------
  const RUSH_TIME = 60;
  const DAILY_COUNT = 10;
  const ALL_BY_KEY = new Map();
  [BANKS.general, BANKS.cr7].forEach((b) => b.questions.forEach((q) => ALL_BY_KEY.set(q.key, q)));
  const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return todayStr(d); };

  // Générateur pseudo-aléatoire « graine » : le défi du jour est le même toute la journée
  function seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }
  const seededShuffle = (arr, rnd) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  function dailyQuestions() {
    const rnd = seeded(`la-fete-quiz-${todayStr()}`);
    const qs = BANKS.general.questions.filter((q) => !q.multi);
    const take = (diff, n) => seededShuffle(qs.filter((q) => q.diff === diff), rnd).slice(0, n);
    return [...take("f", 3), ...take("m", 4), ...take("d", 3)]
      .map((q) => ({ ...q, shuffled: seededShuffle(q.answers, rnd) }));
  }

  // Joueurs du mode Soirée (prénoms mémorisés)
  let partyNames = [];
  try { partyNames = JSON.parse(storage.get("fqf-party") || "[]"); } catch { partyNames = []; }
  if (!Array.isArray(partyNames) || partyNames.length < 2) partyNames = ["Joueur 1", "Joueur 2"];
  const saveParty = () => storage.set("fqf-party", JSON.stringify(partyNames));
  function renderParty() {
    const wrap = $("party-players");
    wrap.innerHTML = "";
    (state.play === "duel" ? partyNames.slice(0, 2) : partyNames).forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "pp-row";
      row.innerHTML = `<span class="pp-num">${i + 1}</span><input class="pp-input" maxlength="16" type="text" /><button class="pp-del" type="button" aria-label="Retirer">✕</button>`;
      const inp = row.querySelector("input");
      inp.value = name;
      inp.placeholder = `Joueur ${i + 1}`;
      inp.oninput = () => { partyNames[i] = inp.value; saveParty(); };
      const del = row.querySelector(".pp-del");
      del.disabled = partyNames.length <= 2 || state.play === "duel";
      del.onclick = () => { partyNames.splice(i, 1); saveParty(); renderParty(); };
      wrap.appendChild(row);
    });
    $("party-add").disabled = partyNames.length >= 6;
  }
  $("party-add").onclick = () => {
    if (partyNames.length >= 6) return;
    partyNames.push(`Joueur ${partyNames.length + 1}`);
    saveParty();
    renderParty();
    const inputs = document.querySelectorAll(".pp-input");
    inputs[inputs.length - 1].select();
  };

  // Battre La Fête : niveau et probabilité de bonne réponse
  const BOSS_PROB = 0.76;
  // Variantes du mode Cartes
  let geoVar = ["europe", "france", "pays", "monde"].includes(storage.get("fqf-geo")) ? storage.get("fqf-geo") : "europe";
  const GEO_INFO = {
    europe: "🇪🇺 10 clubs à placer sur la carte d'Europe. Plus ton épingle est proche du stade, plus tu marques (1 000 pts max par club). Un doigt pour déplacer la carte, deux doigts pour zoomer.",
    france: "🇫🇷 Tour de France : 10 clubs de Ligue 1 et Ligue 2 à placer sur la carte de France. Plus tu es précis, plus tu marques.",
    pays: "🧭 Pays mystère : on te donne un club, touche son pays sur la carte. 1 000 pts par bonne réponse.",
    monde: "🌍 Coupe du monde : pays organisateurs et origines des stars, sur la carte du monde. Zoome à deux doigts pour les petits pays !",
  };
  document.querySelectorAll("#geo-vars .chip").forEach((c) => {
    c.onclick = () => { geoVar = c.dataset.geo; storage.set("fqf-geo", geoVar); updatePlayUI(); };
  });

  const PLAY_INFO = {
    classic: "",
    sudden: "💀 Toutes les questions de ta sélection, jusqu'à la première erreur. Combien de bonnes réponses d'affilée ?",
    rush: "⏳ 60 secondes au total. Bonne réponse : <b>+2 s</b>. Erreur : <b>−3 s</b>. Pas de temps limite par question.",
    daily: "",
    kits: "👕 Un maillot, quatre clubs… ou l'inverse ! Une quarantaine de maillots bien reconnaissables, aux couleurs de leur tenue domicile. Le drapeau du pays t'aide un peu.",
    geo: "",
    derby: "⚔️ On te donne un club, trouve son grand rival ! La carte te montre ensuite le derby.",
    whoami: "🕵️ Des indices s'affichent un par un. Trouve le joueur le plus tôt possible : moins d'indices = plus de pièces (jusqu'à +5 🪙).",
    career: "🧳 Une suite de clubs, un seul joueur. Qui a eu ce parcours ?",
    names: "✍️ On te donne le nom de famille d'un joueur (des années 80 à aujourd'hui), écris son prénom ! Pas de panique pour l'orthographe : accents et petites fautes sont acceptés.",
    hilo: "↕️ Qui a le plus de titres, de Ballons d'Or, quel club est le plus ancien… Une nouvelle comparaison à chaque manche. Une erreur et c'est fini !",
    boss: "",
    duel: "🤺 Posez le téléphone à plat entre vous deux. Chacun a ses boutons de son côté : le premier qui trouve la bonne réponse marque le point. Une erreur et tu es bloqué pour la question !",
    party: "🎉 Passez-vous le téléphone ! Chacun répond à son tour, le meilleur score gagne. (Sans jokers ni pièces.)",
    review: "",
  };
  function setPlay(play) {
    state.play = play;
    document.querySelectorAll("#play-chips .mode").forEach((m) => {
      const on = m.dataset.play === play;
      m.classList.toggle("active", on);
      m.setAttribute("aria-checked", on ? "true" : "false");
    });
    storage.set("fqf-play", play);
    updatePlayUI();
  }
  document.querySelectorAll("#play-chips .mode").forEach((m) => { m.onclick = () => setPlay(m.dataset.play); });

  function updatePlayUI() {
    const p = state.play;
    const doneToday = daily.scores[todayStr()];
    $("daily-small").textContent = doneToday !== undefined ? `✅ Fait : ${doneToday}/${DAILY_COUNT}` : (daily.streak && daily.last === yesterdayStr() ? `🔥 Série : ${daily.streak} j` : "10 questions par jour");
    $("review-small").textContent = missed.size ? `${missed.size} erreur${missed.size > 1 ? "s" : ""} à revoir` : "Aucune erreur";
    let info = PLAY_INFO[p];
    if (p === "daily") {
      info = doneToday !== undefined
        ? `📅 Défi d'aujourd'hui déjà relevé : <b>${doneToday}/${DAILY_COUNT}</b>. Tu peux rejouer pour le plaisir (sans récompense). Reviens demain !`
        : `📅 Les mêmes 10 questions toute la journée (3 faciles, 4 moyennes, 3 difficiles). Récompense : <b>+30 🪙</b>.${daily.streak && daily.last === yesterdayStr() ? ` Série en cours : <b>${daily.streak} jour${daily.streak > 1 ? "s" : ""}</b> 🔥` : ""}`;
    }
    if (p === "boss") {
      const wins = Number(storage.get("fqf-boss-wins") || 0);
      info = `🥳 Affronte La Fête sur les mêmes questions. Elle a <b>76 % de réussite</b>. Fais mieux qu'elle pour gagner <b>+30 🪙</b> !${wins ? ` Tu l'as déjà battue <b>${wins}</b> fois.` : ""}`;
    }
    if (p === "geo") {
      info = GEO_INFO[geoVar];
    }
    $("geo-vars").classList.toggle("hidden", p !== "geo");
    document.querySelectorAll("#geo-vars .chip").forEach((c) => c.classList.toggle("active", c.dataset.geo === geoVar));
    if (p === "review") {
      info = missed.size
        ? `📚 Rejoue les <b>${missed.size}</b> question${missed.size > 1 ? "s" : ""} que tu as ratée${missed.size > 1 ? "s" : ""}. Une bonne réponse la retire de la liste.`
        : "📚 Aucune erreur à revoir pour l'instant. Les questions ratées dans les autres modes arriveront ici.";
    }
    $("play-info").innerHTML = info;
    $("play-info").classList.toggle("hidden", !info);
    $("party-setup").classList.toggle("hidden", p !== "party" && p !== "duel");
    $("party-add").classList.toggle("hidden", p === "duel");
    document.querySelector(".league-toggle").classList.toggle("hidden", p === "duel");
    if (p === "party" || p === "duel") renderParty();
    if (p === "party") renderLeague();
    const noFilters = ["daily", "review", "kits", "geo", "derby", "whoami", "career", "names", "hilo"].includes(p);
    $("sec-theme").classList.toggle("hidden", noFilters);
    $("sec-filters").classList.toggle("hidden", noFilters);
    $("sec-timer").classList.toggle("hidden", ["rush", "geo", "duel"].includes(p));
    $("sec-count").classList.toggle("hidden", ["sudden", "rush", "daily", "geo", "hilo"].includes(p));
    $("count-title").textContent = p === "party" ? "Questions par joueur" : "Nombre de questions";
    const small = p === "party" || p === "duel" || ["derby", "whoami", "career", "names"].includes(p);
    document.querySelectorAll("#count-chips .chip").forEach((b) => {
      const big = ["50", "100", "all"].includes(b.dataset.count);
      b.classList.toggle("hidden", small && big);
    });
    if (small && ["50", "100", "all"].includes(state.count)) {
      document.querySelector('#count-chips .chip[data-count="10"]').click();
    }
    $("start-btn").textContent = p === "daily" ? (doneToday !== undefined ? "Rejouer le défi" : "Relever le défi !")
      : p === "party" ? "Lancer la soirée !"
      : p === "review" ? "Réviser !"
      : p === "geo" ? "C'est parti !"
      : p === "boss" ? "Défier La Fête !"
      : p === "duel" ? "Lancer le duel !"
      : "Coup d'envoi !";
    $("fresh-info").classList.toggle("hidden", noFilters);
    updateStartState();
  }
  function updateStartState() {
    const p = state.play;
    $("start-btn").disabled = p === "review" ? missed.size === 0 : ["daily", "kits", "geo", "derby", "whoami", "career", "names", "hilo"].includes(p) ? false : currentPool().length === 0;
  }


  const bestKey = () => (state.theme === "cr7" ? "fqf-best-cr7" : "fqf-best");

  function renderBest() {
    const best = storage.get(bestKey());
    $("best-score").textContent = best ? `🏅 Ton meilleur score : ${best}` : "";
    const got = TROPHIES.filter((t) => unlocked[t.id]).length;
    $("trophies-btn").innerHTML = `🏆 Mes trophées <span>${got} / ${TROPHIES.length}</span>`;
    renderWallet();
    if ($("play-info")) updatePlayUI();
    updateSummaries();
    renderFresh();
  }

  // ---------- Partie ----------
  // Choisit n questions de la sélection, en priorité celles jamais vues
  function pickFromPool(pool, n) {
    const fresh = shuffle(pool.filter((q) => !seen.has(q.key)));
    let chosen = fresh.slice(0, n);
    if (chosen.length < n) {
      // Toutes les questions de la sélection ont été vues : on recommence un cycle
      const already = new Set(chosen.map((q) => q.key));
      pool.forEach((q) => seen.delete(q.key));
      const rest = shuffle(pool.filter((q) => !already.has(q.key)));
      chosen = chosen.concat(rest.slice(0, n - chosen.length));
    }
    return chosen.map((q) => ({ ...q, shuffled: shuffle(q.answers) }));
  }

  // ---------- Générateurs des mini-jeux ----------
  const CLUB_BY_NAME = new Map(CLUBS.map((c) => [c.name, c]));
  const pickUnused = (arr, used, keyOf) => {
    let pool = arr.filter((x) => !used.has(keyOf(x)));
    if (!pool.length) { used.clear(); pool = arr; }
    const x = pick(pool);
    used.add(keyOf(x));
    return x;
  };
  const otherNames = (all, good, n = 3) => shuffle(all.filter((x) => x !== good)).slice(0, n);
  const baseQ = (extra) => ({ noTrack: true, multi: false, diff: "m", era: "X", ...extra, shuffled: shuffle(extra.answers) });

  function derbyQuestion(used) {
    const d = pickUnused(DERBIES, used, (x) => x[0] + x[1]);
    const flip = Math.random() < 0.5;
    const club = CLUB_BY_NAME.get(flip ? d[1] : d[0]);
    const rival = CLUB_BY_NAME.get(flip ? d[0] : d[1]);
    // Pas de faux choix qui serait aussi un rival du club
    const rivals = new Set(DERBIES.filter((x) => x.includes(club.name)).flatMap((x) => [x[0], x[1]]));
    const same = shuffle(CLUBS.filter((c) => c.flag === club.flag && !rivals.has(c.name)));
    const others = shuffle(CLUBS.filter((c) => c.flag !== club.flag && DERBY_FLAGS.includes(c.flag) && !rivals.has(c.name)));
    const wrong = [...same, ...others].slice(0, 3).map((c) => c.name);
    return baseQ({ key: `derby-${d[0]}-${d[1]}`, cat: "⚔️ Derbys", q: `Quel est le grand rival de ${club.name} ?`, kit: club.kit,
      derby: { a: club, b: rival, name: d[2] }, correct: [rival.name], answers: [rival.name, ...wrong],
      explain: `${d[2]} : ${club.name} contre ${rival.name}.`, gameStat: "derbyCorrect" });
  }
  function whoamiQuestion(used) {
    const [name, clues] = pickUnused(WHOAMI, used, (x) => x[0]);
    return baseQ({ key: `who-${name}`, cat: "🕵️ Qui suis-je ?", q: "Qui suis-je ?", clues, correct: [name],
      answers: [name, ...otherNames(WHOAMI.map((x) => x[0]), name)], explain: `C'était ${name} !` });
  }
  function careerQuestion(used) {
    const [name, clubs] = pickUnused(CAREERS, used, (x) => x[0]);
    return baseQ({ key: `car-${name}`, cat: "🧳 Parcours", q: "Quel joueur a suivi ce parcours ?", career: clubs, correct: [name],
      answers: [name, ...otherNames(CAREERS.map((x) => x[0]), name)], explain: `Le parcours de ${name} : ${clubs.join(" → ")}.`, gameStat: "careerCorrect" });
  }
  function namesQuestion(used) {
    const [last, firsts, hint] = pickUnused(NAMES, used, (x) => x[0]);
    return { key: `name-${last}`, noTrack: true, multi: false, typeIn: true, diff: "m", era: "X", cat: "✍️ Trouve le prénom",
      q: `Quel est le prénom de ${last} ?`, last, hint, answers: firsts, shuffled: [], correct: [firsts[0]],
      explain: `${firsts[0]} ${last}.`, gameStat: "namesCorrect" };
  }
  // Comparaison tolérante : accents, majuscules, tirets et petites fautes
  const normName = (t) => (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o").replace(/ß/g, "ss").replace(/[^a-z]/g, "");
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function nameMatch(q, typed) {
    let t = normName(typed);
    const ln = normName(q.last);
    if (t.endsWith(ln) && t.length > ln.length + 1) t = t.slice(0, -ln.length); // « Zinedine Zidane »
    if (!t) return { ok: false };
    for (const f of q.answers) {
      const n = normName(f);
      if (t === n) return { ok: true, exact: true };
      const tol = n.length <= 3 ? 0 : n.length <= 5 ? 1 : n.length <= 9 ? 2 : 3;
      if (lev(t, n) <= tol) return { ok: true, exact: false };
    }
    return { ok: false };
  }

  function hiloList() {
    // Chaque manche : une catégorie au hasard et deux éléments au hasard (valeurs différentes)
    const list = [];
    let lastSet = -1;
    for (let i = 0; i < 80; i++) {
      let si;
      do { si = Math.floor(Math.random() * HILO_SETS.length); } while (si === lastSet && HILO_SETS.length > 1);
      lastSet = si;
      const set = HILO_SETS[si];
      let a, b;
      do { [a, b] = shuffle(set.items).slice(0, 2); } while (a[1] === b[1]);
      const win = (set.low ? a[1] < b[1] : a[1] > b[1]) ? a : b;
      const kitA = (CLUB_BY_NAME.get(a[0]) || {}).kit, kitB = (CLUB_BY_NAME.get(b[0]) || {}).kit;
      list.push({ key: `hilo-${i}`, noTrack: true, multi: false, diff: "m", era: "X", cat: "↕️ Plus ou moins",
        q: set.q, hiloKits: kitA && kitB ? [kitA, kitB] : null,
        answers: [a[0], b[0]], shuffled: [a[0], b[0]], correct: [win[0]],
        explain: `${a[0]} : ${set.unit(a[1])} · ${b[0]} : ${set.unit(b[1])}.` });
    }
    return list;
  }


  // ---------- Mode Maillots ----------
  // Seuls les maillots reconnaissables sont proposés : allure unique, ou club « référence » de son motif
  const KIT_REFS = ["AC Milan", "Juventus", "Atlético de Madrid", "FC Porto", "Inter Milan", "Celtic", "Arsenal", "West Ham", "Stade Rennais", "FC Sochaux"];
  const LOOK_COUNT = {};
  CLUBS.forEach((c) => { const l = kitLook(c.kit); LOOK_COUNT[l] = (LOOK_COUNT[l] || 0) + 1; });
  const KIT_POOL = CLUBS.filter((c) => LOOK_COUNT[kitLook(c.kit)] === 1 || KIT_REFS.includes(c.name));
  function kitQuestion(used) {
    let pool = KIT_POOL.filter((c) => !used.has(c.id));
    if (!pool.length) { used.clear(); pool = KIT_POOL; }
    const club = pick(pool);
    used.add(club.id);
    // Faux choix : maillots d'une allure différente (et différents entre eux)
    const looks = new Set([kitLook(club.kit)]);
    const mains = new Set([colorGroup(club.kit.b) + (club.kit.p || "plain")]);
    const others = [];
    for (const c of shuffle(CLUBS)) {
      if (others.length === 3) break;
      const lk = kitLook(c.kit), mn = colorGroup(c.kit.b) + (c.kit.p || "plain");
      if (c.id === club.id || looks.has(lk) || mains.has(mn)) continue;
      looks.add(lk); mains.add(mn);
      others.push(c);
    }
    const reverse = Math.random() < 0.5;
    const answers = [club, ...others].map((c) => c.name);
    return {
      key: `kit-${club.id}-${reverse ? "r" : "d"}`,
      noTrack: true,
      kitQ: true,
      cat: "👕 Maillots",
      q: reverse ? `Quel est le maillot de ${club.name} ?` : `À quel club appartient ce maillot ? ${club.flag}`,
      kit: reverse ? null : club.kit,
      answerKits: reverse,
      multi: false,
      correct: [club.name],
      answers,
      shuffled: shuffle(answers),
      explain: `${club.name} joue à ${club.city} ${club.flag}.`,
      diff: "m",
      era: "X",
    };
  }
  const KIT_BY_NAME = new Map(CLUBS.map((c) => [c.name, c.kit]));

  function start() {
    Sounds.unlock();
    const p = state.play;
    clearTimeout(state.autoNext);
    clearInterval(state.rushTick);

    if (p === "geo") { startGeo(); return; }
    if (p === "duel") { startDuel(); return; }
    if (p === "daily") {
      state.list = dailyQuestions();
    } else if (["derby", "whoami", "career", "names"].includes(p)) {
      const gen = { derby: derbyQuestion, whoami: whoamiQuestion, career: careerQuestion, names: namesQuestion }[p];
      const n = Math.min(Number(state.count) || 10, 20);
      const used = new Set();
      state.list = Array.from({ length: n }, () => gen(used));
    } else if (p === "hilo") {
      state.list = hiloList();
    } else if (p === "kits") {
      const n = state.count === "all" ? KIT_POOL.length : Math.min(Number(state.count), KIT_POOL.length);
      const used = new Set();
      state.list = Array.from({ length: n }, () => kitQuestion(used));
    } else if (p === "review") {
      const list = [...missed].map((k) => ALL_BY_KEY.get(k)).filter(Boolean);
      if (!list.length) return;
      const n = state.count === "all" ? list.length : Math.min(Number(state.count), list.length);
      state.list = shuffle(list).slice(0, n).map((q) => ({ ...q, shuffled: shuffle(q.answers) }));
    } else {
      const pool = currentPool();
      if (!pool.length) return;
      let n;
      if (p === "sudden" || p === "rush") n = pool.length;
      else if (p === "party") {
        state.players = partyNames.map((nm, i) => ({ name: (nm || "").trim() || `Joueur ${i + 1}`, score: 0, streak: 0, best: 0 }));
        n = Math.min(Number(state.count) * state.players.length, pool.length);
        n -= n % state.players.length; // même nombre de questions pour tout le monde
      } else n = state.count === "all" ? pool.length : Math.min(Number(state.count), pool.length);
      state.list = pickFromPool(pool, n);
      // Question bonus : environ une partie sur deux, à une place au hasard (jamais en Superfan CR7)
      if ((p === "classic" || p === "boss") && state.theme !== "cr7" && Math.random() < BONUS_CHANCE) {
        const pos = Math.floor(Math.random() * (state.list.length + 1));
        state.list.splice(pos, 0, { ...BONUS_QUESTION, shuffled: shuffle(BONUS_QUESTION.answers) });
      }
    }
    state.index = 0;
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.mistakes = [];
    state.newTrophies = [];
    state.isAll = p === "classic" && state.count === "all";
    state.inGame = true;
    state.coinsEarned = 0;
    state.answeredCount = 0;
    state.fixed = 0;
    state.usedJokers = 0;
    state.turnReady = false;
    state.suddenOver = false;
    state.bossScore = 0;
    state.timerOn = p !== "rush" && state.timer;
    document.body.dataset.play = p;
    show("quiz");
    Sounds.play("start");
    if (p === "rush") startRush();
    renderQuestion();
  }

  // ---------- Contre-la-montre : un seul chrono pour toute la partie ----------
  function startRush() {
    state.rushEnd = Date.now() + RUSH_TIME * 1000;
    clearInterval(state.rushTick);
    state.rushTick = setInterval(drawRush, 200);
    drawRush();
  }
  function rushAdd(sec) {
    state.rushEnd += sec * 1000;
    const t = $("q-timer");
    const pop = document.createElement("span");
    pop.className = `time-pop ${sec > 0 ? "plus" : "minus"}`;
    pop.textContent = `${sec > 0 ? "+" : "−"}${Math.abs(sec)} s`;
    t.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
    drawRush();
  }
  function drawRush() {
    if (!state.inGame || state.play !== "rush") return;
    const left = Math.max(0, (state.rushEnd - Date.now()) / 1000);
    const t = $("q-timer");
    const pops = [...t.querySelectorAll(".time-pop")];
    t.classList.remove("off");
    t.innerHTML = `<span class="timer-num">${Math.ceil(left)}</span>`;
    pops.forEach((x) => t.appendChild(x));
    t.style.setProperty("--p", `${Math.min(100, (left / RUSH_TIME) * 100)}%`);
    t.classList.toggle("warn", left <= 10);
    $("progress-bar").style.width = `${Math.min(100, (left / RUSH_TIME) * 100)}%`;
    if (left <= 0) {
      clearInterval(state.rushTick);
      clearTimeout(state.autoNext);
      Sounds.play("timeout");
      finish();
    }
  }

  // Mode Soirée : écran « Au tour de… » avant chaque question
  function showTurn() {
    const pl = state.players[state.index % state.players.length];
    const ov = document.createElement("div");
    ov.className = "turn-overlay";
    ov.innerHTML = `<div class="turn-card"><div class="turn-kicker">Question ${state.index + 1} / ${state.list.length}</div>
      <div class="turn-title">Au tour de</div><div class="turn-name"></div>
      <div class="turn-scores"></div>
      <button class="btn primary big" type="button">Je suis prêt !</button>
      <button class="btn ghost turn-stop" type="button">Arrêter la soirée</button></div>`;
    ov.querySelector(".turn-name").textContent = `${pl.name} 🎤`;
    const sc = ov.querySelector(".turn-scores");
    state.players.forEach((x) => {
      const chip = document.createElement("span");
      chip.className = "turn-chip" + (x === pl ? " me" : "");
      chip.textContent = `${x.name} · ${x.score}`;
      sc.appendChild(chip);
    });
    const stop = ov.querySelector(".turn-stop");
    stop.onclick = () => {
      if (!stop.classList.contains("armed")) { stop.classList.add("armed"); stop.textContent = "Sûr ? Appuie encore"; return; }
      ov.remove();
      document.body.classList.remove("turn-wait");
      state.inGame = false;
      renderBest();
      show("home");
    };
    ov.querySelector(".btn.primary").onclick = () => {
      ov.remove();
      document.body.classList.remove("turn-wait");
      state.turnReady = true;
      renderQuestion();
    };
    document.body.appendChild(ov);
    document.body.classList.add("turn-wait");
    Sounds.play("click");
  }

  function renderQuestion() {
    const q = state.list[state.index];
    const total = state.list.length;
    if (state.play === "party" && !state.turnReady) { showTurn(); return; }
    state.turnReady = false;
    state.answered = false;
    state.selected = new Set();
    state.usedHere = new Set();

    if (!q.bonus && !q.noTrack) {
      seen.add(q.key);
      saveSeen();
      everSeen.add(q.key);
      saveEver();
    }
    state.qStart = Date.now();

    renderScoreboard();
    if (state.play !== "rush") $("progress-bar").style.width = state.play === "sudden" ? "0%" : `${(state.index / total) * 100}%`;
    $("q-cat").textContent = q.cat;
    const d = diffOf(q.diff);
    $("q-diff").textContent = `${d.stars} ${d.label}`;
    $("q-diff").dataset.level = d.id;
    const e = eraOf(q.era);
    $("q-era").textContent = e.id === "O" ? "1863-1929" : e.label;
    $("q-multi").classList.toggle("hidden", !q.multi);
    $("q-cat").classList.toggle("bonus", !!q.bonus);
    $("q-diff").classList.toggle("hidden", !!q.bonus);
    $("q-era").classList.toggle("hidden", !!q.bonus);
    document.querySelector(".question-card").classList.toggle("is-bonus", !!q.bonus);
    $("q-hint").classList.toggle("hidden", !q.multi);
    $("q-text").textContent = q.q;
    let vHtml = "";
    if (q.kit) vHtml = kitSvg(q.kit, "kit kit-big" + (q.kitQ && !q.answerKits ? " blurry" : ""));
    if (q.career) vHtml = careerHtml(q.career);
    if (q.clues) { state.cluesShown = 1; vHtml = `<ol class="clues"></ol><button class="btn clue-btn" type="button"></button>`; }
    if (q.hiloKits) vHtml = `<div class="hilo-kits">${kitSvg(q.hiloKits[0], "kit")}<span>VS</span>${kitSvg(q.hiloKits[1], "kit")}</div>`;
    if (q.typeIn) vHtml = `<div class="name-card"><span class="nc-hint"></span><b class="nc-last"></b></div>`;
    $("q-visual").innerHTML = vHtml;
    $("q-visual").classList.toggle("hidden", !vHtml);
    if (q.clues) renderClues();
    if (q.typeIn) {
      document.querySelector(".nc-hint").textContent = q.hint;
      document.querySelector(".nc-last").textContent = q.last.toUpperCase();
    }
    $("q-era").classList.toggle("hidden", !!q.bonus || !!q.noTrack);
    $("q-diff").classList.toggle("hidden", !!q.bonus || !!q.noTrack);
    $("feedback").className = "feedback hidden";
    $("next-btn").classList.add("hidden");
    $("validate-btn").classList.toggle("hidden", !q.multi && !q.order);
    $("validate-btn").disabled = true;
    state.orderSel = [];

    const wrap = $("answers");
    wrap.innerHTML = "";
    wrap.classList.toggle("is-multi", q.multi);
    wrap.classList.toggle("kit-answers", !!q.answerKits);
    wrap.classList.toggle("order-answers", !!q.order);
    wrap.classList.toggle("hilo-answers", q.answers.length === 2);
    q.shuffled.forEach((ans, i) => {
      const b = document.createElement("button");
      b.className = "answer";
      b.innerHTML = `<span class="letter">${q.multi ? "" : LETTERS[i]}</span><span></span>`;
      if (q.multi) b.firstChild.setAttribute("data-l", LETTERS[i]);
      b.lastChild.textContent = ans;
      if (q.answerKits) { b.lastChild.innerHTML = kitSvg(KIT_BY_NAME.get(ans), "kit kit-ans"); b.setAttribute("aria-label", ans); }
      b.dataset.answer = ans;
      if (q.order) b.firstChild.textContent = "·";
      b.onclick = () => (q.order ? toggleOrder(ans) : q.multi ? toggleChoice(ans, b) : answer([ans]));
      wrap.appendChild(b);
    });

    if (q.typeIn) {
      wrap.innerHTML = `<form class="type-form" autocomplete="off"><input class="type-in" type="text" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Écris le prénom…" maxlength="30" /><button class="btn primary" type="submit">Valider</button></form>
        <button class="btn ghost type-skip" type="button">Je ne sais pas 🤷</button>`;
      const form = wrap.querySelector("form"), inp = wrap.querySelector("input");
      form.onsubmit = (e) => { e.preventDefault(); if (inp.value.trim()) answer([inp.value.trim()]); };
      wrap.querySelector(".type-skip").onclick = () => answer([""]);
      setTimeout(() => inp.focus({ preventScroll: true }), 0);
    }
    renderJokers();
    if (state.play !== "rush") startTimer(q.multi || q.order || q.clues || q.career || q.typeIn ? TIME_MULTI : TIME_SINGLE);
  }

  // Le bon ordre : on touche les événements un par un
  function toggleOrder(ans) {
    if (state.answered) return;
    Sounds.play("click");
    const i = state.orderSel.indexOf(ans);
    if (i === -1) state.orderSel.push(ans);
    else state.orderSel.splice(i);
    document.querySelectorAll(".answer").forEach((b) => {
      const r = state.orderSel.indexOf(b.dataset.answer);
      b.firstChild.textContent = r === -1 ? "·" : String(r + 1);
      b.classList.toggle("selected", r !== -1);
    });
    $("validate-btn").disabled = state.orderSel.length !== state.list[state.index].answers.length;
  }
  // Qui suis-je : indices révélés un par un
  function renderClues() {
    const q = state.list[state.index];
    const ol = document.querySelector("#q-visual .clues");
    if (!ol) return;
    ol.innerHTML = "";
    q.clues.slice(0, state.cluesShown).forEach((c, i) => {
      const li = document.createElement("li");
      li.textContent = c;
      if (i === state.cluesShown - 1) li.className = "new";
      ol.appendChild(li);
    });
    const btn = document.querySelector("#q-visual .clue-btn");
    const left = q.clues.length - state.cluesShown;
    btn.textContent = left ? `💡 Indice suivant (encore ${left})` : "Plus d'indice !";
    btn.disabled = !left || state.answered;
    btn.onclick = () => { if (state.cluesShown < q.clues.length && !state.answered) { state.cluesShown++; Sounds.play("click"); renderClues(); } };
  }
  // Parcours : la suite de clubs, avec leur maillot quand on le connaît
  function careerHtml(clubs) {
    return `<div class="career">${clubs.map((c, i) => {
      const kit = KIT_BY_NAME.get(c);
      return `${i ? '<span class="car-arrow">→</span>' : ""}<span class="car-club">${kit ? kitSvg(kit, "kit") : '<span class="car-dot">⚽</span>'}<span class="car-name">${c.replace(/</g, "")}</span></span>`;
    }).join("")}</div>`;
  }
  // Derbys : petite carte avec les deux clubs
  function derbyMap(d) {
    const M = EUROPE_MAP;
    const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    const pr = (c) => [(c.lon - M.lon0) * Math.PI / 180 * M.k, (merc(M.lat1) - merc(c.lat)) * M.k];
    const [ax, ay] = pr(d.a), [bx, by] = pr(d.b);
    const span = Math.max(Math.abs(ax - bx) * 2.2, Math.abs(ay - by) * 2.2 * 2, 110);
    const w = span, h = span / 2;
    const x = (ax + bx) / 2 - w / 2, y = (ay + by) / 2 - h / 2;
    const z = w / 1000 * 3;
    const pin = (px, py, kit) => `<g transform="translate(${px} ${py}) scale(${z})"><g transform="translate(-17 -40)">${kitSvg(kit, "kit").replace("<svg", '<svg width="34" height="34"')}</g><circle r="4" fill="#fff" stroke="#000" stroke-width="1.5"/></g>`;
    const same = Math.hypot(ax - bx, ay - by) < 2;
    return `<svg class="derby-map" viewBox="${x} ${y} ${w} ${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f5f8f"/>
      ${M.countries.map(([, dd]) => `<path class="geo-land" d="${dd}"/>`).join("")}
      <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" class="geo-line"/>
      ${pin(ax - (same ? 4 * z : 0), ay, d.a.kit)}${pin(bx + (same ? 4 * z : 0), by, d.b.kit)}</svg>
      <div class="derby-name">⚔️ ${d.name}${same ? " · même stade !" : ""}</div>`;
  }

  // Tableau d'affichage selon le type de partie
  function renderScoreboard() {
    const labels = document.querySelectorAll(".scoreboard .sb-label");
    const total = state.list.length;
    if (state.play === "party") {
      const pl = state.players[state.index % state.players.length];
      labels[0].textContent = "Joueur"; labels[1].textContent = "Score"; labels[2].textContent = "Question";
      $("q-num").textContent = pl.name;
      $("q-score").textContent = pl.score;
      $("q-streak").textContent = `${state.index + 1}/${total}`;
      return;
    }
    if (state.play === "boss") {
      labels[0].textContent = "Toi"; labels[1].textContent = "La Fête 🥳"; labels[2].textContent = "Question";
      $("q-num").textContent = state.score;
      $("q-score").textContent = state.bossScore;
      $("q-streak").textContent = `${state.index + 1}/${total}`;
      return;
    }
    labels[0].textContent = "Question"; labels[1].textContent = "Score"; labels[2].textContent = "Série";
    $("q-num").textContent = ["sudden", "rush", "hilo"].includes(state.play) ? `${state.index + 1}` : `${state.index + 1}/${total}`;
    $("q-score").textContent = state.score;
    $("q-streak").textContent = `${state.streak} 🔥`;
  }

  // ---------- Jokers ----------
  const JOKERS = [
    { id: "fifty", icon: "🌓", label: "50/50", name: "50/50", desc: "Enlève 2 mauvaises réponses.", price: 30 },
    { id: "time", icon: "⏱️", label: "+10 s", name: "Temps bonus", desc: "Ajoute 10 secondes au chrono.", price: 20 },
    { id: "skip", icon: "⏭️", label: "Passe", name: "Passe", desc: "Remplace la question par une autre.", price: 40 },
  ];
  function jokerUsable(id) {
    const q = state.list[state.index];
    if (state.answered || state.usedHere.has(id) || !(jokers[id] > 0)) return false;
    if (id === "fifty") return !q.typeIn && q.answers.length - q.correct.length >= 2 && !document.querySelector(".answer.gone");
    if (id === "time") return state.play === "rush" || state.timerOn;
    if (id === "skip") return !q.bonus && !!replacementFor();
    return false;
  }
  function renderJokers() {
    const wrap = $("jokers");
    wrap.classList.toggle("hidden", state.play === "party");
    if (state.play === "party") return;
    wrap.innerHTML = "";
    JOKERS.forEach((j) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "joker";
      b.disabled = !jokerUsable(j.id);
      b.innerHTML = `<span class="j-ico">${j.icon}</span><span class="j-lab">${j.label}</span><span class="j-n">×${jokers[j.id] || 0}</span>`;
      b.onclick = () => useJoker(j.id);
      wrap.appendChild(b);
    });
  }
  function replacementFor() {
    if (state.play === "kits") return [kitQuestion(new Set(state.list.map((x) => Number(x.key.split("-")[1]))))];
    if (state.play === "hilo") return null;
    const gens = { derby: [derbyQuestion], whoami: [whoamiQuestion], career: [careerQuestion], names: [namesQuestion] };
    if (gens[state.play]) {
      const inList = new Set(state.list.map((x) => x.key));
      for (let i = 0; i < 30; i++) { const nq = gens[state.play][0](new Set()); if (!inList.has(nq.key)) return [nq]; }
      return null;
    }
    const inList = new Set(state.list.map((x) => x.key));
    let pool;
    if (state.play === "daily" || state.play === "review") pool = BANKS.general.questions;
    else pool = currentPool();
    pool = pool.filter((x) => !inList.has(x.key));
    return pool.length ? pool : null;
  }
  function useJoker(id) {
    if (!jokerUsable(id)) return;
    jokers[id]--;
    saveJokers();
    stats.jokersUsed++;
    saveStats();
    state.usedJokers++;
    Sounds.play("streak");
    if (id === "fifty") {
      const q = state.list[state.index];
      const good = new Set(q.correct);
      const wrong = shuffle([...document.querySelectorAll(".answer")].filter((b) => !good.has(b.dataset.answer)));
      wrong.slice(0, 2).forEach((b) => { b.classList.add("gone"); b.disabled = true; });
    } else if (id === "time") {
      if (state.play === "rush") rushAdd(10);
      else { state.timeLeft += 10; state.timeMax = Math.max(state.timeMax, state.timeLeft); drawTimer(); }
    } else if (id === "skip") {
      const pool = replacementFor();
      const nq = pick(pool);
      clearInterval(state.tick);
      state.list[state.index] = { ...nq, shuffled: shuffle(nq.answers) };
      renderQuestion();
      state.usedHere.add("skip");
    }
    state.usedHere.add(id);
    renderJokers();
  }

  function toggleChoice(ans, btn) {
    if (state.answered) return;
    Sounds.play("click");
    if (state.selected.has(ans)) state.selected.delete(ans);
    else state.selected.add(ans);
    btn.classList.toggle("selected", state.selected.has(ans));
    $("validate-btn").disabled = state.selected.size === 0;
  }

  function startTimer(max) {
    clearInterval(state.tick);
    const t = $("q-timer");
    if (!state.timerOn) { t.classList.add("off"); return; }
    t.classList.remove("off", "warn");
    state.timeMax = max;
    state.timeLeft = max;
    drawTimer();
    state.tick = setInterval(() => {
      state.timeLeft--;
      drawTimer();
      if (state.timeLeft <= 0) {
        clearInterval(state.tick);
        const q = state.list[state.index];
        answer(q.multi && state.selected.size ? [...state.selected] : null);
      }
    }, 1000);
  }

  function drawTimer() {
    const t = $("q-timer");
    t.innerHTML = `<span class="timer-num">${state.timeLeft}</span>`;
    t.style.setProperty("--p", `${(state.timeLeft / state.timeMax) * 100}%`);
    t.classList.toggle("warn", state.timeLeft <= 5);
  }

  function answer(choice) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.tick);

    const q = state.list[state.index];
    const picked = new Set(choice || []);
    const good = new Set(q.correct);
    const nm = q.typeIn && choice ? nameMatch(q, choice[0]) : null;
    const ok = q.typeIn ? !!(nm && nm.ok) : q.order
      ? !!choice && choice.length === q.correct.length && choice.every((a, i) => a === q.correct[i])
      : choice !== null && picked.size === good.size && [...picked].every((a) => good.has(a));

    if (q.typeIn) {
      const inp = document.querySelector(".type-in");
      if (inp) { inp.disabled = true; inp.classList.add(ok ? "good" : "bad"); inp.blur(); }
      document.querySelectorAll(".type-form button, .type-skip").forEach((b) => { b.disabled = true; });
    }
    if (q.order) {
      document.querySelectorAll(".answer").forEach((b) => {
        b.disabled = true;
        const a = b.dataset.answer;
        const pos = choice ? choice.indexOf(a) : -1;
        const truePos = q.correct.indexOf(a);
        b.classList.remove("selected");
        b.classList.add(pos === truePos ? "correct" : "wrong");
        b.firstChild.textContent = String(truePos + 1);
        const y = document.createElement("span");
        y.className = "order-year";
        y.textContent = q.years[a];
        b.appendChild(y);
      });
      // On affiche les événements dans le bon ordre
      const wrap = $("answers");
      q.correct.forEach((a) => wrap.appendChild([...wrap.children].find((b) => b.dataset.answer === a)));
    }
    document.querySelectorAll(q.order ? ".none" : ".answer").forEach((b) => {
      b.disabled = true;
      b.classList.remove("selected");
      const a = b.dataset.answer;
      if (q.answerKits) { const nm = document.createElement("span"); nm.className = "kit-name"; nm.textContent = a; b.appendChild(nm); }
      if (good.has(a)) b.classList.add(picked.has(a) || !q.multi ? "correct" : "missed");
      else if (picked.has(a)) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    // Statistiques pour les trophées (enregistrées même si la partie est abandonnée)
    const counts = state.play !== "party";
    state.answeredCount++;
    if (ok && counts) {
      stats.correct++;
      if (q.diff === "d") stats.hard++;
      if (q.multi) stats.multi++;
      if (q.era === "O" && state.theme === "general") stats.origins++;
      if (state.theme === "cr7" && !q.kitQ) stats.cr7Correct++;
      if (q.kitQ) stats.kitCorrect++;
      if (q.gameStat) stats[q.gameStat] = (stats[q.gameStat] || 0) + 1;
      if (q.clues && state.cluesShown === 1) stats.whoamiFirst++;
      if (state.timerOn && Date.now() - state.qStart < 3000) stats.fast++;
    }

    if (ok) {
      state.score++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      if (counts) {
        stats.bestStreak = Math.max(stats.bestStreak, state.streak);
        if (state.theme === "cr7" && state.play !== "review" && state.play !== "daily") stats.cr7BestStreak = Math.max(stats.cr7BestStreak, state.streak);
      }
      Sounds.play("correct");
      if (state.streak % 5 === 0) Sounds.play("streak");
    } else {
      state.streak = 0;
      state.mistakes.push({ q, choice });
      Sounds.play(choice === null ? "timeout" : "wrong");
    }

    let gain = 0;
    if (state.play === "party") {
      const pl = state.players[state.index % state.players.length];
      if (ok) { pl.score++; pl.streak++; pl.best = Math.max(pl.best, pl.streak); } else pl.streak = 0;
    } else {
      // Pièces gagnées et liste des erreurs à réviser
      if (ok) gain = q.bonus ? 5 : q.clues ? Math.max(1, 6 - state.cluesShown) : ({ f: 1, m: 2, d: 3 }[q.diff] || 1);
      // Maillot flou : réponse rapide = bonus
      if (ok && q.kitQ && !q.answerKits && Date.now() - state.qStart < 3500) { gain += 2; state.blurBonus = true; } else state.blurBonus = false;
      if (!q.bonus && !q.noTrack) {
        if (ok) {
          if (missed.delete(q.key) && state.play === "review") { state.fixed++; stats.reviewFixed++; }
        } else missed.add(q.key);
        saveMissed();
      }
      addCoins(gain);
    }
    if (state.play === "rush") rushAdd(ok ? 2 : -3);
    // Battre La Fête : l'adversaire répond aussi
    let bossLine = "";
    if (state.play === "boss") {
      const bOk = !q.bonus && Math.random() < BOSS_PROB;
      if (bOk) state.bossScore++;
      bossLine = q.bonus ? "🥳 La Fête a répondu… « La Fête », évidemment. ❌"
        : bOk ? `🥳 La Fête a trouvé : ✅` : `🥳 La Fête s'est trompée : ❌`;
    }
    $("q-visual").querySelectorAll(".kit-big").forEach((k) => k.classList.remove("blurry"));
    if (q.clues) { state.cluesShown = q.clues.length; renderClues(); }
    if (q.derby) { $("q-visual").innerHTML = derbyMap(q.derby); $("q-visual").classList.remove("hidden"); }
    if (ok) commentate(q);
    renderScoreboard();
    saveStats();
    state.newTrophies.push(...checkTrophies());

    const fb = $("feedback");
    let title;
    if (ok) {
      title = state.streak > 0 && state.streak % 5 === 0
        ? `🔥 ${state.streak} bonnes réponses d'affilée !`
        : pick(["⚽ Buuut !", "✅ Bien vu !", "🎯 En pleine lucarne !", "👏 Bravo !", "🧤 Arrêt réflexe, c'est validé !"]);
    } else if (choice === null) {
      title = "⏱️ Temps écoulé !";
    } else {
      title = pick(["❌ Raté !", "🟥 Carton rouge !", "😬 À côté du poteau !", "🚩 Hors-jeu !"]);
    }
    const answerText = q.typeIn ? `C'était ${q.answers[0]} ${q.last}.`
      : q.order ? "Voici le bon ordre."
      : q.multi ? `Les bonnes réponses : ${q.correct.join(", ")}.`
      : `La bonne réponse : ${q.correct[0]}.`;
    fb.innerHTML = `<strong></strong><span></span>`;
    fb.firstChild.textContent = ok ? title : `${title} ${answerText}`;
    if (q.typeIn && ok && !nm.exact) fb.firstChild.textContent = `${title} (petite faute, on valide : ${q.answers[0]})`;
    if (q.typeIn && choice && choice[0] === "") fb.firstChild.textContent = `🤷 Dommage ! ${answerText}`;
    fb.lastChild.textContent = q.explain;
    if (bossLine) { const bl = document.createElement("span"); bl.className = "boss-line"; bl.textContent = bossLine; fb.appendChild(bl); }
    if (state.blurBonus) { const bb = document.createElement("span"); bb.className = "boss-line"; bb.textContent = "🔍 Vu à travers le flou ! +2 🪙 bonus"; fb.appendChild(bb); }
    if (gain) {
      const g = document.createElement("em");
      g.className = "coin-gain";
      g.textContent = `+${gain} 🪙`;
      fb.firstChild.appendChild(g);
    }
    fb.className = `feedback ${ok ? "good" : "bad"}`;
    renderJokers();

    $("validate-btn").classList.add("hidden");
    const next = $("next-btn");
    const dies = (state.play === "sudden" || state.play === "hilo") && !ok;
    const last = state.index === state.list.length - 1 || dies;
    if (dies) state.suddenOver = true;
    next.textContent = last ? "Voir le résultat →" : "Suivante →";
    next.classList.remove("hidden");
    next.focus({ preventScroll: true });
    // Contre-la-montre : on enchaîne tout seul
    if (state.play === "rush") {
      clearTimeout(state.autoNext);
      state.autoNext = setTimeout(() => { if (state.inGame && state.answered) nextQuestion(); }, ok ? 650 : 1500);
    }
  }

  function nextQuestion() {
    clearTimeout(state.autoNext);
    if (!state.inGame) return;
    if (state.suddenOver) { finish(); return; }
    if (state.index < state.list.length - 1) {
      state.index++;
      renderQuestion();
    } else {
      finish();
    }
  }

  // ---------- Fin ----------
  function finish() {
    clearInterval(state.tick);
    clearInterval(state.rushTick);
    clearTimeout(state.autoNext);
    document.querySelectorAll(".turn-overlay").forEach((o) => o.remove());
    document.body.classList.remove("turn-wait");
    if (!state.inGame) return;
    const p = state.play;
    const total = ["sudden", "rush", "hilo"].includes(p) ? state.answeredCount : state.list.length;
    const pct = total ? Math.round((state.score / total) * 100) : 0;
    $("progress-bar").style.width = "100%";

    let emoji, title, msg, scoreText = `${state.score} / ${total}`;
    if (pct === 100) { emoji = "🏆"; title = "Ballon d'Or !"; msg = "Un sans-faute. Tu es le roi de la fête."; }
    else if (pct >= 80) { emoji = "🥇"; title = "Champion !"; msg = "Niveau Ligue des champions. Respect."; }
    else if (pct >= 60) { emoji = "🥈"; title = "Très solide !"; msg = "Tu connais ton foot, encore un petit effort pour le titre."; }
    else if (pct >= 40) { emoji = "🥉"; title = "Pas mal !"; msg = "Milieu de tableau. Un peu de révision et ça passe."; }
    else { emoji = "🟨"; title = "Peut mieux faire…"; msg = "Retour au centre de formation, mais ne lâche rien !"; }

    let recordText = "";
    const recordFor = (key, val) => {
      const prev = Number(storage.get(key) || 0);
      if (!val && !prev) return "";
      if (val > prev) { storage.set(key, String(val)); return prev ? `🎉 Nouveau record ! (ancien : ${prev})` : "🎉 Premier record !"; }
      return `🏅 Ton record : ${prev}`;
    };

    if (p === "sudden") {
      const n = state.score;
      emoji = n >= 25 ? "🧊" : n >= 10 ? "💀" : "⚰️";
      title = n >= 25 ? "Nerfs d'acier !" : n >= 10 ? "Sang-froid !" : n >= 3 ? "Mort subite…" : "Éliminé d'entrée !";
      scoreText = `${n} bonne${n > 1 ? "s" : ""} réponse${n > 1 ? "s" : ""}`;
      msg = state.suddenOver ? "La première erreur t'a éliminé." : "Tu as répondu à toutes les questions de la sélection, chapeau !";
      recordText = recordFor(`fqf-best-sudden-${state.theme}`, n);
      stats.suddenBest = Math.max(stats.suddenBest, n);
    } else if (p === "rush") {
      const n = state.score;
      emoji = n >= 20 ? "🚀" : n >= 10 ? "⏳" : "⌛";
      title = "Temps écoulé !";
      scoreText = `${n} bonne${n > 1 ? "s" : ""} réponse${n > 1 ? "s" : ""}`;
      msg = `${state.answeredCount} question${state.answeredCount > 1 ? "s" : ""} jouée${state.answeredCount > 1 ? "s" : ""} contre la montre.`;
      recordText = recordFor(`fqf-best-rush-${state.theme}`, n);
      stats.rushBest = Math.max(stats.rushBest, n);
    } else if (p === "daily") {
      const t = todayStr();
      if (daily.scores[t] === undefined) {
        daily.streak = daily.last === yesterdayStr() ? daily.streak + 1 : 1;
        daily.best = Math.max(daily.best, daily.streak);
        daily.last = t;
        daily.scores[t] = state.score;
        // On ne garde que les 60 derniers jours
        const keys = Object.keys(daily.scores).sort();
        while (keys.length > 60) delete daily.scores[keys.shift()];
        saveDaily();
        stats.dailyBestStreak = Math.max(stats.dailyBestStreak, daily.streak);
        addCoins(30);
        recordText = `📅 Défi du jour réussi : +30 🪙 · Série : ${daily.streak} jour${daily.streak > 1 ? "s" : ""} 🔥`;
      } else recordText = `📅 Score officiel du jour : ${daily.scores[t]}/${DAILY_COUNT} (partie pour le plaisir)`;
      title = `Défi du jour : ${title}`;
    } else if (p === "hilo") {
      const n = state.score;
      emoji = n >= 10 ? "🔮" : n >= 5 ? "↕️" : "🙈";
      title = n >= 10 ? "Sixième sens !" : n >= 5 ? "Bien joué !" : "Raté !";
      scoreText = `Série de ${n}`;
      msg = "Une erreur et c'est fini : retente ta chance !";
      recordText = recordFor("fqf-best-hilo", n);
      stats.hiloBest = Math.max(stats.hiloBest, n);
    } else if (p === "boss") {
      const me = state.score, her = state.bossScore;
      scoreText = `${me} – ${her}`;
      if (me > her) {
        const wins = Number(storage.get("fqf-boss-wins") || 0) + 1;
        storage.set("fqf-boss-wins", String(wins));
        emoji = "🏆"; title = `Tu as battu La Fête !`;
        msg = `C'est ta ${wins === 1 ? "première" : `${wins}e`} victoire contre elle.`;
        stats.bossBeaten++;
        addCoins(30);
        recordText = "🥳 Victoire : +30 🪙";
      } else if (me === her) {
        emoji = "🤝"; title = "Match nul !"; msg = "La Fête t'a tenu tête. Rejoue pour la battre !";
      } else {
        emoji = "🥳"; title = "La Fête a gagné…"; msg = "Elle fait la fête, toi tu fais la tête. Revanche ?";
      }
    } else if (p === "kits") {
      title = pct === 100 ? "Œil de lynx !" : title;
      if (total >= 10) recordText = recordFor("fqf-best-kits", pct).replace(/(\d+)(\)?)$/, "$1 %$2");
    } else if (p === "review") {
      title = state.fixed ? `${state.fixed} erreur${state.fixed > 1 ? "s" : ""} corrigée${state.fixed > 1 ? "s" : ""} !` : title;
      msg = missed.size ? `Encore ${missed.size} question${missed.size > 1 ? "s" : ""} à revoir.` : "Plus aucune erreur à revoir, bravo !";
    } else if (p === "party") {
      const rank = state.players.slice().sort((x, y) => y.score - x.score);
      const top = rank[0].score;
      const winners = rank.filter((x) => x.score === top);
      emoji = "🎉";
      title = winners.length > 1 ? `Égalité : ${winners.map((w) => w.name).join(" & ")} !` : `${winners[0].name} gagne !`;
      scoreText = `${top} / ${total / state.players.length}`;
      msg = winners.length > 1 ? `${top} bonnes réponses chacun. Il faut une revanche !` : "Le roi de la soirée, c'est lui ! 👑";
      const box = $("party-rank");
      box.innerHTML = "";
      const medals = ["🥇", "🥈", "🥉"];
      let place = -1, prevScore = null;
      rank.forEach((pl) => {
        if (pl.score !== prevScore) place++;
        prevScore = pl.score;
        const row = document.createElement("div");
        row.className = `pr-row${place === 0 ? " win" : ""}`;
        row.innerHTML = `<span class="pr-pos">${medals[place] || place + 1}</span><span class="pr-name"></span><span class="pr-best"></span><b class="pr-score"></b>`;
        row.querySelector(".pr-name").textContent = pl.name;
        row.querySelector(".pr-best").textContent = pl.best >= 3 ? `${pl.best} 🔥` : "";
        row.querySelector(".pr-score").textContent = pl.score;
        box.appendChild(row);
      });
      stats.partyGames++;
      const lg = recordLeague(state.players);
      if (lg) {
        const lb = document.createElement("div");
        lb.className = "league-end";
        lb.innerHTML = `<div class="league-head"><b>🏆 Ligue entre potes</b><span>Journée ${lg.day} / ${LEAGUE_DAYS}</span></div>
          ${lg.champion ? `<p class="league-champ big">👑 <b></b> est champion de la saison !</p>` : ""}${leagueTableHtml(lg.rows)}`;
        if (lg.champion) lb.querySelector(".league-champ b").textContent = lg.champion.name;
        box.appendChild(lb);
      }
    }
    $("party-rank").classList.toggle("hidden", p !== "party");

    $("end-emoji").textContent = emoji;
    $("end-title").textContent = title;
    $("end-score").textContent = scoreText;
    $("end-msg").innerHTML = "";
    $("end-msg").textContent = msg;
    if (recordText) {
      const r = document.createElement("span");
      r.className = "end-record";
      r.textContent = recordText;
      $("end-msg").appendChild(r);
    }

    if (p === "classic") {
      const prev = storage.get(bestKey() + "-pct");
      if (total >= 10 && (prev === null || pct > Number(prev))) {
        storage.set(bestKey() + "-pct", String(pct));
        storage.set(bestKey(), `${state.score}/${total} (${pct}%)`);
      }
    }

    // Statistiques de fin de partie et trophées (pas pour la Soirée : ce ne sont pas tes réponses)
    if (p !== "party") {
      stats.games++;
      if (!state.timerOn && p !== "rush") stats.zenGames++;
      if (p === "kits" && total >= 10 && pct === 100) stats.kitPerfect++;
      if (state.theme === "cr7" && ["classic", "sudden", "rush", "boss"].includes(p)) {
        stats.cr7Games++;
        if (p === "classic" && total >= 20 && pct === 100) stats.cr7Perfect++;
      }
      if (p === "classic" || p === "daily") {
        if (total >= 10 && pct === 100) { stats.perfect10++; addCoins(20); }
        if (total >= 20 && pct === 100) stats.perfect20++;
      }
      if (p === "classic" && total >= 50 && pct >= 80) stats.marathon++;
      if (state.isAll) stats.fullGames++;
    }
    saveStats();
    state.newTrophies.push(...checkTrophies());
    renderNewTrophies(state.newTrophies);

    const statBox = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
    const coinStat = p === "party" ? "" : statBox(`+${state.coinsEarned} 🪙`, "Pièces gagnées");
    let statsHtml;
    if (p === "party") statsHtml = statBox(state.players.length, "Joueurs") + statBox(total / state.players.length, "Questions chacun");
    else if (p === "boss") statsHtml = statBox(pct + "%", "Ta réussite") + statBox("76 %", "La Fête") + coinStat;
    else if (p === "sudden" || p === "rush" || p === "hilo") statsHtml = statBox(`${state.bestStreak} 🔥`, "Meilleure série") + statBox(pct + "%", "Réussite") + coinStat;
    else statsHtml = statBox(pct + "%", "Réussite") + statBox(`${state.bestStreak} 🔥`, "Meilleure série") + coinStat;
    $("end-stats").innerHTML = statsHtml;
    state.inGame = false;
    renderWallet();

    const review = $("review");
    review.innerHTML = "";
    $("review-wrap").classList.toggle("hidden", state.mistakes.length === 0 || p === "party");
    state.mistakes.forEach(({ q, choice }) => {
      const li = document.createElement("li");
      li.innerHTML = `<div class="rq"></div><div class="ry"></div><div class="rc"></div><div class="re"></div>`;
      li.children[0].textContent = q.q;
      li.children[1].textContent = `Ta réponse : ${choice ? choice.join(", ") : "aucune (temps écoulé)"}`;
      li.children[2].textContent = `Bonne réponse : ${q.correct.join(", ")}`;
      li.children[3].textContent = q.explain;
      review.appendChild(li);
    });

    show("end");
    const good = p === "party" || p === "daily" || (p === "sudden" ? state.score >= 10 : p === "rush" ? state.score >= 10 : pct >= 60);
    Sounds.play("end", good || state.newTrophies.length > 0);
    if (p === "party" || pct >= 80 && p !== "sudden" && p !== "rush" || state.score >= 15 && (p === "sudden" || p === "rush")) confetti();
    // Révélation automatique si le Trophée CR7 Ultime vient d'être débloqué
    if (state.newTrophies.some((t) => t.id === "cr7-ultime")) setTimeout(openLegend, 1800);
  }

  // Encadré « Nouveaux trophées » en fin de partie
  function renderNewTrophies(list) {
    const box = $("new-trophies");
    box.classList.toggle("hidden", list.length === 0);
    if (!list.length) return;
    box.innerHTML = `<h3>${list.length > 1 ? `${list.length} nouveaux trophées !` : "Nouveau trophée !"}</h3>`;
    const row = document.createElement("div");
    row.className = "nt-row";
    list.forEach((t) => {
      const el = document.createElement("div");
      el.className = `nt tier-${t.tier}`;
      el.innerHTML = `<span class="nt-ico"></span><span class="nt-name"></span><span class="nt-tier"></span>`;
      el.children[0].textContent = t.icon;
      el.children[1].textContent = t.name;
      el.children[2].textContent = TROPHY_TIERS[t.tier];
      row.appendChild(el);
    });
    box.appendChild(row);
  }

  // Écran des trophées
  let openTierGroups = new Set();
  try { openTierGroups = new Set(JSON.parse(storage.get("fqf-open-tiers") || "[]")); } catch { openTierGroups = new Set(); }

  function renderTrophies() {
    const s = fullStats();
    const got = TROPHIES.filter((t) => unlocked[t.id]).length;
    $("tr-count").textContent = `${got} / ${TROPHIES.length}`;
    $("tr-bar").style.width = `${(got / TROPHIES.length) * 100}%`;
    $("tr-stats").innerHTML = `
      <div class="stat"><b>${stats.games}</b><span>Parties</span></div>
      <div class="stat"><b>${stats.correct}</b><span>Bonnes réponses</span></div>
      <div class="stat"><b>${stats.bestStreak} 🔥</b><span>Meilleure série</span></div>`;
    // Vitrine du Trophée CR7 Ultime : toujours visible, verrouillée tant qu'il n'est pas gagné
    const vit = $("tr-vitrine");
    vit.innerHTML = "";
    const won = !!unlocked["cr7-ultime"];
    const have = CR7_TROPHY_IDS.filter((id) => unlocked[id]).length;
    // Vitrine = entrée de la salle des trophées
    const nGot = TROPHIES.filter((t) => unlocked[t.id]).length;
    const vb = document.createElement("button");
    vb.className = "vitrine";
    vb.type = "button";
    vb.innerHTML = `<div class="v-cups">${cupSvg("bronze")}${cupSvg("or")}${cupSvg("argent")}</div>
      <div class="v-txt"><div class="v-kicker">✦ VITRINE ✦</div>
      <div class="v-title">Ma salle des trophées</div>
      <div class="v-cta">${nGot ? `${nGot} trophée${nGot > 1 ? "s" : ""} exposé${nGot > 1 ? "s" : ""}` : "Aucun trophée exposé pour l'instant"} · Touche pour entrer</div></div>`;
    vb.onclick = openRoom;
    vit.appendChild(vb);

    // Panneau « Défi Superfan » : les 5 trophées à réunir
    const defi = document.createElement("div");
    defi.className = `defi${won ? " won" : ""}`;
    defi.innerHTML = `<div class="defi-head"><span class="defi-tag">🐐 DÉFI SUPERFAN</span><b class="defi-count">${have} / 5</b></div>
      <p class="defi-intro"></p><ul class="defi-list"></ul>`;
    defi.querySelector(".defi-intro").textContent = won
      ? "Défi réussi ! Tu as réuni les 5 trophées Superfan et gagné le Trophée CR7 Ultime."
      : "Réunis ces 5 trophées en mode Superfan CR7 pour ouvrir la malle et gagner le Trophée CR7 Ultime.";
    const ul = defi.querySelector(".defi-list");
    CR7_TROPHY_IDS.forEach((id) => {
      const t = TROPHIES.find((x) => x.id === id);
      const goal = trophyGoal(t);
      const done = !!unlocked[id];
      const val = Math.min(t.value(s, unlocked), goal);
      const li = document.createElement("li");
      li.className = done ? "ok" : "";
      li.innerHTML = `<span class="d-check">${done ? "✅" : "⬜"}</span>
        <span class="d-body"><b class="d-name"></b> <span class="d-prog"></span><span class="d-desc"></span><span class="d-tip"></span></span>`;
      li.querySelector(".d-name").textContent = `${t.icon} ${t.name}`;
      li.querySelector(".d-prog").textContent = done ? "· réussi" : `· ${val} / ${goal}`;
      li.querySelector(".d-desc").textContent = t.desc;
      li.querySelector(".d-tip").textContent = done ? "" : t.tip || "";
      ul.appendChild(li);
    });
    vit.appendChild(defi);
    const grid = $("tr-grid");
    grid.innerHTML = "";
    // Trophées rangés par niveau, dans des menus déroulants avec la progression
    const GROUPS = [
      { tier: "bronze", label: "Bronze" },
      { tier: "argent", label: "Argent" },
      { tier: "or", label: "Or" },
      { tier: "legende", label: "Légende" },
      { tier: "ultime", label: "Ultime" },
    ];
    const groupBody = {};
    GROUPS.forEach((gp) => {
      const list = TROPHIES.filter((t) => t.tier === gp.tier);
      if (!list.length) return;
      const got = list.filter((t) => unlocked[t.id]).length;
      const det = document.createElement("details");
      det.className = `tier-group tier-${gp.tier}${got === list.length ? " complete" : ""}`;
      det.open = openTierGroups.has(gp.tier);
      det.addEventListener("toggle", () => {
        det.open ? openTierGroups.add(gp.tier) : openTierGroups.delete(gp.tier);
        storage.set("fqf-open-tiers", JSON.stringify([...openTierGroups]));
      });
      const icon = gp.tier === "ultime" ? (unlocked["cr7-ultime"] ? LegendReveal.miniSvg() : "🔒") : cupSvg(gp.tier);
      det.innerHTML = `<summary>
          <span class="tg-ico">${icon}</span>
          <span class="tg-main"><span class="tg-top"><b class="tg-name">${gp.label}</b><span class="tg-count">${got} / ${list.length}</span></span>
          <span class="tg-bar"><span style="width:${(got / list.length) * 100}%"></span></span>
          <span class="tg-sub">${got === list.length ? "✅ Tous débloqués !" : `${list.length - got} à débloquer`}</span></span>
          <span class="tg-chev" aria-hidden="true"></span>
        </summary><div class="tg-body"></div>`;
      groupBody[gp.tier] = det.querySelector(".tg-body");
      grid.appendChild(det);
    });
    TROPHIES.forEach((t) => {
      const goal = trophyGoal(t);
      const val = Math.min(t.value(s, unlocked), goal);
      const done = !!unlocked[t.id];
      const card = document.createElement("div");
      card.className = `trophy tier-${t.tier}${done ? " done" : ""}`;
      card.innerHTML = `
        <div class="t-ico"></div>
        <div class="t-body">
          <div class="t-top"><b class="t-name"></b><span class="t-tier"></span></div>
          <div class="t-desc"></div>
          <div class="t-prog"><div class="t-bar"></div></div>
          <div class="t-val"></div>
        </div>`;
      if (done && t.tier === "ultime") card.querySelector(".t-ico").innerHTML = LegendReveal.miniSvg();
      else card.querySelector(".t-ico").textContent = done ? t.icon : "🔒";
      card.querySelector(".t-name").textContent = t.name;
      card.querySelector(".t-tier").textContent = TROPHY_TIERS[t.tier];
      card.querySelector(".t-desc").textContent = t.desc;
      card.querySelector(".t-bar").style.width = done ? "100%" : `${goal ? (val / goal) * 100 : 0}%`;
      card.querySelector(".t-val").textContent = done
        ? `Débloqué le ${unlocked[t.id].split("-").reverse().join("/")}`
        : `${val} / ${goal}`;
      if (CR7_TROPHY_IDS.includes(t.id) || t.tier === "ultime") {
        const tag = document.createElement("span");
        tag.className = "defi-chip";
        tag.textContent = t.tier === "ultime" ? "🐐 Récompense du Défi Superfan" : "🐐 Défi Superfan";
        card.querySelector(".t-desc").before(tag);
      }
      if (t.tier === "ultime") {
        const hint = document.createElement("div");
        hint.className = "t-hint";
        hint.textContent = done ? "✨ Touche pour l'admirer" : "🔒 Touche pour voir la malle";
        card.querySelector(".t-body").appendChild(hint);
        card.setAttribute("role", "button");
        card.tabIndex = 0;
        const go = () => openLegend(done);
        card.onclick = go;
        card.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
      }
      (groupBody[t.tier] || grid).appendChild(card);
    });
  }

  // Ouvre la malle du Trophée CR7 Ultime
  // loop : l'animation se répète (vitrine)
  function openLegend(loop = false) {
    Sounds.unlock();
    const d = unlocked["cr7-ultime"];
    LegendReveal.open({
      unlocked: !!d,
      date: d ? d.split("-").reverse().join("/") : "",
      remaining: CR7_TROPHY_IDS.filter((id) => !unlocked[id]).length,
      loop,
    });
  }

  // ---------- Salle des trophées ----------
  const TIER_ORDER = ["legende", "or", "argent", "bronze"];
  const TIER_COLORS = {
    bronze: ["#f2c08d", "#b0703a", "#6e3f17"],
    argent: ["#ffffff", "#aab4bc", "#5f6a72"],
    or: ["#fff2a8", "#e0a91e", "#7a4d00"],
    legende: ["#e9d5ff", "#9b5de5", "#4c1d95"],
  };
  let cupId = 0;
  // Trophées dessinés : une forme différente par niveau.
  // Renvoie le SVG et la position verticale (en %) où placer l'icône du trophée.
  // Couleurs de gravure (creux sombre → relief clair) pour chaque métal
  const ENGRAVE = {
    or: [[0.36, 0.2, 0.0], [0.86, 0.62, 0.13]],
    argent: [[0.2, 0.23, 0.26], [0.66, 0.71, 0.75]],
    bronze: [[0.3, 0.13, 0.04], [0.78, 0.47, 0.26]],
    legende: [[0.24, 0.04, 0.42], [0.74, 0.55, 0.97]],
  };
  const escapeXml = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function trophyArt(tier, icon) {
    const n = cupId++;
    const g = (k) => `t${n}${k}`;
    // Icône gravée : centrée sur le médaillon et découpée à l'intérieur du cercle
    const emb = (cx, cy, r, size) => {
      if (!icon) return "";
      const [d, l] = ENGRAVE[tier] || ENGRAVE.or;
      const row = (i) => `${((l[i] - d[i]) * 0.3).toFixed(3)} ${((l[i] - d[i]) * 0.59).toFixed(3)} ${((l[i] - d[i]) * 0.11).toFixed(3)} 0 ${d[i]}`;
      return `<defs>
        <clipPath id="${g("e")}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
        <filter id="${g("f")}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="${row(0)}  ${row(1)}  ${row(2)}  0 0 0 1 0" result="m"/>
          <feOffset in="SourceAlpha" dx="0" dy="0.7" result="o1"/>
          <feFlood flood-color="#fff" flood-opacity=".75"/><feComposite in2="o1" operator="in" result="hi"/>
          <feOffset in="SourceAlpha" dx="0" dy="-0.6" result="o2"/>
          <feFlood flood-color="#000" flood-opacity=".45"/><feComposite in2="o2" operator="in" result="sh"/>
          <feMerge><feMergeNode in="hi"/><feMergeNode in="sh"/><feMergeNode in="m"/></feMerge>
        </filter></defs>
        <g clip-path="url(#${g("e")})"><text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="${size}"
          font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" filter="url(#${g("f")})">${escapeXml(icon)}</text></g>`;
    };
    const glint = (clip) => `<g clip-path="url(#${g("c")})"><rect class="t-glint" x="0" y="0" width="22" height="100" fill="url(#${g("w")})"/></g>`;
    const glintDef = `<linearGradient id="${g("w")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

    if (tier === "bronze") {
      // Médaille sur ruban
      let leaves = "";
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const x = 40 + 21.5 * Math.cos(a), y = 66 + 21.5 * Math.sin(a);
        leaves += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.2" ry="1.6" fill="#7a431a" opacity=".55" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      }
      return { top: 66, svg: `<svg class="t-art" viewBox="0 0 80 100" aria-hidden="true"><defs>
        <radialGradient id="${g("m")}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffd7ae"/><stop offset=".45" stop-color="#c98a55"/><stop offset="1" stop-color="#6e3f17"/></radialGradient>
        <radialGradient id="${g("i")}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffe6cc"/><stop offset="1" stop-color="#b0703a"/></radialGradient>
        <clipPath id="${g("c")}"><circle cx="40" cy="66" r="26"/></clipPath>${glintDef}</defs>
        <path d="M20 0 H35 L46 42 H31 Z" fill="#c0392b"/><path d="M24 0 H28 L37 42 H33 Z" fill="#fff" opacity=".85"/>
        <path d="M60 0 H45 L34 42 H49 Z" fill="#1f5fa8"/><path d="M56 0 H52 L43 42 H47 Z" fill="#fff" opacity=".85"/>
        <rect x="34" y="36" width="12" height="8" rx="2" fill="#8a5a2b"/>
        <circle cx="40" cy="66" r="26" fill="url(#${g("m")})" stroke="#5a3010" stroke-width="2"/>
        <circle cx="40" cy="66" r="20" fill="none" stroke="#ffe0c0" stroke-width="1" opacity=".6"/>
        ${leaves}
        <circle cx="40" cy="66" r="15" fill="url(#${g("i")})" stroke="#7a431a" stroke-width="1.2"/>
        ${emb(40, 66, 14, 20)}
        <path d="M24 56 A18 18 0 0 1 36 47" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
        ${glint()}</svg>` };
    }

    if (tier === "argent") {
      // Coupe élancée sur socle en marbre
      return { top: 31, svg: `<svg class="t-art" viewBox="0 0 80 100" aria-hidden="true"><defs>
        <linearGradient id="${g("s")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5f6a72"/><stop offset=".3" stop-color="#ffffff"/><stop offset=".55" stop-color="#aab4bc"/><stop offset=".8" stop-color="#e9eef2"/><stop offset="1" stop-color="#5f6a72"/></linearGradient>
        <linearGradient id="${g("b")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3f44"/><stop offset=".5" stop-color="#15171a"/><stop offset="1" stop-color="#2c3035"/></linearGradient>
        <clipPath id="${g("c")}"><path d="M17 8 H63 C63 38 53 52 40 54 C27 52 17 38 17 8 Z"/><path d="M36 54 H44 L46 70 H34 Z"/></clipPath>${glintDef}</defs>
        <path d="M19 14 C4 14 4 38 26 42 M61 14 C76 14 76 38 54 42" fill="none" stroke="url(#${g("s")})" stroke-width="4" stroke-linecap="round"/>
        <path d="M17 8 H63 C63 38 53 52 40 54 C27 52 17 38 17 8 Z" fill="url(#${g("s")})" stroke="#5f6a72" stroke-width="1"/>
        <ellipse cx="40" cy="8" rx="23" ry="4" fill="#f4f7f9" stroke="#8a949b" stroke-width="1"/>
        <path d="M20 46 C28 52 52 52 60 46" fill="none" stroke="#7d8891" stroke-width="1.5" opacity=".7"/>
        <radialGradient id="${g("p")}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#cfd6db"/><stop offset="1" stop-color="#8a949b"/></radialGradient>
        <circle cx="40" cy="31" r="11.5" fill="url(#${g("p")})" stroke="#6b757c" stroke-width="1.8"/>
        <circle cx="40" cy="31" r="9.5" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/>
        <path d="M36 54 H44 L46 70 H34 Z" fill="url(#${g("s")})"/>
        <ellipse cx="40" cy="62" rx="7" ry="3" fill="url(#${g("s")})" stroke="#7d8891" stroke-width=".8"/>
        <path d="M26 70 H54 L57 76 H23 Z" fill="url(#${g("s")})"/>
        <rect x="20" y="76" width="40" height="18" rx="2" fill="url(#${g("b")})"/>
        <rect x="29" y="81" width="22" height="7" rx="1.5" fill="url(#${g("s")})"/>
        ${emb(40, 31, 9, 12.5)}
        <path d="M22 16 C23 32 27 42 33 48" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
        ${glint()}</svg>` };
    }

    if (tier === "or") {
      // Grande coupe dorée avec lauriers, étoile et rubis
      let laurel = "";
      [-1, 1].forEach((side) => {
        for (let i = 0; i < 6; i++) {
          const t = i / 5;
          const x = 40 + side * (30 - 4 * t), y = 60 - t * 38;
          laurel += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="2.2" fill="#d4a017" stroke="#7a4d00" stroke-width=".6" transform="rotate(${side * (40 + t * 30)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
        }
      });
      return { top: 33, svg: `<svg class="t-art" viewBox="0 0 80 100" aria-hidden="true"><defs>
        <linearGradient id="${g("o")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4800"/><stop offset=".25" stop-color="#ffe27a"/><stop offset=".45" stop-color="#d99c12"/><stop offset=".62" stop-color="#fff5c2"/><stop offset=".82" stop-color="#c58606"/><stop offset="1" stop-color="#6e4300"/></linearGradient>
        <radialGradient id="${g("r")}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff8a93"/><stop offset=".4" stop-color="#e0102b"/><stop offset="1" stop-color="#5c0010"/></radialGradient>
        <linearGradient id="${g("d")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3f1d"/><stop offset="1" stop-color="#2e1a0b"/></linearGradient>
        <clipPath id="${g("c")}"><path d="M15 12 H65 C65 42 54 56 40 58 C26 56 15 42 15 12 Z"/><path d="M34 2 L40 -6 L46 2 Z"/></clipPath>${glintDef}</defs>
        ${laurel}
        <path d="M17 18 C0 18 2 44 26 48 M63 18 C80 18 78 44 54 48" fill="none" stroke="url(#${g("o")})" stroke-width="5" stroke-linecap="round"/>
        <path d="M15 12 H65 C65 42 54 56 40 58 C26 56 15 42 15 12 Z" fill="url(#${g("o")})" stroke="#6e4300" stroke-width="1"/>
        <ellipse cx="40" cy="12" rx="25" ry="4.5" fill="#fff1a6" stroke="#8a5600" stroke-width="1"/>
        <polygon points="40,-2 42.6,4.4 49.5,4.6 44.1,8.8 46,15.5 40,11.6 34,15.5 35.9,8.8 30.5,4.6 37.4,4.4" fill="#fff5c2" stroke="#b8860b" stroke-width="1" transform="translate(0 -1)"/>
        <radialGradient id="${g("p")}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff3bd"/><stop offset=".7" stop-color="#e8bb3c"/><stop offset="1" stop-color="#b07d0c"/></radialGradient>
        <circle cx="40" cy="33" r="12.5" fill="url(#${g("p")})" stroke="#8a5600" stroke-width="2"/>
        <circle cx="40" cy="33" r="10.5" fill="none" stroke="#fff5c2" stroke-width=".8" opacity=".8"/>
        <circle cx="21" cy="30" r="3" fill="url(#${g("r")})"/><circle cx="59" cy="30" r="3" fill="url(#${g("r")})"/>
        <path d="M35 58 H45 L47 66 H33 Z" fill="url(#${g("o")})"/>
        <ellipse cx="40" cy="66" rx="9" ry="3" fill="#ffe27a" stroke="#8a5600" stroke-width=".8"/>
        <path d="M37 66 H43 L45 72 H35 Z" fill="url(#${g("o")})"/>
        <rect x="24" y="72" width="32" height="5" rx="1.5" fill="url(#${g("o")})"/>
        <rect x="19" y="77" width="42" height="18" rx="2" fill="url(#${g("d")})"/>
        <rect x="27" y="82" width="26" height="8" rx="1.5" fill="url(#${g("o")})"/>
        ${emb(40, 33, 10, 13.5)}
        <path d="M20 20 C21 36 26 46 32 52" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        ${glint()}</svg>` };
    }

    // Légende : cristal violet taillé sur pied doré
    return { top: 33, svg: `<svg class="t-art" viewBox="0 0 80 100" aria-hidden="true"><defs>
      <radialGradient id="${g("h")}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#c084fc" stop-opacity=".75"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
      <linearGradient id="${g("k")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3e8ff"/><stop offset=".35" stop-color="#c084fc"/><stop offset=".7" stop-color="#7c3aed"/><stop offset="1" stop-color="#3b0764"/></linearGradient>
      <linearGradient id="${g("o")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4800"/><stop offset=".3" stop-color="#ffe27a"/><stop offset=".6" stop-color="#d99c12"/><stop offset="1" stop-color="#6e4300"/></linearGradient>
      <clipPath id="${g("c")}"><polygon points="40,2 64,20 59,54 40,68 21,54 16,20"/></clipPath>${glintDef}</defs>
      <circle cx="40" cy="36" r="36" fill="url(#${g("h")})"/>
      <polygon points="40,2 64,20 59,54 40,68 21,54 16,20" fill="url(#${g("k")})" stroke="#e9d5ff" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="40,2 52,22 40,34 28,22" fill="#fff" opacity=".35"/>
      <polygon points="16,20 28,22 40,34 21,54" fill="#fff" opacity=".12"/>
      <polygon points="64,20 52,22 40,34 59,54" fill="#3b0764" opacity=".25"/>
      <polygon points="21,54 40,34 59,54 40,68" fill="#3b0764" opacity=".35"/>
      <radialGradient id="${g("p")}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#faf5ff"/><stop offset=".7" stop-color="#d8b4fe"/><stop offset="1" stop-color="#a855f7"/></radialGradient>
      <circle cx="40" cy="34" r="12" fill="url(#${g("p")})" stroke="#f3e8ff" stroke-width="1.5"/>
      <path d="M30 62 C34 70 46 70 50 62 L47 72 H33 Z" fill="url(#${g("o")})"/>
      <rect x="35" y="72" width="10" height="8" fill="url(#${g("o")})"/>
      <rect x="22" y="80" width="36" height="5" rx="1.5" fill="url(#${g("o")})"/>
      <rect x="18" y="85" width="44" height="10" rx="2" fill="#1a1026"/>
      ${emb(40, 34, 10, 13.5)}
      <polygon class="t-spark" points="12,8 13.5,12 17,13 13.5,14 12,18 10.5,14 7,13 10.5,12" fill="#fff"/>
      <polygon class="t-spark s2" points="68,48 69.2,51 72,52 69.2,53 68,56 66.8,53 64,52 66.8,51" fill="#fff"/>
      <polygon class="t-spark s3" points="66,6 67,8.5 69.5,9.5 67,10.5 66,13 65,10.5 62.5,9.5 65,8.5" fill="#f3e8ff"/>
      ${glint()}</svg>` };
  }
  const cupSvg = (tier) => trophyArt(tier).svg;

  function showRoomDetail(t) {
    const box = $("room-detail");
    if (!t) { box.classList.add("hidden"); return; }
    const done = !!unlocked[t.id];
    box.className = `room-detail tier-${t.tier}${done ? "" : " is-locked"}`;
    box.innerHTML = `<span class="rd-ico"></span><div class="rd-txt"><b></b><span class="rd-tier"></span><p></p><small></small></div>
      <button class="rd-close" type="button" aria-label="Fermer">✕</button>`;
    box.querySelector(".rd-ico").textContent = done ? t.icon : "🔒";
    box.querySelector("b").textContent = t.name;
    box.querySelector(".rd-tier").textContent = TROPHY_TIERS[t.tier];
    box.querySelector("p").textContent = t.desc;
    const goal = trophyGoal(t);
    box.querySelector("small").textContent = done
      ? `Débloqué le ${unlocked[t.id].split("-").reverse().join("/")}`
      : `À débloquer · ${Math.min(t.value(fullStats(), unlocked), goal)} / ${goal}`;
    box.querySelector(".rd-close").onclick = () => showRoomDetail(null);
  }

  // Les vitrines de la salle
  // Trophée CR7 pas encore gagné : on ne dessine pas la vraie coupe, seulement une lueur et un « ? »
  const MYSTERY_CUP = '<span class="mystery-cup" aria-hidden="true"><span class="mc-glow"></span><span class="st-veil">?</span></span>';

  // Même ordre que la visite 3D : du plus modeste au plus prestigieux
  const ROOM_CASES = [
    { title: "Bronze", tiers: ["bronze"] },
    { title: "Argent", tiers: ["argent"] },
    { title: "Or", tiers: ["or"] },
    { title: "Légende", tiers: ["legende"] },
  ];

  function renderRoom() {
    const total = TROPHIES.filter((t) => unlocked[t.id]).length;
    $("room-count").textContent = `${total} / ${TROPHIES.length}`;
    $("room-num").textContent = total;
    $("room-label").textContent = total > 1 ? "TROPHÉES" : "TROPHÉE";
    showRoomDetail(null);

    // Piédestal central : le Trophée CR7 Ultime
    const ped = $("room-pedestal");
    const won = !!unlocked["cr7-ultime"];
    ped.className = `room-pedestal${won ? " won" : " locked"}`;
    ped.innerHTML = `<div class="hped room-hped">
        <span class="hped-beam b1"></span><span class="hped-beam b2"></span><span class="hped-beam b3"></span><span class="hped-pool"></span>
        <div class="bell">
          <div class="bell-cup">${won ? LegendReveal.miniSvg() : MYSTERY_CUP}</div>
          <span class="bell-glass"></span><span class="bell-knob"></span><span class="bell-ring"></span>
        </div>
        <div class="hped-cap"></div>
        <div class="hped-col"><span class="hped-plate">${won ? "Trophée CR7 Ultime" : "Emplacement réservé"}</span></div>
        <div class="hped-step s1"></div><div class="hped-step s2"></div>
      </div>
      <div class="rp-hint">${won ? "✨ Touche pour le voir sortir de la malle" : `🔒 Débloque les 5 trophées Superfan (${CR7_TROPHY_IDS.filter((id) => unlocked[id]).length} / 5)`}</div>`;
    ped.onclick = () => openLegend(won);

    // Vitrines éclairées : une niche par trophée (sombre tant qu'il n'est pas gagné)
    const cases = $("room-cases");
    cases.innerHTML = "";
    ROOM_CASES.forEach((c) => {
      const list = TROPHIES.filter((t) => c.tiers.includes(t.tier));
      const n = list.filter((t) => unlocked[t.id]).length;
      const el = document.createElement("section");
      el.className = "case";
      el.innerHTML = `<div class="case-sign">${c.title} <b>${n}/${list.length}</b></div><div class="case-grid"></div>`;
      const grid = el.querySelector(".case-grid");
      list.forEach((t) => {
        const done = !!unlocked[t.id];
        const b = document.createElement("button");
        b.type = "button";
        b.className = `niche tier-${t.tier}${done ? " lit" : " dark"}`;
        b.setAttribute("aria-label", done ? t.name : `${t.name} (à débloquer)`);
        const art = trophyArt(t.tier, done ? t.icon : "");
        // Piédestal en bois sous un spot (vide tant que le trophée n'est pas gagné)
        b.innerHTML = `<div class="ped">
            <span class="ped-beam"></span><span class="ped-pool"></span>
            <div class="ped-show">${done ? `<span class="st-art">${art.svg}</span>` : '<span class="ped-empty">?</span>'}</div>
            <div class="ped-top"></div>
            <div class="ped-col"><span class="ped-plate"></span></div>
            <div class="ped-foot"></div>
          </div>`;
        b.querySelector(".ped-plate").textContent = done ? t.name : "???";
        b.onclick = () => showRoomDetail(t);
        grid.appendChild(b);
      });
      cases.appendChild(el);
    });
  }

  // ---------- Visite 3D de la salle (on glisse à l'horizontale) ----------
  let walkRaf = 0;
  function openWalk() {
    Sounds.unlock();
    const total = TROPHIES.filter((t) => unlocked[t.id]).length;
    const won = !!unlocked["cr7-ultime"];
    const w = document.createElement("div");
    w.className = "walk";
    w.setAttribute("role", "dialog");
    w.setAttribute("aria-modal", "true");
    w.setAttribute("aria-label", "Visite 3D de la salle des trophées");
    w.innerHTML = `
      <div class="walk-wall"></div>
      <div class="walk-ceiling"></div>
      <div class="walk-floor"><div class="walk-floor-grid"></div></div>
      <div class="walk-track" tabindex="0"><div class="walk-spacer"></div></div>
      <div class="walk-ui">
        <button class="btn walk-close" type="button">✕ Sortir</button>
        <div class="walk-count">${total} / ${TROPHIES.length}</div>
      </div>
      <button class="walk-arrow left" type="button" aria-label="Reculer">‹</button>
      <button class="walk-arrow right" type="button" aria-label="Avancer">›</button>
      <div class="walk-hint">👉 Fais glisser pour te balader<span class="walk-rotate"> · 📱↻ Tourne ton téléphone</span></div>
      <div class="walk-detail hidden"></div>`;
    document.body.appendChild(w);
    const track = w.querySelector(".walk-track");

    const addStation = (cls, html, onTap) => {
      const st = document.createElement("button");
      st.type = "button";
      st.className = `station ${cls}`;
      st.innerHTML = `<div class="st-inner">${html}</div>`;
      if (onTap) st.onclick = onTap;
      track.appendChild(st);
      return st;
    };
    // Entrée
    addStation("st-entry", `<div class="st-title"><span>${total}</span>${total > 1 ? "TROPHÉES" : "TROPHÉE"}</div>
      <div class="st-welcome">Bienvenue dans ta salle des trophées</div>`);
    // Vitrines
    const detail = w.querySelector(".walk-detail");
    const showDetail = (t) => {
      const done = !!unlocked[t.id];
      const goal = trophyGoal(t);
      detail.className = `walk-detail tier-${t.tier}`;
      detail.innerHTML = `<b></b><span></span><small></small>`;
      detail.querySelector("b").textContent = `${done ? t.icon : "🔒"} ${t.name}`;
      detail.querySelector("span").textContent = t.desc;
      detail.querySelector("small").textContent = done
        ? `${TROPHY_TIERS[t.tier]} · débloqué le ${unlocked[t.id].split("-").reverse().join("/")}`
        : `${TROPHY_TIERS[t.tier]} · à débloquer (${Math.min(t.value(fullStats(), unlocked), goal)} / ${goal})`;
      clearTimeout(showDetail.tm);
      showDetail.tm = setTimeout(() => detail.classList.add("hidden"), 4000);
    };
    // Parcours du plus modeste au plus prestigieux : Bronze → Argent → Or → Légende → Ultime
    const WALK_ORDER = [
      { title: "Bronze", tiers: ["bronze"] },
      { title: "Argent", tiers: ["argent"] },
      { title: "Or", tiers: ["or"] },
      { title: "Légende", tiers: ["legende"] },
    ];
    WALK_ORDER.forEach((c) => {
      addStation("st-sign", `<div class="st-signboard">Vitrine<br><b>${c.title}</b></div>`);
      TROPHIES.filter((t) => c.tiers.includes(t.tier)).forEach((t) => {
        const done = !!unlocked[t.id];
        const art = trophyArt(t.tier, done ? t.icon : "");
        // Piédestal en bois éclairé par un spot (vide tant que le trophée n'est pas gagné)
        addStation(`st-case tier-${t.tier}${done ? " lit" : " dark"}`,
          `<div class="ped">
             <span class="ped-beam"></span><span class="ped-pool"></span>
             <div class="ped-show">${done ? `<span class="st-art">${art.svg}</span>` : '<span class="ped-empty">?</span>'}</div>
             <div class="ped-top"></div>
             <div class="ped-col"><span class="ped-plate">${done ? escapeXml(t.name) : "???"}</span></div>
             <div class="ped-foot"></div>
           </div>`, () => showDetail(t));
      });
    });
    // Salle d'honneur : le Trophée CR7 Ultime
    addStation(`st-honor${won ? " won" : " locked"}`,
      `<div class="st-honor-sign">Salle d'honneur</div>
       <div class="hped">
         <span class="hped-beam b1"></span><span class="hped-beam b2"></span><span class="hped-beam b3"></span><span class="hped-pool"></span>
         <div class="bell">
           <div class="bell-cup">${won ? LegendReveal.miniSvg() : MYSTERY_CUP}</div>
           <span class="bell-glass"></span><span class="bell-knob"></span>
           <span class="bell-ring"></span>
         </div>
         <div class="hped-cap"></div>
         <div class="hped-col"><span class="hped-plate">${won ? "Trophée CR7 Ultime" : "Emplacement réservé"}</span></div>
         <div class="hped-step s1"></div><div class="hped-step s2"></div>
       </div>`,
      () => openLegend(won));
    track.insertAdjacentHTML("beforeend", '<div class="walk-spacer"></div>');

    // Effet de profondeur : chaque station pivote selon sa distance au centre
    const stations = [...track.querySelectorAll(".station")];
    const wall = w.querySelector(".walk-wall"), floor = w.querySelector(".walk-floor-grid"), ceil = w.querySelector(".walk-ceiling");
    const update = () => {
      walkRaf = 0;
      const vw = track.clientWidth, sx = track.scrollLeft, mid = sx + vw / 2;
      stations.forEach((st) => {
        const c = st.offsetLeft + st.offsetWidth / 2;
        const d = Math.max(-2.2, Math.min(2.2, (c - mid) / (vw / 2)));
        const inner = st.firstElementChild;
        inner.style.transform = `translateZ(${-Math.abs(d) * 260}px) rotateY(${-d * 38}deg) scale(${1 - Math.min(Math.abs(d), 1) * 0.08})`;
        inner.style.opacity = String(Math.max(0.25, 1 - Math.abs(d) * 0.35));
        st.classList.toggle("is-center", Math.abs(d) < 0.25);
      });
      wall.style.backgroundPositionX = `${-sx * 0.35}px`;
      ceil.style.backgroundPositionX = `${-sx * 0.6}px`;
      floor.style.backgroundPositionX = `${-sx * 1.1}px`;
    };
    const onScroll = () => { if (!walkRaf) walkRaf = requestAnimationFrame(update); };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Molette verticale = avancer (ordinateur)
    track.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { track.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
    const step = (dir) => {
      const vw = track.clientWidth, mid = track.scrollLeft + vw / 2;
      const target = stations.map((st) => st.offsetLeft + st.offsetWidth / 2)
        .filter((c) => (dir > 0 ? c > mid + 5 : c < mid - 5))
        .sort((a, b) => (dir > 0 ? a - b : b - a))[0];
      if (target !== undefined) track.scrollTo({ left: target - vw / 2, behavior: "smooth" });
    };
    w.querySelector(".walk-arrow.left").onclick = () => step(-1);
    w.querySelector(".walk-arrow.right").onclick = () => step(1);
    const onKey = (e) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const close = () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      w.classList.add("closing");
      setTimeout(() => w.remove(), 300);
    };
    w.querySelector(".walk-close").onclick = close;
    requestAnimationFrame(() => { w.classList.add("in"); update(); track.focus({ preventScroll: true }); });
    setTimeout(() => w.querySelector(".walk-hint").classList.add("fade"), 4500);
  }

  function openRoom() {
    renderRoom();
    show("room");
  }

  function openTrophies() {
    renderTrophies();
    show("trophies");
  }

  function confetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ffd23f", "#ffffff", "#1fa85a", "#3b82f6", "#e0453a"];
    for (let i = 0; i < 80; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = `${Math.random() * 100}vw`;
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = `${2 + Math.random() * 2.5}s`;
      c.style.animationDelay = `${Math.random() * 0.8}s`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5500);
    }
  }

  // ---------- Commentateur ----------
  const COMMENTS = {
    3: ["IL EST CHAUD !", "ÇA COMMENCE À SENTIR BON !", "LE TRIPLÉ !"],
    5: ["IL EST PARTOUT !", "QUEL FESTIVAL !", "MAIS ARRÊTEZ-LE !"],
    7: ["C'EST LE NUMÉRO 7 ! SIUUU !", "INARRÊTABLE !"],
    10: ["ON N'A JAMAIS VU ÇA !", "C'EST HISTORIQUE !", "LE STADE EST DEBOUT !"],
    15: ["IL EST EN FEU ! 🔥🔥🔥", "QUELLE MASTERCLASS !"],
    20: ["C'EST UN EXTRATERRESTRE !", "BALLON D'OR, DIRECT !"],
    fast: ["QUELLE VITESSE !", "PLUS RAPIDE QUE MBAPPÉ !", "DANS LA LUCARNE !", "QUELLE FRAPPE !"],
  };
  function commentate(q) {
    if (state.play === "rush") return;
    let text = COMMENTS[state.streak] ? pick(COMMENTS[state.streak]) : state.streak > 20 && state.streak % 5 === 0 ? pick(COMMENTS[20]) : "";
    if (!text && state.timerOn && Date.now() - state.qStart < 2000 && Math.random() < 0.6) text = pick(COMMENTS.fast);
    if (!text) return;
    document.querySelectorAll(".commentator").forEach((x) => x.remove());
    const el = document.createElement("div");
    el.className = "commentator";
    el.innerHTML = `<span class="cm-mic">🎙️</span><span class="cm-text"></span>`;
    el.lastChild.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2100);
  }

  // ---------- Cartes : Tour d'Europe, Tour de France, Pays mystère, Coupe du monde ----------
  const GEO_COUNT = 10;
  const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  let M = EUROPE_MAP;
  const project = (lat, lon) => [(lon - M.lon0) * Math.PI / 180 * M.k, (mercY(M.lat1) - mercY(lat)) * M.k];
  const unproject = (x, y) => {
    const m = mercY(M.lat1) - y / M.k;
    return [(2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180 / Math.PI, x / M.k * 180 / Math.PI + M.lon0];
  };
  function distKm(lat1, lon1, lat2, lon2) {
    const r = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(a));
  }
  const geo = { list: [], i: 0, score: 0, results: [], guess: null, done: false, view: null, bounds: null, mode: "europe" };
  const geoPoints = (d) => {
    const scale = geo.mode === "france" ? 150 : 450;
    return d <= (geo.mode === "france" ? 8 : 15) ? 1000 : Math.round(1000 * Math.exp(-d / scale));
  };
  const countryMode = () => geo.mode === "pays" || geo.mode === "monde";
  const svgEl = (tag, attrs) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };
  const frName = (n) => COUNTRY_FR[n] || n;

  function buildMap() {
    const svg = $("geo-map");
    svg.style.aspectRatio = `${geo.bounds.w} / ${geo.bounds.h}`;
    svg.innerHTML = `<defs><radialGradient id="geo-sea" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#1f5f8f"/><stop offset="1" stop-color="#0a2c4a"/></radialGradient>
      <pattern id="geo-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/></pattern></defs>
      <rect x="-3000" y="-3000" width="8000" height="8000" fill="url(#geo-sea)"/>
      <rect x="-3000" y="-3000" width="8000" height="8000" fill="url(#geo-grid)"/>
      <g id="geo-countries">${M.countries.map(([n, d]) => `<path class="geo-land" data-c="${n.replace(/"/g, "")}" d="${d}"/>`).join("")}</g>
      <g id="geo-marks"></g>`;
    resetView();
  }
  function resetView() { geo.view = { ...geo.bounds }; applyView(); }
  function applyView() {
    const v = geo.view;
    $("geo-map").setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
    // Les épingles gardent la même taille à l'écran quel que soit le zoom
    $("geo-map").style.setProperty("--z", (v.w / 1000) * 3);
  }
  function clampView() {
    const v = geo.view, B = geo.bounds;
    v.x = Math.min(B.x + B.w - v.w, Math.max(B.x, v.x));
    v.y = Math.min(B.y + B.h - v.h, Math.max(B.y, v.y));
  }
  function zoom(f, cx, cy) {
    const v = geo.view, B = geo.bounds;
    const nw = Math.min(B.w, Math.max(B.w / 8, v.w / f));
    const nh = nw * B.h / B.w;
    cx = cx ?? v.x + v.w / 2;
    cy = cy ?? v.y + v.h / 2;
    v.x = cx - (cx - v.x) * nw / v.w;
    v.y = cy - (cy - v.y) * nh / v.h;
    v.w = nw; v.h = nh;
    clampView();
    applyView();
  }
  function toMap(ev) {
    const svg = $("geo-map");
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function pinSvg(x, y, cls) {
    const g = svgEl("g", { class: `geo-pin ${cls}` });
    g.style.transform = `translate(${x}px, ${y}px) scale(var(--z))`;
    g.innerHTML = `<path d="M0 0 C-4 -9 -11 -13 -11 -21 A11 11 0 1 1 11 -21 C11 -13 4 -9 0 0 Z"/><circle cy="-21" r="4.2" fill="#fff"/>`;
    return g;
  }
  function paintCountries() {
    document.querySelectorAll("#geo-countries path").forEach((p) => p.classList.remove("sel", "ok", "bad"));
    const it = geo.list[geo.i];
    if (!countryMode() || !it) return;
    const mark = (name, cls) => document.querySelectorAll(`#geo-countries path[data-c="${name}"]`).forEach((p) => p.classList.add(cls));
    if (geo.done) {
      it.accept.forEach((n) => mark(n, "ok"));
      if (geo.guess && geo.guess.country && !it.accept.includes(geo.guess.country)) mark(geo.guess.country, "bad");
    } else if (geo.guess && geo.guess.country) mark(geo.guess.country, "sel");
  }
  // Garde l'anneau de la bonne réponse à taille constante pendant le zoom
  function drawMarksSize() {
    const ring = document.querySelector("#geo-marks .geo-ring");
    if (ring) ring.setAttribute("r", 15 * 3 * (geo.view.w / 1000));
  }
  function drawMarks() {
    const g = $("geo-marks");
    g.innerHTML = "";
    paintCountries();
    const it = geo.list[geo.i];
    if (geo.done) {
      const [tx, ty] = project(it.lat, it.lon);
      if (geo.guess && !countryMode()) g.appendChild(svgEl("line", { x1: geo.guess.x, y1: geo.guess.y, x2: tx, y2: ty, class: "geo-line" }));
      g.appendChild(svgEl("circle", { cx: tx, cy: ty, r: 15 * 3 * (geo.view.w / 1000), class: "geo-ring" }));
      const k = svgEl("g", { class: "geo-truth" });
      k.style.transform = `translate(${tx}px, ${ty}px) scale(var(--z))`;
      k.innerHTML = it.kit
        ? `<g transform="translate(-17 -40)">${kitSvg(it.kit, "geo-kitpin").replace("<svg", '<svg width="34" height="34"')}</g><circle r="4" fill="#fff" stroke="#000" stroke-width="1.5"/>`
        : `<text y="-6" text-anchor="middle" font-size="26">🏆</text><circle r="4" fill="#fff" stroke="#000" stroke-width="1.5"/>`;
      g.appendChild(k);
    }
    if (geo.guess && (!countryMode() || !geo.done)) g.appendChild(pinSvg(geo.guess.x, geo.guess.y, "guess"));
  }

  function startGeo() {
    Sounds.unlock();
    geo.mode = geoVar;
    M = geo.mode === "monde" ? WORLD_MAP : EUROPE_MAP;
    const clubItem = (c) => ({ name: c.name, kit: c.kit, lat: c.lat, lon: c.lon, flag: c.flag, city: c.city, accept: [FLAG_COUNTRY[c.flag]] });
    if (geo.mode === "monde") {
      geo.list = shuffle(WORLD_QUESTIONS).slice(0, GEO_COUNT).map(([q, accept, lat, lon, explain]) => ({ q, accept, lat, lon, explain }));
    } else if (geo.mode === "france") {
      geo.list = shuffle(CLUBS.filter((c) => c.flag === "🇫🇷" && c.name !== "AS Monaco")).slice(0, GEO_COUNT).map(clubItem);
    } else if (geo.mode === "pays") {
      // Un seul club par pays, pour varier
      const byCountry = new Map();
      shuffle(CLUBS.filter((c) => c.flag !== "🇲🇨")).forEach((c) => { if (!byCountry.has(c.flag)) byCountry.set(c.flag, c); });
      geo.list = shuffle([...byCountry.values()]).slice(0, GEO_COUNT).map(clubItem);
    } else {
      const fr = shuffle(CLUBS.filter((c) => c.flag === "🇫🇷")).slice(0, 3);
      const rest = shuffle(CLUBS.filter((c) => !fr.includes(c))).slice(0, GEO_COUNT - fr.length);
      geo.list = shuffle([...fr, ...rest]).map(clubItem);
    }
    // Zone visible de la carte
    if (geo.mode === "france") {
      const [x0, y0] = project(51.3, -5.4), [x1, y1] = project(41.2, 9.8);
      const w = x1 - x0, h = y1 - y0;
      geo.bounds = w / h > 1 ? { x: x0, y: y0 - (w - h) / 2, w, h: w } : { x: x0 - (h - w) / 2, y: y0, w: h, h };
    } else geo.bounds = { x: 0, y: 0, w: M.w, h: M.h };
    geo.i = 0; geo.score = 0; geo.results = [];
    state.inGame = true;
    state.coinsEarned = 0;
    state.newTrophies = [];
    document.body.dataset.play = "geo";
    buildMap();
    show("geo");
    Sounds.play("start");
    renderGeo();
  }
  function renderGeo() {
    const it = geo.list[geo.i];
    geo.guess = null; geo.done = false;
    $("geo-num").textContent = `${geo.i + 1}/${geo.list.length}`;
    document.querySelector("#screen-geo .sb-label").textContent = it.kit ? "Club" : "Question";
    $("geo-score").textContent = geo.score;
    $("geo-last").textContent = geo.i ? $("geo-last").textContent : "–";
    const ask = document.querySelector(".geo-ask small");
    if (it.kit) {
      ask.textContent = geo.mode === "pays" ? "Dans quel pays joue…" : "Où joue…";
      $("geo-club").textContent = it.name;
      $("geo-kit").innerHTML = kitSvg(it.kit, "kit");
    } else {
      ask.textContent = "Coupe du monde";
      $("geo-club").textContent = it.q;
      $("geo-kit").innerHTML = '<span class="geo-globe">🌍</span>';
    }
    $("geo-club").classList.toggle("long", !it.kit);
    $("geo-tip").textContent = countryMode() ? "Touche le bon pays 👆 · 2 doigts pour zoomer" : "Touche pour placer l'épingle 📍 · 2 doigts pour zoomer";
    $("geo-ok").disabled = true;
    $("geo-ok").classList.remove("hidden");
    $("geo-next").classList.add("hidden");
    $("geo-result").classList.add("hidden");
    $("geo-tip").classList.remove("hidden");
    resetView();
    drawMarks();
  }
  function validateGeo() {
    if (!geo.guess || geo.done) return;
    const it = geo.list[geo.i];
    const [lat, lon] = unproject(geo.guess.x, geo.guess.y);
    const d = distKm(lat, lon, it.lat, it.lon);
    let pts, good;
    if (countryMode()) {
      // Bon pays, ou tout près pour les tout petits pays (Qatar…)
      good = it.accept.includes(geo.guess.country) || (geo.mode === "monde" && d < 300);
      pts = good ? 1000 : 0;
    } else {
      pts = geoPoints(d);
      good = pts >= 500;
      if (d < 25) stats.geoBullseye++;
    }
    geo.score += pts;
    geo.done = true;
    geo.results.push({ it, d, pts, good });
    saveStats();
    state.newTrophies.push(...checkTrophies());
    // On recadre la carte pour voir l'épingle et la bonne réponse
    const [tx, ty] = project(it.lat, it.lon);
    const B = geo.bounds;
    const minX = Math.min(tx, geo.guess.x), maxX = Math.max(tx, geo.guess.x);
    const minY = Math.min(ty, geo.guess.y), maxY = Math.max(ty, geo.guess.y);
    const span = Math.max((maxX - minX) * 1.6, (maxY - minY) * 1.6 * B.w / B.h, B.w / (geo.mode === "monde" ? 3 : 5));
    geo.view.w = Math.min(B.w, span); geo.view.h = geo.view.w * B.h / B.w;
    geo.view.x = (minX + maxX) / 2 - geo.view.w / 2;
    geo.view.y = (minY + maxY) / 2 - geo.view.h / 2;
    clampView();
    applyView();
    drawMarks();
    $("geo-score").textContent = geo.score;
    $("geo-last").textContent = `+${pts}`;
    const res = $("geo-result");
    let verdict, detail;
    if (countryMode()) {
      verdict = good ? pick(["🎯 Bien vu !", "✅ C'est ça !", "🌍 Bravo !"]) : "❌ Raté !";
      const answer = it.accept.map(frName).join(", ");
      detail = it.kit
        ? `${it.name} joue à ${it.city}, ${it.flag} ${answer}.${good ? "" : ` Tu as touché : ${geo.guess.country ? frName(geo.guess.country) : "la mer 🌊"}.`}`
        : `${it.explain}${good ? "" : ` Tu as touché : ${geo.guess.country ? frName(geo.guess.country) : "la mer 🌊"}.`}`;
    } else {
      verdict = d < 25 ? "🎯 Pile poil !" : d < 100 ? "🔥 Tout près !" : d < 300 ? "👍 Pas mal !" : d < 800 ? "😬 Un peu loin…" : "🌍 Gros raté !";
      detail = `${it.name} joue à ${it.city} ${it.flag}. Ton épingle était à ${d < 10 ? d.toFixed(1) : Math.round(d)} km.`;
    }
    res.className = `geo-result ${good ? "good" : "bad"}`;
    res.innerHTML = `<strong></strong><span></span>`;
    res.firstChild.textContent = `${verdict} +${pts} pts`;
    res.lastChild.textContent = detail;
    Sounds.play(good ? "correct" : "wrong");
    $("geo-tip").classList.add("hidden");
    $("geo-ok").classList.add("hidden");
    const next = $("geo-next");
    next.textContent = geo.i === geo.list.length - 1 ? "Voir le résultat →" : "Suivant →";
    next.classList.remove("hidden");
  }
  function finishGeo() {
    const sc = geo.score;
    const max = geo.list.length * 1000;
    const nGood = geo.results.filter((r) => r.good).length;
    stats.games++;
    if (geo.mode === "europe" || geo.mode === "france") stats.geoBest = Math.max(stats.geoBest, sc);
    if (geo.mode === "pays" && nGood === geo.list.length) stats.geoCountryPerfect++;
    if (geo.mode === "monde") stats.worldBest = Math.max(stats.worldBest, sc);
    addCoins(Math.round(sc / 250));
    saveStats();
    state.newTrophies.push(...checkTrophies());
    const key = `fqf-best-geo${geo.mode === "europe" ? "" : "-" + geo.mode}`;
    const prev = Number(storage.get(key) || 0);
    if (sc > prev) storage.set(key, String(sc));
    const label = { europe: "Tour d'Europe", france: "Tour de France", pays: "Pays mystère", monde: "Coupe du monde" }[geo.mode];
    $("end-emoji").textContent = sc >= 8500 ? "🛰️" : sc >= 6000 ? "🧭" : sc >= 3500 ? "🗺️" : "🧳";
    $("end-title").textContent = `${label} : ${sc >= 8500 ? "GPS humain !" : sc >= 6000 ? "Globe-trotter !" : sc >= 3500 ? "Bon voyage !" : "Perdu en route…"}`;
    $("end-score").textContent = `${sc.toLocaleString("fr-FR")} pts`;
    $("end-msg").textContent = `sur ${max.toLocaleString("fr-FR")} possibles.`;
    const r = document.createElement("span");
    r.className = "end-record";
    r.textContent = sc > prev ? (prev ? `🎉 Nouveau record ! (ancien : ${prev.toLocaleString("fr-FR")})` : "🎉 Premier record !") : `🏅 Ton record : ${prev.toLocaleString("fr-FR")} pts`;
    $("end-msg").appendChild(r);
    const box = $("party-rank");
    box.innerHTML = "";
    geo.results.forEach((x) => {
      const row = document.createElement("div");
      row.className = `pr-row geo-row${x.pts >= 900 ? " win" : ""}`;
      row.innerHTML = `<span class="pr-pos">${x.it.kit ? kitSvg(x.it.kit, "kit") : "🌍"}</span><span class="pr-name"></span><span class="pr-best"></span><b class="pr-score"></b>`;
      row.querySelector(".pr-name").textContent = x.it.kit ? x.it.name : x.it.accept.map(frName).join(", ");
      row.querySelector(".pr-best").textContent = countryMode() ? (x.good ? "✅" : "❌") : `${Math.round(x.d)} km`;
      row.querySelector(".pr-score").textContent = x.pts;
      box.appendChild(row);
    });
    box.classList.remove("hidden");
    if (countryMode()) {
      $("end-stats").innerHTML = `<div class="stat"><b>${nGood} / ${geo.list.length}</b><span>Bonnes réponses</span></div>
        <div class="stat"><b>+${state.coinsEarned} 🪙</b><span>Pièces gagnées</span></div>`;
    } else {
      const avg = Math.round(geo.results.reduce((n, x) => n + x.d, 0) / geo.results.length);
      const best = geo.results.reduce((a, x) => (x.d < a.d ? x : a));
      $("end-stats").innerHTML = `<div class="stat"><b>${avg} km</b><span>Écart moyen</span></div>
        <div class="stat"><b>${Math.round(best.d)} km</b><span>Meilleur</span></div>
        <div class="stat"><b>+${state.coinsEarned} 🪙</b><span>Pièces gagnées</span></div>`;
    }
    state.inGame = false;
    renderNewTrophies(state.newTrophies);
    $("review-wrap").classList.add("hidden");
    renderWallet();
    show("end");
    Sounds.play("end", sc >= 5000 || state.newTrophies.length > 0);
    if (sc >= 6000) confetti();
  }

  // Toucher / glisser sur la carte
  (() => {
    const svg = $("geo-map");
    // Gestes tactiles : 1 doigt = déplacer, 2 doigts = zoomer, toucher sans bouger = placer l'épingle
    const pts = new Map();
    let gesture = null;
    const unitsPerPx = () => geo.view.w / svg.getBoundingClientRect().width;
    function startGesture() {
      const list = [...pts.values()];
      if (list.length === 1) {
        gesture = { type: "pan", x: list[0].x, y: list[0].y, vx: geo.view.x, vy: geo.view.y, moved: gesture ? gesture.moved : false };
      } else if (list.length >= 2) {
        const [a, b] = list;
        const mid = { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 };
        gesture = { type: "pinch", dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, view: { ...geo.view }, anchor: toMap(mid), mid, moved: true };
      }
    }
    svg.addEventListener("pointerdown", (e) => {
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      startGesture();
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId) || !gesture) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const B = geo.bounds;
      if (gesture.type === "pan") {
        const p = pts.get(e.pointerId);
        const dx = p.x - gesture.x, dy = p.y - gesture.y;
        if (!gesture.moved && Math.hypot(dx, dy) < 8) return;
        gesture.moved = true;
        const k = unitsPerPx();
        geo.view.x = gesture.vx - dx * k;
        geo.view.y = gesture.vy - dy * k;
      } else {
        const [a, b] = [...pts.values()];
        const f = Math.hypot(a.x - b.x, a.y - b.y) / gesture.dist;
        const v0 = gesture.view;
        const nw = Math.min(B.w, Math.max(B.w / 12, v0.w / f));
        const nh = nw * B.h / B.w;
        // Le point sous les doigts reste sous les doigts
        const rect = svg.getBoundingClientRect();
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const rx = (mx - rect.left) / rect.width, ry = (my - rect.top) / rect.height;
        geo.view.w = nw; geo.view.h = nh;
        geo.view.x = gesture.anchor.x - rx * nw;
        geo.view.y = gesture.anchor.y - ry * nh;
      }
      clampView();
      applyView();
      drawMarksSize();
    });
    function endPointer(e, cancel) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      const g = gesture;
      if (pts.size) { gesture = { moved: true }; startGesture(); gesture.moved = true; return; }
      gesture = null;
      if (cancel || !g || g.moved || geo.done) return;
      // Simple toucher : on place l'épingle
      const p = toMap(e);
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find((el) => el.dataset && el.dataset.c);
      geo.guess = { x: p.x, y: p.y, country: hit ? hit.dataset.c : null };
      $("geo-ok").disabled = false;
      $("geo-tip").classList.add("hidden");
      Sounds.play("click");
      drawMarks();
    }
    svg.addEventListener("pointerup", (e) => endPointer(e, false));
    svg.addEventListener("pointercancel", (e) => endPointer(e, true));
    // Empêche le zoom de la page entière sur iPhone pendant le pincement
    ["gesturestart", "gesturechange"].forEach((t) => svg.addEventListener(t, (e) => e.preventDefault()));
    svg.addEventListener("wheel", (e) => { e.preventDefault(); const p = toMap(e); zoom(e.deltaY < 0 ? 1.4 : 1 / 1.4, p.x, p.y); }, { passive: false });
    $("geo-zin").onclick = () => zoom(1.8, geo.guess && geo.guess.x, geo.guess && geo.guess.y);
    $("geo-zout").onclick = () => zoom(1 / 1.8);
    $("geo-ok").onclick = validateGeo;
    $("geo-next").onclick = () => {
      if (geo.i < geo.list.length - 1) { geo.i++; renderGeo(); } else finishGeo();
    };
    let geoQuit = null;
    $("geo-quit").onclick = () => {
      const b = $("geo-quit");
      if (!geoQuit) {
        b.textContent = "Sûr ? Appuie encore";
        b.classList.add("armed");
        geoQuit = setTimeout(() => { geoQuit = null; b.textContent = "✕ Abandonner"; b.classList.remove("armed"); }, 3000);
        return;
      }
      clearTimeout(geoQuit); geoQuit = null;
      b.textContent = "✕ Abandonner"; b.classList.remove("armed");
      state.inGame = false;
      renderBest();
      show("home");
    };
  })();

  // ---------- Duel : deux joueurs face à face ----------
  const duel = { list: [], i: 0, s: [0, 0], locked: [false, false], done: false, names: ["Joueur 1", "Joueur 2"], timer: null };
  function startDuel() {
    Sounds.unlock();
    const pool = currentPool().filter((q) => !q.multi);
    if (!pool.length) return;
    const n = Math.min(Number(state.count) || 10, 20, pool.length);
    duel.list = pickFromPool(pool, n);
    duel.names = [0, 1].map((i) => ((partyNames[i] || "").trim() || `Joueur ${i + 1}`));
    duel.i = 0; duel.s = [0, 0];
    state.inGame = true;
    state.coinsEarned = 0;
    state.newTrophies = [];
    document.body.dataset.play = "duel";
    show("duel");
    Sounds.play("start");
    renderDuel();
  }
  const duelSide = (pi) => $(pi === 0 ? "duel-p1" : "duel-p2");
  function renderDuel() {
    const q = duel.list[duel.i];
    duel.locked = [false, false];
    duel.done = false;
    $("duel-num").textContent = `${duel.i + 1}/${duel.list.length}`;
    [0, 1].forEach((pi) => {
      const side = duelSide(pi);
      side.querySelector(".duel-name").textContent = duel.names[pi];
      side.querySelector(".duel-score").textContent = duel.s[pi];
      side.querySelector(".duel-q").textContent = q.q;
      side.classList.remove("locked", "won");
      const wrap = side.querySelector(".duel-answers");
      wrap.innerHTML = "";
      q.shuffled.forEach((ans, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "answer duel-ans";
        b.innerHTML = `<span class="letter">${LETTERS[i]}</span><span></span>`;
        b.lastChild.textContent = ans;
        b.dataset.answer = ans;
        b.addEventListener("pointerdown", (e) => { e.preventDefault(); duelTap(pi, ans, b); });
        wrap.appendChild(b);
      });
    });
  }
  function duelTap(pi, ans, btn) {
    if (duel.done || duel.locked[pi]) return;
    const q = duel.list[duel.i];
    if (q.correct.includes(ans)) {
      duel.s[pi]++;
      duel.done = true;
      duelSide(pi).classList.add("won");
      Sounds.play("correct");
      revealDuel();
    } else {
      duel.locked[pi] = true;
      btn.classList.add("wrong");
      duelSide(pi).classList.add("locked");
      Sounds.play("wrong");
      if (duel.locked[0] && duel.locked[1]) { duel.done = true; revealDuel(); }
    }
  }
  function revealDuel() {
    const q = duel.list[duel.i];
    [0, 1].forEach((pi) => {
      duelSide(pi).querySelector(".duel-score").textContent = duel.s[pi];
      duelSide(pi).querySelectorAll(".duel-ans").forEach((b) => {
        b.disabled = true;
        if (q.correct.includes(b.dataset.answer)) b.classList.add("correct");
        else if (!b.classList.contains("wrong")) b.classList.add("dim");
      });
    });
    clearTimeout(duel.timer);
    duel.timer = setTimeout(() => {
      if (!state.inGame || state.play !== "duel") return;
      if (duel.i < duel.list.length - 1) { duel.i++; renderDuel(); } else finishDuel();
    }, 1700);
  }
  function finishDuel() {
    clearTimeout(duel.timer);
    stats.duelGames++;
    saveStats();
    state.newTrophies.push(...checkTrophies());
    const [a, b] = duel.s;
    $("end-emoji").textContent = a === b ? "🤝" : "🤺";
    $("end-title").textContent = a === b ? "Égalité parfaite !" : `${duel.names[a > b ? 0 : 1]} remporte le duel !`;
    $("end-score").textContent = `${a} – ${b}`;
    $("end-msg").textContent = a === b ? "Il va falloir une revanche…" : "Touché, coulé. Revanche ?";
    const box = $("party-rank");
    box.innerHTML = "";
    [0, 1].sort((x, y) => duel.s[y] - duel.s[x]).forEach((pi, i) => {
      const row = document.createElement("div");
      row.className = `pr-row${duel.s[pi] === Math.max(a, b) ? " win" : ""}`;
      row.innerHTML = `<span class="pr-pos">${duel.s[pi] === Math.max(a, b) ? "🥇" : "🥈"}</span><span class="pr-name"></span><span class="pr-best"></span><b class="pr-score"></b>`;
      row.querySelector(".pr-name").textContent = duel.names[pi];
      row.querySelector(".pr-score").textContent = duel.s[pi];
      box.appendChild(row);
    });
    box.classList.remove("hidden");
    $("end-stats").innerHTML = `<div class="stat"><b>${duel.list.length}</b><span>Questions</span></div>`;
    state.inGame = false;
    renderNewTrophies(state.newTrophies);
    $("review-wrap").classList.add("hidden");
    show("end");
    Sounds.play("end", true);
    confetti();
  }
  let duelQuit = null;
  $("duel-quit").onclick = () => {
    const b = $("duel-quit");
    if (!duelQuit) {
      b.textContent = "Sûr ?";
      b.classList.add("armed");
      duelQuit = setTimeout(() => { duelQuit = null; b.textContent = "✕"; b.classList.remove("armed"); }, 3000);
      return;
    }
    clearTimeout(duelQuit); duelQuit = null;
    b.textContent = "✕"; b.classList.remove("armed");
    clearTimeout(duel.timer);
    state.inGame = false;
    renderBest();
    show("home");
  };

  // ---------- Ligue entre potes ----------
  const LEAGUE_DAYS = 10;
  let league = readJSON("fqf-league", { season: 1, day: 0, table: {}, champions: [] });
  const saveLeague = () => storage.set("fqf-league", JSON.stringify(league));
  const leagueOn = () => storage.get("fqf-league-on") === "1";
  const leagueRows = () => Object.entries(league.table).map(([name, r]) => ({ name, ...r }))
    .sort((x, y) => y.pts - x.pts || y.bp - x.bp || x.name.localeCompare(y.name));
  function leagueTableHtml(rows) {
    if (!rows.length) return `<p class="league-empty">Aucun match joué pour l'instant.</p>`;
    return `<table class="league-table"><thead><tr><th>#</th><th>Joueur</th><th>J</th><th>Buts</th><th>Pts</th></tr></thead><tbody>${rows.map((r, i) =>
      `<tr${i === 0 ? ' class="lead"' : ""}><td>${i + 1}</td><td>${r.name.replace(/</g, "")}</td><td>${r.j}</td><td>${r.bp}</td><td><b>${r.pts}</b></td></tr>`).join("")}</tbody></table>`;
  }
  function renderLeague() {
    $("league-on").checked = leagueOn();
    const box = $("league-box");
    box.classList.toggle("hidden", !leagueOn());
    if (!leagueOn()) return;
    const last = league.champions[league.champions.length - 1];
    box.innerHTML = `<div class="league-head"><b>Saison ${league.season}</b><span>Journée ${league.day} / ${LEAGUE_DAYS}</span></div>
      ${leagueTableHtml(leagueRows())}
      <p class="league-rules">1er de la soirée : 3 pts · 2e : 1 pt. Les bonnes réponses comptent comme des buts.</p>
      ${last ? `<p class="league-champ">👑 Dernier champion : <b></b> (saison ${last.season})</p>` : ""}
      <button class="btn ghost league-reset" type="button">Recommencer la saison</button>`;
    if (last) box.querySelector(".league-champ b").textContent = last.name;
    const rb = box.querySelector(".league-reset");
    rb.onclick = () => {
      if (!rb.classList.contains("armed")) { rb.classList.add("armed"); rb.textContent = "Sûr ? Appuie encore"; return; }
      league.day = 0; league.table = {}; saveLeague(); renderLeague();
    };
  }
  $("league-on").onchange = () => { storage.set("fqf-league-on", $("league-on").checked ? "1" : "0"); renderLeague(); };
  // Enregistre une soirée dans la ligue, renvoie le texte à afficher
  function recordLeague(players) {
    if (!leagueOn()) return null;
    const scores = [...new Set(players.map((p) => p.score))].sort((a, b) => b - a);
    players.forEach((p) => {
      const r = league.table[p.name] || { pts: 0, j: 0, bp: 0 };
      r.j++;
      r.bp += p.score;
      r.pts += p.score === scores[0] ? 3 : p.score === scores[1] ? 1 : 0;
      league.table[p.name] = r;
    });
    league.day++;
    let champion = null;
    const rows = leagueRows();
    if (league.day >= LEAGUE_DAYS) {
      champion = rows[0];
      league.champions.push({ season: league.season, name: champion.name });
      stats.leagueSeasons++;
      league.season++;
      league.day = 0;
      league.table = {};
    }
    saveLeague();
    return { rows, champion, day: champion ? LEAGUE_DAYS : league.day };
  }

  // ---------- Mon maillot (avatar) ----------
  const PALETTE = ["#f7f7f5", "#151515", "#d71920", "#14213d", "#1f4fb4", "#74b6e6", "#118a3e", "#ffd200", "#f47a1f", "#5b2b86", "#7a1f3d", "#ff7ac8", "#00b3a4", "#8d99ae"];
  const BASE_PATTERNS = [["plain", "Uni"], ["stripes", "Rayures"], ["hoops", "Cerceaux"], ["halves", "Moitiés"], ["band", "Bande"], ["sash", "Écharpe"], ["diag", "Diagonale"], ["chevron", "Chevron"], ["chest", "Poitrine"]];
  const COLLECTOR = [
    { id: "stars", name: "Étoiles", icon: "⭐", price: 120, desc: "Un maillot constellé d'étoiles." },
    { id: "confetti", name: "Confettis La Fête", icon: "🎉", price: 150, desc: "Le maillot officiel de la fête." },
    { id: "rainbow", name: "Arc-en-ciel", icon: "🌈", price: 200, desc: "Toutes les couleurs à la fois." },
    { id: "gold", name: "Or massif", icon: "🥇", price: 400, desc: "Réservé aux légendes." },
  ];
  let ownedKits = new Set();
  try { ownedKits = new Set(JSON.parse(storage.get("fqf-kits-owned") || "[]")); } catch { ownedKits = new Set(); }
  const saveOwned = () => storage.set("fqf-kits-owned", JSON.stringify([...ownedKits]));
  let avatar = readJSON("fqf-avatar", { b: "#d71920", p: "plain", c: "#f7f7f5", s: "", n: "10", name: "" });
  const saveAvatar = () => storage.set("fqf-avatar", JSON.stringify(avatar));
  const avatarKit = () => ({ b: avatar.b, p: avatar.p, c: avatar.c, s: avatar.s || undefined, t: avatar.c === avatar.b ? "#fff" : avatar.c,
    n: avatar.n, nc: avatar.p === "gold" ? "#151515" : avatar.c === avatar.b ? "#fff" : avatar.c });
  function renderAvatarHome() {
    $("avatar-kit").innerHTML = kitSvg(avatarKit(), "kit");
    $("avatar-name").textContent = avatar.name || "Mon maillot";
  }
  function avatarChanged() {
    saveAvatar();
    if (!stats.avatarMade) { stats.avatarMade = 1; saveStats(); const fresh = checkTrophies(); if (fresh.length) toast(`🏆 Trophée « ${fresh[0].name} » (+${TROPHY_REWARD[fresh[0].tier]} 🪙)`); }
    renderAvatarEditor();
    renderAvatarHome();
  }
  function swatches(id, key, allowNone) {
    const wrap = $(id);
    wrap.innerHTML = "";
    (allowNone ? ["", ...PALETTE] : PALETTE).forEach((col) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "swatch" + ((avatar[key] || "") === col ? " on" : "") + (col ? "" : " none");
      b.style.background = col || "transparent";
      b.title = col ? col : "Comme le maillot";
      b.textContent = col ? "" : "=";
      b.onclick = () => { avatar[key] = col; avatarChanged(); };
      wrap.appendChild(b);
    });
  }
  function renderAvatarEditor() {
    $("av-preview").innerHTML = kitSvg(avatarKit(), "kit av-big") + `<div class="av-label"></div>`;
    $("av-preview").lastChild.textContent = avatar.name || "Ton pseudo";
    const pw = $("av-patterns");
    pw.innerHTML = "";
    [...BASE_PATTERNS, ...COLLECTOR.map((c) => [c.id, `${c.icon} ${c.name}`, c])].forEach(([id, label, col]) => {
      const locked = col && !ownedKits.has(id);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "av-pat" + (avatar.p === id ? " on" : "") + (locked ? " locked" : "");
      b.innerHTML = kitSvg({ b: avatar.b, p: id, c: avatar.c }, "kit") + `<span></span>`;
      b.lastChild.textContent = locked ? `🔒 ${col.price} 🪙` : label;
      b.onclick = () => { if (locked) { openShop(); return; } avatar.p = id; avatarChanged(); };
      pw.appendChild(b);
    });
    swatches("av-c1", "b");
    swatches("av-c2", "c");
    swatches("av-c3", "s", true);
  }
  function openAvatar() {
    Sounds.unlock();
    $("av-pseudo").value = avatar.name || "";
    $("av-num").value = avatar.n || "";
    renderAvatarEditor();
    show("avatar");
  }
  $("av-pseudo").oninput = () => { avatar.name = $("av-pseudo").value.slice(0, 14); avatarChanged(); };
  $("av-num").oninput = () => { const v = $("av-num").value.replace(/\D/g, "").slice(0, 2); $("av-num").value = v; avatar.n = v; avatarChanged(); };
  $("avatar-btn").onclick = openAvatar;
  $("av-back").onclick = () => { renderBest(); show("home"); };
  function toast(text) {
    document.querySelectorAll(".shop-toast").forEach((x) => x.remove());
    const t = document.createElement("div");
    t.className = "shop-toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }


  // ---------- Boutique ----------
  const SHOP_PACK = { id: "pack", icon: "🎁", name: "Pack trio", desc: "Un exemplaire de chaque joker, à prix réduit.", price: 75 };
  function renderShop() {
    renderWallet();
    const wrap = $("shop-items");
    wrap.innerHTML = "";
    [...JOKERS, SHOP_PACK].forEach((it) => {
      const card = document.createElement("div");
      card.className = `shop-item${it.id === "pack" ? " pack" : ""}`;
      const owned = it.id === "pack" ? "" : `<span class="si-own">Tu en as <b>${jokers[it.id] || 0}</b></span>`;
      card.innerHTML = `<div class="si-ico">${it.icon}</div>
        <div class="si-body"><b class="si-name">${it.name}</b><span class="si-desc">${it.desc}</span>${owned}</div>
        <button class="btn primary si-buy" type="button">🪙 ${it.price}</button>`;
      const btn = card.querySelector(".si-buy");
      btn.disabled = coins < it.price;
      btn.onclick = () => buy(it, card);
      wrap.appendChild(card);
    });
    const kw = $("shop-kits");
    kw.innerHTML = "";
    COLLECTOR.forEach((it) => {
      const own = ownedKits.has(it.id);
      const card = document.createElement("div");
      card.className = "shop-item kit-item" + (own ? " owned" : "");
      card.innerHTML = `<div class="si-ico">${kitSvg({ b: "#14213d", p: it.id, c: "#ffd200" }, "kit")}</div>
        <div class="si-body"><b class="si-name">${it.icon} ${it.name}</b><span class="si-desc">${it.desc}</span>${own ? '<span class="si-own">✅ Débloqué</span>' : ""}</div>
        <button class="btn primary si-buy" type="button">${own ? "Porter" : `🪙 ${it.price}`}</button>`;
      const btn = card.querySelector(".si-buy");
      btn.disabled = !own && coins < it.price;
      btn.onclick = () => {
        if (own) { avatar.p = it.id; avatarChanged(); openAvatar(); return; }
        if (coins < it.price) return;
        coins -= it.price;
        storage.set("fqf-coins", String(coins));
        ownedKits.add(it.id);
        saveOwned();
        stats.kitsBought++;
        saveStats();
        Sounds.play("legend");
        const fresh = checkTrophies();
        renderShop();
        toast(fresh.length ? `✅ ${it.name} débloqué ! 🏆 « ${fresh[0].name} »` : `✅ ${it.name} débloqué ! Va l'enfiler dans « Mon maillot »`);
      };
      kw.appendChild(card);
    });
  }
  function buy(it, card) {
    if (coins < it.price) return;
    coins -= it.price;
    storage.set("fqf-coins", String(coins));
    if (it.id === "pack") JOKERS.forEach((j) => { jokers[j.id] = (jokers[j.id] || 0) + 1; });
    else jokers[it.id] = (jokers[it.id] || 0) + 1;
    saveJokers();
    stats.purchases++;
    saveStats();
    Sounds.play("correct");
    const fresh = checkTrophies();
    renderShop();
    document.querySelectorAll(".shop-toast").forEach((x) => x.remove());
    const toast = document.createElement("div");
    toast.className = "shop-toast";
    toast.textContent = fresh.length ? `✅ Acheté ! 🏆 Trophée « ${fresh[0].name} » (+${TROPHY_REWARD[fresh[0].tier]} 🪙)` : `✅ ${it.name} ajouté${it.id === "pack" ? "s" : ""} !`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }
  function openShop() { Sounds.unlock(); renderShop(); show("shop"); }
  $("shop-btn").onclick = openShop;
  $("shop-back").onclick = () => { renderBest(); show("home"); };

  // ---------- Événements ----------
  $("start-btn").onclick = start;
  $("next-btn").onclick = nextQuestion;
  $("validate-btn").onclick = () => {
    const q = state.list[state.index];
    if (q.order) { if (state.orderSel.length === q.answers.length) answer(state.orderSel.slice()); return; }
    if (state.selected.size) answer([...state.selected]);
  };
  $("replay-btn").onclick = start;
  $("home-btn").onclick = () => { renderBest(); show("home"); };
  $("trophies-btn").onclick = openTrophies;
  $("end-trophies-btn").onclick = openTrophies;
  $("tr-back").onclick = () => { renderBest(); show("home"); };
  $("room-back").onclick = openTrophies;
  $("walk-btn").onclick = openWalk;

  // Double appui pour abandonner (les boîtes confirm() ne marchent pas partout)
  let quitArmed = null;
  $("quit-btn").onclick = () => {
    const b = $("quit-btn");
    if (!quitArmed) {
      b.textContent = "Sûr ? Appuie encore";
      b.classList.add("armed");
      quitArmed = setTimeout(() => { quitArmed = null; b.textContent = "✕ Abandonner"; b.classList.remove("armed"); }, 3000);
      return;
    }
    clearTimeout(quitArmed);
    quitArmed = null;
    b.textContent = "✕ Abandonner";
    b.classList.remove("armed");
    clearInterval(state.tick);
    clearInterval(state.rushTick);
    clearTimeout(state.autoNext);
    state.inGame = false;
    document.querySelectorAll(".turn-overlay").forEach((o) => o.remove());
    document.body.classList.remove("turn-wait");
    renderBest();
    show("home");
  };

  document.addEventListener("keydown", (e) => {
    if (!$("screen-quiz").classList.contains("active")) return;
    if (e.target && e.target.tagName === "INPUT") return;
    const q = state.list[state.index];
    const k = e.key.toUpperCase();
    let idx = LETTERS.indexOf(k);
    if (idx === -1) idx = ["1", "2", "3", "4", "5", "6"].indexOf(k);
    if (document.querySelector(".turn-overlay")) return;
    if (!state.answered && idx !== -1 && idx < q.shuffled.length && !document.querySelectorAll(".answer")[idx].disabled) {
      if (q.order) toggleOrder(q.shuffled[idx]);
      else if (q.multi) toggleChoice(q.shuffled[idx], document.querySelectorAll(".answer")[idx]);
      else answer([q.shuffled[idx]]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state.answered) nextQuestion();
      else $("validate-btn").click();
    }
  });

  // ---------- Mise à jour automatique ----------
  // À l'ouverture, on compare la version de l'app avec celle publiée en ligne.
  const APP_VERSION = "6.0";
  function checkForUpdate() {
    if (!location.protocol.startsWith("http")) return;
    fetch(`version.json?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !data.version || data.version === APP_VERSION) return;
        if (document.querySelector(".update-bar")) return;
        const bar = document.createElement("div");
        bar.className = "update-bar";
        bar.innerHTML = `<span>🎉 Nouvelle version disponible !</span><button class="btn primary" type="button">Mettre à jour</button>`;
        bar.querySelector("button").onclick = async () => {
          try {
            if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
            const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
            for (const r of regs) await r.update();
          } catch { /* on recharge quand même */ }
          location.replace(`${location.pathname}?v=${data.version}`);
        };
        document.body.appendChild(bar);
      })
      .catch(() => { /* hors ligne : rien à faire */ });
  }
  checkForUpdate();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkForUpdate(); });

  // Écran d'ouverture
  $("w-count").textContent = GENERAL_TOTAL();
  $("enter-btn").onclick = () => {
    Sounds.unlock();
    Sounds.play("start");
    show("home");
  };

  renderFilters();
  renderBest();
  renderWallet();
  renderAvatarHome();
  setPlay(["classic", "sudden", "rush", "daily", "kits", "geo", "party", "review", "boss", "derby", "whoami", "career", "names", "hilo", "duel"].includes(storage.get("fqf-play")) ? storage.get("fqf-play") : "classic");
})();
