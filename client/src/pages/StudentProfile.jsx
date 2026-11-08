import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'
import SkillChips from '../components/SkillChips.jsx'
import StarRating from '../components/StarRating.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Loader from '../components/Loader.jsx'
import { formatDate } from '../utils/format.js'

// Puts preferred skills first in a list (used to pre-select the best option)
const preferFirst = (list, preferredIds) => {
  const preferred = new Set(preferredIds)
  return [...list].sort((a, b) => preferred.has(b._id) - preferred.has(a._id))
}

function StudentProfile() {
  const { id } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null) // { user, reviews, rating }
  const [existing, setExisting] = useState(null) // latest request between us
  const [error, setError] = useState('')

  const [form, setForm] = useState({ skillWanted: '', skillOffered: '', message: '' })
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [sent, setSent] = useState(false)

  const load = useCallback(async () => {
    try {
      const [profileRes, requestsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get('/requests'),
      ])
      setProfile(profileRes.data)

      // Find the most recent request between me and this student
      const all = [...requestsRes.data.sent, ...requestsRes.data.received]
        .filter((r) => r.sender._id === id || r.receiver._id === id)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      setExisting(all[0] || null)

      // Pre-select the most relevant skills in the request form
      const them = profileRes.data.user
      const wanted = preferFirst(them.skillsToTeach, user.skillsToLearn.map((s) => s._id))
      const offered = preferFirst(user.skillsToTeach, them.skillsToLearn.map((s) => s._id))
      setForm((f) => ({
        ...f,
        skillWanted: wanted[0]?._id || '',
        skillOffered: offered[0]?._id || '',
      }))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [id, user])

  useEffect(() => {
    load()
  }, [load])

  // Viewing your own id? Show your own profile page instead
  if (id === user._id) return <Navigate to="/profile" replace />
  if (error) return <div className="container page"><p className="error">{error}</p></div>
  if (!profile) return <Loader text="Loading profile..." />

  const student = profile.user
  const myLearnIds = user.skillsToLearn.map((s) => s._id)
  const myTeachIds = user.skillsToTeach.map((s) => s._id)
  const hasOpenRequest = existing && ['pending', 'accepted'].includes(existing.status)
  const canMessage = existing && ['accepted', 'completed'].includes(existing.status)

  const handleSend = async (e) => {
    e.preventDefault()
    setFormError('')
    setSending(true)
    try {
      await api.post('/requests', { receiverId: student._id, ...form })
      setSent(true)
      await load()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container page">
      <Link to="/explore" className="back-link">← Back to explore</Link>

      <div className="profile-layout">
        <div className="profile-main">
          <section className="card profile-hero">
            <Avatar name={student.name} size="lg" />
            <div className="grow">
              <h1>{student.name}</h1>
              <p className="muted">
                {student.university}
                {student.department ? ` · ${student.department}` : ''}
              </p>
              <div className="row gap-sm">
                <StarRating value={profile.rating.average} size="sm" />
                <span className="muted small">
                  {profile.rating.count
                    ? `${profile.rating.average} from ${profile.rating.count} review${profile.rating.count > 1 ? 's' : ''}`
                    : 'No reviews yet'}
                </span>
              </div>
            </div>
            {canMessage && (
              <Link to={`/messages/${student._id}`} className="btn btn-outline">
                Message
              </Link>
            )}
          </section>

          <section className="card panel">
            <h2>About</h2>
            <p>{student.bio || <span className="muted">No bio yet.</span>}</p>
          </section>

          <div className="grid grid-2">
            <section className="card panel">
              <h2>Can teach</h2>
              <SkillChips skills={student.skillsToTeach} variant="teach" highlightIds={myLearnIds} />
              {myLearnIds.length > 0 && <p className="muted tiny">Highlighted: skills you want to learn</p>}
            </section>
            <section className="card panel">
              <h2>Wants to learn</h2>
              <SkillChips skills={student.skillsToLearn} variant="learn" highlightIds={myTeachIds} />
              {myTeachIds.length > 0 && <p className="muted tiny">Highlighted: skills you can teach</p>}
            </section>
          </div>

          <section className="card panel">
            <h2>Reviews</h2>
            {profile.reviews.length === 0 ? (
              <p className="muted small">No reviews yet.</p>
            ) : (
              <ul className="list">
                {profile.reviews.map((r) => (
                  <li key={r._id} className="list-item align-start">
                    <Avatar name={r.reviewer.name} size="sm" />
                    <div className="grow">
                      <div className="row gap-sm">
                        <span className="strong">{r.reviewer.name}</span>
                        <StarRating value={r.rating} size="sm" />
                      </div>
                      <p className="small">{r.comment || <span className="muted">No comment</span>}</p>
                      <p className="muted tiny">{formatDate(r.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column: request panel */}
        <aside className="card panel request-panel">
          <h2>Skill exchange</h2>

          {hasOpenRequest ? (
            <div className="stack">
              {sent && <p className="success">Request sent!</p>}
              <p className="small">
                You have a request with {student.name.split(' ')[0]}:
              </p>
              <p className="small">
                <strong>{existing.skillWanted.name}</strong> ⇄ <strong>{existing.skillOffered.name}</strong>
              </p>
              <StatusBadge status={existing.status} />
              <Link to="/requests" className="btn btn-outline btn-block">
                Manage requests
              </Link>
            </div>
          ) : student.skillsToTeach.length === 0 ? (
            <p className="muted small">This student has not listed any skills to teach yet.</p>
          ) : user.skillsToTeach.length === 0 ? (
            <p className="muted small">
              Add a skill you can teach to your <Link to="/profile">profile</Link> before sending a
              request. Every swap is two-way.
            </p>
          ) : (
            <form className="stack" onSubmit={handleSend}>
              {existing && (
                <p className="muted tiny">
                  Your last request was {existing.status}. You can send a new one.
                </p>
              )}
              <label className="field">
                <span>I want to learn</span>
                <select
                  value={form.skillWanted}
                  onChange={(e) => setForm({ ...form, skillWanted: e.target.value })}
                >
                  {student.skillsToTeach.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>In return I will teach</span>
                <select
                  value={form.skillOffered}
                  onChange={(e) => setForm({ ...form, skillOffered: e.target.value })}
                >
                  {user.skillsToTeach.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Message (optional)</span>
                <textarea
                  rows="3"
                  maxLength={500}
                  placeholder="Introduce yourself and suggest a time"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </label>
              {formError && <p className="error">{formError}</p>}
              <button className="btn btn-primary btn-block" disabled={sending}>
                {sending ? 'Sending...' : 'Send request'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}

export default StudentProfile
