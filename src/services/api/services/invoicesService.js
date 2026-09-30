import { ENDPOINTS } from '../config'
import { get, post, patch } from '../client'

export const invoicesService = {
  // الحصول على قائمة الفواتير
  getInvoices: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const endpoint = queryString ? `${ENDPOINTS.INVOICES.LIST}?${queryString}` : ENDPOINTS.INVOICES.LIST
      const response = await get(endpoint)
      return response.invoices || []
    } catch (error) {
      throw error
    }
  },

  // الحصول على فاتورة محددة
  getInvoice: async (id) => {
    try {
      const response = await get(`${ENDPOINTS.INVOICES.LIST}/${id}`)
      return response.invoice
    } catch (error) {
      throw error
    }
  },

  // إنشاء فاتورة جديدة
  createInvoice: async (invoiceData) => {
    try {
      const response = await post(ENDPOINTS.INVOICES.CREATE, invoiceData)
      return response.invoice
    } catch (error) {
      throw error
    }
  },

  markAsPaid: async (id) => {
    try {
      const response = await patch(ENDPOINTS.INVOICES.MARK_PAID(id))
      return response.invoice || response
    } catch (error) {
      throw error
    }
  },

  cancelInvoice: async (id) => {
    try {
      const response = await patch(ENDPOINTS.INVOICES.CANCEL(id))
      return response.invoice || response
    } catch (error) {
      throw error
    }
  },
}