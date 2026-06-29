// src/services/api/services/patientsService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

export const patientsService = {
  // الحصول على قائمة المرضى
  getPatients: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.PATIENTS.LIST}?${queryString}` : ENDPOINTS.PATIENTS.LIST
      const response = await get(endpoint)
      return response.patients || []
    } catch (error) {
      console.error('❌ getPatients error:', error)
      throw error
    }
  },

  // الحصول على مريض محدد
  getPatient: async (id) => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.GET(id))
      return response.patient
    } catch (error) {
      console.error('❌ getPatient error:', error)
      throw error
    }
  },

  // إنشاء مريض جديد
  createPatient: async (patientData) => {
    try {
      const response = await post(ENDPOINTS.PATIENTS.CREATE, patientData)
      return response
    } catch (error) {
      console.error('❌ createPatient error:', error)
      throw error
    }
  },

  // تحديث بيانات مريض
  updatePatient: async (id, patientData) => {
    try {
      const response = await put(ENDPOINTS.PATIENTS.UPDATE(id), patientData)
      return response
    } catch (error) {
      console.error('❌ updatePatient error:', error)
      throw error
    }
  },

  // حذف مريض
  deletePatient: async (id) => {
    try {
      await del(ENDPOINTS.PATIENTS.DELETE(id))
      return true
    } catch (error) {
      console.error('❌ deletePatient error:', error)
      throw error
    }
  },

  // البحث عن مرضى
  searchPatients: async (query) => {
    try {
      const response = await get(`${ENDPOINTS.PATIENTS.SEARCH}?q=${encodeURIComponent(query)}`)
      return response.patients || []
    } catch (error) {
      console.error('❌ searchPatients error:', error)
      throw error
    }
  },

  // الحصول على إحصائيات المرضى
  getPatientsStats: async () => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.STATS)
      return response
    } catch (error) {
      console.error('❌ getPatientsStats error:', error)
      throw error
    }
  },

  // الحصول على تقدم مريض
  getPatientProgress: async (id) => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.PROGRESS(id))
      return response
    } catch (error) {
      console.error('❌ getPatientProgress error:', error)
      throw error
    }
  },

  // تحديث تقدم مريض
  updatePatientProgress: async (id, progressData) => {
    try {
      const response = await put(ENDPOINTS.PATIENTS.PROGRESS(id), progressData)
      return response
    } catch (error) {
      console.error('❌ updatePatientProgress error:', error)
      throw error
    }
  },

  // الحصول على جلسات مريض
  getPatientSessions: async (id) => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.SESSIONS(id))
      return response.sessions || []
    } catch (error) {
      console.error('❌ getPatientSessions error:', error)
      throw error
    }
  },

  // إضافة جلسة لمريض
  addPatientSession: async (id, sessionData) => {
    try {
      const response = await post(ENDPOINTS.PATIENTS.SESSIONS(id), sessionData)
      return response.session
    } catch (error) {
      console.error('❌ addPatientSession error:', error)
      throw error
    }
  },

  // رفع صورة لمريض
  uploadPatientImage: async (patientId, file, metadata = {}) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key])
      })

      const response = await post(`/api/v1/patients/${patientId}/images`, formData)
      return response
    } catch (error) {
      console.error('❌ uploadPatientImage error:', error)
      throw error
    }
  },

  // إضافة تقرير لمريض
  addReport: async (patientId, reportData) => {
    try {
      const response = await post(`/api/v1/patients/${patientId}/reports`, reportData)
      return response
    } catch (error) {
      console.error('❌ addReport error:', error)
      throw error
    }
  },

  // تحديث تقرير
  updateReport: async (patientId, reportId, reportData) => {
    try {
      const response = await put(`/api/v1/patients/${patientId}/reports/${reportId}`, reportData)
      return response
    } catch (error) {
      console.error('❌ updateReport error:', error)
      throw error
    }
  },

  // حذف تقرير
  deleteReport: async (patientId, reportId) => {
    try {
      await del(`/api/v1/patients/${patientId}/reports/${reportId}`)
      return true
    } catch (error) {
      console.error('❌ deleteReport error:', error)
      throw error
    }
  },

  // إضافة روشتة لمريض
  addPrescription: async (patientId, prescriptionData) => {
    try {
      const response = await post(`/api/v1/patients/${patientId}/prescriptions`, prescriptionData)
      return response
    } catch (error) {
      console.error('❌ addPrescription error:', error)
      throw error
    }
  }
}