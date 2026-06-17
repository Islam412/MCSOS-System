
import { API_CONFIG, ENDPOINTS, ERROR_MESSAGES } from './config'

// جلب التوكن من localStorage
const getToken = () => localStorage.getItem('mcsos_token')

// جلب المستخدم الحالي
const getCurrentUser = () => {
  const user = localStorage.getItem('mcsos_user')
  return user ? JSON.parse(user) : null
}

// تحديث التوكن
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('mcsos_token', token)
  } else {
    localStorage.removeItem('mcsos_token')
  }
}

// تحديث بيانات المستخدم
export const setUser = (user) => {
  if (user) {
    localStorage.setItem('mcsos_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('mcsos_user')
  }
}

// دالة الطلب الأساسية مع إعادة المحاولة
export const apiRequest = async (url, options = {}, retryCount = 0) => {
  const token = getToken()
  const user = getCurrentUser()

  const defaultOptions = {
    headers: {
      ...API_CONFIG.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(user ? { 'X-User-Role': user.role } : {}),
    },
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  }

  // إضافة timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)
  mergedOptions.signal = controller.signal

  try {
    const response = await fetch(url, mergedOptions)
    clearTimeout(timeoutId)

    // معالجة حالة 401 (غير مصرح)
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}))
      // محاولة تحديث التوكن تلقائياً (بسيط)
      if (errorData.code === 'TOKEN_EXPIRED') {
        // يمكن إضافة منطق تحديث التوكن هنا
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
      }
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
    }

    // معالجة حالة 403 (ممنوع)
    if (response.status === 403) {
      throw new Error(ERROR_MESSAGES.FORBIDDEN)
    }

    // معالجة حالة 404 (غير موجود)
    if (response.status === 404) {
      throw new Error(ERROR_MESSAGES.NOT_FOUND)
    }

    // معالجة حالة 422 (خطأ في التحقق)
    if (response.status === 422) {
      const errorData = await response.json()
      throw new Error(errorData.message || ERROR_MESSAGES.VALIDATION_ERROR)
    }

    // معالجة حالة 500 (خطأ في الخادم)
    if (response.status >= 500) {
      throw new Error(ERROR_MESSAGES.SERVER_ERROR)
    }

    // محاولة تحويل الاستجابة إلى JSON
    const data = await response.json().catch(() => ({}))
    return data

  } catch (error) {
    clearTimeout(timeoutId)

    // معالجة خطأ المهلة
    if (error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT)
    }

    // معالجة خطأ الشبكة
    if (error.message === 'Failed to fetch' || error.message === 'NetworkError') {
      // إعادة المحاولة إذا كان مسموحاً
      if (retryCount < API_CONFIG.RETRY_COUNT) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)))
        return apiRequest(url, options, retryCount + 1)
      }
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }

    // إعادة الخطأ الأصلي
    throw error
  }
}

// دوال مساعدة
export const get = (endpoint, options = {}) => {
  return apiRequest(`${API_CONFIG.BASE_URL}${endpoint}`, { ...options, method: 'GET' })
}

export const post = (endpoint, data, options = {}) => {
  return apiRequest(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const put = (endpoint, data, options = {}) => {
  return apiRequest(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const patch = (endpoint, data, options = {}) => {
  return apiRequest(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const del = (endpoint, options = {}) => {
  return apiRequest(`${API_CONFIG.BASE_URL}${endpoint}`, { ...options, method: 'DELETE' })
}

// تحميل ملفات (multipart/form-data)
export const uploadFile = async (endpoint, file, additionalData = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key])
  })

  const token = getToken()
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'فشل رفع الملف')
  }

  return response.json()
}