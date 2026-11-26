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
    general: { questions: build([...QUESTIONS_RAW, ...QUESTIONS_PLUS_RAW], QUESTIONS_MULTI_RAW), eras: ERAS_GENERAL },
    cr7: { questions: build(CR7_RAW, CR7_MULTI_RAW), eras: ERAS_CR7 },
  };
  Object.values(BANKS).forEach((b) => {
    b.categories = [...new Set(b.questions.map((q) => q.cat))];
    b.cats = new Set(b.categories);
    b.eraSel = new Set(b.eras.map((e) => e.id));
  });
  let QUESTIONS = BANKS.general.questions;
  const ALL_QUESTION_COUNT = () => BANKS.general.questions.length + BANKS.cr7.questions.length;
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
      : `<b>${QUESTIONS.length}</b> questions, de la naissance du foot en 1863 jusqu'en 2026.`;
    $("cat-title").textContent = state.theme === "cr7" ? "Thèmes" : "Catégories";
    $("era-title").textContent = state.theme === "cr7" ? "Périodes" : "Époques";
    storage.set("fqf-theme", state.theme);
  }
  $("count-general").textContent = `${BANKS.general.questions.length} questions`;
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

    seen.add(q.key);
    saveSeen();
    everSeen.add(q.key);
    saveEver();
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
    const vb = document.createElement("button");
    vb.className = `vitrine${won ? "" : " locked"}`;
    vb.type = "button";
    vb.innerHTML = `<div class="v-cup">${LegendReveal.miniSvg()}${won ? "" : '<span class="v-lock">🔒</span>'}</div>
      <div class="v-txt"><div class="v-kicker">${won ? "✦ VITRINE ✦" : "🔒 VITRINE VERROUILLÉE"}</div>
      <div class="v-title">Trophée CR7 Ultime</div>
      <div class="v-cta">${won
        ? "Touche pour le voir sortir de la malle, en boucle"
        : `Débloque les 5 trophées Superfan CR7 (${have} / 5). Touche pour voir la malle.`}</div></div>`;
    vb.onclick = () => openLegend(won);
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
  $("w-count").textContent = BANKS.general.questions.length;
  $("enter-btn").onclick = () => {
    Sounds.unlock();
    Sounds.play("start");
    show("home");
  };

  renderFilters();
  renderBest();
})();
