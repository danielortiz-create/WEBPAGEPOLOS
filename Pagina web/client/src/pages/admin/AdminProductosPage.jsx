import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminProductosAPI } from '../../services/api'

export default function AdminProductosPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const cargar = () => {
    adminProductosAPI.listar()
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"? Se ocultará del catálogo.`)) return
    setDeletingId(id)
    try {
      await adminProductosAPI.eliminar(id)
      cargar()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn-primary text-sm px-5 py-3">
          + Nuevo producto
        </Link>
      </div>

      {loading ? (
        <p className="text-ink-muted text-sm">Cargando...</p>
      ) : productos.length === 0 ? (
        <p className="text-ink-muted text-sm">No hay productos aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-cream border border-cream-darker">
            <thead>
              <tr className="border-b border-cream-darker">
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Imagen</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Nombre</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Precio</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Stock</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Estado</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-cream-darker hover:bg-cream-dark transition-colors">
                  <td className="px-4 py-3">
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-12 h-14 object-cover bg-cream-dark"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{p.categoria} · {p.color}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">S/ {p.precio.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? 'text-red-600 font-medium' : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.activo ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/productos/${p.id}`}
                        className="text-xs text-ink underline underline-offset-2 hover:text-ink-muted transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleEliminar(p.id, p.nombre)}
                        disabled={deletingId === p.id}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        {deletingId === p.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
