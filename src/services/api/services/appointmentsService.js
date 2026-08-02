// src/services/api/services/appointmentsService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del, patch } from '../client'

export const appointmentsService = {
  // ========== الحصول على قائمة المواعيد (Sessions) ==========
  getAppointments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `/api/v1/sessions?${queryString}` : '/api/v1/sessions'
      const response = await get(endpoint)
      return response.sessions || response || []
    } catch (error) {
      console.warn('⚠️ getAppointments failed:', error.message)
      return []
    }
  },

  // ========== الحصول على موعد محدد ==========
  getAppointment: async (id) => {
    try {
      const response = await get(`/api/v1/sessions/${id}`)
      return response.session || response
    } catch (error) {
      console.warn('⚠️ getAppointment failed:', error.message)
      return null
    }
  },

  // ========== حجز موعد جديد (Session) ==========
  bookAppointment: async (appointmentData) => {
    try {
      const payload = {
        patient_id: appointmentData.patientId || appointmentData.patient_id,
        doctor_id: appointmentData.doctorId || appointmentData.doctor_id,
        service_id: appointmentData.serviceId || appointmentData.service_id || '',
        slot_id: appointmentData.slotId || appointmentData.slot_id || '',
        treatment_plan_id: appointmentData.treatmentPlanId || appointmentData.treatment_plan_id || '',
        patient_package_id: appointmentData.patientPackageId || appointmentData.patient_package_id || '',
        session_type: appointmentData.sessionType || appointmentData.type || 'ASSESSMENT',
        session_date: appointmentData.date || appointmentData.session_date,
        reception_notes: appointmentData.notes || appointmentData.reception_notes || ''
      }
      const response = await post('/api/v1/sessions', payload)
      return response.session || response
    } catch (error) {
      console.warn('⚠️ bookAppointment failed:', error.message)
      throw error
    }
  },

  // ========== تحديث موعد ==========
  updateAppointment: async (id, appointmentData) => {
    try {
      const payload = {
        patient_id: appointmentData.patientId || appointmentData.patient_id,
        doctor_id: appointmentData.doctorId || appointmentData.doctor_id,
        service_id: appointmentData.serviceId || appointmentData.service_id,
        slot_id: appointmentData.slotId || appointmentData.slot_id,
        treatment_plan_id: appointmentData.treatmentPlanId || appointmentData.treatment_plan_id,
        patient_package_id: appointmentData.patientPackageId || appointmentData.patient_package_id,
        session_type: appointmentData.sessionType || appointmentData.type,
        session_date: appointmentData.date || appointmentData.session_date,
        reception_notes: appointmentData.notes || appointmentData.reception_notes,
        status: appointmentData.status,
        doctor_notes: appointmentData.doctorNotes || appointmentData.doctor_notes || '',
        absence_reason: appointmentData.absenceReason || appointmentData.absence_reason || '',
        is_deducted: appointmentData.isDeducted || appointmentData.is_deducted
      }
      const response = await put(`/api/v1/sessions/${id}`, payload)
      return response.session || response
    } catch (error) {
      console.warn('⚠️ updateAppointment failed:', error.message)
      throw error
    }
  },

  // ========== حذف موعد ==========
  deleteAppointment: async (id) => {
    try {
      await del(`/api/v1/sessions/${id}`)
      return true
    } catch (error) {
      console.warn('⚠️ deleteAppointment failed:', error.message)
      throw error
    }
  },

  // ========== تأكيد موعد ==========
  confirmAppointment: async (id) => {
    try {
      return await appointmentsService.updateAppointment(id, { status: 'CONFIRMED' })
    } catch (error) {
      console.warn('⚠️ confirmAppointment failed:', error.message)
      throw error
    }
  },

  // ========== إلغاء موعد ==========
  cancelAppointment: async (id, reason = '') => {
    try {
      return await appointmentsService.updateAppointment(id, { 
        status: 'CANCELLED',
        absence_reason: reason || 'تم الإلغاء من قبل المريض'
      })
    } catch (error) {
      console.warn('⚠️ cancelAppointment failed:', error.message)
      throw error
    }
  },

  // ========== تسجيل حضور ==========
  checkInAppointment: async (id) => {
    try {
      const response = await post(`/api/v1/sessions/${id}/check-in`)
      return response.attendance || response
    } catch (error) {
      console.warn('⚠️ checkInAppointment failed:', error.message)
      throw error
    }
  },

  // ========== تسجيل خروج ==========
  checkOutAppointment: async (id) => {
    try {
      const response = await post(`/api/v1/sessions/${id}/check-out`)
      return response.attendance || response
    } catch (error) {
      console.warn('⚠️ checkOutAppointment failed:', error.message)
      throw error
    }
  },

  // ========== تأكيد الدفعة المالية (Finance Payment Verification) ==========
  verifyPayment: async (id, verifierName = 'Finance Staff') => {
    try {
      const response = await post(`/api/v1/sessions/${id}/verify-payment`, { verifier_name: verifierName })
      return response
    } catch (error) {
      console.warn('⚠️ verifyPayment failed:', error.message)
      throw error
    }
  },

  // ========== حفظ تقرير التقييم الطبي (Evaluation Report) ==========
  updateEvaluationReport: async (id, evaluationReport) => {
    try {
      const response = await put(`/api/v1/sessions/${id}/evaluation-report`, { evaluation_report: evaluationReport })
      return response
    } catch (error) {
      console.warn('⚠️ updateEvaluationReport failed:', error.message)
      throw error
    }
  },

  // ========== الحصول على المتابعة اليومية (Daily Follow-Up) ==========
  getDailyFollowUp: async (date = '', page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      params.append('page', page)
      params.append('limit', limit)
      const response = await get(`/api/v1/sessions/daily-followup?${params.toString()}`)
      return response || null
    } catch (error) {
      console.warn('⚠️ getDailyFollowUp failed:', error.message)
      throw error
    }
  },

  // ========== تسجيل الحضور والغياب (Mark Attendance) ==========
  markAttendance: async (sessionId, attendanceData) => {
    try {
      const payload = {
        status: attendanceData.status,
        reason: attendanceData.reason || ''
      }
      const response = await post(`/api/v1/sessions/${sessionId}/attendance`, payload)
      return response.attendance || response
    } catch (error) {
      console.warn('⚠️ markAttendance failed:', error.message)
      throw error
    }
  },

  // ========== الحصول على مواعيد الكالندر (Calendar View) ==========
  getCalendarView: async (from, to, doctorId = '', roomId = '') => {
    try {
      let endpoint = `/api/v1/sessions/calendar-view?from=${from}&to=${to}`
      if (doctorId) endpoint += `&doctor_id=${doctorId}`
      if (roomId) endpoint += `&room_id=${roomId}`
      const response = await get(endpoint)
      return response || []
    } catch (error) {
      console.warn('⚠️ getCalendarView failed:', error.message)
      return []
    }
  },

  // ========== إعادة جدولة موعد (Reschedule Session / Drag & Drop) ==========
  rescheduleAppointment: async (id, sessionDateOrObj, roomIdParam = '', doctorIdParam = '') => {
    try {
      let session_date, room_id, doctor_id
      if (typeof sessionDateOrObj === 'object' && sessionDateOrObj !== null) {
        session_date = sessionDateOrObj.session_date || sessionDateOrObj.sessionDate || sessionDateOrObj.start
        room_id = sessionDateOrObj.room_id || sessionDateOrObj.roomId || roomIdParam
        doctor_id = sessionDateOrObj.doctor_id || sessionDateOrObj.doctorId || doctorIdParam
      } else {
        session_date = sessionDateOrObj
        room_id = roomIdParam
        doctor_id = doctorIdParam
      }
      const response = await put(`/api/v1/sessions/${id}/reschedule`, {
        session_date,
        room_id: room_id || undefined,
        doctor_id: doctor_id || undefined
      })
      return response.session || response
    } catch (error) {
      console.warn('⚠️ rescheduleAppointment failed:', error.message)
      throw error
    }
  },

  // ========== الحصول على المواعيد المتاحة (Scheduling) ==========
  getAvailableSlots: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `/api/v1/scheduling/availability?${queryString}` : '/api/v1/scheduling/availability'
      const response = await get(endpoint)
      return response.slots || response || []
    } catch (error) {
      console.warn('⚠️ getAvailableSlots failed:', error.message)
      return []
    }
  },

  // ========== الحصول على مواعيد اليوم ==========
  getTodayAppointments: async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await get(`/api/v1/sessions?session_date=${today}`)
      return response.sessions || response || []
    } catch (error) {
      console.warn('⚠️ getTodayAppointments failed:', error.message)
      return []
    }
  },

  // ========== الحصول على إحصائيات المواعيد ==========
  getAppointmentsStats: async () => {
    try {
      const response = await get('/api/v1/reports/daily')
      return response || {}
    } catch (error) {
      console.warn('⚠️ getAppointmentsStats failed:', error.message)
      return {
        total: 0,
        scheduled: 0,
        attended: 0,
        cancelled: 0,
        no_show: 0
      }
    }
  },

  // ========== الحصول على جلسات مريض ==========
  getAppointmentsByPatient: async (patientId) => {
    try {
      const response = await get(`/api/v1/sessions/patient/${patientId}`)
      return response.sessions || response || []
    } catch (error) {
      console.warn('⚠️ getAppointmentsByPatient failed:', error.message)
      return []
    }
  },

  // ========== إنشاء مواعيد مجمعة (Bulk Slots) ==========
  createBulkSlots: async (slotData) => {
    try {
      const payload = {
        doctor_id: slotData.doctorId || slotData.doctor_id,
        service_id: slotData.serviceId || slotData.service_id,
        pattern: slotData.pattern || [0, 2, 4],
        start_date: slotData.startDate || slotData.start_date,
        end_date: slotData.endDate || slotData.end_date,
        start_time: slotData.startTime || slotData.start_time || '09:00',
        end_time: slotData.endTime || slotData.end_time || '17:00',
        slot_duration_minutes: slotData.slotDurationMinutes || slotData.slot_duration_minutes || 30,
        capacity: slotData.capacity || 1
      }
      const response = await post('/api/v1/scheduling/slots/bulk', payload)
      return response.slots || response
    } catch (error) {
      console.warn('⚠️ createBulkSlots failed:', error.message)
      throw error
    }
  },

  // ========== إنشاء موعد فردي ==========
  createDynamicSlots: async (slotData) => {
    try {
      const payload = {
        doctor_id: slotData.doctorId || slotData.doctor_id,
        service_id: slotData.serviceId || slotData.service_id,
        start_time: slotData.startTime || slotData.start_time,
        end_time: slotData.endTime || slotData.end_time,
        capacity: slotData.capacity || 1,
        type: slotData.type || 'DYNAMIC'
      }
      const response = await post('/api/v1/scheduling/slots', payload)
      return response.slot || response
    } catch (error) {
      console.warn('⚠️ createDynamicSlots failed:', error.message)
      throw error
    }
  },

  // ========== حجز موعد من خلال Scheduling ==========
  bookSlot: async (slotId) => {
    try {
      const response = await patch(`/api/v1/scheduling/slots/${slotId}/book`)
      return response.slot || response
    } catch (error) {
      console.warn('⚠️ bookSlot failed:', error.message)
      throw error
    }
  },

  // ========== إلغاء حجز موعد ==========
  cancelBooking: async (slotId) => {
    try {
      const response = await patch(`/api/v1/scheduling/slots/${slotId}/cancel-booking`)
      return response.slot || response
    } catch (error) {
      console.warn('⚠️ cancelBooking failed:', error.message)
      throw error
    }
  },

  // ========== الحصول على مواعيد طبيب معين ==========
  getAppointmentsByDoctor: async (doctorId, date = null) => {
    try {
      let endpoint = `/api/v1/sessions?doctor_id=${doctorId}`
      if (date) {
        endpoint += `&session_date=${date}`
      }
      const response = await get(endpoint)
      return response.sessions || response || []
    } catch (error) {
      console.warn('⚠️ getAppointmentsByDoctor failed:', error.message)
      return []
    }
  },

  // ========== الحصول على مواعيد حسب التاريخ ==========
  getAppointmentsByDate: async (date) => {
    try {
      const response = await get(`/api/v1/sessions?session_date=${date}`)
      return response.sessions || response || []
    } catch (error) {
      console.warn('⚠️ getAppointmentsByDate failed:', error.message)
      return []
    }
  }
}