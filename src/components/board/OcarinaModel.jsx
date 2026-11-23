import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// The Ocarina of Time turning slowly in the light, for the moment you get it.
// Model: "Zelda Ocarina of Time - Ocarina of Time" by marvelmaster, CC BY via Sketchfab
// (textures cut to 1024 px for the web; credited in the Hyrule scene).
// mode 'get': it rises into the light and turns. mode 'play': held at an angle, a pulse on every note
// parsed once per visit: taking the ocarina out again reuses it instead of fetching and parsing 4.6 MB anew
let model
const loadModel = () => (model ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/models/hyrule/ocarina.glb').catch((e) => { model = null; throw e }))

export default function OcarinaModel({ mode = 'get' }) {
  const host = useRef(null)
  useEffect(() => {
    const el = host.current
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.append(renderer.domElement)
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    const key = new THREE.DirectionalLight(0xfff2d6, 2.2); key.position.set(2, 3, 4); scene.add(key)
    const rim = new THREE.DirectionalLight(0x9cc8ff, 1.6); rim.position.set(-3, 1, -3); scene.add(rim)
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
    camera.position.set(0, 0.15, 4)
    const pivot = new THREE.Group(); scene.add(pivot)

    let raf = 0, dead = false, base = 1
    loadModel().then((gltf) => {
      if (dead) return
      const m = gltf.scene.clone()
      // centre it and fit it to about two units, whatever the author's scale was
      const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3())
      m.position.sub(box.getCenter(new THREE.Vector3()))
      base = 2.1 / Math.max(size.x, size.y, size.z)
      pivot.scale.setScalar(base)
      pivot.rotation.x = 0.35
      pivot.add(m)
    }).catch(() => {}) // no model: the ocarina still plays, just without the 3D piece
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(fit); ro.observe(el); fit()
    const t0 = performance.now()
    let pulse = 0
    const onNote = () => { pulse = 1 }
    document.addEventListener('ocarina:note', onNote)
    const frame = (now) => {
      const t = (now - t0) / 1000
      if (mode === 'play') {
        pulse *= 0.9
        pivot.position.y = reduced ? 0 : Math.sin(t * 1.4) * 0.05 - 0.4 * Math.max(0, 1 - t / 0.6) ** 3
        pivot.rotation.set(0.5 + pulse * 0.08, reduced ? 0.9 : 0.9 + Math.sin(t * 0.5) * 0.25, -0.15)
        pivot.scale.setScalar(base * (1 + pulse * 0.06))
      } else {
        // it rises into the light, then turns
        pivot.position.y = reduced ? 0 : -0.6 * Math.max(0, 1 - t / 1.2) ** 3
        pivot.rotation.y = reduced ? 0.6 : t * 0.9
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('ocarina:note', onNote)
      // the model stays cached for the next time; dropping the context frees its GPU copy
      scene.environment?.dispose(); pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    }
  }, [mode])
  return <div className="oc-model" ref={host} aria-hidden="true" />
}
