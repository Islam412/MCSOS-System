// src/services/api/services/whatsappService.js

import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

export const whatsappService = {
  // ========== جهات الاتصال ==========
  getContacts: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.CONTACTS)
      return response
    } catch (error) {
      console.error('❌ getContacts error:', error)
      throw error
    }
  },

  // ========== القوالب ==========
  getTemplates: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.TEMPLATES)
      return response
    } catch (error) {
      console.error('❌ getTemplates error:', error)
      throw error
    }
  },

  // ========== التدفقات الآلية ==========
  getFlows: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.FLOWS)
      return response
    } catch (error) {
      console.error('❌ getFlows error:', error)
      throw error
    }
  },

  updateFlow: async (id, flowData) => {
    try {
      const response = await put(`${ENDPOINTS.WHATSAPP.FLOWS}/${id}`, flowData)
      return response
    } catch (error) {
      console.error('❌ updateFlow error:', error)
      throw error
    }
  },

  // ========== سجل الرسائل ==========
  getHistory: async () => {
    try {
      const response = await get(ENDPOINTS.WHATSAPP.HISTORY)
      return response
    } catch (error) {
      console.error('❌ getHistory error:', error)
      throw error
    }
  },

  // ========== إرسال رسالة ==========
  sendMessage: async (messageData) => {
    try {
      const response = await post(ENDPOINTS.WHATSAPP.SEND, messageData)
      return response
    } catch (error) {
      console.error('❌ sendMessage error:', error)
      throw error
    }
  },

  // ========== جدولة رسالة ==========
  scheduleMessage: async (scheduleData) => {
    try {
      const response = await post(ENDPOINTS.WHATSAPP.SCHEDULE, scheduleData)
      return response
    } catch (error) {
      console.error('❌ scheduleMessage error:', error)
      throw error
    }
  },

  // ========== إنشاء قالب جديد ==========
  createTemplate: async (templateData) => {
    try {
      const response = await post(ENDPOINTS.WHATSAPP.TEMPLATES, templateData)
      return response
    } catch (error) {
      console.error('❌ createTemplate error:', error)
      throw error
    }
  },

  // ========== إنشاء تدفق آلي جديد ==========
  createFlow: async (flowData) => {
    try {
      const response = await post(ENDPOINTS.WHATSAPP.FLOWS, flowData)
      return response
    } catch (error) {
      console.error('❌ createFlow error:', error)
      throw error
    }
  },

  // ========== حذف قالب ==========
  deleteTemplate: async (id) => {
    try {
      await del(`${ENDPOINTS.WHATSAPP.TEMPLATES}/${id}`)
      return true
    } catch (error) {
      console.error('❌ deleteTemplate error:', error)
      throw error
    }
  },

  // ========== حذف تدفق ==========
  deleteFlow: async (id) => {
    try {
      await del(`${ENDPOINTS.WHATSAPP.FLOWS}/${id}`)
      return true
    } catch (error) {
      console.error('❌ deleteFlow error:', error)
      throw error
    }
  }
}