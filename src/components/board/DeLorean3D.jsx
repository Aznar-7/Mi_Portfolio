import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// the model's nose is +Z (front wheels and the DMC badge sit there), so driving toward the camera
// needs no turn

// The 88 mph run, at road level: the DeLorean comes head-on out of the fog, headlights on, the lane
// marks rushing faster as it accelerates. Past ~50 mph blue arcs crawl over the body; at 88 it is
// gone and two fire trails burn on the asphalt. Lazy-loaded with the scene, on the speedo's clock.
// Model: "DeLorean DMC-12" by David Sirera, CC BY 3.0 via Poly Pizza (credited by the scene).

const JUMP = 2.7 // seconds, when the speedo hits 88
const FAR = -70, NEAR = -9 // where the car starts and where it vanishes, along the road

// a soft flame strip, drawn once to a canvas: white-hot core to orange to nothing
function flameTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 32, height: 256 })
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.15, 'rgba(255,190,80,.95)'); g.addColorStop(0.6, 'rgba(255,90,20,.6)'); g.addColorStop(1, 'rgba(255,60,0,0)')
  x.fillStyle = g; x.fillRect(0, 0, 32, 256)
  const side = x.createLinearGradient(0, 0, 32, 0)
  side.addColorStop(0, 'rgba(0,0,0,1)'); side.addColorStop(0.5, 'rgba(0,0,0,0)'); side.addColorStop(1, 'rgba(0,0,0,1)')
  x.globalCompositeOperation = 'destination-out'; x.fillStyle = side; x.fillRect(0, 0, 32, 256)
  return new THREE.CanvasTexture(c)
}

// a jagged arc between two points, for the electricity on the body
function arcPoints(a, b, n = 9, jitter = 0.35) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const p = a.clone().lerp(b, i / n)
    if (i && i < n) p.add(new THREE.Vector3((Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter))
    pts.push(p)
  }
  return pts
}

export default function DeLorean3D({ start }) {
  const host = useRef(null)
  useEffect(() => {
    const el = host.current
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.append(renderer.domElement)
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x07080b, 18, 70)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)
    camera.position.set(0, 1.35, 4)
    camera.lookAt(0, 0.5, -30)
    scene.add(new THREE.HemisphereLight(0xaab8ff, 0x0b0c10, 0.9))
    const moon = new THREE.DirectionalLight(0xdfe6ff, 1.4); moon.position.set(-6, 10, 4); scene.add(moon)

    const size = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix() }
    size(); addEventListener('resize', size)

    // the road: asphalt, two edge lines and a dashed centre line that streams toward the camera
    const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 220), new THREE.MeshStandardMaterial({ color: 0x0f1014, roughness: 0.95 }))
    road.rotation.x = -Math.PI / 2; road.position.z = -90; scene.add(road)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xd8d2b8 })
    for (const x of [-4.2, 4.2]) {
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 220), lineMat)
      edge.rotation.x = -Math.PI / 2; edge.position.set(x, 0.01, -90); scene.add(edge)
    }
    const dashGeo = new THREE.PlaneGeometry(0.12, 2.2)
    const dashes = Array.from({ length: 24 }, (_, i) => {
      const d = new THREE.Mesh(dashGeo, lineMat)
      d.rotation.x = -Math.PI / 2; d.position.set(0, 0.012, -i * 6); scene.add(d)
      return d
    })

    // the car, its headlights and the light they throw on the road
    let car = null, disposed = false
    const beam = new THREE.SpotLight(0xfff2d0, 0, 40, 0.5, 0.6, 1.2)
    scene.add(beam); scene.add(beam.target)
    const lamps = new THREE.Group()
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff6dc })
    for (const x of [-0.62, 0.62]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampMat); l.position.set(x, 0.55, 2.05); lamps.add(l) }
    new GLTFLoader().load('/models/delorean.glb', (g) => {
      if (disposed) return
      const model = g.scene
      const s = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3())
      model.scale.setScalar(4.2 / Math.max(s.x, s.y, s.z))
      const box = new THREE.Box3().setFromObject(model)
      model.position.sub(box.getCenter(new THREE.Vector3())); model.position.y += (box.max.y - box.min.y) / 2 // wheels on the road
      car = new THREE.Group(); car.add(model); car.add(lamps); car.position.z = FAR; scene.add(car)
    })

    // electricity over the body
    const arcMat = new THREE.LineBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })
    const arcs = Array.from({ length: 4 }, () => { const ln = new THREE.Line(new THREE.BufferGeometry(), arcMat); ln.visible = false; scene.add(ln); return ln })
    const zap = new THREE.PointLight(0x7cc6ff, 0, 6); scene.add(zap)

    // the fire trails left behind
    const flameMat = new THREE.MeshBasicMaterial({ map: flameTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    const trails = [-0.75, 0.75].map((x) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), flameMat)
      m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, NEAR); m.visible = false; scene.add(m)
      return m
    })

    const t0 = start ?? performance.now() // the speedo's clock, so a slow load never lags the numbers
    let raf, last = 0, lastZap = 0
    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const t = (performance.now() - t0) / 1000, dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now
      const k = Math.min(1, t / JUMP), speed = k * k // 0..1, rising like the speedo
      // the lane marks rush past faster and faster
      for (const d of dashes) { d.position.z += dt * (6 + speed * 70); if (d.position.z > 6) d.position.z -= 24 * 6 }
      if (car) {
        const gone = t >= JUMP
        car.visible = !gone
        car.position.z = FAR + (NEAR - FAR) * Math.pow(k, 2.2)
        car.position.y = Math.sin(t * 38) * 0.012 * speed // a little road shake at speed
        beam.intensity = gone ? 0 : 60
        beam.position.set(0, 0.8, car.position.z + 2.2); beam.target.position.set(0, 0, car.position.z + 14)
        // arcs past ~50 mph, re-drawn a few times a second
        const charged = !gone && speed > 0.32
        if (charged && now - lastZap > 70) {
          lastZap = now
          const c = car.position
          for (const ln of arcs) {
            const a = new THREE.Vector3(c.x + (Math.random() - 0.5) * 2.2, c.y + 0.3 + Math.random() * 0.9, c.z + (Math.random() - 0.5) * 3.6)
            const b = new THREE.Vector3(c.x + (Math.random() - 0.5) * 2.2, c.y + 0.2 + Math.random() * 1.1, c.z + (Math.random() - 0.5) * 3.6)
            ln.geometry.dispose(); ln.geometry = new THREE.BufferGeometry().setFromPoints(arcPoints(a, b))
            ln.visible = Math.random() < 0.85
          }
        }
        if (!charged) for (const ln of arcs) ln.visible = false
        zap.position.copy(car.position).add(new THREE.Vector3(0, 1.2, 0))
        zap.intensity = charged ? 8 + Math.random() * 10 : 0
        // after the jump: the trails stretch back from where it vanished and burn down
        for (const tr of trails) {
          tr.visible = gone
          if (gone) {
            const age = t - JUMP, len = Math.min(26, 6 + age * 60)
            tr.scale.y = len; tr.position.z = NEAR - len / 2
            tr.material.opacity = Math.max(0, 1 - age / 2.6) * (0.75 + Math.random() * 0.25)
          }
        }
      }
      renderer.render(scene, camera)
      if (t > JUMP + 3) cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      disposed = true
      cancelAnimationFrame(raf); removeEventListener('resize', size)
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose() }) })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [start])
  return <div className="delorean3d" ref={host} aria-hidden="true" />
}
