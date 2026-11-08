import { useState } from 'react'
import api, { getErrorMessage } from '../api/axios.js'
import StarRating from './StarRating.jsx'

// Shown under a completed session on the Requests page
function ReviewForm({ requestId, revieweeName, onDone, onCancel }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please choose a star rating')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/reviews', { requestId, rating, comment })
      onDone()
    } catch (err) {
      setError(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <p className="label">Rate your session with {revieweeName}</p>
      <StarRating value={rating} onChange={setRating} size="lg" />
      <textarea
        rows="3"
        placeholder="What was it like learning together? (optional)"
        value={comment}
        maxLength={500}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <div className="row gap-sm">
        <button className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit review'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ReviewForm
