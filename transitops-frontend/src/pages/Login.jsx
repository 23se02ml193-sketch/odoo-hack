import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Route, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SEED_USERS } from '../data/seed'
import { Field, Input, Button } from '../components/ui'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/')
  }

  const quickFill = (u) => {
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-ink] p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-[--color-hairline] bg-[--color-panel] shadow-2xl md:grid-cols-2">
        {/* Left: brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[--color-panel-raised] p-8 md:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0 38px, #E8ECF3 38px 39px), repeating-linear-gradient(90deg, transparent 0 38px, #E8ECF3 38px 39px)',
            }}
          />
          <div className="relative">
            <div className="mb-8 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[--color-amber]/15">
                <Route size={20} className="text-[--color-amber]" />
              </div>
              <span className="font-[--font-display] text-lg font-bold text-[--color-text]">TransitOps</span>
            </div>
            <h1 className="font-[--font-display] text-3xl font-bold leading-tight text-[--color-text]">
              Every vehicle,<br />driver, and dispatch —<br /><span className="text-[--color-amber]">one console.</span>
            </h1>
            <p className="mt-4 max-w-xs text-sm text-[--color-text-muted]">
              Retire the spreadsheets. Track fleet status, enforce dispatch rules, and see true operational cost in real time.
            </p>
          </div>
          <div className="relative flex items-center gap-6 border-t border-[--color-hairline] pt-4 text-xs text-[--color-text-faint]">
            <span className="flex items-center gap-1.5"><span className="status-dot bg-[--color-teal]" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="status-dot bg-[--color-amber]" /> On Trip</span>
            <span className="flex items-center gap-1.5"><span className="status-dot bg-[--color-info]" /> In Shop</span>
          </div>
        </div>

        {/* Right: form */}
        <div className="p-8">
          <h2 className="font-[--font-display] text-xl font-semibold text-[--color-text]">Sign in</h2>
          <p className="mt-1 text-sm text-[--color-text-muted]">Access your operations console.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email">
              <Input type="email" required placeholder="you@transitops.io" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Password" error={error}>
              <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </Field>
            <Button type="submit" className="w-full">
              Sign in <ArrowRight size={15} />
            </Button>
          </form>

          <div className="mt-6 border-t border-[--color-hairline] pt-4">
            <p className="mb-2 text-[11px] uppercase tracking-widest text-[--color-text-faint]">Demo accounts (password: demo123)</p>
            <div className="grid grid-cols-2 gap-2">
              {SEED_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => quickFill(u)}
                  type="button"
                  className="focus-ring rounded-lg border border-[--color-hairline] px-2.5 py-2 text-left text-xs text-[--color-text-muted] hover:border-[--color-amber]/50 hover:text-[--color-text]"
                >
                  <span className="block font-medium text-[--color-text]">{u.role}</span>
                  <span className="font-mono text-[10px] text-[--color-text-faint]">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
