import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from '../../services/api'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('mcsos_user')
      const token = localStorage.getItem('mcsos_token')
      
      if (!userData || !token) {
        setIsValid(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await authService.getMe()
        if (response && response.user) {
          setIsValid(true)
          setUser(JSON.parse(userData))
        } else {
          setIsValid(false)
        }
      } catch (error) {
        console.warn('Token validation failed, using local data:', error)
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsValid(true)
        } catch (parseError) {
          setIsValid(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    )
  }

  if (!isValid || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}