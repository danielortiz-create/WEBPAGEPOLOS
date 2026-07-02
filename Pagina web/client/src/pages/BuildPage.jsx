import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { buildAPI } from '../services/api'

const TALLAS = ['S', 'M', 'L', 'XL']

const TAMANOS = [
  { id: 'chico', label: 'Chico', detalle: 'Estampado en el pecho' },
  { id: 'mediano', label: 'Mediano', detalle: 'Frente centrado' },
  { id: 'grande', label: 'Grande', detalle: 'Frente completo' },
]

const MENSAJES_GENERANDO = [
  'Creando tu diseño…',
  'Esto puede tardar hasta un minuto…',
  'Dando los últimos toques…',
  'Casi listo…',
]

export default function BuildPage() {
  const { addItem } = useCart()

  const [estado, setEstado] = useState(null) // null = cargando
  const [color, setColor] = useState('negro')
  const [tamano, setTamano] = useState('mediano')
  const [idea, setIdea] = useState('')
  const [talla, setTalla] = useState('')
  const [generando, setGenerando] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [resultado, setResultado] = useState(null) // { url, precio }
  const [restantes, setRestantes] = useState(0)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    buildAPI.estado()
      .then((e) => {
        setEstado(e)
        setRestantes(e.restantes ?? 0)
      })
      .catch(() => setEstado({ disponible: false, precios: { chico: 80, mediano: 100, grande: 120 } }))
  }, [])

  // Mensajes rotativos mientras genera
  useEffect(() => {
    if (!generando) return
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MENSAJES_GENERANDO.length)
    }, 4000)
    return () => clearInterval(t)
  }, [generando])

  const handleGenerar = async () => {
    if (generando || !idea.trim()) return
    setError('')
    setGenerando(true)
    setMsgIndex(0)
    try {
      const r = await buildAPI.generar({ prompt: idea.trim(), color, tamano })
      setResultado({ url: r.url, precio: r.precio })
      setRestantes(r.restantes)
      setTalla('')
    } catch (err) {
      setError(err.message || 'No pudimos generar tu diseño. Intenta de nuevo.')
      if (/límite|capacidad/i.test(err.message || '')) setRestantes(0)
    } finally {
      setGenerando(false)
    }
  }

  const handleAgregar = () => {
    if (!talla) { setError('Elige una talla primero.'); return }
    setError('')
    addItem({
      id: `custom-${crypto.randomUUID()}`,
      nombre: `Polo personalizado — ${color === 'negro' ? 'Negro' : 'Blanco'}`,
      precio: resultado.precio,
      imagenPrincipal: resultado.url,
      personalizado: true,
      prompt: idea.trim(),
      color_polo: color,
      tamano_diseno: tamano,
    }, talla)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Cargando estado inicial
  if (estado === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-ink-muted text-sm">Cargando…</p>
      </div>
    )
  }

  // No configurado → próximamente
  if (!estado.disponible) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-fadeIn">
        <p className="label-tag text-ink-muted mb-3">Build</p>
        <h1 className="section-title mb-6">Diseña tu propio polo</h1>
        <p className="text-ink-light text-sm leading-relaxed mb-8">
          Estamos afinando los últimos detalles. Muy pronto podrás crear tu propio
          diseño con inteligencia artificial, sobre polos negros o blancos, desde S/ 80.
        </p>
        <Link to="/" className="btn-primary inline-block">Ver colección</Link>
      </div>
    )
  }

  const precios = estado.precios
  const sinIntentos = restantes <= 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="text-center mb-10">
        <p className="label-tag text-ink-muted mb-3">Build</p>
        <h1 className="section-title mb-4">Diseña tu propio polo</h1>
        <p className="text-ink-light text-sm max-w-md mx-auto leading-relaxed">
          Describe tu idea y nuestra IA la convierte en un diseño único.
          Solo sobre polos negros o blancos.
        </p>
      </div>

      {/* Resultado */}
      {resultado ? (
        <div className="animate-fadeIn">
          <div className="max-w-md mx-auto">
            <div className="aspect-square bg-cream-dark overflow-hidden mb-6">
              <img src={resultado.url} alt="Tu diseño personalizado" className="w-full h-full object-cover" />
            </div>

            <div className="flex items-baseline justify-between mb-6">
              <span className="font-serif text-3xl font-medium">S/ {resultado.precio.toFixed(2)}</span>
              <span className="label-tag text-ink-muted">Polo {color} · diseño {tamano}</span>
            </div>

            {/* Tallas */}
            <div className="mb-6">
              <p className="label-tag text-ink-muted mb-2">Talla</p>
              <div className="flex gap-2">
                {TALLAS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTalla(t); setError('') }}
                    className={`w-12 h-12 border text-sm font-medium transition-all ${
                      talla === t
                        ? 'bg-ink text-cream border-ink'
                        : 'bg-transparent text-ink border-cream-darker hover:border-ink'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 mb-4">{error}</p>
            )}

            <div className="flex flex-col gap-3">
              <button onClick={handleAgregar} className={`btn-primary w-full ${added ? 'bg-ink-light' : ''}`}>
                {added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
              </button>
              {restantes > 0 && (
                <button
                  onClick={() => { setResultado(null); setError('') }}
                  className="btn-secondary w-full"
                >
                  Generar otro diseño ({restantes} {restantes === 1 ? 'intento' : 'intentos'} hoy)
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Formulario */
        <div className="space-y-8">
          {/* Color base */}
          <div>
            <p className="label-tag text-ink-muted mb-3">1 · Color del polo</p>
            <div className="flex gap-4">
              {[
                { id: 'negro', bg: '#1A1A1A' },
                { id: 'blanco', bg: '#FFFFFF' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  disabled={sinIntentos}
                  className={`flex flex-col items-center gap-2 group ${sinIntentos ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`w-16 h-16 border-2 transition-colors ${
                      color === c.id ? 'border-ink' : 'border-cream-darker group-hover:border-ink-muted'
                    }`}
                    style={{ backgroundColor: c.bg }}
                  />
                  <span className={`label-tag ${color === c.id ? 'text-ink' : 'text-ink-muted'}`}>
                    {c.id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño del diseño */}
          <div>
            <p className="label-tag text-ink-muted mb-3">2 · Tamaño del diseño</p>
            <div className="space-y-2">
              {TAMANOS.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                    tamano === t.id ? 'border-ink bg-ink/5' : 'border-cream-darker hover:border-ink-muted'
                  } ${sinIntentos ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name="tamano"
                    value={t.id}
                    checked={tamano === t.id}
                    onChange={() => setTamano(t.id)}
                    className="accent-ink"
                    disabled={sinIntentos}
                  />
                  <span className="flex-1 text-sm font-medium">
                    {t.label} <span className="text-ink-muted font-normal">— {t.detalle}</span>
                  </span>
                  <span className="font-serif text-lg">S/ {precios[t.id]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Idea */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <p className="label-tag text-ink-muted">3 · Describe tu idea</p>
              <span className="text-xs text-ink-muted">{idea.length}/300</span>
            </div>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              maxLength={300}
              rows={3}
              disabled={sinIntentos || generando}
              placeholder="Ej: Un tigre geométrico en líneas doradas"
              className="input-field resize-none disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{error}</p>
          )}

          {sinIntentos ? (
            <p className="text-center text-sm text-ink-muted border border-cream-darker p-4 bg-cream-dark">
              Alcanzaste el límite de 3 diseños por hoy. Vuelve mañana.
            </p>
          ) : (
            <button
              onClick={handleGenerar}
              disabled={generando || !idea.trim()}
              className="btn-primary w-full disabled:opacity-60"
            >
              {generando
                ? MENSAJES_GENERANDO[msgIndex]
                : `Generar diseño · ${restantes} ${restantes === 1 ? 'intento' : 'intentos'} hoy`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
