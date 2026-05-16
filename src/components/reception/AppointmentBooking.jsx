import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, UserCheck, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AppointmentBooking({ patient }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const doctors = [
    { value: 'dr_ahmed', nameAr: 'د. أحمد علي (جراحة العظام)', nameEn: 'Dr. Ahmed Ali (Orthopedic)', nameFr: 'Dr. Ahmed Ali (Orthopédie)' },
    { value: 'dr_mona', nameAr: 'د. منى حسن (علاج طبيعي)', nameEn: 'Dr. Mona Hassan (Physical Therapy)', nameFr: 'Dr. Mona Hassan (Physiothérapie)' },
    { value: 'dr_khaled', nameAr: 'د. خالد محمود (أعصاب)', nameEn: 'Dr. Khaled Mahmoud (Neurology)', nameFr: 'Dr. Khaled Mahmoud (Neurologie)' },
  ]

  if (!patient) return null

  const getDoctorName = (doctorObj) => {
    const lang = i18n.language
    if (lang === 'ar') return doctorObj.nameAr
    if (lang === 'fr') return doctorObj.nameFr
    return doctorObj.nameEn
  }

  const handleBooking = () => {
    if (!doctor || !date || !time) {
      toast.error(t('reception.required_fields'))
      return
    }
    const selectedDoctor = doctors.find(d => d.value === doctor)
    toast.success(`${t('messages.booking_confirmed')} ${patient.name} ${t('common.with')} ${getDoctorName(selectedDoctor)} ${t('common.on')} ${date} ${t('common.at')} ${time}`)
    setDoctor('')
    setDate('')
    setTime('')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 mt-6">
      <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
          <UserCheck className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('reception.appointment')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('reception.patient_details')}: {patient.name}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.select_doctor')}
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Stethoscope className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <select
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all appearance-none`}
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
            >
              <option value="">{t('reception.select_doctor')}</option>
              {doctors.map(doc => (
                <option key={doc.value} value={doc.value}>{getDoctorName(doc)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.date')}
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="date"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.time')}
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Clock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="time"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleBooking}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
        >
          <Calendar size={18} />
          {t('reception.book')}
        </button>
      </div>
    </div>
  )
}
