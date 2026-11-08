import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from './Avatar.jsx'

const APP_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/explore', label: 'Explore' },
  { to: '/matches', label: 'Matches' },
  { to: '/requests', label: 'Requests' },
  { to: '/messages', label: 'Messages' },
  { to: '/reviews', label: 'Reviews' },
]

function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false) // mobile menu

  const close = () => setOpen(false)

  const handleLogout = () => {
    close()
    logout()
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to={user ? '/dashboard' : '/'} className="logo" onClick={close}>
          <span className="logo-mark">⇄</span> SkillSwap
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {user ? (
            <>
              {APP_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={close} className="nav-link">
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/profile" onClick={close} className="nav-link nav-profile">
                <Avatar name={user.name} size="sm" />
                <span>My Profile</span>
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close} className="nav-link">
                Log in
              </NavLink>
              <Link to="/register" onClick={close} className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
