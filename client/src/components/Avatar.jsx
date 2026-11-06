import { initials } from '../utils/format.js'

// Circle with the student's initials (no image uploads in this project)
function Avatar({ name, size = 'md' }) {
  return <span className={`avatar avatar-${size}`}>{initials(name)}</span>
}

export default Avatar
