const mongoose = require('mongoose')

const productoSchema = new mongoose.Schema({
  id:          { type: Number, required: true, unique: true, index: true },
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: '' },
  precio:      { type: Number, required: true },
  categoria:   { type: String, default: 'General' },
  tallas:      { type: [String], default: ['S', 'M', 'L', 'XL'] },
  stock:       { type: Number, default: 0 },
  imagen:      { type: String, default: '' },
  imagenes:    { type: [String], default: [] },
  color:       { type: String, default: '' },
  activo:      { type: Boolean, default: true },
  creado_en:   { type: String, default: () => new Date().toISOString() },
})

// El frontend espera el mismo JSON que devolvía lowdb: sin _id ni __v
productoSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret._id
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('Producto', productoSchema)
