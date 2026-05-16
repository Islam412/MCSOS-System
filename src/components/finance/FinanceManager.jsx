import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign, CreditCard, FileText, TrendingUp, Clock, CheckCircle, XCircle, Download, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FinanceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [transactions, setTransactions] = useState([
    { id: 1, patientName: 'أحمد محمد', amount: 500, status: 'paid', date: '2024-01-15', package: 'باقة أساسية' },
    { id: 2, patientName: 'سارة حسن', amount: 900, status: 'paid', date: '2024-01-14', package: 'باقة متقدمة' },
    { id: 3, patientName: 'محمود علي', amount: 500, status: 'pending', date: '2024-01-13', package: 'باقة أساسية' },
    { id: 4, patientName: 'نورة عبدالله', amount: 1500, status: 'paid', date: '2024-01-12', package: 'باقة شاملة' },
    { id: 5, patientName: 'عمر خالد', amount: 900, status: 'pending', date: '2024-01-11', package: 'باقة متقدمة' },
  ])
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  
  const stats = {
    totalRevenue: transactions.reduce((sum, t) => sum + (t.status === 'paid' ? t.amount : 0), 0),
    pendingAmount: transactions.reduce((sum, t) => sum + (t.status === 'pending' ? t.amount : 0), 0),
    totalTransactions: transactions.length,
    paidCount: transactions.filter(t => t.status === 'paid').length
  }
  
  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs"><CheckCircle size={12} /> {t('finance.paid')}</span>
    }
    return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs"><Clock size={12} /> {t('finance.pending_payments')}</span>
  }
  
  const handleViewInvoice = (transaction) => {
    setSelectedTransaction(transaction)
    setShowInvoiceModal(true)
  }
  
  const handlePrintInvoice = () => {
    window.print()
    toast.success(t('finance.printing'))
  }
  
  const handleMarkAsPaid = (id) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, status: 'paid' } : t
    ))
    toast.success(t('finance.payment_success'))
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {t('finance.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('finance.subtitle')}</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-2">
          <Download size={18} />
          {t('finance.export_report')}
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <DollarSign size={32} />
            <span className="text-2xl font-bold">${stats.totalRevenue}</span>
          </div>
          <p className="mt-2 opacity-90">{t('finance.total_revenue')}</p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Clock size={32} />
            <span className="text-2xl font-bold">${stats.pendingAmount}</span>
          </div>
          <p className="mt-2 opacity-90">{t('finance.pending_payments')}</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <CreditCard size={32} />
            <span className="text-2xl font-bold">{stats.totalTransactions}</span>
          </div>
          <p className="mt-2 opacity-90">{t('finance.total_transactions')}</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <TrendingUp size={32} />
            <span className="text-2xl font-bold">{Math.round((stats.paidCount / stats.totalTransactions) * 100)}%</span>
          </div>
          <p className="mt-2 opacity-90">{t('finance.payment_rate')}</p>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">{t('finance.recent_transactions')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm font-semibold">{t('reception.patient_details')}</th>
                <th className="px-6 py-3 text-sm font-semibold">{t('packages.title')}</th>
                <th className="px-6 py-3 text-sm font-semibold">{t('finance.amount')}</th>
                <th className="px-6 py-3 text-sm font-semibold">{t('reception.date')}</th>
                <th className="px-6 py-3 text-sm font-semibold">{t('status.active')}</th>
                <th className="px-6 py-3 text-sm font-semibold">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 font-medium">{transaction.patientName}</td>
                  <td className="px-6 py-4">{transaction.package}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">${transaction.amount}</td>
                  <td className="px-6 py-4 text-gray-500">{transaction.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInvoice(transaction)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <FileText size={18} />
                      </button>
                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(transaction.id)}
                          className="p-1 text-green-500 hover:bg-green-50 rounded-lg transition"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <FileText size={48} className="mx-auto text-blue-500 mb-2" />
              <h2 className="text-xl font-bold">{t('finance.invoice')}</h2>
            </div>
            
            <div className="space-y-3 border-t border-b py-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('reception.patient_details')}:</span>
                <span className="font-semibold">{selectedTransaction.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('packages.title')}:</span>
                <span>{selectedTransaction.package}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('finance.amount')}:</span>
                <span className="text-xl font-bold text-green-600">${selectedTransaction.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('reception.date')}:</span>
                <span>{selectedTransaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('status.active')}:</span>
                <span>{getStatusBadge(selectedTransaction.status)}</span>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePrintInvoice}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                {t('finance.print')}
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400"
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
