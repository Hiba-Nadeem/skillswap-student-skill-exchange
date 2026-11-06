import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

const STEPS = [
  { title: 'Build your profile', text: 'List the skills you can teach and the ones you want to learn.' },
  { title: 'Get matched', text: 'We find students who want what you know and know what you want.' },
  { title: 'Swap and grow', text: 'Send a request, chat, meet up for a session, then rate each other.' },
]

const BENEFITS = [
  { title: 'No money involved', text: 'You pay with knowledge, not fees. Teaching is the currency.' },
  { title: 'Learn from peers', text: 'Students explain things in a way that actually makes sense to students.' },
  { title: 'Teach to master it', text: 'Explaining a skill to someone else is the best way to deepen your own.' },
  { title: 'Trusted by reviews', text: 'Ratings after every completed session keep the community reliable.' },
]

function Landing() {
  const { user } = useAuth()
  const [skills, setSkills] = useState([])

  // Featured skills come from the real shared skills list
  useEffect(() => {
    api
      .get('/skills')
      .then((res) => setSkills(res.data.slice(0, 14)))
      .catch(() => setSkills([]))
  }, [])

  return (
    <div className="landing">
      <section className="hero container">
        <div className="hero-text">
          <p className="eyebrow">Student skill exchange</p>
          <h1>
            Teach what you know.
            <br />
            <span className="accent">Learn what you don't.</span>
          </h1>
          <p className="lead">
            SkillSwap pairs university students who can teach each other. Trade Python for
            Photoshop, Calculus for French, SQL for public speaking. No payments, just people
            helping people.
          </p>
          <div className="row gap-sm">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create free account
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  I have an account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Visual: an example mutual match */}
        <div className="hero-visual" aria-hidden="true">
          <div className="swap-card">
            <p className="swap-name">Hiba</p>
            <p className="label">Teaches</p>
            <div className="chips">
              <span className="chip chip-teach">Python</span>
              <span className="chip chip-teach">SQL</span>
            </div>
            <p className="label">Wants</p>
            <div className="chips">
              <span className="chip chip-learn">Photoshop</span>
            </div>
          </div>
          <div className="swap-arrow">⇄</div>
          <div className="swap-card">
            <p className="swap-name">Maryam</p>
            <p className="label">Teaches</p>
            <div className="chips">
              <span className="chip chip-teach">Photoshop</span>
            </div>
            <p className="label">Wants</p>
            <div className="chips">
              <span className="chip chip-learn">Python</span>
              <span className="chip chip-learn">SQL</span>
            </div>
          </div>
          <p className="swap-score">Mutual match · score 3</p>
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">How it works</h2>
        <div className="grid grid-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card step">
              <span className="step-num">{i + 1}</span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Why SkillSwap</h2>
          <div className="grid grid-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="benefit">
                <h3>{b.title}</h3>
                <p className="muted">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {skills.length > 0 && (
        <section className="section container">
          <h2 className="section-title">Skills students are swapping</h2>
          <div className="chips chips-center">
            {skills.map((s) => (
              <span key={s._id} className="chip chip-neutral chip-lg">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {!user && (
        <section className="section container">
          <div className="cta">
            <h2>Ready to swap your first skill?</h2>
            <p>It takes a minute to set up your profile.</p>
            <Link to="/register" className="btn btn-light btn-lg">
              Get started
            </Link>
          </div>
        </section>
      )}

      <footer className="footer">
        <p>SkillSwap · Web Programming Project · FAST-NUCES Lahore</p>
      </footer>
    </div>
  )
}

export default Landing
