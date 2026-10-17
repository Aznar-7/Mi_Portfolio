// Order 66 leaves the board red until the visitor asks for the copper back. Remembered per browser.
const KEY = 'board-sith'

export function isSith() {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

export function setSith(on) {
  try { localStorage.setItem(KEY, on ? '1' : '0') } catch { /* private mode: it lasts the visit */ }
  document.dispatchEvent(new CustomEvent('board:sith', { detail: on }))
}
