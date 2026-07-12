import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, LogOut, RotateCcw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Toast from './Toast'

const NAV_ITEMS = [
  { key: 'dashboard', to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'vehicles', to: '/vehicles', label: 'Vehicle Registry', icon: Truck },
  { key: 'drivers', to: '/drivers', label: 'Drivers', icon: Users },
  { key: 'trips', to: '/trips', label: 'Trips', icon: Route },
  { key: 'maintenance', to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'fuel', to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { key: 'reports', to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
]

export default function Layout() {
  const { user, logout, can } = useAuth()
  const { resetDemoData } = useData()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter((item) => can(item.key))

  return (
    <div className="flex min-h-screen bg-[--color-ink]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-[--color-hairline] bg-[--color-panel]">
        <div className="flex items-center gap-2.5 border-b border-[--color-hairline] px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--color-amber]/15">
            <Route size={18} className="text-[--color-amber]" />
          </div>
          <div>
            <p className="font-[--font-display] text-sm font-bold leading-none tracking-tight text-[--color-text]">TransitOps</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[--color-text-faint]">Ops Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map(({ key, to, label, icon: Icon }) => (
            <NavLink
              key={key}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[--color-amber]/10 text-[--color-amber] font-medium'
                    : 'text-[--color-text-muted] hover:bg-[--color-panel-raised] hover:text-[--color-text]'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[--color-hairline] p-3">
          <button
            onClick={resetDemoData}
            className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[--color-text-faint] hover:bg-[--color-panel-raised] hover:text-[--color-text-muted]"
          >
            <RotateCcw size={16} />
            Reset demo data
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[--color-hairline] bg-[--color-panel]/60 px-6 py-3.5 backdrop-blur">
          <div>
            <p className="text-xs text-[--color-text-faint]">Signed in as</p>
            <p className="text-sm font-medium text-[--color-text]">{user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[--color-hairline] bg-[--color-panel-raised] px-3 py-1 font-mono text-xs text-[--color-teal]">
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="focus-ring flex items-center gap-1.5 rounded-lg border border-[--color-hairline] px-3 py-1.5 text-xs text-[--color-text-muted] hover:border-[--color-alert-dim] hover:text-[--color-alert]"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  )
}
