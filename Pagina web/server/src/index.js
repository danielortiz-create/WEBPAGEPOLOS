require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

const { connectDB } = require('./db/connect')
const { seed } = require('./db/seed')

const app = express()
const PORT = process.env.PORT || 4000

// Railway corre detrás de un proxy: sin esto req.ip sería la IP del
// proxy y todos los visitantes compartirían el rate limit de /api/build
app.set('trust proxy', 1)

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())

// Servir imágenes estáticas subidas (legacy — las nuevas van a Cloudinary)
app.use('/img', express.static(
  path.resolve(__dirname, '../../client/public/img')
))

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/productos', require('./routes/products'))
app.use('/api/pedidos',   require('./routes/orders'))
app.use('/api/upload',    require('./routes/upload'))
app.use('/api/pagos',     require('./routes/payments'))
app.use('/api/build',     require('./routes/build'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// ── Error handler global (rutas API async) ────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Servir frontend (producción) ──────────────────────────────
const clientBuild = path.resolve(__dirname, '../../client/dist')
app.use(express.static(clientBuild))
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'))
})

// ── Arrancar ──────────────────────────────────────────────────
async function main() {
  await connectDB()
  await seed()
  app.listen(PORT, () => {
    console.log(`\n🚀 RIVT API corriendo en http://localhost:${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/api/health\n`)
  })
}

main().catch((err) => {
  console.error('✖ Error al iniciar el servidor:', err.message)
  process.exit(1)
})
