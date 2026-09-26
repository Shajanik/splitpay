import { useMemo, useState, useRef } from 'react'
import Avatar from './Avatar'
import { colorForName } from '../utils'

export default function PeopleTagInput({ value, onChange, suggestions = [], placeholder }) {
  const [draft, setDraft] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const filteredSuggestions = useMemo(() => {
    const q = draft.trim().toLowerCase()
    return suggestions
      .filter((name) => !value.some((v) => v.toLowerCase() === name.toLowerCase()))
      .filter((name) => (q ? name.toLowerCase().includes(q) : true))
      .slice(0, 6)
  }, [draft, suggestions, value])

  function addName(name) {
    const clean = name.trim()
    if (!clean) return
    if (value.some((v) => v.toLowerCase() === clean.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...value, clean])
    setDraft('')
  }

  function removeName(name) {
    onChange(value.filter((v) => v !== name))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addName(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      removeName(value[value.length - 1])
    }
  }

  return (
    <div className="suggestions">
      <div className="tag-input-box" onClick={() => inputRef.current?.focus()}>
        {value.map((name) => (
          <span className="chip" key={name}>
            <span className="chip-avatar" style={{ background: colorForName(name) }}>
              {name.slice(0, 1).toUpperCase()}
            </span>
            {name}
            <button type="button" onClick={() => removeName(name)} aria-label={`Remove ${name}`}>
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          placeholder={value.length ? 'Add another…' : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="suggestions-list">
          {filteredSuggestions.map((name) => (
            <button type="button" key={name} onMouseDown={(e) => e.preventDefault()} onClick={() => addName(name)}>
              <Avatar name={name} size={20} /> {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
