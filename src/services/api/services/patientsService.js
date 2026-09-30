// src/services/api/services/patientsService.js

import { API_CONFIG, ENDPOINTS } from '../config'
import { get, post, put, del, getToken } from '../client'

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
      console.error('❌ getPatients error:', error)
      throw error
    }
  },

  // الحصول على مريض محدد
  getPatient: async (id) => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.GET(id))
      return response.patient || response.data || response
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

  // إكمال تقييم مريض
  completeAssessment: async (id) => {
    try {
      const response = await put(`${ENDPOINTS.PATIENTS.UPDATE(id)}/complete-assessment`)
      return response
    } catch (error) {
      console.error('❌ completeAssessment error:', error)
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
      const response = await get(`${ENDPOINTS.PATIENTS.LIST}?search=${encodeURIComponent(query)}&limit=20`)
      return response.data || response.patients || (Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('❌ searchPatients error:', error)
      throw error
    }
  },

  getPatientSessions: async (id) => {
    try {
      const response = await get(ENDPOINTS.SESSIONS.BY_PATIENT(id))
      return response.sessions || response.data || (Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('❌ getPatientSessions error:', error)
      throw error
    }
  },

  uploadPatientImage: async (patientId, file, meta = {}) => {
    const kindByType = {
      national_id_front: 'national_id_front',
      national_id_back: 'national_id_back',
      id_front: 'national_id_front',
      id_back: 'national_id_back',
      xray: 'report',
      report: 'report',
      prescription: 'prescription_scan',
    }
    const kind = kindByType[meta.type] || 'report'
    const mimeType = file.type || 'application/octet-stream'

    const presign = await post(ENDPOINTS.ATTACHMENTS.PRESIGN, {
      owner_type: 'patient',
      owner_id: patientId,
      kind,
      mime_type: mimeType,
      size_bytes: file.size,
    })

    const uploadPath = presign.uploadUrl || ENDPOINTS.ATTACHMENTS.LOCAL_UPLOAD
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, '')
    const uploadUrl = uploadPath.startsWith('http')
      ? uploadPath
      : `${baseUrl}/${uploadPath.replace(/^\/+/, '')}`

    const uploadHeaders = {
      ...(presign.headers || {}),
      'X-Storage-Key': presign.storageKey,
      'Content-Type': mimeType,
      Authorization: `Bearer ${getToken()}`,
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: presign.uploadMethod || 'PUT',
      headers: uploadHeaders,
      body: file,
      mode: 'cors',
      credentials: 'include',
    })

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text()
      let message = 'فشل رفع الملف'
      try {
        const parsed = JSON.parse(text)
        message = parsed.message?.ar || parsed.message?.en || parsed.message || message
      } catch {
        /* ignore */
      }
      throw new Error(message)
    }

    return post(ENDPOINTS.ATTACHMENTS.CONFIRM, {
      storage_key: presign.storageKey,
      owner_type: 'patient',
      owner_id: patientId,
      kind,
      mime_type: mimeType,
      size_bytes: file.size,
    })
  },

  getReports: async (patientId) => {
    try {
      const response = await get(ENDPOINTS.PATIENTS.REPORTS(patientId))
      const list = response?.data || response?.reports || response
      return Array.isArray(list) ? list : []
    } catch (error) {
      console.error('❌ getReports error:', error)
      return []
    }
  },

  addReport: async (patientId, reportData) => {
    try {
      const response = await post(ENDPOINTS.PATIENTS.REPORTS(patientId), {
        title: reportData.title,
        content: reportData.content || '',
        report_type: reportData.report_type || reportData.type || 'medical',
      })
      return response
    } catch (error) {
      console.error('❌ addReport error:', error)
      throw error
    }
  },

  updateReport: async (patientId, reportId, reportData) => {
    try {
      const response = await put(ENDPOINTS.PATIENTS.REPORT(patientId, reportId), {
        title: reportData.title,
        content: reportData.content,
        report_type: reportData.report_type || reportData.type,
      })
      return response
    } catch (error) {
      console.error('❌ updateReport error:', error)
      throw error
    }
  },

  deleteReport: async (patientId, reportId) => {
    try {
      await del(ENDPOINTS.PATIENTS.REPORT(patientId, reportId))
      return true
    } catch (error) {
      console.error('❌ deleteReport error:', error)
      throw error
    }
  },

  addPrescription: async (patientId, prescriptionData) => {
    try {
      const response = await post(ENDPOINTS.PRESCRIPTIONS.CREATE, {
        ...prescriptionData,
        patient_id: prescriptionData.patient_id || patientId,
      })
      return response
    } catch (error) {
      console.error('❌ addPrescription error:', error)
      throw error
    }
  }
}