const express = require('express')
const crypto = require('crypto')
const { MercadoPagoConfig, Payment } = require('mercadopago')
const Pedido = require('../models/Pedido')
const asyncHandler = require('../middleware/asyncHandler')

const router = express.Router()

function mpConfigurado() {
  return Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_PUBLIC_KEY)
}

function mpClient() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
}

// GET /api/pagos/mp/config — public key para inicializar el Brick en el frontend
router.get('/mp/config', (req, res) => {
  if (!mpConfigurado()) {
    return res.status(503).json({ error: 'Pasarela de pago no configurada', configurar: true })
  }
  res.json({ publicKey: process.env.MP_PUBLIC_KEY })
})

// POST /api/pagos/mp/procesar — procesa el pago con los datos del Payment Brick
router.post('/mp/procesar', asyncHandler(async (req, res) => {
  const { pedido_id, formData } = req.body

  if (!mpConfigurado()) {
    return res.status(503).json({ error: 'Pasarela de pago no configurada', configurar: true })
  }
  if (!pedido_id || !formData) {
    return res.status(400).json({ error: 'Faltan datos del pago' })
  }

  const pedido = await Pedido.findOne({ id: pedido_id })
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

  try {
    const payment = await new Payment(mpClient()).create({
      body: {
        ...formData,
        // El monto SIEMPRE sale de la base de datos, nunca del cliente
        transaction_amount: Number(pedido.total),
        description: `Pedido RIVT #${pedido_id}`,
        external_reference: pedido_id,
      },
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    })

    if (payment.status === 'approved') {
      await Pedido.findOneAndUpdate(
        { id: pedido_id },
        { $set: { estado: 'pagado', pago_id: String(payment.id), metodo_pago: payment.payment_method_id || 'tarjeta' } }
      )
    }

    res.json({
      status: payment.status,
      status_detail: payment.status_detail,
      payment_id: payment.id,
    })
  } catch (err) {
    console.error('Error MercadoPago:', err.message)
    const detalle = err?.cause?.[0]?.description || err.message || 'Pago rechazado'
    res.status(400).json({ error: detalle })
  }
}))

// POST /api/pagos/mp/webhook — notificaciones asincrónicas de MercadoPago
// Responde 200 de inmediato (MP reintenta y marca la integración como
// fallida si no). El estado se valida re-consultando la API de MP con
// nuestro access token — la fuente de verdad no puede falsificarse.
router.post('/mp/webhook', (req, res) => {
  res.sendStatus(200)

  ;(async () => {
    try {
      if (req.body?.type !== 'payment' || !req.body?.data?.id) return
      if (!process.env.MP_ACCESS_TOKEN) return

      const payment = await new Payment(mpClient()).get({ id: req.body.data.id })

      if (payment.status === 'approved' && payment.external_reference) {
        await Pedido.findOneAndUpdate(
          { id: payment.external_reference, estado: 'pendiente' },
          { $set: { estado: 'pagado', pago_id: String(payment.id) } }
        )
      }
    } catch (err) {
      console.error('Webhook MercadoPago:', err.message)
    }
  })()
})

module.exports = router
