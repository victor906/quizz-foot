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
  const ERAS = [
    { id: "O", label: "Les origines", range: "1863-1929" },
    { id: "A", label: "1930-1969", range: "" },
    { id: "B", label: "1970-1999", range: "" },
    { id: "C", label: "2000-2019", range: "" },
    { id: "D", label: "2020-2026", range: "" },
    { id: "X", label: "Toutes époques", range: "règles, records, culture" },
  ];
  const diffOf = (id) => DIFFS.find((d) => d.id === id) || DIFFS[1];
  const eraOf = (id) => ERAS.find((e) => e.id === id) || ERAS[5];

  // ---------- Construction de la banque de questions ----------
  const QUESTIONS = [
    ...QUESTIONS_RAW,
    ...QUESTIONS_PLUS_RAW,
  ].map(([cat, q, answers, explain, diff, era]) => ({
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
    QUESTIONS_MULTI_RAW.map(([cat, q, good, bad, explain, diff, era]) => ({
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

  const state = {
    count: "20",
    cats: new Set(),
    diffs: new Set(DIFFS.map((d) => d.id)),
    eras: new Set(ERAS.map((e) => e.id)),
    timer: true,
    multi: true,
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
  const categories = [...new Set(QUESTIONS.map((q) => q.cat))];
  categories.forEach((c) => state.cats.add(c));
  $("total-count").textContent = QUESTIONS.length;

  function currentPool() {
    return QUESTIONS.filter((q) =>
      state.cats.has(q.cat) &&
      state.diffs.has(q.diff) &&
      state.eras.has(q.era) &&
      (state.multi || !q.multi));
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

  $("multi-toggle").onchange = (e) => { state.multi = e.target.checked; renderFresh(); };

  function renderBest() {
    const best = storage.get("fqf-best");
    $("best-score").textContent = best ? `🏅 Ton meilleur score : ${best}` : "";
    updateSummaries();
    renderFresh();
  }

  // ---------- Partie ----------
  function start() {
    Sounds.unlock();
    state.multi = $("multi-toggle").checked;

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

    if (ok) {
      state.score++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      Sounds.play("correct");
      if (state.streak % 5 === 0) Sounds.play("streak");
    } else {
      state.streak = 0;
      state.mistakes.push({ q, choice });
      Sounds.play(choice === null ? "timeout" : "wrong");
    }

    $("q-score").textContent = state.score;
    $("q-streak").textContent = `${state.streak} 🔥`;

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

    const prev = storage.get("fqf-best-pct");
    if (total >= 10 && (prev === null || pct > Number(prev))) {
      storage.set("fqf-best-pct", String(pct));
      storage.set("fqf-best", `${state.score}/${total} (${pct}%)`);
    }

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
    Sounds.play("end", pct >= 60);
    if (pct >= 80) confetti();
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

  // Double appui pour abandonner (les boîtes confirm() ne marchent pas partout)
  let quitArmed = null;
  $("quit-btn").onclick = () => {
    const b = $("quit-btn");
    if (!quitArmed) {
      b.textContent = "Sûr ? Appuie encore";
      quitArmed = setTimeout(() => { quitArmed = null; b.textContent = "Abandonner"; }, 3000);
      return;
    }
    clearTimeout(quitArmed);
    quitArmed = null;
    b.textContent = "Abandonner";
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

  renderFilters();
  renderBest();
})();
