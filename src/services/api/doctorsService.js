// src/services/api/services/doctorsService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

export const doctorsService = {
  // الحصول على قائمة الأطباء
  getDoctors: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.DOCTORS.LIST}?${queryString}` : ENDPOINTS.DOCTORS.LIST
      const response = await get(endpoint)
      return response.doctors || []
    } catch (error) {
      throw error
    }
  },

  // الحصول على طبيب محدد
  getDoctor: async (id) => {
    try {
      const response = await get(`${ENDPOINTS.DOCTORS.LIST}/${id}`)
      return response.doctor
    } catch (error) {
      throw error
    }
  },

  // إنشاء طبيب جديد
  createDoctor: async (doctorData) => {
    try {
      const response = await post(ENDPOINTS.DOCTORS.CREATE, doctorData)
      return response.doctor
    } catch (error) {
      throw error
    }
  },

  // تحديث بيانات طبيب
  updateDoctor: async (id, doctorData) => {
    try {
      const response = await put(ENDPOINTS.DOCTORS.UPDATE(id), doctorData)
      return response.doctor
    } catch (error) {
      throw error
    }
  },

  // حذف طبيب
  deleteDoctor: async (id) => {
    try {
      await del(ENDPOINTS.DOCTORS.DELETE(id))
      return true
    } catch (error) {
      throw error
    }
  },

  // الحصول على المواعيد المتاحة لطبيب
  getDoctorSlots: async (doctorId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.DOCTORS.SLOTS(doctorId)}?${queryString}` : ENDPOINTS.DOCTORS.SLOTS(doctorId)
      const response = await get(endpoint)
      return response.slots || []
    } catch (error) {
      throw error
    }
  },

  // تحديث مواعيد طبيب
  updateDoctorSlots: async (doctorId, slotsData) => {
    try {
      const response = await put(ENDPOINTS.DOCTORS.SLOTS(doctorId), slotsData)
      return response.slots
    } catch (error) {
      throw error
    }
  },

  // الحصول على إحصائيات الأطباء
  getDoctorsStats: async () => {
    try {
      const response = await get(ENDPOINTS.DOCTORS.STATS)
      return response
    } catch (error) {
      throw error
    }
  },

  // الحصول على الأطباء المتاحين
  getAvailableDoctors: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.DOCTORS.AVAILABLE}?${queryString}` : ENDPOINTS.DOCTORS.AVAILABLE
      const response = await get(endpoint)
      return response.doctors || []
    } catch (error) {
      throw error
    }
  },
}