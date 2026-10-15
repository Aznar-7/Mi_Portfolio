// A hand-drawn segment display: 14 segments for letters, 7 for digits, unlit segments kept faint
// like real LED glass. Cell is 40×64 in its own units.
const SEG = {
  top: [8, 4, 32, 4], ur: [36, 8, 36, 28], lr: [36, 36, 36, 56], bot: [8, 60, 32, 60], ll: [4, 36, 4, 56], ul: [4, 8, 4, 28],
  ml: [8, 32, 17, 32], mr: [23, 32, 32, 32], vu: [20, 9, 20, 27], vd: [20, 37, 20, 55],
  dul: [16, 27, 9, 10], dur: [24, 27, 31, 10], dll: [16, 37, 9, 54], dlr: [24, 37, 31, 54],
  vvl: [5, 9, 19, 57], vvr: [35, 9, 21, 57],
}
const SEVEN = ['top', 'ur', 'lr', 'bot', 'll', 'ul', 'ml', 'mr']
const FOURTEEN = [...SEVEN, 'vu', 'vd', 'dul', 'dur', 'dll', 'dlr']
const CHARS = {
  0: 'top ur lr bot ll ul', 1: 'ur lr', 2: 'top ur ml mr ll bot', 3: 'top ur ml mr lr bot', 4: 'ul ml mr ur lr',
  5: 'top ul ml mr lr bot', 6: 'top ul ll bot lr ml mr', 7: 'top ur lr', 8: 'top ur lr bot ll ul ml mr', 9: 'top ur ul ml mr lr bot',
  A: 'top ur lr ll ul ml mr', B: 'top ur lr bot vu vd mr', C: 'top ul ll bot', D: 'top ur lr bot vu vd', E: 'top ul ll bot ml',
  F: 'top ul ll ml', G: 'top ul ll bot lr mr', J: 'ur lr bot ll', L: 'ul ll bot', M: 'ul ll ur lr dul dur', N: 'ul ll ur lr dul dlr',
  O: 'top ur lr bot ll ul', P: 'top ur ul ll ml mr', R: 'top ur ul ll ml mr dlr', S: 'top ul ml mr lr bot', T: 'top vu vd',
  U: 'ul ll bot lr ur', V: 'vvl vvr', Y: 'dul dur vd', ' ': '',
}

function Cell({ ch, alpha }) {
  const lit = new Set((CHARS[ch] ?? '').split(' '))
  const all = alpha ? FOURTEEN : SEVEN
  const extra = [...lit].filter((s) => s && !all.includes(s))
  return (
    <g>
      {[...all, ...extra].map((s) => {
        const [x1, y1, x2, y2] = SEG[s]
        return <line key={s} x1={x1} y1={y1} x2={x2} y2={y2} className={lit.has(s) ? 'seg on' : 'seg'} />
      })}
    </g>
  )
}

// text: the characters; alpha: render letter-capable cells
export function Segments({ text, alpha = false, className = '' }) {
  const chars = [...String(text)]
  return (
    <svg className={`segs ${className}`} viewBox={`0 0 ${chars.length * 46 - 6} 64`} aria-hidden="true">
      {chars.map((ch, i) => <g key={i} transform={`translate(${i * 46} 0)`}><Cell ch={ch} alpha={alpha} /></g>)}
    </svg>
  )
}
