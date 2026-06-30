import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminProductosAPI, adminPedidosAPI } from '../../services/api'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ productos: 0, pedidos: 0, pendientes: 0, total: 0 })
  const [pedidosRecientes, setPedidosRecientes] = useState([])

  useEffect(() => {
    Promise.all([
      adminProductosAPI.listar(),
      adminPedidosAPI.listar(),
    ]).then(([productos, pedidos]) => {
      setStats({
        productos: productos.length,
        pedidos: pedidos.length,
        pendientes: pedidos.filter((p) => p.estado === 'pendiente').length,
        total: pedidos.reduce((acc, p) => acc + p.total, 0),
      })
      setPedidosRecientes(pedidos.slice(0, 5))
    }).catch(console.error)
  }, [])

  const ESTADO_BADGE = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    pagado: 'bg-green-100 text-green-800',
    enviado: 'bg-blue-100 text-blue-800',
    cancelado: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-serif text-2xl mb-6">Panel de control</h1>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Productos activos', value: stats.productos, color: 'text-ink' },
          { label: 'Pedidos totales', value: stats.pedidos, color: 'text-ink' },
          { label: 'Pendientes de envío', value: stats.pendientes, color: 'text-yellow-600' },
          { label: 'Ingresos totales', value: `S/ ${stats.total.toFixed(2)}`, color: 'text-green-700' },
        ].map((s) => (
          <div key={s.label} className="bg-cream p-5 border border-cream-darker">
            <p className="label-tag text-ink-muted mb-1">{s.label}</p>
            <p className={`font-serif text-2xl font-medium ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Link to="/admin/productos/nuevo" className="btn-primary text-sm px-5 py-3">
          + Nuevo producto
        </Link>
        <Link to="/admin/pedidos" className="btn-secondary text-sm px-5 py-3">
          Ver pedidos
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm px-5 py-3">
          Ver tienda →
        </a>
      </div>

      {/* Pedidos recientes */}
      <div>
        <h2 className="font-serif text-xl mb-4">Pedidos recientes</h2>
        {pedidosRecientes.length === 0 ? (
          <p className="text-ink-muted text-sm">No hay pedidos aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-cream border border-cream-darker">
              <thead>
                <tr className="border-b border-cream-darker">
                  <th className="label-tag text-left px-4 py-3 text-ink-muted">ID</th>
                  <th className="label-tag text-left px-4 py-3 text-ink-muted">Cliente</th>
                  <th className="label-tag text-left px-4 py-3 text-ink-muted">Total</th>
                  <th className="label-tag text-left px-4 py-3 text-ink-muted">Estado</th>
                  <th className="label-tag text-left px-4 py-3 text-ink-muted">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecientes.map((p) => (
                  <tr key={p.id} className="border-b border-cream-darker hover:bg-cream-dark transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{p.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">{p.cliente?.nombre} {p.cliente?.apellido}</td>
                    <td className="px-4 py-3 font-medium">S/ {p.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${ESTADO_BADGE[p.estado] || ''}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-xs">
                      {new Date(p.creado_en).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
