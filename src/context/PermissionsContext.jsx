import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { permissionsService } from '../services/api'
import { getToken } from '../services/api/client'

const PermissionsContext = createContext({
  permissions: {},
  loading: true,
  hasPermission: () => false,
  refreshPermissions: async () => {},
})

export const usePermissions = () => useContext(PermissionsContext)

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)

  const refreshPermissions = useCallback(async () => {
    if (!getToken()) {
      setPermissions({})
      setLoading(false)
      return
    }
    try {
      const data = await permissionsService.getEffective()
      const map = {}
      for (const entry of data?.permissions ?? []) {
        map[entry.key] = entry
      }
      setPermissions(map)
    } catch {
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshPermissions()
    const onAuthChange = () => refreshPermissions()
    window.addEventListener('mcsos-auth-changed', onAuthChange)
    return () => window.removeEventListener('mcsos-auth-changed', onAuthChange)
  }, [refreshPermissions])

  const hasPermission = useCallback(
    (key) => Boolean(permissions[key]?.granted),
    [permissions],
  )

  const value = useMemo(
    () => ({ permissions, loading, hasPermission, refreshPermissions }),
    [permissions, loading, hasPermission, refreshPermissions],
  )

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}
