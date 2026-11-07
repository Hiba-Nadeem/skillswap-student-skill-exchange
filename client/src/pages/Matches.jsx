import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios.js'
import Avatar from '../components/Avatar.jsx'
import SkillChips from '../components/SkillChips.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Matches() {
  const [data, setData] = useState(null) // { matches, needsSkills }
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/matches')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  if (error) return <div className="container page"><p className="error">{error}</p></div>
  if (!data) return <Loader text="Finding your matches..." />

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>My matches</h1>
          <p className="muted">
            Students who can teach you something <em>and</em> want to learn something you know,
            ranked by match score.
          </p>
        </div>
      </div>

      <div className="card formula">
        <span className="label">Match score</span>
        <code>M(A,B) = |TeachA ∩ LearnB| + |TeachB ∩ LearnA|</code>
      </div>

      {data.needsSkills ? (
        <EmptyState
          title="Add your skills first"
          text="You need at least one skill to teach and one to learn before we can match you."
          actionLabel="Edit profile"
          actionTo="/profile"
        />
      ) : data.matches.length === 0 ? (
        <EmptyState
          title="No mutual matches yet"
          text="Nobody fits both ways right now. Try adding more skills, or explore students directly."
          actionLabel="Explore students"
          actionTo="/explore"
        />
      ) : (
        <div className="stack">
          {data.matches.map((m, index) => (
            <article key={m.user._id} className="card match-card">
              <div className="match-rank">#{index + 1}</div>
              <div className="match-person">
                <Avatar name={m.user.name} />
                <div>
                  <h3>{m.user.name}</h3>
                  <p className="muted small">{m.user.university}</p>
                </div>
              </div>
              <div className="match-skills">
                <div>
                  <p className="label">They can teach you</p>
                  <SkillChips skills={m.theyCanTeachMe} variant="teach" />
                </div>
                <div>
                  <p className="label">You can teach them</p>
                  <SkillChips skills={m.iCanTeachThem} variant="learn" />
                </div>
              </div>
              <div className="match-actions">
                <div className="score-big">
                  <span>{m.score}</span>
                  <small>score</small>
                </div>
                <Link to={`/students/${m.user._id}`} className="btn btn-primary btn-sm">
                  View & request
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Matches
