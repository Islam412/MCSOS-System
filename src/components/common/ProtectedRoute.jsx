import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = localStorage.getItem('mcsos_user')
  const userData = user ? JSON.parse(user) : null
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}
