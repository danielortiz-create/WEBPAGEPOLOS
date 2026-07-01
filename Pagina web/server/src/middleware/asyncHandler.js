// Envuelve handlers async para que los errores lleguen al error handler global
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
