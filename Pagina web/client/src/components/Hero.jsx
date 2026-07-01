import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-16 md:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Foto */}
          <div className="order-1 lg:order-2 animate-fadeIn">
            <div className="aspect-[4/5] overflow-hidden bg-cream-dark">
              <img
                src="/img/hero-main.png"
                alt="Modelo con polo RIVT"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Texto */}
          <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Eyebrow */}
            <p className="label-tag text-ink-muted mb-6 animate-fadeIn">
              Nueva colección — Verano 2025
            </p>

            {/* Título principal */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight text-ink leading-[0.95] mb-6 animate-fadeIn"
              style={{ animationDelay: '0.1s' }}>
              Simple.<br />
              Urbano.<br />
              <em className="not-italic text-ink-muted">Diferente.</em>
            </h1>

            {/* Descripción */}
            <p className="font-sans text-base md:text-lg text-ink-light max-w-sm md:max-w-md mt-4 mb-10 leading-relaxed animate-fadeIn"
              style={{ animationDelay: '0.2s' }}>
              Polos de edición limitada con el alma de Nueva York.
              Diseños únicos, calidad que se nota.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <Link to="/#catalogo" className="btn-primary">
                Ver colección
              </Link>
              <a
                href="https://wa.me/51912304036?text=Hola%2C%20quiero%20saber%20más%20sobre%20los%20polos%20RIVT"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Línea decorativa */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-cream-darker" />
    </section>
  )
}
