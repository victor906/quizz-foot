// Sons générés avec la Web Audio API (aucun fichier audio à charger).
const Sounds = (() => {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Une note simple avec enveloppe
  function tone(freq, start, dur, { type = "sine", vol = 0.25, slideTo = null } = {}) {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime + start;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Sifflet d'arbitre : note aiguë avec trille rapide
  function whistle(start, dur) {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime + start;
    const osc = c.createOscillator();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = 2900;
    lfo.frequency.value = 28;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(osc.frequency);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    gain.gain.setValueAtTime(0.18, t + dur - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t); lfo.start(t);
    osc.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  }

  // Clameur de la foule : bruit filtré
  function crowd(start, dur, vol = 0.35) {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime + start;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
  }

  const play = {
    correct() {
      tone(784, 0, 0.12, { type: "triangle", vol: 0.3 });
      tone(1047, 0.1, 0.12, { type: "triangle", vol: 0.3 });
      tone(1319, 0.2, 0.28, { type: "triangle", vol: 0.3 });
    },
    wrong() {
      tone(220, 0, 0.18, { type: "sawtooth", vol: 0.15, slideTo: 180 });
      tone(165, 0.18, 0.4, { type: "sawtooth", vol: 0.15, slideTo: 110 });
    },
    timeout() {
      whistle(0, 0.25);
      whistle(0.32, 0.25);
    },
    start() {
      whistle(0, 0.45);
    },
    streak() {
      crowd(0.2, 1.6, 0.3);
    },
    end(good) {
      whistle(0, 0.25);
      whistle(0.32, 0.25);
      whistle(0.64, 0.7);
      if (good) {
        crowd(1.2, 2.5, 0.4);
        [523, 659, 784, 1047].forEach((f, i) => tone(f, 1.3 + i * 0.13, 0.35, { type: "triangle", vol: 0.22 }));
      }
    },
    click() {
      tone(1200, 0, 0.04, { type: "square", vol: 0.05 });
    },
  };

  return {
    unlock() { getCtx(); },
    setEnabled(v) { enabled = v; },
    isEnabled() { return enabled; },
    play(name, ...args) {
      if (!enabled) return;
      try { play[name](...args); } catch { /* son non disponible */ }
    },
  };
})();
