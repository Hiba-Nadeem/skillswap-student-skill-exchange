import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios.js'
import Avatar from '../components/Avatar.jsx'
import StarRating from '../components/StarRating.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatDate } from '../utils/format.js'

function Reviews() {
  const [data, setData] = useState(null) // { reviews, average, count }
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/reviews/me')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  if (error) return <div className="container page"><p className="error">{error}</p></div>
  if (!data) return <Loader text="Loading reviews..." />

  // How many reviews gave each star value (5 down to 1)
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data.reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="container page narrow">
      <div className="page-head">
        <div>
          <h1>My reviews</h1>
          <p className="muted">What other students said after completed sessions with you.</p>
        </div>
      </div>

      {data.count === 0 ? (
        <EmptyState
          title="No reviews yet"
          text="Complete a skill exchange session and your partner can rate you."
          actionLabel="View requests"
          actionTo="/requests"
        />
      ) : (
        <>
          <section className="card rating-summary">
            <div className="rating-big">
              <span className="rating-number">{data.average}</span>
              <StarRating value={data.average} />
              <p className="muted small">{data.count} review{data.count > 1 ? 's' : ''}</p>
            </div>
            <div className="bars">
              {breakdown.map((b) => (
                <div key={b.star} className="bar-row">
                  <span className="small">{b.star} ★</span>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${(b.count / data.count) * 100}%` }} />
                  </div>
                  <span className="muted small">{b.count}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="stack">
            {data.reviews.map((r) => (
              <article key={r._id} className="card review-card">
                <header className="request-top">
                  <Avatar name={r.reviewer.name} />
                  <div className="grow">
                    <Link to={`/students/${r.reviewer._id}`} className="strong">{r.reviewer.name}</Link>
                    <p className="muted small">{r.reviewer.university} · {formatDate(r.createdAt)}</p>
                  </div>
                  <StarRating value={r.rating} />
                </header>
                {r.request?.skillWanted && (
                  <p className="muted small">
                    Session: {r.request.skillWanted.name} ⇄ {r.request.skillOffered.name}
                  </p>
                )}
                <p>{r.comment || <span className="muted">No written feedback.</span>}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Reviews
