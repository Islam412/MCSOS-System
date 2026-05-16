import { useTranslation } from 'react-i18next'
import { DollarSign, CreditCard, Package, FileText, Percent, TrendingUp } from 'lucide-react'

export default function FinanceDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Stats data
  const stats = [
    { label: t('finance.total_revenue'), value: '$12,450', icon: TrendingUp, color: 'green' },
    { label: t('finance.pending_payments'), value: '$3,200', icon: CreditCard, color: 'yellow' },
    { label: t('finance.paid'), value: '85%', icon: DollarSign, color: 'blue' },
  ]

  return (
    <div className="space-y-6">
      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          {t('finance.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('finance.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
          }
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
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
            المميزات القادمة / Upcoming Features / Fonctionnalités à venir
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
