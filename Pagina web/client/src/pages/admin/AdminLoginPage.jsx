import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLoginPage() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.usuario, form.password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="font-serif text-3xl font-bold tracking-widest text-ink">RIVT</span>
          <p className="label-tag text-ink-muted mt-2">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label-tag text-ink-muted block mb-1">Usuario</label>
            <input
              type="text"
              value={form.usuario}
              onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
              className="input-field"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="label-tag text-ink-muted block mb-1">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-8">
          ← <a href="/" className="hover:text-ink underline underline-offset-2">Volver a la tienda</a>
        </p>
      </div>
    </div>
  )
}
