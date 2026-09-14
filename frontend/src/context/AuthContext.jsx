import { createContext, useContext, useState } from 'react'
import { login as loginApi } from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) return null
    try {
      return JSON.parse(savedUser)
    } catch {
      return savedUser
    }
  })

  const isAuthenticated = Boolean(token)

  const login = async (email, password) => {
    const data = await loginApi(email, password)
    const tokenValue = data.token
    const userData = data.user || {
      id: data.id,
      name: data.name,
      email: data.email,
    }

    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
    }
    localStorage.setItem('user', JSON.stringify(userData))

    setToken(tokenValue)
    setUser(userData)

    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
