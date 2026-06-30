const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../database')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const ESTADOS_VALIDOS = ['pendiente', 'pagado', 'enviado', 'cancelado']

// POST /api/pedidos — crear (público)
router.post('/', (req, res) => {
  const { cliente, items, total, metodo_pago, direccion, notas, pago_id } = req.body

  if (!cliente || !items || !total) {
    return res.status(400).json({ error: 'Faltan datos del pedido' })
  }

  const pedido = {
    id: uuidv4(),
    cliente,
    items,
    total: Number(total),
    estado: 'pendiente',
    metodo_pago: metodo_pago || 'whatsapp',
    pago_id: pago_id || null,
    direccion: direccion || {},
    notas: notas || '',
    creado_en: new Date().toISOString(),
  }

  db.get('pedidos').push(pedido).write()
  res.status(201).json(pedido)
})

// ── Admin ─────────────────────────────────────────────────────

// GET /api/pedidos
router.get('/', requireAuth, (req, res) => {
  const { estado } = req.query
  let chain = db.get('pedidos')
  if (estado && ESTADOS_VALIDOS.includes(estado)) {
    chain = chain.filter({ estado })
  }
  res.json(chain.value().slice().reverse())
})

// GET /api/pedidos/:id
router.get('/:id', requireAuth, (req, res) => {
  const pedido = db.get('pedidos').find({ id: req.params.id }).value()
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
  res.json(pedido)
})

// PATCH /api/pedidos/:id/estado
router.patch('/:id/estado', requireAuth, (req, res) => {
  const { estado } = req.body
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Usa: ${ESTADOS_VALIDOS.join(', ')}` })
  }

  const existing = db.get('pedidos').find({ id: req.params.id }).value()
  if (!existing) return res.status(404).json({ error: 'Pedido no encontrado' })

  db.get('pedidos').find({ id: req.params.id }).assign({ estado }).write()
  res.json(db.get('pedidos').find({ id: req.params.id }).value())
})

module.exports = router
