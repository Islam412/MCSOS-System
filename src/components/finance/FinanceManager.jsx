import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign, CreditCard, FileText, TrendingUp, Clock, CheckCircle, XCircle, Download, Printer, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FinanceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [transactions, setTransactions] = useState([
    { id: 1, patientNameAr: 'أحمد محمد', patientNameEn: 'Ahmed Mohamed', patientNameFr: 'Ahmed Mohamed', amount: 500, status: 'paid', date: '2024-01-15', packageAr: 'باقة أساسية', packageEn: 'Basic Package', packageFr: 'Forfait Basique' },
    { id: 2, patientNameAr: 'سارة حسن', patientNameEn: 'Sara Hassan', patientNameFr: 'Sara Hassan', amount: 900, status: 'paid', date: '2024-01-14', packageAr: 'باقة متقدمة', packageEn: 'Advanced Package', packageFr: 'Forfait Avancé' },
    { id: 3, patientNameAr: 'محمود علي', patientNameEn: 'Mahmoud Ali', patientNameFr: 'Mahmoud Ali', amount: 500, status: 'pending', date: '2024-01-13', packageAr: 'باقة أساسية', packageEn: 'Basic Package', packageFr: 'Forfait Basique' },
    { id: 4, patientNameAr: 'نورة عبدالله', patientNameEn: 'Noura Abdullah', patientNameFr: 'Noura Abdullah', amount: 1500, status: 'paid', date: '2024-01-12', packageAr: 'باقة شاملة', packageEn: 'Comprehensive Package', packageFr: 'Forfait Complet' },
    { id: 5, patientNameAr: 'عمر خالد', patientNameEn: 'Omar Khaled', patientNameFr: 'Omar Khaled', amount: 900, status: 'pending', date: '2024-01-11', packageAr: 'باقة متقدمة', packageEn: 'Advanced Package', packageFr: 'Forfait Avancé' },
  ])
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  
  const stats = {
    totalRevenue: transactions.reduce((sum, t) => sum + (t.status === 'paid' ? t.amount : 0), 0),
    pendingAmount: transactions.reduce((sum, t) => sum + (t.status === 'pending' ? t.amount : 0), 0),
    totalTransactions: transactions.length,
    paidCount: transactions.filter(t => t.status === 'paid').length,
    paymentRate: Math.round((transactions.filter(t => t.status === 'paid').length / transactions.length) * 100)
  }
  
  const getPatientName = (transaction) => {
    const lang = i18n.language
    if (lang === 'ar') return transaction.patientNameAr
    if (lang === 'fr') return transaction.patientNameFr
    return transaction.patientNameEn
  }
  
  const getPackageName = (transaction) => {
    const lang = i18n.language
    if (lang === 'ar') return transaction.packageAr
    if (lang === 'fr') return transaction.packageFr
    return transaction.packageEn
  }
  
  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="flex items-center gap-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-full text-xs border border-green-200 dark:border-green-500/30 w-fit"><CheckCircle size={12} /> {t('finance.paid')}</span>
    }
    return <span className="flex items-center gap-1 text-amber-700 dark:text-yellow-400 bg-amber-100 dark:bg-yellow-500/20 px-2 py-1 rounded-full text-xs border border-amber-200 dark:border-yellow-500/30 w-fit"><Clock size={12} /> {t('finance.pending_payments')}</span>
  }
  
  const handleViewInvoice = (transaction) => {
    setSelectedTransaction(transaction)
    setShowInvoiceModal(true)
  }
  
  const handlePrintInvoice = () => {
    window.print()
    toast.success(t('finance.printing'))
  }
  
  const handleExportReport = () => {
    toast.success(t('finance.exporting'))
    // محاكاة تصدير التقرير
    const reportData = JSON.stringify(transactions, null, 2)
    const blob = new Blob([reportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance_report_${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleMarkAsPaid = (id) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, status: 'paid' } : t
    ))
    toast.success(t('finance.payment_success'))
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="animate-slide-left">
          <h1 className="text-3xl font-bold gradient-text">{t('finance.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('finance.subtitle')}</p>
        </div>
        <button 
          onClick={handleExportReport}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-green-500/30 hover:scale-105"
        >
          <Download size={18} />
          {t('finance.export_report')}
        </button>
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
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('finance.recent_transactions')}</h2>
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
              {transactions.map((transaction, idx) => (
                <tr key={transaction.id} className="table-row-glow hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors animate-fade-up delay-{idx * 50}">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{getPatientName(transaction)}</div>
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
                      >
                        <FileText size={18} />
                      </button>
                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(transaction.id)}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition-all icon-glow"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                   </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
      
      {/* Invoice Modal */}
      {showInvoiceModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-4">
              <FileText size={48} className="mx-auto text-blue-500 dark:text-blue-400 mb-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('finance.invoice')}</h2>
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
    </div>
  )
}