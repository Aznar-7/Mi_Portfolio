import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Order 66 as a transmission: a projector on the board opens a cone of light and a TIE fighter forms
// in it as a hologram while the order is typed below. At 3 s the signal cuts to a line and dies,
// the room goes red and blaster bolts tear past the camera. Lazy-loaded with the scene.
// Model: "Tie Fighter 1 V1" by Joe Scalise, CC BY 3.0 via Poly Pizza (credited by the scene).

const CUT = 3.0, CUT_LEN = 0.35, FIRE = 3.4, CEASE = 7.6, END = 9.2
const BLUE = new THREE.Color(0x7cc6ff), RED = new THREE.Color(0xff3a2a)

const holoVert = /* glsl */`
  uniform float uTime, uGlitch;
  varying vec3 vN, vView; varying float vY;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    // a few horizontal bands slip sideways when the signal glitches
    float band = step(0.82, fract(sin(floor(wp.y * 9.0) * 43.1 + floor(uTime * 12.0)) * 9.7));
    wp.x += band * uGlitch * 0.12;
    vY = wp.y;
    vec4 mv = viewMatrix * wp;
    vView = -mv.xyz; vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }`
const holoFrag = /* glsl */`
  uniform float uTime, uOn, uFlicker; uniform vec3 uColor;
  varying vec3 vN, vView; varying float vY;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 2.2);
    float scan = 0.55 + 0.45 * sin(vY * 140.0 - uTime * 9.0);
    float sweep = smoothstep(0.0, 0.06, fract(vY * 0.7 - uTime * 0.45)) * (1.0 - smoothstep(0.06, 0.12, fract(vY * 0.7 - uTime * 0.45)));
    float a = (0.12 + rim * 0.95 + sweep * 0.6) * scan * uOn * uFlicker;
    gl_FragColor = vec4(uColor * (0.7 + rim), a);
  }`
// the projector's light: brightest at the lens, fading up and toward the middle
const coneFrag = /* glsl */`
  uniform float uOn, uTime; uniform vec3 uColor; varying vec2 vUv;
  void main() {
    float up = 1.0 - vUv.y;
    float streak = 0.75 + 0.25 * sin(vUv.x * 60.0 + uTime * 2.0);
    gl_FragColor = vec4(uColor, pow(up, 1.6) * 0.32 * streak * uOn);
  }`

function glowTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 })
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,120,90,.9)'); g.addColorStop(1, 'rgba(255,40,20,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

export default function Order66_3D() {
  const host = useRef(null)
  useEffect(() => {
    const el = host.current
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75))
    el.append(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 1.6, 6.2); camera.lookAt(0, 1.3, 0)
    const size = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix() }
    size(); addEventListener('resize', size)

    const uni = { uTime: { value: 0 }, uOn: { value: 0 }, uFlicker: { value: 1 }, uGlitch: { value: 0 }, uColor: { value: BLUE.clone() } }
    const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }

    // the emitter: a dark puck with a lit ring, sitting on the board
    const rig = new THREE.Group(); scene.add(rig)
    const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.08, 48), new THREE.MeshBasicMaterial({ color: 0x0b0d12, transparent: true }))
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 8, 64), new THREE.MeshBasicMaterial({ color: BLUE, ...add }))
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.045
    rig.add(puck, ring)
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 0.3, 2.7, 48, 1, true),
      new THREE.ShaderMaterial({ uniforms: uni, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: coneFrag, ...add }))
    cone.position.y = 1.39; rig.add(cone)
    const holoMat = new THREE.ShaderMaterial({ uniforms: uni, vertexShader: holoVert, fragmentShader: holoFrag, ...add })
    let holo = null, disposed = false
    new GLTFLoader().load('/models/tie-fighter.glb', (g) => {
      if (disposed) return
      const m = g.scene
      m.traverse((o) => { if (o.isMesh) o.material = holoMat })
      const s = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3())
      m.scale.setScalar(1.7 / Math.max(s.x, s.y, s.z))
      m.position.sub(new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()))
      holo = new THREE.Group(); holo.add(m); holo.position.y = 1.55; holo.rotation.x = 0.18
      rig.add(holo)
    })
    // the cut: the picture collapses into one bright line
    const line = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.02), new THREE.MeshBasicMaterial({ color: 0xffffff, ...add, opacity: 0 }))
    line.position.y = 1.5; scene.add(line)

    // blaster fire: red bolts from deep in the room past the camera, a flash where some land
    const glow = glowTexture()
    // a white-hot core wrapped in a row of camera-facing glows: soft from any angle, no post pass
    const core = new THREE.CylinderGeometry(0.014, 0.014, 2.4, 6).rotateX(Math.PI / 2)
    const glowMat = new THREE.SpriteMaterial({ map: glow, color: RED, ...add, opacity: 0.55 })
    const bolts = Array.from({ length: 18 }, (_, i) => {
      const b = new THREE.Group()
      b.add(new THREE.Mesh(core, new THREE.MeshBasicMaterial({ color: 0xfff0ec })))
      for (let k = 0; k < 7; k++) {
        const g = new THREE.Sprite(glowMat); g.position.z = -1.2 + k * 0.4; g.scale.setScalar(0.42 - Math.abs(k - 3) * 0.05); b.add(g)
      }
      b.visible = false; scene.add(b)
      const from = new THREE.Vector3((Math.random() - 0.5) * 14, Math.random() * 4 - 0.5, -32)
      // they pass beside the lens, never through it
      const side = i % 2 ? 1 : -1, to = new THREE.Vector3(side * (1.6 + Math.random() * 3), 0.4 + Math.random() * 2.4, 7)
      return { b, from, to, at: FIRE + (i / 18) * (CEASE - FIRE) + Math.random() * 0.15, hit: i % 3 === 0 }
    })
    const hits = bolts.filter((x) => x.hit)
    const flashes = hits.map(() => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, ...add, opacity: 0 }))
      s.position.set((Math.random() - 0.5) * 6, 0.3 + Math.random() * 2.6, -4 - Math.random() * 6); scene.add(s)
      return s
    })

    const t0 = performance.now(), dir = new THREE.Vector3()
    let raf
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const t = (performance.now() - t0) / 1000
      uni.uTime.value = t
      // power up, hold with a flicker, then the cut
      const on = Math.min(1, t / 0.6) * (t < CUT ? 1 : Math.max(0, 1 - (t - CUT) / CUT_LEN))
      uni.uOn.value = on
      uni.uFlicker.value = 0.85 + 0.15 * Math.sin(t * 47) * Math.sin(t * 13)
      uni.uGlitch.value = t > 1.2 && Math.sin(t * 3.1) > 0.94 ? 1 : t > CUT - 0.5 && t < CUT ? 1 : 0
      ring.material.opacity = on
      puck.material.opacity = t < CUT ? 1 : Math.max(0, 1 - (t - CUT) / 0.8)
      if (holo) { holo.rotation.y = t * 0.45; holo.scale.y = t < CUT ? 1 : Math.max(0.001, 1 - (t - CUT) / CUT_LEN) }
      cone.scale.y = t < CUT ? 1 : Math.max(0.001, 1 - (t - CUT) / CUT_LEN)
      const k = (t - CUT) / CUT_LEN
      line.material.opacity = k > 0 && k < 1.6 ? Math.sin(Math.min(1, k / 1.6) * Math.PI) : 0
      line.scale.x = k > 1 ? Math.max(0.001, 1 - (k - 1) / 0.6) : 1
      // the room goes red with the order
      if (t > CUT) { uni.uColor.value.copy(BLUE).lerp(RED, Math.min(1, (t - CUT) / 0.4)); ring.material.color.copy(uni.uColor.value) }
      // bolts: 0.55 s from the far wall to past the lens
      let shake = 0
      bolts.forEach((x) => {
        const p = (t - x.at) / 0.55
        x.b.visible = p > 0 && p < 1
        if (!x.b.visible) return
        x.b.position.lerpVectors(x.from, x.to, p)
        x.b.lookAt(dir.copy(x.to))
        if (x.b.position.z > 2) shake = Math.max(shake, 1 - Math.abs(x.b.position.z - 5) / 4)
      })
      flashes.forEach((s, i) => {
        const p = (t - hits[i].at - 0.3) / 0.35
        s.material.opacity = p > 0 && p < 1 ? 1 - p : 0
        s.scale.setScalar(0.4 + Math.max(0, p) * 2.2)
      })
      camera.position.x = (Math.random() - 0.5) * 0.06 * shake
      camera.position.y = 1.6 + (Math.random() - 0.5) * 0.05 * shake
      renderer.render(scene, camera)
      if (t > END) cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      disposed = true
      cancelAnimationFrame(raf); removeEventListener('resize', size)
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose() }) })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  return <div className="o66-3d" ref={host} aria-hidden="true" />
}
