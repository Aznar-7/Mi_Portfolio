import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary:   'bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-white',
  accent:    'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
  secondary: 'border border-[var(--line-strong)] text-[var(--text-primary)] hover:border-white/30 hover:bg-white/[0.04]',
  ghost:     'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
}

// Renders an <a> when `href` is given (external links open in a new tab),
// otherwise a <button>.
export const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', href, external, className, children, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-[10px] font-medium whitespace-nowrap',
    'transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-40',
    VARIANTS[variant],
    SIZES[size],
    className,
  )

  if (href) {
    const isExternal = external ?? /^https?:/.test(href)
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <button ref={ref} type="button" className={classes} {...props}>
      {children}
    </button>
  )
})
