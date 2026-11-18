import { voice } from '@/lib/sfx'

// The Ocarina of Time: five holes on the N64's A and C buttons (D F A B D), played with the game's own samples.
// It plays through its own AudioContext: picking up an instrument is asking for sound, even with the
// site muted. Songs are recognised the way the game does it: the last notes on the staff match a song.

export const KEYS = { a: 'a', arrowdown: 'down', arrowright: 'right', arrowleft: 'left', arrowup: 'up' }

// id, notes, beats per note (the rhythm used when the song plays back), seconds per beat
export const SONGS = [
  ['zelda', 'left up right left up right', [2, 1, 3, 2, 1, 3], 0.2],
  ['epona', 'up left right up left right', [1, 1, 4, 1, 1, 4], 0.18],
  ['saria', 'down right left down right left', [1, 1, 2, 1, 1, 2], 0.13],
  ['sun', 'right down up right down up', [1, 1, 3, 1, 1, 3], 0.11],
  ['time', 'right a down right a down', [2, 4, 2, 2, 4, 2], 0.17],
  ['storms', 'a down up a down up', [1, 1, 4, 1, 1, 4], 0.12],
  ['minuet', 'a up left right left right', [2, 4, 1, 1, 1, 4], 0.15],
  ['bolero', 'down a down a right down right down', [1, 1, 1, 1, 1, 1, 1, 3], 0.13],
  ['serenade', 'a down right right left', [2, 2, 2, 1, 4], 0.2],
  ['requiem', 'a down a right down a', [2, 1, 2, 1, 2, 4], 0.17],
  ['nocturne', 'left right right a left right down', [2, 1, 2, 1, 1, 1, 4], 0.17],
  ['prelude', 'up right up left right up', [1, 2, 1, 2, 1, 4], 0.15],
  // the game plays the song back slowly, almost a lesson: the beats above run at this pace
].map(([id, notes, beats, beat]) => ({ id, notes: notes.split(' '), beats, beat: beat * 1.75 }))

// the song the staff ends with, if any
export function match(staff) {
  return SONGS.find((s) => s.notes.length <= staff.length && s.notes.every((n, i) => staff[staff.length - s.notes.length + i] === n))
}

let ctx = null
const audio = () => {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// The game's own sounds (lossless rips from Zelda Sounds): the ocarina notes, the song and secret
// jingles, the item fanfare, Navi. Decoded once, on first use; preload() warms them up ahead.
const FILE = { a: 'd', down: 'f', right: 'a', left: 'b', up: 'd2' }
const cache = {}
const load = (name) => (cache[name] ??= fetch(`/audio/ocarina/${name}.wav`).then((r) => r.arrayBuffer()).then((b) => audio().decodeAudioData(b)))
export function preload() { for (const f of Object.values(FILE)) { load(`note-${f}-med`); load(`note-${f}-long`) } ['correct', 'error', 'secret', 'item', 'hey', 'listen', 'warp'].forEach(load) }

// play a sample at `at` seconds from now; `len` cuts it with a short fade, as a held note ends.
// Returns a handle whose stop() fades the sound out early.
function play(name, at = 0, len = 0, gain = 1) {
  const c = audio(), when = c.currentTime + at
  let node = null, cut = false
  load(name).then((buf) => {
    if (cut) return
    const src = c.createBufferSource(), g = c.createGain()
    src.buffer = buf; g.gain.value = gain
    src.connect(g).connect(c.destination)
    const t = Math.max(when, c.currentTime)
    src.start(t); node = { src, g }
    if (len) { g.gain.setValueAtTime(gain, t + len); g.gain.linearRampToValueAtTime(0, t + len + 0.12); src.stop(t + len + 0.15) }
  })
  return { stop(fade = 0.06) {
    cut = true
    if (!node) return
    const t = c.currentTime
    node.g.gain.cancelScheduledValues(t); node.g.gain.setValueAtTime(node.g.gain.value, t); node.g.gain.linearRampToValueAtTime(0, t + fade)
    node.src.stop(t + fade + 0.02)
  } }
}

// one breath at a time, like the real instrument: a new note cuts the one still ringing
let ringing = null
export const playNote = (n) => { ringing?.stop(); ringing = play(`note-${FILE[n]}-med`) }
export const hushNote = (fade = 0.25) => { ringing?.stop(fade); ringing = null }

// the song answers back in its own rhythm on the ocarina; returns when each note starts and how long it all takes (s)
export function playSong(song) {
  let t = 0.15
  const times = song.notes.map((n, i) => {
    const at = t, len = song.beats[i] * song.beat
    play(`note-${FILE[n]}-${len > 0.6 ? 'long' : 'med'}`, at, len * 0.95)
    t += len
    return at
  })
  return { times, dur: t + 0.4 }
}

export const playCorrect = () => play('correct')
export const playError = () => play('error')
export const playSecret = (at = 0) => play('secret', at)
export const playFanfare = () => play('item')
export const playHey = () => { play('hey'); play('listen', 0.5) }
export const playWarp = () => play('warp')
export const playGallop = (at = 0) => play('gallop', at, 0, 0.8)

// the game's music (the N64 rip): each song as the game plays it back, the temple, the field.
// One music channel, like the game: a new track fades out whatever was playing. HTMLAudio streams,
// so the long field theme starts before it has fully arrived. fadeIn (ms) eases a track in.
let current = null
export function playMusic(id, { loop = false, volume = 1, fadeIn = 0 } = {}) {
  if (current) fadeOut(current, 500)
  const a = new Audio(`/audio/ocarina/music/${id}.mp3`)
  a.loop = loop; a.volume = fadeIn ? 0 : volume
  a.play().catch(() => {})
  if (fadeIn) ramp(a, volume, fadeIn)
  current = a
  return a
}
// timers, not frames: a background tab throttles rAF and the fade would never finish
function ramp(a, to, ms, done) {
  const from = a.volume, t0 = performance.now()
  const id = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms)
    a.volume = from + (to - from) * k
    if (k === 1) { clearInterval(id); done?.() }
  }, 30)
}
export function fadeOut(a, ms = 900) {
  if (!a) return
  if (a === current) current = null
  ramp(a, 0, ms, () => a.pause())
}
export const setMusicVolume = (v) => { if (current) current.volume = v }

// Epona: the neigh, then the gallop is the rider's business
export const playEpona = () => play('neigh')

// rain on the roof and thunder far away, for as long as the storm lasts
export function playStorm(secs = 14) {
  const c = audio()
  voice(c, { noise: true, a: 1.5, d: 1, s: 0.8, hold: secs - 4, r: 1.5, gain: 0.05, filter: 'lowpass', ff: 2400, q: 0.5 })
  ;[1.2, 6.5, 11].forEach((at) => voice(c, { noise: true, at, a: 0.05, d: 2.2, gain: 0.18, filter: 'lowpass', ff: 220, ff2: 60, q: 3 }))
}

// ── what the visitor has: the ocarina and the songs played at least once (per browser) ──
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode: it lasts the visit */ } }
export const hasOcarina = () => read('va-ocarina', false)
export const takeOcarina = () => write('va-ocarina', true)
export const songsPlayed = () => new Set(read('va-songs', []))
export const markSong = (id) => write('va-songs', [...songsPlayed().add(id)])
