import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import StudentCard from '../components/StudentCard.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Explore() {
  const { user } = useAuth()
  const [skills, setSkills] = useState([])
  const [skillId, setSkillId] = useState('') // filter: skill they can teach
  const [query, setQuery] = useState('') // what's typed in the box
  const [search, setSearch] = useState('') // what we actually search for
  const [students, setStudents] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/skills').then((res) => setSkills(res.data)).catch(() => {})
  }, [])

  // Re-run the search whenever the filter or submitted text changes
  useEffect(() => {
    const params = {}
    if (skillId) params.skill = skillId
    if (search) params.q = search
    api
      .get('/users', { params })
      .then((res) => {
        setStudents(res.data)
        setError('')
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [skillId, search])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearch(query.trim())
  }

  const clearFilters = () => {
    setQuery('')
    setSearch('')
    setSkillId('')
  }

  const myLearnIds = user.skillsToLearn.map((s) => s._id)

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Explore students</h1>
          <p className="muted">Search by name or university, or filter by a skill they can teach.</p>
        </div>
      </div>

      <form className="card filters" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Search by name, university or department"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
          <option value="">Any skill they teach</option>
          {skills.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary">Search</button>
        {(search || skillId) && (
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>
            Clear
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      {students === null ? (
        <Loader text="Finding students..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          text="Try another skill or clear your filters."
        />
      ) : (
        <>
          <p className="muted small">
            {students.length} student{students.length === 1 ? '' : 's'} found
            {myLearnIds.length > 0 && ' · highlighted skills are ones you want to learn'}
          </p>
          <div className="grid grid-3">
            {students.map((s) => (
              <StudentCard key={s._id} student={s} highlightIds={myLearnIds} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Explore
