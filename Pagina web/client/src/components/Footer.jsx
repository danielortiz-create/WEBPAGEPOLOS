import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ink text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Marca */}
          <div>
            <span className="font-serif text-2xl font-bold tracking-widest">RIVT</span>
            <p className="text-cream/60 text-sm mt-4 leading-relaxed max-w-xs">
              Simple. Urbano. Diferente.<br />
              Polos premium con el espíritu de Nueva York, hechos para el Perú.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="label-tag text-cream/40 mb-4">Tienda</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-cream/70 hover:text-cream transition-colors">
                  Colección
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="text-sm text-cream/70 hover:text-cream transition-colors">
                  Mi carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="label-tag text-cream/40 mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://wa.me/51912304036"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream/70 hover:text-cream transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  +51 912 304 036
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/rivt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream/70 hover:text-cream transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="4" strokeWidth="1.5"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                  @rivt
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/30">© 2025 RIVT. Todos los derechos reservados.</p>
          <p className="text-xs text-cream/30">Lima, Perú · Envíos a todo el país</p>
        </div>
      </div>
    </footer>
  )
}
