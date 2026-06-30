const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const bcrypt = require('bcryptjs')
const path = require('path')

const DB_PATH = path.resolve(process.env.DATABASE_URL || './db.json')
const adapter = new FileSync(DB_PATH)
const db = low(adapter)

// Estructura inicial de la base de datos
db.defaults({
  productos: [],
  pedidos: [],
  admins: [],
  _meta: { nextProductId: 1 },
}).write()

// Crear admin inicial si no existe
const adminUser = process.env.ADMIN_USER || 'admin'
const adminPass = process.env.ADMIN_PASSWORD || 'rivt2025'

if (!db.get('admins').find({ usuario: adminUser }).value()) {
  db.get('admins').push({
    id: 1,
    usuario: adminUser,
    password_hash: bcrypt.hashSync(adminPass, 10),
    creado_en: new Date().toISOString(),
  }).write()
  console.log(`✔ Admin creado: ${adminUser} / ${adminPass}`)
}

// Seed de productos si la BD está vacía
if (db.get('productos').size().value() === 0) {
  const ahora = new Date().toISOString()
  db.get('productos').push(
    {
      id: 1,
      nombre: 'Polo Dodgers "Pride of LA"',
      descripcion: 'Polo de algodón premium con el icónico gráfico vintage "Pride of Los Angeles" de los Dodgers. Corte unisex relaxed fit, tela 100% algodón peinado 185 gsm. Inspirado en el estilo deportivo de Nueva York.',
      precio: 45,
      categoria: 'Béisbol',
      tallas: ['S', 'M', 'L', 'XL'],
      stock: 20,
      imagen: '/img/dodgers-front.webp',
      imagenes: ['/img/dodgers-front.webp', '/img/dodgers-back.webp'],
      color: 'Crema / Off-White',
      activo: true,
      creado_en: ahora,
    },
    {
      id: 2,
      nombre: 'Polo LA Dodgers "Cap Logo"',
      descripcion: 'Polo con el inconfundible gráfico de la gorra LA Dodgers en el pecho y el diseño completo en la espalda. Calidad premium, corte moderno. La pieza perfecta para el fanático auténtico.',
      precio: 45,
      categoria: 'Béisbol',
      tallas: ['S', 'M', 'L', 'XL'],
      stock: 15,
      imagen: '/img/la-front.webp',
      imagenes: ['/img/la-front.webp', '/img/la-combo.webp', '/img/la-detail.webp'],
      color: 'Blanco / White',
      activo: true,
      creado_en: ahora,
    }
  ).write()
  db.set('_meta.nextProductId', 3).write()
  console.log('✔ Productos de ejemplo creados')
}

// Helper: obtener siguiente ID autoincremental para productos
db.getNextProductId = () => {
  const id = db.get('_meta.nextProductId').value()
  db.set('_meta.nextProductId', id + 1).write()
  return id
}

module.exports = db
