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
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على مستخدم محدد
  getUser: async (id) => {
    try {
      const response = await get(ENDPOINTS.USERS.GET ? ENDPOINTS.USERS.GET(id) : `/users/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // إنشاء مستخدم جديد
  createUser: async (userData) => {
    try {
      const response = await post(ENDPOINTS.USERS.CREATE, userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث بيانات مستخدم
  updateUser: async (id, userData) => {
    try {
      const response = await put(ENDPOINTS.USERS.UPDATE(id), userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // حذف مستخدم
  deleteUser: async (id) => {
    try {
      await del(ENDPOINTS.USERS.DELETE(id))
      return true
    } catch (error) {
      throw error
    }
  },

  // حظر مستخدم
  blockUser: async (id) => {
    try {
      const response = await post(ENDPOINTS.USERS.BLOCK(id))
      return response
    } catch (error) {
      throw error
    }
  },

  // إلغاء حظر مستخدم
  unblockUser: async (id) => {
    try {
      const response = await post(ENDPOINTS.USERS.UNBLOCK(id))
      return response
    } catch (error) {
      throw error
    }
  },

  // تغيير كلمة المرور
  changePassword: async (id, passwordData) => {
    try {
      const response = await post(ENDPOINTS.USERS.CHANGE_PASSWORD(id), passwordData)
      return response
    } catch (error) {
      throw error
    }
  },

  // إعادة تعيين كلمة المرور (للمدير)
  resetPassword: async (id, newPassword) => {
    try {
      const response = await post(ENDPOINTS.USERS.RESET_PASSWORD(id), { newPassword })
      return response
    } catch (error) {
      throw error
    }
  },

  // مزامنة المستخدمين (للحفظ الجماعي)
  syncUsers: async (users) => {
    try {
      const response = await post('/users/sync', { users })
      return response
    } catch (error) {
      throw error
    }
  },
}