import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product, 'M')
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link
      to={`/producto/${product.id}`}
      className="group block animate-fadeIn"
    >
      {/* Imagen */}
      <div className="relative overflow-hidden bg-cream-dark aspect-[3/4]">
        <img
          src={product.imagenPrincipal || product.imagen}
          alt={product.nombre}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Botón rápido "Agregar" */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAdd}
            className={`w-full py-3 text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
              added
                ? 'bg-ink-light text-cream'
                : 'bg-ink text-cream hover:bg-ink-light'
            }`}
          >
            {added ? '¡Agregado!' : 'Agregar al carrito'}
          </button>
        </div>

      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3 className="font-sans text-sm font-medium leading-tight text-ink group-hover:text-ink-light transition-colors">
          {product.nombre}
        </h3>
        <p className="label-tag text-ink-muted">{product.color}</p>
        <p className="font-sans text-sm font-semibold text-ink">
          S/ {product.precio.toFixed(2)}
        </p>
      </div>
    </Link>
  )
}
