import { Link } from 'react-router-dom'
import Avatar from './Avatar.jsx'
import SkillChips from './SkillChips.jsx'

// Card used on the Explore page. highlightIds marks skills you want to learn.
function StudentCard({ student, highlightIds = [] }) {
  return (
    <article className="card student-card">
      <header className="student-head">
        <Avatar name={student.name} />
        <div>
          <h3>{student.name}</h3>
          <p className="muted small">
            {student.university}
            {student.department ? ` · ${student.department}` : ''}
          </p>
        </div>
      </header>

      {student.bio && <p className="student-bio">{student.bio}</p>}

      <div>
        <p className="label">Can teach</p>
        <SkillChips skills={student.skillsToTeach} variant="teach" highlightIds={highlightIds} />
      </div>
      <div>
        <p className="label">Wants to learn</p>
        <SkillChips skills={student.skillsToLearn} variant="learn" />
      </div>

      <Link to={`/students/${student._id}`} className="btn btn-outline btn-block">
        View profile
      </Link>
    </article>
  )
}

export default StudentCard
