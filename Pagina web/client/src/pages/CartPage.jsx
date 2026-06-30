import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, total, removeItem, updateCantidad } = useCart()
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <h1 className="section-title mb-10">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <svg className="w-14 h-14 text-ink-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-ink-muted mb-6">Tu carrito está vacío.</p>
          <Link to="/" className="btn-primary">Ver colección</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Lista de items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.key} className="flex gap-5 pb-6 border-b border-cream-darker animate-fadeIn">
                <Link to={`/producto/${item.id}`} className="flex-shrink-0">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    loading="lazy"
                    className="w-24 h-28 md:w-32 md:h-36 object-cover bg-cream-dark"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link to={`/producto/${item.id}`}>
                      <h3 className="font-sans text-sm md:text-base font-medium hover:text-ink-light transition-colors">
                        {item.nombre}
                      </h3>
                    </Link>
                    <p className="label-tag text-ink-muted mt-1">Talla: {item.talla}</p>
                    <p className="font-sans text-sm font-semibold text-ink mt-2">
                      S/ {item.precio.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    {/* Control cantidad */}
                    <div className="flex items-center border border-cream-darker">
                      <button
                        onClick={() => updateCantidad(item.key, item.cantidad - 1)}
                        className="px-3 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 text-sm font-medium min-w-[2.5rem] text-center border-x border-cream-darker">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateCantidad(item.key, item.cantidad + 1)}
                        className="px-3 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-medium text-sm">
                        S/ {(item.precio * item.cantidad).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-xs text-ink-muted hover:text-ink underline underline-offset-2 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-cream-dark p-6 sticky top-24">
              <h2 className="font-serif text-xl mb-5">Resumen</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Subtotal</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Envío</span>
                  <span className="text-ink-muted">Calculado al finalizar</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-cream-darker font-semibold text-base">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full text-center mt-6"
              >
                Finalizar pedido
              </button>

              <a
                href={`https://wa.me/51912304036?text=${encodeURIComponent(
                  'Hola, quiero realizar este pedido:\n' +
                  items.map((i) => `• ${i.nombre} (Talla ${i.talla}) x${i.cantidad} — S/ ${(i.precio * i.cantidad).toFixed(2)}`).join('\n') +
                  `\n\nTotal: S/ ${total.toFixed(2)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center mt-3 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Pedir por WhatsApp
              </a>

              <Link to="/" className="block text-center text-xs text-ink-muted underline underline-offset-2 hover:text-ink transition-colors mt-4">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
