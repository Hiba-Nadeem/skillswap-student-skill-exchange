// Displays a list of skills as small coloured chips.
// variant: "teach" (green), "learn" (amber) or "neutral"
// highlightIds: skills to emphasise (e.g. ones that match you)
function SkillChips({ skills = [], variant = 'neutral', highlightIds = [], emptyText = 'None yet' }) {
  if (skills.length === 0) return <p className="muted small">{emptyText}</p>

  const highlight = new Set(highlightIds.map(String))

  return (
    <ul className="chips">
      {skills.map((skill) => (
        <li
          key={skill._id}
          className={`chip chip-${variant} ${highlight.has(String(skill._id)) ? 'chip-highlight' : ''}`}
        >
          {skill.name}
        </li>
      ))}
    </ul>
  )
}

export default SkillChips
