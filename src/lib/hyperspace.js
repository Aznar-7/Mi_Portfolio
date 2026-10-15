// The hyperspace jump, played from a free Blender render (public/video/hyperspace.mp4, 13.4 s:
// stars until ~4 s, the jump at ~4.5 s, then the tunnel). One <video> is reused for every jump:
// the Konami entrance plays the long cut, travel between planets plays just the jump.

let video = null
function getVideo() {
  if (video) return video
  video = Object.assign(document.createElement('video'), { src: '/video/hyperspace.mp4', preload: 'auto', playsInline: true, className: 'hyper-video' })
  video.setAttribute('aria-hidden', 'true')
  return video
}
export const preloadJump = () => { getVideo().load() }

const SOUND_KEY = 'site_sound'
const soundOn = () => { try { return localStorage.getItem(SOUND_KEY) !== 'off' } catch { return true } }

/**
 * Plays [from, to] seconds of the jump full screen, then fades out.
 * `onPeak` fires at `peakAt` while the video covers the screen (swap what is underneath then),
 * `onDone` once it has faded out.
 */
export function jump({ from = 4.2, to = 6.0, peakAt = from + 0.25, onPeak, onDone } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onPeak?.(); onDone?.(); return () => {} }
  const v = getVideo()
  v.muted = !soundOn(); v.volume = 0.8
  v.classList.remove('out'); document.body.append(v)
  let peaked = false, cancelled = false
  const finish = () => {
    if (cancelled) return
    cancelled = true; v.pause(); v.removeEventListener('timeupdate', tick); removeEventListener('keydown', skip)
    if (!peaked) { peaked = true; onPeak?.() }
    v.classList.add('out')
    setTimeout(() => { v.remove(); v.classList.remove('out'); onDone?.() }, 520)
  }
  const tick = () => {
    if (!peaked && v.currentTime > peakAt) { peaked = true; onPeak?.() }
    if (v.currentTime >= to) finish()
  }
  v.addEventListener('timeupdate', tick)
  const start = () => { v.currentTime = from; v.play().catch(() => { v.muted = true; v.play().catch(finish) }) }
  v.readyState >= 1 ? start() : v.addEventListener('loadedmetadata', start, { once: true })
  const skip = (e) => { if (e.type === 'click' || e.key === 'Escape') finish() }
  v.addEventListener('click', skip, { once: true })
  addEventListener('keydown', skip)
  // safety net if the file never plays
  setTimeout(() => { if (!peaked) finish() }, (to - from) * 1000 + 3000)
  return finish
}
