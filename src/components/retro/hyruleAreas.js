import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { projects } from '@/data/projects'
import { about } from '@/data/about'
import { l } from '@/lib/utils'
import { GradeShader, bannerTexture, signTexture, loadImage } from './hyruleField'

// The places you can walk into, each with its own music: Kakariko Village (the projects hang as banners
// around the well) and Kokiri Forest (who I am, by the path). The models are OoT 3D rips with 64-256 px
// textures; instead of replacing them (they are atlases: signs, windows, house fronts), every material
// keeps its game texture and gains a fine CC0 detail layer (Poly Haven grain and normals) chosen by
// what the surface is, so it stops reading as blur up close.

const S = 0.01 // the rips come in game units
const v = (x, y, z) => new THREE.Vector3(x * S, y * S, z * S)

// what each area is: where you stand, where you look, its light and its things (game units)
const AREAS = {
  kakariko: {
    music: 'kakariko',
    eye: v(-1500, 255, 520), look: v(400, 330, 640),
    sun: [72, -150], fog: [0xd8b48c, 0.012], exposure: 0.62, hemi: [0xbcd0ff, 0x4a3820, 0.8],
    banners: [[-804, 278], [-1108, 680], [-281, 398], [80, 736], [558, 999], [904, 53], [-560, 900]],
  },
  kokiri: {
    music: 'kokiri',
    eye: v(-150, 180, 1150), look: v(300, 190, -300),
    sun: [55, -40], fog: [0x33472a, 0.03], exposure: 1.05, hemi: [0xd2f0a8, 0x2a3a1c, 1.8],
    sign: [-191, 53], fireflies: true, closed: true,
  },
}

// ── detail mapping ──
const loader = new THREE.TextureLoader()
let detail = null
function detailMaps() {
  if (detail) return detail
  detail = {}
  for (const k of ['grass', 'rock', 'wood', 'dirt']) {
    const g = loader.load(`/models/hyrule/detail/${k}.jpg`), n = loader.load(`/models/hyrule/detail/${k}_n.jpg`)
    for (const t of [g, n]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4 }
    n.repeat.set(7, 7)
    detail[k] = { g, n }
  }
  return detail
}

// what the surface is, read from its game texture: greens are grass, warm darks are wood, warm lights
// are dirt, the greys are stone
function classify(tex) {
  const img = tex?.image; if (!img) return null
  const c = Object.assign(document.createElement('canvas'), { width: 16, height: 16 }), x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(img, 0, 0, 16, 16)
  const d = x.getImageData(0, 0, 16, 16).data
  let r = 0, g = 0, b = 0, n = 0
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++ }
  if (!n) return null
  r /= n; g /= n; b /= n
  const max = Math.max(r, g, b), min = Math.min(r, g, b), sat = max ? (max - min) / max : 0, lum = (r + g + b) / 3
  if (g >= r && g > b && sat > 0.18) return 'grass'
  if (sat < 0.16) return 'rock'
  if (r > g && lum < 110) return 'wood'
  return 'dirt'
}

function addDetail(material) {
  if (!material.map || material.alphaTest > 0 || material.userData.detailed) return
  const kind = classify(material.map); if (!kind) return
  const d = detailMaps()[kind]
  material.userData.detailed = true
  // relief only where there is light to show it: unlit (Basic) materials have no normal-map uniforms
  if (material.isMeshStandardMaterial) {
    material.normalMap = d.n; material.normalScale = new THREE.Vector2(0.55, 0.55)
    material.roughness = kind === 'rock' ? 0.85 : 0.95; material.metalness = 0
  }
  material.onBeforeCompile = (sh) => {
    sh.uniforms.hyDetail = { value: d.g }
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D hyDetail;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float hyD = texture2D(hyDetail, vMapUv * 7.0).r;
        diffuseColor.rgb *= 0.62 + hyD * 0.76;`)
  }
  material.customProgramCacheKey = () => `hy-detail-${kind}`
  material.needsUpdate = true
}

// a royal banner on a post, one per project
function makeBanner(pj, lang, rod) {
  const holder = new THREE.Group()
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 3.2), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9, transparent: true, alphaTest: 0.5, emissive: 0xffffff, emissiveIntensity: 0.18 }))
  cloth.geometry.translate(0, -1.6, 0); cloth.position.y = 3.3
  cloth.userData.pick = { kind: 'project', data: pj }
  loadImage(pj.image).then((img) => { cloth.material.map = cloth.material.emissiveMap = bannerTexture(pj, lang, img); cloth.material.needsUpdate = true })
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), rod); bar.rotation.z = Math.PI / 2; bar.position.y = 3.35
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 3.6, 8), rod); pole.position.set(1.2, 1.8, -0.02)
  holder.add(cloth, bar, pole)
  return { holder, cloth }
}

export function buildArea(id, { renderer, camera, gltf, glow, lang, reduced }) {
  const A = AREAS[id]
  const scene = new THREE.Scene()
  const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(A.sun[0]), THREE.MathUtils.degToRad(A.sun[1]))
  const sky = new Sky(); sky.scale.setScalar(4500)
  sky.material.uniforms.turbidity.value = 5; sky.material.uniforms.rayleigh.value = id === 'kokiri' ? 1.2 : 2
  sky.material.uniforms.mieCoefficient.value = 0.005; sky.material.uniforms.mieDirectionalG.value = 0.85
  sky.material.uniforms.sunPosition.value.copy(sun)
  // the forest is closed by its canopy: no bright sky through the gaps, a deep green dusk instead
  if (A.closed) scene.background = new THREE.Color(A.fog[0]); else scene.add(sky)
  const pmrem = new THREE.PMREMGenerator(renderer), skyOnly = new THREE.Scene(); skyOnly.add(sky.clone())
  scene.environment = pmrem.fromScene(skyOnly).texture; pmrem.dispose()
  scene.environmentIntensity = 0.5
  scene.fog = new THREE.FogExp2(A.fog[0], A.fog[1])
  const sunLight = new THREE.DirectionalLight(id === 'kokiri' ? 0xffe2a0 : 0xffd2a0, 2.6); sunLight.position.copy(sun).multiplyScalar(60); scene.add(sunLight)
  scene.add(new THREE.HemisphereLight(...A.hemi))

  const land = gltf.scene; land.scale.setScalar(S); scene.add(land)
  land.traverse((o) => { [].concat(o.material ?? []).forEach(addDetail) })
  land.updateMatrixWorld(true)
  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0)
  const groundAt = (x, z) => { ray.set(new THREE.Vector3(x, 80, z), down); const h = ray.intersectObject(land, true).find((i) => !i.object.material.alphaTest); return h ? h.point.y : null }

  const root = new THREE.Group(); scene.add(root)
  const picks = [], sway = []
  const eye = A.eye.clone(), look = A.look.clone()
  if (A.banners) {
    const rod = new THREE.MeshStandardMaterial({ color: 0x6b4a22, metalness: 0.3, roughness: 0.6 })
    A.banners.forEach(([x, z], i) => {
      const pj = projects[i]; if (!pj) return
      const { holder, cloth } = makeBanner(pj, lang, rod)
      holder.position.set(x * S, groundAt(x * S, z * S) ?? 0, z * S)
      holder.lookAt(eye.x, holder.position.y, eye.z)
      root.add(holder); picks.push(cloth); sway.push(cloth)
    })
  }
  if (A.sign) {
    const [x, z] = A.sign, p = new THREE.Vector3(x * S, 0, z * S); p.y = groundAt(p.x, p.z) ?? 0
    const sign = new THREE.Group(); sign.position.copy(p); sign.lookAt(eye.x, p.y, eye.z)
    const wood = new THREE.MeshStandardMaterial({ color: 0x6e4823, roughness: 1 })
    const facts = about.quickFacts.map((f) => `${l(f.label, lang)}: ${l(f.value, lang)}`)
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.2, 0.12), [wood, wood, wood, wood, new THREE.MeshStandardMaterial({ map: signTexture('Vicente Aznar', facts), roughness: 1 }), wood])
    board.position.y = 1.9; board.userData.pick = { kind: 'about' }
    for (const sx of [-1.3, 1.3]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 8), wood); post.position.set(sx, 1.1, -0.1); sign.add(post) }
    sign.add(board); root.add(sign); picks.push(board)
  }

  // fireflies in the forest: slow, wandering, warm
  let flies = null
  if (A.fireflies && !reduced) {
    const N = 140, pos = new Float32Array(N * 3), seed = []
    for (let i = 0; i < N; i++) { pos.set([eye.x + (Math.random() - 0.5) * 22, eye.y - 1 + Math.random() * 4, eye.z - Math.random() * 20], i * 3); seed.push(Math.random() * 100) }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    flies = new THREE.Points(g, new THREE.PointsMaterial({ map: glow, size: 0.12, color: 0xd8ff7a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
    flies.userData = { base: pos.slice(), seed }
    scene.add(flies)
  }

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.6, 0.88))
  composer.addPass(new ShaderPass(GradeShader))
  composer.addPass(new OutputPass())

  const animate = (s) => {
    sway.forEach((c, i) => { c.rotation.x = Math.sin(s * 1.3 + i) * 0.05 })
    if (flies) {
      const a = flies.geometry.attributes.position, b = flies.userData.base, sd = flies.userData.seed
      for (let i = 0; i < a.count; i++) { const k = sd[i]; a.setXYZ(i, b[i * 3] + Math.sin(s * 0.4 + k) * 0.6, b[i * 3 + 1] + Math.sin(s * 0.7 + k * 2) * 0.35, b[i * 3 + 2] + Math.cos(s * 0.3 + k) * 0.6) }
      a.needsUpdate = true
      flies.material.opacity = 0.65 + Math.sin(s * 3) * 0.25
    }
  }

  return { scene, composer, eye, look, root, picks, animate, music: A.music, exposure: A.exposure }
}
