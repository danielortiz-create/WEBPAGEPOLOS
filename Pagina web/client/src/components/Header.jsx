import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'

export default function Header() {
  const { totalItems, setIsOpen, isOpen } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream border-b border-cream-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Menú hamburguesa móvil */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              <span className="block w-5 h-px bg-ink mb-1.5 transition-all" />
              <span className="block w-5 h-px bg-ink mb-1.5 transition-all" />
              <span className="block w-3 h-px bg-ink transition-all" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0"
            >
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-ink select-none">
                RIVT
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="label-tag hover:text-ink transition-colors"
              >
                Colección
              </Link>
              <Link
                to="/build"
                className="label-tag hover:text-ink transition-colors"
              >
                Build
              </Link>
              <Link
                to="/#por-que-rivt"
                className="label-tag hover:text-ink transition-colors"
              >
                Nosotros
              </Link>
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-4">
              {/* Buscador */}
              <div className="relative">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="w-36 md:w-48 border-b border-ink bg-transparent text-sm py-1 px-2 focus:outline-none placeholder:text-ink-muted"
                    />
                    <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-ink-muted hover:text-ink">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Buscar"
                    className="p-1 text-ink hover:text-ink-light transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Carrito */}
              <button
                onClick={() => setIsOpen(true)}
                aria-label="Carrito"
                className="relative p-1 text-ink hover:text-ink-light transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ink text-cream text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="md:hidden bg-cream border-t border-cream-darker animate-fadeIn">
            <nav className="flex flex-col px-6 py-4 gap-4">
              <Link to="/" onClick={() => setMenuOpen(false)} className="label-tag py-2 border-b border-cream-darker">
                Colección
              </Link>
              <Link to="/build" onClick={() => setMenuOpen(false)} className="label-tag py-2 border-b border-cream-darker">
                Build
              </Link>
              <Link to="/#por-que-rivt" onClick={() => setMenuOpen(false)} className="label-tag py-2">
                Nosotros
              </Link>
            </nav>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
