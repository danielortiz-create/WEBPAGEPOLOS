import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative bg-ink overflow-hidden h-[85vh] min-h-[560px] max-h-[900px]">
      {/* Foto de fondo */}
      <img
        src="/img/hero-main.png"
        alt="Modelo con polo RIVT"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Degradado para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

      {/* Contenido superpuesto */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-14 md:pb-20">
        {/* Eyebrow */}
        <p className="label-tag text-cream/70 mb-4 animate-fadeIn">
          Nueva colección — Verano 2025
        </p>

        {/* Título principal */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-cream leading-[0.95] mb-6 animate-fadeIn"
          style={{ animationDelay: '0.1s' }}>
          Simple.<br />
          Urbano.<br />
          <em className="not-italic text-cream/60">Diferente.</em>
        </h1>

        {/* Descripción */}
        <p className="font-sans text-base md:text-lg text-cream/80 max-w-sm md:max-w-md mb-10 leading-relaxed animate-fadeIn"
          style={{ animationDelay: '0.2s' }}>
          Polos de edición limitada con el alma de Nueva York.
          Diseños únicos, calidad que se nota.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <Link to="/#catalogo" className="bg-cream text-ink font-sans font-medium tracking-widest uppercase text-xs px-8 py-4 transition-all duration-300 hover:bg-cream-dark active:scale-95 text-center">
            Ver colección
          </Link>
          <a
            href="https://wa.me/51912304036?text=Hola%2C%20quiero%20saber%20más%20sobre%20los%20polos%20RIVT"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-cream text-cream font-sans font-medium tracking-widest uppercase text-xs px-8 py-4 transition-all duration-300 hover:bg-cream hover:text-ink active:scale-95 text-center"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
