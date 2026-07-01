const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('✖ Falta MONGODB_URI en server/.env — crea un cluster gratis en https://www.mongodb.com/cloud/atlas')
    process.exit(1)
  }
  // Sin buffering: si Atlas no responde, las queries fallan de inmediato
  // en vez de colgarse 10 segundos con errores crípticos.
  mongoose.set('bufferCommands', false)
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  console.log('✔ Conectado a MongoDB Atlas')
}

module.exports = { connectDB }
