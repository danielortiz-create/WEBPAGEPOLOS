const bcrypt = require('bcryptjs')
const Admin = require('../models/Admin')
const Producto = require('../models/Producto')
const { Counter } = require('../models/Counter')

async function seed() {
  // Admin inicial si no existe
  const adminUser = process.env.ADMIN_USER || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || 'rivt2025'

  const existente = await Admin.findOne({ usuario: adminUser })
  if (!existente) {
    await Admin.create({
      id: 1,
      usuario: adminUser,
      password_hash: bcrypt.hashSync(adminPass, 10),
    })
    console.log(`✔ Admin creado: ${adminUser}`)
  }

  // Productos demo solo si la colección está vacía
  const total = await Producto.countDocuments()
  if (total === 0) {
    await Producto.create([
      {
        id: 1,
        nombre: 'Polo Dodgers "Pride of LA"',
        descripcion: 'Polo de algodón premium con el icónico gráfico vintage "Pride of Los Angeles". Corte unisex relaxed fit, tela 100% algodón peinado 185 gsm. Inspirado en el estilo urbano de Nueva York.',
        precio: 45,
        tallas: ['S', 'M', 'L', 'XL'],
        stock: 20,
        imagen: '/img/dodgers-front.webp',
        imagenes: ['/img/dodgers-front.webp', '/img/dodgers-back.webp'],
        color: 'Crema / Off-White',
        activo: true,
      },
      {
        id: 2,
        nombre: 'Polo LA Dodgers "Cap Logo"',
        descripcion: 'Polo con el inconfundible gráfico de la gorra LA en el pecho y el diseño completo en la espalda. Calidad premium, corte moderno.',
        precio: 45,
        tallas: ['S', 'M', 'L', 'XL'],
        stock: 15,
        imagen: '/img/la-front.webp',
        imagenes: ['/img/la-front.webp', '/img/la-combo.webp', '/img/la-detail.webp'],
        color: 'Blanco / White',
        activo: true,
      },
    ])
    await Counter.findOneAndUpdate(
      { _id: 'productoId' },
      { $set: { seq: 2 } },
      { upsert: true }
    )
    console.log('✔ Productos de ejemplo creados')
  }
}

module.exports = { seed }
