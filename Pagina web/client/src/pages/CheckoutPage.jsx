import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'
import { useCart } from '../context/CartContext'
import { pedidosAPI, pagosAPI } from '../services/api'

const METODOS_PAGO = [
  { id: 'online', label: 'Tarjeta / Yape (Mercado Pago)' },
  { id: 'whatsapp', label: 'Coordinar por WhatsApp' },
]

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', distrito: '', ciudad: 'Lima', metodoPago: 'online',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [pendiente, setPendiente] = useState(false)
  const [pedidoId, setPedidoId] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [payError, setPayError] = useState('')
  const [mpListo, setMpListo] = useState(false)
  const [mpNoConfigurado, setMpNoConfigurado] = useState(false)
  const [mostrarBrick, setMostrarBrick] = useState(false)
  // El total se congela al pasar al paso de pago (clearCart lo pondría en 0)
  const [totalPago, setTotalPago] = useState(0)

  // Inicializar MercadoPago con la public key servida por el backend
  useEffect(() => {
    pagosAPI.config()
      .then(({ publicKey }) => {
        initMercadoPago(publicKey, { locale: 'es-PE' })
        setMpListo(true)
      })
      .catch(() => setMpNoConfigurado(true))
  }, [])

  if (items.length === 0 && !submitted && !pendiente) {
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
      items: items.map((i) => ({
        id: i.id, nombre: i.nombre, talla: i.talla, cantidad: i.cantidad, precio: i.precio,
        ...(i.personalizado && {
          personalizado: true,
          prompt: i.prompt,
          imagen: i.imagen,
          color_polo: i.color_polo,
          tamano_diseno: i.tamano_diseno,
        }),
      })),
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
          items.map((i) =>
            `• ${i.nombre} (Talla ${i.talla}) x${i.cantidad}` +
            (i.personalizado ? `\n  Diseño: ${i.imagen}\n  Idea: "${i.prompt}"` : '')
          ).join('\n') +
          `\n\nTotal: S/ ${total.toFixed(2)}\n\nDatos de envío:\n${form.nombre} ${form.apellido}\n${form.direccion}, ${form.distrito}, ${form.ciudad}\nTel: ${form.telefono}`
        window.open(`https://wa.me/51912304036?text=${encodeURIComponent(resumen)}`, '_blank')
        clearCart()
        setSubmitted(true)
        return
      }

      // Pago online con MercadoPago
      if (mpNoConfigurado) {
        setPayError('El pago online no está disponible aún. Por favor elige "Coordinar por WhatsApp".')
        setProcesando(false)
        return
      }
      if (!mpListo) {
        setPayError('El sistema de pago está cargando. Intenta de nuevo en unos segundos.')
        setProcesando(false)
        return
      }

      const pid = await crearPedidoEnDB('online')
      setPedidoId(pid)
      setTotalPago(total)
      setMostrarBrick(true)
      setProcesando(false)
    } catch (err) {
      setPayError(err.message || 'Error al procesar el pedido')
      setProcesando(false)
    }
  }

  const handlePagar = async ({ formData }) => {
    // onSubmit del Payment Brick — devuelve promesa; el brick muestra su spinner
    try {
      const r = await pagosAPI.procesar({ pedido_id: pedidoId, formData })
      if (r.status === 'approved') {
        clearCart()
        setSubmitted(true)
      } else if (r.status === 'in_process' || r.status === 'pending') {
        clearCart()
        setPendiente(true)
      } else {
        setPayError('Pago rechazado. Verifica los datos de tu tarjeta e intenta de nuevo.')
      }
    } catch (err) {
      setPayError(err.message || 'Error al procesar el pago')
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

  if (pendiente) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center animate-fadeIn">
        <div className="w-16 h-16 border-2 border-ink rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="section-title mb-4">Pago en proceso</h2>
        <p className="text-ink-light text-sm leading-relaxed mb-8">
          Tu pago está siendo verificado. Te avisaremos al <strong>{form.telefono}</strong> apenas se confirme.
        </p>
        <Link to="/" className="btn-primary inline-block">Volver a la tienda</Link>
      </div>
    )
  }

  // Paso 2: formulario de pago embebido (Payment Brick)
  if (mostrarBrick && pedidoId) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 md:py-20 animate-fadeIn">
        <h1 className="section-title mb-2">Pagar pedido</h1>
        <p className="text-ink-light text-sm mb-8">
          Total a pagar: <strong>S/ {totalPago.toFixed(2)}</strong>
        </p>

        <Payment
          initialization={{
            amount: Number(totalPago.toFixed(2)),
            payer: { email: form.email },
          }}
          customization={{
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
            },
          }}
          onSubmit={handlePagar}
          onError={() => setPayError('Error en el formulario de pago. Actualiza la página e intenta de nuevo.')}
        />

        {payError && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2 mt-4">{payError}</p>
        )}

        <button
          onClick={() => { setMostrarBrick(false); setPayError('') }}
          className="text-xs underline underline-offset-2 text-ink-muted hover:text-ink mt-6"
        >
          ← Volver a los datos de envío
        </button>
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

            {form.metodoPago === 'online' && mpNoConfigurado && (
              <p className="mt-3 text-xs text-ink-muted border border-cream-darker p-3 bg-cream-dark">
                El pago online aún no está disponible. Elige "Coordinar por WhatsApp" y te atenderemos al instante.
              </p>
            )}
          </div>

          {payError && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{payError}</p>
          )}

          <button type="submit" disabled={procesando} className="btn-primary w-full text-center disabled:opacity-60">
            {procesando ? 'Procesando...' : form.metodoPago === 'whatsapp' ? 'Enviar pedido por WhatsApp' : 'Continuar al pago'}
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
