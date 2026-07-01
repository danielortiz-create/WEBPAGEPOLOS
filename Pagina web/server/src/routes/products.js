const express = require('express')
const Producto = require('../models/Producto')
const { getNextProductId } = require('../models/Counter')
const { requireAuth } = require('../middleware/auth')
const asyncHandler = require('../middleware/asyncHandler')

const router = express.Router()

// GET /api/productos — listado público
router.get('/', asyncHandler(async (req, res) => {
  const { cat, q } = req.query
  const filtro = { activo: true }
  if (cat) filtro.categoria = cat

  let results = await Producto.find(filtro).sort({ _id: -1 })

  if (q) {
    const term = q.toLowerCase()
    results = results.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
    )
  }

  res.json(results)
}))

// GET /api/productos/:id — detalle público
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Producto.findOne({ id: Number(req.params.id), activo: true })
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(product)
}))

// ── Admin ─────────────────────────────────────────────────────

// GET /api/productos/admin/all
router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  const productos = await Producto.find().sort({ _id: -1 })
  res.json(productos)
}))

// POST /api/productos — crear
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { nombre, descripcion, precio, categoria, tallas, stock, imagen, imagenes, color } = req.body
  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' })
  }

  const newProduct = await Producto.create({
    id: await getNextProductId(),
    nombre,
    descripcion: descripcion || '',
    precio: Number(precio),
    categoria: categoria || 'General',
    tallas: Array.isArray(tallas) ? tallas : ['S', 'M', 'L', 'XL'],
    stock: Number(stock) || 0,
    imagen: imagen || '',
    imagenes: Array.isArray(imagenes) ? imagenes : [],
    color: color || '',
    activo: true,
  })

  res.status(201).json(newProduct)
}))

// PUT /api/productos/:id — actualizar
router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const existing = await Producto.findOne({ id })
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' })

  const { nombre, descripcion, precio, categoria, tallas, stock, imagen, imagenes, color, activo } = req.body

  const updated = await Producto.findOneAndUpdate(
    { id },
    {
      $set: {
        nombre: nombre ?? existing.nombre,
        descripcion: descripcion ?? existing.descripcion,
        precio: precio !== undefined ? Number(precio) : existing.precio,
        categoria: categoria ?? existing.categoria,
        tallas: Array.isArray(tallas) ? tallas : existing.tallas,
        stock: stock !== undefined ? Number(stock) : existing.stock,
        imagen: imagen ?? existing.imagen,
        imagenes: Array.isArray(imagenes) ? imagenes : existing.imagenes,
        color: color ?? existing.color,
        activo: activo !== undefined ? Boolean(activo) : existing.activo,
      },
    },
    { new: true }
  )

  res.json(updated)
}))

// DELETE /api/productos/:id — borrado lógico
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const existing = await Producto.findOneAndUpdate({ id }, { $set: { activo: false } })
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json({ ok: true })
}))

module.exports = router
