import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import ReviewForm from '../components/ReviewForm.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatDate } from '../utils/format.js'

const STATUSES = ['all', 'pending', 'accepted', 'completed', 'rejected']

function Requests() {
  const { user } = useAuth()
  const [data, setData] = useState(null) // { sent, received }
  const [tab, setTab] = useState('received')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reviewingId, setReviewingId] = useState(null) // request currently being reviewed
  const [busyId, setBusyId] = useState(null) // request whose button is loading
  const [error, setError] = useState('')

  const load = () =>
    api
      .get('/requests')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id, status) => {
    setBusyId(id)
    setError('')
    try {
      await api.patch(`/requests/${id}/status`, { status })
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  if (!data) return error ? <div className="container page"><p className="error">{error}</p></div> : <Loader />

  const list = data[tab].filter((r) => statusFilter === 'all' || r.status === statusFilter)
  const pendingCount = data.received.filter((r) => r.status === 'pending').length

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Requests</h1>
          <p className="muted">Track every skill exchange from request to completed session.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'received'}
            className={tab === 'received' ? 'tab active' : 'tab'}
            onClick={() => setTab('received')}
          >
            Received {pendingCount > 0 && <span className="count">{pendingCount}</span>}
          </button>
          <button
            role="tab"
            aria-selected={tab === 'sent'}
            className={tab === 'sent' ? 'tab active' : 'tab'}
            onClick={() => setTab('sent')}
          >
            Sent
          </button>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {list.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter + ' '}${tab} requests`}
          text={tab === 'sent' ? 'Find a match and send your first request.' : 'When someone sends you a request it will appear here.'}
          actionLabel={tab === 'sent' ? 'See matches' : undefined}
          actionTo={tab === 'sent' ? '/matches' : undefined}
        />
      ) : (
        <div className="stack">
          {list.map((r) => {
            const isReceiver = r.receiver._id === user._id
            const other = isReceiver ? r.sender : r.receiver
            // From MY point of view: what I learn and what I teach
            const iLearn = isReceiver ? r.skillOffered : r.skillWanted
            const iTeach = isReceiver ? r.skillWanted : r.skillOffered
            const busy = busyId === r._id

            return (
              <article key={r._id} className="card request-card">
                <div className="request-top">
                  <Avatar name={other.name} />
                  <div className="grow">
                    <Link to={`/students/${other._id}`} className="strong">{other.name}</Link>
                    <p className="muted small">{other.university} · {formatDate(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="exchange">
                  <span>You learn <strong>{iLearn.name}</strong></span>
                  <span className="exchange-arrow">⇄</span>
                  <span>You teach <strong>{iTeach.name}</strong></span>
                </div>

                {r.message && <p className="request-message">“{r.message}”</p>}

                <div className="row gap-sm wrap">
                  {r.status === 'pending' && isReceiver && (
                    <>
                      <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => updateStatus(r._id, 'accepted')}>
                        Accept
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => updateStatus(r._id, 'rejected')}>
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === 'pending' && !isReceiver && (
                    <span className="muted small">Waiting for {other.name.split(' ')[0]} to respond</span>
                  )}
                  {r.status === 'accepted' && (
                    <>
                      <Link to={`/messages/${other._id}`} className="btn btn-outline btn-sm">
                        Message
                      </Link>
                      <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => updateStatus(r._id, 'completed')}>
                        Mark session completed
                      </button>
                    </>
                  )}
                  {r.status === 'completed' && (
                    <>
                      <Link to={`/messages/${other._id}`} className="btn btn-outline btn-sm">
                        Message
                      </Link>
                      {r.reviewedByMe ? (
                        <span className="muted small">✓ You reviewed this session</span>
                      ) : (
                        reviewingId !== r._id && (
                          <button className="btn btn-primary btn-sm" onClick={() => setReviewingId(r._id)}>
                            Leave a review
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>

                {reviewingId === r._id && (
                  <ReviewForm
                    requestId={r._id}
                    revieweeName={other.name}
                    onCancel={() => setReviewingId(null)}
                    onDone={() => {
                      setReviewingId(null)
                      load()
                    }}
                  />
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Requests
