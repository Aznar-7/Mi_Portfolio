import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const SoundContext = createContext(null)

/* ─────────────────────────────────────────────────────────────
   Low-level audio primitives
───────────────────────────────────────────────────────────── */

/**
 * Plays a pitched oscillator note with a smooth ADSR-like envelope.
 * @param {AudioContext} ctx
 * @param {number}  freq     Start frequency (Hz)
 * @param {string}  type     OscillatorType (sine/triangle/sawtooth/square)
 * @param {number}  vol      Peak gain (0–1)
 * @param {number}  attack   Attack time (s)
 * @param {number}  decay    Decay time (s) — fades to silence after attack
 * @param {number}  freqEnd  Optional: glide to this frequency by end of decay
 * @param {number}  offset   Seconds from now to start
 */
function note(ctx, freq, type, vol, attack, decay, freqEnd = null, offset = 0) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  const now  = ctx.currentTime + offset

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (freqEnd && freqEnd > 0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + attack + decay)
  }

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(vol, now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + attack + decay + 0.01)
}

/**
 * Plays a shaped white-noise burst (great for ticks, snaps, swishes).
 * @param {AudioContext} ctx
 * @param {number} vol       Peak gain
 * @param {number} duration  Duration (s)
 * @param {number} lpHz      Low-pass cutoff Hz (null = no filter)
 * @param {number} hpHz      High-pass cutoff Hz (null = no filter)
 * @param {number} offset    Seconds from now to start
 */
function noise(ctx, vol, duration, lpHz = null, hpHz = null, offset = 0) {
  const sr  = ctx.sampleRate
  const len = Math.max(1, Math.floor(sr * duration))
  const buf = ctx.createBuffer(1, len, sr)
  const d   = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1

  const src  = ctx.createBufferSource()
  src.buffer = buf

  const gain = ctx.createGain()
  const now  = ctx.currentTime + offset
  gain.gain.setValueAtTime(vol, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  let last = src

  if (lpHz) {
    const lp = ctx.createBiquadFilter()
    lp.type  = 'lowpass'
    lp.frequency.setValueAtTime(lpHz, now)
    last.connect(lp)
    last = lp
  }
  if (hpHz) {
    const hp = ctx.createBiquadFilter()
    hp.type  = 'highpass'
    hp.frequency.setValueAtTime(hpHz, now)
    last.connect(hp)
    last = hp
  }

  last.connect(gain)
  gain.connect(ctx.destination)
  src.start(now)
}

/* ─────────────────────────────────────────────────────────────
   Provider
───────────────────────────────────────────────────────────── */
export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('site_muted') === 'true'
  )
  const ctx = useRef(null)

  /* Init AudioContext on first user gesture */
  const init = useCallback(() => {
    if (!ctx.current && typeof window !== 'undefined') {
      const Ctor = window.AudioContext || window.webkitAudioContext
      ctx.current = new Ctor()
    }
    if (ctx.current?.state === 'suspended') ctx.current.resume()
  }, [])

  useEffect(() => {
    const opts = { once: true }
    window.addEventListener('mousedown',  init, opts)
    window.addEventListener('keydown',    init, opts)
    window.addEventListener('touchstart', init, opts)
    return () => {
      window.removeEventListener('mousedown',  init)
      window.removeEventListener('keydown',    init)
      window.removeEventListener('touchstart', init)
    }
  }, [init])

  useEffect(() => {
    localStorage.setItem('site_muted', isMuted)
  }, [isMuted])

  const toggleMute = useCallback(() => {
    init()
    setIsMuted(m => !m)
  }, [init])

  /* Guard — returns false if audio is blocked */
  const ok = useCallback(() => {
    if (isMuted || !ctx.current) return false
    if (ctx.current.state === 'suspended') ctx.current.resume()
    return true
  }, [isMuted])

  /* ── Sounds ──────────────────────────────────────────────── */

  /**
   * Hover tick — barely audible, just enough texture
   * Two detuned sines (perfect fifth: 520 + 780 Hz)
   */
  const playHover = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 520, 'sine', 0.014, 0.003, 0.055)
    note(ctx.current, 780, 'sine', 0.009, 0.003, 0.045)
  }, [ok])

  /**
   * Click — layered thump + high snap
   * Body: 72 Hz sine burst (the "weight")
   * Snap: 1000 → 420 Hz triangle (the "click")
   */
  const playClick = useCallback(() => {
    if (!ok()) return
    // low thump
    note(ctx.current, 72,   'sine',     0.18, 0.001, 0.065)
    // crisp snap with pitch fall
    note(ctx.current, 1000, 'triangle', 0.07, 0.001, 0.030, 420)
  }, [ok])

  /**
   * Typing — mechanical keyboard feel
   * White noise burst (high-pass) + random-pitched body
   */
  const playTyping = useCallback(() => {
    if (!ok()) return
    const v   = 0.055 + Math.random() * 0.04   // slight volume variation
    const f   = 160   + Math.random() * 80      // 160–240 Hz body
    noise(ctx.current, v * 0.9, 0.008, null, 2800) // high-freq "tick"
    note(ctx.current, f, 'triangle', v * 0.5, 0.001, 0.040)
  }, [ok])

  /**
   * Open app — warm ascending arpeggio (C5 → E5 → G5)
   * With a soft initial noise swish
   */
  const playOpenApp = useCallback(() => {
    if (!ok()) return
    noise(ctx.current, 0.04, 0.10, 700, null) // soft swish at start
    note(ctx.current, 523, 'sine', 0.08, 0.005, 0.130, null, 0.00)  // C5
    note(ctx.current, 659, 'sine', 0.07, 0.005, 0.115, null, 0.09)  // E5
    note(ctx.current, 784, 'sine', 0.09, 0.005, 0.160, null, 0.18)  // G5
  }, [ok])

  /**
   * Close app — descending G5 → C5, softer & quicker
   */
  const playCloseApp = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 784, 'sine', 0.055, 0.003, 0.080, null, 0.00) // G5
    note(ctx.current, 523, 'sine', 0.045, 0.003, 0.090, null, 0.07) // C5
  }, [ok])

  /**
   * Success — two bright pings (copy, save, complete)
   * 880 Hz → 1760 Hz
   */
  const playSuccess = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 880,  'sine', 0.075, 0.004, 0.110, null, 0.00)
    note(ctx.current, 1760, 'sine', 0.055, 0.004, 0.090, null, 0.08)
  }, [ok])

  /**
   * Navigation — single clean ping for section scrolls
   * Lighter & higher than a click
   */
  const playNavigation = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 440, 'sine', 0.065, 0.004, 0.095)
  }, [ok])

  /**
   * Unlock — Android-style rising sweep
   * Sine glide 340 → 920 Hz + light noise
   */
  const playUnlock = useCallback(() => {
    if (!ok()) return
    noise(ctx.current, 0.03, 0.06, 600, null) // soft swish
    note(ctx.current, 340, 'sine', 0.08, 0.005, 0.200, 920)
  }, [ok])

  /**
   * Swipe / tab change — quick frequency brush
   * Soft descending whoosh
   */
  const playSwipe = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 540, 'sine', 0.045, 0.003, 0.080, 240)
    noise(ctx.current, 0.025, 0.06, 1200, null)
  }, [ok])

  /**
   * Modal open (Command Palette, overlays)
   * Low swell: 110 → 330 Hz
   */
  const playModalOpen = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 110, 'sine', 0.065, 0.008, 0.130, 330)
    noise(ctx.current, 0.025, 0.08, 600, null)
  }, [ok])

  /**
   * Modal close — reverse, softer
   * 330 → 110 Hz
   */
  const playModalClose = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 330, 'sine', 0.04, 0.004, 0.100, 110)
  }, [ok])

  /**
   * Toggle switch — physical flip feel
   * Two quick pings at rising pitches
   */
  const playToggle = useCallback(() => {
    if (!ok()) return
    note(ctx.current, 650,  'sine', 0.07, 0.002, 0.028, null, 0.00)
    note(ctx.current, 1050, 'sine', 0.06, 0.002, 0.022, null, 0.04)
  }, [ok])

  const value = {
    isMuted,
    toggleMute,
    // Core
    playHover,
    playClick,
    playTyping,
    // App lifecycle
    playOpenApp,
    playCloseApp,
    // Actions
    playSuccess,
    playNavigation,
    // UI interactions
    playUnlock,
    playSwipe,
    playModalOpen,
    playModalClose,
    playToggle,
  }

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

/* ─────────────────────────────────────────────────────────────
   Consumer hook — safe fallback when no Provider above
───────────────────────────────────────────────────────────── */
const NOOP = () => {}
const FALLBACK = {
  isMuted: true, toggleMute: NOOP,
  playHover: NOOP, playClick: NOOP, playTyping: NOOP,
  playOpenApp: NOOP, playCloseApp: NOOP,
  playSuccess: NOOP, playNavigation: NOOP,
  playUnlock: NOOP, playSwipe: NOOP,
  playModalOpen: NOOP, playModalClose: NOOP, playToggle: NOOP,
}

export function useSoundEffects() {
  const ctx = useContext(SoundContext)
  return ctx ?? FALLBACK
}
