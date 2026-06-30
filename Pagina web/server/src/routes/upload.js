const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// Guardar imágenes en client/public/img (accesibles directamente por Vite)
const UPLOAD_DIR = path.resolve(__dirname, '../../../client/public/img')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `producto-${Date.now()}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'))
    }
  },
})

// POST /api/upload — subir imagen (admin)
router.post('/', requireAuth, upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' })
  }
  const url = `/img/${req.file.filename}`
  res.json({ url, filename: req.file.filename })
})

router.use((err, req, res, next) => {
  res.status(400).json({ error: err.message })
})

module.exports = router
