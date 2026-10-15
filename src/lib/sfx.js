// Easter egg sound design, all synthesized with WebAudio (no film audio). Each cue is a small
// patch: oscillators and noise through filters and envelopes, mixed into one bus with a short
// echo so they sit in a shared space instead of sounding like test tones.

let bus = null
function out(ctx) {
  if (bus?.ctx === ctx) return bus.input
  const input = ctx.createGain(), master = ctx.createGain()
  const delay = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain()
  master.gain.value = 0.9
  delay.delayTime.value = 0.18; fb.gain.value = 0.28; wet.gain.value = 0.22
  input.connect(master); input.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master)
  master.connect(ctx.destination)
  bus = { ctx, input }
  return input
}

// one shaped voice: osc (or noise) → filter → envelope → bus
function voice(ctx, o) {
  const t = ctx.currentTime + (o.at ?? 0)
  const { a = 0.01, d = 0.3, s = 0, hold = 0, r = 0.2, gain = 0.1 } = o
  let src
  if (o.noise) {
    const len = Math.ceil(ctx.sampleRate * (a + d + hold + r + 0.1))
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1
    src = ctx.createBufferSource(); src.buffer = buf
  } else {
    src = ctx.createOscillator(); src.type = o.type ?? 'sine'
    src.frequency.setValueAtTime(o.f, t)
    if (o.f2) src.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide ?? a + d))
    if (o.detune) src.detune.value = o.detune
    if (o.lfo) { // vibrato or hum wobble
      const l = ctx.createOscillator(), lg = ctx.createGain()
      l.frequency.value = o.lfo[0]; lg.gain.value = o.lfo[1]
      l.connect(lg); lg.connect(src.frequency); l.start(t); l.stop(t + a + d + hold + r + 0.1)
    }
  }
  let node = src
  if (o.filter) {
    const f = ctx.createBiquadFilter(); f.type = o.filter; f.Q.value = o.q ?? 0.8
    f.frequency.setValueAtTime(o.ff ?? 1200, t)
    if (o.ff2) f.frequency.exponentialRampToValueAtTime(o.ff2, t + (o.fglide ?? a + d))
    node.connect(f); node = f
  }
  if (o.drive) {
    const w = ctx.createWaveShaper(), k = o.drive, n = 256, curve = new Float32Array(n)
    for (let i = 0; i < n; i++) { const x = (i / n) * 2 - 1; curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)) }
    w.curve = curve; node.connect(w); node = w
  }
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + a)
  g.gain.exponentialRampToValueAtTime(Math.max(gain * s, 0.0001), t + a + d)
  g.gain.setValueAtTime(Math.max(gain * s, 0.0001), t + a + d + hold)
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + hold + r)
  node.connect(g); g.connect(out(ctx))
  src.start(t); src.stop(t + a + d + hold + r + 0.05)
}

// a plucked string: bright attack that darkens as it rings (harp, lute)
const pluck = (ctx, f, at, gain = 0.06) => {
  voice(ctx, { type: 'triangle', f, at, a: 0.004, d: 1.6, gain, filter: 'lowpass', ff: f * 6, ff2: f * 1.5, fglide: 1.2 })
  voice(ctx, { type: 'sine', f: f * 2, at, a: 0.002, d: 0.5, gain: gain * 0.3 })
}

export const CUES = {
  // the doors of Durin: a harp glissando, stone grinding open, a low choir-like swell into the light
  mellon(ctx) {
    ;[392, 440, 523, 587, 659, 784, 880, 1047].forEach((f, i) => pluck(ctx, f, i * 0.07, 0.05))
    voice(ctx, { noise: true, at: 2.0, a: 0.4, d: 1.2, s: 0.4, r: 0.6, gain: 0.12, filter: 'lowpass', ff: 160, q: 4 })
    voice(ctx, { noise: true, at: 2.0, a: 0.1, d: 1.4, gain: 0.05, filter: 'bandpass', ff: 420, ff2: 180, q: 6 })
    ;[196, 247, 294, 392].forEach((f, i) => {
      voice(ctx, { type: 'sawtooth', f, at: 2.5, a: 1.0, d: 0.6, s: 0.8, hold: 0.6, r: 1.2, gain: 0.018, detune: i % 2 ? 7 : -7, filter: 'lowpass', ff: 900, lfo: [5, 2] })
    })
  },
  // the transmission crackles in, then blaster fire, timed to the bolts on screen
  order66(ctx) {
    for (let i = 0; i < 6; i++) voice(ctx, { noise: true, at: 0.2 + i * 0.32 + Math.random() * 0.1, a: 0.01, d: 0.12, gain: 0.03, filter: 'bandpass', ff: 1800, q: 4 })
    for (let i = 0; i < 16; i++) {
      const at = 3.3 + i * 0.17 + Math.random() * 0.08
      voice(ctx, { type: 'sawtooth', f: 1900, f2: 260, glide: 0.16, at, a: 0.002, d: 0.17, gain: 0.035, filter: 'lowpass', ff: 4200, ff2: 900 })
      if (i % 2) voice(ctx, { noise: true, at: at + 0.22, a: 0.002, d: 0.18, gain: 0.06, filter: 'lowpass', ff: 1200, ff2: 200 })
    }
  },
  // the DeLorean: an engine climbing through the gears, three sonic booms, electric crackle
  mph(ctx) {
    ;[[0, 70, 180], [0.85, 110, 260], [1.7, 150, 420]].forEach(([at, f, f2]) =>
      voice(ctx, { type: 'sawtooth', f, f2, glide: 0.8, at, a: 0.05, d: 0.8, s: 0.6, r: 0.1, gain: 0.05, filter: 'lowpass', ff: 700, ff2: 2200, drive: 6 }))
    ;[2.7, 2.85, 3.0].forEach((at) => {
      voice(ctx, { type: 'sine', f: 120, f2: 30, glide: 0.4, at, a: 0.003, d: 0.45, gain: 0.25 })
      voice(ctx, { noise: true, at, a: 0.002, d: 0.3, gain: 0.14, filter: 'lowpass', ff: 1400, ff2: 200 })
    })
    for (let i = 0; i < 14; i++) voice(ctx, { noise: true, at: 1.9 + Math.random() * 1.2, a: 0.001, d: 0.04, gain: 0.06, filter: 'highpass', ff: 4000 })
  },
  // engines spool, the stars stretch, and the jump lands with a thump
  hyperspace(ctx) {
    voice(ctx, { type: 'sawtooth', f: 60, f2: 900, glide: 1.1, a: 0.3, d: 0.8, s: 0.3, r: 0.3, gain: 0.05, filter: 'lowpass', ff: 300, ff2: 5000, q: 4, drive: 2 })
    voice(ctx, { noise: true, a: 0.6, d: 0.6, r: 0.4, gain: 0.12, filter: 'bandpass', ff: 300, ff2: 6000, q: 1.5 })
    voice(ctx, { type: 'sine', f: 90, f2: 35, glide: 0.5, at: 1.15, a: 0.004, d: 0.6, gain: 0.3 })
  },
  // short hop between systems in the galaxy
  warp(ctx) {
    voice(ctx, { noise: true, a: 0.25, d: 0.4, gain: 0.08, filter: 'bandpass', ff: 500, ff2: 4000, q: 2 })
    voice(ctx, { type: 'sine', f: 220, f2: 880, glide: 0.5, a: 0.05, d: 0.5, gain: 0.04 })
  },
  // the board test jig: relay click, three beeps, a pass tone
  placa(ctx) {
    voice(ctx, { noise: true, a: 0.001, d: 0.02, gain: 0.12, filter: 'highpass', ff: 2000 })
    ;[0.1, 0.24, 0.38].forEach((at) => voice(ctx, { type: 'square', f: 1180, at, a: 0.003, d: 0.07, gain: 0.025, filter: 'lowpass', ff: 3000 }))
    ;[784, 1175].forEach((f, i) => voice(ctx, { type: 'triangle', f, at: 0.56 + i * 0.09, a: 0.004, d: 0.5, gain: 0.05 }))
  },
  // a terminal types, then access is granted
  hire(ctx) {
    for (let i = 0; i < 14; i++) voice(ctx, { noise: true, at: i * 0.06 + Math.random() * 0.02, a: 0.001, d: 0.025, gain: 0.05, filter: 'bandpass', ff: 2500 + Math.random() * 1500, q: 3 })
    ;[523, 659, 784, 1047].forEach((f, i) => voice(ctx, { type: 'triangle', f, at: 1.0 + i * 0.08, a: 0.005, d: 0.6, gain: 0.045 }))
  },
  // the kettle sings, then the gourd bubbles
  mate(ctx) {
    voice(ctx, { type: 'sine', f: 1900, f2: 2300, glide: 1.2, a: 0.4, d: 0.8, gain: 0.02, lfo: [6, 25] })
    for (let i = 0; i < 9; i++) {
      const f = 380 + Math.random() * 400
      voice(ctx, { type: 'sine', f, f2: f * 2.2, glide: 0.06, at: 1.2 + i * 0.13 + Math.random() * 0.05, a: 0.004, d: 0.07, gain: 0.04 })
    }
  },
  devtools(ctx) { CUES.hire(ctx) },
}
