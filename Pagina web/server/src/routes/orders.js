const express = require('express')
const { v4: uuidv4 } = require('uuid')
const Pedido = require('../models/Pedido')
const { requireAuth } = require('../middleware/auth')
const asyncHandler = require('../middleware/asyncHandler')
const { PRECIOS_BUILD } = require('./build')

const router = express.Router()
const ESTADOS_VALIDOS = ['pendiente', 'pagado', 'enviado', 'cancelado']

// POST /api/pedidos — crear (público)
router.post('/', asyncHandler(async (req, res) => {
  const { cliente, items, total, metodo_pago, direccion, notas, pago_id } = req.body

  if (!cliente || !items || !total) {
    return res.status(400).json({ error: 'Faltan datos del pedido' })
  }

  // El precio de los polos personalizados se fija en el server según su
  // tamaño — el valor que venga del cliente no cuenta
  for (const it of items) {
    if (it.personalizado && PRECIOS_BUILD[it.tamano_diseno]) {
      it.precio = PRECIOS_BUILD[it.tamano_diseno]
    }
  }
  const totalCalculado = items.reduce((acc, i) => acc + Number(i.precio) * Number(i.cantidad || 1), 0)

  const pedido = await Pedido.create({
    id: uuidv4(),
    cliente,
    items,
    total: totalCalculado,
    estado: 'pendiente',
    metodo_pago: metodo_pago || 'whatsapp',
    pago_id: pago_id || null,
    direccion: direccion || {},
    notas: notas || '',
  })

  res.status(201).json(pedido)
}))

// ── Admin ─────────────────────────────────────────────────────

// GET /api/pedidos
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { estado } = req.query
  const filtro = {}
  if (estado && ESTADOS_VALIDOS.includes(estado)) {
    filtro.estado = estado
  }
  const pedidos = await Pedido.find(filtro).sort({ _id: -1 })
  res.json(pedidos)
}))

// GET /api/pedidos/:id
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const pedido = await Pedido.findOne({ id: req.params.id })
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
  res.json(pedido)
}))

// PATCH /api/pedidos/:id/estado
router.patch('/:id/estado', requireAuth, asyncHandler(async (req, res) => {
  const { estado } = req.body
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Usa: ${ESTADOS_VALIDOS.join(', ')}` })
  }

  const updated = await Pedido.findOneAndUpdate(
    { id: req.params.id },
    { $set: { estado } },
    { new: true }
  )
  if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' })

  res.json(updated)
}))

module.exports = router
