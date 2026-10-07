// Section header: optional context line, title, optional subtitle.
// Pass `label` only when it adds information the title doesn't carry.
export function SectionHeading({ label, title, subtitle, children }) {
  return (
    <header className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {label && <p className="mb-3 text-sm text-[var(--accent-hover)]">{label}</p>}
        <h2 className="text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-[var(--text-primary)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-[17px]">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </header>
  )
}
