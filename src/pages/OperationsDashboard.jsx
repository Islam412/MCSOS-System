// src/pages/OperationsDashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Users, Calendar, Activity, Download, Calendar as CalendarIcon, CheckCircle, XCircle, Edit, Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService, appointmentsService } from '../services/api'
import { useServices } from '../context/ServiceContext'

export default function OperationsDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    doctorUtilization: 0,
    patientSatisfaction: 0
  })
  const [doctors, setDoctors] = useState([])
  const [weeklySchedule, setWeeklySchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false)
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const [editSchedule, setEditSchedule] = useState({})
  const [newSchedule, setNewSchedule] = useState({ day: '', date: '', morning: 0, evening: 0 })
  const [editDoctor, setEditDoctor] = useState({})
  const [newDoctor, setNewDoctor] = useState({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '', patients: '', sessions: '', attendance: '', utilization: '' })

  // أيام الأسبوع بالعربية للبيانات
  const daysMap = {
    'السبت': 'saturday',
    'الأحد': 'sunday',
    'الإثنين': 'monday',
    'الثلاثاء': 'tuesday',
    'الأربعاء': 'wednesday',
    'الخميس': 'thursday',
    'الجمعة': 'friday'
  }

  // دالة ترجمة اليوم
  const translateDay = (dayAr) => {
    const dayKey = daysMap[dayAr]
    if (dayKey && t(`days.${dayKey}`) !== `days.${dayKey}`) {
      return t(`days.${dayKey}`)
    }
    return dayAr
  }

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadDoctors(),
        loadWeeklySchedule()
      ])
    } catch (error) {
      console.error('Error loading operations data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل الإحصائيات ==========
  const loadStats = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => get('/stats/operations'),
          'operations_stats',
          JSON.parse(localStorage.getItem('mcsos_operations_stats') || '{}')
        )
        const data = response || {}
        setStats({
          totalAppointments: data.totalAppointments || 0,
          completedAppointments: data.completedAppointments || 0,
          doctorUtilization: data.doctorUtilization || 0,
          patientSatisfaction: data.patientSatisfaction || 0
        })
        localStorage.setItem('mcsos_operations_stats', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_operations_stats')
        if (saved) {
          const data = JSON.parse(saved)
          setStats(data)
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // ========== تحميل الأطباء ==========
  const loadDoctors = async () => {
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
        if (saved) setDoctors(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  // ========== تحميل الجدول الأسبوعي ==========
  const loadWeeklySchedule = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => get('/schedule/weekly'),
          'weekly_schedule',
          JSON.parse(localStorage.getItem('mcsos_weekly_schedule') || '[]')
        )
        const data = response?.schedule || response || []
        setWeeklySchedule(data)
        localStorage.setItem('mcsos_weekly_schedule', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_weekly_schedule')
        if (saved) setWeeklySchedule(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading weekly schedule:', error)
    }
  }

  // ========== دالة مساعدة للـ GET ==========
  const get = async (endpoint) => {
    const response = await fetch(`https://medical-center-app-production.up.railway.app/api${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  // ========== دالة مساعدة للـ POST ==========
  const post = async (endpoint, data) => {
    const response = await fetch(`https://medical-center-app-production.up.railway.app/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  // ========== دالة مساعدة للـ PUT ==========
  const put = async (endpoint, data) => {
    const response = await fetch(`https://medical-center-app-production.up.railway.app/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  // ========== دالة مساعدة للـ DELETE ==========
  const del = async (endpoint) => {
    const response = await fetch(`https://medical-center-app-production.up.railway.app/api${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`
      }
    })
    return response.json()
  }

  const getDoctorName = (doctor) => isRTL ? doctor.nameAr : doctor.nameEn
  const getSpecialization = (doctor) => isRTL ? doctor.specializationAr : doctor.specializationEn

  const updateScheduleTotal = (morning, evening) => (parseInt(morning) || 0) + (parseInt(evening) || 0)

  // ========== حفظ الجدول ==========
  const handleSaveSchedule = async () => {
    setIsSubmitting(true)
    try {
      if (isOnline) {
        await put(`/schedule/${editSchedule.id}`, editSchedule)
      }
      const updated = weeklySchedule.map(s => s.id === editSchedule.id ? { ...editSchedule, total: updateScheduleTotal(editSchedule.morning, editSchedule.evening) } : s)
      setWeeklySchedule(updated)
      localStorage.setItem('mcsos_weekly_schedule', JSON.stringify(updated))
      setShowEditScheduleModal(false)
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الجدول')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== إضافة يوم للجدول ==========
  const handleAddSchedule = async () => {
    if (!newSchedule.day) {
      toast.error('الرجاء اختيار اليوم')
      return
    }

    setIsSubmitting(true)
    try {
      const scheduleData = {
        ...newSchedule,
        total: updateScheduleTotal(newSchedule.morning, newSchedule.evening)
      }

      let newItem
      if (isOnline) {
        const response = await post('/schedule', scheduleData)
        newItem = response?.schedule || response
      } else {
        newItem = { ...scheduleData, id: Date.now(), _syncPending: true }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      const updated = [...weeklySchedule, newItem]
      setWeeklySchedule(updated)
      localStorage.setItem('mcsos_weekly_schedule', JSON.stringify(updated))
      setShowAddScheduleModal(false)
      setNewSchedule({ day: '', date: '', morning: 0, evening: 0 })
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إضافة اليوم')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف يوم من الجدول ==========
  const handleDeleteSchedule = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا اليوم؟')) return

    try {
      if (isOnline) {
        await del(`/schedule/${id}`)
      }
      const updated = weeklySchedule.filter(s => s.id !== id)
      setWeeklySchedule(updated)
      localStorage.setItem('mcsos_weekly_schedule', JSON.stringify(updated))
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف اليوم')
    }
  }

  // ========== حفظ بيانات الطبيب ==========
  const handleSaveDoctor = async () => {
    setIsSubmitting(true)
    try {
      if (isOnline) {
        await put(`/doctors/${editDoctor.id}`, editDoctor)
      }
      const updated = doctors.map(d => d.id === editDoctor.id ? { ...editDoctor, _syncPending: !isOnline } : d)
      setDoctors(updated)
      localStorage.setItem('mcsos_doctors', JSON.stringify(updated))
      setShowEditDoctorModal(false)
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ بيانات الطبيب')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== إضافة طبيب ==========
  const handleAddDoctor = async () => {
    if (!newDoctor.nameAr || !newDoctor.specializationAr) {
      toast.error('الرجاء إدخال الاسم والتخصص')
      return
    }

    setIsSubmitting(true)
    try {
      const doctorData = {
        nameAr: newDoctor.nameAr,
        nameEn: newDoctor.nameEn || newDoctor.nameAr,
        specializationAr: newDoctor.specializationAr,
        specializationEn: newDoctor.specializationEn || newDoctor.specializationAr,
        patients: parseInt(newDoctor.patients) || 0,
        sessions: parseInt(newDoctor.sessions) || 0,
        attendance: parseInt(newDoctor.attendance) || 0,
        utilization: parseInt(newDoctor.utilization) || 0
      }

      let newItem
      if (isOnline) {
        const response = await doctorsService.createDoctor(doctorData)
        newItem = response?.doctor || response
      } else {
        newItem = { ...doctorData, id: Date.now(), _syncPending: true }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      const updated = [...doctors, newItem]
      setDoctors(updated)
      localStorage.setItem('mcsos_doctors', JSON.stringify(updated))
      setShowAddDoctorModal(false)
      setNewDoctor({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '', patients: '', sessions: '', attendance: '', utilization: '' })
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إضافة الطبيب')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف طبيب ==========
  const handleDeleteDoctor = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return

    try {
      if (isOnline) {
        await doctorsService.deleteDoctor(id)
      }
      const updated = doctors.filter(d => d.id !== id)
      setDoctors(updated)
      localStorage.setItem('mcsos_doctors', JSON.stringify(updated))
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الطبيب')
    }
  }

  // ========== تحديث نسب الاستخدام ==========
  const handleUpdateUtilization = () => {
    const updated = doctors.map(d => ({
      ...d,
      utilization: Math.min(100, Math.max(0, (d.utilization || 0) + (Math.random() * 10 - 5)))
    }))
    setDoctors(updated)
    localStorage.setItem('mcsos_doctors', JSON.stringify(updated))
    // محاولة المزامنة مع الخادم
    if (isOnline) {
      updated.forEach(async (doctor) => {
        try {
          await put(`/doctors/${doctor.id}`, { utilization: doctor.utilization })
        } catch (error) {
          console.warn('Failed to sync utilization:', error)
        }
      })
    }
    toast.success('تم تحديث نسب الاستخدام')
  }

  // ========== إعادة تعيين البيانات ==========
  const handleResetData = () => {
    setStats({
      totalAppointments: 0,
      completedAppointments: 0,
      doctorUtilization: 0,
      patientSatisfaction: 0
    })
    setDoctors([])
    setWeeklySchedule([])
    localStorage.removeItem('mcsos_operations_stats')
    localStorage.removeItem('mcsos_doctors')
    localStorage.removeItem('mcsos_weekly_schedule')
    setShowResetModal(false)
    toast.success('تم إعادة تعيين جميع البيانات')
    loadAllData()
  }

  // ========== تصدير التقرير ==========
  const handleExportReport = () => {
    const reportData = { stats, doctors, weeklySchedule, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `operations_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تصدير التقرير بنجاح')
  }

  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-green-400'
    if (attendance >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('operations.title')}</h1>
          <p className="text-gray-400 mt-1">
            {t('operations.subtitle')}
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleUpdateUtilization} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30">
            <RefreshCw size={18} /> {t('operations.update_rates')}
          </button>
          <button onClick={handleExportReport} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
            <Download size={18} /> {t('operations.export_report')}
          </button>
          <button onClick={loadAllData} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button onClick={() => setShowResetModal(true)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-red-500/30">
            <RefreshCw size={18} /> {t('operations.reset_data')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.totalAppointments || 0}</div><div className="text-sm text-gray-400">{t('operations.total_appointments')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.completedAppointments || 0}</div><div className="text-sm text-gray-400">{t('operations.completed_appointments')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl"><TrendingUp className="text-purple-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.doctorUtilization || 0}%</div><div className="text-sm text-gray-400">{t('operations.doctor_utilization')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl"><Users className="text-orange-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.patientSatisfaction || 0}%</div><div className="text-sm text-gray-400">{t('operations.patient_satisfaction')}</div></div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Table */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={20} className="text-purple-400" /> {t('operations.weekly_schedule')}</h2>
          <button onClick={() => setShowAddScheduleModal(true)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
            <Plus size={14} /> {t('operations.add_day')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.day')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.date')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.morning')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.evening')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.total')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {weeklySchedule.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
              ) : (
                weeklySchedule.map((day) => (
                  <tr key={day.id}>
                    <td className="px-6 py-4 font-semibold text-white">{translateDay(day.day)}</td>
                    <td className="px-6 py-4 text-gray-400">{day.date}</td>
                    <td className="px-6 py-4 text-gray-300">{day.morning} {t('operations.appointments')}</td>
                    <td className="px-6 py-4 text-gray-300">{day.evening} {t('operations.appointments')}</td>
                    <td className="px-6 py-4 font-semibold text-blue-400">{day.total}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditSchedule(day); setShowEditScheduleModal(true); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteSchedule(day.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                          <Trash2 size={16} />
                        </button>
                        {day._syncPending && (
                          <span className="text-xs text-yellow-400">⏳ مزامنة</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{t('operations.total_week')}</span>
            <span className="text-xl font-bold text-white">{weeklySchedule.reduce((sum, d) => sum + d.total, 0)} {t('operations.appointments')}</span>
          </div>
        </div>
      </div>

      {/* Doctor Performance Table */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-blue-400" /> {t('operations.doctor_performance')}</h2>
          <button onClick={() => setShowAddDoctorModal(true)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
            <Plus size={14} /> إضافة طبيب
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.doctor')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.specialization')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.patients')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.sessions')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.attendance')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.utilization')}</th>
                <th className="px-6 py-3 text-sm text-gray-300">{t('operations.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {doctors.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      {getDoctorName(doctor)}
                      {doctor._syncPending && (
                        <span className="text-xs text-yellow-400">⏳ مزامنة</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{getSpecialization(doctor)}</td>
                    <td className="px-6 py-4 text-gray-300">{doctor.patients}</td>
                    <td className="px-6 py-4 text-gray-300">{doctor.sessions}</td>
                    <td className={`px-6 py-4 font-semibold ${getAttendanceColor(doctor.attendance)}`}>{doctor.attendance}%</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${doctor.utilization}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-400">{doctor.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditDoctor(doctor); setShowEditDoctorModal(true); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteDoctor(doctor.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* باقي المودالات - نفس الكود الأصلي مع تحديث الدوال */}
      {/* Modal Edit Schedule */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t('operations.edit')} {t('operations.weekly_schedule')}</h2>
            <div className="space-y-3">
              <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.day} onChange={(e) => setEditSchedule({...editSchedule, day: e.target.value})}>
                <option value="">{t('operations.day')}</option>
                <option value="السبت">{t('days.saturday')}</option>
                <option value="الأحد">{t('days.sunday')}</option>
                <option value="الإثنين">{t('days.monday')}</option>
                <option value="الثلاثاء">{t('days.tuesday')}</option>
                <option value="الأربعاء">{t('days.wednesday')}</option>
                <option value="الخميس">{t('days.thursday')}</option>
                <option value="الجمعة">{t('days.friday')}</option>
              </select>
              <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.date} onChange={(e) => setEditSchedule({...editSchedule, date: e.target.value})} />
              <input type="number" placeholder={t('operations.morning')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.morning} onChange={(e) => setEditSchedule({...editSchedule, morning: parseInt(e.target.value), total: updateScheduleTotal(e.target.value, editSchedule.evening)})} />
              <input type="number" placeholder={t('operations.evening')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.evening} onChange={(e) => setEditSchedule({...editSchedule, evening: parseInt(e.target.value), total: updateScheduleTotal(editSchedule.morning, e.target.value)})} />
              <div className="flex gap-3">
                <button onClick={handleSaveSchedule} disabled={isSubmitting} className="flex-1 bg-blue-500 py-2 rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                  {t('common.save')}
                </button>
                <button onClick={() => setShowEditScheduleModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Schedule */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t('operations.add_day')}</h2>
            <div className="space-y-3">
              <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.day} onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})}>
                <option value="">{t('operations.day')}</option>
                <option value="السبت">{t('days.saturday')}</option>
                <option value="الأحد">{t('days.sunday')}</option>
                <option value="الإثنين">{t('days.monday')}</option>
                <option value="الثلاثاء">{t('days.tuesday')}</option>
                <option value="الأربعاء">{t('days.wednesday')}</option>
                <option value="الخميس">{t('days.thursday')}</option>
                <option value="الجمعة">{t('days.friday')}</option>
              </select>
              <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.date} onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})} />
              <input type="number" placeholder={t('operations.morning')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.morning} onChange={(e) => setNewSchedule({...newSchedule, morning: parseInt(e.target.value)})} />
              <input type="number" placeholder={t('operations.evening')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.evening} onChange={(e) => setNewSchedule({...newSchedule, evening: parseInt(e.target.value)})} />
              <div className="flex gap-3">
                <button onClick={handleAddSchedule} disabled={isSubmitting} className="flex-1 bg-green-500 py-2 rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                  {t('common.save')}
                </button>
                <button onClick={() => setShowAddScheduleModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Doctor */}
      {showEditDoctorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t('operations.edit')} {t('operations.doctor')}</h2>
            <div className="space-y-3">
              <input type="text" placeholder={t('operations.doctor')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.nameAr} onChange={(e) => setEditDoctor({...editDoctor, nameAr: e.target.value})} />
              <input type="text" placeholder={t('operations.specialization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.specializationAr} onChange={(e) => setEditDoctor({...editDoctor, specializationAr: e.target.value})} />
              <input type="number" placeholder={t('operations.patients')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.patients} onChange={(e) => setEditDoctor({...editDoctor, patients: parseInt(e.target.value)})} />
              <input type="number" placeholder={t('operations.sessions')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.sessions} onChange={(e) => setEditDoctor({...editDoctor, sessions: parseInt(e.target.value)})} />
              <input type="number" placeholder={t('operations.attendance')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.attendance} onChange={(e) => setEditDoctor({...editDoctor, attendance: parseInt(e.target.value)})} />
              <input type="number" placeholder={t('operations.utilization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.utilization} onChange={(e) => setEditDoctor({...editDoctor, utilization: parseInt(e.target.value)})} />
              <div className="flex gap-3">
                <button onClick={handleSaveDoctor} disabled={isSubmitting} className="flex-1 bg-blue-500 py-2 rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                  {t('common.save')}
                </button>
                <button onClick={() => setShowEditDoctorModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Doctor */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة طبيب جديد</h2>
            <div className="space-y-3">
              <input type="text" placeholder={t('operations.doctor')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameAr} onChange={(e) => setNewDoctor({...newDoctor, nameAr: e.target.value})} />
              <input type="text" placeholder={t('operations.specialization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.specializationAr} onChange={(e) => setNewDoctor({...newDoctor, specializationAr: e.target.value})} />
              <input type="number" placeholder={t('operations.patients')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.patients} onChange={(e) => setNewDoctor({...newDoctor, patients: e.target.value})} />
              <input type="number" placeholder={t('operations.sessions')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.sessions} onChange={(e) => setNewDoctor({...newDoctor, sessions: e.target.value})} />
              <input type="number" placeholder={t('operations.attendance')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.attendance} onChange={(e) => setNewDoctor({...newDoctor, attendance: e.target.value})} />
              <input type="number" placeholder={t('operations.utilization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.utilization} onChange={(e) => setNewDoctor({...newDoctor, utilization: e.target.value})} />
              <div className="flex gap-3">
                <button onClick={handleAddDoctor} disabled={isSubmitting} className="flex-1 bg-green-500 py-2 rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                  {t('common.save')}
                </button>
                <button onClick={() => setShowAddDoctorModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t('operations.reset_data')}</h2>
            <p className="text-gray-400 mb-4">هل أنت متأكد؟ سيتم فقدان جميع التغييرات التي قمت بها.</p>
            <div className="flex gap-3">
              <button onClick={handleResetData} className="flex-1 bg-red-500 py-2 rounded-lg">نعم، إعادة تعيين</button>
              <button onClick={() => setShowResetModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}