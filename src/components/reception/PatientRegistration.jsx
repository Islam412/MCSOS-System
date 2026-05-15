import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Mail, Phone, User, IdCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientRegistration() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    idNumber: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error(t('Please fill all required fields'))
      return
    }
    const patientId = 'P' + Math.floor(Math.random() * 10000)
    toast.success(`${form.name} registered successfully! ID: ${patientId}`)
    setForm({ name: '', phone: '', email: '', idNumber: '' })
  }

  return (
    <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <UserPlus className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('reception.new_patient')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.name')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              required
              placeholder={t('reception.name')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-300 dark:text-white transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.phone')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              required
              placeholder="+20 100 123 4567"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-300 dark:text-white transition-all"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="patient@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-300 dark:text-white transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.national_id')}
          </label>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('reception.national_id')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-300 dark:text-white transition-all"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25"
        >
          {t('reception.register')}
        </button>
      </form>
    </div>
  )
}
