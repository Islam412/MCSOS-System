import { ENDPOINTS } from '../config'
import { post, get } from '../client'

export const authService = {
  // تسجيل الدخول
  login: async (email, password) => {
    try {
      const response = await post(ENDPOINTS.AUTH.LOGIN, { email, password })
      return response
    } catch (error) {
      throw error
    }
  },

  // تسجيل مستخدم جديد
  register: async (userData) => {
    try {
      const response = await post(ENDPOINTS.AUTH.REGISTER, userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على معلومات المستخدم الحالي
  getMe: async () => {
    try {
      const response = await get(ENDPOINTS.AUTH.ME)
      return response
    } catch (error) {
      throw error
    }
  },

  // تسجيل الخروج
  logout: () => {
    localStorage.removeItem('mcsos_user')
    localStorage.removeItem('mcsos_token')
    localStorage.removeItem('mcsos_refresh_token')
    localStorage.removeItem('mcsos_remember')
    localStorage.removeItem('mcsos_saved_email')
    window.location.href = '/login'
  },

  // طلب إعادة تعيين كلمة المرور
  forgotPassword: async (email) => {
    try {
      const response = await post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
      return response
    } catch (error) {
      throw error
    }
  },

  // إعادة تعيين كلمة المرور
  resetPassword: async (token, newPassword) => {
    try {
      const response = await post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword })
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث التوكن (Refresh Token)
  refreshToken: async () => {
    try {
      const response = await post(ENDPOINTS.AUTH.REFRESH)
      return response
    } catch (error) {
      throw error
    }
  },
}