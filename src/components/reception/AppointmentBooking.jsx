// src/components/reception/AppointmentBooking.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, UserCheck, Stethoscope, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService, appointmentsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function AppointmentBooking({ patient, onBookingSuccess }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // ========== جلب الأطباء من API ==========
  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => doctorsService.getDoctors(),
          'doctors',
          JSON.parse(localStorage.getItem('mcsos_doctors') || '[]')
        )
        const data = response?.doctors || response || []
        setDoctors(data)
        localStorage.setItem('mcsos_doctors', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_doctors')
        setDoctors(saved ? JSON.parse(saved) : [])
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      toast.error('حدث خطأ في تحميل الأطباء')
    } finally {
      setLoading(false)
    }
  }

  // ========== جلب المواعيد المتاحة عند اختيار طبيب وتاريخ ==========
  useEffect(() => {
    if (doctor && date) {
      loadAvailableSlots()
    } else {
      setAvailableSlots([])
    }
  }, [doctor, date])

  const loadAvailableSlots = async () => {
    setLoadingSlots(true)
    setTime('')
    try {
      if (isOnline) {
        const response = await appointmentsService.getAvailableSlots({
          doctorId: doctor,
          date: date
        })
        const slots = response?.slots || []
        setAvailableSlots(slots)
      } else {
        // وضع غير متصل - استخدام بيانات تجريبية
        const demoSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
        setAvailableSlots(demoSlots.map(time => ({ time, available: true })))
      }
    } catch (error) {
      console.error('Error loading slots:', error)
      toast.error('حدث خطأ في تحميل المواعيد المتاحة')
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // ========== معالجة حجز الموعد ==========
  const handleBooking = async () => {
    if (!doctor || !date || !time) {
      toast.error(t('reception.required_fields'))
      return
    }

    const selectedDoctor = doctors.find(d => d.id == doctor)
    if (!selectedDoctor) {
      toast.error('الرجاء اختيار طبيب صحيح')
      return
    }

    setSubmitting(true)
    try {
      const bookingData = {
        doctorId: doctor,
        patientId: patient?.id,
        patientName: patient?.name || patient?.nameAr || 'مريض',
        date: date,
        time: time,
        type: 'clinic'
      }

      if (isOnline) {
        const response = await appointmentsService.bookAppointment(bookingData)
        toast.success(response?.message || t('messages.booking_confirmed'))
      } else {
        // وضع غير متصل - حفظ محلياً
        const newAppointment = {
          id: Date.now(),
          ...bookingData,
          status: 'scheduled',
          _syncPending: true
        }
        const existing = JSON.parse(localStorage.getItem('mcsos_appointments') || '[]')
        existing.push(newAppointment)
        localStorage.setItem('mcsos_appointments', JSON.stringify(existing))
        toast.success(t('messages.booking_confirmed') + ' (تم الحفظ محلياً)')
      }

      // إعادة تعيين النموذج
      setDoctor('')
      setDate('')
      setTime('')
      setAvailableSlots([])

      // استدعاء دالة النجاح إذا وجدت
      if (onBookingSuccess) {
        onBookingSuccess()
      }

    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error.message || 'حدث خطأ في حجز الموعد')
    } finally {
      setSubmitting(false)
    }
  }

  // ========== الحصول على اسم الطبيب حسب اللغة ==========
  const getDoctorName = (doctorObj) => {
    if (!doctorObj) return ''
    const lang = i18n.language
    if (lang === 'ar') return doctorObj.nameAr || doctorObj.name
    if (lang === 'fr') return doctorObj.nameFr || doctorObj.nameEn || doctorObj.name
    return doctorObj.nameEn || doctorObj.name
  }

  const getDoctorSpecialization = (doctorObj) => {
    if (!doctorObj) return ''
    const lang = i18n.language
    if (lang === 'ar') return doctorObj.specializationAr || doctorObj.specialization
    if (lang === 'fr') return doctorObj.specializationFr || doctorObj.specializationEn || doctorObj.specialization
    return doctorObj.specializationEn || doctorObj.specialization
  }

  if (!patient) return null

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
            {t('reception.patient_details')}: {patient.name || patient.nameAr || 'مريض'}
          </p>
          {!isOnline && (
            <span className="text-xs text-yellow-400">⚡ غير متصل - سيتم الحفظ محلياً</span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* اختيار الطبيب */}
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
              disabled={loading || submitting}
            >
              <option value="">{t('reception.select_doctor')}</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {getDoctorName(doc)} - {getDoctorSpecialization(doc)}
                </option>
              ))}
            </select>
            {loading && (
              <Loader2 className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-green-500 animate-spin`} size={18} />
            )}
          </div>
        </div>

        {/* اختيار التاريخ */}
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
              min={new Date().toISOString().split('T')[0]}
              disabled={loading || submitting}
            />
          </div>
        </div>

        {/* اختيار الوقت */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {t('reception.time')}
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Clock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <select
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all appearance-none`}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!doctor || !date || loadingSlots || submitting}
            >
              <option value="">
                {loadingSlots ? 'جاري تحميل المواعيد...' : 'اختر الوقت'}
              </option>
              {availableSlots.map((slot, index) => (
                <option key={index} value={slot.time} disabled={!slot.available}>
                  {slot.time} {!slot.available && '(غير متاح)'}
                </option>
              ))}
            </select>
            {loadingSlots && (
              <Loader2 className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-green-500 animate-spin`} size={18} />
            )}
          </div>
          {doctor && date && availableSlots.length === 0 && !loadingSlots && (
            <p className="text-sm text-yellow-500 mt-2">لا توجد مواعيد متاحة في هذا اليوم</p>
          )}
        </div>

        {/* زر الحجز */}
        <button
          onClick={handleBooking}
          disabled={loading || submitting || !doctor || !date || !time}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Calendar size={18} />
          )}
          {submitting ? 'جاري الحجز...' : t('reception.book')}
        </button>
      </div>
    </div>
  )
}