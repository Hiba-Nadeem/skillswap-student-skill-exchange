import axios from 'axios'

// One shared axios instance for the whole app.
// "/api" is forwarded to http://localhost:5000 by the Vite proxy (vite.config.js).
const api = axios.create({
  baseURL: '/api',
})

// Attach the JWT to every request if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Turns any axios error into a readable message for the UI
export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  (error?.request ? 'Cannot reach the server. Is the backend running?' : error?.message) ||
  'Something went wrong'

export default api
