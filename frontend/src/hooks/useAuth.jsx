import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await authService.getMe()
        setUser(response.data.user)
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const login = async (email, mot_de_passe) => {
    const response = await authService.login({ email, mot_de_passe })
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
    return response.data
  }

  const register = async (nom_utilisateur, email, mot_de_passe) => {
    const response = await authService.register({ nom_utilisateur, email, mot_de_passe })
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
