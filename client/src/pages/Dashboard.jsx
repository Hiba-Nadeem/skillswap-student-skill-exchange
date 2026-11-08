import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'
import Avatar from '../components/Avatar.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import StarRating from '../components/StarRating.jsx'
import { formatTime } from '../utils/format.js'

function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  // Load everything the dashboard needs in parallel
  useEffect(() => {
    Promise.all([
      api.get('/matches'),
      api.get('/requests'),
      api.get('/messages/conversations'),
      api.get('/reviews/me'),
    ])
      .then(([matches, requests, conversations, reviews]) =>
        setData({
          matches: matches.data.matches,
          requests: requests.data,
          conversations: conversations.data,
          reviews: reviews.data,
        })
      )
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  if (error) return <div className="container page"><p className="error">{error}</p></div>
  if (!data) return <Loader text="Loading your dashboard..." />

  const pendingReceived = data.requests.received.filter((r) => r.status === 'pending')
  const recentRequests = [...data.requests.received, ...data.requests.sent]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4)
  const recentMessages = data.conversations.filter((c) => c.lastMessage).slice(0, 4)
  const needsSkills = user.skillsToTeach.length === 0 || user.skillsToLearn.length === 0

  const stats = [
    { label: 'Mutual matches', value: data.matches.length, to: '/matches' },
    { label: 'Pending requests', value: pendingReceived.length, to: '/requests' },
    { label: 'Conversations', value: data.conversations.length, to: '/messages' },
    {
      label: 'Average rating',
      value: data.reviews.count ? `${data.reviews.average} ★` : '–',
      to: '/reviews',
    },
  ]

  // Works out who the "other" student is in a request
  const otherPerson = (r) => (r.sender._id === user._id ? r.receiver : r.sender)

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">Here is what is happening with your skill swaps.</p>
        </div>
        <Link to="/explore" className="btn btn-primary">
          Find students
        </Link>
      </div>

      {needsSkills && (
        <div className="notice">
          <strong>Finish your profile.</strong> Add at least one skill you can teach and one you
          want to learn so we can find matches for you.{' '}
          <Link to="/profile">Add skills →</Link>
        </div>
      )}

      <div className="grid grid-4 stats">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card stat">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-2">
        <section className="card panel">
          <div className="panel-head">
            <h2>Top matches</h2>
            <Link to="/matches" className="small">See all</Link>
          </div>
          {data.matches.length === 0 ? (
            <p className="muted small">No mutual matches yet.</p>
          ) : (
            <ul className="list">
              {data.matches.slice(0, 4).map((m) => (
                <li key={m.user._id} className="list-item">
                  <Avatar name={m.user.name} size="sm" />
                  <div className="grow">
                    <Link to={`/students/${m.user._id}`} className="strong">{m.user.name}</Link>
                    <p className="muted small">
                      Teaches you {m.theyCanTeachMe.map((s) => s.name).join(', ')}
                    </p>
                  </div>
                  <span className="score">{m.score}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card panel">
          <div className="panel-head">
            <h2>Recent requests</h2>
            <Link to="/requests" className="small">See all</Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="muted small">No requests yet.</p>
          ) : (
            <ul className="list">
              {recentRequests.map((r) => (
                <li key={r._id} className="list-item">
                  <Avatar name={otherPerson(r).name} size="sm" />
                  <div className="grow">
                    <span className="strong">{otherPerson(r).name}</span>
                    <p className="muted small">
                      {r.sender._id === user._id ? 'You sent' : 'You received'} ·{' '}
                      {r.skillWanted.name} ⇄ {r.skillOffered.name}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card panel">
          <div className="panel-head">
            <h2>Recent messages</h2>
            <Link to="/messages" className="small">Open inbox</Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="muted small">No messages yet.</p>
          ) : (
            <ul className="list">
              {recentMessages.map((c) => (
                <li key={c.user._id} className="list-item">
                  <Avatar name={c.user.name} size="sm" />
                  <div className="grow">
                    <Link to={`/messages/${c.user._id}`} className="strong">{c.user.name}</Link>
                    <p className="muted small truncate">
                      {c.lastMessage.sender === user._id ? 'You: ' : ''}
                      {c.lastMessage.text}
                    </p>
                  </div>
                  <span className="muted tiny">{formatTime(c.lastMessage.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card panel">
          <div className="panel-head">
            <h2>Latest reviews</h2>
            <Link to="/reviews" className="small">See all</Link>
          </div>
          {data.reviews.reviews.length === 0 ? (
            <p className="muted small">No reviews yet. Complete a session to get rated.</p>
          ) : (
            <ul className="list">
              {data.reviews.reviews.slice(0, 3).map((r) => (
                <li key={r._id} className="list-item">
                  <Avatar name={r.reviewer.name} size="sm" />
                  <div className="grow">
                    <span className="strong">{r.reviewer.name}</span>
                    <p className="muted small truncate">{r.comment || 'No comment'}</p>
                  </div>
                  <StarRating value={r.rating} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
