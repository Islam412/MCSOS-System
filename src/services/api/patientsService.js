// src/services/api/services/patientsService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del, uploadFile } from '../client'

export const patientsService = {
  // الحصول على قائمة المرضى
  getPatients: async (params = {}) => {
    try {
      const queryParams = { limit: 500, ...params }
      const queryString = new URLSearchParams(queryParams).toString()
      const endpoint = `${ENDPOINTS.PATIENTS.LIST}?${queryString}`
      const response = await get(endpoint)
      return response.data || response.patients || (Array.isArray(response) ? response : [])
    } catch (error) {
      throw error
    }
  },

  // الحصول على مريض محدد
  getPatient: async (id) => {
    try {
      const response = await get(`${ENDPOINTS.PATIENTS.LIST}/${id}`)
      return response.patient || response.data || response
    } catch (error) {
      throw error
    }
  },

  // إنشاء مريض جديد
  createPatient: async (patientData) => {
    try {
      const response = await post(ENDPOINTS.PATIENTS.CREATE, patientData)
      return response.patient
    } catch (error) {
      throw error
    }
  },

  // تحديث بيانات مريض
  updatePatient: async (id, patientData) => {
    try {
      const response = await put(ENDPOINTS.PATIENTS.UPDATE(id), patientData)
      return response.patient
    } catch (error) {
      throw error
    }
  },

  // حذف مريض
  deletePatient: async (id) => {
    try {
      await del(ENDPOINTS.PATIENTS.DELETE(id))
      return true
    } catch (error) {
      throw error
    }
  },

  // البحث عن مرضى
  searchPatients: async (query) => {
    try {
      const response = await get(`${ENDPOINTS.PATIENTS.SEARCH}?q=${encodeURIComponent(query)}`)
      return response.data || response.patients || (Array.isArray(response) ? response : [])
    } catch (error) {
      throw error
    }
  },

  // الحصول على إحصائيات المرضى
  getPatientsStats: async () => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.STATS)
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على تقدم مريض
  getPatientProgress: async (id) => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.PROGRESS(id))
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث تقدم مريض
  updatePatientProgress: async (id, progressData) => {
    try {
      const response = await put(ENDPOINTS.PATIENTS.PROGRESS(id), progressData)
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على جلسات مريض
  getPatientSessions: async (id) => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.SESSIONS(id))
      return response.sessions || []
    } catch (error) {
      throw error
    }
  },

  // إضافة جلسة لمريض
  addPatientSession: async (id, sessionData) => {
    try {
      const response = await post(ENDPOINTS.PATIENTS.SESSIONS(id), sessionData)
      return response.session
    } catch (error) {
      throw error
    }
  },

  // رفع صورة لمريض
  uploadPatientImage: async (patientId, file, metadata = {}) => {
    try {
      const response = await uploadFile(ENDPOINTS.FILES.UPLOAD, file, {
        patientId,
        type: 'patient_image',
        ...metadata
      })
      return response.file
    } catch (error) {
      throw error
    }
  },

  // الحصول على ملفات المريض
  getPatientFiles: async (patientId) => {
    try {
      const response = await get(ENDPOINTS.FILES.PATIENT_FILES(patientId))
      return response.files || []
    } catch (error) {
      throw error
    }
  },

  // حذف ملف
  deleteFile: async (fileId) => {
    try {
      await del(ENDPOINTS.FILES.DELETE(fileId))
      return true
    } catch (error) {
      throw error
    }
  },
}