// src/services/api/services/usersService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

export const usersService = {
  // الحصول على قائمة المستخدمين
  getUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? ENDPOINTS.USERS.LIST + '?' + queryString : ENDPOINTS.USERS.LIST
      const response = await get(endpoint)
      
      // ✅ معالجة الاستجابة بأنواعها المختلفة
      if (response && typeof response === 'object') {
        // إذا كانت الاستجابة تحتوي على خاصية users (المتوقعة من Swagger)
        if (Array.isArray(response.users)) {
          return response.users
        }
        // إذا كانت الاستجابة تحتوي على خاصية data
        if (Array.isArray(response.data)) {
          return response.data
        }
        // إذا كانت الاستجابة تحتوي على خاصية items
        if (Array.isArray(response.items)) {
          return response.items
        }
        // إذا كانت الاستجابة تحتوي على خاصية results
        if (Array.isArray(response.results)) {
          return response.results
        }
        // إذا كانت الاستجابة نفسها مصفوفة
        if (Array.isArray(response)) {
          return response
        }
        // إذا كانت الاستجابة كائن بمفتاح واحد يحتوي على مصفوفة
        const keys = Object.keys(response)
        for (const key of keys) {
          if (Array.isArray(response[key])) {
            return response[key]
          }
        }
      }
      
      // في حالة عدم العثور على مصفوفة، إرجاع مصفوفة فارغة
      return []
    } catch (error) {
      console.error('Error fetching users:', error)
      // ✅ إرجاع مصفوفة فارغة بدلاً من رمي الخطأ
      return []
    }
  },

  // الحصول على مستخدم محدد
  getUser: async (id) => {
    try {
      const endpoint = ENDPOINTS.USERS.GET ? ENDPOINTS.USERS.GET(id) : `/users/${id}`
      const response = await get(endpoint)
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.user) return response.user
        if (response.data) return response.data
        return response
      }
      return null
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  // إنشاء مستخدم جديد
  createUser: async (userData) => {
    try {
      const response = await post(ENDPOINTS.USERS.CREATE, userData)
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.user) return response.user
        if (response.data) return response.data
        return response
      }
      return response
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // تحديث بيانات مستخدم
  updateUser: async (id, userData) => {
    try {
      const response = await put(ENDPOINTS.USERS.UPDATE(id), userData)
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.user) return response.user
        if (response.data) return response.data
        return response
      }
      return response
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
  },

  // حذف مستخدم
  deleteUser: async (id) => {
    try {
      await del(ENDPOINTS.USERS.DELETE(id))
      return true
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  },

  // حظر مستخدم
  blockUser: async (id) => {
    try {
      const response = await post(ENDPOINTS.USERS.BLOCK(id))
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.user) return response.user
        if (response.data) return response.data
        return response
      }
      return response
    } catch (error) {
      console.error(`Error blocking user ${id}:`, error)
      throw error
    }
  },

  // إلغاء حظر مستخدم
  unblockUser: async (id) => {
    try {
      const response = await post(ENDPOINTS.USERS.UNBLOCK(id))
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.user) return response.user
        if (response.data) return response.data
        return response
      }
      return response
    } catch (error) {
      console.error(`Error unblocking user ${id}:`, error)
      throw error
    }
  },

  // ✅ تخصيص دور للمستخدم (RBAC Role Assignment)
  assignRole: async (userId, role) => {
    try {
      const response = await post(ENDPOINTS.USERS.ASSIGN_ROLE, { userId, role })
      return response
    } catch (error) {
      console.error(`Error assigning role ${role} to user ${userId}:`, error)
      throw error
    }
  },

  // ✅ مزامنة وحفظ إعدادات مصفوفة الصلاحيات (RBAC Matrix Sync)
  saveRbacMatrix: async (rolesMatrix) => {
    try {
      const response = await post('/api/v1/settings/rbac-matrix', { matrix: rolesMatrix })
      return response
    } catch (error) {
      console.warn('Backend endpoint for RBAC matrix sync not available or offline, relying on localized state:', error.message)
      return false
    }
  },

  // تغيير كلمة المرور
  changePassword: async (id, passwordData) => {
    try {
      const response = await post(ENDPOINTS.USERS.CHANGE_PASSWORD(id), passwordData)
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.user) return response.user
        if (response.data) return response.data
        return response
      }
      return response
    } catch (error) {
      console.error(`Error changing password for user ${id}:`, error)
      throw error
    }
  },

  // إعادة تعيين كلمة المرور (للمدير)
  resetPassword: async (id, newPassword) => {
    try {
      const response = await post(ENDPOINTS.USERS.RESET_PASSWORD(id), { newPassword })
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.user) return response.user
        if (response.data) return response.data
        return response
      }
      return response
    } catch (error) {
      console.error(`Error resetting password for user ${id}:`, error)
      throw error
    }
  },

  // مزامنة المستخدمين (للحفظ الجماعي)
  syncUsers: async (users) => {
    try {
      const response = await post('/users/sync', { users })
      
      // ✅ معالجة الاستجابة
      if (response && typeof response === 'object') {
        if (response.users) return response.users
        if (response.data) return response.data
        return response
      }
      return response
    } catch (error) {
      console.error('Error syncing users:', error)
      throw error
    }
  },

  // ✅ دالة مساعدة للحصول على المستخدم الحالي من localStorage
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('mcsos_user')
      if (userData) {
        return JSON.parse(userData)
      }
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // ✅ دالة مساعدة لتحديث المستخدم الحالي في localStorage
  updateCurrentUser: (userData) => {
    try {
      localStorage.setItem('mcsos_user', JSON.stringify(userData))
      return true
    } catch (error) {
      console.error('Error updating current user:', error)
      return false
    }
  }
}