const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
  id:            { type: Number, default: 1 },
  usuario:       { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  creado_en:     { type: String, default: () => new Date().toISOString() },
})

adminSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret._id
    delete ret.__v
    delete ret.password_hash
    return ret
  },
})

module.exports = mongoose.model('Admin', adminSchema)
