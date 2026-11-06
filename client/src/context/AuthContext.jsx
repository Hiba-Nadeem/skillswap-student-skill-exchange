import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'

// AuthContext makes the logged-in user available to every component
// without passing props down through every level.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // true only while we check a saved token with the backend
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  // On first load: if a token is saved, ask the backend who it belongs to
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token')) // expired or invalid token
      .finally(() => setLoading(false))
  }, [])

  const saveSession = ({ token, user }) => {
    localStorage.setItem('token', token)
    setUser(user)
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data)
    return res.data.user
  }

  const register = async (form) => {
    const res = await api.post('/auth/register', form)
    saveSession(res.data)
    return res.data.user
  }

  // Remove the token and reload the app at the home page.
  // A full reload also clears any data from the previous user held in memory.
  const logout = () => {
    localStorage.removeItem('token')
    window.location.assign('/')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook: const { user, login } = useAuth()
export const useAuth = () => useContext(AuthContext)
