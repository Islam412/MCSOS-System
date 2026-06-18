import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

export const whatsappService = {
  // ========== جهات الاتصال ==========
  getContacts: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.CONTACTS)
      return response
    } catch (error) {
      throw error
    }
  },

  // ========== القوالب ==========
  getTemplates: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.TEMPLATES)
      return response
    } catch (error) {
      throw error
    }
  },

  // ========== التدفقات الآلية ==========
  getFlows: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.FLOWS)
      return response
    } catch (error) {
      throw error
    }
  },

  updateFlow: async (id, flowData) => {
    try {
      const response = await put(`/whatsapp/flows/${id}`, flowData)
      return response
    } catch (error) {
      throw error
    }
  },

  // ========== سجل الرسائل ==========
  getHistory: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.HISTORY)
      return response
    } catch (error) {
      throw error
    }
  },

  // ========== إرسال رسالة ==========
  sendMessage: async (messageData) => {
    try {
      const response = await post(ENDPOINTS.WHATSAPP.SEND, messageData)
      return response
    } catch (error) {
      throw error
    }
  },

  // ========== جدولة رسالة ==========
  scheduleMessage: async (scheduleData) => {
    try {
      const response = await post(ENDPOINTS.WHATSAPP.SCHEDULE, scheduleData)
      return response
    } catch (error) {
      throw error
    }
  },
}