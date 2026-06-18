// src/pages/DoctorDashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, Calendar, Clock, Activity, CheckCircle, TrendingUp, 
  User, Stethoscope, Pill, FileText, Printer, RefreshCw, 
  LogIn, Eye, Download, Star, Heart, Brain, Bone, Award,
  MessageCircle, Phone, Mail, Video, Settings, Bell, Home,
  Zap, Target, Shield, AlertCircle, Plus, Edit, Trash2, Save, X,
  Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { appointmentsService, patientsService, prescriptionsService } from '../services/api'
import { useServices } from '../context/ServiceContext'

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  
  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // إحصائيات الطبيب
  const [stats, setStats] = useState({
    rating: 0,
    completedSessions: 0,
    totalPatients: 0,
    todayPatients: 0,
    pendingSessions: 0,
    upcomingAppointments: 0,
    averageRating: 0
  })
  
  // جدول المواعيد اليوم
  const [todaySchedule, setTodaySchedule] = useState([])
  
  // قائمة المرضى
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
      const parsed = JSON.parse(userData)
      setUser(parsed)
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

  // ========== تحميل الإحصائيات ==========
  const loadStats = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => get('/stats/doctor'),
          'doctor_stats',
          JSON.parse(localStorage.getItem('mcsos_doctor_stats') || '{}')
        )
        const data = response || {}
        setStats({
          rating: data.rating || 0,
          completedSessions: data.completedSessions || 0,
          totalPatients: data.totalPatients || 0,
          todayPatients: data.todayPatients || 0,
          pendingSessions: data.pendingSessions || 0,
          upcomingAppointments: data.upcomingAppointments || 0,
          averageRating: data.averageRating || 0
        })
        localStorage.setItem('mcsos_doctor_stats', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_doctor_stats')
        if (saved) {
          const data = JSON.parse(saved)
          setStats(data)
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // ========== تحميل مواعيد اليوم ==========
  const loadTodaySchedule = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => appointmentsService.getTodayAppointments(),
          'today_appointments',
          JSON.parse(localStorage.getItem('mcsos_today_appointments') || '[]')
        )
        const data = response || []
        setTodaySchedule(data)
        localStorage.setItem('mcsos_today_appointments', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_today_appointments')
        if (saved) setTodaySchedule(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading today schedule:', error)
    }
  }

  // ========== تحميل آخر المرضى ==========
  const loadRecentPatients = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => patientsService.getPatients({ limit: 5, recent: true }),
          'recent_patients',
          JSON.parse(localStorage.getItem('mcsos_recent_patients') || '[]')
        )
        const data = response || []
        setRecentPatients(data)
        localStorage.setItem('mcsos_recent_patients', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_recent_patients')
        if (saved) setRecentPatients(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading recent patients:', error)
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

  // ========== حالة الموعد ==========
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ مكتمل</span>
      case 'in-progress': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ جاري</span>
      case 'upcoming':
      case 'scheduled': return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">📅 قادم</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  // ========== دالة تحديث التقرير ==========
  const handleRefreshReport = () => {
    loadAllData()
    toast.success('تم تحديث التقرير بنجاح')
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
            .doctor-name { font-size: 18px; color: #2563eb; margin-top: 5px; }
            .date { color: #6b7280; margin-top: 5px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 18px; color: #2563eb; border-right: 3px solid #2563eb; padding-right: 10px; margin-bottom: 15px; }
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
            <div class="section">
              <div class="section-title">📊 إحصائياتي</div>
              <div class="stats-grid">
                <div class="stat-card"><div class="stat-value">${stats.rating || 0}</div><div class="stat-label">تقييمي</div></div>
                <div class="stat-card"><div class="stat-value">${stats.completedSessions || 0}</div><div class="stat-label">جلسات مكتملة</div></div>
                <div class="stat-card"><div class="stat-value">${stats.totalPatients || 0}</div><div class="stat-label">إجمالي المرضى</div></div>
                <div class="stat-card"><div class="stat-value">${stats.todayPatients || 0}</div><div class="stat-label">مرضى اليوم</div></div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">📅 مواعيدي اليوم</div>
              <table>
                <thead><tr><th>الوقت</th><th>المريض</th><th>العمر</th><th>النوع</th><th>الحالة</th></tr></thead>
                <tbody>${todaySchedule.map(s => `<tr><td>${s.time}</td><td>${s.patient}</td><td>${s.age}</td><td>${s.type}</td><td>${s.status === 'completed' ? 'مكتمل' : s.status === 'in-progress' ? 'جاري' : 'قادم'}</td></tr>`).join('')}</tbody>
              </table>
            </div>
            <div class="footer">تم إنشاء هذا التقرير بواسطة نظام MCSOS</div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري طباعة التقرير...')
  }

  // ========== دالة تسجيل حضور ==========
  const handleCheckIn = async (id) => {
    setIsSubmitting(true)
    try {
      if (isOnline) {
        await appointmentsService.checkInAppointment(id)
      }
      
      setTodaySchedule(todaySchedule.map(app => 
        app.id === id ? { ...app, status: 'completed' } : app
      ))
      
      setStats(prev => ({
        ...prev,
        completedSessions: prev.completedSessions + 1
      }))
      
      toast.success('تم تسجيل حضور المريض')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تسجيل الحضور')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== دالة عرض المرضى ==========
  const handleViewPatients = () => {
    navigate('/patients')
  }

  // ========== دالة إنشاء روشتة جديدة ==========
  const handleNewPrescription = () => {
    setNewPrescription({
      patientName: '',
      patientId: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: ''
    })
    setShowPrescriptionModal(true)
  }

  // ========== دالة إضافة دواء في الروشتة ==========
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

  // ========== دالة حفظ الروشتة ==========
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
        doctorName: user?.name
      }

      if (isOnline) {
        await prescriptionsService.createPrescription(prescriptionData)
      } else {
        const existing = JSON.parse(localStorage.getItem('mcsos_prescriptions') || '[]')
        existing.push({ ...prescriptionData, id: Date.now(), _syncPending: true })
        localStorage.setItem('mcsos_prescriptions', JSON.stringify(existing))
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }
      
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

  // ========== دالة تسجيل حضور أول مريض قادم ==========
  const handleCheckInUpcoming = () => {
    const upcomingApp = todaySchedule.find(app => app.status === 'upcoming' || app.status === 'scheduled')
    if (upcomingApp) {
      handleCheckIn(upcomingApp.id)
    } else {
      toast.info('لا توجد مواعيد قادمة لتسجيل الحضور')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">تقييمي</p><p className="text-3xl font-bold text-white">{stats.rating || 0}</p></div><div className="p-3 bg-blue-500/20 rounded-xl"><Star className="text-blue-400" size={28} /></div></div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-3xl font-bold text-white">{stats.completedSessions || 0}</p></div><div className="p-3 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={28} /></div></div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">إجمالي المرضى</p><p className="text-3xl font-bold text-white">{stats.totalPatients || 0}</p></div><div className="p-3 bg-purple-500/20 rounded-xl"><Users className="text-purple-400" size={28} /></div></div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">مرضى اليوم</p><p className="text-3xl font-bold text-white">{stats.todayPatients || 0}</p></div><div className="p-3 bg-orange-500/20 rounded-xl"><Calendar className="text-orange-400" size={28} /></div></div>
        </div>
      </div>
      
      {/* جدول المواعيد اليوم وآخر المرضى */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مواعيد اليوم */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-400" /> جدول المواعيد اليوم</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todaySchedule.length === 0 ? (
              <div className="text-center text-gray-400 py-8">لا توجد مواعيد اليوم</div>
            ) : (
              todaySchedule.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-white font-medium">{app.time}</div>
                    <div><p className="text-white">{app.patient}</p><p className="text-xs text-gray-400">{app.type}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(app.status)}
                    {app.status !== 'completed' && app.status !== 'in-progress' && (
                      <button 
                        onClick={() => handleCheckIn(app.id)} 
                        disabled={isSubmitting}
                        className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 disabled:opacity-50"
                      >
                        تسجيل حضور
                      </button>
                    )}
                    {app._syncPending && (
                      <span className="text-xs text-yellow-400">⏳ مزامنة</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* آخر المرضى */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Users size={20} className="text-green-400" /> آخر المرضى</h2>
          <div className="space-y-3">
            {recentPatients.length === 0 ? (
              <div className="text-center text-gray-400 py-8">لا توجد بيانات</div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div><p className="font-semibold text-white">{patient.name}</p><p className="text-xs text-gray-400">{patient.age} سنة - آخر زيارة: {patient.lastVisit}</p><p className="text-sm text-gray-300 mt-1">{patient.diagnosis}</p></div>
                    <div className="text-right"><div className="text-sm text-blue-400">{patient.progress || 0}%</div><div className="w-24 bg-gray-600 rounded-full h-1.5 mt-1"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${patient.progress || 0}%` }}></div></div></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* إجراءات سريعة */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={handleRefreshReport}
            className="p-3 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> تحديث التقرير
          </button>
          
          <button 
            onClick={handleNewPrescription}
            className="p-3 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
          >
            <Pill size={18} /> روشتة جديدة
          </button>
          
          <button 
            onClick={handleCheckInUpcoming}
            disabled={isSubmitting}
            className="p-3 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} /> تسجيل حضور
          </button>
          
          <button 
            onClick={handleViewPatients}
            className="p-3 bg-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/30 transition flex items-center justify-center gap-2"
          >
            <Eye size={18} /> عرض المرضى
          </button>
        </div>
      </div>

      {/* Modal إنشاء روشتة جديدة */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">روشتة طبية جديدة</h2>
              <button onClick={() => setShowPrescriptionModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">اسم المريض *</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                  placeholder="أدخل اسم المريض" 
                  value={newPrescription.patientName} 
                  onChange={(e) => setNewPrescription({...newPrescription, patientName: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">الأدوية</label>
                {newPrescription.medications.map((med, idx) => (
                  <div key={idx} className="bg-gray-700/30 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">دواء #{idx + 1}</span>
                      {idx > 0 && <button onClick={() => handleRemoveMedication(idx)} className="text-red-400"><Trash2 size={16} /></button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="اسم الدواء" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.name} onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)} />
                      <input type="text" placeholder="الجرعة" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.dosage} onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)} />
                      <input type="text" placeholder="عدد المرات" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.frequency} onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)} />
                      <input type="text" placeholder="المدة" className="p-2 bg-gray-700 rounded-lg text-white text-sm" value={med.duration} onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button onClick={handleAddMedication} className="w-full mt-2 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm hover:bg-green-500/30 transition flex items-center justify-center gap-2"><Plus size={14} /> إضافة دواء</button>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">ملاحظات</label>
                <textarea 
                  className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                  rows="3" 
                  placeholder="ملاحظات إضافية..." 
                  value={newPrescription.notes} 
                  onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})} 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSavePrescription} 
                  disabled={isSubmitting}
                  className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : null}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الروشتة'}
                </button>
                <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
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