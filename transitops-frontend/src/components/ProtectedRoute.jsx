import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, routeKey }) {
  const { user, can } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (routeKey && !can(routeKey)) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="font-[--font-display] text-lg font-semibold text-[--color-text]">Access restricted</p>
        <p className="max-w-sm text-sm text-[--color-text-muted]">
          Your role ({user.role}) doesn't have permission to view this page. Ask a Fleet Manager to adjust access if this looks wrong.
        </p>
      </div>
    )
  }
  return children
}
