import { useEffect, useState } from 'react'
import { adminPedidosAPI } from '../../services/api'

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'cancelado']

const BADGE = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado: 'bg-green-100 text-green-800',
  enviado: 'bg-blue-100 text-blue-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [updating, setUpdating] = useState(null)

  const cargar = (estado = '') => {
    setLoading(true)
    adminPedidosAPI.listar(estado ? { estado } : {})
      .then(setPedidos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const handleFiltro = (estado) => {
    setFiltro(estado)
    cargar(estado)
  }

  const handleEstado = async (id, estado) => {
    setUpdating(id)
    try {
      await adminPedidosAPI.cambiarEstado(id, estado)
      cargar(filtro)
      if (detalle?.id === id) setDetalle((d) => ({ ...d, estado }))
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-serif text-2xl mb-6">Pedidos</h1>

      {/* Filtros por estado */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => handleFiltro('')}
          className={`text-xs font-medium tracking-widest uppercase px-4 py-2 border transition-colors ${
            !filtro ? 'bg-ink text-cream border-ink' : 'border-cream-darker text-ink-muted hover:border-ink hover:text-ink'
          }`}
        >
          Todos
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => handleFiltro(e)}
            className={`text-xs font-medium tracking-widest uppercase px-4 py-2 border transition-colors ${
              filtro === e ? 'bg-ink text-cream border-ink' : 'border-cream-darker text-ink-muted hover:border-ink hover:text-ink'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-muted text-sm">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <p className="text-ink-muted text-sm">No hay pedidos{filtro ? ` con estado "${filtro}"` : ''}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-cream border border-cream-darker">
            <thead>
              <tr className="border-b border-cream-darker">
                <th className="label-tag text-left px-4 py-3 text-ink-muted">ID</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Cliente</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Total</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Pago</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Estado</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Fecha</th>
                <th className="label-tag text-left px-4 py-3 text-ink-muted">Cambiar estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-b border-cream-darker hover:bg-cream-dark transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetalle(p)}
                      className="font-mono text-xs text-ink-muted hover:text-ink underline underline-offset-2"
                    >
                      {p.id.slice(0, 8)}…
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.cliente?.nombre} {p.cliente?.apellido}</p>
                    <p className="text-xs text-ink-muted">{p.cliente?.telefono}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">S/ {p.total.toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize text-ink-muted text-xs">{p.metodo_pago}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE[p.estado] || ''}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs">
                    {new Date(p.creado_en).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.estado}
                      disabled={updating === p.id}
                      onChange={(e) => handleEstado(p.id, e.target.value)}
                      className="text-xs border border-cream-darker bg-cream px-2 py-1 focus:outline-none focus:border-ink disabled:opacity-50"
                    >
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setDetalle(null)}>
          <div className="bg-cream max-w-lg w-full p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-serif text-xl">Detalle del pedido</h2>
              <button onClick={() => setDetalle(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="label-tag text-ink-muted mb-1">Cliente</p>
                <p>{detalle.cliente?.nombre} {detalle.cliente?.apellido}</p>
                <p className="text-ink-muted">{detalle.cliente?.email} · {detalle.cliente?.telefono}</p>
              </div>
              <div>
                <p className="label-tag text-ink-muted mb-1">Dirección</p>
                <p>{detalle.direccion?.direccion}, {detalle.direccion?.distrito}, {detalle.direccion?.ciudad}</p>
              </div>
              <div>
                <p className="label-tag text-ink-muted mb-2">Productos</p>
                <ul className="space-y-1">
                  {detalle.items?.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{item.nombre} · Talla {item.talla} x{item.cantidad}</span>
                      <span className="font-medium">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-cream-darker">
                <span>Total</span>
                <span>S/ {detalle.total.toFixed(2)}</span>
              </div>
              <div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${BADGE[detalle.estado] || ''}`}>
                  {detalle.estado}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
