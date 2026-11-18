import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { skillGroups } from '@/data/skills'
import { experience } from '@/data/experience'
import { l } from '@/lib/utils'

// Hyrule Field at dusk, closer to the remake than to the N64: the 3DS field model under a physical sky,
// moving clouds, wind-blown grass with flowers, pollen in the light, terrain detail so the old textures
// don't read as blur, and a warm grade. Three places hold the portfolio: banners at the castle gate
// (projects), stone tablets at the foot of Death Mountain (stack) and a sign at Lon Lon Ranch (about).

export const FIELD_SCALE = 0.01 // the field comes in game units (centimetres)
export const CAM_FROM = new THREE.Vector3(-24.54, -3.8, 136.63), CAM_TO = new THREE.Vector3(-0.03, 4, -17.92) // south, facing the castle
const SUN = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(86), THREE.MathUtils.degToRad(-128))

// ── small shader helpers ──
const NOISE = /* glsl */`
  float hy_hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float hy_noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(hy_hash(i), hy_hash(i + vec2(1, 0)), f.x), mix(hy_hash(i + vec2(0, 1)), hy_hash(i + vec2(1, 1)), f.x), f.y); }
  float hy_fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * hy_noise(p); p *= 2.03; a *= .5; } return v; }`

// the 3DS textures are 64 px: add world-space variation and fine grain so the ground reads as ground
export function detailTerrain(material) {
  material.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 hyWorld;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nhyWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 hyWorld;\n${NOISE}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        float hyMacro = hy_fbm(hyWorld.xz * .035), hyFine = hy_noise(hyWorld.xz * 6.);
        float hyGreen = smoothstep(.02, .12, diffuseColor.g - max(diffuseColor.r, diffuseColor.b) * .9);
        vec3 hyTint = mix(vec3(.82, .9, .6), vec3(1.12, 1.05, .78), hyMacro);
        diffuseColor.rgb *= mix(vec3(.88 + hyFine * .2), hyTint * (.85 + hyFine * .25), hyGreen);`)
  }
}

// grass that leans with the wind: tapered blades, instanced, coloured root to tip, in the fog
function grassMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uTime: { value: 0 }, uSun: { value: new THREE.Color(0xffc690) } },
    fog: true, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      uniform float uTime; varying float vH; varying vec3 vWorld;
      #include <fog_pars_vertex>
      void main(){
        vH = uv.y;
        vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
        float gust = sin(w.x * .35 + uTime * 1.6) * .5 + sin(w.z * .21 + uTime * 1.1) * .5;
        w.xz += vec2(.12, .05) * gust * vH * vH;
        vWorld = w.xyz;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uSun; varying float vH; varying vec3 vWorld;
      #include <fog_pars_fragment>
      void main(){
        vec3 root = vec3(.05,.09,.03), tip = vec3(.34,.40,.15);
        float n = fract(sin(dot(floor(vWorld.xz * 3.), vec2(12.9898, 78.233))) * 43758.5453);
        vec3 col = mix(root, tip * (.8 + n * .4), vH * vH) + uSun * .14 * pow(vH, 4.);
        gl_FragColor = vec4(col, 1.);
        #include <fog_fragment>
      }`,
  })
}

// a dome of slow clouds lit by the low sun
function cloudDome() {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide,
    uniforms: { uTime: { value: 0 }, uSun: { value: SUN } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `${NOISE}
      uniform float uTime; uniform vec3 uSun; varying vec3 vDir;
      void main(){
        if (vDir.y < .01) discard;
        vec2 p = vDir.xz / (vDir.y + .12) * 1.6 + vec2(uTime * .004, uTime * .0015);
        float c = smoothstep(.5, .78, hy_fbm(p) * .9 + hy_fbm(p * 2.7) * .25);
        float toSun = pow(max(dot(normalize(vDir), normalize(uSun)), 0.), 6.);
        vec3 col = mix(vec3(.62, .52, .58), vec3(1., .78, .55), toSun * .9 + vDir.y * .2);
        gl_FragColor = vec4(col, c * smoothstep(.01, .2, vDir.y) * .85);
      }`,
  })
  return new THREE.Mesh(new THREE.SphereGeometry(2400, 32, 16), mat)
}

// the remake's warmth: a lift in the highlights, a touch more colour, a soft vignette
export const GradeShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float lum = dot(c.rgb, vec3(.299, .587, .114));
      c.rgb = mix(vec3(lum), c.rgb, 1.12);
      c.rgb = (c.rgb - .5) * 1.06 + .5;
      c.rgb *= mix(vec3(.94, .97, 1.06), vec3(1.07, 1.0, .9), smoothstep(.15, .8, lum));
      float v = smoothstep(1.15, .35, length(vUv - .5) * 1.35);
      gl_FragColor = vec4(c.rgb * mix(.72, 1., v), c.a);
    }`,
}

// ── the portfolio, made of Hyrule things ──
const canvasOf = (w, h) => { const c = Object.assign(document.createElement('canvas'), { width: w, height: h }); return [c, c.getContext('2d')] }
const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t }
function wrap(x, text, max) {
  const words = String(text).split(' '), lines = []; let line = ''
  for (const w of words) { const next = line ? `${line} ${w}` : w; if (x.measureText(next).width > max && line) { lines.push(line); line = w } else line = next }
  if (line) lines.push(line)
  return lines
}

// a royal banner: red cloth, gold border and swallowtail, the project's screen and name
export function bannerTexture(p, lang, img) {
  const [c, x] = canvasOf(512, 780)
  const g = x.createLinearGradient(0, 0, 0, 780); g.addColorStop(0, '#7d2323'); g.addColorStop(1, '#4b1212')
  x.fillStyle = g
  x.beginPath(); x.moveTo(0, 0); x.lineTo(512, 0); x.lineTo(512, 780); x.lineTo(256, 700); x.lineTo(0, 780); x.closePath(); x.fill()
  x.globalAlpha = 0.07; x.fillStyle = '#000'; for (let y = 0; y < 780; y += 4) x.fillRect(0, y, 512, 1); x.globalAlpha = 1
  x.strokeStyle = '#d4a94c'; x.lineWidth = 8
  x.beginPath(); x.moveTo(18, 18); x.lineTo(494, 18); x.lineTo(494, 742); x.lineTo(256, 668); x.lineTo(18, 742); x.closePath(); x.stroke()
  // the screen, framed in gold
  x.fillStyle = '#1b1210'; x.fillRect(48, 60, 416, 290)
  if (img) {
    const r = Math.max(400 / img.width, 274 / img.height), w = img.width * r, h = img.height * r
    x.save(); x.beginPath(); x.rect(56, 68, 400, 274); x.clip(); x.drawImage(img, 256 - w / 2, 205 - h / 2, w, h); x.restore()
  } else {
    x.fillStyle = '#d4a94c'; x.font = '600 64px Georgia, serif'; x.textAlign = 'center'; x.fillText(p.title[0], 256, 225)
  }
  x.strokeStyle = '#d4a94c'; x.lineWidth = 4; x.strokeRect(52, 64, 408, 282)
  x.textAlign = 'center'; x.fillStyle = '#fbf2dc'; x.font = '600 46px Georgia, "Times New Roman", serif'
  x.fillText(p.title, 256, 420)
  x.fillStyle = '#e9cf98'; x.font = '400 24px Georgia, serif'
  wrap(x, l(p.tagline, lang), 400).slice(0, 4).forEach((ln, i) => x.fillText(ln, 256, 466 + i * 32))
  return tex(c)
}

// a Goron tablet: dark stone, the group carved in and glowing like embers (a second map lights the text)
function tabletTextures(gr, lang) {
  const [c, x] = canvasOf(512, 640), [e, ex] = canvasOf(512, 640)
  x.fillStyle = '#3d3633'; x.fillRect(0, 0, 512, 640)
  for (let i = 0; i < 2600; i++) { const v = 40 + Math.random() * 40; x.fillStyle = `rgba(${v},${v - 6},${v - 10},.5)`; x.fillRect(Math.random() * 512, Math.random() * 640, 2 + Math.random() * 6, 2 + Math.random() * 6) }
  x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 10; x.strokeRect(22, 22, 468, 596)
  ex.fillStyle = '#000'; ex.fillRect(0, 0, 512, 640)
  const carve = (ctx, glow) => {
    ctx.textAlign = 'center'; ctx.fillStyle = glow ? '#ff9a3c' : '#1c1412'
    ctx.font = '700 48px Georgia, serif'; ctx.fillText(l(gr.label, lang), 256, 104)
    ctx.fillRect(140, 128, 232, 3)
    ctx.font = '500 32px Georgia, serif'
    gr.items.slice(0, 9).forEach((it, i) => ctx.fillText(it, 256, 190 + i * 46))
  }
  carve(x, false); carve(ex, true)
  return [tex(c), tex(e)]
}

// a wooden sign: weathered planks, a title and a few lines
export function signTexture(title, lines) {
  const [c, x] = canvasOf(768, 512)
  for (let i = 0; i < 4; i++) {
    const g = x.createLinearGradient(0, i * 128, 0, i * 128 + 128); g.addColorStop(0, '#9a6a3c'); g.addColorStop(1, '#7b5129')
    x.fillStyle = g; x.fillRect(0, i * 128 + 2, 768, 124)
    x.strokeStyle = 'rgba(60,35,15,.35)'; x.lineWidth = 2
    for (let k = 0; k < 6; k++) { x.beginPath(); const y = i * 128 + 18 + Math.random() * 90; x.moveTo(0, y); x.bezierCurveTo(250, y + 8, 500, y - 8, 768, y + 4); x.stroke() }
  }
  x.fillStyle = '#2e1a0b'; x.textAlign = 'center'
  x.font = '700 60px Georgia, serif'; x.fillText(title, 384, 92)
  x.font = '500 28px Georgia, serif'
  lines.slice(0, 5).forEach((ln, i) => x.fillText(ln, 384, 168 + i * 66))
  return tex(c)
}

export const loadImage = (src) => new Promise((ok) => { if (!src) return ok(null); const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src })

export function buildField({ renderer, camera, fieldGltf, eponaGltf, glow, reduced, lang }) {
  const scene = new THREE.Scene()
  const sky = new Sky(); sky.scale.setScalar(4500)
  Object.assign(sky.material.uniforms.turbidity, { value: 7 }); sky.material.uniforms.rayleigh.value = 2.4
  sky.material.uniforms.mieCoefficient.value = 0.006; sky.material.uniforms.mieDirectionalG.value = 0.86
  sky.material.uniforms.sunPosition.value.copy(SUN)
  scene.add(sky)
  const pmrem = new THREE.PMREMGenerator(renderer), skyOnly = new THREE.Scene(); skyOnly.add(sky.clone())
  scene.environment = pmrem.fromScene(skyOnly).texture; pmrem.dispose()
  const clouds = cloudDome(); scene.add(clouds)
  scene.fog = new THREE.FogExp2(0xd39f80, 0.0062)
  const sunLight = new THREE.DirectionalLight(0xffbe86, 2.8); sunLight.position.copy(SUN).multiplyScalar(100); scene.add(sunLight)
  scene.add(new THREE.HemisphereLight(0x8fa6d8, 0x3b2a18, 0.75))

  const land = fieldGltf.scene; land.scale.setScalar(FIELD_SCALE); scene.add(land)
  land.updateMatrixWorld(true)
  land.traverse((o) => { if (o.material) { o.material.envMapIntensity = 0.6; detailTerrain(o.material) } })

  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0)
  const groundAt = (x, z) => { ray.set(new THREE.Vector3(x, 400, z), down); const h = ray.intersectObject(land, true)[0]; return h ? h.point.y : null }
  const fwd = CAM_TO.clone().sub(CAM_FROM).setY(0).normalize(), side = new THREE.Vector3(-fwd.z, 0, fwd.x)

  // ── grass and flowers on a strip along the ride ──
  const LEN = 90, WID = 34, GU = 60, GV = 24, hm = []
  const at = (u, v) => [CAM_FROM.x - fwd.x * 6 + fwd.x * (u / GU) * LEN + side.x * ((v / GV) - 0.5) * WID, CAM_FROM.z - fwd.z * 6 + fwd.z * (u / GU) * LEN + side.z * ((v / GV) - 0.5) * WID]
  for (let i = 0; i <= GU; i++) for (let j = 0; j <= GV; j++) hm.push(groundAt(...at(i, j)))
  const sample = () => {
    const u = Math.random() * GU, v = Math.random() * GV, i = Math.floor(u), j = Math.floor(v)
    const h = [hm[i * (GV + 1) + j], hm[(i + 1) * (GV + 1) + j], hm[i * (GV + 1) + j + 1], hm[(i + 1) * (GV + 1) + j + 1]]
    if (h.some((y) => y === null) || Math.max(...h) - Math.min(...h) > 0.6) return null // only the open, gentle field
    const fu = u - i, fv = v - j, [x, z] = at(u, v)
    return new THREE.Vector3(x, (h[0] * (1 - fu) + h[1] * fu) * (1 - fv) + (h[2] * (1 - fu) + h[3] * fu) * fv, z)
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3()
  const scatter = (mesh, count, scale, tilt) => {
    let n = 0
    for (let tries = 0; n < count && tries < count * 3; tries++) {
      const p = sample(); if (!p) continue
      q.setFromEuler(new THREE.Euler((Math.random() - 0.5) * tilt, Math.random() * Math.PI, (Math.random() - 0.5) * tilt))
      const s = scale[0] + Math.random() * scale[1]; sc.set(s, s * (0.6 + Math.random() * 0.8), s)
      mesh.setMatrixAt(n++, m4.compose(p, q, sc))
    }
    mesh.count = n; return mesh
  }
  const blade = new THREE.PlaneGeometry(0.032, 0.28, 1, 3); blade.translate(0, 0.14, 0)
  const bp = blade.attributes.position
  for (let i = 0; i < bp.count; i++) bp.setX(i, bp.getX(i) * (1 - bp.getY(i) / 0.28)) // taper to a point
  const grass = scatter(new THREE.InstancedMesh(blade, grassMaterial(), reduced ? 9000 : 46000), reduced ? 9000 : 46000, [0.5, 0.8], 0.3)
  scene.add(grass)
  // small flowers: white and pale yellow, lit by the sun so they catch the glow
  const petal = new THREE.CircleGeometry(0.035, 6); petal.translate(0, 0.2, 0)
  const flowers = scatter(new THREE.InstancedMesh(petal, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x332a10, side: THREE.DoubleSide }), 1600), 1600, [0.7, 0.6], 1.2)
  const fc = new THREE.Color()
  for (let i = 0; i < flowers.count; i++) flowers.setColorAt(i, fc.set([0xfff7e6, 0xfff0a8, 0xf3d9ff, 0xffffff][i % 4]))
  scene.add(flowers)

  // pollen drifting in the low light, around wherever the camera is
  const PN = reduced ? 0 : 420, pollenPos = new Float32Array(PN * 3)
  for (let i = 0; i < PN; i++) pollenPos.set([(Math.random() - 0.5) * 30, Math.random() * 6, (Math.random() - 0.5) * 30], i * 3)
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pollenPos, 3))
  const pollen = new THREE.Points(pg, new THREE.PointsMaterial({ map: glow, size: 0.07, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe2a8 }))
  scene.add(pollen)

  // ── Epona, on ground level with the camera's field ──
  const horse = eponaGltf.scene
  horse.getObjectByName('GLTF_created_1')?.removeFromParent() // the file carries a second horse
  const hb = new THREE.Box3().setFromObject(horse), hs = 1.15 / hb.getSize(new THREE.Vector3()).y
  horse.scale.setScalar(hs)
  const camGround = groundAt(CAM_FROM.x, CAM_FROM.z) ?? CAM_FROM.y - 1.2
  let hx = CAM_FROM.x + fwd.x * 7, hz = CAM_FROM.z + fwd.z * 7, hy = camGround
  search: for (const d of [6, 7, 8, 5, 9, 10]) for (const lat of [1.8, 2.6, -1.8, 1.2]) {
    const x = CAM_FROM.x + fwd.x * d + side.x * lat, z = CAM_FROM.z + fwd.z * d + side.z * lat, y = groundAt(x, z)
    if (y !== null && Math.abs(y - camGround) < 0.45) { hx = x; hz = z; hy = y; break search }
  }
  horse.position.set(hx, hy - hb.min.y * hs, hz)
  horse.rotation.y = -2.2
  scene.add(horse)

  // Navi
  const navi = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xbfe2ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  navi.scale.setScalar(0.32); scene.add(navi)
  const naviLight = new THREE.PointLight(0x9cd0ff, 2.5, 4, 2); scene.add(naviLight)

  // ── the three places ──
  const flat = (v) => new THREE.Vector3(v.x, 0, v.z).normalize()
  const ground = (x, z, fb) => groundAt(x, z) ?? fb
  const around = (eye, dir, n, dist, spread) => Array.from({ length: n }, (_, i) => {
    const a = (i / (n - 1) - 0.5) * spread, d = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a)
    return new THREE.Vector3(eye.x + d.x * dist, 0, eye.z + d.z * dist)
  })
  const places = {}
  const picks = [] // meshes the pointer can choose, each with userData.pick

  {
    // Hyrule Castle: the camera stands south of the gate; the banners hang in an arc around it
    const gate = new THREE.Vector3(-0.03, 0, -17.92); gate.y = ground(gate.x, gate.z, 0)
    // the field ends just south of the drawbridge: stand back in the open, the town and castle on the skyline
    const eye = gate.clone().addScaledVector(fwd, -46); eye.y = ground(eye.x, eye.z, gate.y) + 2.4
    const group = new THREE.Group(); group.visible = false; scene.add(group)
    // the projects live in Kakariko now; the castle is where you write to the king (contact)
    places.castle = { eye, look: gate.clone().setY(gate.y + 6), group }
  }

  {
    // Death Mountain: at its foot, looking up at the glowing crater; the tablets stand around you
    const peak = new THREE.Vector3(115.6, 0, -34); peak.y = ground(peak.x, peak.z, 30)
    const dir = flat(peak.clone().sub(CAM_FROM))
    // far enough out on the open field that nothing hides the crater (checked with a ray)
    const eye = peak.clone().addScaledVector(dir, -110); eye.y = ground(eye.x, eye.z, camGround) + 3
    const group = new THREE.Group(); group.visible = false; scene.add(group)
    skillGroups.forEach((gr, i) => {
      const p = around(eye, dir, skillGroups.length, 8.5, 2.2)[i]
      p.y = ground(p.x, p.z, eye.y - 3) + 1.75
      const [map, emissiveMap] = tabletTextures(gr, lang)
      const stone = new THREE.MeshStandardMaterial({ color: 0x3d3633, roughness: 0.95 })
      const face = new THREE.MeshStandardMaterial({ map, emissiveMap, emissive: 0xff7a24, emissiveIntensity: 1.6, roughness: 0.9 })
      const slab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.7, 0.3), [stone, stone, stone, stone, face, stone])
      slab.position.copy(p); slab.lookAt(eye.x, p.y, eye.z); slab.rotateZ((Math.random() - 0.5) * 0.06)
      slab.userData.pick = { kind: 'stack', data: gr }
      group.add(slab); picks.push(slab)
    })
    // the crater: an orange glow, embers rising, slow smoke
    const crater = peak.clone(); crater.y += 1
    const lava = new THREE.PointLight(0xff6a1e, 900, 120, 1.6); lava.position.copy(crater); group.add(lava)
    const EN = reduced ? 60 : 260, ep = new Float32Array(EN * 3), ev = []
    for (let i = 0; i < EN; i++) { ep.set([crater.x + (Math.random() - 0.5) * 14, crater.y + Math.random() * 30, crater.z + (Math.random() - 0.5) * 14], i * 3); ev.push(0.04 + Math.random() * 0.09) }
    const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3))
    const embers = new THREE.Points(eg, new THREE.PointsMaterial({ map: glow, size: 2, color: 0xff5a10, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
    group.add(embers)
    const smoke = Array.from({ length: 6 }, (_, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0x5a4a44, transparent: true, opacity: 0.35, depthWrite: false }))
      s.scale.setScalar(26 + i * 6); s.position.copy(crater).add(new THREE.Vector3(0, 6 + i * 5, 0)); group.add(s); return s
    })
    // aim between the tablets and the crater: the volcano fills the top of the frame, the stones the bottom
    places.mountain = { eye, look: eye.clone().addScaledVector(dir, 30).setY(eye.y + 5), group, embers, ev, crater, smoke }
  }

  {
    // Lon Lon Ranch: the sign by the path, the ranch walls behind it
    const ranch = new THREE.Vector3(-32.1, 0, 66.1)
    const dir = flat(CAM_FROM.clone().sub(ranch))
    const eye = ranch.clone().addScaledVector(dir, 30); eye.y = ground(eye.x, eye.z, camGround) + 2.1
    ranch.y = ground(ranch.x + dir.x * 14, ranch.z + dir.z * 14, eye.y - 2)
    const group = new THREE.Group(); group.visible = false; scene.add(group)
    const sp = eye.clone().addScaledVector(dir, -6.5); sp.y = ground(sp.x, sp.z, eye.y - 2.1)
    const sign = new THREE.Group(); sign.position.copy(sp); sign.lookAt(eye.x, sp.y, eye.z)
    const wood = new THREE.MeshStandardMaterial({ color: 0x6e4823, roughness: 1 })
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.2, 0.12), [wood, wood, wood, wood, new THREE.MeshStandardMaterial({ map: signTexture(lang === 'en' ? 'Experience' : 'Experiencia', experience.filter((e) => e.type === 'work').map((e) => `${e.company} · ${l(e.period, lang)}`)), roughness: 1 }), wood])
    board.position.y = 1.9; board.userData.pick = { kind: 'experience' }
    for (const x of [-1.3, 1.3]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 8), wood); post.position.set(x, 1.1, -0.1); sign.add(post) }
    sign.add(board); group.add(sign); picks.push(board)
    places.ranch = { eye, look: sp.clone().setY(sp.y + 1.7).lerp(ranch.clone().setY(ranch.y + 3), 0.35), group }
  }

  // ── the picture ──
  const composer = new EffectComposer(renderer)
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.65, 0.9)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(bloom)
  composer.addPass(new ShaderPass(GradeShader))
  composer.addPass(new OutputPass())

  const animate = (s, camera) => {
    grass.material.uniforms.uTime.value = s
    clouds.material.uniforms.uTime.value = s
    clouds.position.copy(camera.position)
    pollen.position.set(Math.round(camera.position.x / 30) * 30, camera.position.y - 1.5, Math.round(camera.position.z / 30) * 30)
    pollen.rotation.y = s * 0.01
    for (const p of Object.values(places)) {
      if (!p.group.visible) continue
      p.sway?.forEach((c, i) => { c.rotation.x = Math.sin(s * 1.3 + i) * 0.05 })
      if (p.embers) {
        const a = p.embers.geometry.attributes.position
        for (let i = 0; i < a.count; i++) {
          let y = a.getY(i) + p.ev[i]
          if (y > p.crater.y + 32) { y = p.crater.y; a.setX(i, p.crater.x + (Math.random() - 0.5) * 14); a.setZ(i, p.crater.z + (Math.random() - 0.5) * 14) }
          a.setY(i, y)
        }
        a.needsUpdate = true
        p.smoke.forEach((m, i) => { m.position.y = p.crater.y + 6 + ((s * 1.5 + i * 5) % 30); m.material.opacity = 0.35 * (1 - ((s * 1.5 + i * 5) % 30) / 30) })
      }
    }
  }

  return { scene, composer, groundAt, fwd, side, horse, hb, hs, navi, naviLight, places, picks, animate }
}
