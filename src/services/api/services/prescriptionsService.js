// src/services/api/services/prescriptionsService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

export const prescriptionsService = {
  // الحصول على قائمة الروشتات
  getPrescriptions: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? ENDPOINTS.PRESCRIPTIONS.LIST + '?' + queryString : ENDPOINTS.PRESCRIPTIONS.LIST
      const response = await get(endpoint)
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على روشتة محددة
  getPrescription: async (id) => {
    try {
      const response = await get(ENDPOINTS.PRESCRIPTIONS.GET ? ENDPOINTS.PRESCRIPTIONS.GET(id) : '/prescriptions/' + id)
      return response
    } catch (error) {
      throw error
    }
  },

  // إنشاء روشتة جديدة
  createPrescription: async (prescriptionData) => {
    try {
      const response = await post(ENDPOINTS.PRESCRIPTIONS.CREATE, prescriptionData)
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث روشتة
  updatePrescription: async (id, prescriptionData) => {
    try {
      const response = await put(ENDPOINTS.PRESCRIPTIONS.UPDATE(id), prescriptionData)
      return response
    } catch (error) {
      throw error
    }
  },

  // حذف روشتة
  deletePrescription: async (id) => {
    try {
      await del(ENDPOINTS.PRESCRIPTIONS.DELETE(id))
      return true
    } catch (error) {
      throw error
    }
  },

  // الحصول على روشتات مريض معين
  getPrescriptionsByPatient: async (patientId) => {
    try {
      const response = await get(ENDPOINTS.PRESCRIPTIONS.BY_PATIENT(patientId))
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على روشتات طبيب معين
  getPrescriptionsByDoctor: async (doctorId) => {
    try {
      const response = await get(ENDPOINTS.PRESCRIPTIONS.BY_DOCTOR(doctorId))
      return response
    } catch (error) {
      throw error
    }
  },

  // طباعة روشتة (PDF)
  printPrescription: async (id) => {
    try {
      const response = await get(ENDPOINTS.PRESCRIPTIONS.PRINT(id))
      return response
    } catch (error) {
      throw error
    }
  },

  // مزامنة الروشتات
  syncPrescriptions: async (prescriptions) => {
    try {
      const response = await post('/prescriptions/sync', { prescriptions })
      return response
    } catch (error) {
      throw error
    }
  },
}