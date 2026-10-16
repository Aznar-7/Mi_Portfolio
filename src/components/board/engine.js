// The hero board: a canvas that autoroutes itself around the copy, grows buses out of real parts
// (each one a project), reacts to the cursor and lets visitors solder chips. Imperative on purpose:
// it redraws every frame, so it lives outside React and React only mounts and destroys it.

const P = 22 // grid pitch: the board's 0.1" raster
const PARTS = [
  { id: 'esp', w: 8, h: 11, at: [.635, .20], atM: [.3, .34], hM: 9, ref: 'U1 · ESP32-WROOM', side: 'left', href: '#trabajo' },
  { id: 'nfc', w: 9, h: 7, at: [.615, .66], atM: [.74, .36], ref: 'ANT1 · NFC 13.56 MHz', side: 'left', href: '#trabajo' },
  { id: 'eth', w: 6, h: 5, at: [.495, .08], atM: null, ref: 'J1 · RJ45', side: 'down', href: '#trabajo' },
]
const ESP_PINS_L = ['3V3', 'EN', 'IO36', 'IO39', 'IO34', 'IO35', 'IO32', 'IO33']
const key = (c, r) => c + ',' + r
const rnd = (a, b) => a + Math.random() * (b - a)

/**
 * @param {object} o
 * @param {HTMLElement} o.root      .site element: holds the color tokens
 * @param {HTMLElement} o.hero
 * @param {HTMLCanvasElement} o.canvas
 * @param {HTMLElement} o.partsLayer  receives one link per part
 * @param {HTMLElement} o.statusEl
 * @param {HTMLElement[]} o.keepOut   elements the copper must route around
 * @param {HTMLElement} [o.photo]     the portrait: placed on the board as part U0, with its own bus
 * @param {HTMLElement} [o.frame]     the centered content box: parts sit inside it, copper fades outside it
 * @param {HTMLElement[]} o.letters   name letters that catch the signal
 * @param {object} o.text           { routing(done,total), hint(touch), hint2, complete, parts: {id: [tip, sub]} }
 * @param {() => void} o.onComplete fired once six chips are soldered
 * @param {() => void} [o.onSolder]   a chip lands (sound hook)
 * @param {() => void} [o.onPartHover] a part is hovered (sound hook)
 */
export function createBoard({ root, hero, canvas, partsLayer, statusEl, keepOut, photo, frame, letters, text, onComplete, onSolder, onPartHover }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = matchMedia('(pointer: coarse)').matches
  const ctx = canvas.getContext('2d')
  const tok = (n) => getComputedStyle(root).getPropertyValue(n).trim()
  const C = { f: tok('--fcu'), b: tok('--bcu'), silk: tok('--silk'), pad: tok('--pad') }
  let W, H, cols, rows, used, blocked, traces, parts, pulses, sparks, t0, booted, letterBoxes = []
  let mouse = { x: -1e4, y: -1e4 }, chipN = 1, raf = 0, visible = true, dead = false, fl = 0, fw = 0
  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id) }
  const free = (c, r) => c > 0 && r > 0 && c < cols - 1 && r < rows && !used.has(key(c, r)) && !blocked.has(key(c, r))

  function blockRect(c0, r0, w, h, m = 1) { for (let c = c0 - m; c < c0 + w + m; c++) for (let r = r0 - m; r < r0 + h + m; r++) blocked.add(key(c, r)) }

  function addTrace(cells, layer, delay, extra = {}) {
    cells.forEach(p => used.add(key(p.c, p.r)))
    // keep only corners so the polyline stays short
    const pts = cells.filter((p, i) => i === 0 || i === cells.length - 1 ||
      (p.c - cells[i - 1].c) !== (cells[i + 1].c - p.c) || (p.r - cells[i - 1].r) !== (cells[i + 1].r - p.r))
      .map(p => ({ x: p.c * P + P / 2, y: p.r * P + P / 2 }))
    let len = 0; const seg = [0]
    for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(len) }
    // copper outside the content frame recedes so the composition reads at any width
    const out = Math.max(0, fl - pts[0].x, pts[0].x - (fl + fw))
    const t = { pts, seg, len, layer, born: t0 + (reduced ? -1e5 : delay), heat: 0, fade: Math.max(0.22, 1 - out / 340), cells, a: cells[0], b: cells[cells.length - 1], ...extra }
    traces.push(t); return t
  }
  function pointAt(t, d) {
    let i = 1; while (i < t.seg.length - 1 && t.seg[i] < d) i++
    const a = t.pts[i - 1], b = t.pts[i], k = (d - t.seg[i - 1]) / ((t.seg[i] - t.seg[i - 1]) || 1)
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
  }

  // A bus: several pins follow one move sequence, translated across the bus axis, so copies never cross.
  // axis 'x' moves are (dir,0) and (dir,±1); axis 'y' moves are (0,dir) and (±1,dir).
  function bus(starts, axis, dir, length, delay, layer, extra, toEdge) {
    const moves = []
    while (moves.length < length) {
      const run = Math.floor(rnd(3, 9)); for (let i = 0; i < run; i++) moves.push(0)
      const s = toEdge || Math.random() < .5 ? 1 : -1, d = Math.floor(rnd(1, 4)); for (let i = 0; i < d; i++) moves.push(s)
    }
    if (toEdge) moves.push(...Array(rows).fill(0))
    return starts.map((s, i) => {
      const cells = [s]; let { c, r } = s
      for (const m of moves) {
        if (axis === 'x') { c += dir; r += m } else { r += dir; c += m }
        if (toEdge && r >= rows) break
        if (!free(c, r)) break
        cells.push({ c, r })
      }
      return cells.length > 3 ? addTrace(cells, layer, delay + i * 60, extra) : null
    }).filter(Boolean)
  }

  // 45° routing: straight then diagonal, or diagonal then straight; the first free option wins
  function route(a, b) {
    const dx = b.c - a.c, dy = b.r - a.r, sx = Math.sign(dx), sy = Math.sign(dy)
    const diag = Math.min(Math.abs(dx), Math.abs(dy)), straight = Math.abs(Math.abs(dx) - Math.abs(dy)), ax = Math.abs(dx) > Math.abs(dy)
    for (const order of [[['d', diag], ['s', straight]], [['s', straight], ['d', diag]]].sort(() => Math.random() - .5)) {
      const cells = [a]; let { c, r } = a, ok = true
      for (const [kind, n] of order) for (let i = 0; i < n && ok; i++) {
        if (kind === 'd') { c += sx; r += sy } else if (ax) c += sx; else r += sy
        if (!(c === b.c && r === b.r) && !free(c, r)) ok = false
        cells.push({ c, r })
      }
      if (ok && cells.length > 2) return cells
    }
    return null
  }
  function freeCell(near, rmin, rmax) {
    for (let n = 0; n < 40; n++) {
      const c = near ? Math.round(near.c + rnd(-rmax, rmax)) : Math.floor(rnd(1, cols - 1))
      const r = near ? Math.round(near.r + rnd(-rmax, rmax)) : Math.floor(rnd(1, rows - 1))
      if (near && Math.hypot(c - near.c, r - near.r) < rmin) continue
      if (free(c, r)) return { c, r }
    }
    return null
  }

  function setHint() {
    statusEl.replaceChildren(text.hint(touch), Object.assign(document.createElement('b'), { textContent: 'U' + chipN }))
    // only point at the parts when at least one fit on this screen
    if (parts.some(p => !p.chip)) statusEl.append(document.createElement('br'), text.hint2)
  }

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2), rect = hero.getBoundingClientRect()
    letterBoxes = letters.map(l => { const b = l.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 + scrollY } }) // page coords
    W = rect.width; H = rect.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cols = Math.ceil(W / P); rows = Math.ceil(H / P)
    const fr = (frame ?? hero).getBoundingClientRect(); fl = fr.left - rect.left; fw = fr.width
    used = new Set(); blocked = new Set(); traces = []; parts = []; pulses = []; sparks = []; t0 = performance.now(); booted = false
    // keep the header band clean
    const head = hero.querySelector('.site-header')?.getBoundingClientRect()
    if (head) blockRect(0, 0, cols, Math.ceil((head.bottom - rect.top) / P) + 1)
    for (const el of keepOut) {
      const b = el.getBoundingClientRect()
      blockRect(Math.floor((b.left - rect.left) / P), Math.floor((b.top - rect.top) / P), Math.ceil(b.width / P) + 1, Math.ceil(b.height / P) + 1)
    }

    // the portrait sits on the board as U0: its footprint is blocked and a bus leaves its left edge
    const pr = photo?.getBoundingClientRect()
    if (pr && pr.width) {
      const c = Math.floor((pr.left - rect.left) / P), r = Math.floor((pr.top - rect.top) / P)
      const w = Math.ceil(pr.width / P), h = Math.ceil(pr.height / P)
      blockRect(c - 1, r - 1, w + 1, h + 1)
      parts.push({ id: 'photo', c, r, w, h, x: pr.left - rect.left, y: pr.top - rect.top, pw: pr.width, ph: pr.height, ref: 'U0 · VICENTE AZNAR', side: 'photo', born: t0, hover: 0 })
    }

    // place parts where they fit; on narrow screens some simply stay off the board
    partsLayer.replaceChildren()
    const narrow = W < 760
    for (const base of PARTS) {
      const at = narrow ? base.atM : base.at; if (!at) continue
      const def = narrow && base.hM ? { ...base, h: base.hM } : base
      const c = Math.max(2, Math.round((fl + fw * at[0]) / P - def.w / 2)), r0 = Math.max(4, Math.round(rows * at[1] - def.h / 2))
      // slide down a few rows if the header or the copy sits on the preferred spot
      const fitsAt = (r) => {
        if (c <= 1 || r <= 2 || c + def.w >= cols - 1 || r + def.h >= rows - 1) return false
        for (let i = 0; i < def.w; i++) for (let j = 0; j < def.h; j++) if (blocked.has(key(c + i, r + j))) return false
        return true
      }
      const r = [0, 1, 2, 3, 4].map((d) => r0 + d).find(fitsAt)
      if (r === undefined) continue
      blockRect(c, r, def.w, def.h)
      const p = { ...def, c, r, born: t0 + (reduced ? -1e5 : 120 * parts.length), hover: 0, over: false }
      parts.push(p)
      const [tip, sub] = text.parts[def.id]
      const a = Object.assign(document.createElement('a'), { className: 'part', href: def.href })
      a.setAttribute('aria-label', `${tip}: ${sub}`)
      a.style.cssText = `left:${c * P}px; top:${r * P}px; width:${def.w * P}px; height:${def.h * P}px`
      const label = document.createElement('span')
      label.append(tip, Object.assign(document.createElement('small'), { textContent: sub }))
      a.append(label)
      a.onpointerenter = a.onfocus = () => { p.over = true; onPartHover?.() }
      a.onpointerleave = a.onblur = () => { p.over = false }
      partsLayer.append(a)
    }

    // buses grow out of each part; the exit bus routes first so nothing cuts it
    for (const p of [...parts].sort((a, b) => (b.side === 'down') - (a.side === 'down'))) {
      const extra = { part: p }
      if (p.side === 'left') {
        const pins = Array.from({ length: Math.min(6, p.h - 3) }, (_, i) => ({ c: p.c - 2, r: p.r + 2 + i }))
        pins.forEach(s => blocked.delete(key(s.c, s.r)))
        bus(pins, 'x', -1, Math.floor(rnd(14, 26)), 300, 'f', extra)
        const right = Array.from({ length: Math.min(4, p.h - 4) }, (_, i) => ({ c: p.c + p.w + 1, r: p.r + 3 + i }))
        right.forEach(s => blocked.delete(key(s.c, s.r)))
        bus(right, 'x', 1, 8, 500, 'b', extra)
      } else if (p.side === 'photo') {
        const pins = Array.from({ length: Math.min(7, p.h - 4) }, (_, i) => ({ c: p.c - 2, r: p.r + 2 + i * 2 }))
        pins.forEach(s => blocked.delete(key(s.c, s.r)))
        bus(pins, 'x', -1, Math.floor(rnd(10, 18)), 200, 'f', extra)
      } else {
        const pins = Array.from({ length: Math.min(5, p.w - 1) }, (_, i) => ({ c: p.c + 1 + i, r: p.r + p.h + 1 }))
        pins.forEach(s => blocked.delete(key(s.c, s.r)))
        p.exit = bus(pins, 'y', 1, 6, 300, 'f', extra, true)
      }
    }

    // filler traces, born outward from the parts
    // sparse on purpose: the board should frame the content, not compete with it
    const target = Math.round(cols * rows / 72)
    for (let n = 0, made = 0; n < target * 4 && made < target; n++) {
      const a = freeCell(); if (!a) continue
      const b = freeCell(a, 3, 11); if (!b) continue
      const cells = route(a, b); if (!cells) continue
      const near = Math.min(...parts.map(p => Math.hypot(a.c - p.c - p.w / 2, a.r - p.r - p.h / 2)), 60)
      addTrace(cells, Math.random() < .6 ? 'f' : 'b', 500 + near * 34 + rnd(0, 250)); made++
    }
    drawBusBelow()
  }

  // The exit bus continues in SVG under the hero: it drops, turns 45° into a horizontal run toward the
  // page gutter (leftmost line turns first so none cross), then drops onto pads above the Work heading.
  function drawBusBelow() {
    const svg = root.querySelector('[data-bus]'), h2 = root.querySelector('#trabajo h2'), eth = parts.find(p => p.exit)
    if (!svg || !h2) return
    svg.replaceChildren()
    const lines = eth ? eth.exit.filter(t => t.b.r >= rows - 1).map(t => t.pts[t.pts.length - 1].x).sort((a, b) => a - b) : []
    if (!lines.length) { svg.style.height = ''; h2.style.paddingTop = ''; return }
    const gutter = h2.getBoundingClientRect().left + 5, c = P / 2, y0 = 36, yEnd = y0 + lines.length * P + 70
    svg.style.height = yEnd + 'px'; h2.style.paddingTop = yEnd + 30 + 'px'
    const NS = 'http://www.w3.org/2000/svg'
    lines.forEach((x, i) => {
      const tx = gutter + i * P, y = y0 + i * P
      const d = x - tx > 2 * c
        ? `M${x} 0 V${y - c} L${x - c} ${y} H${tx + c} L${tx} ${y + c} V${yEnd}`
        : `M${x} 0 V${yEnd}`
      const path = document.createElementNS(NS, 'path')
      path.setAttribute('pathLength', '1'); path.setAttribute('d', d); path.setAttribute('stroke', `rgba(${C.f},.55)`)
      const pad = document.createElementNS(NS, 'circle')
      pad.setAttribute('cx', tx); pad.setAttribute('cy', yEnd); pad.setAttribute('r', '3.4'); pad.setAttribute('fill', `rgb(${C.pad})`)
      svg.append(path, pad)
    })
  }

  function sweep() { letters.forEach((l, i) => { l.classList.remove('hit'); void l.offsetWidth; l.style.animationDelay = i * 45 + 'ms'; l.classList.add('hit') }) }

  // Clicking solders an SOIC-8; each pin routes to the nearest pad already on the board
  function placeChip(x, y) {
    const c = Math.round(x / P), r = Math.round(y / P)
    for (let i = -2; i <= 2; i++) for (let j = -3; j <= 3; j++) if (blocked.has(key(c + i, r + j))) return
    // copper under the new body is desoldered and its cells freed
    traces = traces.filter(t => {
      const hit = t.cells.some(p => Math.abs(p.c - c) <= 2 && Math.abs(p.r - r) <= 3)
      if (hit) t.cells.forEach(p => used.delete(key(p.c, p.r)))
      return !hit
    })
    blockRect(c - 2, r - 3, 5, 7, 0)
    parts.push({ c, r, w: 0, chip: true, name: 'U' + (chipN + PARTS.length), born: performance.now() })
    const ends = traces.flatMap(t => [t.a, t.b])
    let i = 0
    for (const side of [-1, 1]) for (let k = -1.5; k <= 1.5; k++) {
      const pin = { c: c + side * 3, r: Math.round(r + k * 1.2) }
      const cand = ends.filter(e => Math.sign(e.c - c) === side && Math.hypot(e.c - pin.c, e.r - pin.r) > 2)
        .sort((a, b) => Math.hypot(a.c - pin.c, a.r - pin.r) - Math.hypot(b.c - pin.c, b.r - pin.r)).slice(0, 4)
      let cells = null
      for (const e of cand) if ((cells = route(pin, e))) break
      if (!cells) { const far = freeCell({ c: pin.c + side * 5, r: pin.r }, 2, 6); cells = far && route(pin, far) }
      if (cells) Object.assign(addTrace(cells, side < 0 ? 'f' : 'b', 0), { born: performance.now() + 140 + i++ * 70, hot: 1, spark: true })
    }
    chipN++
    onSolder?.()
    if (!reduced) later(sweep, 600)
    if (chipN === 7) {
      statusEl.replaceChildren(Object.assign(document.createElement('b'), { textContent: text.complete }))
      traces.forEach(t => { t.hot = 1 })
      onComplete?.()
    } else if (chipN < 7 && booted) setHint()
  }

  function draw(now) {
    raf = 0
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(236,238,242,.045)'
    for (let c = 0; c < cols; c += 2) for (let r = 0; r < rows; r += 2) ctx.fillRect(c * P + P / 2 - .5, r * P + P / 2 - .5, 1, 1)

    let done = 0
    for (const p of parts) p.hover += ((p.over ? 1 : 0) - (p.hover || 0)) * .12
    for (const layer of ['b', 'f']) for (const t of traces) {
      if (t.layer !== layer) continue
      const age = (now - t.born) / Math.max(500, t.len * 2.2); if (age <= 0) continue
      const k = Math.min(1, age), prog = 1 - Math.pow(1 - k, 3)
      if (prog >= 1) done++
      // probe: copper near the cursor warms up and eases back
      let near = 1e9; for (const p of t.pts) near = Math.min(near, Math.hypot(p.x - mouse.x, p.y - mouse.y))
      const want = (near < 130 ? 1 - near / 130 : 0) + (t.hot || 0) + (t.part ? t.part.hover : 0)
      t.heat += (Math.min(1, want) - t.heat) * .08
      if (t.hot) t.hot *= .985
      ctx.strokeStyle = `rgba(${C[layer]},${((layer === 'f' ? .24 : .14) + t.heat * .6) * t.fade})`
      ctx.lineWidth = layer === 'f' ? 2.2 : 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath(); ctx.moveTo(t.pts[0].x, t.pts[0].y)
      const upto = t.len * prog
      for (let i = 1; i < t.pts.length; i++) {
        if (t.seg[i] <= upto) ctx.lineTo(t.pts[i].x, t.pts[i].y)
        else { const p = pointAt(t, upto); ctx.lineTo(p.x, p.y); break }
      }
      ctx.stroke()
      for (const [p, show] of [[t.pts[0], true], [t.pts[t.pts.length - 1], prog >= 1]]) if (show && !(t.b.r >= rows - 1 && p === t.pts[t.pts.length - 1])) {
        ctx.fillStyle = `rgba(${C.pad},${.5 + t.heat * .5})`; ctx.beginPath(); ctx.arc(p.x, p.y, 3.4, 0, 7); ctx.fill()
        ctx.fillStyle = '#0e1014'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, 7); ctx.fill()
      }
      if (t.spark && prog >= 1) { t.spark = false; const e = t.pts[t.pts.length - 1]; for (let s = 0; s < 9; s++) sparks.push({ x: e.x, y: e.y, vx: rnd(-2, 2), vy: rnd(-2.6, .6), life: 1 }) }
      // signals are born on the parts' buses far more often than on filler copper
      if (!reduced && prog >= 1 && Math.random() < (t.part ? .004 : .0005) + t.heat * .03) pulses.push({ t, d: 0, v: rnd(0.55, 1.1) }) // slow, so the signals read as current, not sparks
    }
    if (!booted) {
      const line = text.routing(done, traces.length)
      if (statusEl.textContent !== line) statusEl.textContent = line // a DOM write only when the count moves
      if (done === traces.length) { booted = true; later(() => chipN < 7 && setHint(), 700) }
    }

    for (const p of pulses) {
      p.d += p.v * (1 + p.t.heat * 2.5)
      const head = pointAt(p.t, Math.min(p.d, p.t.len)), tail = pointAt(p.t, Math.max(0, p.d - 26))
      const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
      g.addColorStop(0, `rgba(${C[p.t.layer]},0)`); g.addColorStop(1, 'rgba(255,244,236,.95)')
      ctx.strokeStyle = g; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke()
    }
    pulses = pulses.filter(p => p.d < p.t.len + 26)

    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy; s.vy += .12; s.life -= .035
      ctx.strokeStyle = `rgba(255,226,170,${s.life})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2); ctx.stroke()
    }
    sparks = sparks.filter(s => s.life > 0)

    for (const p of parts) drawPart(p, now)
    if (mouse.x > 0) { ctx.strokeStyle = `rgba(${C.silk},.35)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 16, 0, 7); ctx.stroke() }
    // the board only animates while the hero is on screen
    // when it stops, clear the handle so kick() can start it again
    raf = visible && !dead ? requestAnimationFrame(draw) : 0
  }

  function drawPart(p, now) {
    const k = Math.min(1, (now - p.born) / 420); if (k <= 0) return
    const e = 1 - Math.pow(1 - k, 3), silk = `rgba(${C.silk},${.55 + (p.hover || 0) * .45})`
    ctx.save(); ctx.globalAlpha = e
    ctx.font = '500 11px "Red Hat Mono", monospace'; ctx.lineWidth = 1.2
    if (p.chip) {
      const x = p.c * P + P / 2, y = p.r * P + P / 2 - (1 - e) * 14, w = P * 4.2, h = P * 5.6
      for (const side of [-1, 1]) for (let i = -1.5; i <= 1.5; i++) { ctx.fillStyle = `rgba(${C.pad},.9)`; ctx.fillRect(x + side * (w / 2 + 2) - (side < 0 ? 9 : 0), y + i * P * 1.2 - 3, 9, 6) }
      ctx.fillStyle = '#16181d'; ctx.strokeStyle = silk; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 3); ctx.fill(); ctx.stroke()
      ctx.fillStyle = silk; ctx.beginPath(); ctx.arc(x - w / 2 + 9, y - h / 2 + 9, 2.6, 0, 7); ctx.fill()
      ctx.textAlign = 'center'; ctx.fillText(p.name, x, y + 4)
      ctx.restore(); return
    }
    if (p.id === 'photo') {
      // silkscreen courtyard with corner marks and pin-1 dot around the real photo, plus its pads
      const x = p.x - 8, y = p.y - 8, w = p.pw + 16, h = p.ph + 16, m = 16
      ctx.strokeStyle = silk; ctx.lineWidth = 1.4; ctx.beginPath()
      for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
        ctx.moveTo(cx + dx * m, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * m)
      }
      ctx.stroke()
      ctx.fillStyle = silk; ctx.beginPath(); ctx.arc(x - 8, y + 8, 2.6, 0, 7); ctx.fill()
      for (let i = 0; i < Math.min(7, p.h - 4); i++) { ctx.fillStyle = `rgba(${C.pad},.9)`; ctx.fillRect(x - 12, (p.r + 2 + i * 2) * P + 4, 10, 14) }
      ctx.fillStyle = silk; ctx.textAlign = 'left'; ctx.fillText(p.ref, x, y - 10)
      ctx.restore(); return
    }
    const x = p.c * P, y = p.r * P - (1 - e) * 10, w = p.w * P, h = p.h * P
    ctx.strokeStyle = silk; ctx.fillStyle = silk
    if (p.id === 'esp') {
      for (let i = 0; i < p.h - 3; i++) for (const sx of [x - 7, x + w - 3]) { ctx.fillStyle = `rgba(${C.pad},.85)`; ctx.fillRect(sx, y + (i + 3) * P + 6, 10, 9) }
      ctx.fillStyle = '#121419'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill(); ctx.stroke()
      ctx.strokeStyle = silk; ctx.beginPath(); ctx.roundRect(x + 8, y + P * 3, w - 16, h - P * 3 - 8, 3); ctx.stroke()
      ctx.font = '500 8px "Red Hat Mono", monospace'; ctx.fillStyle = `rgba(${C.silk},${.35 + p.hover * .4})`
      for (let i = 0; i < p.h - 3; i++) {
        ctx.textAlign = 'right'; ctx.fillText(ESP_PINS_L[i] ?? '', x - 11, y + (i + 3) * P + 14)
      }
      ctx.font = '500 11px "Red Hat Mono", monospace'
      // the module's PCB antenna
      ctx.strokeStyle = `rgba(${C.pad},.8)`; ctx.lineWidth = 2; ctx.beginPath()
      for (let i = 0; i <= 8; i++) { const ax = x + 14 + i * (w - 28) / 8; ctx[i ? 'lineTo' : 'moveTo'](ax, y + (i % 2 ? 14 : P * 2.2)) }
      ctx.stroke()
    } else if (p.id === 'nfc') {
      ctx.strokeStyle = `rgba(${C.pad},${.55 + p.hover * .45})`; ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.roundRect(x + i * 9, y + i * 9, w - i * 18, h - i * 18, 14 - i * 2); ctx.stroke() }
      // feed: the inner turn crosses back out on the bottom layer to two pads
      ctx.strokeStyle = `rgba(${C.b},${.5 + p.hover * .4})`; ctx.beginPath(); ctx.moveTo(x + 36, y + h - 36); ctx.lineTo(x + 36, y + h + 14); ctx.stroke()
      ctx.fillStyle = `rgba(${C.pad},.9)`; for (const fx of [x + 36, x + 10]) { ctx.beginPath(); ctx.arc(fx, y + h + 14, 4, 0, 7); ctx.fill() }
      ctx.fillStyle = `rgba(${C.silk},${.4 + p.hover * .4})`; ctx.font = '500 8px "Red Hat Mono", monospace'; ctx.fillText('L1  1.2µH', x + w - 52, y + h + 18); ctx.font = '500 11px "Red Hat Mono", monospace'
    } else if (p.id === 'eth') {
      for (let i = 0; i < 5; i++) { ctx.fillStyle = `rgba(${C.pad},.85)`; ctx.fillRect(x + (i + 1) * P + 6, y + h + 2, 9, 12) }
      ctx.fillStyle = '#121419'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 3); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.rect(x + w * .3, y + h * .55, w * .4, h * .3); ctx.stroke()
      // link and activity LEDs
      ctx.fillStyle = `rgba(120,220,140,${.4 + .5 * (Math.sin(now / 180) > .3)})`; ctx.fillRect(x + 8, y + 8, 7, 5)
      ctx.fillStyle = `rgba(255,190,80,${.3 + .6 * (Math.sin(now / 97 + 1) > .6)})`; ctx.fillRect(x + w - 15, y + 8, 7, 5)
    }
    ctx.fillStyle = silk; ctx.globalAlpha = e; ctx.textAlign = 'left'; ctx.fillText(p.ref, x, y - 8)
    ctx.restore()
  }

  const kick = () => { if (!raf && visible && !dead) raf = requestAnimationFrame(draw) }

  // ── input ──
  const onMove = (e) => {
    const b = hero.getBoundingClientRect()
    // the solder ring shows only over free board, where a click would place a chip
    mouse = e.target.closest('a, button, .hero-copy, .hero-photo, .site-header') ? { x: -1e4, y: -1e4 } : { x: e.clientX - b.left, y: e.clientY - b.top }
    letters.forEach((l, i) => {
      const d = Math.hypot(letterBoxes[i].x - e.clientX, letterBoxes[i].y - (e.clientY + scrollY))
      l.style.setProperty('--g', Math.max(0, 1 - d / 160).toFixed(2))
    })
  }
  const onLeave = () => { mouse = { x: -1e4, y: -1e4 }; letters.forEach(l => l.style.setProperty('--g', 0)) }
  const onClick = (e) => {
    if (e.target.closest('a, button, .hero-copy')) return
    const b = hero.getBoundingClientRect(); placeChip(e.clientX - b.left, e.clientY - b.top)
  }
  let rt, lastW = innerWidth
  const onResize = () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(build, 200) }
  // Order 66: the copper turns sith for a few seconds
  const onOrder66 = () => {
    const keep = { f: C.f, b: C.b }
    Object.assign(C, { f: '235,38,38', b: '150,24,36' })
    root.style.setProperty('--fcu', C.f); root.style.setProperty('--bcu', C.b)
    traces.forEach(t => { t.hot = 1 })
    later(() => { Object.assign(C, keep); root.style.removeProperty('--fcu'); root.style.removeProperty('--bcu') }, 7000)
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick() })

  hero.addEventListener('pointermove', onMove)
  hero.addEventListener('pointerleave', onLeave)
  hero.addEventListener('click', onClick)
  addEventListener('resize', onResize)
  document.addEventListener('board:order66', onOrder66)
  io.observe(hero)
  build(); kick()

  return {
    destroy() {
      dead = true
      cancelAnimationFrame(raf); clearTimeout(rt); timers.forEach(clearTimeout)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      hero.removeEventListener('click', onClick)
      removeEventListener('resize', onResize)
      document.removeEventListener('board:order66', onOrder66)
      io.disconnect()
      partsLayer.replaceChildren()
      root.style.removeProperty('--fcu'); root.style.removeProperty('--bcu')
    },
  }
}
