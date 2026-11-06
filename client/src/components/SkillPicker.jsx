// Lets the student pick skills from the shared list, grouped by category.
// "selected" is an array of skill ids; onChange receives the new array.
// disabledIds: skills that cannot be picked here (e.g. already chosen in the other list)
function SkillPicker({ skills, selected, onChange, variant, disabledIds = [] }) {
  const selectedSet = new Set(selected)
  const disabledSet = new Set(disabledIds)

  // Group skills: { Programming: [...], Design: [...] }
  const groups = skills.reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || []
    acc[skill.category].push(skill)
    return acc
  }, {})

  const toggle = (id) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="picker">
      {Object.entries(groups).map(([category, list]) => (
        <div key={category} className="picker-group">
          <p className="picker-label">{category}</p>
          <div className="chips">
            {list.map((skill) => {
              const isSelected = selectedSet.has(skill._id)
              const isDisabled = !isSelected && disabledSet.has(skill._id)
              return (
                <button
                  type="button"
                  key={skill._id}
                  className={`chip chip-button ${isSelected ? `chip-${variant}` : ''}`}
                  onClick={() => toggle(skill._id)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  title={isDisabled ? 'Already in your other list' : ''}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {skill.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SkillPicker
