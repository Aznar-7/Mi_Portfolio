// The page powers down like a CRT (body.off, see board.css) and the Ubuntu simulator takes over.
// App removes the class when the simulator closes.
export function powerOn() {
  if (document.body.classList.contains('off')) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  document.body.classList.add('off')
  setTimeout(() => document.dispatchEvent(new CustomEvent('open-ubuntu')), reduced ? 0 : 600)
}
