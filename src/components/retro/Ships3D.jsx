import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// A dogfight across the star chart: an X-wing with a TIE on its tail, flying through every ~14 s.
// Loaded lazily with the galaxy (three.js never ships with the rest of the site).
// Models: "T-65 X-Wing Starfighter" by Ti Kawamoto and "Tie Fighter 1 V1" by Joe Scalise,
// both CC-BY 3.0 via Poly Pizza (credited on screen by the galaxy).

const LAP = 14 // seconds per pass, ships on screen for about the first half
// per-model turn so each nose leads the flight (both models already face +Z, which lookAt aims)
const NOSE = { xwing: 0, tie: 0 }

function fit(obj, size) {
  const box = new THREE.Box3().setFromObject(obj), s = box.getSize(new THREE.Vector3())
  obj.scale.setScalar(size / Math.max(s.x, s.y, s.z))
  const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3())
  obj.position.sub(c)
  const pivot = new THREE.Group(); pivot.add(obj)
  return pivot
}

export default function Ships3D({ active = true }) {
  const host = useRef(null), on = useRef(active)
  useEffect(() => { on.current = active }, [active])

  useEffect(() => {
    const el = host.current
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.append(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 14)
    scene.add(new THREE.AmbientLight(0xbfd4ff, 1.1))
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.2); sun.position.set(-4, 6, 8); scene.add(sun)
    const rim = new THREE.DirectionalLight(0x8fd3ff, 1.2); rim.position.set(6, -2, -6); scene.add(rim)

    const size = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
    }
    size(); addEventListener('resize', size)

    const ships = {}
    const lasers = []
    const laserGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6).rotateX(Math.PI / 2)
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x6dff7a })
    const loader = new GLTFLoader()
    let disposed = false
    for (const [id, file, s] of [['xwing', '/models/x-wing.glb', 1.6], ['tie', '/models/tie-fighter.glb', 1.15]]) {
      loader.load(file, (g) => {
        if (disposed) return
        const model = fit(g.scene, s)
        model.children[0].rotation.y = NOSE[id]
        const ship = new THREE.Group(); ship.add(model); ship.visible = false
        scene.add(ship); ships[id] = ship
      })
    }

    // the flight path: a wide, slightly climbing S across the view, coming toward the camera
    const pathAt = (k) => new THREE.Vector3(-11 + k * 22, -2.4 + Math.sin(k * Math.PI * 1.4) * 1.6 + k * 2.6, -3 + Math.sin(k * Math.PI) * 4)
    const clock = new THREE.Clock()
    let raf, lastShot = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!on.current || document.hidden) return
      const t = clock.getElapsedTime() % LAP, k = t / (LAP * 0.55)
      for (const [id, lag] of [['xwing', 0], ['tie', 0.09]]) {
        const ship = ships[id]; if (!ship) continue
        const kk = k - lag
        ship.visible = kk > 0 && kk < 1
        if (!ship.visible) continue
        const p = pathAt(kk), ahead = pathAt(kk + 0.01)
        ship.position.copy(p)
        ship.lookAt(ahead)
        ship.rotateZ(Math.sin(kk * Math.PI * 2.8) * 0.5) // bank through the turns
      }
      // the TIE fires short bursts while both are on screen
      const tie = ships.tie
      if (tie?.visible && ships.xwing?.visible && t - lastShot > 0.35) {
        lastShot = t
        const bolt = new THREE.Mesh(laserGeo, laserMat)
        bolt.position.copy(tie.position); bolt.quaternion.copy(tie.quaternion)
        bolt.userData.v = new THREE.Vector3(0, 0, 1).applyQuaternion(tie.quaternion).multiplyScalar(0.55)
        bolt.userData.life = 40
        scene.add(bolt); lasers.push(bolt)
      }
      for (let i = lasers.length - 1; i >= 0; i--) {
        const b = lasers[i]; b.position.add(b.userData.v)
        if (--b.userData.life <= 0) { scene.remove(b); lasers.splice(i, 1) }
      }
      if (t < 0.05) lastShot = 0
      renderer.render(scene, camera)
    }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) frame()

    return () => {
      disposed = true
      cancelAnimationFrame(raf); removeEventListener('resize', size)
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose() }) })
      laserGeo.dispose(); laserMat.dispose()
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  return <div className="gx-ships3d" ref={host} aria-hidden="true" />
}
