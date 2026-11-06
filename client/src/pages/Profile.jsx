import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'
import SkillChips from '../components/SkillChips.jsx'
import SkillPicker from '../components/SkillPicker.jsx'
import Loader from '../components/Loader.jsx'
import { formatDate } from '../utils/format.js'

// Converts the logged-in user into editable form values
const toForm = (user) => ({
  name: user.name,
  university: user.university,
  department: user.department || '',
  bio: user.bio || '',
  skillsToTeach: user.skillsToTeach.map((s) => s._id),
  skillsToLearn: user.skillsToLearn.map((s) => s._id),
})

function Profile() {
  const { user, setUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'

  const [skills, setSkills] = useState([])
  const [editing, setEditing] = useState(isWelcome) // new users start in edit mode
  const [form, setForm] = useState(() => toForm(user))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/skills')
      .then((res) => setSkills(res.data))
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const startEditing = () => {
    setForm(toForm(user))
    setSuccess('')
    setError('')
    setEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await api.put('/users/profile', form)
      setUser(res.data) // update the user everywhere in the app
      setEditing(false)
      if (isWelcome) setSearchParams({}, { replace: true }) // drop ?welcome=1 from the URL
      setSuccess('Profile saved.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (editing && skills.length === 0 && !error) return <Loader text="Loading skills..." />

  return (
    <div className="container page narrow">
      {isWelcome && editing && (
        <div className="notice">
          <strong>Welcome to SkillSwap!</strong> Pick the skills you can teach and want to learn
          so we can match you with other students.
        </div>
      )}

      {!editing ? (
        <>
          <section className="card profile-hero">
            <Avatar name={user.name} size="lg" />
            <div className="grow">
              <h1>{user.name}</h1>
              <p className="muted">
                {user.university}
                {user.department ? ` · ${user.department}` : ''}
              </p>
              <p className="muted small">
                {user.email} · Member since {formatDate(user.createdAt)}
              </p>
            </div>
            <button className="btn btn-outline" onClick={startEditing}>
              Edit profile
            </button>
          </section>

          {success && <p className="success">{success}</p>}

          <section className="card panel">
            <h2>About</h2>
            <p>{user.bio || <span className="muted">You have not written a bio yet.</span>}</p>
          </section>

          <div className="grid grid-2">
            <section className="card panel">
              <h2>I can teach</h2>
              <SkillChips skills={user.skillsToTeach} variant="teach" emptyText="No skills added yet" />
            </section>
            <section className="card panel">
              <h2>I want to learn</h2>
              <SkillChips skills={user.skillsToLearn} variant="learn" emptyText="No skills added yet" />
            </section>
          </div>
        </>
      ) : (
        <form className="card panel" onSubmit={handleSave}>
          <h1>Edit profile</h1>

          <div className="form-grid">
            <label className="field">
              <span>Full name</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>University</span>
              <input name="university" value={form.university} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Department</span>
              <input name="department" value={form.department} onChange={handleChange} />
            </label>
          </div>

          <label className="field">
            <span>Bio ({form.bio.length}/500)</span>
            <textarea
              name="bio"
              rows="3"
              maxLength={500}
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell other students about yourself and how you like to learn."
            />
          </label>

          <div className="picker-section">
            <h2>Skills I can teach</h2>
            <p className="muted small">Selected: {form.skillsToTeach.length}</p>
            <SkillPicker
              skills={skills}
              selected={form.skillsToTeach}
              disabledIds={form.skillsToLearn}
              onChange={(ids) => setForm({ ...form, skillsToTeach: ids })}
              variant="teach"
            />
          </div>

          <div className="picker-section">
            <h2>Skills I want to learn</h2>
            <p className="muted small">Selected: {form.skillsToLearn.length}</p>
            <SkillPicker
              skills={skills}
              selected={form.skillsToLearn}
              disabledIds={form.skillsToTeach}
              onChange={(ids) => setForm({ ...form, skillsToLearn: ids })}
              variant="learn"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="row gap-sm">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Profile
