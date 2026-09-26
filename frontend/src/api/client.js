import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'splitpay.token'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If a token goes stale/invalid mid-session, clear it and send the user back
// to login rather than showing a confusing broken page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error?.config?.url?.startsWith('/api/auth/')
    if (error?.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// --- Auth ---
export const signup = (username, password, display_name) =>
  api.post('/api/auth/signup', { username, password, display_name }).then((r) => r.data)
export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then((r) => r.data)
export const fetchMe = () => api.get('/api/auth/me').then((r) => r.data)
export const logoutRequest = () => api.post('/api/auth/logout').then((r) => r.data)

// --- Expenses ---
export const getExpenses = () => api.get('/api/expenses').then((r) => r.data)
export const getExpense = (id) => api.get(`/api/expenses/${id}`).then((r) => r.data)
export const createExpense = (payload) => api.post('/api/expenses', payload).then((r) => r.data)
export const deleteExpense = (id) => api.delete(`/api/expenses/${id}`)
export const getPeople = () => api.get('/api/expenses/people').then((r) => r.data)

// --- Balances ---
export const getBalances = (person) =>
  api.get('/api/balances', { params: person ? { person } : {} }).then((r) => r.data)
export const getSettledHistory = () => api.get('/api/balances/settled').then((r) => r.data)

// --- Settlements ---
export const settleBalance = (from_person, to_person) =>
  api.post('/api/settlements', { from_person, to_person }).then((r) => r.data)

// --- Dashboard ---
export const getDashboard = (person) =>
  api.get('/api/dashboard', { params: { person } }).then((r) => r.data)
