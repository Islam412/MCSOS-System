import { Navigate } from 'react-router-dom'
import { getToken } from '../../services/api/client'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/api'
import PageLoader from './PageLoader'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { i18n } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('mcsos_user')
      const token = getToken()
      
      if (!userData || !token) {
        setIsValid(false)
        setIsLoading(false)
        return
      }

      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsValid(true)
      } catch (error) {
        console.warn('Parsing local user data failed:', error)
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <PageLoader
        fullscreen
        label={i18n.language === 'ar' ? 'جاري التحقق من الجلسة...' : 'Verifying session...'}
      />
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