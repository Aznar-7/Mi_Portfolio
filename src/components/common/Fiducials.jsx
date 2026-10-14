// Four corner marks around an element, like the fiducials a pick-and-place
// machine uses to align a board. Place inside a `relative` parent.
const CORNERS = [
  'left-0 top-0 border-l-2 border-t-2',
  'right-0 top-0 border-r-2 border-t-2',
  'bottom-0 left-0 border-b-2 border-l-2',
  'bottom-0 right-0 border-b-2 border-r-2',
]

export function Fiducials({ inset = '-8px' }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute" style={{ inset }}>
      {CORNERS.map((c) => (
        <span key={c} className={`absolute h-3.5 w-3.5 border-[var(--accent)] ${c}`} />
      ))}
    </span>
  )
}
