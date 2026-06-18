// src/pages/FinanceDashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign, CreditCard, Package, FileText, Percent, TrendingUp, Loader2, RefreshCw } from 'lucide-react'

// ========== استيراد الخدمات ==========
import { invoicesService } from '../services/api'
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

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadFinanceData()
  }, [])

  const loadFinanceData = async () => {
    setLoading(true)
    try {
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

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadFinanceData()
    toast.success('تم تحديث البيانات')
  }

  // ========== تنسيق العملة ==========
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
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