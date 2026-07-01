const express = require('express')
const multer = require('multer')
const path = require('path')
const { v2: cloudinary } = require('cloudinary')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// Lee CLOUDINARY_URL del entorno (cloudinary://KEY:SECRET@CLOUD_NAME)
cloudinary.config()

function cloudinaryConfigurado() {
  return Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_SECRET)
}

const upload = multer({
  storage: multer.memoryStorage(),
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

function subirACloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'rivt-productos', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })
}

// POST /api/upload — subir imagen (admin)
router.post('/', requireAuth, upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' })
  }
  if (!cloudinaryConfigurado()) {
    return res.status(503).json({
      error: 'Almacenamiento de imágenes no configurado. Agrega CLOUDINARY_URL en server/.env',
      configurar: true,
    })
  }

  try {
    const result = await subirACloudinary(req.file.buffer)
    res.json({ url: result.secure_url, filename: result.public_id })
  } catch (err) {
    console.error('Error Cloudinary:', err.message)
    res.status(500).json({ error: 'Error al subir la imagen' })
  }
})

router.use((err, req, res, next) => {
  res.status(400).json({ error: err.message })
})

module.exports = router
