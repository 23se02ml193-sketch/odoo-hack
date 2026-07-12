// Small shared UI primitives used across pages.

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-[--color-amber]">{eyebrow}</p>}
        <h1 className="font-[--font-display] text-2xl font-bold tracking-tight text-[--color-text]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[--color-text-muted]">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-[--color-hairline] bg-[--color-panel] ${className}`}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-[--color-amber] text-[--color-ink] hover:brightness-110 font-semibold',
    ghost: 'border border-[--color-hairline] text-[--color-text-muted] hover:text-[--color-text] hover:border-[--color-text-faint]',
    danger: 'border border-[--color-alert-dim] text-[--color-alert] hover:bg-[--color-alert]/10',
    teal: 'bg-[--color-teal] text-[--color-ink] hover:brightness-110 font-semibold',
  }
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, children, error, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[--color-text-muted]">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[11px] text-[--color-text-faint]">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] text-[--color-alert]">{error}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg border border-[--color-hairline] bg-[--color-panel-raised] px-3 py-2 text-sm text-[--color-text] placeholder:text-[--color-text-faint] focus-ring focus:border-[--color-amber]'

export function Input({ className = '', ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${inputBase} appearance-none ${className}`} {...props}>
      {children}
    </select>
  )
}

export function TextArea({ className = '', ...props }) {
  return <textarea className={`${inputBase} resize-none ${className}`} rows={3} {...props} />
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {Icon && <Icon size={28} className="mb-1 text-[--color-text-faint]" />}
      <p className="text-sm font-medium text-[--color-text]">{title}</p>
      {subtitle && <p className="max-w-xs text-xs text-[--color-text-muted]">{subtitle}</p>}
    </div>
  )
}
