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
      toast.error(t('reception.required_fields'))
      return
    }
    const patientId = 'P' + Math.floor(Math.random() * 10000)
    toast.success(`${form.name} ${t('reception.registered_success')} ID: ${patientId}`)
    setForm({ name: '', phone: '', email: '', idNumber: '' })
  }

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-5 border dark:border-gray-700 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
        <UserPlus className="text-blue-600 dark:text-blue-400" /> {t('reception.new_patient')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('reception.name')} *</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              required
              placeholder={t('reception.name')}
              className="pl-10 w-full border dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-300 dark:text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('reception.phone')} *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="tel"
              required
              placeholder="+20 100 123 4567"
              className="pl-10 w-full border dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-300 dark:text-white"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('reception.email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="patient@example.com"
              className="pl-10 w-full border dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-300 dark:text-white"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('reception.national_id')}</label>
          <div className="relative">
            <IdCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('reception.national_id')}
              className="pl-10 w-full border dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-dark-300 dark:text-white"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('reception.register')}
        </button>
      </form>
    </div>
  )
}
