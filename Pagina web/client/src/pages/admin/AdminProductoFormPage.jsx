import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminProductosAPI, productosAPI, uploadImagen } from '../../services/api'

const TALLAS_DEFAULT = ['S', 'M', 'L', 'XL']

export default function AdminProductoFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: 45,
    tallas: [...TALLAS_DEFAULT], stock: 10, imagen: '', imagenes: [], color: '', activo: true,
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    productosAPI.obtener(id)
      .then((p) => {
        setForm({
          nombre: p.nombre, descripcion: p.descripcion, precio: p.precio,
          tallas: p.tallas, stock: p.stock,
          imagen: p.imagen, imagenes: p.imagenes || [], color: p.color, activo: p.activo,
        })
      })
      .catch(() => setError('No se pudo cargar el producto'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleTalla = (t) => {
    setForm((f) => ({
      ...f,
      tallas: f.tallas.includes(t) ? f.tallas.filter((x) => x !== t) : [...f.tallas, t],
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const urls = await Promise.all(files.map((f) => uploadImagen(f).then((r) => r.url)))
      setForm((f) => {
        const newImagenes = [...f.imagenes, ...urls]
        return {
          ...f,
          imagenes: newImagenes,
          imagen: f.imagen || newImagenes[0],
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const setPrincipal = (url) => {
    setForm((f) => ({ ...f, imagen: url }))
  }

  const removeImage = (url) => {
    setForm((f) => {
      const newImagenes = f.imagenes.filter((u) => u !== url)
      return {
        ...f,
        imagenes: newImagenes,
        imagen: f.imagen === url ? (newImagenes[0] || '') : f.imagen,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.nombre || !form.precio) {
      setError('Nombre y precio son requeridos')
      return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await adminProductosAPI.actualizar(id, form)
      } else {
        await adminProductosAPI.crear(form)
      }
      navigate('/admin/productos')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-ink-muted text-sm">Cargando...</div>

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/productos')} className="text-ink-muted hover:text-ink transition-colors">
          ← Volver
        </button>
        <h1 className="font-serif text-2xl">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        {/* Imágenes */}
        <div>
          <label className="label-tag text-ink-muted block mb-2">
            Imágenes <span className="text-ink-muted font-normal normal-case">(la primera es la principal)</span>
          </label>

          {/* Galería actual */}
          {form.imagenes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.imagenes.map((url, i) => (
                <div key={url} className="relative group">
                  <div
                    className={`w-20 h-20 overflow-hidden border-2 cursor-pointer transition-colors ${
                      form.imagen === url ? 'border-ink' : 'border-cream-darker hover:border-ink-muted'
                    }`}
                    onClick={() => setPrincipal(url)}
                    title="Clic para hacer principal"
                  >
                    <img src={url} alt={`imagen ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                  {form.imagen === url && (
                    <span className="absolute bottom-0 left-0 right-0 bg-ink text-cream text-[9px] text-center py-0.5">
                      Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Botón agregar más */}
              <label className="w-20 h-20 border-2 border-dashed border-cream-darker hover:border-ink-muted cursor-pointer flex flex-col items-center justify-center text-ink-muted hover:text-ink transition-colors">
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[9px] uppercase tracking-wide">Agregar</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          )}

          {/* Estado vacío */}
          {form.imagenes.length === 0 && (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-cream-darker hover:border-ink-muted cursor-pointer text-ink-muted hover:text-ink transition-colors">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">{uploading ? 'Subiendo...' : 'Subir imágenes'}</span>
              <span className="text-[10px] mt-1 text-ink-muted">Puedes seleccionar varias a la vez</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}

          {uploading && <p className="text-xs text-ink-muted mt-1">Subiendo imágenes...</p>}
        </div>

        {/* Nombre */}
        <div>
          <label className="label-tag text-ink-muted block mb-1">Nombre *</label>
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="input-field" required />
        </div>

        {/* Descripción */}
        <div>
          <label className="label-tag text-ink-muted block mb-1">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className="input-field resize-none" />
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-tag text-ink-muted block mb-1">Precio (S/) *</label>
            <input type="number" name="precio" value={form.precio} onChange={handleChange} min="0" step="0.5" className="input-field" required />
          </div>
          <div>
            <label className="label-tag text-ink-muted block mb-1">Stock</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" className="input-field" />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="label-tag text-ink-muted block mb-1">Color</label>
          <input type="text" name="color" value={form.color} onChange={handleChange} placeholder="Ej: Blanco / White" className="input-field" />
        </div>

        {/* Tallas */}
        <div>
          <label className="label-tag text-ink-muted block mb-2">Tallas disponibles</label>
          <div className="flex gap-2">
            {TALLAS_DEFAULT.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTalla(t)}
                className={`w-12 h-12 border text-sm font-medium transition-all ${
                  form.tallas.includes(t)
                    ? 'bg-ink text-cream border-ink'
                    : 'bg-transparent text-ink-muted border-cream-darker hover:border-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Activo */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="activo"
            name="activo"
            checked={form.activo}
            onChange={handleChange}
            className="accent-ink w-4 h-4"
          />
          <label htmlFor="activo" className="text-sm font-medium text-ink cursor-pointer">
            Producto visible en la tienda
          </label>
        </div>

        {error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-4">
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button type="button" onClick={() => navigate('/admin/productos')} className="btn-secondary px-8 py-4">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
