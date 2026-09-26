import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getPeople } from '../api/client'
import { useAuth } from './AuthContext'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [people, setPeople] = useState([])
  const [refreshFlag, setRefreshFlag] = useState(0)

  const currentUser = user?.display_name || user?.username || 'You'

  const refreshPeople = useCallback(() => setRefreshFlag((f) => f + 1), [])

  useEffect(() => {
    if (!isAuthenticated) {
      setPeople([])
      return
    }
    getPeople()
      .then((list) => setPeople(list))
      .catch(() => setPeople([]))
  }, [refreshFlag, isAuthenticated])

  return (
    <UserContext.Provider value={{ currentUser, people, refreshPeople }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
