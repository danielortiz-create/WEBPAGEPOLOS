/**
 * Migración one-shot: lee el archivo JSON de lowdb y sube los datos
 * a MongoDB Atlas. Solo inserta en colecciones que estén vacías.
 *
 * Uso: desde la carpeta server/  →  node scripts/migrate-lowdb.js
 * Nota: el archivo de datos actual se llama database.sqlite pero su
 * contenido es JSON de lowdb (DATABASE_URL en .env).
 */
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const { connectDB } = require('../src/db/connect')
const Producto = require('../src/models/Producto')
const Pedido = require('../src/models/Pedido')
const Admin = require('../src/models/Admin')
const { Counter } = require('../src/models/Counter')

async function main() {
  const dataPath = path.resolve(__dirname, '..', process.env.DATABASE_URL || './db.json')
  if (!fs.existsSync(dataPath)) {
    console.error(`✖ No se encontró el archivo de datos: ${dataPath}`)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  console.log(`Leído ${dataPath}:`)
  console.log(`  productos: ${raw.productos?.length || 0}`)
  console.log(`  pedidos:   ${raw.pedidos?.length || 0}`)
  console.log(`  admins:    ${raw.admins?.length || 0}`)

  await connectDB()

  if (raw.productos?.length && (await Producto.countDocuments()) === 0) {
    await Producto.insertMany(raw.productos)
    console.log(`✔ ${raw.productos.length} productos migrados`)
  } else {
    console.log('— Productos: colección destino no vacía o sin datos, se omite')
  }

  if (raw.pedidos?.length && (await Pedido.countDocuments()) === 0) {
    await Pedido.insertMany(raw.pedidos)
    console.log(`✔ ${raw.pedidos.length} pedidos migrados`)
  } else {
    console.log('— Pedidos: colección destino no vacía o sin datos, se omite')
  }

  if (raw.admins?.length && (await Admin.countDocuments()) === 0) {
    await Admin.insertMany(raw.admins)
    console.log(`✔ ${raw.admins.length} admins migrados`)
  } else {
    console.log('— Admins: colección destino no vacía o sin datos, se omite')
  }

  // Sembrar el contador para que el próximo producto no colisione
  const nextId = raw._meta?.nextProductId
  if (nextId) {
    await Counter.findOneAndUpdate(
      { _id: 'productoId' },
      { $max: { seq: nextId - 1 } },
      { upsert: true }
    )
    console.log(`✔ Counter de productos sembrado en ${nextId - 1}`)
  }

  await mongoose.disconnect()
  console.log('✔ Migración completa')
}

main().catch((err) => {
  console.error('✖ Error en la migración:', err.message)
  process.exit(1)
})
