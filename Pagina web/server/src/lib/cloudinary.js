const { v2: cloudinary } = require('cloudinary')

// Lee CLOUDINARY_URL del entorno (cloudinary://KEY:SECRET@CLOUD_NAME)
cloudinary.config()

function cloudinaryConfigurado() {
  return Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_SECRET)
}

function subirACloudinary(buffer, folder = 'rivt-productos') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })
}

module.exports = { cloudinaryConfigurado, subirACloudinary }
