// A section title split into letters so the scroll can power it on (lib/motion.js), letter by letter
// like the hero name. Words stay unbreakable; screen readers get the plain title.
export function PowerTitle({ text, as: Tag = 'h2', className = '' }) {
  let i = 0
  return (
    <Tag className={`pt ${className}`.trim()} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} className="pw" aria-hidden="true">
          {[...word].map((ch) => <span key={i} className="pl" style={{ '--i': i++ }}>{ch}</span>)}
          {' '}
        </span>
      ))}
    </Tag>
  )
}
