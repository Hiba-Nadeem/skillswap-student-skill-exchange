import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="container page">
      <div className="empty">
        <h3>Page not found</h3>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
