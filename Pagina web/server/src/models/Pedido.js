const mongoose = require('mongoose')

// _id: false — sin esto Mongoose inyecta un _id en cada item
// y cambia el JSON que ve el panel admin
const itemSchema = new mongoose.Schema({
  id:       Number,
  nombre:   String,
  talla:    String,
  cantidad: Number,
  precio:   Number,
}, { _id: false })

const pedidoSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true, index: true },
  cliente:   {
    nombre:   String,
    apellido: String,
    email:    String,
    telefono: String,
  },
  items:     [itemSchema],
  total:     { type: Number, required: true },
  estado:    { type: String, enum: ['pendiente', 'pagado', 'enviado', 'cancelado'], default: 'pendiente' },
  metodo_pago: { type: String, default: 'whatsapp' },
  pago_id:   { type: String, default: null },
  direccion: {
    direccion: String,
    distrito:  String,
    ciudad:    String,
  },
  notas:     { type: String, default: '' },
  creado_en: { type: String, default: () => new Date().toISOString() },
}, { minimize: false })

pedidoSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret._id
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('Pedido', pedidoSchema)
