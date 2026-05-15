import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Mail, Phone, User, IdCard, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientRegistration() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    idNumber: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error(t('reception.required_fields'))
      return
    }
    const patientId = 'P' + Math.floor(Math.random() * 10000)
    toast.success(`${form.name} ${t('reception.registered_success')} - ${t('reception.id')}: ${patientId}`)
    setForm({ name: '', phone: '', email: '', idNumber: '' })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
      <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <UserPlus className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('reception.new_patient')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('reception.contact_info')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.name')} <span className="text-red-500">*</span>
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              required
              placeholder={t('placeholders.enter_name')}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.phone')} <span className="text-red-500">*</span>
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="tel"
              required
              placeholder={t('placeholders.enter_phone')}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.email')}
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="email"
              placeholder={t('placeholders.enter_email')}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.national_id')}
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <IdCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              placeholder={t('placeholders.enter_id')}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          {t('reception.register')}
        </button>
      </form>
    </div>
  )
}
