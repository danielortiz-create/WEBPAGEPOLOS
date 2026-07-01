const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')
const asyncHandler = require('../middleware/asyncHandler')

const router = express.Router()

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { usuario, password } = req.body

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  }

  const admin = await Admin.findOne({ usuario })

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  const token = jwt.sign(
    { id: admin.id, usuario: admin.usuario },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({ token, usuario: admin.usuario })
}))

// GET /api/auth/me — verifica token activo
router.get('/me', (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Sin token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ usuario: payload.usuario })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

module.exports = router
