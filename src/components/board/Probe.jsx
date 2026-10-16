import { useEffect, useRef } from 'react'

// The board's pointer: the system arrow stays (no lag, text cursor in fields), and anything you can
// press gets a footprint drawn around it, an outline with two solder pads, so it reads as a part
// you are about to place. It glides between neighbours and only animates while it moves. The board's
// own parts and Chip draw their own hover, so they are left out.
const SEL = "a, button, summary, select, [role='button'], .cursor-target"
const SKIP = '.part, .chip-pet'
const PAD = 5

export function Probe() {
  const ref = useRef(null)
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current
    const k = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.3
    const cur = { x: 0, y: 0, w: 0, h: 0 }, goal = { ...cur }
    let target = null, raf = 0

    const aim = () => {
      if (!target?.isConnected) { target = null; el.classList.remove('on'); return false }
      const r = target.getBoundingClientRect()
      Object.assign(goal, { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 })
      return true
    }
    const tick = () => {
      let moving = false
      for (const key in goal) {
        const d = goal[key] - cur[key]
        if (Math.abs(d) < 0.2) cur[key] = goal[key]
        else { cur[key] += d * k; moving = true }
      }
      el.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`
      el.style.width = `${cur.w}px`; el.style.height = `${cur.h}px`
      raf = moving ? requestAnimationFrame(tick) : 0
    }
    const kick = () => { if (aim() && !raf) raf = requestAnimationFrame(tick) }

    const over = (e) => {
      const hit = e.target.closest?.(SEL)
      const t = hit && !hit.closest(SKIP) ? hit : null
      if (t === target) return
      const fresh = !target // coming from empty space: appear on the part, no glide from the last one
      target = t
      if (!t) { el.classList.remove('on'); return }
      const br = parseFloat(getComputedStyle(t).borderTopLeftRadius) || 4
      el.style.borderRadius = `${br + PAD}px`
      aim()
      if (fresh) { Object.assign(cur, goal); tick() } else kick()
      el.classList.add('on')
    }
    const press = (on) => () => el.classList.toggle('press', on)
    const down = press(true), up = press(false)
    const out = () => { target = null; el.classList.remove('on') }
    // a click that scrolls the page (or any scroll) drops the footprint instead of chasing the part
    const scrolled = () => { if (target) out() }
    document.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerdown', down, { passive: true })
    document.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('pointerleave', out)
    addEventListener('scroll', scrolled, { passive: true, capture: true })
    addEventListener('resize', kick)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', out)
      removeEventListener('scroll', scrolled, { capture: true })
      removeEventListener('resize', kick)
    }
  }, [])
  return <div className="probe" ref={ref} aria-hidden="true" />
}
