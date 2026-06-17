import { ENDPOINTS } from '../config'
import { get, post, put, del } from '../client'

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

  // تحديث فاتورة
  updateInvoice: async (id, invoiceData) => {
    try {
      const response = await put(ENDPOINTS.INVOICES.UPDATE(id), invoiceData)
      return response.invoice
    } catch (error) {
      throw error
    }
  },

  // حذف فاتورة
  deleteInvoice: async (id) => {
    try {
      await del(ENDPOINTS.INVOICES.DELETE(id))
      return true
    } catch (error) {
      throw error
    }
  },

  // إنشاء فاتورة تلقائياً
  generateInvoice: async (data) => {
    try {
      const response = await post(ENDPOINTS.INVOICES.GENERATE, data)
      return response.invoice
    } catch (error) {
      throw error
    }
  },

  // الحصول على PDF الفاتورة
  getInvoicePDF: async (id) => {
    try {
      const response = await get(ENDPOINTS.INVOICES.PDF(id), {
        headers: { 'Accept': 'application/pdf' }
      })
      return response
    } catch (error) {
      throw error
    }
  },

  // تحديث حالة الدفع
  markAsPaid: async (id) => {
    try {
      const response = await post(ENDPOINTS.INVOICES.MARK_PAID(id))
      return response.invoice
    } catch (error) {
      throw error
    }
  },

  // الحصول على إحصائيات الفواتير
  getInvoicesStats: async () => {
    try {
      const response = await get(ENDPOINTS.INVOICES.STATS)
      return response
    } catch (error) {
      throw error
    }
  },
}