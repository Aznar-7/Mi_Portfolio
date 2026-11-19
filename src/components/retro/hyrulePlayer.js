import * as THREE from 'three'
import { bendBone } from './hyruleField'

// You in Hyrule: Link on foot or on Epona. WASD / arrows move (Shift walks), the on-screen stick does the same
// on touch, dragging turns the camera, E (or the prompt) does what the prompt says. The ground under you is
// found by a ray, and walls by a short ray ahead at knee height, so nothing needs a collision mesh.

const X = new THREE.Vector3(1, 0, 0)

// keys, the stick and the drag, read once a frame
export function makeControls(el) {
  const keys = new Set(), taps = new Set(), stick = { x: 0, y: 0 }
  const cam = { yaw: 0, pitch: 0.32, dragging: false, lastDrag: -1e9 }
  let down = null
  const onKey = (e) => {
    if (e.target.closest?.('input,textarea')) return
    if (e.type === 'keydown') { keys.add(e.code); if (!e.repeat) taps.add(e.code) } else keys.delete(e.code)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
  }
  const onDown = (e) => { if (!el.contains(e.target)) return; down = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: 0 } }
  const onMove = (e) => {
    if (!down || e.pointerId !== down.id) return
    const dx = e.clientX - down.x, dy = e.clientY - down.y
    down.x = e.clientX; down.y = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy)
    if (down.moved < 6) return
    cam.dragging = true; cam.lastDrag = performance.now()
    cam.yaw -= dx * 0.006; cam.pitch = Math.min(1.1, Math.max(0.05, cam.pitch + dy * 0.004))
  }
  const onUp = () => { setTimeout(() => { down = null }, 0); cam.dragging = false }
  const blur = () => keys.clear()
  addEventListener('keydown', onKey); addEventListener('keyup', onKey); addEventListener('blur', blur)
  addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp)
  return {
    keys, stick, cam,
    // a key pressed since the last time anyone asked (so a quick tap between two slow frames still counts)
    take: (...codes) => codes.some((c) => taps.delete(c)),
    // the wished direction in camera space: x right, y forward, m how hard (0..1)
    wish() {
      let x = stick.x, y = stick.y
      if (keys.has('KeyW') || keys.has('ArrowUp')) y += 1
      if (keys.has('KeyS') || keys.has('ArrowDown')) y -= 1
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1
      const m = Math.hypot(x, y)
      return m > 0.08 ? { x: x / Math.max(1, m), y: y / Math.max(1, m), m: Math.min(1, m), walk: keys.has('ShiftLeft') || keys.has('ShiftRight') } : null
    },
    // a click that was really the end of a drag should not pick anything
    wasDrag: () => !!down && down.moved >= 6,
    dispose() {
      removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('blur', blur)
      removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp)
    },
  }
}

// Link's legs and arms swing as he walks and runs (k 0..1 how fast), from the standing pose; returns the step bob
export function linkGait(hero) {
  const part = (n) => { const b = hero.getObjectByName(n); return b && { b, rest: b.quaternion.clone() } }
  const P = {
    tl: part('Thighl_0102'), tr: part('Thighr_0106'), cl: part('Calfl_0103'), cr: part('Calfr_0107'),
    al: part('Upperarml_058'), ar: part('Upperarmr_076'), sp: part('Spine_02_05'),
  }
  let phase = 0, amt = 0
  return (dt, k) => {
    amt += (k - amt) * Math.min(1, dt * 10) // eases in and out of a stride instead of snapping
    phase += dt * (6 + 5 * amt)
    const s = Math.sin(phase), a = (0.35 + 0.45 * amt) * Math.min(1, amt * 4)
    const bend = (p, ang) => p && bendBone(hero, p.b, p.rest, X, ang)
    bend(P.tl, -s * a); bend(P.tr, s * a)
    bend(P.cl, Math.max(0, s) * a * 1.5); bend(P.cr, Math.max(0, -s) * a * 1.5)
    bend(P.al, s * a * 0.7); bend(P.ar, -s * a * 0.7)
    bend(P.sp, -0.14 * amt)
    return Math.abs(Math.cos(phase)) * 0.04 * amt
  }
}

// moving a body over the ground: a ray down for the floor, one ahead at knee height for walls; it slides along
// what it hits instead of stopping dead
export function makeMover(solids) {
  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0), o = new THREE.Vector3(), d = new THREE.Vector3()
  const solid = (i) => !(i.object.material?.alphaTest > 0) && i.object.visible
  const floor = (x, z, fromY) => {
    ray.set(o.set(x, fromY, z), down); ray.far = 80
    const h = ray.intersectObjects(solids, true).find(solid); return h ? h.point.y : null
  }
  const wall = (p, dir, dist, knee) => {
    ray.set(o.set(p.x, p.y + knee, p.z), d.copy(dir)); ray.far = dist
    return ray.intersectObjects(solids, true).some((i) => solid(i) && Math.abs(i.face?.normal.y ?? 0) < 0.7)
  }
  const tryStep = (pos, dx, dz, reach, knee, maxRise) => {
    const len = Math.hypot(dx, dz); if (len < 1e-5) return false
    if (wall(pos, d.set(dx / len, 0, dz / len), len + reach, knee)) return false
    const y = floor(pos.x + dx, pos.z + dz, pos.y + maxRise + 0.6)
    if (y === null || y - pos.y > maxRise) return false
    pos.x += dx; pos.z += dz; pos.y = y
    return true
  }
  // how far you can see from a point toward another before something solid is in the way
  const clear = (from, to) => {
    d.subVectors(to, from); const len = d.length(); d.divideScalar(len)
    ray.set(from, d); ray.far = len
    const h = ray.intersectObjects(solids, true).find(solid)
    return h ? h.distance : len
  }
  return {
    floor, clear,
    move(pos, dx, dz, { reach = 0.25, knee = 0.4, maxRise = 0.5 } = {}) {
      return tryStep(pos, dx, dz, reach, knee, maxRise) || tryStep(pos, dx, 0, reach, knee, maxRise) || tryStep(pos, 0, dz, reach, knee, maxRise)
    },
    settle(pos, from = 3) { const y = floor(pos.x, pos.z, pos.y + from); if (y !== null) pos.y = y; return y !== null },
  }
}

// the camera: behind and above whoever you are, turned by dragging, drifting back behind you as you move
export function followCamera(camera, cam, mover) {
  const at = new THREE.Vector3(), want = new THREE.Vector3()
  return (target, heading, moving, dist, height, dt, snap = false) => {
    if (moving && !cam.dragging && performance.now() - cam.lastDrag > 1500) cam.yaw = yawTo(cam.yaw, heading + Math.PI, Math.min(1, dt * 1.5))
    at.set(target.x, target.y + height, target.z)
    want.set(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch)).multiplyScalar(dist).add(at)
    // pull in when a wall or a hill is between you and the camera
    const free = mover.clear(at, want), full = at.distanceTo(want)
    if (free < full) want.lerpVectors(at, want, Math.max(0.15, (free - 0.3) / full))
    const g = mover.floor(want.x, want.z, want.y + 6)
    if (g !== null && want.y < g + 0.4) want.y = g + 0.4
    if (snap) camera.position.copy(want); else camera.position.lerp(want, 1 - Math.exp(-dt * 9))
    camera.lookAt(at)
  }
}

export const yawTo = (from, to, k) => from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * k
