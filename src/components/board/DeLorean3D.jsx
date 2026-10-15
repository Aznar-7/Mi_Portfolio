import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// The 88 mph run: the DeLorean comes out of the dark accelerating, swings toward the camera and
// is gone at the flash (about 2.7 s, when the speedo hits 88). Lazy-loaded with the scene.
// Model: "DeLorean DMC-12" by David Sirera, CC BY 3.0 via Poly Pizza (credited by the scene).

const JUMP = 2.7 // seconds, matches the speedo in EggStage
// the model already faces +Z, which lookAt aims, so the nose leads the run as is
const NOSE = 0

export default function DeLorean3D({ start }) {
  const host = useRef(null)
  useEffect(() => {
    const el = host.current
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.append(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(0, 1.6, 11)
    camera.lookAt(0, -0.4, 0)
    scene.add(new THREE.AmbientLight(0xcfd8ff, 0.9))
    const key = new THREE.DirectionalLight(0xfff0d8, 2.4); key.position.set(-5, 6, 6); scene.add(key)
    const glow = new THREE.PointLight(0x7cc6ff, 0, 8) // the time circuits charging, blue on the body
    scene.add(glow)

    const size = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix() }
    size(); addEventListener('resize', size)

    let car = null, disposed = false
    new GLTFLoader().load('/models/delorean.glb', (g) => {
      if (disposed) return
      const model = g.scene
      const box = new THREE.Box3().setFromObject(model), s = box.getSize(new THREE.Vector3())
      model.scale.setScalar(4.4 / Math.max(s.x, s.y, s.z))
      model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()))
      model.rotation.y = NOSE
      car = new THREE.Group(); car.add(model); scene.add(car)
    })

    // a curve from far back left, sweeping across and toward the camera
    const pathAt = (k) => new THREE.Vector3(-7 + k * 9, -2.3, -8 + k * 12 - Math.sin(k * Math.PI) * 2) // low, so it passes under the speedo
    // share the speedo's clock, so a slow model load never puts the car behind the numbers
    const t0 = start ?? performance.now()
    let raf
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const t = (performance.now() - t0) / 1000
      if (car) {
        const k = Math.min(1, (t / JUMP) ** 1.6) // accelerating
        car.visible = t < JUMP
        car.position.copy(pathAt(k))
        car.lookAt(pathAt(Math.min(1, k + 0.02)))
        car.position.y += Math.sin(t * 40) * 0.01 * k // a little road shake at speed
        glow.position.copy(car.position).add(new THREE.Vector3(0, 1.2, 0))
        glow.intensity = k * 18 * (0.7 + Math.random() * 0.3)
      }
      renderer.render(scene, camera)
      if (t > JUMP + 0.5) cancelAnimationFrame(raf)
    }
    frame()
    return () => {
      disposed = true
      cancelAnimationFrame(raf); removeEventListener('resize', size)
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose() }) })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [start])
  return <div className="delorean3d" ref={host} aria-hidden="true" />
}
