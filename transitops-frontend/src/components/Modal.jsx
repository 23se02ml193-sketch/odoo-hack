import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-10">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-xl border border-[--color-hairline] bg-[--color-panel] shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-[--color-hairline] px-5 py-4">
          <h3 className="font-[--font-display] text-base font-semibold tracking-tight text-[--color-text]">{title}</h3>
          <button onClick={onClose} className="focus-ring rounded-md p-1 text-[--color-text-muted] hover:bg-[--color-panel-raised] hover:text-[--color-text]">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
