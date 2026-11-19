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

// a royal banner, embroidered: woven crimson, a gold border, the crest (the Triforce over the wings), the
// project's name and its line, a swallowtail. The screenshots live in the dialog, where they are sharp.
export function bannerTexture(p, lang) {
  const W = 640, H = 1280, [c, x] = canvasOf(W, H)
  const shape = (inset) => { x.beginPath(); x.moveTo(inset, inset); x.lineTo(W - inset, inset); x.lineTo(W - inset, H - inset * 1.3); x.lineTo(W / 2, H - 150 + inset * 0.6); x.lineTo(inset, H - inset * 1.3); x.closePath() }
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#8e1f24'); g.addColorStop(0.55, '#6d151b'); g.addColorStop(1, '#4a0d12')
  shape(0); x.fillStyle = g; x.fill()
  x.save(); shape(0); x.clip()
  for (let y = 0; y < H; y += 3) { x.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.04})`; x.fillRect(0, y, W, 1) } // the weave
  for (let X0 = 0; X0 < W; X0 += 3) { x.fillStyle = `rgba(255,220,200,${0.02 + Math.random() * 0.02})`; x.fillRect(X0, 0, 1, H) }
  const sh = x.createRadialGradient(W / 2, H * 0.35, 40, W / 2, H * 0.4, H * 0.75); sh.addColorStop(0, 'rgba(255,255,255,.07)'); sh.addColorStop(1, 'rgba(0,0,0,.35)')
  x.fillStyle = sh; x.fillRect(0, 0, W, H)
  x.restore()
  const gold = x.createLinearGradient(0, 0, 0, H); gold.addColorStop(0, '#f3d27a'); gold.addColorStop(0.5, '#c99a3e'); gold.addColorStop(1, '#e8c063')
  x.strokeStyle = gold; x.lineWidth = 14; shape(30); x.stroke()
  x.lineWidth = 3; shape(52); x.stroke()
  // the crest: wings, then the Triforce
  const cx = W / 2, cy = 270
  x.fillStyle = gold
  for (const s of [-1, 1]) {
    x.beginPath(); x.moveTo(cx + s * 40, cy + 40)
    for (let i = 0; i < 5; i++) x.quadraticCurveTo(cx + s * (90 + i * 30), cy - 70 + i * 26, cx + s * (70 + i * 34), cy + 10 + i * 22)
    x.quadraticCurveTo(cx + s * 110, cy + 120, cx + s * 40, cy + 70); x.closePath(); x.fill()
  }
  const tri = (ax, ay, s) => { x.beginPath(); x.moveTo(ax, ay - s); x.lineTo(ax + s * 1.15, ay + s); x.lineTo(ax - s * 1.15, ay + s); x.closePath(); x.fill() }
  tri(cx, cy - 46, 44); tri(cx - 51, cy + 42, 44); tri(cx + 51, cy + 42, 44)
  x.fillStyle = '#6d151b'; x.beginPath(); x.moveTo(cx - 51, cy - 2); x.lineTo(cx + 51, cy - 2); x.lineTo(cx, cy + 86); x.closePath(); x.fill()
  // the name and its line
  x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 6; x.shadowOffsetY = 3
  x.fillStyle = '#fbefd2'; let size = 88; x.font = `600 ${size}px Georgia, "Times New Roman", serif`
  const name = wrap(x, p.title, W - 150).slice(0, 2)
  while (name.some((n) => x.measureText(n).width > W - 150) && size > 54) { size -= 4; x.font = `600 ${size}px Georgia, serif` }
  name.forEach((n, i) => x.fillText(n, cx, 520 + i * (size + 8)))
  const below = 520 + (name.length - 1) * (size + 8) + 52
  x.shadowBlur = 0; x.shadowOffsetY = 0; x.fillStyle = gold
  x.fillRect(cx - 120, below, 240, 3); x.beginPath(); x.arc(cx, below + 1.5, 9, 0, 7); x.fill()
  x.fillStyle = '#f0d9a6'; x.font = 'italic 400 38px Georgia, serif'
  wrap(x, l(p.tagline, lang), W - 170).slice(0, 4).forEach((ln, i) => x.fillText(ln, cx, below + 76 + i * 50))
  x.fillStyle = 'rgba(240,217,166,.8)'; x.font = '500 28px Georgia, serif'
  x.fillText(p.tech.slice(0, 3).join('  ·  '), cx, H - 260)
  return tex(c)
}

// a Goron tablet: dark stone, the group carved in and glowing like embers (a second map lights the text)
function tabletTextures(gr, lang) {
  const [c, x] = canvasOf(512, 680), [e, ex] = canvasOf(512, 680)
  // weathered volcanic stone: a warm grey, mottled, darker toward the edges, a chiselled border
  const g = x.createRadialGradient(256, 300, 60, 256, 340, 420); g.addColorStop(0, '#8b8076'); g.addColorStop(1, '#4e4640')
  x.fillStyle = g; x.fillRect(0, 0, 512, 680)
  for (let i = 0; i < 5200; i++) { const v = 70 + Math.random() * 70; x.fillStyle = `rgba(${v},${v - 8},${v - 14},${0.15 + Math.random() * 0.25})`; x.fillRect(Math.random() * 512, Math.random() * 680, 1 + Math.random() * 5, 1 + Math.random() * 5) }
  for (let i = 0; i < 14; i++) { x.strokeStyle = 'rgba(30,22,18,.35)'; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); let px = Math.random() * 512, py = Math.random() * 680; x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (Math.random() - 0.5) * 60; py += Math.random() * 40; x.lineTo(px, py) } x.stroke() } // cracks
  x.strokeStyle = 'rgba(25,18,14,.6)'; x.lineWidth = 8; x.strokeRect(26, 26, 460, 628)
  x.strokeStyle = 'rgba(255,240,220,.12)'; x.lineWidth = 2; x.strokeRect(34, 34, 444, 612)
  ex.fillStyle = '#000'; ex.fillRect(0, 0, 512, 680)
  const carve = (ctx, glow) => {
    ctx.textAlign = 'center'; ctx.fillStyle = glow ? '#ffb055' : '#2a1d16'
    ctx.font = '700 54px Georgia, serif'; ctx.fillText(l(gr.label, lang), 256, 112)
    ctx.fillRect(150, 138, 212, 4)
    ctx.font = '600 36px Georgia, serif'
    gr.items.slice(0, 9).forEach((it, i) => ctx.fillText(it, 256, 206 + i * 50))
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

// turn a bone by an angle around an axis given in its model's own space, on top of its rest pose
const _qa = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _qr = new THREE.Quaternion(), _ax = new THREE.Vector3()
export function bendBone(root, bone, rest, axis, angle) {
  root.getWorldQuaternion(_qr); bone.parent.getWorldQuaternion(_qp)
  _ax.copy(axis).applyQuaternion(_qr).applyQuaternion(_qp.invert())
  bone.quaternion.copy(rest).premultiply(_qa.setFromAxisAngle(_ax, angle))
}

// Epona's legs, neck and tail, by bone: a rotary gallop (hind pair, then the fore pair, two strides a second)
// that fades into standing still, the head nodding and the tail swishing
export function horseRig(horse) {
  const X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1)
  const part = (name) => { const b = horse.getObjectByName(name); return b && { b, rest: b.quaternion.clone() } }
  const legs = [['bone_16_21', 'bone_17_20', 0, 1], ['bone_20_26', 'bone_21_25', 0.1, 1], ['bone_4_3', 'bone_5_2', 0.42, -1], ['bone_11_12', 'bone_12_11', 0.52, -1]]
    .map(([u, lo, ph, knee]) => ({ u: part(u), lo: part(lo), ph, knee })).filter((p) => p.u && p.lo)
  const neck = part('bone_7_8'), tail = part('bone_23_30')
  return (t, k) => {
    const w = t * Math.PI * 4
    for (const p of legs) {
      const a = Math.sin(w + p.ph * Math.PI * 2)
      bendBone(horse, p.u.b, p.u.rest, X, a * 0.55 * k)
      bendBone(horse, p.lo.b, p.lo.rest, X, Math.max(0, -a) * 0.85 * k * p.knee) // the leg folds as it comes forward
    }
    if (neck) bendBone(horse, neck.b, neck.rest, X, Math.sin(w + 0.6) * 0.1 * k + Math.sin(t * 0.8) * 0.06 * (1 - k))
    if (tail) bendBone(horse, tail.b, tail.rest, Z, Math.sin(t * 1.7) * 0.18 * (1 - k * 0.6) + 0.25 * k)
  }
}

const WOOD = 0x6e4823
// a notice board on two posts, facing a point, that you read (pick) up close
function noticeBoard(at, face, title, lines, pick, picks) {
  const g = new THREE.Group(); g.position.copy(at); g.lookAt(face.x, at.y, face.z)
  const wood = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 1 })
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.07, 0.08), [wood, wood, wood, wood, new THREE.MeshStandardMaterial({ map: signTexture(title, lines), roughness: 1 }), wood])
  board.position.y = 1.25; board.userData.pick = pick; board.castShadow = true
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.07, 0.36), wood); roof.position.set(0, 1.84, 0.06); roof.rotation.x = -0.25
  g.add(board, roof)
  for (const x of [-0.72, 0.72]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.9, 8), wood); post.position.set(x, 0.95, -0.06); post.castShadow = true; g.add(post) }
  picks.push(board)
  return g
}

// the way into a place: two posts, a crossbeam with its name, a torch burning on each post
function gateArch(at, face, name, glow) {
  const g = new THREE.Group(); g.position.copy(at); g.lookAt(face.x, at.y, face.z)
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 0.95 })
  for (const x of [-1.25, 1.25]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.9, 10), wood); post.position.set(x, 1.45, 0); post.castShadow = true
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
    flame.scale.setScalar(0.55); flame.position.set(x, 3.05, 0); flame.userData.flame = true
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0x2b2420, metalness: 0.6, roughness: 0.5 })); bowl.position.set(x, 2.95, 0)
    g.add(post, flame, bowl)
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.16, 0.2), wood); beam.position.y = 2.62; beam.castShadow = true
  const [c, x] = canvasOf(900, 300)
  const gr = x.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, '#a8763f'); gr.addColorStop(1, '#7a4e26'); x.fillStyle = gr; x.fillRect(0, 0, 900, 300)
  x.strokeStyle = '#3b2210'; x.lineWidth = 10; x.strokeRect(14, 14, 872, 272)
  x.fillStyle = '#2a170a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 92px Georgia, serif'; x.fillText(name, 450, 156)
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.6), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 1, side: THREE.DoubleSide }))
  sign.position.set(0, 2.2, 0.12); sign.userData.pick = null
  const light = new THREE.PointLight(0xff9a40, 6, 9, 1.6); light.position.set(0, 2.9, 0.6)
  g.add(beam, sign, light)
  return g
}

// a small plaque for the fence: three planks, burnt-in lettering big enough to read from a few steps away
function plaqueTexture(title, role, period) {
  const [c, x] = canvasOf(768, 512)
  for (let i = 0; i < 3; i++) {
    const g = x.createLinearGradient(0, i * 171, 0, i * 171 + 171); g.addColorStop(0, '#a8763f'); g.addColorStop(1, '#7f5228')
    x.fillStyle = g; x.fillRect(0, i * 171 + 3, 768, 165)
    x.strokeStyle = 'rgba(55,30,12,.3)'; x.lineWidth = 2
    for (let k = 0; k < 7; k++) { x.beginPath(); const y = i * 171 + 14 + Math.random() * 140; x.moveTo(0, y); x.bezierCurveTo(260, y + 7, 520, y - 7, 768, y + 3); x.stroke() }
  }
  x.fillStyle = '#4a2d14'; for (const [px, py] of [[30, 30], [738, 30], [30, 482], [738, 482]]) { x.beginPath(); x.arc(px, py, 9, 0, 7); x.fill() } // nails
  x.textAlign = 'center'; x.fillStyle = '#2a170a'
  x.font = '700 92px Georgia, serif'; x.fillText(title, 384, 128)
  x.font = '600 50px Georgia, serif'; wrap(x, role, 680).slice(0, 2).forEach((ln, i) => x.fillText(ln, 384, 262 + i * 58))
  x.font = 'italic 500 46px Georgia, serif'; x.fillText(period, 384, 440)
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
  // the sun casts real shadows, in a small box that follows you around (see followSun)
  const sunLight = new THREE.DirectionalLight(0xffbe86, 2.8); sunLight.position.copy(SUN).multiplyScalar(100); scene.add(sunLight, sunLight.target)
  sunLight.castShadow = true; sunLight.shadow.mapSize.set(2048, 2048); sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.04
  Object.assign(sunLight.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 260 })
  const followSun = (p) => { sunLight.target.position.copy(p); sunLight.position.copy(p).addScaledVector(SUN, 120) }
  scene.add(new THREE.HemisphereLight(0x9fb2e0, 0x4a3820, 1.15)) // enough sky in the shade that walls facing away from the sun keep their stone

  const land = fieldGltf.scene; land.scale.setScalar(FIELD_SCALE); scene.add(land)
  land.updateMatrixWorld(true)
  land.traverse((o) => { if (o.material) { o.material.envMapIntensity = 0.6; detailTerrain(o.material) } })

  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0)
  // the ground under a point, and whether it is the river (its two surface layers, by material: the rip names
  // nothing). ponytail: a fixed list, measured on this model; another field model needs its own
  const WATER = new Set(['material-007CFA5F-symbol', 'material-01633843-symbol'])
  const groundAt = (x, z) => { ray.set(new THREE.Vector3(x, 400, z), down); const h = ray.intersectObject(land, true)[0]; return h ? h.point.y : null }
  const wetAt = (x, z) => { ray.set(new THREE.Vector3(x, 400, z), down); return WATER.has(ray.intersectObject(land, true)[0]?.object.material?.name) }
  const solids = [land] // what you walk on and bump into
  // the nearest open, level ground to a point: a spiral out from it until four nearby samples agree
  const findFlat = (p) => {
    for (let r = 0; r < 30; r += 1.5) for (let a = 0; a < Math.PI * 2; a += r ? 0.7 / Math.max(1, r / 3) : 7) {
      const x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r, y = groundAt(x, z)
      if (y === null || wetAt(x, z)) continue
      const ys = [[0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8]].map(([u, w]) => groundAt(x + u, z + w))
      if (ys.every((h) => h !== null && Math.abs(h - y) < 0.25)) return new THREE.Vector3(x, y, z)
    }
    return new THREE.Vector3(p.x, groundAt(p.x, p.z) ?? p.y, p.z)
  }
  // the nearest open, dry ground with room around it: everything on a ring of radius R is dry and gentle
  const findOpen = (p, R) => {
    for (let r = 0; r < 60; r += 3) for (let a = 0; a < Math.PI * 2; a += r ? 1.2 / Math.max(1, r / 6) : 7) {
      const x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r, y = groundAt(x, z)
      if (y === null || wetAt(x, z)) continue
      let ok = true
      for (let k = 0; k < 12 && ok; k++) {
        const u = x + Math.cos(k / 12 * Math.PI * 2) * R, w = z + Math.sin(k / 12 * Math.PI * 2) * R, h = groundAt(u, w)
        ok = h !== null && !wetAt(u, w) && Math.abs(h - y) < 1.1
      }
      if (ok) return new THREE.Vector3(x, y, z)
    }
    return findFlat(p)
  }
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
  const scatter = (mesh, count, scale, tilt, pick = sample) => {
    let n = 0
    for (let tries = 0; n < count && tries < count * 3; tries++) {
      const p = pick(); if (!p) continue
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
  const petal = new THREE.CircleGeometry(0.02, 10); petal.translate(0, 0.2, 0)
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
  navi.scale.setScalar(0.2); scene.add(navi)
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
    const group = new THREE.Group(); scene.add(group)
    // the projects live in Kakariko now; the castle is where you write to the king (contact)
    // a notice board where the field meets the drawbridge road: write to the king
    const at = findFlat(eye.clone().addScaledVector(fwd, 6))
    group.add(noticeBoard(at, eye, lang === 'en' ? 'To the King' : 'Al Rey', lang === 'en' ? ['Messages, work, ideas.', 'The gate is open.'] : ['Mensajes, trabajos, ideas.', 'La puerta está abierta.'], { kind: 'contact' }, picks))
    places.castle = { eye, look: gate.clone().setY(gate.y + 6), group, spawn: at.clone().addScaledVector(fwd, -4) }
  }

  {
    // Death Mountain: at its foot, looking up at the glowing crater; the tablets stand around you
    const peak = new THREE.Vector3(115.6, 0, -34); peak.y = ground(peak.x, peak.z, 30)
    const dir = flat(peak.clone().sub(CAM_FROM))
    // far enough out on the open field that nothing hides the crater (checked with a ray)
    const eye = findOpen(peak.clone().addScaledVector(dir, -110), 7); eye.y += 3
    const group = new THREE.Group(); scene.add(group)
    skillGroups.forEach((gr, i) => {
      // an arc on dry ground in front of you, each one stood on its own level spot, Link's height and a bit
      const p = around(eye, dir, skillGroups.length, 6, 1.9)[i]; p.y = ground(p.x, p.z, eye.y - 3) + 0.95
      const [map, emissiveMap] = tabletTextures(gr, lang)
      const stone = new THREE.MeshStandardMaterial({ color: 0x6d645d, roughness: 0.95 })
      const face = new THREE.MeshStandardMaterial({ map, emissiveMap, emissive: 0xff8a30, emissiveIntensity: 1.4, roughness: 0.9 })
      const slab = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.93, 0.26), [stone, stone, stone, stone, face, stone])
      slab.castShadow = slab.receiveShadow = true
      slab.position.copy(p); slab.lookAt(eye.x, p.y, eye.z); slab.rotateZ((Math.random() - 0.5) * 0.06)
      slab.userData.pick = { kind: 'stack', data: gr }
      group.add(slab); picks.push(slab)
    })
    // a brazier in the middle of the arc, so the stone reads warm at dusk
    const fire = findFlat(eye.clone().addScaledVector(dir, 3.2))
    const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.2, 0.5, 14), new THREE.MeshStandardMaterial({ color: 0x2b2420, metalness: 0.6, roughness: 0.5 }))
    brazier.position.copy(fire).add(new THREE.Vector3(0, 0.25, 0)); brazier.castShadow = true
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xff9a40, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
    flame.scale.setScalar(0.9); flame.position.copy(fire).add(new THREE.Vector3(0, 0.75, 0)); flame.userData.flame = true
    const fireLight = new THREE.PointLight(0xff8a3c, 14, 14, 1.4); fireLight.position.copy(fire).add(new THREE.Vector3(0, 1.1, 0))
    group.add(brazier, flame, fireLight)
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
    // Lon Lon Ranch, from inside its walls. The 3DS model leaves the corral open to the sky, so the ground, the
    // track, its fence and the hay are built here (always there, like the walls); each job hangs on the fence
    const C = new THREE.Vector3(-30.1, 0, 66.75), R = 15.5
    const floorY = (x, z) => -0.08 + (x + 32.1) * 0.104 + (z - 66.1) * 0.046 // the walls' foot falls ~2.7 across the ring
    const tl = new THREE.TextureLoader(), grain = (k, rep) => {
      const t = tl.load(`/models/hyrule/detail/${k}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; return t
    }
    const shaped = (geo, lift) => { // a flat shape laid on the sloping floor, positioned at C
      geo.rotateX(-Math.PI / 2); const p = geo.attributes.position
      for (let i = 0; i < p.count; i++) p.setY(i, floorY(C.x + p.getX(i), C.z + p.getZ(i)) + lift)
      geo.computeVertexNormals(); const m = new THREE.Mesh(geo); m.position.set(C.x, 0, C.z); return m
    }
    const floor = shaped(new THREE.CircleGeometry(R, 96), 0)
    floor.material = new THREE.MeshStandardMaterial({ color: 0x9cbc58, map: grain('grass', 10), roughness: 1 })
    detailTerrain(floor.material)
    const TRACK = [7.4, 9.8]
    const track = shaped(new THREE.RingGeometry(TRACK[0], TRACK[1], 128, 2), 0.015)
    track.material = new THREE.MeshStandardMaterial({ color: 0xc9a173, map: grain('dirt', 14), roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 })
    const base = new THREE.Group(); base.add(floor, track); scene.add(base); solids.push(floor)
    floor.receiveShadow = track.receiveShadow = true

    // the fence around the inner paddock: posts and two rails, instanced
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2e, map: grain('wood', 1), roughness: 0.9 })
    const FR = TRACK[0] - 0.15, NP = 44
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13, 1, 0.13), woodMat, NP)
    const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.075, 0.05), woodMat, NP * 2)
    const pAt = (a) => new THREE.Vector3(C.x + Math.cos(a) * FR, 0, C.z + Math.sin(a) * FR)
    for (let i = 0; i < NP; i++) {
      const a = (i / NP) * Math.PI * 2, p = pAt(a), n = pAt(a + Math.PI * 2 / NP)
      p.y = floorY(p.x, p.z); n.y = floorY(n.x, n.z)
      posts.setMatrixAt(i, m4.compose(p.clone().setY(p.y + 0.45), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a), sc.set(1, 1, 1)))
      const mid = p.clone().lerp(n, 0.5), len = p.distanceTo(n)
      const yaw = Math.atan2(n.x - p.x, n.z - p.z) - Math.PI / 2
      for (const [j, h] of [[0, 0.42], [1, 0.78]]) rails.setMatrixAt(i * 2 + j, m4.compose(mid.clone().setY(mid.y + h), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), sc.set(len, 1, 1)))
    }
    base.add(posts, rails)

    // grass in the paddock and between the track and the walls; hay stacked by the barn
    const disc = (r0, r1) => () => {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(r0 * r0 + Math.random() * (r1 * r1 - r0 * r0))
      const x = C.x + Math.cos(a) * r, z = C.z + Math.sin(a) * r
      return new THREE.Vector3(x, floorY(x, z), z)
    }
    const inner = disc(0, FR - 0.3), outer = disc(TRACK[1] + 0.2, R - 1.2)
    const ranchGrass = scatter(new THREE.InstancedMesh(blade, grass.material, reduced ? 3000 : 14000), reduced ? 3000 : 14000, [0.5, 0.7], 0.3, () => (Math.random() < 0.45 ? inner : outer)())
    base.add(ranchGrass)
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xe0bd6a, map: grain('grass', 2), roughness: 1 })
    for (const [a, r, tilt] of [[-0.55, 12.2, 0], [-0.42, 12.4, 0.3], [-0.5, 12.3, 0]]) {
      const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1, 20), hayMat)
      const x = C.x + Math.cos(a) * r, z = C.z + Math.sin(a) * r
      bale.rotation.set(Math.PI / 2, 0, a + tilt); bale.position.set(x, floorY(x, z) + 0.48, z)
      base.add(bale)
    }

    // where you stand: by the wall with the low sun at your back, looking across the paddock
    const v = new THREE.Vector3(-SUN.x, 0, -SUN.z).normalize()
    const eye = C.clone().addScaledVector(v, -12); eye.y = floorY(eye.x, eye.z) + 1.65
    const group = new THREE.Group(); scene.add(group)
    const jobs = experience.filter((e) => e.type === 'work')
    const facing = Math.atan2(-v.z, -v.x) // the angle, around C, of the fence nearest you
    jobs.forEach((job, i) => {
      const a = facing + (i - (jobs.length - 1) / 2) * 0.34
      const p = new THREE.Vector3(C.x + Math.cos(a) * (FR + 0.1), 0, C.z + Math.sin(a) * (FR + 0.1)); p.y = floorY(p.x, p.z) + 0.95
      const face = new THREE.MeshStandardMaterial({ map: plaqueTexture(job.company, l(job.role, lang), l(job.period, lang)), roughness: 1 })
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.7, 0.05), [woodMat, woodMat, woodMat, woodMat, face, woodMat])
      board.position.copy(p); board.lookAt(eye.x, p.y, eye.z); board.rotateZ((i - 1) * 0.03)
      board.userData.pick = { kind: 'experience', page: i }
      group.add(board); picks.push(board)
    })
    places.ranch = { eye, look: C.clone().addScaledVector(v, -FR).setY(floorY(C.x, C.z) + 1.1), group }
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
    places.mountain.group.children.forEach((c) => { if (c.userData.flame) c.scale.setScalar(0.85 + Math.random() * 0.12) })
    for (const g of Object.values(gates)) g.group.children.forEach((c) => { if (c.userData.flame) c.scale.setScalar(0.5 + Math.sin(s * 17 + c.position.x * 3) * 0.05 + Math.random() * 0.05) })
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

  // ── the ways into the places you walk into: a gate of two posts and a sign, torches either side ──
  const gates = {}
  for (const [id, target, name] of [
    ['kokiri', CAM_FROM.clone().addScaledVector(side, -11).addScaledVector(fwd, 5), lang === 'en' ? 'Kokiri Forest' : 'Bosque Kokiri'],
    ['kakariko', CAM_FROM.clone().addScaledVector(flat(places.mountain.eye.clone().sub(CAM_FROM)), 26), lang === 'en' ? 'Kakariko Village' : 'Aldea Kakariko'],
  ]) {
    const at = findFlat(target), g = gateArch(at, CAM_FROM, name, glow)
    g.userData.enter = id; scene.add(g)
    gates[id] = { at, group: g, spawn: at.clone().addScaledVector(flat(CAM_FROM.clone().sub(at)), 3) }
  }
  // Lon Lon Ranch's door, out in the field before the opening in its wall (south-west): E there takes you in,
  // and E where you arrive inside brings you back out here, facing the field
  const rd = new THREE.Vector3(Math.cos(-2.62), 0, Math.sin(-2.62))
  const ranchDoor = findFlat(new THREE.Vector3(-30.1, 0, 66.75).addScaledVector(rd, 19.5))
  const door = gateArch(ranchDoor, ranchDoor.clone().add(rd), lang === 'en' ? 'Lon Lon Ranch' : 'Rancho Lon Lon', glow); scene.add(door)
  gates.ranch = { at: ranchDoor, group: door, spawn: ranchDoor.clone().addScaledVector(rd, 3), inner: true }
  places.ranchOut = { spawn: gates.ranch.spawn, look: gates.ranch.spawn.clone().addScaledVector(rd, 10), group: new THREE.Group() }
  places.ranch.spawn = places.ranch.eye.clone()
  places.mountain.spawn = places.mountain.eye.clone()
  land.traverse((o) => { if (o.isMesh) o.receiveShadow = true })
  horse.traverse((o) => { if (o.isMesh) o.castShadow = true })

  return { scene, composer, groundAt, fwd, side, horse, hb, hs, rig: horseRig(horse), navi, naviLight, places, picks, animate, solids, gates, followSun, findFlat }
}
