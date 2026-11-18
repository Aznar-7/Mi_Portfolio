import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { playWarp, playEpona, playGallop, playMusic, fadeOut, setMusicVolume, playSecret } from '@/lib/ocarina'
import { projects } from '@/data/projects'
import { about } from '@/data/about'
import { l } from '@/lib/utils'
import { buildField, CAM_FROM, CAM_TO } from './hyruleField'
import { buildArea } from './hyruleAreas'
import { experience } from '@/data/experience'
import { site } from '@/data/site'

// The Song of Time opens the Temple of Time. Hold to draw the Master Sword, the world goes white, and
// seven years later Hyrule Field lies at dusk. From there it is a small game: ride Epona, or travel to
// the castle (the projects hang as banners), Death Mountain (the stack, carved in stone) or Lon Lon Ranch
// (who I am), each with its own look; the portfolio is told by the places, and Esc brings you back.
// Models (CC BY via Sketchfab): Temple of Time (Twilight Princess) by Bornstellar Makes Eternallasting,
// Master Sword by arnaud.sgz, Hyrule Field (OoT 3D) by Dola, Epona by The WarVet. Music and sounds: the game's.

const T = {
  es: {
    temple: 'Templo del Tiempo', hold: 'Mantené apretado para sacar la Espada Maestra', later: 'Siete años después…', field: 'Campo de Hyrule',
    back: 'Volver al portfolio', toField: 'Volver al campo', loading: 'Abriendo la Puerta del Tiempo…', ride: 'Montar a Epona', riding: 'Al galope…', music: 'Música', next: 'Seguir',
    credit: 'Modelos CC BY: Templo del Tiempo · Bornstellar · Espada Maestra · arnaud.sgz · Campo de Hyrule · Dola · Epona · The WarVet. Música y sonidos: Nintendo.',
    places: { kakariko: ['Aldea Kakariko', 'Proyectos'], kokiri: ['Bosque Kokiri', 'Sobre mí'], mountain: ['Montaña de la Muerte', 'Stack'], ranch: ['Rancho Lon Lon', 'Experiencia'], castle: ['Castillo de Hyrule', 'Contacto'] },
    intro: { kakariko: 'Cada estandarte es un proyecto. Tocá uno para ver qué es y cómo está hecho.', mountain: 'Los gorons tallan en piedra lo que dominan. Tocá una tabla para ver dónde usé cada herramienta.', kokiri: 'Tocá el cartel para volver a leer quién soy.', ranch: 'Tocá el cartel para ver cada trabajo.', castle: '' },
    map: 'Mapa', mapTitle: '¿A dónde vamos?', contact: 'Escribile al rey', contactText: 'Si tenés algo para construir, la puerta del castillo está abierta. Respondo en menos de 24 horas.', cv: 'CV', linkedin: 'LinkedIn',
    live: 'Ver en vivo', code: 'Código', usedIn: 'Lo usé en', noUse: 'Todavía sin un proyecto público que lo muestre.', go: 'Ir a',
  },
  en: {
    temple: 'Temple of Time', hold: 'Hold to draw the Master Sword', later: 'Seven years later…', field: 'Hyrule Field',
    back: 'Back to the portfolio', toField: 'Back to the field', loading: 'Opening the Door of Time…', ride: 'Ride Epona', riding: 'Galloping…', music: 'Music', next: 'Next',
    credit: 'Models CC BY: Temple of Time · Bornstellar · Master Sword · arnaud.sgz · Hyrule Field · Dola · Epona · The WarVet. Music and sounds: Nintendo.',
    places: { kakariko: ['Kakariko Village', 'Projects'], kokiri: ['Kokiri Forest', 'About me'], mountain: ['Death Mountain', 'Stack'], ranch: ['Lon Lon Ranch', 'Experience'], castle: ['Hyrule Castle', 'Contact'] },
    intro: { kakariko: 'Every banner is a project. Pick one to see what it is and how it was built.', mountain: 'Gorons carve what they master into stone. Pick a tablet to see where I used each tool.', kokiri: 'Pick the sign to read who I am again.', ranch: 'Pick the sign to see each job.', castle: '' },
    map: 'Map', mapTitle: 'Where to?', contact: 'Write to the king', contactText: 'If you have something to build, the castle gate is open. I reply within 24 hours.', cv: 'CV', linkedin: 'LinkedIn',
    live: 'See it live', code: 'Code', usedIn: 'Used in', noUse: 'No public project shows it yet.', go: 'Go to',
  },
}

const PEDESTAL = new THREE.Vector3(0, 1.67, -5.375) // measured on the temple model
// where each landmark's label floats, in field units (x, z, height above the ground)
const MARKS = { castle: [-0.03, -20, 7], ranch: [-32.1, 66.1, 4], mountain: [115.6, -34, 6] }
const AREAS = ['kakariko', 'kokiri'] // places you walk into (their own scene and music)
const JOBS = experience.filter((e) => e.type === 'work')
// what each place says the moment you arrive
const GREET = { kokiri: 'about', ranch: 'experience', castle: 'contact' }
const TITLE = Object.fromEntries(projects.map((p) => [p.id, p.title]).concat([['porta', 'Porta Hnos']]))

const load = (url) => new Promise((ok, fail) => new GLTFLoader().load(url, ok, undefined, fail))

// a soft round glow for Navi, the dust, the embers, drawn once
function glowTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 }), x = c.getContext('2d')
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(200,230,255,.9)'); g.addColorStop(1, 'rgba(120,180,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

const links = (p) => [].concat(p.githubUrl ?? []).map((g) => (typeof g === 'string' ? { url: g } : g))

export function Hyrule({ lang, onExit, leaving }) {
  const t = T[lang] ?? T.es
  const host = useRef(null)
  const [phase, setPhase] = useState('loading') // loading | temple | pulled | later | field
  const [hold, setHold] = useState(0)
  const [place, setPlace] = useState(null) // where the camera is (or is going): castle | mountain | ranch
  const [arrived, setArrived] = useState(false)
  const [dialog, setDialog] = useState(null) // { kind: project | stack | about, data }
  const [page, setPage] = useState(0) // the bio, one paragraph at a time
  const [riding, setRiding] = useState(false)
  const [quiet, setQuiet] = useState(false)
  const api = useRef({}), labels = useRef({}), muted = useRef(false)

  const toggleMusic = () => { muted.current = !muted.current; setQuiet(muted.current); setMusicVolume(muted.current ? 0 : phase === 'field' ? 0.7 : 0.55) }
  // moving between areas works like the game: the screen goes black, you are there, the area name shows
  const [curtain, setCurtain] = useState(false)
  const through = (fn) => { setCurtain(true); setTimeout(() => { fn(); setTimeout(() => setCurtain(false), 120) }, 550) }
  const [map, setMap] = useState(false)
  const arrive = (id) => { setArrived(true); if (GREET[id]) { setPage(0); setDialog({ kind: GREET[id] }) } }
  const go = (id) => {
    setMap(false); setDialog(null); setArrived(false)
    const enter = () => { setPlace(id); (AREAS.includes(id) ? api.current.enterArea : api.current.goPlace)?.(id, () => arrive(id)) }
    // from one place to another: back out to the field first, all behind the same curtain
    through(() => (place ? api.current.leave?.(enter) : enter()))
  }
  const leavePlace = () => { setMap(false); setDialog(null); setArrived(false); through(() => api.current.leave?.(() => setPlace(null))) }

  useEffect(() => {
    const el = host.current
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.append(renderer.domElement)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 6000)
    const glow = glowTexture()
    let dead = false, raf = 0, scene = null, composer = null, tick = () => {}
    const disposeScene = (s) => s?.traverse((o) => {
      o.geometry?.dispose()
      ;[].concat(o.material ?? []).forEach((m) => { Object.values(m).forEach((v) => v?.isTexture && v !== glow && v.dispose()); m.dispose() })
    })
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false); composer?.setSize(w, h)
      camera.aspect = w / h; camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(fit); ro.observe(el)
    // the pointer turns the head a little, wherever it is
    const look = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e) => { look.tx = (e.clientX / innerWidth - 0.5) * 2; look.ty = (e.clientY / innerHeight - 0.5) * 2 }
    addEventListener('pointermove', onMove)

    const field = load('/models/hyrule/field.glb'), epona = load('/models/hyrule/epona.glb') // fetched while the temple plays

    // ── the Temple of Time ──
    Promise.all([load('/models/hyrule/temple.glb'), load('/models/hyrule/sword.glb')]).then(([temple, swordGltf]) => {
      if (dead) return
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0d0b09)
      scene.fog = new THREE.Fog(0x15110c, 6, 26)
      // something for the blade to catch: a soft studio around it, too dim to show anywhere else
      const pm = new THREE.PMREMGenerator(renderer)
      scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose()
      scene.environmentIntensity = 0.25
      renderer.toneMappingExposure = 0.78
      scene.add(temple.scene)
      scene.add(new THREE.HemisphereLight(0xcdd8ff, 0x2a2016, 0.9))
      const key = new THREE.SpotLight(0xfff0d0, 60, 14, 0.42, 0.6, 1.4)
      key.position.set(0, 9, -5.4); key.target.position.copy(PEDESTAL); scene.add(key, key.target)
      const fill = new THREE.PointLight(0xffd7a0, 6, 12, 1.6); fill.position.set(0, 3, 0); scene.add(fill)

      // the Master Sword alone (the file also carries the shield and the scabbard), point down in the stone
      const sword = swordGltf.scene.getObjectByName('Sword_low_M_Sword2_0')
      sword.removeFromParent()
      const k = 1.15 / 332 // blade along local Y, 332 units hilt to tip
      sword.scale.setScalar(k); sword.rotation.set(0, 0.5, 0)
      sword.position.set(PEDESTAL.x, PEDESTAL.y - 0.32 + 170 * k, PEDESTAL.z)
      sword.traverse((o) => { if (o.material) { o.material.metalness = 0.85; o.material.roughness = 0.3 } })
      scene.add(sword)
      disposeScene(swordGltf.scene)

      // a shaft of light from the dome onto the pedestal, with dust turning in it
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.3, 7, 32, 1, true), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float edge = pow(abs(dot(vN, vV)), 2.); float fade = smoothstep(0., .35, vUv.y) * smoothstep(1., .55, vUv.y); gl_FragColor = vec4(vec3(1., .93, .78) * edge * fade * .22, 1.); }',
      }))
      shaft.position.set(PEDESTAL.x, PEDESTAL.y + 3.4, PEDESTAL.z); scene.add(shaft)
      const motes = new THREE.BufferGeometry(), N = 260, mp = new Float32Array(N * 3)
      for (let i = 0; i < N; i++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 1.1; mp.set([PEDESTAL.x + Math.cos(a) * r, PEDESTAL.y + Math.random() * 5, PEDESTAL.z + Math.sin(a) * r], i * 3) }
      motes.setAttribute('position', new THREE.BufferAttribute(mp, 3))
      const dust = new THREE.Points(motes, new THREE.PointsMaterial({ map: glow, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff1d0 }))
      scene.add(dust)

      composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.6, 0.82))
      composer.addPass(new OutputPass())
      fit()

      // past the Door of Time: a slow approach to the pedestal from the room's edge
      const from = new THREE.Vector3(1.4, 2.9, -2.3), to = new THREE.Vector3(0.7, 2.4, -3.2), aim = new THREE.Vector3(0, 2.05, -5.4)
      const t0 = performance.now()
      let pulled = 0 // 0..1 once the sword comes out
      api.current.pull = () => { pulled = 0.0001 }
      tick = (now) => {
        const s = reduced ? 1 : Math.min(1, (now - t0) / 7000), e = 1 - (1 - s) ** 3
        camera.position.lerpVectors(from, to, e)
        camera.lookAt(aim.x + look.x * 0.6, aim.y - look.y * 0.3, aim.z)
        dust.rotation.y += 0.0008
        if (pulled) {
          pulled = Math.min(1, pulled + 0.012)
          sword.position.y = PEDESTAL.y - 0.32 + 170 * k + Math.sin(pulled * Math.PI / 2) * 0.9
          sword.rotation.y += 0.02 * pulled
          key.intensity = 60 + pulled * 400
        }
      }
      api.current.music = playMusic('temple', { loop: true, volume: muted.current ? 0 : 0.55, fadeIn: 1500 })
      setPhase('temple')
    }).catch(() => !dead && onExit())

    // ── seven years later: Hyrule Field, and the places ──
    api.current.toField = () => Promise.all([field, epona]).then(([fieldGltf, eponaGltf]) => {
      if (dead) return
      disposeScene(scene)
      const F = buildField({ renderer, camera, fieldGltf, eponaGltf, glow, reduced, lang })
      scene = F.scene; composer = F.composer
      renderer.toneMappingExposure = 0.55
      fit()
      const { groundAt, fwd, horse, hb, hs, navi, naviLight, places, picks, animate } = F

      const marks = Object.entries(MARKS).map(([id, [x, z, up]]) => ({ id, p: new THREE.Vector3(x, (groundAt(x, z) ?? 0) + up, z) }))
      const proj = new THREE.Vector3(), lookAt = new THREE.Vector3(), seat = new THREE.Vector3(), ahead = new THREE.Vector3()
      const t0 = performance.now()
      let mode = 'free', ride = 0, rideT = 0, lastHoof = 0, speed = 0, travel = null, here = null

      // where the free camera is at any moment: a slow push across the field toward the castle
      const freeView = (s, pos, tgt) => {
        const k = reduced ? 0 : 1 - Math.exp(-s / 40)
        pos.copy(CAM_FROM).lerp(CAM_TO, k * 0.12)
        pos.y = (groundAt(pos.x, pos.z) ?? CAM_FROM.y - 1.2) + 1.2
        ahead.copy(CAM_TO).sub(pos).normalize()
        tgt.set(pos.x + ahead.x * 10, pos.y + 0.4, pos.z + ahead.z * 10)
      }
      // a flight with an arc over the field; fn when it lands
      const fly = (toPos, toLook, fn) => {
        // behind the curtain the move is instant; the camera only settles the last bit on screen
        travel = { fromPos: toPos.clone().addScaledVector(toLook.clone().sub(toPos).normalize(), -1.2), fromLook: toLook.clone(), toPos, toLook, t0: performance.now(), dur: reduced ? 1 : 1400, fn }
        mode = 'travel'
      }
      api.current.ride = () => { if (ride || mode !== 'free') return; ride = 1; rideT = performance.now(); mode = 'ride'; playEpona() }
      api.current.goPlace = (id, fn) => {
        const p = places[id]; here = p
        p.group.visible = true; p.group.userData.t0 = performance.now() + (reduced ? 0 : 500)
        p.group.children.forEach((c) => { if (!(c.isLight || c.isPoints || c.isSprite)) c.scale.setScalar(0.001) })
        fly(p.eye, p.look, () => { mode = 'at'; playSecret(); fn() })
      }
      api.current.back = (fn) => {
        const pos = new THREE.Vector3(), tgt = new THREE.Vector3()
        freeView((performance.now() - t0) / 1000, pos, tgt)
        const leaving = here; here = null
        fly(pos, tgt, () => { if (leaving) leaving.group.visible = false; mode = ride ? 'ride' : 'free'; fn() })
      }
      // what the pointer is over, among the things of the place you are at
      const caster = new THREE.Raycaster(), ndc = new THREE.Vector2()
      // ── the places you walk into: their own scene, light and music; the field waits in memory ──
      const fieldScene = scene, fieldComposer = composer, built = {}
      let area = null
      api.current.enterArea = (id, fn) => {
        built[id] ??= load(`/models/hyrule/${id}.glb`).then((gltf) => buildArea(id, { renderer, camera, gltf, glow, lang, reduced }))
        built[id].then((a) => {
          if (dead) return
          area = a; scene = a.scene; composer = a.composer; renderer.toneMappingExposure = a.exposure; fit()
          camera.position.copy(a.eye); lookAt.copy(a.look); mode = 'area'
          api.current.music = playMusic(a.music, { loop: true, volume: muted.current ? 0 : 0.7, fadeIn: 1200 })
          fn()
        })
      }
      // leaving whatever place you are at, back to the open field
      api.current.leave = (fn) => {
        if (mode === 'area') {
          area = null; scene = fieldScene; composer = fieldComposer; renderer.toneMappingExposure = 0.55; fit()
          mode = 'free'
          api.current.music = playMusic('field', { loop: true, volume: muted.current ? 0 : 0.7, fadeIn: 1200 })
          fn()
        } else api.current.back(fn)
      }
      api.current.pick = (cx, cy) => {
        if (mode !== 'at' && mode !== 'area') return null
        ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1); caster.setFromCamera(ndc, camera)
        const inHere = (m) => { for (let o = m; o; o = o.parent) if (o === here?.group) return true; return false }
        const hit = caster.intersectObjects(mode === 'area' ? area.picks : picks.filter(inHere), false)[0]
        return hit?.object.userData.pick ?? null
      }

      tick = (now) => {
        const s = (now - t0) / 1000
        if (mode === 'area') {
          // standing in the place: the pointer turns the head, wide like looking around
          const yaw = look.x * 0.55, dx = area.look.x - area.eye.x, dz = area.look.z - area.eye.z
          camera.position.copy(area.eye)
          camera.lookAt(area.eye.x + dx * Math.cos(yaw) - dz * Math.sin(yaw), area.look.y - look.y * 1.5, area.eye.z + dx * Math.sin(yaw) + dz * Math.cos(yaw))
          area.animate(s)
          return
        }
        if (mode === 'travel') {
          const k = Math.min(1, (now - travel.t0) / travel.dur), e = k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2
          camera.position.lerpVectors(travel.fromPos, travel.toPos, e)
          lookAt.lerpVectors(travel.fromLook, travel.toLook, e)
          camera.lookAt(lookAt)
          if (k === 1) { const fn = travel.fn; travel = null; fn() }
        } else if (mode === 'at') {
          lookAt.copy(here.look)
          camera.position.lerp(here.eye, 0.05)
          camera.lookAt(lookAt.x + look.x * 2.5, lookAt.y - look.y * 1.2, lookAt.z)
        } else if (mode === 'ride') {
          // Epona turns toward the castle and gallops along the strip, the camera behind her
          const rs = (now - rideT) / 1000
          speed = Math.min(7, speed + 0.12) * (rs > 11 ? 0.96 : 1)
          horse.position.x += fwd.x * speed / 60; horse.position.z += fwd.z * speed / 60
          const g = groundAt(horse.position.x, horse.position.z)
          if (g !== null) horse.position.y = g - hb.min.y * hs + Math.abs(Math.sin(rs * 9)) * 0.05 * (speed / 7)
          horse.rotation.y += (Math.atan2(fwd.x, fwd.z) - horse.rotation.y) * 0.06
          if (speed > 1 && now - lastHoof > 330 && rs > 1.2) { playGallop(); lastHoof = now }
          seat.copy(horse.position).addScaledVector(fwd, -3.4); seat.y += 1.9
          camera.position.lerp(seat, 0.08)
          lookAt.set(horse.position.x + fwd.x * 8, horse.position.y + 0.9, horse.position.z + fwd.z * 8)
          camera.lookAt(lookAt.x + look.x * 2, lookAt.y - look.y, lookAt.z)
        } else {
          freeView(s, camera.position, lookAt)
          camera.lookAt(lookAt.x + look.x * 2.2, lookAt.y - look.y * 1.2, lookAt.z)
        }
        // the place's things rise out of the ground once you are almost there, one after another
        if (here) here.group.children.forEach((c, i) => {
          if (c.isLight || c.isPoints || c.isSprite) return
          const k = Math.min(1, Math.max(0, (now - here.group.userData.t0 - i * 110) / 650))
          c.scale.setScalar(Math.max(0.001, 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2)) // ease out with a small overshoot
        })
        ahead.copy(lookAt).sub(camera.position).setY(0).normalize()
        navi.position.set(camera.position.x + ahead.x * 3 + Math.sin(s * 1.3) * 0.9, camera.position.y + 0.25 + Math.sin(s * 2.1) * 0.25, camera.position.z + ahead.z * 3 + Math.cos(s * 1.1) * 0.6)
        naviLight.position.copy(navi.position)
        navi.material.opacity = 0.8 + Math.sin(s * 9) * 0.2
        animate(s, camera)
        // labels follow their landmark on screen, only while you are free in the field; written straight to the DOM
        for (const m of marks) {
          const lab = labels.current[m.id]; if (!lab) continue
          proj.copy(m.p).project(camera)
          const on = (mode === 'free' || mode === 'ride') && proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1
          lab.style.opacity = on ? 1 : 0; lab.style.pointerEvents = on ? 'auto' : 'none'
          lab.style.transform = `translate(${(proj.x + 1) * 50}vw, ${(1 - proj.y) * 50}vh) translate(-50%, -100%)`
        }
      }
      setPhase('field')
    })

    const frame = (now) => {
      look.x += (look.tx - look.x) * 0.04; look.y += (look.ty - look.y) * 0.04
      tick(now)
      if (composer) composer.render()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const music = api.current
    return () => {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointermove', onMove); fadeOut(music.music, 500)
      disposeScene(scene); glow.dispose(); composer?.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [onExit, lang])

  // hold to draw the sword: pointer or space, 1.5 s held, timed so a slow frame rate never makes it harder
  useEffect(() => {
    if (phase !== 'temple') return
    let held = false, v = 0, raf = 0, done = false, last = performance.now()
    const step = (now = performance.now()) => {
      const dt = Math.min(0.5, (now - last) / 1000); last = now
      v = Math.max(0, Math.min(1, v + (held ? dt / 1.5 : -dt * 1.5)))
      setHold(v)
      if (v >= 1 && !done) {
        done = true; api.current.pull?.()
        // one thing at a time: the sword's own fanfare, then the warp alone, then the field fades in
        api.current.music = playMusic('mastersword', { volume: muted.current ? 0 : 0.9 })
        setPhase('pulled')
        setTimeout(() => { fadeOut(api.current.music, 900); playWarp(); setPhase('later') }, 2600)
        setTimeout(() => api.current.toField?.().then(() => { api.current.music = playMusic('field', { loop: true, volume: muted.current ? 0 : 0.7, fadeIn: 2500 }) }), 6200)
        return
      }
      raf = requestAnimationFrame(step)
    }
    const on = (e) => { if (e.type === 'keydown' && e.code !== 'Space') return; e.preventDefault?.(); held = true }
    const off = (e) => { if (e.type === 'keyup' && e.code !== 'Space') return; held = false }
    addEventListener('pointerdown', on); addEventListener('pointerup', off); addEventListener('keydown', on); addEventListener('keyup', off)
    raf = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(raf); removeEventListener('pointerdown', on); removeEventListener('pointerup', off); removeEventListener('keydown', on); removeEventListener('keyup', off) }
  }, [phase])

  // Esc: closes the dialog, then leaves the place, then leaves Hyrule
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (dialog) setDialog(null)
      else if (place && arrived) leavePlace()
      else if (!place) onExit()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const onCanvas = (e) => {
    if (phase !== 'field' || !arrived) return
    const p = api.current.pick?.(e.clientX, e.clientY)
    if (p) { setPage(0); setDialog(p) }
  }
  const onHover = (e) => { if (phase === 'field' && arrived) e.currentTarget.style.cursor = api.current.pick?.(e.clientX, e.clientY) ? 'pointer' : '' }
  const bio = l(about.bio, lang)

  return (
    <div className={`hy${leaving ? ' leaving' : ''}`} data-phase={phase}>
      <div className="hy-gl" ref={host} onClick={onCanvas} onPointerMove={onHover} />
      <div className="hy-white" aria-hidden="true" />
      <div className={`hy-curtain${curtain ? ' on' : ''}`} aria-hidden="true" />
      {phase === 'loading' && <p className="hy-load">{t.loading}</p>}
      {(phase === 'temple' || phase === 'pulled') && <h2 className="hy-title">{t.temple}</h2>}
      {phase === 'temple' && (
        <div className="hy-hold">
          <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" className="track" /><circle cx="20" cy="20" r="17" className="fill" style={{ strokeDashoffset: 107 * (1 - hold) }} /></svg>
          <span>{t.hold}</span>
        </div>
      )}
      {phase === 'later' && <p className="hy-later">{t.later}</p>}

      {phase === 'field' && (
        <>
          {/* the area name, like the game shows it on arrival */}
          <h2 key={place ?? 'field'} className="hy-area"><i /><span>{place ? t.places[place][0] : t.field}</span><i /></h2>
          <button type="button" className="hy-map-btn" onClick={() => setMap((m) => !m)} aria-expanded={map}>{t.map}</button>
          {map && (
            <div className="hy-map" role="menu">
              <p>{t.mapTitle}</p>
              {Object.keys(t.places).map((id) => (
                <button key={id} type="button" role="menuitem" className={place === id ? 'here' : ''} onClick={() => go(id)}>
                  <b>{t.places[id][0]}</b><span>{t.places[id][1]}</span>
                </button>
              ))}
              {place && <button type="button" role="menuitem" onClick={leavePlace}><b>{t.field}</b><span>Hyrule</span></button>}
            </div>
          )}
          {/* the field's landmark labels exist only out in the field */}
          {!AREAS.includes(place) && Object.keys(MARKS).map((id) => (
            <button key={id} type="button" className="hy-place" ref={(n) => { labels.current[id] = n }} onClick={() => go(id)}>
              <b>{t.places[id][0]}</b><span>{t.go} · {t.places[id][1]}</span>
            </button>
          ))}
          {!place && <button type="button" className="hy-ride" disabled={riding} onClick={() => { setRiding(true); api.current.ride?.() }}>{riding ? t.riding : t.ride}</button>}
          {place && arrived && <button type="button" className="hy-ride" onClick={leavePlace}>{t.toField}</button>}
          {place && arrived && !dialog && t.intro[place] && <p className="hy-hint">{t.intro[place]}</p>}

          {dialog && (
            <div className="hy-dialog" role="dialog" aria-modal="false" onClick={(e) => e.stopPropagation()}>
              <i className="oc-corner tl" /><i className="oc-corner tr" /><i className="oc-corner bl" /><i className="oc-corner br" />
              {dialog.kind === 'project' && (
                <>
                  <h3>{dialog.data.title}</h3>
                  <p className="lead">{l(dialog.data.tagline, lang)}</p>
                  <p>{l(dialog.data.summary ?? dialog.data.description, lang)}</p>
                  <ul className="hy-chips">{dialog.data.tech.map((x) => <li key={x}>{x}</li>)}</ul>
                  <div className="hy-links">
                    {dialog.data.liveUrl && !dialog.data.liveUrl.startsWith('#') && <a href={dialog.data.liveUrl} target="_blank" rel="noopener noreferrer">{t.live}</a>}
                    {links(dialog.data).map((g) => <a key={g.url} href={g.url} target="_blank" rel="noopener noreferrer">{t.code}{g.label ? ` · ${g.label}` : ''}</a>)}
                  </div>
                </>
              )}
              {dialog.kind === 'stack' && (
                <>
                  <h3>{l(dialog.data.label, lang)}</h3>
                  <ul className="hy-tools">
                    {dialog.data.items.map((x) => (
                      <li key={x}><b>{x}</b><span>{dialog.data.usedIn?.[x] ? `${t.usedIn} ${dialog.data.usedIn[x].map((id) => TITLE[id] ?? id).join(', ')}` : t.noUse}</span></li>
                    ))}
                  </ul>
                </>
              )}
              {dialog.kind === 'about' && (
                <>
                  <h3>Vicente</h3>
                  <p key={page} className="hy-typed">{bio[page]}</p>
                  {page < bio.length - 1
                    ? <button type="button" className="hy-next" onClick={() => setPage((n) => n + 1)} aria-label={t.next}><span>A</span>{t.next}</button>
                    : <button type="button" className="hy-next" onClick={() => setDialog(null)}><span>A</span>OK</button>}
                </>
              )}
              {dialog.kind === 'experience' && JOBS[page] && (
                <>
                  <h3>{l(JOBS[page].role, lang)}</h3>
                  <p className="lead">{JOBS[page].company} · {l(JOBS[page].period, lang)}</p>
                  <ul className="hy-tools">{(l(JOBS[page].impact, lang) ?? []).slice(0, 3).map((x) => <li key={x}><span>{x}</span></li>)}</ul>
                  {page < JOBS.length - 1
                    ? <button type="button" className="hy-next" onClick={() => setPage((n) => n + 1)}><span>A</span>{t.next}</button>
                    : <button type="button" className="hy-next" onClick={() => setDialog(null)}><span>A</span>OK</button>}
                </>
              )}
              {dialog.kind === 'contact' && (
                <>
                  <h3>{t.contact}</h3>
                  <p>{t.contactText}</p>
                  <p className="lead">{site.email}</p>
                  <div className="hy-links">
                    <a href={`mailto:${site.email}`}>Email</a>
                    <a href={site.linkedin} target="_blank" rel="noopener noreferrer">{t.linkedin}</a>
                    <a href={site.resumes[lang === 'en' ? 'en' : 'es'].url} download={site.resumes[lang === 'en' ? 'en' : 'es'].filename}>{t.cv}</a>
                  </div>
                </>
              )}
              {dialog.kind !== 'about' && dialog.kind !== 'experience' && <button type="button" className="hy-close" onClick={() => setDialog(null)} aria-label="Cerrar">×</button>}
            </div>
          )}
        </>
      )}

      <button type="button" className="hy-back" onClick={onExit}>{t.back}</button>
      {phase !== 'loading' && <button type="button" className={`hy-music${quiet ? ' off' : ''}`} onClick={toggleMusic} aria-pressed={!quiet}>{t.music}</button>}
      <p className="hy-credit">{t.credit}</p>
    </div>
  )
}
