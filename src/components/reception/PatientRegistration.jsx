// src/components/reception/PatientRegistration.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus } from 'lucide-react'
import UnifiedPatientForm from '../common/UnifiedPatientForm'

export default function PatientRegistration({ onRegistrationSuccess }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Title & Banner */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/40">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {isRTL ? 'تسجيل مريض جديد' : 'Register New Patient'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isRTL ? 'أدخل البيانات الشخصية ورقم الهاتف وصورة الهوية المعتمدة' : 'Enter patient personal data, contact, and ID documentation'}
          </p>
        </div>
      </div>

      {/* Unified Patient Form Container */}
      <UnifiedPatientForm
        variant="inline"
        showExtras={true}
        onSuccess={onRegistrationSuccess}
      />
    </div>
  )
}