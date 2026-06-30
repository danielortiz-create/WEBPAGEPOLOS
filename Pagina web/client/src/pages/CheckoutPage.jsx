import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { pedidosAPI, pagosAPI } from '../services/api'

const METODOS_PAGO = [
  { id: 'tarjeta', label: 'Tarjeta de crédito / débito (Culqi)' },
  { id: 'yape', label: 'Yape' },
  { id: 'whatsapp', label: 'Coordinar por WhatsApp' },
]

const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY || ''

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', distrito: '', ciudad: 'Lima', metodoPago: 'tarjeta',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [pedidoId, setPedidoId] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [payError, setPayError] = useState('')

  // Cargar Culqi JS SDK
  useEffect(() => {
    if (!document.getElementById('culqi-js')) {
      const script = document.createElement('script')
      script.id = 'culqi-js'
      script.src = 'https://checkout.culqi.com/js/v4'
      document.head.appendChild(script)
    }
  }, [])

  if (items.length === 0 && !submitted) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="section-title mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="btn-primary inline-block mt-4">Ver colección</Link>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.telefono.trim() || form.telefono.replace(/\D/g, '').length < 9) e.telefono = 'Teléfono inválido'
    if (!form.direccion.trim()) e.direccion = 'Requerido'
    if (!form.distrito.trim()) e.distrito = 'Requerido'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
  }

  const crearPedidoEnDB = async (metodoPago) => {
    const pedido = await pedidosAPI.crear({
      cliente: { nombre: form.nombre, apellido: form.apellido, email: form.email, telefono: form.telefono },
      items: items.map((i) => ({ id: i.id, nombre: i.nombre, talla: i.talla, cantidad: i.cantidad, precio: i.precio })),
      total,
      metodo_pago: metodoPago,
      direccion: { direccion: form.direccion, distrito: form.distrito, ciudad: form.ciudad },
    })
    return pedido.id
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setPayError('')
    setProcesando(true)

    try {
      if (form.metodoPago === 'whatsapp') {
        await crearPedidoEnDB('whatsapp')
        const resumen =
          items.map((i) => `• ${i.nombre} (Talla ${i.talla}) x${i.cantidad}`).join('\n') +
          `\n\nTotal: S/ ${total.toFixed(2)}\n\nDatos de envío:\n${form.nombre} ${form.apellido}\n${form.direccion}, ${form.distrito}, ${form.ciudad}\nTel: ${form.telefono}`
        window.open(`https://wa.me/51912304036?text=${encodeURIComponent(resumen)}`, '_blank')
        clearCart()
        setSubmitted(true)
        return
      }

      // Culqi / Yape
      if (!CULQI_PUBLIC_KEY || CULQI_PUBLIC_KEY.includes('xxxxx')) {
        setPayError('El pago online no está configurado aún. Por favor elige "Coordinar por WhatsApp" o contacta al vendedor.')
        setProcesando(false)
        return
      }

      const pid = await crearPedidoEnDB(form.metodoPago)
      setPedidoId(pid)

      // Abrir Culqi Checkout
      if (typeof window.Culqi !== 'undefined') {
        window.Culqi.publicKey = CULQI_PUBLIC_KEY
        window.Culqi.settings({
          title: 'RIVT',
          currency: 'PEN',
          description: `Pedido RIVT #${pid}`,
          amount: Math.round(total * 100),
          order: pid,
        })
        window.culqi = async () => {
          if (window.Culqi.token) {
            try {
              if (form.metodoPago === 'yape') {
                await pagosAPI.yape({ yape_token: window.Culqi.token.id, pedido_id: pid, monto: total })
              } else {
                await pagosAPI.culqi({ token: window.Culqi.token.id, pedido_id: pid, email: form.email, monto: total })
              }
              clearCart()
              setSubmitted(true)
            } catch (err) {
              setPayError(err.message)
            }
          } else if (window.Culqi.order) {
            setPayError('Hubo un error al procesar el pago. Intenta de nuevo.')
          }
          setProcesando(false)
        }
        window.Culqi.open()
      } else {
        setPayError('El sistema de pago no cargó correctamente. Actualiza la página e intenta de nuevo.')
        setProcesando(false)
      }
    } catch (err) {
      setPayError(err.message || 'Error al procesar el pedido')
      setProcesando(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-fadeIn">
        <div className="w-16 h-16 border-2 border-ink rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="section-title mb-4">¡Pedido confirmado!</h2>
        <p className="text-ink-light text-sm leading-relaxed mb-8">
          Gracias <strong>{form.nombre}</strong>. Nos contactaremos al <strong>{form.telefono}</strong> para coordinar la entrega.
        </p>
        <Link to="/" className="btn-primary inline-block">Seguir comprando</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <h1 className="section-title mb-10">Finalizar pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6" noValidate>
          {/* Datos personales */}
          <div>
            <h2 className="font-serif text-xl mb-4">Datos personales</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} />
              <Field label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} error={errors.apellido} />
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
              <Field label="Teléfono / WhatsApp" name="telefono" type="tel" value={form.telefono} onChange={handleChange} error={errors.telefono} placeholder="+51 9XX XXX XXX" />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h2 className="font-serif text-xl mb-4">Dirección de envío</h2>
            <div className="space-y-4">
              <Field label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} error={errors.direccion} placeholder="Av. / Jr. / Calle + número" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Distrito" name="distrito" value={form.distrito} onChange={handleChange} error={errors.distrito} />
                <Field label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} error={errors.ciudad} />
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <h2 className="font-serif text-xl mb-4">Método de pago</h2>
            <div className="space-y-2">
              {METODOS_PAGO.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                    form.metodoPago === m.id ? 'border-ink bg-ink/5' : 'border-cream-darker hover:border-ink-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value={m.id}
                    checked={form.metodoPago === m.id}
                    onChange={handleChange}
                    className="accent-ink"
                  />
                  <span className="text-sm font-medium">{m.label}</span>
                </label>
              ))}
            </div>

            {(form.metodoPago === 'tarjeta' || form.metodoPago === 'yape') && (
              <p className="mt-3 text-xs text-ink-muted border border-cream-darker p-3 bg-cream-dark">
                Se abrirá el formulario de pago seguro de Culqi. Configura tu <code>VITE_CULQI_PUBLIC_KEY</code> en <code>client/.env</code> para activar el pago real.
              </p>
            )}
          </div>

          {payError && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{payError}</p>
          )}

          <button type="submit" disabled={procesando} className="btn-primary w-full text-center disabled:opacity-60">
            {procesando ? 'Procesando...' : form.metodoPago === 'whatsapp' ? 'Enviar pedido por WhatsApp' : 'Pagar ahora'}
          </button>
        </form>

        {/* Resumen */}
        <div className="lg:col-span-2">
          <div className="bg-cream-dark p-6 sticky top-24">
            <h2 className="font-serif text-xl mb-5">Resumen</h2>
            <ul className="space-y-4 mb-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <img src={item.imagen} alt={item.nombre} className="w-14 h-16 object-cover bg-cream" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium leading-snug">{item.nombre}</p>
                    <p className="text-ink-muted text-xs mt-0.5">Talla {item.talla} · x{item.cantidad}</p>
                    <p className="font-semibold mt-1">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-cream-darker pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, error, type = 'text', placeholder }) {
  return (
    <div>
      <label className="label-tag text-ink-muted mb-1 block">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}
