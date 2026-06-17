import { createContext, useContext, useEffect, useState } from 'react'
import * as apiServices from '../services/api'
import { localStorageService } from '../services/localStorage/syncService'

const ServiceContext = createContext()

export const useServices = () => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider')
  }
  return context
}

export const ServiceProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // مزامنة العناصر المعلقة عند العودة إلى الإنترنت
  useEffect(() => {
    if (isOnline) {
      syncPendingItems()
    }
  }, [isOnline])

  const syncPendingItems = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const results = await localStorageService.syncPendingItems()
      const failed = results.filter(r => !r.success)
      setPendingSyncCount(failed.length)
      return results
    } finally {
      setIsSyncing(false)
    }
  }

  // دالة لتنفيذ طلب مع دعم الوضع غير المتصل
  const executeWithOfflineSupport = async (apiCall, localResource, localData) => {
    try {
      if (isOnline) {
        const result = await apiCall()
        // تحديث البيانات المحلية بعد النجاح
        if (localResource && result[localResource]) {
          localStorageService.set(localResource, result[localResource])
        }
        return result
      } else {
        // وضع غير متصل - استخدام البيانات المحلية
        if (localData) {
          return localData
        }
        throw new Error('الجهاز غير متصل بالإنترنت')
      }
    } catch (error) {
      // في حالة فشل الطلب، محاولة استخدام البيانات المحلية
      if (localData) {
        return localData
      }
      throw error
    }
  }

  const value = {
    // حالة الاتصال
    isOnline,
    isSyncing,
    pendingSyncCount,
    syncPendingItems,

    // دوال مساعدة
    executeWithOfflineSupport,

    // الخدمات
    api: apiServices,
    localStorage: localStorageService,
  }

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  )
}