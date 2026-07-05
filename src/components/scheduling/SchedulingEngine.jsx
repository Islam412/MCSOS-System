// src/components/scheduling/SchedulingEngine.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Users, Plus, Trash2, Save, Zap, Loader2, RefreshCw, Edit, X, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== استيراد المكونات الجديدة ==========
import DailyCalendarGrid from './DailyCalendarGrid'
import SessionDetailModal from './SessionDetailModal'
import WaitlistSidebar from './WaitlistSidebar'

// ========== عنوان الـ API ==========
const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

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
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [slotForm, setSlotForm] = useState({
    doctorId: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 1,
    status: 'available'
  })

  // ========== حالات المكونات الجديدة ==========
  const [activeTab, setActiveTab] = useState('grid') // 'grid' or 'slots'
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [waitlistRefreshTrigger, setWaitlistRefreshTrigger] = useState(0)

  const bulkPatterns = [
    { id: 'sun_tue_thu', nameAr: 'الأحد - الثلاثاء - الخميس', nameEn: 'Sun - Tue - Thu' },
    { id: 'mon_wed_sat', nameAr: 'الإثنين - الأربعاء - السبت', nameEn: 'Mon - Wed - Sat' },
    { id: 'daily', nameAr: 'يومياً', nameEn: 'Daily' },
  ]

  // ========== دالة مساعدة للـ GET ==========
  const fetchApi = async (endpoint) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`⚠️ API ${endpoint} failed:`, error.message)
      return null
    }
  }

  // ========== دالة مساعدة للـ POST ==========
  const postApi = async (endpoint, data) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`⚠️ POST ${endpoint} failed:`, error.message)
      throw error
    }
  }

  // ========== دالة مساعدة للـ PUT ==========
  const putApi = async (endpoint, data) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`⚠️ PUT ${endpoint} failed:`, error.message)
      throw error
    }
  }

  // ========== دالة مساعدة للـ DELETE ==========
  const deleteApi = async (endpoint) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return true
    } catch (error) {
      console.warn(`⚠️ DELETE ${endpoint} failed:`, error.message)
      throw error
    }
  }

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadDoctors(),
        loadSlots()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل الأطباء ==========
  const loadDoctors = async () => {
    try {
      if (!isOnline) {
        const saved = localStorage.getItem('mcsos_doctors')
        if (saved) {
          setDoctors(JSON.parse(saved))
        }
        return
      }

      const doctors = await doctorsService.getDoctors()
      if (Array.isArray(doctors) && doctors.length > 0) {
        setDoctors(doctors)
        localStorage.setItem('mcsos_doctors', JSON.stringify(doctors))
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      const saved = localStorage.getItem('mcsos_doctors')
      if (saved) {
        setDoctors(JSON.parse(saved))
      }
    }
  }

  // ========== تحميل المواعيد ==========
  const loadSlots = async () => {
    try {
      // ✅ محاولة جلب من API
      if (isOnline) {
        const data = await fetchApi('/scheduling/slots')
        if (data && Array.isArray(data)) {
          const bulk = data.filter(item => item.type === 'bulk' || item.isBulk)
          const dynamic = data.filter(item => item.type === 'dynamic' || !item.isBulk)
          setSlots(bulk)
          setDynamicSlots(dynamic)
          localStorage.setItem('mcsos_slots', JSON.stringify(data))
          return
        }
      }

      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_slots')
      if (saved) {
        const data = JSON.parse(saved)
        if (Array.isArray(data)) {
          const bulk = data.filter(item => item.type === 'bulk' || item.isBulk)
          const dynamic = data.filter(item => item.type === 'dynamic' || !item.isBulk)
          setSlots(bulk)
          setDynamicSlots(dynamic)
        }
      }
    } catch (error) {
      console.error('Error loading slots:', error)
    }
  }

  // ========== دوال مساعدة ==========
  const getDoctorName = (doctor) => {
    if (!doctor) return ''
    return isRTL ? (doctor.nameAr || doctor.name) : (doctor.nameEn || doctor.name)
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
      toast.error('الرجاء اختيار الطبيب والنمط')
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
          const response = await postApi('/scheduling/slots/bulk', slotData)
          newSlot = response.slot || response
          toast.success('تم إنشاء المواعيد المجمعة بنجاح')
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
      saveSlots([...slots, newSlot, ...dynamicSlots])
      
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إنشاء المواعيد المجمعة')
    } finally {
      setSubmitting(false)
    }
  }

  // ========== إنشاء موعد ديناميكي ==========
  const generateDynamicSlots = async () => {
    if (!selectedDoctor) {
      toast.error('الرجاء اختيار الطبيب')
      return
    }

    setSubmitting(true)
    try {
      const doctor = getDoctorById(selectedDoctor)
      
      // ✅ فتح مودال إضافة موعد
      setSlotForm({
        doctorId: selectedDoctor,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        capacity: 1,
        status: 'available'
      })
      setEditingSlot(null)
      setShowSlotModal(true)
      
    } catch (error) {
      toast.error(error.message || 'حدث خطأ')
    } finally {
      setSubmitting(false)
    }
  }

  // ========== حفظ موعد فردي ==========
  const handleSaveSlot = async () => {
    if (!slotForm.doctorId || !slotForm.date || !slotForm.startTime) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }

    setSubmitting(true)
    try {
      const slotData = {
        doctorId: slotForm.doctorId,
        date: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime || slotForm.startTime,
        capacity: parseInt(slotForm.capacity) || 1,
        status: slotForm.status || 'available'
      }

      let newSlot

      if (editingSlot) {
        // ✅ تحديث موعد
        if (isOnline) {
          try {
            const response = await putApi(`/scheduling/slots/${editingSlot.id}`, slotData)
            newSlot = response.slot || response
            toast.success('تم تحديث الموعد بنجاح')
          } catch (apiError) {
            console.warn('API update failed, saving locally:', apiError)
            newSlot = { ...slotData, id: editingSlot.id, _syncPending: true }
            toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
          }
        } else {
          newSlot = { ...slotData, id: editingSlot.id, _syncPending: true }
          toast.info('تم الحفظ في وضع عدم الاتصال')
        }

        const updated = dynamicSlots.map(s => s.id === editingSlot.id ? newSlot : s)
        setDynamicSlots(updated)
        saveSlots([...slots, ...updated])
        
      } else {
        // ✅ إضافة موعد جديد
        if (isOnline) {
          try {
            const response = await postApi('/scheduling/slots', slotData)
            newSlot = response.slot || response
            toast.success('تم إضافة الموعد بنجاح')
          } catch (apiError) {
            console.warn('API create failed, saving locally:', apiError)
            newSlot = { ...slotData, id: Date.now(), _syncPending: true }
            toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
          }
        } else {
          newSlot = { ...slotData, id: Date.now(), _syncPending: true }
          toast.info('تم الحفظ في وضع عدم الاتصال')
        }

        setDynamicSlots([...dynamicSlots, newSlot])
        saveSlots([...slots, ...dynamicSlots, newSlot])
      }

      setShowSlotModal(false)
      setEditingSlot(null)
      setSlotForm({
        doctorId: '',
        date: '',
        startTime: '',
        endTime: '',
        capacity: 1,
        status: 'available'
      })

    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الموعد')
    } finally {
      setSubmitting(false)
    }
  }

  // ========== حفظ المواعيد ==========
  const saveSlots = (data) => {
    localStorage.setItem('mcsos_slots', JSON.stringify(data))
  }

  // ========== حذف موعد ==========
  const deleteSlot = async (id, type) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return

    try {
      if (isOnline) {
        try {
          await deleteApi(`/scheduling/slots/${id}`)
          toast.success('تم حذف الموعد')
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

      const allSlots = [...slots, ...dynamicSlots]
      saveSlots(allSlots)
      
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الموعد')
    }
  }

  // ========== تعديل موعد ==========
  const editSlot = (slot) => {
    setEditingSlot(slot)
    setSlotForm({
      doctorId: slot.doctorId || slot.doctor_id,
      date: slot.date || slot.slot_date,
      startTime: slot.startTime || slot.start_time || '09:00',
      endTime: slot.endTime || slot.end_time || '10:00',
      capacity: slot.capacity || 1,
      status: slot.status || 'available'
    })
    setShowSlotModal(true)
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadData()
    toast.success('تم تحديث البيانات')
  }

  // ========== حالة الموعد ==========
  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ متاح</span>
      case 'booked':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">📅 محجوز</span>
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">✗ ملغي</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {t('scheduling.title') || 'إدارة المواعيد والجدولة'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('scheduling.subtitle') || 'نظام جدولة المواعيد اليومية للأطباء وإدارة قائمة الانتظار'}
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs animate-pulse">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refreshData}
          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-500/20 transition-all font-semibold"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {isRTL ? 'تحديث البيانات' : 'Refresh'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-2">
        <div className="flex w-full max-w-lg bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-1.5 shadow-inner gap-2">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex-1 py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'grid'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-150 hover:bg-white/50 dark:hover:bg-gray-800/30'
            }`}
          >
            <Calendar size={16} />
            {isRTL ? 'مخطط التقويم اليومي' : 'Daily Calendar Grid'}
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'slots'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-150 hover:bg-white/50 dark:hover:bg-gray-800/30'
            }`}
          >
            <Clock size={16} />
            {isRTL ? 'توليد المواعيد والأنماط' : 'Slot Generator'}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <DailyCalendarGrid 
              selectedWaitlistEntry={selectedWaitlistEntry}
              onAssignComplete={() => {
                setSelectedWaitlistEntry(null)
                setWaitlistRefreshTrigger(prev => prev + 1)
              }}
              onViewSession={(session) => setSelectedSession(session)}
            />
          </div>
          <div className="lg:col-span-1">
            <WaitlistSidebar 
              selectedEntryId={selectedWaitlistEntry?.id}
              onSelectEntry={(entry) => setSelectedWaitlistEntry(entry)}
              refreshTrigger={waitlistRefreshTrigger}
              doctors={doctors}
            />
          </div>
        </div>
      ) : (
        /* Slot Generator View */
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold mb-2">{t('scheduling.select_doctor') || 'اختر الطبيب'}</label>
              <select
                className="w-full p-2 border rounded-lg dark:bg-gray-900"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                disabled={submitting}
              >
                <option value="">{t('scheduling.select_doctor') || 'اختر الطبيب'}</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{getDoctorName(doc)}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold mb-2">{t('scheduling.bulk_pattern') || 'نمط المواعيد'}</label>
              <select
                className="w-full p-2 border rounded-lg dark:bg-gray-900"
                value={bulkPattern}
                onChange={(e) => setBulkPattern(e.target.value)}
                disabled={submitting}
              >
                <option value="">{t('scheduling.select_pattern') || 'اختر النمط'}</option>
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
                إنشاء مجمع
              </button>
              <button
                onClick={generateDynamicSlots}
                disabled={submitting || !selectedDoctor}
                className="flex-1 bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                إضافة موعد
              </button>
            </div>
          </div>

          {/* Bulk Slots */}
          {slots.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-blue-500" />
                المواعيد المجمعة
                <span className="text-sm text-gray-400 font-normal ml-2">
                  ({slots.filter(s => s._syncPending).length > 0 && 
                    <span className="text-yellow-400">⏳ {slots.filter(s => s._syncPending).length} في انتظار المزامنة</span>}
                </span>
              </h2>
              <div className="space-y-3">
                {slots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold">{slot.doctorName || getDoctorName(getDoctorById(slot.doctorId))}</p>
                      <p className="text-sm text-gray-500">{slot.patternName || slot.pattern}</p>
                      <p className="text-xs text-gray-400">{slot.startDate || slot.date} → {slot.endDate}</p>
                      {slot._syncPending && (
                        <span className="text-xs text-yellow-400">⏳ في انتظار المزامنة</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editSlot(slot)}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id, 'bulk')}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
                المواعيد الفردية
                <span className="text-sm text-gray-400 font-normal ml-2">
                  ({dynamicSlots.filter(s => s._syncPending).length > 0 && 
                    <span className="text-yellow-400">⏳ {dynamicSlots.filter(s => s._syncPending).length} في انتظار المزامنة</span>}
                </span>
              </h2>
              <div className="grid gap-3">
                {dynamicSlots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold">{slot.doctorName || getDoctorName(getDoctorById(slot.doctorId))}</p>
                      <p className="text-sm text-gray-500">{slot.date} - {slot.startTime || slot.start_time}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(slot.status)}
                        {slot.capacity && <span className="text-xs text-gray-400">السعة: {slot.capacity}</span>}
                      </div>
                      {slot._syncPending && (
                        <span className="text-xs text-yellow-400">⏳ في انتظار المزامنة</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editSlot(slot)}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id, 'dynamic')}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slots.length === 0 && dynamicSlots.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">لا توجد مواعيد</p>
              <p className="text-sm text-gray-400">قم بإنشاء مواعيد جديدة باستخدام الأزرار أعلاه</p>
            </div>
          )}
        </div>
      )}

      {/* Modal إضافة/تعديل موعد */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSlot ? 'تعديل موعد' : 'إضافة موعد جديد'}
              </h2>
              <button onClick={() => setShowSlotModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الطبيب</label>
                <select
                  className="w-full p-2 border rounded-lg dark:bg-gray-900"
                  value={slotForm.doctorId}
                  onChange={(e) => setSlotForm({...slotForm, doctorId: e.target.value})}
                  disabled={submitting}
                >
                  <option value="">اختر الطبيب</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{getDoctorName(doc)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg dark:bg-gray-900"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({...slotForm, date: e.target.value})}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">من</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-lg dark:bg-gray-900"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({...slotForm, startTime: e.target.value})}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إلى</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-lg dark:bg-gray-900"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({...slotForm, endTime: e.target.value})}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعة</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-lg dark:bg-gray-900"
                  value={slotForm.capacity}
                  onChange={(e) => setSlotForm({...slotForm, capacity: e.target.value})}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
                <select
                  className="w-full p-2 border rounded-lg dark:bg-gray-900"
                  value={slotForm.status}
                  onChange={(e) => setSlotForm({...slotForm, status: e.target.value})}
                  disabled={submitting}
                >
                  <option value="available">متاح</option>
                  <option value="booked">محجوز</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveSlot}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingSlot ? 'تحديث' : 'حفظ'}
                </button>
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal 
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onUpdate={(updatedSession) => {
          setSelectedSession(null)
          setWaitlistRefreshTrigger(prev => prev + 1) // Refresh waitlist sidebar & grid
        }}
      />
    </div>
  )
}