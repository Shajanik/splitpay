import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import { IconMenu, IconSplitPay } from './components/Icons'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Balances from './pages/Balances'
import History from './pages/History'
import Settlement from './pages/Settlement'
import Login from './pages/Login'
import Signup from './pages/Signup'

function AppShell() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconSplitPay style={{ width: 30, height: 30 }} />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>SplitPay</strong>
        </div>
        <button onClick={() => setNavOpen(true)} aria-label="Open menu">
          <IconMenu width={20} height={20} />
        </button>
      </div>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="main-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/balances" element={<Balances />} />
          <Route path="/history" element={<History />} />
          <Route path="/settlement" element={<Settlement />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
