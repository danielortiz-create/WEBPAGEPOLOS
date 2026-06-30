const express = require('express')
const db = require('../database')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// GET /api/productos — listado público
router.get('/', (req, res) => {
  const { cat, q } = req.query
  let chain = db.get('productos').filter({ activo: true })

  if (cat) chain = chain.filter({ categoria: cat })

  let results = chain.value()

  if (q) {
    const term = q.toLowerCase()
    results = results.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
    )
  }

  res.json(results.reverse())
})

// GET /api/productos/:id — detalle público
router.get('/:id', (req, res) => {
  const product = db.get('productos').find({ id: Number(req.params.id), activo: true }).value()
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(product)
})

// ── Admin ─────────────────────────────────────────────────────

// GET /api/productos/admin/all
router.get('/admin/all', requireAuth, (req, res) => {
  res.json(db.get('productos').value().slice().reverse())
})

// POST /api/productos — crear
router.post('/', requireAuth, (req, res) => {
  const { nombre, descripcion, precio, categoria, tallas, stock, imagen, imagenes, color } = req.body
  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' })
  }

  const newProduct = {
    id: db.getNextProductId(),
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
    creado_en: new Date().toISOString(),
  }

  db.get('productos').push(newProduct).write()
  res.status(201).json(newProduct)
})

// PUT /api/productos/:id — actualizar
router.put('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const existing = db.get('productos').find({ id }).value()
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' })

  const { nombre, descripcion, precio, categoria, tallas, stock, imagen, imagenes, color, activo } = req.body

  db.get('productos').find({ id }).assign({
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
  }).write()

  res.json(db.get('productos').find({ id }).value())
})

// DELETE /api/productos/:id — borrado lógico
router.delete('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const existing = db.get('productos').find({ id }).value()
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' })

  db.get('productos').find({ id }).assign({ activo: false }).write()
  res.json({ ok: true })
})

module.exports = router
