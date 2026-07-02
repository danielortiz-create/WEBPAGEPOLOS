const express = require('express')
const asyncHandler = require('../middleware/asyncHandler')
const { cloudinaryConfigurado, subirACloudinary } = require('../lib/cloudinary')

const router = express.Router()

// ── Config ────────────────────────────────────────────────────
const MODELO = 'gpt-image-1-mini' // upgrade de calidad: 'gpt-image-1.5'
const LIMITE_DIARIO = 3           // generaciones por visitante (IP) por día
const CAP_GLOBAL_DIARIO = 150     // tope total de generaciones al día (protege el crédito)
const PRECIOS = { chico: 80, mediano: 100, grande: 120 } // PEN
const COLORES = ['negro', 'blanco']
const MARCAS_BLOQUEADAS = [
  'nike', 'adidas', 'puma', 'reebok', 'supreme', 'gucci', 'louis vuitton',
  'disney', 'marvel', 'pokemon', 'pokémon', 'nintendo', 'hello kitty',
  'barcelona', 'real madrid', 'alianza lima', 'universitario', 'dodgers', 'yankees',
]

function openaiConfigurado() {
  return Boolean(process.env.OPENAI_API_KEY)
}

// ── Rate limit in-memory ──────────────────────────────────────
// Map<ip, { dia: 'YYYY-MM-DD', usos }> — se resetea si Railway reinicia (aceptado)
const usosPorIP = new Map()
let usoGlobal = { dia: '', usos: 0 }

function hoyLima() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date())
}

function usosDe(ip) {
  const reg = usosPorIP.get(ip)
  if (!reg || reg.dia !== hoyLima()) return 0
  return reg.usos
}

function consumirUso(ip) {
  const dia = hoyLima()
  const reg = usosPorIP.get(ip)
  if (!reg || reg.dia !== dia) usosPorIP.set(ip, { dia, usos: 1 })
  else reg.usos++

  if (usoGlobal.dia !== dia) usoGlobal = { dia, usos: 0 }
  usoGlobal.usos++

  // Poda: elimina registros de días anteriores para no crecer sin límite
  if (usosPorIP.size > 5000) {
    for (const [k, v] of usosPorIP) if (v.dia !== dia) usosPorIP.delete(k)
  }
}

function devolverUso(ip) {
  const reg = usosPorIP.get(ip)
  if (reg && reg.usos > 0) reg.usos--
  if (usoGlobal.usos > 0) usoGlobal.usos--
}

function capGlobalAlcanzado() {
  return usoGlobal.dia === hoyLima() && usoGlobal.usos >= CAP_GLOBAL_DIARIO
}

// ── Prompt server-side (el cliente solo aporta su idea) ──────
const DESC_TAMANO = {
  chico:   'un estampado pequeño en el lado izquierdo del pecho',
  mediano: 'un estampado de tamaño mediano centrado en el pecho',
  grande:  'un estampado grande que cubre todo el frente',
}

function construirPrompt(idea, color, tamano) {
  return (
    `Fotografía de producto profesional de un polo (camiseta) de algodón de color ${color}, ` +
    `extendido de frente sobre un fondo neutro claro, iluminación de estudio, estética minimalista premium. ` +
    `El polo lleva ${DESC_TAMANO[tamano]} con este diseño: ${idea}. ` +
    `Sin personas, sin texto agregado fuera del diseño, sin logos ni marcas registradas de terceros.`
  )
}

// ── Rutas ─────────────────────────────────────────────────────

// GET /api/build/estado — la BuildPage decide qué renderizar
router.get('/estado', (req, res) => {
  if (!openaiConfigurado() || !cloudinaryConfigurado()) {
    return res.json({ disponible: false, precios: PRECIOS })
  }
  res.json({
    disponible: true,
    precios: PRECIOS,
    restantes: Math.max(0, LIMITE_DIARIO - usosDe(req.ip)),
  })
})

// POST /api/build/generar — { prompt, color, tamano }
router.post('/generar', asyncHandler(async (req, res) => {
  if (!openaiConfigurado() || !cloudinaryConfigurado()) {
    return res.status(503).json({ error: 'El diseñador de polos aún no está disponible', configurar: true })
  }

  // 1) Validación
  const { prompt, color, tamano } = req.body || {}
  const idea = String(prompt || '').replace(/[\r\n\t]+/g, ' ').trim()
  if (idea.length < 3 || idea.length > 300) {
    return res.status(400).json({ error: 'Describe tu idea en 3 a 300 caracteres' })
  }
  if (!COLORES.includes(color)) return res.status(400).json({ error: 'Color inválido' })
  if (!PRECIOS[tamano]) return res.status(400).json({ error: 'Tamaño de diseño inválido' })

  const ideaLower = idea.toLowerCase()
  if (MARCAS_BLOQUEADAS.some((m) => ideaLower.includes(m))) {
    return res.status(400).json({
      error: 'No podemos estampar marcas o personajes con derechos de autor. Prueba con un diseño original.',
    })
  }

  // 2) Límites (se consume ANTES de generar; se devuelve si algo falla)
  if (capGlobalAlcanzado()) {
    return res.status(429).json({ error: 'El diseñador alcanzó su capacidad de hoy. Vuelve mañana.', restantes: 0 })
  }
  if (usosDe(req.ip) >= LIMITE_DIARIO) {
    return res.status(429).json({ error: `Alcanzaste el límite de ${LIMITE_DIARIO} diseños por día. Vuelve mañana.`, restantes: 0 })
  }
  consumirUso(req.ip)

  try {
    // 3) Moderación previa (gratis, <1s) — corta antes de gastar en generar
    const modRes = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: idea }),
      signal: AbortSignal.timeout(15000),
    })
    const mod = await modRes.json()
    if (mod.results?.[0]?.flagged) {
      devolverUso(req.ip)
      return res.status(400).json({ error: 'Tu descripción contiene contenido no permitido. Intenta con otra idea.' })
    }

    // 4) Generación de imagen
    const genRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELO,
        prompt: construirPrompt(idea, color, tamano),
        size: '1024x1024',
        quality: 'medium',
        n: 1,
        output_format: 'jpeg',
      }),
      signal: AbortSignal.timeout(90000),
    })
    const gen = await genRes.json()

    if (!genRes.ok) {
      devolverUso(req.ip)
      console.error('Error OpenAI:', gen.error?.message || genRes.status)
      if (gen.error?.code === 'moderation_blocked') {
        return res.status(400).json({ error: 'Ese diseño no está permitido. Intenta con otra idea.' })
      }
      return res.status(502).json({ error: 'No pudimos generar tu diseño. Intenta de nuevo en unos minutos.' })
    }

    // 5) Subir a Cloudinary
    const buffer = Buffer.from(gen.data[0].b64_json, 'base64')
    const subido = await subirACloudinary(buffer, 'rivt-builds')

    res.json({
      url: subido.secure_url,
      precio: PRECIOS[tamano],
      restantes: Math.max(0, LIMITE_DIARIO - usosDe(req.ip)),
    })
  } catch (err) {
    // Timeout / red / Cloudinary: no cobrar el intento
    devolverUso(req.ip)
    console.error('Error build:', err.message)
    res.status(502).json({ error: 'No pudimos generar tu diseño. Intenta de nuevo.' })
  }
}))

module.exports = router
module.exports.PRECIOS_BUILD = PRECIOS
