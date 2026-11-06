import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../api/axios.js'

function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    department: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side checks (the backend validates again)
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const { confirmPassword: _confirm, ...payload } = form
      await register(payload)
      // No navigate() here: PublicOnlyRoute sees a logged-in user with no
      // skills and sends them to /profile?welcome=1 to set up their skills.
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card auth-card-wide" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="muted">Join students trading skills at your university.</p>

        <div className="form-grid">
          <label className="field">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>University</span>
            <input
              name="university"
              value={form.university}
              onChange={handleChange}
              placeholder="e.g. FAST-NUCES Lahore"
              required
            />
          </label>
          <label className="field">
            <span>Department (optional)</span>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Data Science"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="muted small center">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
