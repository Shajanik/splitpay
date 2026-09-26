import { useCallback, useEffect, useState } from 'react'
import { getBalances, getSettledHistory, settleBalance } from '../api/client'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/Avatar'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { IconArrowRight } from '../components/Icons'
import { formatCurrency, timeAgo } from '../utils'

export default function Balances() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [settled, setSettled] = useState([])
  const [loading, setLoading] = useState(true)
  const [settlingKey, setSettlingKey] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getBalances(), getSettledHistory()])
      .then(([b, s]) => {
        setPending(b)
        setSettled(s)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSettle(row) {
    const key = row.from_person + '|' + row.to_person
    setSettlingKey(key)
    try {
      const res = await settleBalance(row.from_person, row.to_person)
      showToast(`Marked ${formatCurrency(res.settled_amount)} between ${res.from_person} and ${res.to_person} as settled.`)
      load()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not settle this balance.', 'error')
    } finally {
      setSettlingKey(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Balances</h2>
          <p className="eyebrow-line">See who owes whom right now, and what's already been cleared.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>
          Pending ({pending.length})
        </button>
        <button className={tab === 'settled' ? 'active' : ''} onClick={() => setTab('settled')}>
          Settled
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : tab === 'pending' ? (
        pending.length === 0 ? (
          <div className="card">
            <EmptyState title="All squared up" message="No one owes anyone anything right now. Nicely done." />
          </div>
        ) : (
          <div className="balance-list">
            {pending.map((row) => {
              const key = row.from_person + '|' + row.to_person
              return (
                <div className="balance-row" key={key}>
                  <div className="balance-people">
                    <Avatar name={row.from_person} />
                    <b>{row.from_person}</b>
                    <IconArrowRight className="arrow" width={16} height={16} />
                    <b>{row.to_person}</b>
                    <Avatar name={row.to_person} />
                  </div>
                  <div className="balance-amount">{formatCurrency(row.amount)}</div>
                  <span className="badge badge-pending">pending</span>
                  <button
                    className="btn btn-leaf btn-sm"
                    onClick={() => handleSettle(row)}
                    disabled={settlingKey === key}
                  >
                    {settlingKey === key ? 'Settling…' : 'Mark settled'}
                  </button>
                </div>
              )
            })}
          </div>
        )
      ) : settled.length === 0 ? (
        <div className="card">
          <EmptyState title="Nothing settled yet" message="Once you clear a balance, it'll show up here for the record." />
        </div>
      ) : (
        <div className="balance-list">
          {settled.map((row) => (
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
  )
}
