// Révélation légendaire du Trophée CR7 Ultime : une malle en cuir s'ouvre et le trophée en sort.
const LegendReveal = (() => {
  const TROPHY_SVG = `
  <svg viewBox="0 0 200 240" class="lg-cup" aria-hidden="true">
    <defs>
      <linearGradient id="lgGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8a5a00"/><stop offset=".22" stop-color="#ffe17a"/>
        <stop offset=".45" stop-color="#d9a01a"/><stop offset=".62" stop-color="#fff3b8"/>
        <stop offset=".82" stop-color="#c78a0a"/><stop offset="1" stop-color="#7a4d00"/>
      </linearGradient>
      <linearGradient id="lgGoldV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff1a6"/><stop offset="1" stop-color="#a86f00"/>
      </linearGradient>
      <linearGradient id="lgGlint" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="lgClip">
        <path d="M48 24 H152 C152 92 132 128 100 136 C68 128 48 92 48 24 Z"/>
        <path d="M92 134 H108 L112 168 H88 Z"/>
        <ellipse cx="100" cy="170" rx="30" ry="7"/>
        <rect x="54" y="220" width="92" height="9"/>
        <rect x="76" y="190" width="48" height="20"/>
      </clipPath>
      <linearGradient id="lgBase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a1a10"/><stop offset="1" stop-color="#0d0805"/>
      </linearGradient>
    </defs>
    <path d="M58 40 C18 40 14 92 62 104" fill="none" stroke="url(#lgGold)" stroke-width="11" stroke-linecap="round"/>
    <path d="M142 40 C182 40 186 92 138 104" fill="none" stroke="url(#lgGold)" stroke-width="11" stroke-linecap="round"/>
    <path d="M48 24 H152 C152 92 132 128 100 136 C68 128 48 92 48 24 Z" fill="url(#lgGold)"/>
    <ellipse cx="100" cy="24" rx="52" ry="9" fill="url(#lgGoldV)"/>
    <ellipse cx="100" cy="25" rx="44" ry="6" fill="#7a4d00" opacity=".55"/>
    <path d="M92 134 H108 L112 168 H88 Z" fill="url(#lgGold)"/>
    <ellipse cx="100" cy="170" rx="30" ry="7" fill="url(#lgGoldV)"/>
    <path d="M62 178 H138 L146 222 H54 Z" fill="url(#lgBase)"/>
    <rect x="54" y="220" width="92" height="9" rx="2" fill="url(#lgGold)"/>
    <rect x="62" y="176" width="76" height="5" rx="2" fill="url(#lgGold)"/>
    <rect x="76" y="190" width="48" height="20" rx="3" fill="url(#lgGold)"/>
    <text x="100" y="205" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="14" fill="#3a2400">CR7</text>
    <polygon points="100,52 108,72 130,72 112,85 119,106 100,93 81,106 88,85 70,72 92,72" fill="#fff8d6" stroke="#a86f00" stroke-width="2"/>
    <path d="M64 34 C66 70 76 100 92 116" fill="none" stroke="#fffbe6" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <g clip-path="url(#lgClip)"><rect class="lg-glint" x="0" y="0" width="46" height="240" fill="url(#lgGlint)"/></g>
  </svg>`;

  let overlay = null;
  let sparkTimer = null;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function close() {
    if (!overlay) return;
    timers.splice(0).forEach(clearTimeout);
    clearInterval(sparkTimer);
    const o = overlay;
    overlay = null;
    o.classList.add("closing");
    setTimeout(() => o.remove(), 350);
    document.removeEventListener("keydown", onKey);
  }
  const onKey = (e) => { if (e.key === "Escape") close(); };

  function spark() {
    if (!overlay) return;
    const s = document.createElement("span");
    s.className = "lg-spark";
    const big = Math.random() < 0.25;
    s.textContent = big ? "✦" : "";
    s.style.left = `${10 + Math.random() * 80}%`;
    s.style.top = `${8 + Math.random() * 62}%`;
    s.style.setProperty("--sz", `${big ? 18 + Math.random() * 14 : 4 + Math.random() * 6}px`);
    s.style.animationDuration = `${0.9 + Math.random() * 1.2}s`;
    if (big) s.classList.add("star");
    overlay.querySelector(".lg-sparkles").appendChild(s);
    setTimeout(() => s.remove(), 2300);
  }

  // unlocked : trophée gagné ; remaining : nombre de trophées Superfan manquants
  function open({ unlocked, date, remaining }) {
    if (overlay) close();
    overlay = document.createElement("div");
    overlay.className = `legend-overlay${unlocked ? "" : " is-locked"}`;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Trophée CR7 Ultime");
    overlay.innerHTML = `
      <div class="lg-bg"></div>
      <div class="lg-rays"></div>
      <div class="lg-flash"></div>
      <div class="lg-sparkles"></div>
      <div class="lg-stage">
        <div class="lg-halo"></div>
        <div class="lg-rise"><div class="lg-trophy">${TROPHY_SVG}</div></div>
        <div class="trunk">
          <div class="trunk-glow"></div>
          <div class="trunk-lid">
            <div class="lid-front"><span class="strap s1"></span><span class="strap s2"></span><span class="lid-plate">CR7</span></div>
          </div>
          <div class="trunk-body">
            <span class="strap s1"></span><span class="strap s2"></span>
            <span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
            <span class="lock"><span class="keyhole"></span></span>
            <span class="handle"></span>
          </div>
          <div class="chains"><span></span><span></span></div>
        </div>
      </div>
      <div class="lg-text">
        <div class="lg-rarity">✦ RARETÉ ULTIME ✦</div>
        <h2 class="lg-title">Trophée CR7 Ultime</h2>
        <p class="lg-sub"></p>
      </div>
      <button class="btn lg-close" type="button">Fermer</button>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".lg-close").onclick = close;
    overlay.querySelector(".lg-bg").onclick = close;
    document.addEventListener("keydown", onKey);

    const sub = overlay.querySelector(".lg-sub");
    if (unlocked) {
      sub.textContent = `Le plus rare de tous. Débloqué le ${date}. Siuuu !`;
    } else {
      sub.textContent = remaining > 1
        ? `La malle est verrouillée. Encore ${remaining} trophées Superfan à débloquer.`
        : "La malle est verrouillée. Plus qu'un trophée Superfan à débloquer !";
      overlay.querySelector(".lg-rarity").textContent = "🔒 VERROUILLÉ";
    }

    const o = overlay;
    requestAnimationFrame(() => o.classList.add("in"));

    if (!unlocked) {
      later(() => { o.classList.add("shake"); Sounds.play("locked"); }, 500);
      later(() => o.classList.add("show-text"), 900);
      return;
    }

    if (reduced()) {
      o.classList.add("shake-done", "open", "risen", "show-text");
      Sounds.play("legend");
      return;
    }

    later(() => { o.classList.add("shake"); Sounds.play("rumble"); }, 600);
    later(() => { o.classList.remove("shake"); o.classList.add("open"); Sounds.play("open"); }, 1800);
    later(() => { o.classList.add("risen"); Sounds.play("legend"); }, 2050);
    later(() => {
      o.classList.add("show-text");
      sparkTimer = setInterval(spark, 90);
    }, 2700);
  }

  return { open, close };
})();
