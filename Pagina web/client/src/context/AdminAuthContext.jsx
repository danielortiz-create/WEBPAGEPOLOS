import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rivt_admin_token')
    if (token) {
      authAPI.me()
        .then((data) => setAdmin(data))
        .catch(() => localStorage.removeItem('rivt_admin_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (usuario, password) => {
    const data = await authAPI.login(usuario, password)
    localStorage.setItem('rivt_admin_token', data.token)
    setAdmin({ usuario: data.usuario })
    return data
  }

  const logout = () => {
    localStorage.removeItem('rivt_admin_token')
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider')
  return ctx
}
