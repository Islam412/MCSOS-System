// src/services/api/services/contractsService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

const CONTRACTS_BASE = '/api/v1/contracts'

export const contractsService = {
  // ============ التعاقدات ============

  // جلب جميع التعاقدات
  getContracts: async () => {
    try {
      const response = await get(CONTRACTS_BASE)
      return Array.isArray(response) ? response : (response?.data || [])
    } catch (error) {
      console.error('❌ getContracts error:', error)
      throw error
    }
  },

  // جلب التعاقدات النشطة
  getActiveContracts: async () => {
    try {
      const response = await get(`${CONTRACTS_BASE}/active`)
      return Array.isArray(response) ? response : (response?.data || [])
    } catch (error) {
      console.error('❌ getActiveContracts error:', error)
      throw error
    }
  },

  // إحصائيات التعاقدات
  getStats: async () => {
    try {
      return await get(`${CONTRACTS_BASE}/stats`)
    } catch (error) {
      console.error('❌ getContractStats error:', error)
      throw error
    }
  },

  // جلب تعاقد محدد
  getContract: async (id) => {
    try {
      return await get(`${CONTRACTS_BASE}/${id}`)
    } catch (error) {
      console.error('❌ getContract error:', error)
      throw error
    }
  },

  // إنشاء تعاقد جديد
  createContract: async (data) => {
    try {
      return await post(CONTRACTS_BASE, data)
    } catch (error) {
      console.error('❌ createContract error:', error)
      throw error
    }
  },

  // تحديث تعاقد
  updateContract: async (id, data) => {
    try {
      return await put(`${CONTRACTS_BASE}/${id}`, data)
    } catch (error) {
      console.error('❌ updateContract error:', error)
      throw error
    }
  },

  // حذف تعاقد
  deleteContract: async (id) => {
    try {
      await del(`${CONTRACTS_BASE}/${id}`)
      return true
    } catch (error) {
      console.error('❌ deleteContract error:', error)
      throw error
    }
  },

  // تسجيل دفعة تحصيل
  recordPayment: async (id, amount, notes) => {
    try {
      return await post(`${CONTRACTS_BASE}/${id}/payment`, { amount, notes })
    } catch (error) {
      console.error('❌ recordPayment error:', error)
      throw error
    }
  },

  // ============ الخطابات/الجوابات ============

  // جلب جميع الخطابات
  getAllLetters: async () => {
    try {
      const response = await get(`${CONTRACTS_BASE}/letters/all`)
      return Array.isArray(response) ? response : (response?.data || [])
    } catch (error) {
      console.error('❌ getAllLetters error:', error)
      throw error
    }
  },

  // جلب خطابات تعاقد محدد
  getLettersByContract: async (contractId) => {
    try {
      const response = await get(`${CONTRACTS_BASE}/${contractId}/letters`)
      return Array.isArray(response) ? response : (response?.data || [])
    } catch (error) {
      console.error('❌ getLettersByContract error:', error)
      throw error
    }
  },

  // إنشاء خطاب
  createLetter: async (data) => {
    try {
      return await post(`${CONTRACTS_BASE}/letters`, data)
    } catch (error) {
      console.error('❌ createLetter error:', error)
      throw error
    }
  },

  // تحديث خطاب
  updateLetter: async (id, data) => {
    try {
      return await put(`${CONTRACTS_BASE}/letters/${id}`, data)
    } catch (error) {
      console.error('❌ updateLetter error:', error)
      throw error
    }
  },

  // حذف خطاب
  deleteLetter: async (id) => {
    try {
      await del(`${CONTRACTS_BASE}/letters/${id}`)
      return true
    } catch (error) {
      console.error('❌ deleteLetter error:', error)
      throw error
    }
  },
}
