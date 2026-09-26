import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import { createExpense } from '../api/client'
import PeopleTagInput from '../components/PeopleTagInput'
import Avatar from '../components/Avatar'
import { formatCurrency } from '../utils'

export default function AddExpense() {
  const { currentUser, people, refreshPeople } = useUser()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUser)
  const [participants, setParticipants] = useState([])
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const everyone = useMemo(() => {
    const names = new Set(participants)
    if (paidBy.trim()) names.add(paidBy.trim())
    return Array.from(names)
  }, [participants, paidBy])

  const numericAmount = Number(amount) || 0
  const shareAmount = everyone.length ? numericAmount / everyone.length : 0

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!description.trim()) return setError('Give this expense a short description.')
    if (!numericAmount || numericAmount <= 0) return setError('Enter an amount greater than zero.')
    if (!paidBy.trim()) return setError('Who paid the bill?')
    if (everyone.length < 2) return setError('Add at least one more participant to split with.')

    setSubmitting(true)
    try {
      await createExpense({
        description: description.trim(),
        amount: numericAmount,
        paid_by: paidBy.trim(),
        participants: everyone,
        expense_date: expenseDate,
      })
      showToast(`Saved “${description.trim()}” — split ${everyone.length} ways.`)
      refreshPeople()
      setDescription('')
      setAmount('')
      setParticipants([])
      navigate('/history')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Could not save this expense. Please try again.'
      setError(Array.isArray(msg) ? msg.map((m) => m.msg).join(', ') : msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Add an expense</h2>
          <p className="eyebrow-line">Log a shared bill and SplitPay will split it equally and track who owes whom.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="card">
            <div className="field">
              <label htmlFor="description">What was it for?</label>
              <input
                id="description"
                className="input"
                placeholder="e.g. Dinner at Saravana Bhavan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="row-2">
              <div className="field">
                <label htmlFor="amount">Total amount</label>
                <div className="amount-input-wrap">
                  <span>₹</span>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  className="input"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="paidby">Who paid?</label>
              <input
                id="paidby"
                className="input"
                list="people-list"
                placeholder="e.g. You"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              />
              <datalist id="people-list">
                {people.map((p) => (
                  <option value={p} key={p} />
                ))}
              </datalist>
            </div>

            <div className="field" style={{ marginBottom: 4 }}>
              <label>Split between</label>
              <span className="hint">The payer is added automatically. Press Enter or comma to add each name.</span>
            </div>
            <PeopleTagInput
              value={participants}
              onChange={setParticipants}
              suggestions={people}
              placeholder="e.g. Priya, Arjun"
            />

            {error && (
              <p style={{ color: '#b5622a', fontSize: 13.5, marginTop: 16, fontWeight: 600 }}>{error}</p>
            )}

            <div style={{ marginTop: 24 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save expense'}
              </button>
            </div>
          </div>

          <div className="card split-preview">
            <h4>Split preview</h4>
            <p className="hint">Equal split across {everyone.length || 0} {everyone.length === 1 ? 'person' : 'people'}</p>
            <div className="split-total">{formatCurrency(numericAmount)}</div>

            {everyone.length === 0 ? (
              <p className="hint" style={{ marginTop: 12 }}>Add participants to see each person's share.</p>
            ) : (
              <div style={{ marginTop: 14 }}>
                {everyone.map((name) => (
                  <div className="split-row" key={name}>
                    <div className="who">
                      <Avatar name={name} size={28} />
                      {name}
                      {name.toLowerCase() === paidBy.trim().toLowerCase() && (
                        <span className="payer-tag">paid the bill</span>
                      )}
                    </div>
                    <strong>{formatCurrency(shareAmount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
