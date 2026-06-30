import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { productosAPI } from '../services/api'
import { getProductById } from '../data/products'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedTalla, setSelectedTalla] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    productosAPI.obtener(id)
      .then((p) => setProduct(p))
      .catch(() => {
        // Fallback a datos estáticos si el servidor no está disponible
        const fallback = getProductById(id)
        setProduct(fallback || null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-ink-muted text-sm">Cargando...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="section-title mb-4">Producto no encontrado</h2>
        <Link to="/" className="btn-primary inline-block mt-4">Volver al catálogo</Link>
      </div>
    )
  }

  const handleAdd = () => {
    if (!selectedTalla) { setError('Por favor selecciona una talla.'); return }
    setError('')
    addItem(product, selectedTalla, cantidad)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWhatsApp = () => {
    const talla = selectedTalla || 'por confirmar'
    const msg = `Hola, quiero pedir:\n*${product.nombre}*\nTalla: ${talla}\nCantidad: ${cantidad}\nTotal: S/ ${(product.precio * cantidad).toFixed(2)}`
    window.open(`https://wa.me/51912304036?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const imagenes = product.imagenes?.length ? product.imagenes : [product.imagen]

  const detalles = [
    '100% algodón peinado 185 gsm',
    'Corte relaxed fit unisex',
    'Cuello redondo reforzado',
    'Gráfico vintage serigrafiado',
    'Lavado a máquina en frío',
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-xs text-ink-muted">
        <Link to="/" className="hover:text-ink transition-colors">Colección</Link>
        <span>/</span>
        <span className="text-ink">{product.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Galería */}
        <div className="space-y-3">
          <div className="aspect-square bg-cream-dark overflow-hidden">
            <img
              src={imagenes[selectedImage]}
              alt={`${product.nombre} — vista ${selectedImage + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          {imagenes.length > 1 && (
            <div className="flex gap-2">
              {imagenes.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    selectedImage === i ? 'border-ink' : 'border-transparent hover:border-cream-darker'
                  }`}
                >
                  <img src={img} alt={`Vista ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <p className="label-tag text-ink-muted">{product.categoria}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-normal leading-tight">{product.nombre}</h1>

          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-medium">S/ {Number(product.precio).toFixed(2)}</span>
            <span className="label-tag text-ink-muted">Inc. IGV</span>
          </div>

          {product.color && (
            <div>
              <p className="label-tag text-ink-muted mb-1">Color</p>
              <p className="text-sm font-medium">{product.color}</p>
            </div>
          )}

          {/* Tallas */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="label-tag text-ink-muted">Talla</p>
              <button className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink transition-colors">
                Guía de tallas
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(product.tallas || ['S', 'M', 'L', 'XL']).map((t) => (
                <button
                  key={t}
                  onClick={() => { setSelectedTalla(t); setError('') }}
                  className={`w-12 h-12 border text-sm font-medium transition-all ${
                    selectedTalla === t
                      ? 'bg-ink text-cream border-ink'
                      : 'bg-transparent text-ink border-cream-darker hover:border-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
          </div>

          {/* Cantidad */}
          <div>
            <p className="label-tag text-ink-muted mb-2">Cantidad</p>
            <div className="flex items-center border border-cream-darker w-fit">
              <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="px-4 py-3 text-ink-muted hover:text-ink transition-colors text-lg leading-none">−</button>
              <span className="px-5 py-3 text-sm font-medium min-w-[3rem] text-center">{cantidad}</span>
              <button onClick={() => setCantidad((c) => c + 1)} className="px-4 py-3 text-ink-muted hover:text-ink transition-colors text-lg leading-none">+</button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <button onClick={handleAdd} className={`btn-primary w-full ${added ? 'bg-ink-light' : ''}`}>
              {added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
            </button>
            <button onClick={handleWhatsApp} className="btn-secondary w-full flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Pedir por WhatsApp
            </button>
          </div>

          {/* Descripción */}
          <div className="pt-2 border-t border-cream-darker">
            <p className="text-sm text-ink-light leading-relaxed">{product.descripcion}</p>
          </div>

          {/* Detalles desplegables */}
          <div className="border-t border-cream-darker">
            <button onClick={() => setDetailOpen(!detailOpen)} className="flex items-center justify-between w-full py-4 text-left">
              <span className="label-tag text-ink">Composición y cuidados</span>
              <svg className={`w-4 h-4 text-ink-muted transition-transform ${detailOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {detailOpen && (
              <ul className="pb-4 space-y-1.5 animate-fadeIn">
                {detalles.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-light">
                    <span className="mt-1.5 w-1 h-1 bg-ink-muted rounded-full flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
