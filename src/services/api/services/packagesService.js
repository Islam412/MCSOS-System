// src/services/api/services/packagesService.js

import { ENDPOINTS } from '../config'
import { get, post, put, patch, del } from '../client'

export const packagesService = {
  // الحصول على قائمة الباقات
  getPackages: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.PACKAGES.LIST}?${queryString}` : ENDPOINTS.PACKAGES.LIST
      const response = await get(endpoint)
      return response
    } catch (error) {
      console.error('❌ getPackages error:', error)
      throw error
    }
  },

  // الحصول على باقة محددة
  getPackage: async (id) => {
    try {
      const response = await get(ENDPOINTS.PACKAGES.GET(id))
      return response
    } catch (error) {
      console.error('❌ getPackage error:', error)
      throw error
    }
  },

  // إنشاء باقة جديدة
  createPackage: async (packageData) => {
    try {
      // ✅ تحويل البيانات إلى الشكل المطلوب من الـ API
      const payload = {
        name: packageData.nameAr || packageData.name,
        description: packageData.description || '',
        price: Number(packageData.price) || 0,
        total_sessions: Number(packageData.sessions) || Number(packageData.total_sessions) || 1,
        services: packageData.services?.map(s => {
          // إذا كانت الخدمة نص، نحولها إلى كائن
          if (typeof s === 'string') {
            return { name: s, description: '' }
          }
          return s
        }) || []
      }

      const response = await post(ENDPOINTS.PACKAGES.CREATE, payload)
      return response
    } catch (error) {
      console.error('❌ createPackage error:', error)
      throw error
    }
  },

  // تحديث باقة
  updatePackage: async (id, packageData) => {
    try {
      // ✅ تحويل البيانات إلى الشكل المطلوب من الـ API
      const payload = {
        name: packageData.nameAr || packageData.name,
        description: packageData.description || '',
        price: Number(packageData.price) || 0,
        total_sessions: Number(packageData.sessions) || Number(packageData.total_sessions) || 1,
        services: packageData.services?.map(s => {
          if (typeof s === 'string') {
            return { name: s, description: '' }
          }
          return s
        }) || []
      }

      const response = await put(ENDPOINTS.PACKAGES.UPDATE(id), payload)
      return response
    } catch (error) {
      console.error('❌ updatePackage error:', error)
      throw error
    }
  },

  // تحديث حالة الباقة (تفعيل/تعطيل)
  updatePackageStatus: async (id, isActive) => {
    try {
      // ✅ بعض الـ APIs تستخدم PATCH لتحديث الحالة
      const response = await patch(ENDPOINTS.PACKAGES.UPDATE(id), { is_active: isActive })
      return response
    } catch (error) {
      console.error('❌ updatePackageStatus error:', error)
      throw error
    }
  },

  // حذف باقة
  deletePackage: async (id) => {
    try {
      await del(ENDPOINTS.PACKAGES.DELETE(id))
      return true
    } catch (error) {
      console.error('❌ deletePackage error:', error)
      throw error
    }
  },

  // مزامنة الباقات (للحفظ الجماعي)
  syncPackages: async (packages) => {
    try {
      const response = await post('/api/v1/packages/sync', { packages })
      return response
    } catch (error) {
      console.error('❌ syncPackages error:', error)
      throw error
    }
  },

  // تعيين باقة لمريض
  assignPackage: async (data) => {
    try {
      const response = await post(ENDPOINTS.PACKAGES.ASSIGN, data)
      return response
    } catch (error) {
      console.error('❌ assignPackage error:', error)
      throw error
    }
  },

  // الحصول على الجلسات المكتملة لليوم
  getCompletedFirstSessions: async () => {
    try {
      const response = await get(ENDPOINTS.PACKAGES.COMPLETED_SESSIONS)
      return response
    } catch (error) {
      console.error('❌ getCompletedFirstSessions error:', error)
      throw error
    }
  },

  // الحصول على كل باقات المرضى (للحسابات والمالية)
  getAllPatientPackages: async () => {
    try {
      const response = await get('/api/v1/patient-packages')
      return Array.isArray(response) ? response : (response?.data || [])
    } catch (error) {
      console.warn('⚠️ getAllPatientPackages failed:', error.message)
      return []
    }
  },

  // الحصول على باقات مريض محدد
  getPatientPackages: async (patientId) => {
    try {
      const response = await get(`/api/v1/patient-packages/patient/${patientId}`)
      return Array.isArray(response) ? response : (response?.data || [])
    } catch (error) {
      console.warn('⚠️ getPatientPackages failed:', error.message)
      return []
    }
  }
}