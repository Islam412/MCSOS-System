// src/components/finance/FinanceManager.jsx
import { useState, useEffect } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  DollarSign, CreditCard, FileText, TrendingUp, Clock, CheckCircle, 
  XCircle, Download, Printer, Users, Calendar, Plus, Trash2, Edit, X, Save
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { invoicesService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفتاح التخزين في localStorage ==========
const STORAGE_KEYS = {
  INVOICES: 'mcsos_invoices_v2'
}

// ========== دالة مساعدة للوصول إلى localStorage ==========
const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key}:`, error)
    return null
  }
}

export default function FinanceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    patientName: '',
    amount: '',
    packageName: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending'
  })

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadTransactions()
  }, [])

  // ========== تحميل المعاملات من localStorage ==========
  const loadLocalTransactions = () => {
    const saved = getLocalData(STORAGE_KEYS.INVOICES)
    if (saved && saved.length > 0) {
      setTransactions(saved)
    } else {
      // بيانات افتراضية
      const defaultTransactions = [
        { id: 1, patientNameAr: 'أحمد محمد', patientNameEn: 'Ahmed Mohamed', patientNameFr: 'Ahmed Mohamed', amount: 500, status: 'paid', date: '2024-01-15', packageAr: 'باقة أساسية', packageEn: 'Basic Package', packageFr: 'Forfait Basique' },
        { id: 2, patientNameAr: 'سارة حسن', patientNameEn: 'Sara Hassan', patientNameFr: 'Sara Hassan', amount: 900, status: 'paid', date: '2024-01-14', packageAr: 'باقة متقدمة', packageEn: 'Advanced Package', packageFr: 'Forfait Avancé' },
        { id: 3, patientNameAr: 'محمود علي', patientNameEn: 'Mahmoud Ali', patientNameFr: 'Mahmoud Ali', amount: 500, status: 'pending', date: '2024-01-13', packageAr: 'باقة أساسية', packageEn: 'Basic Package', packageFr: 'Forfait Basique' },
        { id: 4, patientNameAr: 'نورة عبدالله', patientNameEn: 'Noura Abdullah', patientNameFr: 'Noura Abdullah', amount: 1500, status: 'paid', date: '2024-01-12', packageAr: 'باقة شاملة', packageEn: 'Comprehensive Package', packageFr: 'Forfait Complet' },
        { id: 5, patientNameAr: 'عمر خالد', patientNameEn: 'Omar Khaled', patientNameFr: 'Omar Khaled', amount: 900, status: 'pending', date: '2024-01-11', packageAr: 'باقة متقدمة', packageEn: 'Advanced Package', packageFr: 'Forfait Avancé' },
      ]
      setTransactions(defaultTransactions)
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(defaultTransactions))
    }
  }

  // ========== دالة تحميل البيانات المتكاملة ==========
  const loadTransactions = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => invoicesService.getInvoices(),
            'invoices',
            getLocalData(STORAGE_KEYS.INVOICES)
          )

          // التحقق من هيكل الاستجابة
          let data = []
          if (response && response.invoices) {
            data = response.invoices
          } else if (response && Array.isArray(response)) {
            data = response
          } else {
            loadLocalTransactions()
            return
          }

          // تنسيق البيانات لتتناسب مع الهيكل المطلوب
          const formattedData = data.map(item => ({
            id: item.id || Date.now(),
            patientNameAr: item.patientName || item.patientNameAr || 'مريض',
            patientNameEn: item.patientNameEn || item.patientName || 'Patient',
            patientNameFr: item.patientNameFr || item.patientName || 'Patient',
            amount: item.amount || 0,
            status: item.status || 'pending',
            date: item.date || new Date().toISOString().split('T')[0],
            packageAr: item.packageAr || item.packageName || 'باقة',
            packageEn: item.packageEn || item.packageName || 'Package',
            packageFr: item.packageFr || item.packageName || 'Forfait',
            _syncPending: item._syncPending || false
          }))

          setTransactions(formattedData)
          localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(formattedData))
        } catch (apiError) {
          console.warn('API request failed, falling back to local data:', apiError)
          loadLocalTransactions()
        }
      } else {
        // وضع غير متصل - استخدام البيانات المحلية
        loadLocalTransactions()
      }
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError(err.message)
      toast.error('حدث خطأ في تحميل المعاملات')
      loadLocalTransactions()
    } finally {
      setLoading(false)
    }
  }

  // ========== حفظ المعاملات (محلي + API) ==========
  const saveTransactions = async (newTransactions) => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(newTransactions))
    setTransactions(newTransactions)

    // محاولة المزامنة مع الخادم إذا كان متصلاً
    if (isOnline) {
      try {
        // مزامنة كل معاملة معلقة
        const pendingItems = newTransactions.filter(item => item._syncPending)
        for (const item of pendingItems) {
          await invoicesService.createInvoice(item)
        }
        // إزالة علامة المعلقة بعد المزامنة
        const syncedItems = newTransactions.map(item => ({
          ...item,
          _syncPending: false
        }))
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(syncedItems))
        setTransactions(syncedItems)
      } catch (error) {
        console.warn('Failed to sync invoices with server:', error)
      }
    }

    window.dispatchEvent(new Event('invoicesUpdated'))
  }

  // ========== إضافة معاملة جديدة ==========
  const handleAddTransaction = async () => {
    if (!newTransaction.patientName || !newTransaction.amount) {
      toast.error('الرجاء إدخال اسم المريض والمبلغ')
      return
    }

    setIsSubmitting(true)
    try {
      const transactionData = {
        patientName: newTransaction.patientName,
        amount: parseFloat(newTransaction.amount),
        packageName: newTransaction.packageName || 'باقة',
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        status: newTransaction.status || 'pending'
      }

      let newItem

      if (isOnline) {
        try {
          const response = await invoicesService.createInvoice(transactionData)
          newItem = {
            id: response.id || Date.now(),
            patientNameAr: response.patientName || transactionData.patientName,
            patientNameEn: response.patientName || transactionData.patientName,
            patientNameFr: response.patientName || transactionData.patientName,
            amount: response.amount || transactionData.amount,
            status: response.status || 'pending',
            date: response.date || transactionData.date,
            packageAr: response.packageName || transactionData.packageName,
            packageEn: response.packageName || transactionData.packageName,
            packageFr: response.packageName || transactionData.packageName,
            _syncPending: false
          }
        } catch (apiError) {
          console.warn('API create failed, saving locally:', apiError)
          newItem = {
            ...transactionData,
            id: Date.now(),
            patientNameAr: transactionData.patientName,
            patientNameEn: transactionData.patientName,
            patientNameFr: transactionData.patientName,
            packageAr: transactionData.packageName,
            packageEn: transactionData.packageName,
            packageFr: transactionData.packageName,
            _syncPending: true
          }
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        // وضع غير متصل
        newItem = {
          ...transactionData,
          id: Date.now(),
          patientNameAr: transactionData.patientName,
          patientNameEn: transactionData.patientName,
          patientNameFr: transactionData.patientName,
          packageAr: transactionData.packageName,
          packageEn: transactionData.packageName,
          packageFr: transactionData.packageName,
          _syncPending: true
        }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      const updated = [newItem, ...transactions]
      await saveTransactions(updated)
      toast.success('تم إضافة المعاملة بنجاح')
      setShowAddModal(false)
      setNewTransaction({
        patientName: '',
        amount: '',
        packageName: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      })
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إضافة المعاملة')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== تحديث حالة الدفع ==========
  const handleMarkAsPaid = async (id) => {
    try {
      if (isOnline) {
        try {
          await invoicesService.markAsPaid(id)
        } catch (apiError) {
          console.warn('API mark as paid failed, updating locally:', apiError)
        }
      }

      const updated = transactions.map(t =>
        t.id === id ? { ...t, status: 'paid', _syncPending: !isOnline } : t
      )
      await saveTransactions(updated)
      toast.success(t('finance.payment_success'))
    } catch (error) {
      toast.error('حدث خطأ في تحديث حالة الدفع')
    }
  }

  // ========== حذف معاملة ==========
  const handleDeleteTransaction = async (id) => {
    if (!(await confirmAlert({ title: 'تأكيد', text: 'هل أنت متأكد من حذف هذه المعاملة؟' }))) return

    try {
      if (isOnline) {
        try {
          await invoicesService.deleteInvoice(id)
        } catch (apiError) {
          console.warn('API delete failed, removing locally:', apiError)
        }
      }

      const updated = transactions.filter(t => t.id !== id)
      await saveTransactions(updated)
      toast.success('تم حذف المعاملة')
    } catch (error) {
      toast.error('حدث خطأ في حذف المعاملة')
    }
  }

  // ========== عرض تفاصيل الفاتورة ==========
  const handleViewInvoice = (transaction) => {
    setSelectedTransaction(transaction)
    setShowInvoiceModal(true)
  }

  // ========== طباعة الفاتورة ==========
  const handlePrintInvoice = () => {
    window.print()
    toast.success(t('finance.printing'))
  }

  // ========== تصدير التقرير ==========
  const handleExportReport = async () => {
    try {
      let dataToExport = transactions
      if (isOnline) {
        try {
          const response = await invoicesService.getInvoices({ all: true })
          if (response && response.invoices) {
            dataToExport = response.invoices
          }
        } catch (apiError) {
          console.warn('API export failed, using local data:', apiError)
        }
      }

      const reportData = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([reportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance_report_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('finance.exporting'))
    } catch (error) {
      toast.error('حدث خطأ في تصدير التقرير')
    }
  }

  // ========== دوال مساعدة ==========
  const getPatientName = (transaction) => {
    const lang = i18n.language
    if (lang === 'ar') return transaction.patientNameAr || transaction.patientName
    if (lang === 'fr') return transaction.patientNameFr || transaction.patientName
    return transaction.patientNameEn || transaction.patientName
  }

  const getPackageName = (transaction) => {
    const lang = i18n.language
    if (lang === 'ar') return transaction.packageAr || transaction.packageName
    if (lang === 'fr') return transaction.packageFr || transaction.packageName
    return transaction.packageEn || transaction.packageName
  }

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="flex items-center gap-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-full text-xs border border-green-200 dark:border-green-500/30 w-fit">
          <CheckCircle size={12} /> {t('finance.paid')}
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1 text-amber-700 dark:text-yellow-400 bg-amber-100 dark:bg-yellow-500/20 px-2 py-1 rounded-full text-xs border border-amber-200 dark:border-yellow-500/30 w-fit">
        <Clock size={12} /> {t('finance.pending_payments')}
      </span>
    )
  }

  // ========== حساب الإحصائيات ==========
  const stats = {
    totalRevenue: transactions.reduce((sum, t) => sum + (t.status === 'paid' ? (t.amount || 0) : 0), 0),
    pendingAmount: transactions.reduce((sum, t) => sum + (t.status === 'pending' ? (t.amount || 0) : 0), 0),
    totalTransactions: transactions.length,
    paidCount: transactions.filter(t => t.status === 'paid').length,
    paymentRate: transactions.length > 0 
      ? Math.round((transactions.filter(t => t.status === 'paid').length / transactions.length) * 100) 
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header مع حالة الاتصال */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="animate-slide-left">
          <h1 className="text-3xl font-bold gradient-text">{t('finance.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('finance.subtitle')}
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={isSubmitting}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-green-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            إضافة معاملة
          </button>
          <button 
            onClick={handleExportReport}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-blue-500/30 hover:scale-105"
          >
            <Download size={18} />
            {t('finance.export_report')}
          </button>
          <button 
            onClick={loadTransactions}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-purple-500/30 hover:scale-105"
          >
            <Download size={18} />
            تحديث
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500/20 dark:to-blue-600/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 shadow-lg shadow-blue-500/20 dark:shadow-none card-glow animate-fade-up delay-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 dark:bg-blue-500/20 rounded-xl"><DollarSign className="text-white dark:text-blue-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">${stats.totalRevenue}</div><div className="text-sm text-blue-100 dark:text-gray-400">{t('finance.total_revenue')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-yellow-500/20 dark:to-yellow-600/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/30 shadow-lg shadow-amber-500/20 dark:shadow-none card-glow animate-fade-up delay-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 dark:bg-yellow-500/20 rounded-xl"><Clock className="text-white dark:text-yellow-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">${stats.pendingAmount}</div><div className="text-sm text-amber-100 dark:text-gray-400">{t('finance.pending_payments')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-500/20 dark:to-purple-600/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30 shadow-lg shadow-purple-500/20 dark:shadow-none card-glow animate-fade-up delay-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 dark:bg-purple-500/20 rounded-xl"><CreditCard className="text-white dark:text-purple-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.totalTransactions}</div><div className="text-sm text-purple-100 dark:text-gray-400">{t('finance.total_transactions')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-500/20 dark:to-green-600/20 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30 shadow-lg shadow-green-500/20 dark:shadow-none card-glow animate-fade-up delay-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 dark:bg-green-500/20 rounded-xl"><TrendingUp className="text-white dark:text-green-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.paymentRate}%</div><div className="text-sm text-green-100 dark:text-gray-400">{t('finance.payment_rate')}</div></div>
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 card-glow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('finance.recent_transactions')}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {transactions.filter(t => t._syncPending).length > 0 && (
              <span className="text-yellow-400">⏳ {transactions.filter(t => t._syncPending).length} في انتظار المزامنة</span>
            )}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('reception.patient_details')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('packages.title')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('finance.amount')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('reception.date')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('status.active')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد معاملات
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, idx) => {
                  const isPending = transaction._syncPending === true
                  return (
                    <tr key={transaction.id} className="table-row-glow hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors animate-fade-up delay-{idx * 50}">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {getPatientName(transaction)}
                          {isPending && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                              ⏳ مزامنة
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">ID: {transaction.id}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getPackageName(transaction)}</td>
                      <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">${transaction.amount}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{transaction.date}</td>
                      <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewInvoice(transaction)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-all icon-glow"
                            title="عرض الفاتورة"
                          >
                            <FileText size={18} />
                          </button>
                          {transaction.status === 'pending' && (
                            <button
                              onClick={() => handleMarkAsPaid(transaction.id)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition-all icon-glow"
                              title="تحديد كمدفوع"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-all icon-glow"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* ========== Invoice Modal ========== */}
      {showInvoiceModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <FileText size={48} className="mx-auto text-blue-500 dark:text-blue-400 mb-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('finance.invoice')}</h2>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-3 border-t border-b border-gray-200 dark:border-gray-700 py-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('reception.patient_details')}:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{getPatientName(selectedTransaction)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('packages.title')}:</span>
                <span className="text-gray-700 dark:text-gray-300">{getPackageName(selectedTransaction)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('finance.amount')}:</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">${selectedTransaction.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('reception.date')}:</span>
                <span className="text-gray-700 dark:text-gray-300">{selectedTransaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('status.active')}:</span>
                <span>{getStatusBadge(selectedTransaction.status)}</span>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePrintInvoice}
                className="flex-1 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-2 rounded-lg hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                {t('finance.print')}
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Add Transaction Modal ========== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">إضافة معاملة جديدة</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المريض *</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل اسم المريض"
                  value={newTransaction.patientName}
                  onChange={(e) => setNewTransaction({...newTransaction, patientName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المبلغ *</label>
                <input
                  type="number"
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل المبلغ"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الباقة</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل اسم الباقة"
                  value={newTransaction.packageName}
                  onChange={(e) => setNewTransaction({...newTransaction, packageName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ</label>
                <input
                  type="date"
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
                <select
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={newTransaction.status}
                  onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value})}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="paid">مدفوع</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTransaction}
                disabled={isSubmitting}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'جاري الإضافة...' : <><Plus size={16} /> إضافة</>}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}