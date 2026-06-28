import { get, post, put, del } from '../api/client'
import { API_CONFIG } from '../api/config'

// مفتاح التخزين المحلي
const STORAGE_KEYS = {
  DOCTORS: 'mcsos_doctors_v2',
  PATIENTS: 'mcsos_patients_v2',
  APPOINTMENTS: 'mcsos_appointments_v2',
  INVOICES: 'mcsos_invoices_v2',
  PRESCRIPTIONS: 'mcsos_prescriptions_v2',
  PACKAGES: 'mcsos_packages_v2',
  USERS: 'mcsos_all_users_v2',
  SPECIALTIES: 'mcsos_specialties_v2',
  HOSPITAL_INFO: 'mcsos_hospital_info_v2',
}

// دالة للحصول على بيانات من localStorage مع التعامل مع الأخطاء
const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return null
  }
}

// دالة لحفظ بيانات في localStorage
const saveLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
    return false
  }
}

// دالة لدمج البيانات (تحديث البيانات المحلية من الخادم)
export const syncFromServer = async (resource, endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    const response = await get(url)
    
    const key = STORAGE_KEYS[resource.toUpperCase()]
    if (key && response[resource]) {
      saveLocalData(key, response[resource])
    }
    
    return response
  } catch (error) {
    const key = STORAGE_KEYS[resource.toUpperCase()]
    const localData = getLocalData(key)
    if (localData) {
      return { [resource]: localData, synced: false }
    }
    throw error
  }
}

// دالة لدفع البيانات المحلية إلى الخادم
export const pushToServer = async (resource, endpoint, data) => {
  try {
    const response = await post(endpoint, data)
    
    const key = STORAGE_KEYS[resource.toUpperCase()]
    if (key) {
      const existing = getLocalData(key) || []
      const updated = [...existing, response[resource]]
      saveLocalData(key, updated)
    }
    
    return response
  } catch (error) {
    const key = STORAGE_KEYS[resource.toUpperCase()]
    const existing = getLocalData(key) || []
    const newData = { ...data, id: Date.now(), _syncPending: true }
    existing.push(newData)
    saveLocalData(key, existing)
    throw error
  }
}

// ✅ دالة لمزامنة العناصر المعلقة (مع التحقق من وجود item)
export const syncPendingItems = async () => {
  const results = []
  
  // التحقق من جميع الموارد للعناصر المعلقة
  for (const [resource, key] of Object.entries(STORAGE_KEYS)) {
    const data = getLocalData(key) || []
    // ✅ التأكد من أن data مصفوفة وكل عنصر غير null
    if (!Array.isArray(data)) continue
    
    const pending = data.filter(item => item && item._syncPending === true)
    
    for (const item of pending) {
      // ✅ التحقق من وجود item
      if (!item) continue
      
      try {
        const endpoint = `/api/${resource.toLowerCase()}`
        const response = await post(endpoint, item)
        
        // إزالة علامة المعلقة
        const updated = data.map(d => 
          d && d.id === item.id ? { ...d, _syncPending: false, _syncedAt: new Date().toISOString() } : d
        )
        saveLocalData(key, updated)
        results.push({ success: true, id: item.id, resource })
      } catch (error) {
        results.push({ success: false, id: item?.id || 'unknown', resource, error: error.message })
      }
    }
  }
  
  return results
}

// تصدير دوال التخزين المحلي
export const localStorageService = {
  get: getLocalData,
  set: saveLocalData,
  syncFromServer,
  pushToServer,
  syncPendingItems,
  STORAGE_KEYS,
}