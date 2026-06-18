// src/components/scheduling/SchedulingEngine.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Users, Plus, Trash2, Save, Zap, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService, appointmentsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function SchedulingEngine() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [bulkPattern, setBulkPattern] = useState('')
  const [slots, setSlots] = useState([])
  const [dynamicSlots, setDynamicSlots] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const bulkPatterns = [
    { id: 'sun_tue_thu', nameAr: 'الأحد - الثلاثاء - الخميس', nameEn: 'Sun - Tue - Thu' },
    { id: 'mon_wed_sat', nameAr: 'الإثنين - الأربعاء - السبت', nameEn: 'Mon - Wed - Sat' },
    { id: 'daily', nameAr: 'يومياً', nameEn: 'Daily' },
  ]

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // تحميل الأطباء
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

      // تحميل المواعيد
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => appointmentsService.getAppointments(),
          'appointments',
          JSON.parse(localStorage.getItem('mcsos_appointments') || '[]')
        )
        const data = response?.appointments || response || []
        // تقسيم المواعيد إلى مجمعة وديناميكية
        const bulk = data.filter(item => item.type === 'bulk')
        const dynamic = data.filter(item => item.type === 'dynamic')
        setSlots(bulk)
        setDynamicSlots(dynamic)
        localStorage.setItem('mcsos_appointments', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_appointments')
        if (saved) {
          const data = JSON.parse(saved)
          const bulk = data.filter(item => item.type === 'bulk')
          const dynamic = data.filter(item => item.type === 'dynamic')
          setSlots(bulk)
          setDynamicSlots(dynamic)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== دوال مساعدة ==========
  const getDoctorName = (doctor) => {
    if (!doctor) return ''
    return isRTL ? doctor.nameAr : doctor.nameEn
  }

  const getDoctorById = (id) => {
    return doctors.find(d => d.id == id)
  }

  const getPatternName = (pattern) => {
    const found = bulkPatterns.find(p => p.id === pattern)
    return found ? (isRTL ? found.nameAr : found.nameEn) : ''
  }

  // ========== إنشاء مواعيد مجمعة ==========
  const generateBulkSlots = async () => {
    if (!selectedDoctor || !bulkPattern) {
      toast.error(t('scheduling.select_doctor_pattern'))
      return
    }

    setSubmitting(true)
    try {
      const doctor = getDoctorById(selectedDoctor)
      const slotData = {
        doctorId: selectedDoctor,
        doctorName: getDoctorName(doctor),
        pattern: bulkPattern,
        patternName: getPatternName(bulkPattern),
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        type: 'bulk'
      }

      let newSlot
      if (isOnline) {
        try {
          const response = await appointmentsService.createBulkSlots(slotData)
          newSlot = response?.slot || response
        } catch (apiError) {
          console.warn('API bulk creation failed, saving locally:', apiError)
          newSlot = { ...slotData, id: Date.now(), _syncPending: true }
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        newSlot = { ...slotData, id: Date.now(), _syncPending: true }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      setSlots([...slots, newSlot])
      saveAppointments([...slots, newSlot, ...dynamicSlots])
      toast.success(t('scheduling.bulk_generated'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إنشاء المواعيد المجمعة')
    } finally {
      setSubmitting(false)
    }
  }

  // ========== إنشاء مواعيد ديناميكية ==========
  const generateDynamicSlots = async () => {
    if (!selectedDoctor) {
      toast.error('الرجاء اختيار الطبيب')
      return
    }

    setSubmitting(true)
    try {
      const doctor = getDoctorById(selectedDoctor)
      const slotData = {
        doctorId: selectedDoctor,
        doctorName: getDoctorName(doctor),
        date: new Date().toISOString().split('T')[0],
        availableSlots: 8,
        bookedSlots: 0,
        type: 'dynamic'
      }

      let newSlot
      if (isOnline) {
        try {
          const response = await appointmentsService.createDynamicSlots(slotData)
          newSlot = response?.slot || response
        } catch (apiError) {
          console.warn('API dynamic creation failed, saving locally:', apiError)
          newSlot = { ...slotData, id: Date.now(), _syncPending: true }
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        newSlot = { ...slotData, id: Date.now(), _syncPending: true }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      setDynamicSlots([...dynamicSlots, newSlot])
      saveAppointments([...slots, ...dynamicSlots, newSlot])
      toast.success(t('scheduling.dynamic_generated'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إنشاء المواعيد الديناميكية')
    } finally {
      setSubmitting(false)
    }
  }

  // ========== حفظ المواعيد ==========
  const saveAppointments = (data) => {
    localStorage.setItem('mcsos_appointments', JSON.stringify(data))
  }

  // ========== حذف موعد ==========
  const deleteSlot = async (id, type) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return

    try {
      if (isOnline) {
        try {
          await appointmentsService.deleteAppointment(id)
        } catch (apiError) {
          console.warn('API delete failed, removing locally:', apiError)
        }
      }

      let updated
      if (type === 'bulk') {
        updated = slots.filter(slot => slot.id !== id)
        setSlots(updated)
      } else {
        updated = dynamicSlots.filter(slot => slot.id !== id)
        setDynamicSlots(updated)
      }

      const allAppointments = [...slots, ...dynamicSlots]
      saveAppointments(allAppointments)
      toast.success(t('scheduling.slot_deleted'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الموعد')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {t('scheduling.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('scheduling.subtitle')}
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadData}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-2">{t('scheduling.select_doctor')}</label>
          <select
            className="w-full p-2 border rounded-lg dark:bg-gray-900"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={submitting}
          >
            <option value="">{t('scheduling.select_doctor')}</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>{getDoctorName(doc)}</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-2">{t('scheduling.bulk_pattern')}</label>
          <select
            className="w-full p-2 border rounded-lg dark:bg-gray-900"
            value={bulkPattern}
            onChange={(e) => setBulkPattern(e.target.value)}
            disabled={submitting}
          >
            <option value="">{t('scheduling.select_pattern')}</option>
            {bulkPatterns.map(pattern => (
              <option key={pattern.id} value={pattern.id}>{isRTL ? pattern.nameAr : pattern.nameEn}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateBulkSlots}
            disabled={submitting || !selectedDoctor || !bulkPattern}
            className="flex-1 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
            {t('scheduling.bulk_generate')}
          </button>
          <button
            onClick={generateDynamicSlots}
            disabled={submitting || !selectedDoctor}
            className="flex-1 bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            {t('scheduling.dynamic_generate')}
          </button>
        </div>
      </div>

      {/* Bulk Slots */}
      {slots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-blue-500" />
            {t('scheduling.bulk_slots')}
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({slots.filter(s => s._syncPending).length > 0 && 
                <span className="text-yellow-400">⏳ {slots.filter(s => s._syncPending).length} في انتظار المزامنة</span>}
            </span>
          </h2>
          <div className="space-y-3">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div>
                  <p className="font-semibold">{slot.doctorName}</p>
                  <p className="text-sm text-gray-500">{slot.patternName}</p>
                  <p className="text-xs text-gray-400">{slot.startDate} → {slot.endDate}</p>
                  {slot._syncPending && (
                    <span className="text-xs text-yellow-400">⏳ في انتظار المزامنة</span>
                  )}
                </div>
                <button
                  onClick={() => deleteSlot(slot.id, 'bulk')}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Slots */}
      {dynamicSlots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-green-500" />
            {t('scheduling.dynamic_slots')}
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({dynamicSlots.filter(s => s._syncPending).length > 0 && 
                <span className="text-yellow-400">⏳ {dynamicSlots.filter(s => s._syncPending).length} في انتظار المزامنة</span>}
            </span>
          </h2>
          <div className="grid gap-3">
            {dynamicSlots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div>
                  <p className="font-semibold">{slot.doctorName}</p>
                  <p className="text-sm text-gray-500">{slot.date}</p>
                  <p className="text-xs text-gray-400">{t('scheduling.available')}: {slot.availableSlots - slot.bookedSlots} / {slot.availableSlots}</p>
                  {slot._syncPending && (
                    <span className="text-xs text-yellow-400">⏳ في انتظار المزامنة</span>
                  )}
                </div>
                <button
                  onClick={() => deleteSlot(slot.id, 'dynamic')}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {slots.length === 0 && dynamicSlots.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">{t('scheduling.no_slots')}</p>
          <p className="text-sm text-gray-400">{t('scheduling.generate_first')}</p>
        </div>
      )}
    </div>
  )
}