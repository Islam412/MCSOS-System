// src/pages/FinanceDashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign, CreditCard, Package, FileText, Percent, TrendingUp, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { invoicesService, appointmentsService } from '../services/api'
import { useServices } from '../context/ServiceContext'

export default function FinanceDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    paidCount: 0,
    totalTransactions: 0,
    paymentRate: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [assessmentSessions, setAssessmentSessions] = useState([])
  const [verifyingId, setVerifyingId] = useState(null)

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadFinanceData()
  }, [])

  const loadFinanceData = async () => {
    setLoading(true)
    try {
      try {
        const sessionsRes = await appointmentsService.getDailyFollowUp(new Date().toISOString().split('T')[0], 1, 50)
        const allSessions = [
          ...(sessionsRes?.today_sessions?.pending || []),
          ...(sessionsRes?.today_sessions?.attended || []),
          ...(sessionsRes?.today_sessions?.missed || [])
        ].filter(s => s.session_type === 'ASSESSMENT')
        setAssessmentSessions(allSessions)
      } catch (e) {
        console.warn('Could not load assessment sessions for finance review:', e)
      }

      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => invoicesService.getInvoices({ limit: 10 }),
          'invoices',
          JSON.parse(localStorage.getItem('mcsos_invoices') || '[]')
        )
        
        const data = response || []
        setRecentTransactions(data.slice(0, 5))
        
        // حساب الإحصائيات
        const totalRevenue = data.reduce((sum, inv) => sum + (inv.total || 0), 0)
        const pendingPayments = data.filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'unpaid')
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
        const paidCount = data.filter(inv => inv.paymentStatus === 'paid').length
        const totalTransactions = data.length
        const paymentRate = totalTransactions > 0 ? Math.round((paidCount / totalTransactions) * 100) : 0
        
        setStats({ totalRevenue, pendingPayments, paidCount, totalTransactions, paymentRate })
        localStorage.setItem('mcsos_invoices', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_invoices')
        if (saved) {
          const data = JSON.parse(saved)
          setRecentTransactions(data.slice(0, 5))
          
          const totalRevenue = data.reduce((sum, inv) => sum + (inv.total || 0), 0)
          const pendingPayments = data.filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'unpaid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0)
          const paidCount = data.filter(inv => inv.paymentStatus === 'paid').length
          const totalTransactions = data.length
          const paymentRate = totalTransactions > 0 ? Math.round((paidCount / totalTransactions) * 100) : 0
          
          setStats({ totalRevenue, pendingPayments, paidCount, totalTransactions, paymentRate })
        }
      }
    } catch (error) {
      console.error('Error loading finance data:', error)
      toast.error('حدث خطأ في تحميل البيانات المالية')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAssessmentPayment = async (sessionId) => {
    setVerifyingId(sessionId)
    try {
      await appointmentsService.verifyPayment(sessionId, 'Finance Staff')
      toast.success(t('attendance_mgmt.payment_verified_status', 'تمت مراجعة الدفع بنجاح'))
      await loadFinanceData()
    } catch (err) {
      toast.error(err.message || 'خطأ في تأكيد الدفعة')
    } finally {
      setVerifyingId(null)
    }
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadFinanceData()
    toast.success('تم تحديث البيانات')
  }

  // ========== تنسيق العملة ==========
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // ========== حالة الدفع ==========
  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ مدفوع</span>
      case 'pending':
      case 'unpaid': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ معلق</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  // ========== بيانات العرض ==========
  const displayStats = [
    { 
      label: t('finance.total_revenue'), 
      value: formatCurrency(stats.totalRevenue), 
      icon: TrendingUp, 
      color: 'green' 
    },
    { 
      label: t('finance.pending_payments'), 
      value: formatCurrency(stats.pendingPayments), 
      icon: CreditCard, 
      color: 'yellow' 
    },
    { 
      label: t('finance.paid'), 
      value: `${stats.paymentRate}%`, 
      icon: DollarSign, 
      color: 'blue' 
    },
    { 
      label: t('finance.total_transactions'), 
      value: stats.totalTransactions, 
      icon: FileText, 
      color: 'purple' 
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">جاري تحميل البيانات المالية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {t('finance.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('finance.subtitle')}
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={refreshData}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30 transition"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          }
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-xl ${colorClasses[stat.color] || colorClasses.blue}`}>
                  <Icon size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              </div>
              <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('finance.recent_transactions')}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">المريض</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('finance.amount')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{t('status.active')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد معاملات
                  </td>
                </tr>
              ) : (
                recentTransactions.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {inv.patientName || 'مريض'}
                      {inv._syncPending && (
                        <span className="block text-xs text-yellow-400">⏳ مزامنة</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(inv.total || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {inv.invoiceDate || inv.date || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(inv.paymentStatus || inv.status || 'pending')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مراجعة واعتماد دفعة جلسات التقييم (Assessment Payment Verification) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <CreditCard className="text-amber-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {t('attendance_mgmt.assessment_payments_title', 'مراجعة واعتماد دفع جلسات التقييم')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('attendance_mgmt.payment_pending_status', 'بانتظار تأكيد الدفع من الحسابات قبل البدء بالتقييم')}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-full text-xs">
            {assessmentSessions.length} {t('attendance_mgmt.sessions', 'جلسات')}
          </span>
        </div>

        <div className="overflow-x-auto">
          {assessmentSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              {t('attendance_mgmt.no_pending_assessments', '🎉 لا توجد جلسات تقييم بانتظار اعتماد الدفع اليوم')}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs">
                  <th className="py-3 px-4 text-start">{t('placeholders.enter_name', 'المريض')}</th>
                  <th className="py-3 px-4 text-start">الوقت</th>
                  <th className="py-3 px-4 text-start">الحالة</th>
                  <th className="py-3 px-4 text-end">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {assessmentSessions.map(sess => (
                  <tr key={sess.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      {sess.patient || sess.patient_name || sess.patientName || 'مريض تقييم'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(sess.session_date).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      {sess.payment_verified ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {t('attendance_mgmt.payment_verified_status', '💳 دفعة التقييم معتمدة')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                          {t('attendance_mgmt.payment_pending_status', '⏳ بانتظار الاعتماد')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-end">
                      {!sess.payment_verified ? (
                        <button
                          onClick={() => handleVerifyAssessmentPayment(sess.id)}
                          disabled={verifyingId === sess.id}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
                        >
                          {verifyingId === sess.id ? <Loader2 className="animate-spin" size={14} /> : t('attendance_mgmt.verify_payment_btn', 'اعتماد دفعة التقييم 💳')}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          {sess.payment_verified_by || 'Finance'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <Package className="text-white" size={28} />
            <h2 className="text-xl font-bold text-white">{t('finance.description')}</h2>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <DollarSign className="text-green-600 dark:text-green-400" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('finance.coming')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('finance.description')}
          </p>
        </div>

        {/* Features Preview */}
        <div className="border-t border-gray-100 dark:border-gray-700 p-6">
          <h4 className={`font-semibold text-gray-900 dark:text-white mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            المميزات القادمة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <CreditCard className="text-blue-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">{t('finance.payments')}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <Package className="text-green-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">{t('finance.packages')}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <FileText className="text-purple-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">{t('finance.invoices')}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <Percent className="text-orange-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">{t('finance.discounts')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}