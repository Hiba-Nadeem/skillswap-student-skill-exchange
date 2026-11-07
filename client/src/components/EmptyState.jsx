import { Link } from 'react-router-dom'

// Friendly placeholder shown when a list has no items
function EmptyState({ title, text, actionLabel, actionTo }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export default EmptyState
