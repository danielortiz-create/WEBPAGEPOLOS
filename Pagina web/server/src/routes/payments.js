const express = require('express')
const https = require('https')
const db = require('../database')

const router = express.Router()

// POST /api/pagos/culqi — cargo con tarjeta
router.post('/culqi', async (req, res) => {
  const { token, pedido_id, email, monto } = req.body

  if (!token || !pedido_id || !email || !monto) {
    return res.status(400).json({ error: 'Faltan datos: token, pedido_id, email, monto' })
  }

  const secretKey = process.env.CULQI_SECRET_KEY
  if (!secretKey || secretKey.includes('xxxxxxxxx')) {
    return res.status(503).json({
      error: 'Pasarela de pago no configurada. Agrega CULQI_SECRET_KEY en server/.env',
      configurar: true,
    })
  }

  try {
    const chargeData = JSON.stringify({
      amount: Math.round(Number(monto) * 100),
      currency_code: 'PEN',
      email,
      source_id: token,
      description: `Pedido RIVT #${pedido_id}`,
      metadata: { pedido_id },
    })

    const charge = await culqiPost('/charges', chargeData, secretKey)

    if (charge.object === 'error') {
      return res.status(400).json({ error: charge.user_message || 'Pago rechazado' })
    }

    db.get('pedidos').find({ id: pedido_id })
      .assign({ estado: 'pagado', pago_id: charge.id }).write()

    res.json({ ok: true, charge_id: charge.id })
  } catch (err) {
    console.error('Culqi error:', err.message)
    res.status(500).json({ error: 'Error al procesar el pago' })
  }
})

// POST /api/pagos/yape — cargo con Yape (token Culqi)
router.post('/yape', async (req, res) => {
  const { yape_token, pedido_id, monto } = req.body

  if (!yape_token || !pedido_id || !monto) {
    return res.status(400).json({ error: 'Faltan datos: yape_token, pedido_id, monto' })
  }

  const secretKey = process.env.CULQI_SECRET_KEY
  if (!secretKey || secretKey.includes('xxxxxxxxx')) {
    return res.status(503).json({
      error: 'Pasarela de pago no configurada. Agrega CULQI_SECRET_KEY en server/.env',
      configurar: true,
    })
  }

  try {
    const chargeData = JSON.stringify({
      amount: Math.round(Number(monto) * 100),
      currency_code: 'PEN',
      source_id: yape_token,
      description: `Pedido RIVT Yape #${pedido_id}`,
      metadata: { pedido_id, metodo: 'yape' },
    })

    const charge = await culqiPost('/charges', chargeData, secretKey)

    if (charge.object === 'error') {
      return res.status(400).json({ error: charge.user_message || 'Pago Yape rechazado' })
    }

    db.get('pedidos').find({ id: pedido_id })
      .assign({ estado: 'pagado', pago_id: charge.id }).write()

    res.json({ ok: true, charge_id: charge.id })
  } catch (err) {
    console.error('Yape error:', err.message)
    res.status(500).json({ error: 'Error al procesar el pago Yape' })
  }
})

function culqiPost(endpoint, body, secretKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.culqi.com',
      path: `/v2${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (resp) => {
      let data = ''
      resp.on('data', (c) => { data += c })
      resp.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { reject(new Error('Respuesta inválida de Culqi')) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

module.exports = router
