// Read-only stars when no onChange is given; clickable stars otherwise.
function StarRating({ value = 0, onChange, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5]

  if (!onChange) {
    return (
      <span className={`stars stars-${size}`} aria-label={`${value} out of 5`}>
        {stars.map((n) => (
          <span key={n} className={n <= Math.round(value) ? 'star on' : 'star'}>
            ★
          </span>
        ))}
      </span>
    )
  }

  return (
    <span className={`stars stars-${size}`} role="radiogroup" aria-label="Rating">
      {stars.map((n) => (
        <button
          type="button"
          key={n}
          className={n <= value ? 'star on star-button' : 'star star-button'}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-checked={n === value}
          role="radio"
        >
          ★
        </button>
      ))}
    </span>
  )
}

export default StarRating
