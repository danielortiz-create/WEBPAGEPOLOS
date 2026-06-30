import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-widest uppercase transition-colors ${
      isActive ? 'bg-ink text-cream' : 'text-ink-muted hover:text-ink hover:bg-cream-dark'
    }`

  return (
    <div className="min-h-screen bg-cream-dark flex">
      {/* Sidebar */}
      <aside className="w-56 bg-cream border-r border-cream-darker flex flex-col">
        <div className="px-6 py-5 border-b border-cream-darker">
          <span className="font-serif text-xl font-bold tracking-widest text-ink">RIVT</span>
          <p className="text-xs text-ink-muted mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/admin" end className={navClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Inicio
          </NavLink>
          <NavLink to="/admin/productos" className={navClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Productos
          </NavLink>
          <NavLink to="/admin/pedidos" className={navClass}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Pedidos
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-cream-darker">
          <p className="text-xs text-ink-muted px-3 mb-2 truncate">{admin?.usuario}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
