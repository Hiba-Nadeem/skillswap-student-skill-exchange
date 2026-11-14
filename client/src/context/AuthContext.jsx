import { createContext, useContext, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../api/axios.js'

// AuthContext makes the logged-in user available to every component
// without passing props down through every level.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [sessionError, setSessionError] = useState('')
  const [attempt, setAttempt] = useState(0)
  // true only while we check a saved token with the backend
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  // On first load: if a token is saved, ask the backend who it belongs to
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    const controller = new AbortController()
    api
      .get('/auth/me', { signal: controller.signal })
      .then((res) => setUser(res.data))
      .catch((error) => {
        if (controller.signal.aborted) return
        if (error.response?.status === 401) localStorage.removeItem('token')
        else setSessionError(getErrorMessage(error))
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])

  const saveSession = ({ token, user }) => {
    localStorage.setItem('token', token)
    setUser(user)
    setSessionError('')
  }

  const retrySession = () => {
    setLoading(true)
    setSessionError('')
    setAttempt((value) => value + 1)
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
    <AuthContext.Provider value={{ user, setUser, loading, sessionError, retrySession, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook: const { user, login } = useAuth()
export const useAuth = () => useContext(AuthContext)
