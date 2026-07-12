import { STATUS_COLORS } from '../utils/rules'

const DOT = {
  teal: 'bg-[--color-teal]',
  amber: 'bg-[--color-amber]',
  alert: 'bg-[--color-alert]',
  info: 'bg-[--color-info]',
  faint: 'bg-[--color-text-faint]',
}
const TEXT = {
  teal: 'text-[--color-teal]',
  amber: 'text-[--color-amber]',
  alert: 'text-[--color-alert]',
  info: 'text-[--color-info]',
  faint: 'text-[--color-text-faint]',
}

export default function StatusBadge({ status }) {
  const tone = STATUS_COLORS[status] || 'faint'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[--color-hairline] bg-[--color-panel-raised] px-2.5 py-1 text-xs font-medium font-mono">
      <span className={`status-dot ${DOT[tone]}`} />
      <span className={TEXT[tone]}>{status}</span>
    </span>
  )
}
