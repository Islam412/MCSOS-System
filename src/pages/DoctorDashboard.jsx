import { useTranslation } from 'react-i18next'
import { Stethoscope, ClipboardList, FileText, Calendar, Users, Clock, Activity } from 'lucide-react'

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className="space-y-6">
      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          {t('doctor.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('reception.subtitle') || 'إدارة التقييمات والخطط العلاجية'}
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-white" size={28} />
            <h2 className="text-xl font-bold text-white">
              {t('doctor.coming') || 'قريباً'}
            </h2>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Activity className="text-blue-600 dark:text-blue-400" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('doctor.coming') || 'نظام التقييم والعلاج'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('doctor.description') || 'سيتم إضافة نظام التقييم والخطط العلاجية قريباً'}
          </p>
        </div>

        {/* Features Preview */}
        <div className="border-t border-gray-100 dark:border-gray-700 p-6">
          <h4 className={`font-semibold text-gray-900 dark:text-white mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'المميزات القادمة' : 'Upcoming Features'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <FileText className="text-blue-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                {t('doctor.assessment') || 'التقييم الطبي'}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <ClipboardList className="text-green-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                {t('doctor.treatment_plan') || 'خطة العلاج'}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <Calendar className="text-purple-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                {t('doctor.sessions') || 'الجلسات'}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <Users className="text-orange-500" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                {t('doctor.patient_name') || 'اسم المريض'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
