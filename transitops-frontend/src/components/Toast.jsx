import { useEffect } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function Toast() {
  const { toast, clearToast } = useData()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, 3200)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null
  const isError = toast.type === 'error'

  return (
    <div
      key={toast.id}
      className={`fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-2xl animate-[fadeIn_.15s_ease-out] ${
        isError ? 'border-[--color-alert-dim] bg-[--color-alert]/10' : 'border-[--color-teal-dim] bg-[--color-teal]/10'
      }`}
    >
      {isError ? <AlertTriangle size={18} className="text-[--color-alert]" /> : <CheckCircle2 size={18} className="text-[--color-teal]" />}
      <span className="text-sm text-[--color-text]">{toast.message}</span>
    </div>
  )
}
