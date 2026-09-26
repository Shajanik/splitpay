import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getDashboard } from '../api/client'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { IconWallet, IconScale, IconHandshake, IconClock, IconReceipt, IconLeafBadge } from '../components/Icons'
import { formatCurrency, timeAgo } from '../utils'

export default function Dashboard() {
  const { currentUser } = useUser()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getDashboard(currentUser)
      .then((d) => active && setData(d))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [currentUser])

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <h2>Hey {currentUser}, here's how things are growing 🌿</h2>
          <p>A quick look at what's been spent, what's owed to you, and what still needs settling.</p>
        </div>
        <svg className="dashboard-hero-decor" viewBox="0 0 120 100" fill="none">
          <path d="M60 90V40" stroke="#397A4A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M60 55c0-14-11-22-26-22 0 14 11 25 26 22" fill="#B7DFC0" stroke="#397A4A" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M60 62c0-16 12-25 28-25 0 15-12 27-28 25" fill="#8FCB9B" stroke="#397A4A" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M60 48c0-11-8-18-19-18 0 11 8 19 19 18" fill="#F6D668" stroke="#B5622A" strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="60" cy="92" rx="24" ry="4.5" fill="#F0E4C4" />
        </svg>
      </div>

      {loading && <Loader />}

      {!loading && data && (
        <>
          <div className="stat-grid">
            <StatCard
              tone="yellow"
              icon={IconReceipt}
              label="Total group expenses"
              value={formatCurrency(data.total_group_expenses)}
              sub="All-time, across everyone"
            />
            <StatCard
              tone="green"
              icon={IconWallet}
              label="Owed to you"
              value={formatCurrency(data.owed_to_me)}
              sub="Pending from others"
            />
            <StatCard
              tone="peach"
              icon={IconScale}
              label="You owe"
              value={formatCurrency(data.i_owe)}
              sub="Pending, your side"
            />
            <StatCard
              tone="blue"
              icon={IconHandshake}
              label="Pending settlements"
              value={data.pending_settlements}
              sub="Open balances to clear"
            />
          </div>

          <div className="card">
            <div className="section-title">
              <h3>Recent expenses</h3>
              <Link to="/history">See all history →</Link>
            </div>

            {data.recent_expenses.length === 0 ? (
              <EmptyState
                title="Nothing planted yet"
                message="Add your first shared expense to see it bloom here."
                action={
                  <Link to="/add" className="btn btn-primary">
                    Add an expense
                  </Link>
                }
              />
            ) : (
              <div className="recent-list">
                {data.recent_expenses.map((exp) => (
                  <div className="recent-row" key={exp.id}>
                    <div className="recent-icon">
                      {exp.settlement_status === 'settled' ? <IconLeafBadge width={20} height={20} /> : <IconClock width={18} height={18} color="#B5622A" />}
                    </div>
                    <div className="recent-main">
                      <div className="title">{exp.description}</div>
                      <div className="meta">
                        Paid by {exp.paid_by} · {exp.participants.length} people · {timeAgo(exp.created_at)}
                      </div>
                    </div>
                    <div className="recent-amount">{formatCurrency(exp.amount)}</div>
                    <span className={`badge ${exp.settlement_status === 'settled' ? 'badge-settled' : 'badge-pending'}`}>
                      {exp.settlement_status}
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
