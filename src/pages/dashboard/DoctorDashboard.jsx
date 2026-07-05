// src/pages/dashboard/DoctorDashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, Calendar, Clock, Activity, CheckCircle, TrendingUp, 
  User, Stethoscope, Pill, FileText, Printer, RefreshCw, 
  LogIn, Eye, Download, Star, Plus, Edit, Trash2, Save, X, Zap,
  Search, Filter, Phone, Mail, MapPin, Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { appointmentsService, patientsService, prescriptionsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ✅ عنوان الـ API
const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  
  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [selectedPatientForCheckIn, setSelectedPatientForCheckIn] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // إحصائيات الطبيب
  const [stats, setStats] = useState({
    todayPatients: 0,
    totalPatients: 0,
    completedSessions: 0,
    pendingSessions: 0,
    upcomingAppointments: 0,
    averageRating: 0
  })
  
  // جدول المواعيد اليوم
  const [todaySchedule, setTodaySchedule] = useState([])
  
  // قائمة آخر المرضى
  const [recentPatients, setRecentPatients] = useState([])
  
  // بيانات الروشتة الجديدة
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    patientId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  })

  // ========== تحميل البيانات ==========
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadTodaySchedule(),
        loadRecentPatients()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== دالة مساعدة للـ GET ==========
  const get = async (endpoint) => {
    const token = localStorage.getItem('mcsos_token')
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  // ========== دالة مساعدة للـ POST ==========
  const post = async (endpoint, data) => {
    const token = localStorage.getItem('mcsos_token')
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  // ========== دالة مساعدة للـ PUT ==========
  const put = async (endpoint, data) => {
    const token = localStorage.getItem('mcsos_token')
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }

  // ========== تحميل إحصائيات الطبيب ==========
  const loadStats = async () => {
    try {
      if (isOnline) {
        // ✅ استخدام الـ API الجديد /sessions بدلاً من /stats/doctor
        const response = await get(`/sessions?doctorId=${user?.id}`)
        
        const sessions = response?.sessions || response || []
        const today = new Date().toISOString().split('T')[0]
        
        // حساب الإحصائيات من البيانات
        const totalPatients = [...new Set(sessions.map(s => s.patientId))].filter(Boolean).length
        const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'attended').length
        const pendingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'pending').length
        const todayPatients = sessions.filter(s => s.date === today).length
        
        setStats({
          todayPatients: todayPatients,
          totalPatients: totalPatients,
          completedSessions: completedSessions,
          pendingSessions: pendingSessions,
          upcomingAppointments: pendingSessions,
          averageRating: 4.5 // يمكن جلبها من تقييمات المرضى لو موجودة
        })
        
        localStorage.setItem('mcsos_doctor_sessions', JSON.stringify(sessions))
      } else {
        const saved = localStorage.getItem('mcsos_doctor_sessions')
        if (saved) {
          const sessions = JSON.parse(saved)
          const today = new Date().toISOString().split('T')[0]
          const totalPatients = [...new Set(sessions.map(s => s.patientId))].filter(Boolean).length
          const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'attended').length
          const pendingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'pending').length
          const todayPatients = sessions.filter(s => s.date === today).length
          
          setStats({
            todayPatients: todayPatients,
            totalPatients: totalPatients,
            completedSessions: completedSessions,
            pendingSessions: pendingSessions,
            upcomingAppointments: pendingSessions,
            averageRating: 4.5
          })
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      // ✅ في حالة الخطأ، نحاول استخدام localStorage
      const saved = localStorage.getItem('mcsos_doctor_stats')
      if (saved) {
        const data = JSON.parse(saved)
        setStats(data)
      }
    }
  }

  // ========== تحميل مواعيد اليوم ==========
  const loadTodaySchedule = async () => {
    try {
      if (isOnline) {
        const today = new Date().toISOString().split('T')[0]
        // ✅ استخدام الـ API الجديد /sessions مع فلتر التاريخ والدكتور
        const response = await get(`/sessions?doctorId=${user?.id}&date=${today}`)
        
        const sessions = response?.sessions || response || []
        
        // تحويل البيانات إلى شكل متوافق مع الواجهة
        const formattedSessions = sessions.map(s => ({
          id: s.id,
          time: s.time || s.startTime || '09:00',
          patient: s.patientName || s.patient || 'مريض',
          patientId: s.patientId,
          age: s.patientAge || s.age || 30,
          type: s.type || s.sessionType || 'كشف',
          status: s.status || 'scheduled',
          date: s.date
        }))
        
        setTodaySchedule(formattedSessions)
        localStorage.setItem('mcsos_today_sessions', JSON.stringify(formattedSessions))
      } else {
        const saved = localStorage.getItem('mcsos_today_sessions')
        if (saved) setTodaySchedule(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading today schedule:', error)
      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_today_appointments')
      if (saved) {
        setTodaySchedule(JSON.parse(saved))
      }
    }
  }

  // ========== تحميل آخر المرضى ==========
  const loadRecentPatients = async () => {
    try {
      if (isOnline) {
        // ✅ جلب المرضى من الـ API
        const response = await get('/patients')
        
        const patients = response?.patients || response || []
        
        // فلتر مرضى هذا الدكتور
        const myPatients = patients.filter(p => p.doctorId === user?.id || p.assignedDoctor === user?.id)
        
        // ترتيب حسب آخر زيارة
        const sorted = myPatients.sort((a, b) => {
          const dateA = new Date(a.lastVisit || a.updatedAt || 0)
          const dateB = new Date(b.lastVisit || b.updatedAt || 0)
          return dateB - dateA
        })
        
        const formattedPatients = sorted.slice(0, 5).map(p => ({
          id: p.id,
          name: p.nameAr || p.name || 'مريض',
          age: p.age || 0,
          lastVisit: p.lastVisit || p.updatedAt?.split('T')[0] || 'اليوم',
          diagnosis: p.diagnosis || p.notes || 'قيد التشخيص',
          progress: p.progress || 0
        }))
        
        setRecentPatients(formattedPatients)
        localStorage.setItem('mcsos_all_patients', JSON.stringify(patients))
      } else {
        const saved = localStorage.getItem('mcsos_all_patients')
        if (saved) {
          const patients = JSON.parse(saved)
          const myPatients = patients.filter(p => p.doctorId === user?.id || p.assignedDoctor === user?.id)
          const sorted = myPatients.sort((a, b) => {
            const dateA = new Date(a.lastVisit || a.updatedAt || 0)
            const dateB = new Date(b.lastVisit || b.updatedAt || 0)
            return dateB - dateA
          })
          const formattedPatients = sorted.slice(0, 5).map(p => ({
            id: p.id,
            name: p.nameAr || p.name || 'مريض',
            age: p.age || 0,
            lastVisit: p.lastVisit || p.updatedAt?.split('T')[0] || 'اليوم',
            diagnosis: p.diagnosis || p.notes || 'قيد التشخيص',
            progress: p.progress || 0
          }))
          setRecentPatients(formattedPatients)
        }
      }
    } catch (error) {
      console.error('Error loading recent patients:', error)
      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_recent_patients')
      if (saved) {
        setRecentPatients(JSON.parse(saved))
      }
    }
  }

  // ========== حالة الموعد ==========
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
      case 'attended': 
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ مكتمل</span>
      case 'in-progress': 
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ جاري</span>
      case 'scheduled':
      case 'pending':
      case 'upcoming': 
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">📅 مجدول</span>
      default: 
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  // ========== دالة فتح نافذة تسجيل الحضور ==========
  const handleOpenCheckIn = () => {
    const scheduledPatients = todaySchedule.filter(app => app.status === 'scheduled' || app.status === 'upcoming' || app.status === 'pending')
    if (scheduledPatients.length === 0) {
      toast.success('لا توجد مواعيد قادمة لتسجيل الحضور', { icon: 'ℹ️' })
      return
    }
    setShowCheckInModal(true)
  }

  // ========== دالة تأكيد تسجيل الحضور ==========
  const handleConfirmCheckIn = async () => {
    if (!selectedPatientForCheckIn) {
      toast.error('الرجاء اختيار المريض')
      return
    }
    
    setIsSubmitting(true)
    try {
      if (isOnline) {
        // ✅ استخدام الـ API الجديد /sessions/{id}/attendance
        await post(`/sessions/${selectedPatientForCheckIn.id}/attendance`, { status: 'attended' })
      }
      
      setTodaySchedule(todaySchedule.map(app => 
        app.id === selectedPatientForCheckIn.id ? { ...app, status: 'completed' } : app
      ))
      
      setStats(prev => ({
        ...prev,
        completedSessions: prev.completedSessions + 1,
        pendingSessions: Math.max(0, prev.pendingSessions - 1)
      }))
      
      toast.success(`تم تسجيل حضور المريض ${selectedPatientForCheckIn.patient}`)
      setShowCheckInModal(false)
      setSelectedPatientForCheckIn(null)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تسجيل الحضور')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== دالة تحديث البيانات ==========
  const handleRefreshReport = () => {
    loadAllData()
    toast.success('تم تحديث البيانات')
  }

  // ========== دالة عرض المرضى ==========
  const handleViewPatients = () => {
    navigate('/patients')
  }

  // ========== دالة فتح نافذة الروشتة ==========
  const handleOpenPrescription = () => {
    setNewPrescription({
      patientName: '',
      patientId: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: ''
    })
    setShowPrescriptionModal(true)
  }

  // ========== دالة إضافة دواء ==========
  const handleAddMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }))
  }

  // ========== دالة إزالة دواء ==========
  const handleRemoveMedication = (index) => {
    if (newPrescription.medications.length === 1) {
      toast.error('يجب وجود دواء واحد على الأقل')
      return
    }
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  // ========== دالة تحديث بيانات الدواء ==========
  const handleMedicationChange = (index, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  // ========== دالة حفظ الروشتة (محلياً) ==========
  const handleSavePrescription = async () => {
    if (!newPrescription.patientName) {
      toast.error('الرجاء إدخال اسم المريض')
      return
    }
    const validMedications = newPrescription.medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      toast.error('الرجاء إضافة دواء واحد على الأقل')
      return
    }
    
    setIsSubmitting(true)
    try {
      const prescriptionData = {
        patientName: newPrescription.patientName,
        patientId: newPrescription.patientId || undefined,
        medications: validMedications,
        notes: newPrescription.notes || '',
        doctorId: user?.id,
        doctorName: user?.name,
        date: new Date().toISOString().split('T')[0]
      }

      // ✅ حفظ محلياً (الـ API مش مدعوم للروشتات)
      const existing = JSON.parse(localStorage.getItem('mcsos_prescriptions') || '[]')
      existing.push({ ...prescriptionData, id: Date.now(), _syncPending: true })
      localStorage.setItem('mcsos_prescriptions', JSON.stringify(existing))
      
      toast.success(`تم إضافة روشتة جديدة للمريض ${newPrescription.patientName}`)
      setShowPrescriptionModal(false)
      setNewPrescription({
        patientName: '',
        patientId: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: ''
      })
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حفظ الروشتة')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== دالة طباعة التقرير ==========
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>تقرير الطبيب - ${user?.name || 'د. أحمد علي'}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; background: white; }
            .report { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a5f; }
            .doctor-name { font-size: 18px; color: #2563eb; }
            .date { color: #6b7280; margin-top: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1e3a5f; }
            .stat-label { font-size: 12px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: right; }
            th { background: #f1f5f9; }
            .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <div class="title">نظام المركز الطبي MCSOS</div>
              <div class="doctor-name">تقرير الطبيب: ${user?.name || 'د. أحمد علي'}</div>
              <div class="date">التاريخ: ${new Date().toLocaleDateString('ar')}</div>
            </div>
            <div class="stats-grid">
              <div class="stat-card"><div class="stat-value">${stats.averageRating || 0}</div><div class="stat-label">تقييمي</div></div>
              <div class="stat-card"><div class="stat-value">${stats.completedSessions || 0}</div><div class="stat-label">جلسات مكتملة</div></div>
              <div class="stat-card"><div class="stat-value">${stats.totalPatients || 0}</div><div class="stat-label">إجمالي المرضى</div></div>
              <div class="stat-card"><div class="stat-value">${stats.todayPatients || 0}</div><div class="stat-label">مرضى اليوم</div></div>
            </div>
            <div class="footer">تم إنشاء هذا التقرير بواسطة نظام MCSOS - ${new Date().toLocaleString()}</div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري طباعة التقرير...')
  }

  const scheduledPatients = todaySchedule.filter(app => app.status === 'scheduled' || app.status === 'upcoming' || app.status === 'pending')

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
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة تحكم الطبيب</h1>
          <p className="text-gray-400 mt-1">
            مرحباً د.{user?.name || 'أحمد علي'} | ملخص عملك اليوم
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={handlePrintReport}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30"
        >
          <Printer size={18} /> طباعة التقرير
        </button>
      </div>
      
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">مرضى اليوم</p><p className="text-2xl font-bold text-white">{stats.todayPatients || 0}</p></div>
            <div className="p-2 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={24} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">إجمالي المرضى</p><p className="text-2xl font-bold text-white">{stats.totalPatients || 0}</p></div>
            <div className="p-2 bg-green-500/20 rounded-xl"><User className="text-green-400" size={24} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-2xl font-bold text-white">{stats.completedSessions || 0}</p></div>
            <div className="p-2 bg-purple-500/20 rounded-xl"><CheckCircle className="text-purple-400" size={24} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">تقييم المرضى</p><p className="text-2xl font-bold text-white">{stats.averageRating || 0}</p></div>
            <div className="p-2 bg-orange-500/20 rounded-xl"><Star className="text-orange-400" size={24} /></div>
          </div>
        </div>
      </div>
      
      {/* جدول المواعيد اليوم وآخر المرضى */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مواعيد اليوم */}
        <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Calendar size={18} className="text-blue-400" /> جدول المواعيد اليوم</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">لا توجد مواعيد اليوم</div>
            ) : (
              todaySchedule.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-14 text-white text-sm font-medium">{app.time}</div>
                    <div><p className="text-white text-sm">{app.patient}</p><p className="text-xs text-gray-400">{app.type}</p></div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* آخر المرضى */}
        <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Activity size={18} className="text-green-400" /> آخر المرضى</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentPatients.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">لا توجد بيانات</div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="p-2 bg-gray-700/30 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div><p className="font-semibold text-white text-sm">{patient.name}</p><p className="text-xs text-gray-400">{patient.age} سنة - آخر زيارة: {patient.lastVisit}</p><p className="text-xs text-gray-300 mt-1">{patient.diagnosis}</p></div>
                    <div className="text-right"><div className="text-xs text-blue-400">{patient.progress || 0}%</div><div className="w-16 bg-gray-600 rounded-full h-1 mt-1"><div className="bg-blue-500 h-1 rounded-full" style={{ width: `${patient.progress || 0}%` }}></div></div></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* إجراءات سريعة */}
      <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Zap size={18} className="text-yellow-400" /> إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={handleViewPatients}
            className="p-2 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/30 transition flex items-center justify-center gap-2 text-sm"
          >
            <Eye size={16} /> عرض المرضى
          </button>
          
          <button 
            onClick={handleOpenCheckIn}
            className="p-2 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30 transition flex items-center justify-center gap-2 text-sm"
            disabled={isSubmitting}
          >
            <LogIn size={16} /> تسجيل حضور
          </button>
          
          <button 
            onClick={handleOpenPrescription}
            className="p-2 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/30 transition flex items-center justify-center gap-2 text-sm"
          >
            <Pill size={16} /> كتابة روشتة
          </button>
          
          <button 
            onClick={handleRefreshReport}
            className="p-2 bg-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/30 transition flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw size={16} /> تحديث البيانات
          </button>
        </div>
      </div>

      {/* Modal تسجيل حضور */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden p-5 border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-white">تسجيل حضور المريض</h2>
              <button onClick={() => { setShowCheckInModal(false); setSelectedPatientForCheckIn(null); }} className="p-1 hover:bg-gray-700 rounded"><X size={18} className="text-gray-400" /></button>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-400 text-xs mb-2">اختر المريض من قائمة المواعيد القادمة:</p>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {scheduledPatients.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">لا توجد مواعيد قادمة</div>
                ) : (
                  scheduledPatients.map((patient) => (
                    <div 
                      key={patient.id}
                      onClick={() => setSelectedPatientForCheckIn(patient)}
                      className={`p-2 rounded-lg cursor-pointer transition border ${selectedPatientForCheckIn?.id === patient.id ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-700/30 border-transparent hover:bg-gray-700/50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white text-sm">{patient.patient}</p>
                          <p className="text-xs text-gray-400">الوقت: {patient.time} - {patient.type}</p>
                          <p className="text-xs text-gray-500">العمر: {patient.age} سنة</p>
                        </div>
                        {selectedPatientForCheckIn?.id === patient.id && <CheckCircle size={16} className="text-green-400" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-gray-700">
              <button onClick={handleConfirmCheckIn} disabled={!selectedPatientForCheckIn || isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-1.5 rounded-lg text-sm hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 size={14} className="inline animate-spin ml-1" /> : <CheckCircle size={14} className="inline ml-1" />}
                {isSubmitting ? 'جاري...' : 'تأكيد الحضور'}
              </button>
              <button onClick={() => { setShowCheckInModal(false); setSelectedPatientForCheckIn(null); }} className="flex-1 bg-gray-600 text-gray-300 py-1.5 rounded-lg text-sm hover:bg-gray-500 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal إنشاء روشتة */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-white">روشتة طبية جديدة</h2>
              <button onClick={() => setShowPrescriptionModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">اسم المريض *</label>
                <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="أدخل اسم المريض" value={newPrescription.patientName} onChange={(e) => setNewPrescription({...newPrescription, patientName: e.target.value})} />
              </div>
              
              <div><label className="block text-xs text-gray-400 mb-1">الأدوية</label>
                {newPrescription.medications.map((med, idx) => (
                  <div key={idx} className="bg-gray-700/30 rounded-lg p-2 mb-2">
                    <div className="flex justify-between items-center mb-1"><span className="text-xs text-gray-400">دواء #{idx + 1}</span>{idx > 0 && <button onClick={() => handleRemoveMedication(idx)} className="text-red-400"><Trash2 size={14} /></button>}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="اسم الدواء" className="p-1.5 bg-gray-700 rounded-lg text-white text-xs" value={med.name} onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)} />
                      <input type="text" placeholder="الجرعة" className="p-1.5 bg-gray-700 rounded-lg text-white text-xs" value={med.dosage} onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)} />
                      <input type="text" placeholder="عدد المرات" className="p-1.5 bg-gray-700 rounded-lg text-white text-xs" value={med.frequency} onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)} />
                      <input type="text" placeholder="المدة" className="p-1.5 bg-gray-700 rounded-lg text-white text-xs" value={med.duration} onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button onClick={handleAddMedication} className="w-full mt-1 bg-green-500/20 text-green-400 py-1.5 rounded-lg text-xs hover:bg-green-500/30 transition flex items-center justify-center gap-1"><Plus size={12} /> إضافة دواء</button>
              </div>
              
              <div><label className="block text-xs text-gray-400 mb-1">ملاحظات</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white text-sm" rows="2" placeholder="ملاحظات إضافية..." value={newPrescription.notes} onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})} /></div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button onClick={handleSavePrescription} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-1.5 rounded-lg text-sm hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={14} className="inline animate-spin mr-1" /> : null}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الروشتة'}
                </button>
                <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-1.5 rounded-lg text-sm hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}