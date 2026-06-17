// src/services/api/services/packagesService.js

import { ENDPOINTS } from '../config'
import { get, post, put, patch, del } from '../client'

export const packagesService = {
  // الحصول على قائمة الباقات
  getPackages: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? ENDPOINTS.PACKAGES.LIST + '?' + queryString : ENDPOINTS.PACKAGES.LIST
      const response = await get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على باقة محددة
  getPackage: async (id) => {
    try {
      const response = await get(`/packages/${id}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // إنشاء باقة جديدة
  createPackage: async (packageData) => {
    try {
      const response = await post(ENDPOINTS.PACKAGES.CREATE, packageData)
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث باقة
  updatePackage: async (id, packageData) => {
    try {
      const response = await put(ENDPOINTS.PACKAGES.UPDATE(id), packageData)
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث حالة الباقة
  updatePackageStatus: async (id, isActive) => {
    try {
      const response = await patch(ENDPOINTS.PACKAGES.UPDATE(id), { isActive })
      return response
    } catch (error) {
      throw error
    }
  },

  // حذف باقة
  deletePackage: async (id) => {
    try {
      await del(ENDPOINTS.PACKAGES.DELETE(id))
      return true
    } catch (error) {
      throw error
    }
  },

  // مزامنة الباقات (للحفظ الجماعي)
  syncPackages: async (packages) => {
    try {
      const response = await post('/packages/sync', { packages })
      return response
    } catch (error) {
      throw error
    }
  },
}