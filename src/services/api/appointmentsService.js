import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

export const appointmentsService = {
  // الحصول على قائمة المواعيد
  getAppointments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.APPOINTMENTS.LIST}?${queryString}` : ENDPOINTS.APPOINTMENTS.LIST
      const response = await get(endpoint)
      return response.appointments || []
    } catch (error) {
      throw error
    }
  },

  // الحصول على موعد محدد
  getAppointment: async (id) => {
    try {
      const response = await get(`${ENDPOINTS.APPOINTMENTS.LIST}/${id}`)
      return response.appointment
    } catch (error) {
      throw error
    }
  },

  // حجز موعد جديد
  bookAppointment: async (appointmentData) => {
    try {
      const response = await post(ENDPOINTS.APPOINTMENTS.BOOK, appointmentData)
      return response.appointment
    } catch (error) {
      throw error
    }
  },

  // تحديث موعد
  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await put(ENDPOINTS.APPOINTMENTS.UPDATE(id), appointmentData)
      return response.appointment
    } catch (error) {
      throw error
    }
  },

  // حذف موعد
  deleteAppointment: async (id) => {
    try {
      await del(ENDPOINTS.APPOINTMENTS.DELETE(id))
      return true
    } catch (error) {
      throw error
    }
  },

  // تأكيد موعد
  confirmAppointment: async (id) => {
    try {
      const response = await post(ENDPOINTS.APPOINTMENTS.CONFIRM(id))
      return response.appointment
    } catch (error) {
      throw error
    }
  },

  // إلغاء موعد
  cancelAppointment: async (id, reason = '') => {
    try {
      const response = await post(ENDPOINTS.APPOINTMENTS.CANCEL(id), { reason })
      return response.appointment
    } catch (error) {
      throw error
    }
  },

  // تسجيل حضور
  checkInAppointment: async (id) => {
    try {
      const response = await post(ENDPOINTS.APPOINTMENTS.CHECK_IN(id))
      return response.appointment
    } catch (error) {
      throw error
    }
  },

  // الحصول على المواعيد المتاحة
  getAvailableSlots: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS}?${queryString}` : ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS
      const response = await get(endpoint)
      return response.slots || []
    } catch (error) {
      throw error
    }
  },

  // الحصول على مواعيد اليوم
  getTodayAppointments: async () => {
    try {
      const response = await get(ENDPOINTS.APPOINTMENTS.TODAY)
      return response.appointments || []
    } catch (error) {
      throw error
    }
  },

  // الحصول على إحصائيات المواعيد
  getAppointmentsStats: async () => {
    try {
      const response = await get(ENDPOINTS.APPOINTMENTS.STATS)
      return response
    } catch (error) {
      throw error
    }
  },
}