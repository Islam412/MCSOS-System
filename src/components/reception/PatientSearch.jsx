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
      throw error
    }
  },

  // الحصول على مريض محدد
  getPatient: async (id) => {
    try {
      const response = await get(`${ENDPOINTS.PATIENTS.LIST}/${id}`)
      return response.patient
    } catch (error) {
      throw error
    }
  },

  // إنشاء مريض جديد
  createPatient: async (patientData) => {
    try {
      const response = await post(ENDPOINTS.PATIENTS.CREATE, patientData)
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث بيانات مريض
  updatePatient: async (id, patientData) => {
    try {
      const response = await put(ENDPOINTS.PATIENTS.UPDATE(id), patientData)
      return response
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

  // ========== البحث عن مرضى ==========
  searchPatients: async (query) => {
    try {
      const response = await get(`${ENDPOINTS.PATIENTS.SEARCH}?q=${encodeURIComponent(query)}`)
      return response.patients || []
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

  // مزامنة المرضى (للحفظ الجماعي)
  syncPatients: async (patients) => {
    try {
      const response = await post('/patients/sync', { patients })
      return response
    } catch (error) {
      throw error
    }
  },
}