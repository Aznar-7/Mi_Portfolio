import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { playWarp, playEpona, playGallop, playMusic, fadeOut, setMusicVolume } from '@/lib/ocarina'
import { projects } from '@/data/projects'
import { about } from '@/data/about'
import { l } from '@/lib/utils'
import { buildField, bendBone, CAM_TO } from './hyruleField'
import { buildArea } from './hyruleAreas'
import { makeControls, linkGait, makeMover, followCamera, yawTo } from './hyrulePlayer'
import { experience } from '@/data/experience'
import { site } from '@/data/site'

// The Song of Time opens the Temple of Time. Hold to draw the Master Sword, the world goes white, and
// seven years later Hyrule Field lies at dusk. From there it is a small game: ride Epona, or travel to
// Kakariko (the projects hang as banners), Kokiri Forest (who I am), Death Mountain (the stack, carved in
// stone), Lon Lon Ranch (the jobs) and the castle (contact). The map keeps track of what you have seen;
// once it is all five, Navi hands you the letter. Esc brings you back.
// Models (CC BY via Sketchfab): Temple of Time (Twilight Princess) by Bornstellar Makes Eternallasting,
// Master Sword by arnaud.sgz, Hyrule Field (OoT 3D) by Dola, Epona by The WarVet, Link by totidoki. Music and sounds: the game's.

const T = {
  es: {
    temple: 'Templo del Tiempo', hold: 'Mantené apretado para sacar la Espada Maestra', later: 'Siete años después…', field: 'Campo de Hyrule',
    back: 'Volver al portfolio', toField: 'Volver al campo', loading: 'Abriendo la Puerta del Tiempo…', ride: 'Montar a Epona', riding: 'Al galope…', music: 'Música', next: 'Seguir',
    credit: 'Modelos CC BY: Templo del Tiempo · Bornstellar · Espada Maestra · arnaud.sgz · Campo de Hyrule · Dola · Epona · The WarVet · Link · totidoki. Música y sonidos: Nintendo.',
    places: { kakariko: ['Aldea Kakariko', 'Proyectos'], kokiri: ['Bosque Kokiri', 'Sobre mí'], mountain: ['Montaña de la Muerte', 'Stack'], ranch: ['Rancho Lon Lon', 'Experiencia'], castle: ['Castillo de Hyrule', 'Contacto'] },
    intro: { kakariko: 'Cada estandarte es un proyecto. Tocá uno para ver qué es y cómo está hecho.', mountain: 'Los gorons tallan en piedra lo que dominan. Tocá una tabla para ver dónde usé cada herramienta.', kokiri: 'Tocá el cartel para volver a leer quién soy.', ranch: 'Cada cartel del corral es un trabajo. Tocá uno para ver qué hice ahí.', castle: '' },
    map: 'Mapa', mapTitle: '¿A dónde vamos?', contact: 'Escribile al rey', contactText: 'Si tenés algo para construir, la puerta del castillo está abierta. Respondo en menos de 24 horas.', cv: 'CV', linkedin: 'LinkedIn',
    live: 'Ver en vivo', code: 'Código', close: 'Cerrar', controls: 'Controles', fail: 'No se pudo cargar este lugar. Probá de nuevo.', usedIn: 'Lo usé en', noUse: 'Todavía sin un proyecto público que lo muestre.', go: 'Ir a',
    see: 'Ver', read: 'Leer', enter: 'Entrar', dismount: 'Bajar de Epona', prev: 'Anterior', inPortfolio: 'Ver en el portfolio',
    endTitle: '¡Hey! ¡Recorriste todo Hyrule!', endText: 'Viste los proyectos, quién soy, el stack, la experiencia y el castillo. Si algo de esto te sirve, la carta ya está lista para escribirla.', endWrite: 'Escribirle a Vicente', endStay: 'Seguir explorando',
    help: [['WASD', 'moverte'], ['Shift', 'caminar'], ['Arrastrar', 'mirar'], ['E', 'interactuar']], helpTouch: 'Mové el círculo para caminar, arrastrá para mirar y tocá el botón para interactuar.',
  },
  en: {
    temple: 'Temple of Time', hold: 'Hold to draw the Master Sword', later: 'Seven years later…', field: 'Hyrule Field',
    back: 'Back to the portfolio', toField: 'Back to the field', loading: 'Opening the Door of Time…', ride: 'Ride Epona', riding: 'Galloping…', music: 'Music', next: 'Next',
    credit: 'Models CC BY: Temple of Time · Bornstellar · Master Sword · arnaud.sgz · Hyrule Field · Dola · Epona · The WarVet · Link · totidoki. Music and sounds: Nintendo.',
    places: { kakariko: ['Kakariko Village', 'Projects'], kokiri: ['Kokiri Forest', 'About me'], mountain: ['Death Mountain', 'Stack'], ranch: ['Lon Lon Ranch', 'Experience'], castle: ['Hyrule Castle', 'Contact'] },
    intro: { kakariko: 'Every banner is a project. Pick one to see what it is and how it was built.', mountain: 'Gorons carve what they master into stone. Pick a tablet to see where I used each tool.', kokiri: 'Pick the sign to read who I am again.', ranch: 'Every sign on the fence is a job. Pick one to see what I did there.', castle: '' },
    map: 'Map', mapTitle: 'Where to?', contact: 'Write to the king', contactText: 'If you have something to build, the castle gate is open. I reply within 24 hours.', cv: 'CV', linkedin: 'LinkedIn',
    live: 'See it live', code: 'Code', close: 'Close', controls: 'Controls', fail: 'This place failed to load. Try again.', usedIn: 'Used in', noUse: 'No public project shows it yet.', go: 'Go to',
    see: 'See', read: 'Read', enter: 'Enter', dismount: 'Get off Epona', prev: 'Back', inPortfolio: 'See it in the portfolio',
    endTitle: 'Hey! You walked all of Hyrule!', endText: 'You saw the projects, who I am, the stack, the jobs and the castle. If any of it is useful to you, the letter is ready to write.', endWrite: 'Write to Vicente', endStay: 'Keep exploring',
    help: [['WASD', 'move'], ['Shift', 'walk'], ['Drag', 'look'], ['E', 'interact']], helpTouch: 'Move the circle to walk, drag to look, tap the button to interact.',
  },
}

const LATERAL = new THREE.Vector3(1, 0, 0)
const PEDESTAL = new THREE.Vector3(0, 1.67, -5.375) // measured on the temple model
// where each landmark's label floats, in field units (x, z, height above the ground)
const MARKS = { castle: [-0.03, -20, 7], ranch: [-32.1, 66.1, 4], mountain: [115.6, -34, 6] }
const AREAS = ['kakariko', 'kokiri'] // places you walk into (their own scene and music)
const JOBS = experience.filter((e) => e.type === 'work')
// what each place says the moment you arrive
const GREET = { kokiri: 'about', castle: 'contact' }
// what seeing each place means: the dialog that tells its part of the portfolio
const KIND = { kakariko: 'project', kokiri: 'about', mountain: 'stack', ranch: 'experience', castle: 'contact' }
const TITLE = Object.fromEntries(projects.map((p) => [p.id, p.title]).concat([['porta', 'Porta Hnos']]))

// the models ship meshopt-compressed with WebP textures (gltf-transform optimize): about a third of their old weight
const load = (url) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url)

// a soft round glow for Navi, the dust, the embers, drawn once
function glowTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 }), x = c.getContext('2d')
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(200,230,255,.9)'); g.addColorStop(1, 'rgba(120,180,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

// the on-screen stick for touch: drag the knob, it springs back
function Stick({ api }) {
  const ref = useRef(null), [k, setK] = useState({ x: 0, y: 0 })
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m }
    api.current.stick?.(x, -y); setK({ x, y })
  }
  const end = () => { api.current.stick?.(0, 0); setK({ x: 0, y: 0 }) }
  return (
    <div ref={ref} className="hy-stick" aria-hidden="true"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e) }}
      onPointerMove={(e) => { if (e.buttons) move(e) }} onPointerUp={end} onPointerCancel={end}>
      <i style={{ transform: `translate(${k.x * 34}px, ${k.y * 34}px)` }} />
    </div>
  )
}

const links = (p) => [].concat(p.githubUrl ?? []).map((g) => (typeof g === 'string' ? { url: g } : g))

export function Hyrule({ lang, onExit, leaving }) {
  const t = T[lang] ?? T.es
  const host = useRef(null), root = useRef(null)
  const [phase, setPhase] = useState('loading') // loading | temple | pulled | later | field
  const [hold, setHold] = useState(0)
  const [area, setArea] = useState(null) // the place you walked into (kakariko | kokiri), or null out in the field
  const [title, setTitle] = useState(null) // the name that shows on arrival, like the game does
  const [hint, setHint] = useState(null)
  const [dialog, setDialog] = useState(null) // { kind: project | stack | about | experience | contact, data, page }
  const [page, setPage] = useState(0) // the bio or the jobs, one at a time
  const [prompt, setPrompt] = useState(null) // what E does where you stand
  const [quiet, setQuiet] = useState(false)
  const [touch] = useState(() => matchMedia('(pointer: coarse)').matches)
  const api = useRef({}), labels = useRef({}), muted = useRef(false)

  const toggleMusic = () => { muted.current = !muted.current; setQuiet(muted.current); setMusicVolume(muted.current ? 0 : phase === 'field' ? 0.7 : 0.55) }
  // moving between places works like the game: the screen goes black, you are there, the name shows
  const [curtain, setCurtain] = useState(false)
  const through = (fn) => { setCurtain(true); setTimeout(() => Promise.resolve(fn()).then(() => setTimeout(() => setCurtain(false), 160)), 550) }
  const [map, setMap] = useState(false)
  // the quest: every place's dialog seen once ends it with Navi and the letter
  const [seen, setSeen] = useState(() => new Set()), [ended, setEnded] = useState(false)
  const show = (d) => { setDialog(d); if (d?.kind) setSeen((prev) => (prev.has(d.kind) ? prev : new Set(prev).add(d.kind))) }
  // leave Hyrule, then do something on the page once it is back (after App's exit scene)
  const backTo = (fn) => { onExit(); setTimeout(fn, 900) }
  const arrive = (id) => { setTitle(t.places[id]?.[0] ?? t.field); setHint(t.intro[id] || null); if (GREET[id]) { setPage(0); show({ kind: GREET[id] }) } }
  const go = (id) => {
    if (curtain) return // one trip at a time
    setMap(false); setDialog(null)
    const isArea = AREAS.includes(id)
    through(() => new Promise((ok) => api.current.leave?.(() => {
      setArea(isArea ? id : null)
      ;(isArea ? api.current.enterArea : api.current.travel)?.(id, () => { arrive(id); ok() })
    })))
  }
  const toField = () => { setMap(false); setDialog(null); through(() => api.current.leave?.(() => { setArea(null); setTitle(t.field); setHint(null) })) }
  api.current.goArea = go
  api.current.exitArea = toField
  api.current.setPrompt = setPrompt
  api.current.openDialog = (p) => { setPage(p.page ?? 0); show(p) }
  const finale = phase === 'field' && seen.size === 5 && !ended && !dialog && !map && !curtain
  api.current.paused = !!dialog || map || curtain || finale
  // the page underneath must not scroll while Hyrule is up (as in MiddleEarth)
  useEffect(() => {
    const el = root.current, stop = (e) => e.preventDefault()
    el.addEventListener('wheel', stop, { passive: false })
    // focus the scene itself, not Back: Space draws the sword and must not press a button
    el.focus({ preventScroll: true })
    return () => el.removeEventListener('wheel', stop)
  }, [])
  // a dialog takes focus when it opens, so E, Enter or Space answer it
  useEffect(() => { if (dialog) root.current?.querySelector('.hy-dialog :is(button, a)')?.focus({ preventScroll: true }) }, [dialog])
  useEffect(() => { if (!hint) return; const id = setTimeout(() => setHint(null), 7000); return () => clearTimeout(id) }, [hint])

  useEffect(() => {
    const el = host.current
    api.current.gone = false
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.append(renderer.domElement)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 6000)
    const glow = glowTexture()
    let dead = false, raf = 0, scene = null, composer = null, tick = () => {}
    const cleanups = []
    const disposeScene = (s) => s?.traverse((o) => {
      o.geometry?.dispose()
      ;[].concat(o.material ?? []).forEach((m) => { Object.values(m).forEach((v) => v?.isTexture && v !== glow && v.dispose()); m.dispose() })
    })
    // every world built (temple, field, each place) with its composer: all of them are freed on exit, not just the one on screen
    const worlds = new Map()
    const dropWorld = (s, c) => { disposeScene(s); s?.environment?.dispose(); c?.dispose(); worlds.delete(s) }
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

    const field = load('/models/hyrule/field.glb'), epona = load('/models/hyrule/epona.glb'), link = load('/models/hyrule/link.glb') // fetched while the temple plays

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
      worlds.set(scene, composer)
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

    // ── seven years later: Hyrule Field, and you in it ──
    api.current.toField = () => Promise.all([field, epona, link]).then(([fieldGltf, eponaGltf, linkGltf]) => {
      if (dead) return
      dropWorld(scene, composer) // the temple is never seen again
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
      const F = buildField({ renderer, camera, fieldGltf, eponaGltf, glow, reduced, lang })
      scene = F.scene; composer = F.composer
      worlds.set(scene, composer)
      renderer.toneMappingExposure = 0.55
      fit()
      const { horse, hb, hs, rig, navi, naviLight, places, picks, animate, gates } = F

      // ── Link ──
      // the file is posed for a fight: back to the bind pose, which lies along -Z, so stood up in a holder
      const hero = new THREE.Group(), body = linkGltf.scene
      body.updateMatrixWorld(true)
      body.traverse((o) => { if (o.isSkinnedMesh) o.skeleton.pose() })
      body.rotation.x = Math.PI / 2; hero.add(body)
      hero.updateMatrixWorld(true)
      const lb = new THREE.Box3().setFromObject(hero), ls = 0.95 / lb.getSize(new THREE.Vector3()).y
      hero.scale.setScalar(ls)
      hero.traverse((o) => { if (o.isSkinnedMesh) { o.frustumCulled = false; o.castShadow = true } })
      // the riding pose, written once in scene axes (Link faces +Z): thighs apart then forward, calves back, arms to the reins
      const X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1)
      const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qp = new THREE.Quaternion()
      const turn = (b, axis, ang) => {
        hero.updateMatrixWorld(true)
        b.getWorldQuaternion(qb); b.parent.getWorldQuaternion(qp)
        b.quaternion.copy(qp.invert().multiply(qa.setFromAxisAngle(axis, ang)).multiply(qb))
      }
      const STAND = [['Upperarml_058', Z, -1.25], ['Upperarmr_076', Z, 1.25]]
      const RIDE = [['Thighl_0102', Z, 0.6], ['Thighr_0106', Z, -0.6], ['Thighl_0102', X, -0.85], ['Thighr_0106', X, -0.85],
        ['Calfl_0103', X, 0.95], ['Calfr_0107', X, 0.95], ['Upperarml_058', X, -0.75], ['Upperarmr_076', X, -0.75]]
      const apply = (list) => list.forEach(([n, axis, a]) => { const b = hero.getObjectByName(n); if (b) turn(b, axis, a) })
      apply(STAND)
      const bones = [...new Set(RIDE.map(([n]) => hero.getObjectByName(n)).filter(Boolean))]
      const rest = bones.map((b) => b.quaternion.clone())
      apply(RIDE)
      const seated = bones.map((b) => b.quaternion.clone())
      hero.updateMatrixWorld(true)
      const seatOff = hero.getObjectByName('Pelvis_03')?.getWorldPosition(new THREE.Vector3()) ?? new THREE.Vector3(0, 0.45, 0)
      const pose = (k) => bones.forEach((b, i) => b.quaternion.slerpQuaternions(rest[i], seated[i], k))
      pose(0)
      const spine = hero.getObjectByName('Spine_02_05'), spineRest = spine?.quaternion.clone()
      const gait = linkGait(hero)

      // ── you start beside Epona, the castle ahead ──
      const mover = makeMover(F.solids)
      const hc = new THREE.Box3().setFromObject(horse) // the saddle, in the horse's own units: a bit behind the middle, two thirds up
      horse.updateMatrixWorld(true)
      hc.applyMatrix4(horse.matrixWorld.clone().invert())
      const saddleLocal = new THREE.Vector3((hc.min.x + hc.max.x) / 2, hc.min.y + (hc.max.y - hc.min.y) * 0.66, hc.min.z + (hc.max.z - hc.min.z) * 0.45)
      const lift = -hb.min.y * hs // from the ground to the horse's origin
      const hoof = horse.position.clone().setY(horse.position.y - lift) // where she stands
      let horseYaw = horse.rotation.y
      const flankOf = (yaw, s = 1) => new THREE.Vector3(Math.cos(yaw) * s, 0, -Math.sin(yaw) * s)
      hero.position.copy(hoof).add(flankOf(horseYaw, 0.8)); mover.settle(hero.position)
      hero.rotation.y = Math.atan2(CAM_TO.x - hero.position.x, CAM_TO.z - hero.position.z)
      scene.add(hero)
      const controls = makeControls(el); cleanups.push(controls.dispose)
      controls.cam.yaw = hero.rotation.y + Math.PI
      api.current.stick = (x, y) => { controls.stick.x = x; controls.stick.y = y }

      // the world you are in: the field, or a place you walked into
      const fieldWorld = { field: true, scene, composer, mover, picks, followSun: F.followSun, exposure: 0.55, animate: (s) => animate(s, camera) }
      let W = fieldWorld
      W.follow = followCamera(camera, controls.cam, mover)

      // ── on and off Epona ──
      let mounted = false, mount = null, hSpeed = 0, lastHoof = 0, heroSpeed = 0
      const saddle = new THREE.Vector3(), off = new THREE.Vector3()
      const saddlePoint = () => {
        horse.updateMatrixWorld(); saddle.copy(saddleLocal); horse.localToWorld(saddle)
        off.copy(seatOff).applyAxisAngle(THREE.Object3D.DEFAULT_UP, horse.rotation.y)
        return saddle.sub(off)
      }
      const startMount = () => { mount = { t0: performance.now(), from: hero.position.clone(), fromYaw: hero.rotation.y, on: true }; playEpona() }
      const startDismount = () => {
        if (hSpeed > 2) return
        const to = hoof.clone().add(flankOf(horseYaw, 0.85)); mover.settle(to)
        mount = { t0: performance.now(), from: hero.position.clone(), to, fromYaw: hero.rotation.y, on: false }
      }
      // she leans with the ground under her hooves (front and back), instead of standing level on a slope
      horse.rotation.order = 'YXZ'
      const HL = (hb.max.z - hb.min.z) * hs * 0.36
      let horsePitch = 0
      const placeHorse = (bob = 0, k = 1) => {
        const fx = Math.sin(horseYaw) * HL, fz = Math.cos(horseYaw) * HL
        const f = mover.floor(hoof.x + fx, hoof.z + fz, hoof.y + 2), b = mover.floor(hoof.x - fx, hoof.z - fz, hoof.y + 2)
        if (f !== null && b !== null) horsePitch += (THREE.MathUtils.clamp(-Math.atan2(f - b, 2 * HL), -0.35, 0.35) - horsePitch) * k
        horse.rotation.y = horseYaw; horse.rotation.x = horsePitch
        horse.position.set(hoof.x, hoof.y + lift + bob, hoof.z)
      }
      placeHorse()

      // what you can do near where you stand: read, enter, mount; the nearest one shows as the prompt
      const tmp = new THREE.Vector3()
      const RADIUS = { project: 3.2, stack: 3.6, experience: 2.4, contact: 3, about: 3.2 }
      const pickLabel = (p) => p.kind === 'project' ? `${t.see} · ${p.data.title}`
        : p.kind === 'stack' ? `${t.read} · ${l(p.data.label, lang)}`
          : p.kind === 'experience' ? `${t.read} · ${JOBS[p.page ?? 0]?.company}`
            : p.kind === 'contact' ? `${t.read} · ${t.contact}` : `${t.read} · Vicente`
      const candidates = () => {
        const list = W.picks.map((m) => ({ key: m.uuid, at: m.getWorldPosition(new THREE.Vector3()), r: RADIUS[m.userData.pick.kind] ?? 3, label: pickLabel(m.userData.pick), act: () => api.current.openDialog?.(m.userData.pick) }))
        if (W.field) {
          for (const [id, g] of Object.entries(gates)) list.push({ key: `gate-${id}`, at: g.at, r: 3, label: `${t.enter} · ${t.places[id][0]}`, act: () => api.current.goArea?.(id) })
          list.push({ key: 'ranch-out', at: places.ranch.spawn, r: 2.5, label: t.toField, act: () => api.current.goArea?.('ranchOut') })
          if (!mounted && !mount) list.push({ key: 'epona', at: horse.position, r: 2.2, label: t.ride, act: startMount })
        } else list.push({ key: 'exit', at: W.spawn, r: 2.5, label: t.toField, act: () => api.current.exitArea?.() })
        return list
      }
      let near = null, lastKey = null
      const findNear = () => {
        if (mounted) return mount ? null : { key: 'dismount', label: t.dismount, act: startDismount }
        if (mount) return null
        let best = null, bd = Infinity
        for (const c of candidates()) { const d = Math.hypot(c.at.x - hero.position.x, c.at.z - hero.position.z); if (d < c.r && d < bd) { best = c; bd = d } }
        return best
      }
      api.current.interact = () => near?.act()

      // ── moving between worlds ──
      const fieldScene = scene, built = {}
      const snapTo = (p, yaw) => { hero.position.copy(p); W.mover.settle(hero.position, 4); hero.rotation.y = yaw; controls.cam.yaw = yaw + Math.PI; W.follow(hero.position, yaw, false, 3.6, 1.05, 0.016, true) }
      const unmount = () => { if (!mounted && !mount) return; mounted = false; mount = null; pose(0); hero.position.copy(hoof).add(flankOf(horseYaw, 0.85)); mover.settle(hero.position) }
      api.current.enterArea = (id, fn) => {
        built[id] ??= load(`/models/hyrule/${id}.glb`).then((gltf) => {
          const a = buildArea(id, { renderer, camera, gltf, glow, lang, reduced })
          if (dead) dropWorld(a.scene, a.composer); else worlds.set(a.scene, a.composer)
          return a
        })
        built[id].then((a) => {
          if (dead) return
          unmount()
          a.world ??= { id, scene: a.scene, composer: a.composer, mover: makeMover([a.land]), picks: a.picks, followSun: a.followSun, exposure: a.exposure, animate: a.animate, spawn: a.spawn }
          W = a.world; W.follow ??= followCamera(camera, controls.cam, W.mover)
          scene = W.scene; composer = W.composer; renderer.toneMappingExposure = W.exposure; fit()
          scene.add(hero)
          snapTo(W.spawn, Math.atan2(a.look.x - a.eye.x, a.look.z - a.eye.z))
          api.current.music = playMusic(a.music, { loop: true, volume: muted.current ? 0 : 0.7, fadeIn: 1200 })
          fn?.()
        }).catch(() => { delete built[id]; if (dead) return; setArea(null); setTitle(t.field); setHint(t.fail); setCurtain(false) })
      }
      // out of a place: back at its gate in the field, facing away from it
      api.current.leave = (fn) => {
        if (!W.field) {
          const from = W.id
          W = fieldWorld; scene = fieldScene; composer = W.composer; renderer.toneMappingExposure = W.exposure; fit()
          scene.add(hero)
          const g = gates[from]
          snapTo(g.spawn, Math.atan2(g.spawn.x - g.at.x, g.spawn.z - g.at.z))
          api.current.music = playMusic('field', { loop: true, volume: muted.current ? 0 : 0.7, fadeIn: 1200 })
        }
        fn?.()
      }
      // a quick journey across the field (the map, the labels): Epona comes with you
      api.current.travel = (id, fn) => {
        const p = places[id]
        snapTo(p.spawn, Math.atan2(p.look.x - p.spawn.x, p.look.z - p.spawn.z))
        hoof.copy(hero.position).add(flankOf(hero.rotation.y, mounted ? 0 : -2.2)); mover.settle(hoof, 4); horseYaw = hero.rotation.y; hSpeed = 0; placeHorse()
        if (mounted) hero.position.copy(saddlePoint())
        fn?.()
      }
      // what the pointer is over, among the things of the world you are in, if you are close enough to read it
      const caster = new THREE.Raycaster(), ndc = new THREE.Vector2()
      api.current.pick = (cx, cy) => {
        if (controls.wasDrag()) return null
        ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1); caster.setFromCamera(ndc, camera)
        const hit = caster.intersectObjects(W.picks, false)[0]
        return hit && hit.object.getWorldPosition(tmp).distanceTo(hero.position) < 9 ? hit.object.userData.pick : null
      }

      const marks = Object.entries(MARKS).map(([id, [x, z, up]]) => ({ id, p: new THREE.Vector3(x, (F.groundAt(x, z) ?? 0) + up, z) }))
        .concat(Object.entries(gates).filter(([, g]) => !g.inner).map(([id, g]) => ({ id, p: g.at.clone().setY(g.at.y + 3.8) })))
      const proj = new THREE.Vector3(), wish = new THREE.Vector3()
      const t0 = performance.now()
      let prev = 0, dist = 3.6, height = 1.05

      tick = (now) => {
        const s = (now - t0) / 1000
        const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0; prev = now
        const paused = api.current.paused
        const w = paused ? null : controls.wish()
        // where you want to go, turned from the camera's point of view
        if (w) { const yaw = controls.cam.yaw; wish.set(-Math.sin(yaw) * w.y + Math.cos(yaw) * w.x, 0, -Math.cos(yaw) * w.y - Math.sin(yaw) * w.x).normalize() }

        let moving = false
        if (mount) {
          // getting on: a crouch, a jump into the saddle; getting off: a hop down beside her
          const k = reduced ? 1 : Math.min(1, (now - mount.t0) / (mount.on ? 1000 : 600))
          if (mount.on) {
            const j = Math.max(0, (k - 0.3) / 0.7), e = j * j * (3 - 2 * j)
            hero.position.lerpVectors(mount.from, saddlePoint(), e); hero.position.y += Math.sin(j * Math.PI) * 0.35 - (k < 0.3 ? Math.sin((k / 0.3) * Math.PI) * 0.05 : 0)
            hero.rotation.y = yawTo(mount.fromYaw, horse.rotation.y, e); pose(e)
            if (k === 1) { mounted = true; mount = null }
          } else {
            const e = k * k * (3 - 2 * k)
            hero.position.lerpVectors(mount.from, mount.to, e); hero.position.y += Math.sin(k * Math.PI) * 0.25
            pose(1 - e)
            if (k === 1) { mounted = false; mount = null }
          }
        } else if (mounted) {
          // riding: she turns toward where you push and builds up to a gallop; walls stop her
          const target = w ? (w.walk ? 3.2 : 10) * w.m : 0
          if (w) horseYaw = yawTo(horseYaw, Math.atan2(wish.x, wish.z), Math.min(1, dt * (hSpeed > 6 ? 1.8 : 3)))
          hSpeed += THREE.MathUtils.clamp(target - hSpeed, -12 * dt, 5 * dt)
          if (hSpeed > 0.05 && !mover.move(hoof, Math.sin(horseYaw) * hSpeed * dt, Math.cos(horseYaw) * hSpeed * dt, { reach: 0.95, knee: 0.55, maxRise: 0.6 })) hSpeed *= 0.4
          placeHorse(Math.abs(Math.sin(s * 9)) * 0.05 * Math.min(1, hSpeed / 8), Math.min(1, dt * 8))
          hero.position.copy(saddlePoint()); hero.rotation.y = horse.rotation.y
          if (hSpeed > 1.5 && now - lastHoof > (hSpeed > 6 ? 330 : 560)) { playGallop(); lastHoof = now }
          moving = hSpeed > 0.5
        } else if (w) {
          // on foot: runs by default, Shift walks
          heroSpeed = (w.walk ? 1.4 : 3.8) * w.m
          W.mover.move(hero.position, wish.x * heroSpeed * dt, wish.z * heroSpeed * dt)
          hero.rotation.y = yawTo(hero.rotation.y, Math.atan2(wish.x, wish.z), Math.min(1, dt * 12))
          moving = true
        } else heroSpeed = 0
        if (!mounted && !mount) body.position.y = gait(dt, moving ? Math.min(1, heroSpeed / 3.8) : 0) / ls
        if (W.field) { rig(s, Math.min(1, hSpeed / 10)); if (spine && (mounted || mount)) bendBone(hero, spine, spineRest, LATERAL, Math.min(1, hSpeed / 10) * 0.32) }

        // the camera follows; a little further back on horseback
        dist += ((mounted ? 5.4 : 3.6) - dist) * Math.min(1, dt * 3); height += ((mounted ? 1.5 : 1.05) - height) * Math.min(1, dt * 3)
        W.follow(hero.position, mounted ? horse.rotation.y : hero.rotation.y, moving, dist, height, dt)
        W.followSun(hero.position)

        // the prompt: what E does right here
        near = paused ? null : findNear()
        if ((near?.key ?? null) !== lastKey) { lastKey = near?.key ?? null; api.current.setPrompt?.(near ? { key: near.key, label: near.label } : null) }
        if (controls.take('KeyE', 'Enter') && near) near.act()

        // Navi keeps near your shoulder, never over what you are looking at
        if (W.field) {
          const yaw = controls.cam.yaw
          navi.position.set(hero.position.x + Math.cos(yaw) * 0.7 + Math.sin(s * 1.3) * 0.15, hero.position.y + (mounted ? 2.1 : 1.45) + Math.sin(s * 2.1) * 0.12, hero.position.z - Math.sin(yaw) * 0.7 + Math.cos(s * 1.1) * 0.15)
          naviLight.position.copy(navi.position)
          navi.material.opacity = 0.8 + Math.sin(s * 9) * 0.2
        }
        W.animate(s)
        // labels float over the landmarks while you are in the field, far from them; written straight to the DOM
        for (const m of marks) {
          const lab = labels.current[m.id]; if (!lab) continue
          proj.copy(m.p).project(camera)
          const on = W.field && m.p.distanceTo(hero.position) > (m.id === 'ranch' ? 30 : 14) && proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1
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
      dead = true; music.gone = true; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointermove', onMove); fadeOut(music.music, 500); cleanups.forEach((f) => f())
      if (scene && !worlds.has(scene)) dropWorld(scene, composer) // a temple that failed half way
      worlds.forEach((c, s) => dropWorld(s, c)); glow.dispose()
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    }
  }, [onExit, lang, t])

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
        setTimeout(() => { if (api.current.gone) return; fadeOut(api.current.music, 900); playWarp(); setPhase('later') }, 2600)
        setTimeout(() => api.current.gone || api.current.toField?.().then(() => { if (!api.current.gone) api.current.music = playMusic('field', { loop: true, volume: muted.current ? 0 : 0.7, fadeIn: 2500 }) }).catch(() => !api.current.gone && onExit()), 6200)
        return
      }
      raf = requestAnimationFrame(step)
    }
    const on = (e) => { if (e.type === 'keydown' && e.code !== 'Space') return; if (e.target instanceof Element && e.target.closest('button, a')) return; e.preventDefault?.(); held = true }
    const off = (e) => { if (e.type === 'keyup' && e.code !== 'Space') return; held = false }
    addEventListener('pointerdown', on); addEventListener('pointerup', off); addEventListener('keydown', on); addEventListener('keyup', off)
    raf = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(raf); removeEventListener('pointerdown', on); removeEventListener('pointerup', off); removeEventListener('keydown', on); removeEventListener('keyup', off) }
  }, [phase, onExit])

  // Esc: closes the dialog or the map, then leaves the place, then leaves Hyrule
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (dialog) setDialog(null)
      else if (finale) setEnded(true)
      else if (map) setMap(false)
      else if (area) toField()
      else onExit()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const onCanvas = (e) => {
    if (phase !== 'field') return
    const p = api.current.pick?.(e.clientX, e.clientY)
    if (p) api.current.openDialog(p)
  }
  const onHover = (e) => { if (phase === 'field') e.currentTarget.style.cursor = api.current.pick?.(e.clientX, e.clientY) ? 'pointer' : '' }
  const bio = l(about.bio, lang)

  return (
    <div className={`hy${leaving ? ' leaving' : ''}`} data-phase={phase} role="dialog" aria-modal="true" aria-label={t.temple} ref={root} tabIndex={-1}>
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
          {/* the name of where you are, like the game shows it on arrival */}
          <h2 key={title ?? 'field'} className="hy-area"><i /><span>{title ?? t.field}</span><i /></h2>
          <button type="button" className="hy-map-btn" onClick={() => setMap((m) => !m)} aria-expanded={map}>{t.map}</button>
          {map && (
            <div className="hy-map">
              <p>{t.mapTitle} <small>{seen.size}/5</small></p>
              {Object.keys(t.places).map((id) => (
                <button key={id} type="button" className={`${area === id ? 'here' : ''}${seen.has(KIND[id]) ? ' done' : ''}`} onClick={() => go(id)}>
                  <b>{t.places[id][0]}</b><span>{t.places[id][1]}</span>
                </button>
              ))}
              {area && <button type="button" onClick={toField}><b>{t.field}</b><span>Hyrule</span></button>}
            </div>
          )}
          {/* the landmarks' labels, out in the field and far from them: a click takes you there */}
          {!area && [...Object.keys(MARKS), ...AREAS].map((id) => (
            <button key={id} type="button" className="hy-place" ref={(n) => { labels.current[id] = n }} onClick={() => go(id)}>
              <b>{t.places[id][0]}</b><span>{t.go} · {t.places[id][1]}</span>
            </button>
          ))}
          {hint && !dialog && <p className="hy-hint">{hint}</p>}
          {prompt && !dialog && !map && (
            <button type="button" className="hy-prompt" onClick={() => api.current.interact?.()}><kbd>{touch ? 'A' : 'E'}</kbd><span>{prompt.label}</span></button>
          )}
          {touch ? <Stick api={api} /> : (
            <ul className="hy-help" aria-label={t.controls}>{t.help.map(([k, v]) => <li key={k}><kbd>{k}</kbd>{v}</li>)}</ul>
          )}
          {touch && !hint && <p className="hy-help touch">{t.helpTouch}</p>}

          {finale && (
            <div className="hy-dialog hy-end" role="dialog" aria-labelledby="hy-end-t">
              <i className="oc-corner tl" /><i className="oc-corner tr" /><i className="oc-corner bl" /><i className="oc-corner br" />
              <span className="oc-navi" aria-hidden="true" />
              <h3 id="hy-end-t">{t.endTitle}</h3>
              <p>{t.endText}</p>
              <div className="hy-links">
                <button type="button" onClick={() => { setEnded(true); backTo(() => { document.getElementById('contacto')?.scrollIntoView(); document.getElementById('f-name')?.focus({ preventScroll: true }) }) }} autoFocus>{t.endWrite}</button>
                <button type="button" className="ghost" onClick={() => setEnded(true)}>{t.endStay}</button>
              </div>
            </div>
          )}
          {dialog && (
            <div className="hy-dialog" role="dialog" aria-labelledby="hy-dialog-t" onClick={(e) => e.stopPropagation()}>
              <i className="oc-corner tl" /><i className="oc-corner tr" /><i className="oc-corner bl" /><i className="oc-corner br" />
              {dialog.kind === 'project' && (
                <>
                  {dialog.data.image && <img className="hy-shot" src={dialog.data.image} alt="" loading="lazy" />}
                  <h3 id="hy-dialog-t">{dialog.data.title}</h3>
                  <p className="lead">{l(dialog.data.tagline, lang)}</p>
                  <p>{l(dialog.data.summary ?? dialog.data.description, lang)}</p>
                  <ul className="hy-chips">{dialog.data.tech.map((x) => <li key={x}>{x}</li>)}</ul>
                  <div className="hy-links">
                    {dialog.data.liveUrl && !dialog.data.liveUrl.startsWith('#') && <a href={dialog.data.liveUrl} target="_blank" rel="noopener noreferrer">{t.live}</a>}
                    {links(dialog.data).map((g) => <a key={g.url} href={g.url} target="_blank" rel="noopener noreferrer">{t.code}{g.label ? ` · ${g.label}` : ''}</a>)}
                  </div>
                  {dialog.data.note && <p className="lead">{l(dialog.data.note, lang)}</p>}
                  <button type="button" className="hy-next" onClick={() => backTo(() => document.dispatchEvent(new CustomEvent('board:open-project', { detail: dialog.data.id })))}><span>A</span>{t.inPortfolio}</button>
                </>
              )}
              {dialog.kind === 'stack' && (
                <>
                  <h3 id="hy-dialog-t">{l(dialog.data.label, lang)}</h3>
                  <ul className="hy-tools">
                    {dialog.data.items.map((x) => (
                      <li key={x}><b>{x}</b><span>{dialog.data.usedIn?.[x] ? `${t.usedIn} ${dialog.data.usedIn[x].map((id) => TITLE[id] ?? id).join(', ')}` : t.noUse}</span></li>
                    ))}
                  </ul>
                </>
              )}
              {dialog.kind === 'about' && (
                <>
                  <h3 id="hy-dialog-t">Vicente</h3>
                  <p key={page} className="hy-typed">{bio[page]}</p>
                  {page < bio.length - 1
                    ? <button type="button" className="hy-next" onClick={() => setPage((n) => n + 1)} aria-label={t.next}><span>A</span>{t.next}</button>
                    : <button type="button" className="hy-next" onClick={() => setDialog(null)}><span>A</span>OK</button>}
                </>
              )}
              {dialog.kind === 'experience' && JOBS[page] && (
                <>
                  <h3 id="hy-dialog-t">{l(JOBS[page].role, lang)}</h3>
                  <p className="lead">{JOBS[page].company} · {l(JOBS[page].period, lang)}</p>
                  <ul className="hy-tools">{(l(JOBS[page].impact, lang) ?? []).slice(0, 3).map((x) => <li key={x}><span>{x}</span></li>)}</ul>
                  {page > 0 && <button type="button" className="hy-next prev" onClick={() => setPage((n) => n - 1)}><span>B</span>{t.prev}</button>}
                  {page < JOBS.length - 1
                    ? <button type="button" className="hy-next" onClick={() => setPage((n) => Math.min(n + 1, JOBS.length - 1))}><span>A</span>{t.next}</button>
                    : <button type="button" className="hy-next" onClick={() => setDialog(null)}><span>A</span>OK</button>}
                </>
              )}
              {dialog.kind === 'contact' && (
                <>
                  <h3 id="hy-dialog-t">{t.contact}</h3>
                  <p>{t.contactText}</p>
                  <p className="lead">{site.email}</p>
                  <div className="hy-links">
                    <a href={`mailto:${site.email}`}>Email</a>
                    <a href={site.linkedin} target="_blank" rel="noopener noreferrer">{t.linkedin}</a>
                    <a href={site.resumes[lang === 'en' ? 'en' : 'es'].url} download={site.resumes[lang === 'en' ? 'en' : 'es'].filename}>{t.cv}</a>
                  </div>
                </>
              )}
              {dialog.kind !== 'about' && dialog.kind !== 'experience' && <button type="button" className="hy-close" onClick={() => setDialog(null)} aria-label={t.close}>×</button>}
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
