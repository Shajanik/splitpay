import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import {
  IconSplitPay,
  IconDashboard,
  IconPlusCircle,
  IconScale,
  IconHistory,
  IconHandshake,
} from './Icons'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/add', label: 'Add Expense', icon: IconPlusCircle },
  { to: '/balances', label: 'Balances', icon: IconScale },
  { to: '/history', label: 'Expense History', icon: IconHistory },
  { to: '/settlement', label: 'Settlement', icon: IconHandshake },
]

export default function Sidebar({ open, onClose }) {
  const { currentUser } = useUser()
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <IconSplitPay className="sidebar-brand-mark" />
          <div className="sidebar-brand-text">
            <h1>SplitPay</h1>
            <span>split &amp; settle up</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <label>Signed in as</label>
          <div className="who-am-i">
            <Avatar name={currentUser} size={28} />
            <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{currentUser}</span>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
