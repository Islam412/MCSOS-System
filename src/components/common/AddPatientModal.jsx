// src/components/common/AddPatientModal.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { X, UserPlus } from 'lucide-react'
import UnifiedPatientForm from './UnifiedPatientForm'

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col my-8 text-gray-800 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <UserPlus className="text-indigo-500" size={20} />
            <span>{isRTL ? 'تسجيل مريض جديد' : 'Register New Patient'}</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Unified Form Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <UnifiedPatientForm
            variant="modal"
            onSuccess={(newPatient) => {
              if (onPatientAdded) onPatientAdded(newPatient)
              onClose()
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
