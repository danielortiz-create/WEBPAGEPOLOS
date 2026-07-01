const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
  _id: String, // 'productoId'
  seq: { type: Number, default: 0 },
})

const Counter = mongoose.model('Counter', counterSchema)

async function getNextProductId() {
  const c = await Counter.findOneAndUpdate(
    { _id: 'productoId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return c.seq
}

module.exports = { Counter, getNextProductId }
