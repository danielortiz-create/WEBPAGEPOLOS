import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, total, isOpen, setIsOpen, removeItem, updateCantidad } = useCart()
  const navigate = useNavigate()

  // Cierra drawer con tecla Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setIsOpen])

  // Bloquea scroll del body cuando drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-ink/30 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="w-full max-w-sm bg-cream flex flex-col animate-slideInRight">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-darker">
          <span className="font-serif text-xl">Tu carrito</span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar carrito"
            className="p-1 text-ink-muted hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg className="w-12 h-12 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-ink-muted text-sm">Tu carrito está vacío</p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-primary text-xs"
              >
                Ver colección
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 animate-fadeIn">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    loading="lazy"
                    className="w-20 h-24 object-cover flex-shrink-0 bg-cream-dark"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium leading-tight">{item.nombre}</p>
                    <p className="label-tag mt-1">Talla: {item.talla}</p>
                    <p className="font-sans text-sm font-semibold mt-2">S/ {item.precio.toFixed(2)}</p>

                    <div className="flex items-center gap-3 mt-2">
                      {/* Control cantidad */}
                      <div className="flex items-center border border-cream-darker">
                        <button
                          onClick={() => updateCantidad(item.key, item.cantidad - 1)}
                          className="px-2.5 py-1 text-sm text-ink-muted hover:text-ink transition-colors"
                        >
                          −
                        </button>
                        <span className="px-2 text-sm font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => updateCantidad(item.key, item.cantidad + 1)}
                          className="px-2.5 py-1 text-sm text-ink-muted hover:text-ink transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-ink-muted hover:text-ink text-xs underline underline-offset-2 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-cream-darker space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="label-tag">Total</span>
              <span className="font-serif text-xl">S/ {total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-ink-muted">Envío calculado al finalizar el pedido</p>
            <button
              onClick={() => { setIsOpen(false); navigate('/checkout') }}
              className="btn-primary w-full text-center"
            >
              Finalizar pedido
            </button>
            <Link
              to="/carrito"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs text-ink-muted underline underline-offset-2 hover:text-ink transition-colors"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
