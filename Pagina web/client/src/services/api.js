const BASE = '/api'

function authHeaders() {
  const token = localStorage.getItem('rivt_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud')
  return data
}

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login: (usuario, password) => request('POST', '/auth/login', { usuario, password }),
  me: () => request('GET', '/auth/me'),
}

// ── Productos (públicos) ──────────────────────────────────────
export const productosAPI = {
  listar: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request('GET', `/productos${qs ? '?' + qs : ''}`)
  },
  obtener: (id) => request('GET', `/productos/${id}`),
}

// ── Productos (admin) ─────────────────────────────────────────
export const adminProductosAPI = {
  listar: () => request('GET', '/productos/admin/all'),
  crear: (data) => request('POST', '/productos', data),
  actualizar: (id, data) => request('PUT', `/productos/${id}`, data),
  eliminar: (id) => request('DELETE', `/productos/${id}`),
}

// ── Pedidos ───────────────────────────────────────────────────
export const pedidosAPI = {
  crear: (data) => request('POST', '/pedidos', data),
}

export const adminPedidosAPI = {
  listar: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request('GET', `/pedidos${qs ? '?' + qs : ''}`)
  },
  obtener: (id) => request('GET', `/pedidos/${id}`),
  cambiarEstado: (id, estado) => request('PATCH', `/pedidos/${id}/estado`, { estado }),
}

// ── Upload ────────────────────────────────────────────────────
export async function uploadImagen(file) {
  const formData = new FormData()
  formData.append('imagen', file)
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al subir imagen')
  return data
}

// ── Pagos (MercadoPago) ───────────────────────────────────────
export const pagosAPI = {
  config: () => request('GET', '/pagos/mp/config'),
  procesar: (data) => request('POST', '/pagos/mp/procesar', data),
}

// ── Build (polos personalizados con IA) ───────────────────────
export const buildAPI = {
  estado: () => request('GET', '/build/estado'),
  generar: (data) => request('POST', '/build/generar', data), // {prompt, color, tamano}
}
