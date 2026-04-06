export function SectionHeading({ label, title, subtitle }) {
  return (
    <div className="mb-14">
      {label && (
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--accent)] opacity-70" />
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-[var(--accent)] uppercase">
            {label.replace('//', '').trim()}
          </p>
        </div>
      )}
      <h2 className="mb-4 text-[clamp(28px,5vw,44px)] font-bold leading-[1.1] tracking-[-0.035em] text-[var(--text-primary)]">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
  )
}
