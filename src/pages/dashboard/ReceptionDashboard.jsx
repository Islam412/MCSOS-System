import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  UserPlus, Calendar, Clock, Users, CheckCircle, Activity, Search, 
  Phone, Mail, MapPin, X, Save, Eye, Printer, FileText, 
  Edit, Trash2, Stethoscope, Award, Heart, AlertCircle, Droplet,
  User, Loader2, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { patientsService, appointmentsService, doctorsService } from '../services/api'
import { useServices } from '../context/ServiceContext'

export default function ReceptionDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // حالة النوافذ المنبثقة
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showEditPatientModal, setShowEditPatientModal] = useState(false)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // بيانات المريض الجديد
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    phone: '',
    address: ''
  })
  
  // بيانات المريض المراد تعديله
  const [editingPatient, setEditingPatient] = useState(null)
  const [editPatientData, setEditPatientData] = useState({
    name: '',
    age: '',
    phone: '',
    address: ''
  })
  
  // بيانات الموعد المراد تعديله
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [editAppointmentData, setEditAppointmentData] = useState({
    patient: '',
    doctor: '',
    time: '',
    status: ''
  })
  
  // بيانات الموعد الجديد
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    date: '',
    time: ''
  })
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedCheckIns: 0,
    waitingPatients: 0,
    newRegistrations: 0
  })
  
  const [todayAppointments, setTodayAppointments] = useState([])
  const [recentPatients, setRecentPatients] = useState([])
  const [patientsList, setPatientsList] = useState([])
  const [doctors, setDoctors] = useState([])

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
        loadDoctors(),
        loadTodayAppointments(),
        loadPatients()
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

  // ========== تحميل مواعيد اليوم ==========
  const loadTodayAppointments = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => appointmentsService.getTodayAppointments(),
          'today_appointments',
          JSON.parse(localStorage.getItem('mcsos_today_appointments') || '[]')
        )
        const data = response || []
        setTodayAppointments(data)
        localStorage.setItem('mcsos_today_appointments', JSON.stringify(data))
        
        // تحديث الإحصائيات
        const checkedIn = data.filter(a => a.status === 'checked-in').length
        const waiting = data.filter(a => a.status === 'waiting').length
        setStats(prev => ({
          ...prev,
          todayAppointments: data.length,
          completedCheckIns: checkedIn,
          waitingPatients: waiting
        }))
      } else {
        const saved = localStorage.getItem('mcsos_today_appointments')
        if (saved) {
          const data = JSON.parse(saved)
          setTodayAppointments(data)
          const checkedIn = data.filter(a => a.status === 'checked-in').length
          const waiting = data.filter(a => a.status === 'waiting').length
          setStats(prev => ({
            ...prev,
            todayAppointments: data.length,
            completedCheckIns: checkedIn,
            waitingPatients: waiting
          }))
        }
      }
    } catch (error) {
      console.error('Error loading today appointments:', error)
    }
  }

  // ========== تحميل المرضى ==========
  const loadPatients = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => patientsService.getPatients(),
          'patients',
          JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
        )
        const data = response || []
        setPatientsList(data)
        localStorage.setItem('mcsos_patients_v2', JSON.stringify(data))
        
        // تحديث آخر المرضى المسجلين
        const sorted = [...data].sort((a, b) => new Date(b.registerDate) - new Date(a.registerDate))
        setRecentPatients(sorted.slice(0, 5).map(p => ({
          id: p.id,
          name: p.nameAr || p.name,
          phone: p.phone,
          time: new Date(p.registerDate || Date.now()).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
          registeredBy: p.registeredBy || 'موظف'
        })))
        
        // تحديث إحصائيات التسجيلات الجديدة
        const today = new Date().toLocaleDateString()
        const newToday = data.filter(p => {
          const pDate = new Date(p.registerDate).toLocaleDateString()
          return pDate === today
        }).length
        setStats(prev => ({ ...prev, newRegistrations: newToday }))
      } else {
        const saved = localStorage.getItem('mcsos_patients_v2')
        if (saved) {
          const data = JSON.parse(saved)
          setPatientsList(data)
          const sorted = [...data].sort((a, b) => new Date(b.registerDate) - new Date(a.registerDate))
          setRecentPatients(sorted.slice(0, 5).map(p => ({
            id: p.id,
            name: p.nameAr || p.name,
            phone: p.phone,
            time: new Date(p.registerDate || Date.now()).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
            registeredBy: p.registeredBy || 'موظف'
          })))
        }
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  // ========== دوال مساعدة ==========
  const getStatusBadge = (status) => {
    switch(status) {
      case 'checked-in': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ تم الحضور</span>
      case 'waiting': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ في الانتظار</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">📅 مجدول</span>
    }
  }

  const getPatientStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ نشط</span>
    } else if (status === 'completed') {
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">✓ مكتمل</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
  }

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'text-red-400', 'A-': 'text-red-300',
      'B+': 'text-green-400', 'B-': 'text-green-300',
      'O+': 'text-blue-400', 'O-': 'text-blue-300',
      'AB+': 'text-purple-400', 'AB-': 'text-purple-300'
    }
    return colors[bloodType] || 'text-gray-400'
  }

  // ========== تسجيل حضور ==========
  const handleCheckIn = async (id) => {
    setIsSubmitting(true)
    try {
      if (isOnline) {
        await appointmentsService.checkInAppointment(id)
      }
      
      // تحديث محلياً
      setTodayAppointments(todayAppointments.map(app => 
        app.id === id ? { ...app, status: 'checked-in' } : app
      ))
      
      setStats(prev => ({
        ...prev,
        completedCheckIns: prev.completedCheckIns + 1,
        waitingPatients: Math.max(0, prev.waitingPatients - 1)
      }))
      
      toast.success('تم تسجيل حضور المريض')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تسجيل الحضور')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف موعد ==========
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) return

    try {
      if (isOnline) {
        await appointmentsService.deleteAppointment(id)
      }
      
      setTodayAppointments(todayAppointments.filter(app => app.id !== id))
      setStats(prev => ({
        ...prev,
        todayAppointments: prev.todayAppointments - 1
      }))
      
      toast.success('تم حذف الموعد بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الموعد')
    }
  }

  // ========== تعديل موعد ==========
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment)
    setEditAppointmentData({
      patient: appointment.patient,
      doctor: appointment.doctor,
      time: appointment.time,
      status: appointment.status
    })
    setShowEditAppointmentModal(true)
  }

  // ========== حفظ تعديل الموعد ==========
  const handleSaveAppointmentEdit = async () => {
    setIsSubmitting(true)
    try {
      if (isOnline) {
        await appointmentsService.updateAppointment(editingAppointment.id, {
          patient: editAppointmentData.patient,
          doctor: editAppointmentData.doctor,
          time: editAppointmentData.time,
          status: editAppointmentData.status
        })
      }
      
      setTodayAppointments(todayAppointments.map(app => 
        app.id === editingAppointment.id ? {
          ...app,
          patient: editAppointmentData.patient,
          doctor: editAppointmentData.doctor,
          time: editAppointmentData.time,
          status: editAppointmentData.status
        } : app
      ))
      
      setShowEditAppointmentModal(false)
      setEditingAppointment(null)
      toast.success('تم تعديل الموعد بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تعديل الموعد')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف مريض ==========
  const handleDeletePatient = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المريض؟')) return

    try {
      if (isOnline) {
        await patientsService.deletePatient(id)
      }
      
      const updated = patientsList.filter(p => p.id !== id)
      setPatientsList(updated)
      setRecentPatients(recentPatients.filter(p => p.id !== id))
      localStorage.setItem('mcsos_patients_v2', JSON.stringify(updated))
      
      toast.success('تم حذف المريض بنجاح')
      setShowPatientDetailsModal(false)
      setSelectedPatient(null)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف المريض')
    }
  }

  // ========== تعديل مريض ==========
  const handleEditPatient = (patient) => {
    setEditingPatient(patient)
    setEditPatientData({
      name: patient.nameAr || patient.name,
      age: patient.age || '',
      phone: patient.phone || '',
      address: patient.address || ''
    })
    setShowEditPatientModal(true)
  }

  // ========== حفظ تعديل المريض ==========
  const handleSavePatientEdit = async () => {
    setIsSubmitting(true)
    try {
      if (isOnline) {
        await patientsService.updatePatient(editingPatient.id, {
          name: editPatientData.name,
          phone: editPatientData.phone,
          age: parseInt(editPatientData.age) || 0,
          address: editPatientData.address
        })
      }
      
      const updated = patientsList.map(p => 
        p.id === editingPatient.id ? {
          ...p,
          nameAr: editPatientData.name,
          nameEn: editPatientData.name,
          age: parseInt(editPatientData.age) || 0,
          phone: editPatientData.phone,
          address: editPatientData.address
        } : p
      )
      setPatientsList(updated)
      localStorage.setItem('mcsos_patients_v2', JSON.stringify(updated))
      
      setRecentPatients(recentPatients.map(p => 
        p.id === editingPatient.id ? {
          ...p,
          name: editPatientData.name,
          phone: editPatientData.phone
        } : p
      ))
      
      if (selectedPatient && selectedPatient.id === editingPatient.id) {
        setSelectedPatient(updated.find(p => p.id === editingPatient.id))
      }
      
      setShowEditPatientModal(false)
      setEditingPatient(null)
      toast.success('تم تعديل بيانات المريض بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تعديل المريض')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== تسجيل مريض جديد ==========
  const handleRegisterPatient = async () => {
    if (!newPatient.name) {
      toast.error('الرجاء إدخال اسم المريض')
      return
    }

    setIsSubmitting(true)
    try {
      const patientData = {
        nameAr: newPatient.name,
        nameEn: newPatient.name,
        age: parseInt(newPatient.age) || 0,
        phone: newPatient.phone || '',
        address: newPatient.address || '',
        status: 'active',
        registeredBy: user?.name || 'موظف الاستقبال'
      }

      let newPatientData
      if (isOnline) {
        const response = await patientsService.createPatient(patientData)
        newPatientData = response?.patient || response
      } else {
        newPatientData = {
          ...patientData,
          id: Date.now(),
          _syncPending: true,
          registerDate: new Date().toISOString(),
          diagnosis: 'قيد التشخيص',
          doctor: '',
          lastVisit: new Date().toISOString().split('T')[0],
          totalSessions: 6,
          completedSessions: 0,
          progress: 0,
          bloodType: ''
        }
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      const updated = [newPatientData, ...patientsList]
      setPatientsList(updated)
      localStorage.setItem('mcsos_patients_v2', JSON.stringify(updated))
      
      setRecentPatients([{
        id: newPatientData.id,
        name: newPatientData.nameAr || newPatientData.name,
        phone: newPatientData.phone,
        time: new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
        registeredBy: user?.name || 'موظف'
      }, ...recentPatients.slice(0, 4)])
      
      setStats(prev => ({
        ...prev,
        newRegistrations: prev.newRegistrations + 1
      }))
      
      toast.success(`تم تسجيل المريض ${newPatient.name} بنجاح`)
      setNewPatient({ name: '', age: '', phone: '', address: '' })
      setShowNewPatientModal(false)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تسجيل المريض')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حجز موعد جديد ==========
  const handleBookAppointment = async () => {
    if (!newAppointment.patientName || !newAppointment.doctorName || !newAppointment.date || !newAppointment.time) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }

    setIsSubmitting(true)
    try {
      const appointmentData = {
        patientName: newAppointment.patientName,
        patientId: newAppointment.patientId || Date.now(),
        doctorId: newAppointment.doctorId,
        date: newAppointment.date,
        time: newAppointment.time,
        status: 'scheduled'
      }

      if (isOnline) {
        await appointmentsService.bookAppointment(appointmentData)
      }

      const newApp = {
        id: Date.now(),
        ...appointmentData,
        _syncPending: !isOnline
      }

      const today = new Date().toISOString().split('T')[0]
      if (appointmentData.date === today) {
        setTodayAppointments([...todayAppointments, newApp])
        setStats(prev => ({
          ...prev,
          todayAppointments: prev.todayAppointments + 1
        }))
      }

      toast.success(`تم حجز موعد للمريض ${newAppointment.patientName} مع ${newAppointment.doctorName}`)
      setNewAppointment({ patientId: '', patientName: '', doctorId: '', doctorName: '', date: '', time: '' })
      setShowAppointmentModal(false)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حجز الموعد')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== دالة فتح نافذة حجز موعد من تفاصيل المريض ==========
  const handleBookAppointmentFromDetails = (patient) => {
    setNewAppointment({
      patientId: patient.id,
      patientName: patient.nameAr || patient.name,
      doctorId: '',
      doctorName: '',
      date: '',
      time: ''
    })
    setShowPatientDetailsModal(false)
    setShowAppointmentModal(true)
  }

  // ========== البحث عن مريض ==========
  const handleSearchPatient = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      if (isOnline) {
        const results = await patientsService.searchPatients(searchQuery)
        setSearchResults(results || [])
      } else {
        const allPatients = patientsList
        const results = allPatients.filter(p => 
          p.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone?.includes(searchQuery)
        )
        setSearchResults(results)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('حدث خطأ في البحث')
    }
  }

  // ========== عرض تفاصيل المريض ==========
  const viewPatientDetails = (patient) => {
    const fullPatient = patientsList.find(p => p.id === patient.id) || patient
    setSelectedPatient(fullPatient)
    setShowPatientDetailsModal(true)
  }

  // ========== إنشاء تقرير يومي ==========
  const generateDailyReport = () => {
    const today = new Date().toLocaleDateString('ar')
    const todayApps = todayAppointments
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>التقرير اليومي - ${today}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; background: white; margin: 0; }
            .report { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a5f; }
            .date { color: #6b7280; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; font-size: 18px; color: #2563eb; border-right: 3px solid #2563eb; padding-right: 10px; margin-bottom: 15px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f3f4f6; padding: 15px; border-radius: 8px; }
            .stat-item { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1e3a5f; }
            .stat-label { font-size: 12px; color: #6b7280; }
            .list-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
            @media print { body { padding: 0; } .report { box-shadow: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header"><div class="title">نظام المركز الطبي MCSOS</div><div class="date">التقرير اليومي - ${today}</div></div>
            <div class="section"><div class="section-title">📊 إحصائيات اليوم</div><div class="stats-grid">
              <div class="stat-item"><div class="stat-value">${stats.todayAppointments}</div><div class="stat-label">مواعيد اليوم</div></div>
              <div class="stat-item"><div class="stat-value">${stats.completedCheckIns}</div><div class="stat-label">تم الحضور</div></div>
              <div class="stat-item"><div class="stat-value">${stats.waitingPatients}</div><div class="stat-label">مرضى في الانتظار</div></div>
              <div class="stat-item"><div class="stat-value">${stats.newRegistrations}</div><div class="stat-label">مرضى جدد</div></div>
            </div></div>
            <div class="section"><div class="section-title">📋 مواعيد اليوم</div>${todayApps.map(a => `<div class="list-item">⏰ ${a.time} - ${a.patient} (${a.doctor})</div>`).join('') || '<div class="list-item">لا توجد مواعيد اليوم</div>'}</div>
            <div class="section"><div class="section-title">👤 آخر المرضى المسجلين</div>${recentPatients.map(p => `<div class="list-item">👨‍⚕️ ${p.name} - ${p.time}</div>`).join('')}</div>
            <div class="footer">تم إنشاء التقرير بواسطة ${user?.name || 'موظف الاستقبال'} | نظام MCSOS</div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('تم إنشاء التقرير اليومي')
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadAllData()
    toast.success('تم تحديث البيانات')
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
      <div>
        <h1 className="text-3xl font-bold gradient-text">لوحة تحكم الاستقبال</h1>
        <p className="text-gray-400 mt-1">
          مرحباً {user?.name || 'نورة عبدالله'} | إدارة المرضى والمواعيد
          {!isOnline && (
            <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
              ⚡ غير متصل
            </span>
          )}
        </p>
      </div>
      
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">مواعيد اليوم</p><p className="text-3xl font-bold text-white">{stats.todayAppointments}</p></div>
            <div className="p-3 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={28} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">تم الحضور</p><p className="text-3xl font-bold text-white">{stats.completedCheckIns}</p></div>
            <div className="p-3 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={28} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-5 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">مرضى في الانتظار</p><p className="text-3xl font-bold text-white">{stats.waitingPatients}</p></div>
            <div className="p-3 bg-yellow-500/20 rounded-xl"><Clock className="text-yellow-400" size={28} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">تسجيلات جديدة</p><p className="text-3xl font-bold text-white">{stats.newRegistrations}</p></div>
            <div className="p-3 bg-purple-500/20 rounded-xl"><UserPlus className="text-purple-400" size={28} /></div>
          </div>
        </div>
      </div>
      
      {/* مواعيد اليوم وآخر المرضى */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مواعيد اليوم */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-400" /> مواعيد اليوم</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayAppointments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">لا توجد مواعيد اليوم</div>
            ) : (
              todayAppointments.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-white font-medium">{app.time}</div>
                    <div><p className="text-white">{app.patient}</p><p className="text-xs text-gray-400">{app.doctor}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(app.status)}
                    <button 
                      onClick={() => handleCheckIn(app.id)} 
                      disabled={app.status !== 'scheduled' || isSubmitting} 
                      className={`px-2 py-1 rounded-lg text-xs ${app.status === 'scheduled' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-600 text-gray-500 cursor-not-allowed'}`}
                    >
                      تسجيل حضور
                    </button>
                    {app.status === 'scheduled' && (
                      <>
                        <button onClick={() => handleEditAppointment(app)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded opacity-0 group-hover:opacity-100 transition"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteAppointment(app.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
                      </>
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
        
        {/* آخر المرضى المسجلين */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UserPlus size={20} className="text-green-400" /> آخر المرضى المسجلين</h2>
          <div className="space-y-3">
            {recentPatients.length === 0 ? (
              <div className="text-center text-gray-400 py-8">لا يوجد مرضى مسجلين</div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="p-3 bg-gray-700/30 rounded-lg group">
                  <div className="flex justify-between">
                    <div><p className="font-semibold text-white">{patient.name}</p><p className="text-xs text-gray-400">{patient.phone || 'لا يوجد رقم'}</p></div>
                    <span className="text-xs text-gray-500">{patient.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">بواسطة: {patient.registeredBy || 'موظف'}</span>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const found = patientsList.find(p => p.nameAr === patient.name || p.id === patient.id)
                        if (found) viewPatientDetails(found)
                        else viewPatientDetails(patient)
                      }} className="text-blue-400 hover:bg-blue-500/20 p-1 rounded text-xs flex items-center gap-1"><Eye size={12} /> عرض</button>
                      <button onClick={() => handleEditPatient(patient)} className="text-yellow-400 hover:bg-yellow-500/20 p-1 rounded text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"><Edit size={12} /> تعديل</button>
                      <button onClick={() => handleDeletePatient(patient.id)} className="text-red-400 hover:bg-red-500/20 p-1 rounded text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /> حذف</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* إجراءات سريعة */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Search size={20} className="text-purple-400" /> إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button onClick={() => setShowNewPatientModal(true)} className="p-3 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/30 transition flex items-center justify-center gap-2"><UserPlus size={18} /> تسجيل مريض</button>
          <button onClick={() => setShowAppointmentModal(true)} className="p-3 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30 transition flex items-center justify-center gap-2"><Calendar size={18} /> حجز موعد</button>
          <button onClick={() => setShowSearchModal(true)} className="p-3 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/30 transition flex items-center justify-center gap-2"><Search size={18} /> بحث</button>
          <button onClick={generateDailyReport} className="p-3 bg-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/30 transition flex items-center justify-center gap-2"><Printer size={18} /> تقرير يومي</button>
          <button onClick={refreshData} className="p-3 bg-teal-500/20 rounded-xl text-teal-400 hover:bg-teal-500/30 transition flex items-center justify-center gap-2"><RefreshCw size={18} /> تحديث</button>
        </div>
      </div>
      
      {/* باقي المودالات - نفس الكود مع تحديث الدوال */}
      {/* Modal تسجيل مريض جديد */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">تسجيل مريض جديد</h2><button onClick={() => setShowNewPatientModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="الاسم الكامل *" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} />
              <input type="number" placeholder="العمر" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} />
              <input type="tel" placeholder="رقم الجوال" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} />
              <input type="text" placeholder="العنوان" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.address} onChange={(e) => setNewPatient({...newPatient, address: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button onClick={handleRegisterPatient} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : <Save size={16} className="inline ml-1" />}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setShowNewPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal حجز موعد */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">حجز موعد جديد</h2><button onClick={() => setShowAppointmentModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="اسم المريض *" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newAppointment.patientName} onChange={(e) => setNewAppointment({...newAppointment, patientName: e.target.value})} />
              <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newAppointment.doctorId} onChange={(e) => { const doctor = doctors.find(d => d.id === parseInt(e.target.value)); setNewAppointment({...newAppointment, doctorId: doctor?.id || '', doctorName: doctor?.name || ''}); }}>
                <option value="">اختر الطبيب *</option>
                {doctors.map(d => (<option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>))}
              </select>
              <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newAppointment.date} onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})} />
              <input type="time" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newAppointment.time} onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button onClick={handleBookAppointment} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : <Calendar size={16} className="inline ml-1" />}
                  {isSubmitting ? 'جاري الحجز...' : 'حجز'}
                </button>
                <button onClick={() => setShowAppointmentModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal بحث عن مريض */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">البحث عن مريض</h2><button onClick={() => setShowSearchModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="ابحث بالاسم أو رقم الجوال..." className="flex-1 p-2 bg-gray-700 rounded-lg text-white" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleSearchPatient(); }} />
              <button onClick={handleSearchPatient} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"><Search size={20} /></button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {searchResults.length === 0 && searchQuery && <div className="text-center text-gray-400 py-8">لا توجد نتائج</div>}
              {searchResults.map(patient => (
                <div key={patient.id} className="bg-gray-700/50 rounded-lg p-3 mb-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{patient.nameAr || patient.name}</div>
                    <div className="text-xs text-gray-400">{patient.phone || 'لا يوجد رقم'} | العمر: {patient.age || '-'}</div>
                    <div className="text-xs text-gray-500 mt-1">{patient.diagnosis || 'لا يوجد تشخيص'}</div>
                  </div>
                  <button 
                    onClick={() => {
                      viewPatientDetails(patient)
                      setShowSearchModal(false)
                    }} 
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition flex items-center gap-1"
                  >
                    <Eye size={14} /> عرض
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal تعديل موعد */}
      {showEditAppointmentModal && editingAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">تعديل الموعد</h2><button onClick={() => setShowEditAppointmentModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="اسم المريض" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editAppointmentData.patient} onChange={(e) => setEditAppointmentData({...editAppointmentData, patient: e.target.value})} />
              <input type="text" placeholder="اسم الطبيب" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editAppointmentData.doctor} onChange={(e) => setEditAppointmentData({...editAppointmentData, doctor: e.target.value})} />
              <input type="time" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editAppointmentData.time} onChange={(e) => setEditAppointmentData({...editAppointmentData, time: e.target.value})} />
              <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editAppointmentData.status} onChange={(e) => setEditAppointmentData({...editAppointmentData, status: e.target.value})}><option value="scheduled">مجدول</option><option value="waiting">في الانتظار</option><option value="checked-in">تم الحضور</option></select>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveAppointmentEdit} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : <Save size={16} className="inline ml-1" />}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setShowEditAppointmentModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal تعديل مريض */}
      {showEditPatientModal && editingPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">تعديل بيانات المريض</h2><button onClick={() => setShowEditPatientModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="الاسم الكامل" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatientData.name} onChange={(e) => setEditPatientData({...editPatientData, name: e.target.value})} />
              <input type="number" placeholder="العمر" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatientData.age} onChange={(e) => setEditPatientData({...editPatientData, age: e.target.value})} />
              <input type="tel" placeholder="رقم الجوال" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatientData.phone} onChange={(e) => setEditPatientData({...editPatientData, phone: e.target.value})} />
              <input type="text" placeholder="العنوان" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editPatientData.address} onChange={(e) => setEditPatientData({...editPatientData, address: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button onClick={handleSavePatientEdit} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin inline ml-1" /> : <Save size={16} className="inline ml-1" />}
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setShowEditPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal عرض تفاصيل المريض */}
      {showPatientDetailsModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تفاصيل المريض</h2>
              <div className="flex gap-2">
                <button onClick={() => handleDeletePatient(selectedPatient.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded transition"><Trash2 size={18} /></button>
                <button onClick={() => setShowPatientDetailsModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                {selectedPatient.nameAr?.charAt(0) || selectedPatient.name?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedPatient.nameAr || selectedPatient.name}</h3>
                <p className="text-gray-400">{selectedPatient.nameEn || ''}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getPatientStatusBadge(selectedPatient.status)}
                  <span className="text-xs text-gray-500">رقم الملف: PAT-{selectedPatient.id}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2"><User size={16} /> المعلومات الشخصية</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">العمر:</span><span className="text-white">{selectedPatient.age || '-'} سنة</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">رقم الجوال:</span><span className="text-white dir-ltr">{selectedPatient.phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">البريد الإلكتروني:</span><span className="text-white">{selectedPatient.email || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">العنوان:</span><span className="text-white">{selectedPatient.address || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">فصيلة الدم:</span><span className={getBloodTypeColor(selectedPatient.bloodType)}>{selectedPatient.bloodType || '-'}</span></div>
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2"><Stethoscope size={16} /> المعلومات الطبية</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">التشخيص:</span><span className="text-white">{selectedPatient.diagnosis || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">الطبيب المعالج:</span><span className="text-white">{selectedPatient.doctor || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">آخر زيارة:</span><span className="text-white">{selectedPatient.lastVisit || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">تاريخ التسجيل:</span><span className="text-white">{selectedPatient.registerDate ? new Date(selectedPatient.registerDate).toLocaleDateString() : '-'}</span></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2"><Activity size={16} /> تقدم العلاج</h4>
              <div className="flex justify-between items-center mb-2"><span className="text-gray-400 text-sm">الجلسات:</span><span className="text-white text-sm">{selectedPatient.completedSessions || 0} / {selectedPatient.totalSessions || 0}</span></div>
              <div className="w-full bg-gray-700 rounded-full h-3"><div className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500" style={{ width: `${selectedPatient.progress || 0}%` }}></div></div>
              <div className="flex justify-between items-center mt-2"><span className="text-gray-400 text-sm">نسبة التقدم:</span><span className="text-blue-400 font-bold">{selectedPatient.progress || 0}%</span></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-xl p-4"><h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2"><AlertCircle size={16} /> الحساسية</h4><p className="text-gray-300 text-sm">{selectedPatient.allergies || 'لا توجد حساسية معروفة'}</p></div>
              <div className="bg-gray-700/30 rounded-xl p-4"><h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2"><Heart size={16} /> الأمراض المزمنة</h4><p className="text-gray-300 text-sm">{selectedPatient.chronicDiseases || 'لا توجد أمراض مزمنة'}</p></div>
            </div>
            
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
              <button onClick={() => { handleEditPatient(selectedPatient); setShowPatientDetailsModal(false); }} className="flex-1 bg-yellow-500/20 text-yellow-400 py-2 rounded-lg hover:bg-yellow-500/30 transition flex items-center justify-center gap-2">
                <Edit size={16} /> تعديل
              </button>
              <button onClick={() => handleBookAppointmentFromDetails(selectedPatient)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2">
                <Calendar size={16} /> حجز موعد
              </button>
              <button onClick={() => setShowPatientDetailsModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}