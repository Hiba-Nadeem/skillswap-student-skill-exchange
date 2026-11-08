import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatTime } from '../utils/format.js'

// Stored messaging (not real-time). Use "Refresh" to load new messages.
function Messages() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState(null)
  const [thread, setThread] = useState(null) // { user, connected, messages }
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const loadConversations = () =>
    api
      .get('/messages/conversations')
      .then((res) => setConversations(res.data))
      .catch((err) => setError(getErrorMessage(err)))

  const loadThread = (id) =>
    api
      .get(`/messages/${id}`)
      .then((res) => setThread(res.data))
      .catch((err) => setError(getErrorMessage(err)))

  useEffect(() => {
    loadConversations()
  }, [])

  // Whenever the selected conversation changes, load its messages
  useEffect(() => {
    setThread(null)
    setError('')
    if (userId) loadThread(userId)
  }, [userId])

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [thread])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    setError('')
    try {
      await api.post(`/messages/${userId}`, { text })
      setText('')
      await Promise.all([loadThread(userId), loadConversations()])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const refresh = () => {
    loadConversations()
    if (userId) loadThread(userId)
  }

  if (!conversations) return <Loader text="Loading messages..." />

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Messages</h1>
          <p className="muted">Chat with students once a request between you is accepted.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={refresh}>
          ↻ Refresh
        </button>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          text="When one of your requests is accepted, you can message that student here."
          actionLabel="View requests"
          actionTo="/requests"
        />
      ) : (
        <div className={`card inbox ${userId ? 'has-thread' : ''}`}>
          {/* Left: conversation list */}
          <ul className="convo-list">
            {conversations.map((c) => (
              <li key={c.user._id}>
                <button
                  className={`convo ${c.user._id === userId ? 'active' : ''}`}
                  onClick={() => navigate(`/messages/${c.user._id}`)}
                >
                  <Avatar name={c.user.name} size="sm" />
                  <span className="grow convo-text">
                    <span className="strong">{c.user.name}</span>
                    <span className="muted small truncate">
                      {c.lastMessage
                        ? `${c.lastMessage.sender === user._id ? 'You: ' : ''}${c.lastMessage.text}`
                        : 'Say hello 👋'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Right: message thread */}
          <section className="thread">
            {!userId ? (
              <div className="thread-empty muted">Select a conversation</div>
            ) : !thread ? (
              error ? <p className="error pad">{error}</p> : <Loader />
            ) : (
              <>
                <header className="thread-head">
                  <button className="btn btn-ghost btn-sm thread-back" onClick={() => navigate('/messages')}>
                    ←
                  </button>
                  <Avatar name={thread.user.name} size="sm" />
                  <Link to={`/students/${thread.user._id}`} className="strong">
                    {thread.user.name}
                  </Link>
                </header>

                <div className="thread-body">
                  {thread.messages.length === 0 && (
                    <p className="muted small center">No messages yet. Start the conversation!</p>
                  )}
                  {thread.messages.map((m) => (
                    <div key={m._id} className={`bubble ${m.sender === user._id ? 'mine' : 'theirs'}`}>
                      <p>{m.text}</p>
                      <span className="bubble-time">{formatTime(m.createdAt)}</span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {thread.connected ? (
                  <form className="composer" onSubmit={handleSend}>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write a message..."
                      maxLength={1000}
                    />
                    <button className="btn btn-primary" disabled={sending || !text.trim()}>
                      Send
                    </button>
                  </form>
                ) : (
                  <p className="muted small pad">You can only message students you have an accepted request with.</p>
                )}
                {error && <p className="error pad">{error}</p>}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Messages
