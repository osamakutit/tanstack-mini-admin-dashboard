import { createRootRoute, Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Users, CheckSquare, LogOut, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem('admin_authenticated') === 'true'
  )

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated') === 'true'
    setIsAuthenticated(auth)
    
    if (!auth && routerState.location.pathname !== '/login') {
      navigate({ to: '/login' })
    }
  }, [routerState.location.pathname, navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    navigate({ to: '/login' })
  }

  // If on login page, just render the Outlet (no layout)
  if (routerState.location.pathname === '/login') {
    return <Outlet />
  }

  // If not authenticated and redirecting, render loading spinner
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#080c14] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-400">Verifying session...</p>
        </div>
      </div>
    )
  }

  const getPageTitle = () => {
    const path = routerState.location.pathname
    if (path === '/') return 'Dashboard Overview'
    if (path === '/users') return 'Users Management'
    if (path === '/tasks') return 'Tasks Board'
    return 'Admin Panel'
  }

  return (
    <div className="flex h-screen w-screen bg-[#080c14] overflow-hidden text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0b1329] flex flex-col justify-between">
        <div>
          {/* Logo / Header */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide uppercase">TanStack Admin</h1>
              <p className="text-[10px] text-blue-400">Premium Console</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            <Link
              to="/"
              activeProps={{ className: 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' }}
              inactiveProps={{ className: 'text-gray-400 hover:bg-slate-800/50 hover:text-white border-l-2 border-transparent' }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              to="/users"
              activeProps={{ className: 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' }}
              inactiveProps={{ className: 'text-gray-400 hover:bg-slate-800/50 hover:text-white border-l-2 border-transparent' }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
            >
              <Users size={18} />
              Users
            </Link>
            <Link
              to="/tasks"
              activeProps={{ className: 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' }}
              inactiveProps={{ className: 'text-gray-400 hover:bg-slate-800/50 hover:text-white border-l-2 border-transparent' }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
            >
              <CheckSquare size={18} />
              Tasks
            </Link>
          </nav>
        </div>

        {/* Bottom / Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Admin User</p>
              <p className="text-[10px] text-gray-400">admin@tanstack.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-[#0b1329] flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-white">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-gray-400">System Online</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#080c14]">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
