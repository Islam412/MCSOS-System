// src/services/api/client.js

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

  // ✅ بناء الـ URL بشكل صحيح
  let fullUrl = url
  if (!url.startsWith('http')) {
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, '')
    const cleanUrl = url.replace(/^\/+/, '')
    fullUrl = `${baseUrl}/${cleanUrl}`
  }

  console.log('🌐 API Request URL:', fullUrl)

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(user ? { 'X-User-Role': user.role } : {}),
    },
    mode: 'cors',
    credentials: 'include',
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
    const response = await fetch(fullUrl, mergedOptions)
    clearTimeout(timeoutId)

    // ✅ معالجة الاستجابة الفارغة
    const text = await response.text()
    
    if (response.status === 204 || !text) {
      return { success: true }
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { success: true, raw: text }
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || ERROR_MESSAGES.SERVER_ERROR
      throw new Error(errorMessage)
    }

    return data

  } catch (error) {
    clearTimeout(timeoutId)

    // معالجة خطأ المهلة
    if (error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT)
    }

    // معالجة خطأ الشبكة
    if (error.message === 'Failed to fetch' || error.message === 'NetworkError') {
      if (retryCount < API_CONFIG.RETRY_COUNT) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)))
        return apiRequest(url, options, retryCount + 1)
      }
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }

    if (error.message === 'CORS error: Unable to access resource') {
      throw new Error('CORS policy blocked the request. Please check server CORS configuration.')
    }

    throw error
  }
}

// دوال مساعدة
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' })
}

export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const put = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const patch = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' })
}

// تحميل ملفات (multipart/form-data)
export const uploadFile = async (endpoint, file, additionalData = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key])
  })

  const token = getToken()
  
  // ✅ بناء الـ URL بشكل صحيح
  let fullUrl = endpoint
  if (!endpoint.startsWith('http')) {
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, '')
    const cleanUrl = endpoint.replace(/^\/+/, '')
    fullUrl = `${baseUrl}/${cleanUrl}`
  }

  console.log('📤 Uploading file to:', fullUrl)

  const response = await fetch(fullUrl, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const text = await response.text()
  
  if (!response.ok) {
    try {
      const error = JSON.parse(text)
      throw new Error(error.message || 'فشل رفع الملف')
    } catch {
      throw new Error(text || 'فشل رفع الملف')
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    return { success: true, raw: text }
  }
}