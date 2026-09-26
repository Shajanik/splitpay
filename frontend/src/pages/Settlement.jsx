import { useCallback, useEffect, useState } from 'react'
import { getBalances, getSettledHistory, settleBalance } from '../api/client'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/Avatar'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { IconArrowRight, IconHandshake } from '../components/Icons'
import { formatCurrency, timeAgo } from '../utils'

export default function Settlement() {
  const { showToast } = useToast()
  const [pending, setPending] = useState([])
  const [recentlySettled, setRecentlySettled] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getBalances(), getSettledHistory()])
      .then(([b, s]) => {
        setPending(b)
        setRecentlySettled(s.slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSettle(row) {
    const key = row.from_person + '|' + row.to_person
    setBusyKey(key)
    try {
      const res = await settleBalance(row.from_person, row.to_person)
      showToast(`Settled up! ${res.from_person} → ${res.to_person}, ${formatCurrency(res.settled_amount)}.`)
      load()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not settle this balance.', 'error')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settlement</h2>
          <p className="eyebrow-line">Mark an outstanding payment as settled once money has actually changed hands.</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">
              <h3>Outstanding balances</h3>
            </div>
            {pending.length === 0 ? (
              <EmptyState title="Nothing to settle" message="Every balance is already cleared. New expenses will show up here." />
            ) : (
              <div className="balance-list">
                {pending.map((row) => {
                  const key = row.from_person + '|' + row.to_person
                  return (
                    <div className="balance-row" key={key}>
                      <div className="balance-people">
                        <Avatar name={row.from_person} />
                        <b>{row.from_person}</b> owes
                        <IconArrowRight className="arrow" width={16} height={16} />
                        <b>{row.to_person}</b>
                      </div>
                      <div className="balance-amount">{formatCurrency(row.amount)}</div>
                      <button className="btn btn-leaf btn-sm" onClick={() => handleSettle(row)} disabled={busyKey === key}>
                        <IconHandshake width={16} height={16} />
                        {busyKey === key ? 'Settling…' : 'Mark as settled'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">
              <h3>Recently settled</h3>
            </div>
            {recentlySettled.length === 0 ? (
              <p className="hint">No settlements recorded yet.</p>
            ) : (
              <div className="balance-list">
                {recentlySettled.map((row) => (
                  <div className="balance-row" key={row.id}>
                    <div className="balance-people">
                      <Avatar name={row.from_person} />
                      <b>{row.from_person}</b>
                      <IconArrowRight className="arrow" width={16} height={16} />
                      <b>{row.to_person}</b>
                      <Avatar name={row.to_person} />
                    </div>
                    <div className="balance-amount">{formatCurrency(row.amount)}</div>
                    <span className="badge badge-settled">settled</span>
                    <span className="hint" style={{ minWidth: 90, textAlign: 'right' }}>
                      {timeAgo(row.settled_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
