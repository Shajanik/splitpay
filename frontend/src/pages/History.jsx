import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExpenses, getExpense } from '../api/client'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import Avatar from '../components/Avatar'
import { formatCurrency, formatDate } from '../utils'

export default function History() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [detailCache, setDetailCache] = useState({})

  useEffect(() => {
    getExpenses()
      .then(setExpenses)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return expenses.filter((e) => {
      const matchesQuery =
        !q ||
        e.description.toLowerCase().includes(q) ||
        e.paid_by.toLowerCase().includes(q) ||
        e.participants.some((p) => p.toLowerCase().includes(q))
      const matchesStatus = statusFilter === 'all' || e.settlement_status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [expenses, query, statusFilter])

  async function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!detailCache[id]) {
      const detail = await getExpense(id)
      setDetailCache((c) => ({ ...c, [id]: detail }))
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Expense history</h2>
          <p className="eyebrow-line">Every bill you've logged, who was in on it, and whether it's settled.</p>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="input search-input"
          placeholder="Search by description or person…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="settled">Settled</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={expenses.length === 0 ? 'No expenses yet' : 'No matches'}
            message={
              expenses.length === 0
                ? 'Log your first shared bill to start tracking who owes what.'
                : 'Try a different search term or status filter.'
            }
            action={
              expenses.length === 0 && (
                <Link to="/add" className="btn btn-primary">
                  Add an expense
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((exp) => {
            const isOpen = expandedId === exp.id
            const detail = detailCache[exp.id]
            return (
              <div className="history-card" key={exp.id}>
                <div className="history-card-top">
                  <div>
                    <div className="desc">{exp.description}</div>
                    <div className="date">{formatDate(exp.expense_date)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="amount">{formatCurrency(exp.amount)}</div>
                    <span className={`badge ${exp.settlement_status === 'settled' ? 'badge-settled' : 'badge-pending'}`}>
                      {exp.settlement_status}
                    </span>
                  </div>
                </div>

                <div className="history-meta-row">
                  <span className="history-people">
                    Paid by <strong>{exp.paid_by}</strong> · split {formatCurrency(exp.split_amount)} each among {exp.participants.length}
                  </span>
                </div>
                <div className="history-meta-row">
                  {exp.participants.map((p) => (
                    <span className="chip" key={p}>
                      <Avatar name={p} size={20} />
                      {p}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <button className="link" onClick={() => toggleExpand(exp.id)} style={{ background: 'none', border: 'none', color: '#f16847', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', padding: 0 }}>
                    {isOpen ? 'Hide breakdown ▲' : 'Show breakdown ▼'}
                  </button>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    {!detail ? (
                      <Loader />
                    ) : detail.debts.length === 0 ? (
                      <p className="hint">Only the payer was involved — nothing to split.</p>
                    ) : (
                      detail.debts.map((d) => (
                        <div className="split-row" key={d.id}>
                          <div className="who">
                            <Avatar name={d.from_person} size={24} />
                            {d.from_person} owes {d.to_person}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <strong>{formatCurrency(d.amount)}</strong>
                            <span className={`badge ${d.status === 'settled' ? 'badge-settled' : 'badge-pending'}`}>{d.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
