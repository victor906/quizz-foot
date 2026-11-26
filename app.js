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
  };
  let stats = { ...STAT_DEFAULTS };
  try { stats = { ...STAT_DEFAULTS, ...JSON.parse(storage.get(STATS_KEY) || "{}") }; } catch { /* valeurs par défaut */ }
  let unlocked = {};
  try { unlocked = JSON.parse(storage.get(TROPHY_KEY) || "{}"); } catch { unlocked = {}; }
  let everSeen = new Set();
  try { everSeen = new Set(JSON.parse(storage.get(EVER_KEY) || "[]")); } catch { everSeen = new Set(); }
  const saveStats = () => storage.set(STATS_KEY, JSON.stringify(stats));
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
    $("start-btn").disabled = pool.length === 0;
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


  const bestKey = () => (state.theme === "cr7" ? "fqf-best-cr7" : "fqf-best");

  function renderBest() {
    const best = storage.get(bestKey());
    $("best-score").textContent = best ? `🏅 Ton meilleur score : ${best}` : "";
    const got = TROPHIES.filter((t) => unlocked[t.id]).length;
    $("trophies-btn").innerHTML = `🏆 Mes trophées <span>${got} / ${TROPHIES.length}</span>`;
    updateSummaries();
    renderFresh();
  }

  // ---------- Partie ----------
  function start() {
    Sounds.unlock();

    const pool = currentPool();
    if (!pool.length) return;
    const n = state.count === "all" ? pool.length : Math.min(Number(state.count), pool.length);

    // Priorité aux questions jamais vues
    const fresh = shuffle(pool.filter((q) => !seen.has(q.key)));
    let chosen = fresh.slice(0, n);
    if (chosen.length < n) {
      // Toutes les questions de la sélection ont été vues : on recommence un cycle
      const already = new Set(chosen.map((q) => q.key));
      pool.forEach((q) => seen.delete(q.key));
      const rest = shuffle(pool.filter((q) => !already.has(q.key)));
      chosen = chosen.concat(rest.slice(0, n - chosen.length));
    }

    state.list = chosen.map((q) => ({ ...q, shuffled: shuffle(q.answers) }));

    // Question bonus : apparaît souvent (environ une partie sur deux), à une place au hasard.
    // Jamais en mode Superfan CR7.
    if (state.theme !== "cr7" && Math.random() < BONUS_CHANCE) {
      const pos = Math.floor(Math.random() * (state.list.length + 1));
      state.list.splice(pos, 0, { ...BONUS_QUESTION, shuffled: shuffle(BONUS_QUESTION.answers) });
    }
    state.index = 0;
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.mistakes = [];
    state.newTrophies = [];
    state.isAll = state.count === "all";
    show("quiz");
    Sounds.play("start");
    renderQuestion();
  }

  function renderQuestion() {
    const q = state.list[state.index];
    const total = state.list.length;
    state.answered = false;
    state.selected = new Set();

    if (!q.bonus) {
      seen.add(q.key);
      saveSeen();
      everSeen.add(q.key);
      saveEver();
    }
    state.qStart = Date.now();

    $("q-num").textContent = `${state.index + 1}/${total}`;
    $("q-score").textContent = state.score;
    $("q-streak").textContent = `${state.streak} 🔥`;
    $("progress-bar").style.width = `${(state.index / total) * 100}%`;
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
    $("feedback").className = "feedback hidden";
    $("next-btn").classList.add("hidden");
    $("validate-btn").classList.toggle("hidden", !q.multi);
    $("validate-btn").disabled = true;

    const wrap = $("answers");
    wrap.innerHTML = "";
    wrap.classList.toggle("is-multi", q.multi);
    q.shuffled.forEach((ans, i) => {
      const b = document.createElement("button");
      b.className = "answer";
      b.innerHTML = `<span class="letter">${q.multi ? "" : LETTERS[i]}</span><span></span>`;
      if (q.multi) b.firstChild.setAttribute("data-l", LETTERS[i]);
      b.lastChild.textContent = ans;
      b.dataset.answer = ans;
      b.onclick = () => (q.multi ? toggleChoice(ans, b) : answer([ans]));
      wrap.appendChild(b);
    });

    startTimer(q.multi ? TIME_MULTI : TIME_SINGLE);
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
    if (!state.timer) { t.classList.add("off"); return; }
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
    const ok = choice !== null && picked.size === good.size && [...picked].every((a) => good.has(a));

    document.querySelectorAll(".answer").forEach((b) => {
      b.disabled = true;
      b.classList.remove("selected");
      const a = b.dataset.answer;
      if (good.has(a)) b.classList.add(picked.has(a) || !q.multi ? "correct" : "missed");
      else if (picked.has(a)) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    // Statistiques pour les trophées (enregistrées même si la partie est abandonnée)
    if (ok) {
      stats.correct++;
      if (q.diff === "d") stats.hard++;
      if (q.multi) stats.multi++;
      if (q.era === "O" && state.theme === "general") stats.origins++;
      if (state.theme === "cr7") stats.cr7Correct++;
      if (state.timer && Date.now() - state.qStart < 3000) stats.fast++;
    }

    if (ok) {
      state.score++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      stats.bestStreak = Math.max(stats.bestStreak, state.streak);
      if (state.theme === "cr7") stats.cr7BestStreak = Math.max(stats.cr7BestStreak, state.streak);
      Sounds.play("correct");
      if (state.streak % 5 === 0) Sounds.play("streak");
    } else {
      state.streak = 0;
      state.mistakes.push({ q, choice });
      Sounds.play(choice === null ? "timeout" : "wrong");
    }

    $("q-score").textContent = state.score;
    $("q-streak").textContent = `${state.streak} 🔥`;
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
    const answerText = q.multi
      ? `Les bonnes réponses : ${q.correct.join(", ")}.`
      : `La bonne réponse : ${q.correct[0]}.`;
    fb.innerHTML = `<strong></strong><span></span>`;
    fb.firstChild.textContent = ok ? title : `${title} ${answerText}`;
    fb.lastChild.textContent = q.explain;
    fb.className = `feedback ${ok ? "good" : "bad"}`;

    $("validate-btn").classList.add("hidden");
    const next = $("next-btn");
    next.textContent = state.index === state.list.length - 1 ? "Voir le résultat →" : "Suivante →";
    next.classList.remove("hidden");
    next.focus({ preventScroll: true });
  }

  function nextQuestion() {
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
    const total = state.list.length;
    const pct = total ? Math.round((state.score / total) * 100) : 0;
    $("progress-bar").style.width = "100%";

    let emoji, title, msg;
    if (pct === 100) { emoji = "🏆"; title = "Ballon d'Or !"; msg = "Un sans-faute. Tu es le roi de la fête."; }
    else if (pct >= 80) { emoji = "🥇"; title = "Champion !"; msg = "Niveau Ligue des champions. Respect."; }
    else if (pct >= 60) { emoji = "🥈"; title = "Très solide !"; msg = "Tu connais ton foot, encore un petit effort pour le titre."; }
    else if (pct >= 40) { emoji = "🥉"; title = "Pas mal !"; msg = "Milieu de tableau. Un peu de révision et ça passe."; }
    else { emoji = "🟨"; title = "Peut mieux faire…"; msg = "Retour au centre de formation, mais ne lâche rien !"; }

    $("end-emoji").textContent = emoji;
    $("end-title").textContent = title;
    $("end-score").textContent = `${state.score} / ${total}`;
    $("end-msg").textContent = msg;
    $("end-stats").innerHTML = `
      <div class="stat"><b>${pct}%</b><span>Réussite</span></div>
      <div class="stat"><b>${state.bestStreak} 🔥</b><span>Meilleure série</span></div>
      <div class="stat"><b>${state.mistakes.length}</b><span>Erreurs</span></div>`;

    const prev = storage.get(bestKey() + "-pct");
    if (total >= 10 && (prev === null || pct > Number(prev))) {
      storage.set(bestKey() + "-pct", String(pct));
      storage.set(bestKey(), `${state.score}/${total} (${pct}%)`);
    }

    // Statistiques de fin de partie et trophées
    stats.games++;
    if (!state.timer) stats.zenGames++;
    if (state.theme === "cr7") {
      stats.cr7Games++;
      if (total >= 20 && pct === 100) stats.cr7Perfect++;
    }
    if (total >= 10 && pct === 100) stats.perfect10++;
    if (total >= 20 && pct === 100) stats.perfect20++;
    if (total >= 50 && pct >= 80) stats.marathon++;
    if (state.isAll) stats.fullGames++;
    saveStats();
    state.newTrophies.push(...checkTrophies());
    renderNewTrophies(state.newTrophies);

    const review = $("review");
    review.innerHTML = "";
    $("review-wrap").classList.toggle("hidden", state.mistakes.length === 0);
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
    Sounds.play("end", pct >= 60 || state.newTrophies.length > 0);
    if (pct >= 80) confetti();
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
      grid.appendChild(card);
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
    box.className = `room-detail tier-${t.tier}`;
    box.innerHTML = `<span class="rd-ico"></span><div class="rd-txt"><b></b><span class="rd-tier"></span><p></p><small></small></div>
      <button class="rd-close" type="button" aria-label="Fermer">✕</button>`;
    box.querySelector(".rd-ico").textContent = t.icon;
    box.querySelector("b").textContent = t.name;
    box.querySelector(".rd-tier").textContent = TROPHY_TIERS[t.tier];
    box.querySelector("p").textContent = t.desc;
    box.querySelector("small").textContent = `Débloqué le ${unlocked[t.id].split("-").reverse().join("/")}`;
    box.querySelector(".rd-close").onclick = () => showRoomDetail(null);
  }

  function renderRoom() {
    const got = TROPHIES.filter((t) => unlocked[t.id] && t.tier !== "ultime");
    $("room-count").textContent = `${TROPHIES.filter((t) => unlocked[t.id]).length} / ${TROPHIES.length}`;
    showRoomDetail(null);

    // Piédestal central : le Trophée CR7 Ultime
    const ped = $("room-pedestal");
    const won = !!unlocked["cr7-ultime"];
    ped.className = `room-pedestal${won ? " won" : " locked"}`;
    ped.innerHTML = `<div class="rp-spot"></div>
      <div class="rp-cup">${LegendReveal.miniSvg()}${won ? "" : '<span class="rp-veil">?</span>'}</div>
      <div class="rp-base"><span>${won ? "Trophée CR7 Ultime" : "Emplacement réservé"}</span></div>
      <div class="rp-hint">${won ? "✨ Touche pour le voir sortir de la malle" : `🔒 Débloque les 5 trophées Superfan (${CR7_TROPHY_IDS.filter((id) => unlocked[id]).length} / 5)`}</div>`;
    ped.onclick = () => openLegend(won);

    // Étagères par niveau
    const shelves = $("room-shelves");
    shelves.innerHTML = "";
    $("room-empty").classList.toggle("hidden", got.length > 0);
    TIER_ORDER.forEach((tier) => {
      const list = got.filter((t) => t.tier === tier);
      if (!list.length) return;
      const sh = document.createElement("section");
      sh.className = `shelf tier-${tier}`;
      sh.innerHTML = `<div class="shelf-label">${TROPHY_TIERS[tier]} <small>${list.length}</small></div><div class="shelf-items"></div><div class="shelf-plank"></div>`;
      const items = sh.querySelector(".shelf-items");
      list.forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "room-item";
        const art = trophyArt(tier, t.icon);
        b.innerHTML = `<span class="ri-art">${art.svg}</span><span class="ri-name"></span><span class="ri-shadow"></span>`;
        b.querySelector(".ri-name").textContent = t.name;
        b.onclick = () => showRoomDetail(t);
        items.appendChild(b);
      });
      shelves.appendChild(sh);
    });
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

  // ---------- Événements ----------
  $("start-btn").onclick = start;
  $("next-btn").onclick = nextQuestion;
  $("validate-btn").onclick = () => { if (state.selected.size) answer([...state.selected]); };
  $("replay-btn").onclick = start;
  $("home-btn").onclick = () => { renderBest(); show("home"); };
  $("trophies-btn").onclick = openTrophies;
  $("end-trophies-btn").onclick = openTrophies;
  $("tr-back").onclick = () => { renderBest(); show("home"); };
  $("room-back").onclick = openTrophies;

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
    renderBest();
    show("home");
  };

  document.addEventListener("keydown", (e) => {
    if (!$("screen-quiz").classList.contains("active")) return;
    const q = state.list[state.index];
    const k = e.key.toUpperCase();
    let idx = LETTERS.indexOf(k);
    if (idx === -1) idx = ["1", "2", "3", "4", "5", "6"].indexOf(k);
    if (!state.answered && idx !== -1 && idx < q.shuffled.length) {
      if (q.multi) toggleChoice(q.shuffled[idx], document.querySelectorAll(".answer")[idx]);
      else answer([q.shuffled[idx]]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state.answered) nextQuestion();
      else if (q.multi && state.selected.size) answer([...state.selected]);
    }
  });

  // Écran d'ouverture
  $("w-count").textContent = GENERAL_TOTAL();
  $("enter-btn").onclick = () => {
    Sounds.unlock();
    Sounds.play("start");
    show("home");
  };

  renderFilters();
  renderBest();
})();
