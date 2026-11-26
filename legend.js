// Révélation légendaire du Trophée CR7 Ultime : une malle en cuir s'ouvre et le trophée en sort.
const LegendReveal = (() => {
  // ---------- Dessin du trophée (SVG) ----------
  const star = (cx, cy, r) => {
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 ? r * 0.45 : r;
      const a = (-90 + k * 36) * Math.PI / 180;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  // Branche de laurier (feuilles le long d'une courbe)
  const laurel = (side) => {
    let out = "";
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const x = 120 + side * (52 + 22 * Math.sin(t * Math.PI * 0.9));
      const y = 214 - t * 150;
      const ang = side * (25 + t * 40);
      out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="11" ry="4.6" fill="url(#cGoldV)" stroke="#7a4d00" stroke-width=".8" transform="rotate(${(side > 0 ? -1 : 1) * (90 - ang)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      out += `<ellipse cx="${(x + side * 7).toFixed(1)}" cy="${(y + 5).toFixed(1)}" rx="9" ry="3.8" fill="url(#cGold)" stroke="#7a4d00" stroke-width=".8" transform="rotate(${side * (20 + t * 30)} ${(x + side * 7).toFixed(1)} ${(y + 5).toFixed(1)})"/>`;
    }
    return `<path d="M${120 + side * 50} 220 Q ${120 + side * 82} 140 ${120 + side * 60} 62" fill="none" stroke="#a86f00" stroke-width="2.4"/>` + out;
  };
  const stars = [[60, 34], [90, 22], [120, 17], [150, 22], [180, 34]]
    .map(([x, y]) => `<polygon class="c-star" points="${star(x, y, 9)}" fill="url(#cGoldV)" stroke="#fff3b8" stroke-width="1"/>`).join("");

  const TROPHY_SVG = `
  <svg viewBox="0 0 240 300" class="lg-cup" aria-hidden="true">
    <defs>
      <linearGradient id="cGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7a4800"/><stop offset=".2" stop-color="#ffe27a"/>
        <stop offset=".42" stop-color="#d99c12"/><stop offset=".6" stop-color="#fff5c2"/>
        <stop offset=".8" stop-color="#c58606"/><stop offset="1" stop-color="#6e4300"/>
      </linearGradient>
      <linearGradient id="cGoldV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff4b5"/><stop offset=".5" stop-color="#e3a91e"/><stop offset="1" stop-color="#8a5600"/>
      </linearGradient>
      <radialGradient id="cRuby" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#ff8a93"/><stop offset=".35" stop-color="#e0102b"/><stop offset="1" stop-color="#5c0010"/>
      </radialGradient>
      <radialGradient id="cEmerald" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#9dffc8"/><stop offset=".35" stop-color="#0aa04f"/><stop offset="1" stop-color="#003d1f"/>
      </radialGradient>
      <linearGradient id="cMarble" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2b2b2b"/><stop offset=".45" stop-color="#0c0c0c"/><stop offset=".55" stop-color="#262626"/><stop offset="1" stop-color="#050505"/>
      </linearGradient>
      <linearGradient id="cGlint" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="cClip">
        <path d="M74 66 H166 C166 140 146 176 120 184 C94 176 74 140 74 66 Z"/>
        <path d="M84 62 L92 40 L106 54 L120 30 L134 54 L148 40 L156 62 Z"/>
        <path d="M110 182 H130 L134 214 H106 Z"/>
        <rect x="78" y="254" width="84" height="18" rx="3"/>
      </clipPath>
    </defs>

    <!-- 5 étoiles : 5 Ballons d'Or, 5 Ligues des champions -->
    ${stars}

    <!-- Lauriers -->
    ${laurel(-1)}${laurel(1)}

    <!-- Anses -->
    <path d="M78 80 C36 78 38 140 92 150" fill="none" stroke="url(#cGold)" stroke-width="10" stroke-linecap="round"/>
    <path d="M162 80 C204 78 202 140 148 150" fill="none" stroke="url(#cGold)" stroke-width="10" stroke-linecap="round"/>

    <!-- Couronne -->
    <path d="M84 62 L92 40 L106 54 L120 30 L134 54 L148 40 L156 62 Z" fill="url(#cGoldV)" stroke="#7a4d00" stroke-width="1.5"/>
    <circle cx="92" cy="40" r="4" fill="url(#cEmerald)"/><circle cx="148" cy="40" r="4" fill="url(#cEmerald)"/>
    <circle cx="120" cy="30" r="5" fill="url(#cRuby)"/>
    <circle cx="120" cy="52" r="4" fill="url(#cRuby)"/>

    <!-- Coupe -->
    <path d="M74 66 H166 C166 140 146 176 120 184 C94 176 74 140 74 66 Z" fill="url(#cGold)" stroke="#6e4300" stroke-width="1.2"/>
    <ellipse cx="120" cy="66" rx="46" ry="8" fill="url(#cGoldV)" stroke="#6e4300" stroke-width="1"/>
    <path d="M84 74 C86 112 96 148 112 166" fill="none" stroke="#fffbe6" stroke-width="5" stroke-linecap="round" opacity=".55"/>
    <!-- Le 7 en rubis -->
    <text x="120" y="158" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="74" fill="url(#cRuby)" stroke="#ffe27a" stroke-width="2.5" paint-order="stroke">7</text>

    <!-- Pied -->
    <path d="M110 182 H130 L134 214 H106 Z" fill="url(#cGold)"/>
    <ellipse cx="120" cy="216" rx="30" ry="6" fill="url(#cGoldV)"/>

    <!-- Ruban aux couleurs du Portugal -->
    <path d="M58 200 L70 194 L70 214 L58 220 L64 210 Z" fill="#00592e"/>
    <path d="M182 200 L170 194 L170 214 L182 220 L176 210 Z" fill="#8b0010"/>
    <path d="M70 194 H120 V214 H70 Z" fill="#0a7a3c"/>
    <path d="M120 194 H170 V214 H120 Z" fill="#d0102b"/>
    <rect x="70" y="194" width="100" height="20" fill="none" stroke="#ffd76a" stroke-width="1.6"/>
    <text x="120" y="209" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12" letter-spacing="2" fill="#fff" stroke="#3a2400" stroke-width=".6">SIUUU</text>

    <!-- Socle en marbre noir -->
    <path d="M70 222 H170 L182 286 H58 Z" fill="url(#cMarble)" stroke="url(#cGold)" stroke-width="2"/>
    <rect x="54" y="284" width="132" height="10" rx="3" fill="url(#cGold)"/>
    <rect x="66" y="220" width="108" height="6" rx="2" fill="url(#cGold)"/>
    <rect x="78" y="254" width="84" height="18" rx="3" fill="url(#cGold)" stroke="#6e4300" stroke-width="1"/>
    <text x="120" y="267" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="11" letter-spacing="1.5" fill="#3a2400">CR7 · GOAT</text>
    <circle cx="80" cy="240" r="6" fill="url(#cEmerald)" stroke="#ffd76a" stroke-width="1.5"/>
    <circle cx="160" cy="240" r="6" fill="url(#cRuby)" stroke="#ffd76a" stroke-width="1.5"/>
    <text x="120" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="8" letter-spacing="3" fill="#ffd76a">ULTIME</text>

    <!-- Reflet animé, découpé à la forme du trophée -->
    <g clip-path="url(#cClip)"><rect class="lg-glint" x="0" y="0" width="52" height="300" fill="url(#cGlint)"/></g>
  </svg>`;

  // ---------- Trophée secret : la coupe « aux grandes oreilles » de La Fête ----------
  const sstars = Array.from({ length: 9 }, (_, i) => {
    const a = (-160 + i * 17.5) * Math.PI / 180;
    return `<polygon class="c-star" points="${star(120 + Math.cos(a) * 96, 118 + Math.sin(a) * 96, 6.5)}" fill="url(#sxSilV)" stroke="#fff" stroke-width=".8"/>`;
  }).join("");
  const SECRET_SVG = `
  <svg viewBox="0 0 240 300" class="lg-cup secret-cup" aria-hidden="true">
    <defs>
      <linearGradient id="sxSil" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#5b6470"/><stop offset=".18" stop-color="#eef3f8"/><stop offset=".38" stop-color="#9aa6b2"/>
        <stop offset=".55" stop-color="#ffffff"/><stop offset=".75" stop-color="#8c98a5"/><stop offset="1" stop-color="#4a525c"/>
      </linearGradient>
      <linearGradient id="sxSilV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b8c2cc"/><stop offset="1" stop-color="#6b7581"/>
      </linearGradient>
      <linearGradient id="sxGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7a4800"/><stop offset=".3" stop-color="#ffe27a"/><stop offset=".6" stop-color="#d99c12"/><stop offset="1" stop-color="#7a4800"/>
      </linearGradient>
      <linearGradient id="sxRibA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5fb0"/><stop offset="1" stop-color="#b3126b"/></linearGradient>
      <linearGradient id="sxRibB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#c58606"/></linearGradient>
      <linearGradient id="sxNight" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2a1640"/><stop offset=".5" stop-color="#120a20"/><stop offset="1" stop-color="#2a1640"/>
      </linearGradient>
      <linearGradient id="sxGlint" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="sxHead"><circle cx="120" cy="96" r="19"/></clipPath>
      <clipPath id="sxClip">
        <path d="M84 40 H156 C158 92 146 130 132 152 L128 170 H112 L108 152 C94 130 82 92 84 40 Z"/>
        <path d="M112 170 H128 L132 204 H108 Z"/>
      </clipPath>
    </defs>

    <!-- Arc d'étoiles -->
    ${sstars}

    <!-- Les grandes oreilles -->
    <path d="M88 54 C52 22 14 50 22 98 C28 132 70 152 110 150" fill="none" stroke="url(#sxSil)" stroke-width="11" stroke-linecap="round"/>
    <path d="M88 54 C52 22 14 50 22 98 C28 132 70 152 110 150" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>
    <path d="M152 54 C188 22 226 50 218 98 C212 132 170 152 130 150" fill="none" stroke="url(#sxSil)" stroke-width="11" stroke-linecap="round"/>
    <path d="M152 54 C188 22 226 50 218 98 C212 132 170 152 130 150" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>

    <!-- Rubans rose et or, noués aux oreilles -->
    <path d="M26 112 L18 168 L28 160 L34 172 L36 116 Z" fill="url(#sxRibA)"/>
    <path d="M34 118 L32 176 L42 166 L48 176 L44 120 Z" fill="url(#sxRibB)"/>
    <path d="M214 112 L222 168 L212 160 L206 172 L204 116 Z" fill="url(#sxRibA)"/>
    <path d="M206 118 L208 176 L198 166 L192 176 L196 120 Z" fill="url(#sxRibB)"/>
    <circle cx="31" cy="114" r="5" fill="url(#sxGold)"/><circle cx="209" cy="114" r="5" fill="url(#sxGold)"/>

    <!-- La coupe en argent -->
    <path d="M84 40 H156 C158 92 146 130 132 152 L128 170 H112 L108 152 C94 130 82 92 84 40 Z" fill="url(#sxSil)" stroke="#4a525c" stroke-width="1.2"/>
    <ellipse cx="120" cy="40" rx="36" ry="7" fill="url(#sxSilV)" stroke="#4a525c" stroke-width="1"/>
    <ellipse cx="120" cy="41" rx="30" ry="4" fill="#5b6470" opacity=".55"/>
    <path d="M92 50 C92 92 100 124 112 146" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>
    <!-- Médaillon : la tête de La Fête -->
    <circle cx="120" cy="96" r="23" fill="url(#sxGold)"/>
    <circle cx="120" cy="96" r="19.5" fill="#ff5fb0"/>
    <image href="__HEAD__" x="108.5" y="77.5" width="23" height="44.9" preserveAspectRatio="xMidYMin meet" clip-path="url(#sxHead)"/>
    <circle cx="120" cy="96" r="19.5" fill="none" stroke="#fff3b8" stroke-width="1.2"/>

    <!-- Pied -->
    <path d="M112 170 H128 L132 204 H108 Z" fill="url(#sxSil)"/>
    <ellipse cx="120" cy="186" rx="13" ry="4" fill="url(#sxSilV)"/>
    <ellipse cx="120" cy="205" rx="30" ry="6" fill="url(#sxSilV)" stroke="#4a525c" stroke-width=".8"/>

    <!-- Socle rond -->
    <path d="M78 210 H162 L176 272 H64 Z" fill="url(#sxNight)" stroke="url(#sxSil)" stroke-width="2"/>
    <ellipse cx="120" cy="210" rx="42" ry="7" fill="url(#sxSil)"/>
    <ellipse cx="120" cy="274" rx="58" ry="9" fill="url(#sxSil)"/>
    <rect x="80" y="236" width="80" height="18" rx="3" fill="url(#sxGold)" stroke="#6e4300" stroke-width="1"/>
    <text x="120" y="249" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="7.6" letter-spacing=".6" fill="#3a2400">ROI DE LA FÊTE</text>
    <text x="120" y="228" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="7.5" letter-spacing="3" fill="#ff9fd0">SUPRÊME</text>
    <circle cx="86" cy="262" r="4" fill="#ff5fb0" stroke="#ffe27a" stroke-width="1"/>
    <circle cx="154" cy="262" r="4" fill="#ff5fb0" stroke="#ffe27a" stroke-width="1"/>

    <!-- Reflet animé -->
    <g clip-path="url(#sxClip)"><rect class="lg-glint" x="0" y="0" width="52" height="300" fill="url(#sxGlint)"/></g>
  </svg>`;
  // L'image de la tête est celle déjà chargée par la page (fonctionne aussi hors ligne)
  const headSrc = () => { const im = document.querySelector("img.w-face, img.ph-face"); return im ? im.src : "icons/tete-fete.png"; };
  const secretSvg = () => SECRET_SVG.replace("__HEAD__", headSrc());

  let overlay = null;
  let sparkTimer = null;
  let looping = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function close() {
    if (!overlay) return;
    timers.splice(0).forEach(clearTimeout);
    clearInterval(sparkTimer);
    sparkTimer = null;
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

  // Une séquence complète : tremblement → ouverture → le trophée sort
  function sequence(o, first) {
    if (reduced()) {
      o.classList.add("open", "risen", "show-text");
      Sounds.play("legend");
      return;
    }
    const t0 = first ? 600 : 0;
    later(() => { o.classList.add("shake"); Sounds.play("rumble"); }, t0);
    later(() => { o.classList.remove("shake"); o.classList.add("open"); Sounds.play("open"); }, t0 + 1200);
    later(() => { o.classList.add("risen"); Sounds.play("legend"); }, t0 + 1450);
    later(() => {
      o.classList.add("show-text");
      if (!sparkTimer) sparkTimer = setInterval(spark, 90);
    }, t0 + 2100);
    if (looping) later(() => rewind(o), t0 + 7600);
  }

  // Le trophée redescend, la malle se referme, puis tout recommence
  function rewind(o) {
    if (overlay !== o) return;
    o.classList.remove("show-text", "risen");
    clearInterval(sparkTimer);
    sparkTimer = null;
    later(() => o.classList.remove("open"), 900);
    later(() => sequence(o, false), 1700);
  }

  function replay() {
    const o = overlay;
    if (!o || o.classList.contains("is-locked")) return;
    timers.splice(0).forEach(clearTimeout);
    rewind(o);
  }

  function setLoop(on) {
    looping = on;
    if (!overlay) return;
    const b = overlay.querySelector(".lg-loop");
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.textContent = on ? "🔁 Boucle activée" : "🔁 Boucle";
    if (on && overlay.classList.contains("show-text")) later(() => rewind(overlay), 3000);
  }

  // unlocked : trophée gagné ; remaining : nombre de trophées Superfan manquants ; loop : répéter l'animation
  // kind : "cr7" (Trophée CR7 Ultime) ou "secret" (Trophée La Fête Suprême)
  function open({ unlocked, date, remaining, loop = false, kind = "cr7", reward = 0 }) {
    if (overlay) close();
    const secret = kind === "secret";
    looping = !!loop && !!unlocked;
    overlay = document.createElement("div");
    overlay.className = `legend-overlay${unlocked ? "" : " is-locked"}${secret ? " is-secret" : ""}`;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", secret ? "Trophée La Fête Suprême" : "Trophée CR7 Ultime");
    overlay.innerHTML = `
      <div class="lg-bg"></div>
      <div class="lg-rays"></div>
      <div class="lg-rays lg-rays2"></div>
      <div class="lg-flash"></div>
      <div class="lg-sparkles"></div>
      <div class="lg-stage">
        <div class="lg-halo"></div>
        <div class="lg-rise"><div class="lg-trophy">${secret ? secretSvg() : TROPHY_SVG}</div></div>
        <div class="trunk drop">
          <div class="trunk-glow"></div>
          <div class="trunk-lid">
            <div class="lid-front"><span class="strap s1"></span><span class="strap s2"></span><span class="lid-plate">${secret ? "★" : "CR7"}</span></div>
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
        <div class="lg-rarity">${secret ? "✦ TROPHÉE SECRET ✦" : "✦ RARETÉ ULTIME ✦"}</div>
        <h2 class="lg-title">${secret ? "Trophée La Fête Suprême" : "Trophée CR7 Ultime"}</h2>
        <p class="lg-sub"></p>
      </div>
      <div class="lg-actions">
        <button class="btn lg-btn lg-replay" type="button">↻ Revoir</button>
        <button class="btn lg-btn lg-loop" type="button" aria-pressed="false">🔁 Boucle</button>
        <button class="btn lg-btn lg-close" type="button">Fermer</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".lg-close").onclick = close;
    overlay.querySelector(".lg-bg").onclick = close;
    overlay.querySelector(".lg-replay").onclick = replay;
    overlay.querySelector(".lg-loop").onclick = () => setLoop(!looping);
    document.addEventListener("keydown", onKey);

    const sub = overlay.querySelector(".lg-sub");
    if (unlocked) {
      sub.textContent = secret
        ? `Tu as débloqué absolument tout. Tu es le roi de la fête !${reward ? ` +${reward.toLocaleString("fr-FR")} 🪙` : ""} (le ${date})`
        : `Le plus rare de tous. Débloqué le ${date}. Siuuu !${reward ? ` +${reward.toLocaleString("fr-FR")} 🪙` : ""}`;
    } else {
      sub.textContent = remaining > 1
        ? `La malle est verrouillée. Encore ${remaining} trophées Superfan à débloquer.`
        : "La malle est verrouillée. Plus qu'un trophée Superfan à débloquer !";
      overlay.querySelector(".lg-rarity").textContent = "🔒 VERROUILLÉ";
      overlay.querySelector(".lg-replay").remove();
      overlay.querySelector(".lg-loop").remove();
    }
    if (unlocked) setLoop(looping);

    const o = overlay;
    requestAnimationFrame(() => o.classList.add("in"));

    if (!unlocked) {
      later(() => { o.classList.add("shake"); Sounds.play("locked"); }, 500);
      later(() => o.classList.add("show-text"), 900);
      return;
    }
    sequence(o, true);
  }

  // Petite version du trophée pour la vitrine et la carte
  // Chaque copie a ses propres identifiants : sinon les dégradés d'une copie cachée
  // (dans un écran masqué) ne s'affichent pas et le trophée paraît transparent.
  let miniCount = 0;
  const miniSvg = () => {
    const k = `m${++miniCount}`;
    return TROPHY_SVG
      .replace('class="lg-cup"', 'class="lg-cup mini"')
      .replace(/id="(c[A-Za-z]+)"/g, `id="$1${k}"`)
      .replace(/url\(#(c[A-Za-z]+)\)/g, `url(#$1${k})`);
  };

  let secretCount = 0;
  const miniSecret = () => {
    const k = `q${++secretCount}`;
    return secretSvg()
      .replace('class="lg-cup secret-cup"', 'class="lg-cup secret-cup mini"')
      .replace(/id="(sx[A-Za-z]+)"/g, `id="$1${k}"`)
      .replace(/url\(#(sx[A-Za-z]+)\)/g, `url(#$1${k})`);
  };

  return { open, close, miniSvg, miniSecret };
})();
