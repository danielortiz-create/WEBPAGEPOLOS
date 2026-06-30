import { useState, useMemo, useEffect } from 'react'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import { productosAPI } from '../services/api'
import { products as staticProducts } from '../data/products'

export default function HomePage() {
  const [allProducts, setAllProducts] = useState(staticProducts)
  const [search, setSearch] = useState('')

  useEffect(() => {
    productosAPI.listar()
      .then(setAllProducts)
      .catch(() => setAllProducts(staticProducts))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allProducts.filter((p) =>
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q)
    )
  }, [allProducts, search])

  return (
    <>
      <Hero />

      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="label-tag text-ink-muted mb-2">Colección</p>
            <h2 className="section-title">Nuestros polos</h2>
          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar modelo..."
              className="input-field pr-10 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-muted text-sm">No se encontraron productos.</p>
            <button onClick={() => setSearch('')} className="mt-4 text-xs underline underline-offset-2 text-ink hover:text-ink-light">
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Por qué RIVT */}
      <section id="por-que-rivt" className="bg-cream-dark py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="label-tag text-ink-muted mb-2">Nuestra promesa</p>
            <h2 className="section-title">¿Por qué RIVT?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
                titulo: 'Calidad Premium',
                texto: 'Algodón peinado 185 gsm. Telas que duran lavado tras lavado sin perder forma ni color.',
              },
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
                titulo: 'Diseño Exclusivo',
                texto: 'Gráficos únicos inspirados en la cultura deportiva de Nueva York. Ediciones limitadas.',
              },
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" /></svg>,
                titulo: 'Pago Seguro',
                texto: 'Tarjeta de crédito/débito, Yape o WhatsApp. Envíos a todo el Perú con rastreo.',
              },
            ].map((item) => (
              <div key={item.titulo} className="flex flex-col items-center text-center gap-4">
                <div className="p-4 border border-cream-darker text-ink">{item.icon}</div>
                <h3 className="font-serif text-xl">{item.titulo}</h3>
                <p className="text-sm text-ink-light leading-relaxed max-w-xs">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
        <p className="label-tag text-ink-muted mb-3">¿Preguntas? Escríbenos</p>
        <h2 className="section-title mb-6">Atención personalizada</h2>
        <p className="text-ink-light text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Nuestro equipo responde en minutos. Tallas, colores, envíos — todo por WhatsApp.
        </p>
        <a
          href="https://wa.me/51912304036?text=Hola%2C%20quiero%20más%20información%20sobre%20los%20polos%20RIVT"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block"
        >
          Chatear ahora
        </a>
      </section>
    </>
  )
}
