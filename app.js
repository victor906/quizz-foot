(() => {
  const TIME_PER_QUESTION = 20;
  const LETTERS = ["A", "B", "C", "D"];
  const $ = (id) => document.getElementById(id);

  const state = {
    count: "20",
    cats: new Set(),
    timer: true,
    list: [],
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: [],
    tick: null,
    timeLeft: TIME_PER_QUESTION,
    answered: false,
  };

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, v) { try { localStorage.setItem(key, v); } catch { /* ignore */ } },
  };

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function show(screen) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(`screen-${screen}`).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Accueil ----------
  const categories = [...new Set(QUESTIONS.map((q) => q.cat))];
  categories.forEach((c) => state.cats.add(c));

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
    $("start-btn").disabled = state.cats.size === 0;
  }

  document.querySelectorAll("#count-chips .chip").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("#count-chips .chip").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.count = b.dataset.count;
    };
  });

  function renderBest() {
    const best = storage.get("quizzfoot-best");
    $("best-score").textContent = best ? `🏅 Ton meilleur score : ${best}` : "";
  }

  // ---------- Quiz ----------
  function start() {
    const pool = shuffle(QUESTIONS.filter((q) => state.cats.has(q.cat)));
    const n = state.count === "all" ? pool.length : Math.min(Number(state.count), pool.length);
    state.list = pool.slice(0, n).map((q) => ({ ...q, shuffled: shuffle(q.answers) }));
    state.index = 0;
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.mistakes = [];
    state.timer = $("timer-toggle").checked;
    show("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    const q = state.list[state.index];
    const total = state.list.length;
    state.answered = false;

    $("q-num").textContent = `${state.index + 1}/${total}`;
    $("q-score").textContent = state.score;
    $("q-streak").textContent = `${state.streak} 🔥`;
    $("progress-bar").style.width = `${(state.index / total) * 100}%`;
    $("q-cat").textContent = q.cat;
    $("q-text").textContent = q.q;
    $("feedback").className = "feedback hidden";
    $("next-btn").classList.add("hidden");

    const wrap = $("answers");
    wrap.innerHTML = "";
    q.shuffled.forEach((ans, i) => {
      const b = document.createElement("button");
      b.className = "answer";
      b.innerHTML = `<span class="letter">${LETTERS[i]}</span><span></span>`;
      b.lastChild.textContent = ans;
      b.dataset.answer = ans;
      b.onclick = () => answer(ans);
      wrap.appendChild(b);
    });

    startTimer();
  }

  function startTimer() {
    clearInterval(state.tick);
    const t = $("q-timer");
    if (!state.timer) { t.classList.add("off"); return; }
    t.classList.remove("off", "warn");
    state.timeLeft = TIME_PER_QUESTION;
    drawTimer();
    state.tick = setInterval(() => {
      state.timeLeft--;
      drawTimer();
      if (state.timeLeft <= 0) {
        clearInterval(state.tick);
        answer(null);
      }
    }, 1000);
  }

  function drawTimer() {
    const t = $("q-timer");
    t.innerHTML = `<span class="timer-num">${state.timeLeft}</span>`;
    t.style.setProperty("--p", `${(state.timeLeft / TIME_PER_QUESTION) * 100}%`);
    t.classList.toggle("warn", state.timeLeft <= 5);
  }

  function answer(choice) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.tick);

    const q = state.list[state.index];
    const ok = choice === q.correct;

    document.querySelectorAll(".answer").forEach((b) => {
      b.disabled = true;
      if (b.dataset.answer === q.correct) b.classList.add("correct");
      else if (b.dataset.answer === choice) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    if (ok) {
      state.score++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      state.streak = 0;
      state.mistakes.push({ q, choice });
    }

    $("q-score").textContent = state.score;
    $("q-streak").textContent = `${state.streak} 🔥`;

    const fb = $("feedback");
    const title = ok
      ? pick(["⚽ Buuut !", "✅ Bien vu !", "🎯 En pleine lucarne !", "👏 Bravo !"])
      : choice === null
        ? "⏱️ Temps écoulé !"
        : pick(["❌ Raté !", "🟥 Carton rouge !", "😬 À côté du poteau !", "🚩 Hors-jeu !"]);
    fb.innerHTML = `<strong></strong><span></span>`;
    fb.firstChild.textContent = ok ? title : `${title} La bonne réponse : ${q.correct}.`;
    fb.lastChild.textContent = q.explain;
    fb.className = `feedback ${ok ? "good" : "bad"}`;

    const next = $("next-btn");
    next.textContent = state.index === state.list.length - 1 ? "Voir le résultat →" : "Suivante →";
    next.classList.remove("hidden");
    next.focus({ preventScroll: true });
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
    if (pct === 100) { emoji = "🏆"; title = "Ballon d'Or !"; msg = "Un sans-faute. Tu es une encyclopédie du foot vivante."; }
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

    // Meilleur score (en %), sur 10 questions minimum
    const prev = storage.get("quizzfoot-best-pct");
    if (total >= 10 && (prev === null || pct > Number(prev))) {
      storage.set("quizzfoot-best-pct", String(pct));
      storage.set("quizzfoot-best", `${state.score}/${total} (${pct}%)`);
    }

    const review = $("review");
    review.innerHTML = "";
    $("review-wrap").classList.toggle("hidden", state.mistakes.length === 0);
    state.mistakes.forEach(({ q, choice }) => {
      const li = document.createElement("li");
      li.innerHTML = `<div class="rq"></div><div class="ry"></div><div class="rc"></div><div class="re"></div>`;
      li.children[0].textContent = q.q;
      li.children[1].textContent = `Ta réponse : ${choice ?? "aucune (temps écoulé)"}`;
      li.children[2].textContent = `Bonne réponse : ${q.correct}`;
      li.children[3].textContent = q.explain;
      review.appendChild(li);
    });

    show("end");
    if (pct >= 80) confetti();
  }

  function confetti() {
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
    const k = e.key.toUpperCase();
    const idx = LETTERS.indexOf(k) !== -1 ? LETTERS.indexOf(k) : ["1", "2", "3", "4"].indexOf(k);
    if (!state.answered && idx !== -1) {
      const q = state.list[state.index];
      answer(q.shuffled[idx]);
    } else if (state.answered && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      nextQuestion();
    }
  });

  renderCats();
  renderBest();
})();
