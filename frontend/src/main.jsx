import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

import './styles/theme.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/auth.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
