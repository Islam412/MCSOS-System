// src/pages/dashboard/HospitalDashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, Activity,
  Stethoscope, Syringe, Pill, Thermometer, Heart, Brain, Bone,
  Edit, Trash2, Plus, X, CheckCircle, AlertCircle, Clock, BarChart3,
  Printer, Download, Eye, Wallet, Building, Award, Target, Sparkles,
  RefreshCw, Loader2, Phone, Mail, MapPin, User, Calendar as CalendarIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ========== استيراد الخدمات ==========
import { patientsService, doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function HospitalDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [user, setUser] = useState(null)

  // ========== بيانات من API ==========
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  // ========== بيانات محلية (لأن الـ Endpoints غير موجودة في API) ==========
  const [invoices, setInvoices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [medicalDevices, setMedicalDevices] = useState([])
  const [revenueData, setRevenueData] = useState([])

  // ========== إحصائيات ==========
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    todayAppointments: 0,
    completedAppointments: 0
  })

  // ========== حالة الأجهزة ==========
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deviceForm, setDeviceForm] = useState({
    name: '', category: 'diagnostic', status: 'available', quantity: 1,
    purchaseDate: '', warrantyUntil: '', manufacturer: '', price: 0, notes: ''
  })

  // ========== البيانات الافتراضية ==========
  const defaultInvoices = [
    { id: 1, patientName: 'أحمد محمد', amount: 500, status: 'paid', date: '2024-01-15' },
    { id: 2, patientName: 'سارة حسن', amount: 900, status: 'paid', date: '2024-01-14' },
    { id: 3, patientName: 'محمود علي', amount: 500, status: 'pending', date: '2024-01-13' },
    { id: 4, patientName: 'نورة عبدالله', amount: 1500, status: 'paid', date: '2024-01-12' },
    { id: 5, patientName: 'عمر خالد', amount: 900, status: 'pending', date: '2024-01-11' }
  ]

  const defaultAppointments = [
    { id: 1, patient: 'أحمد محمد', doctor: 'د. أحمد علي', date: '2024-05-25', time: '10:00', status: 'scheduled' },
    { id: 2, patient: 'سارة حسن', doctor: 'د. منى حسن', date: '2024-05-25', time: '11:00', status: 'scheduled' },
    { id: 3, patient: 'محمود علي', doctor: 'د. خالد محمود', date: '2024-05-24', time: '09:00', status: 'completed' },
    { id: 4, patient: 'نورة عبدالله', doctor: 'د. نورة سعيد', date: '2024-05-24', time: '14:00', status: 'completed' }
  ]

  const defaultDevices = [
    { id: 1, name: 'جهاز أشعة X-Ray', category: 'diagnostic', status: 'available', quantity: 2, manufacturer: 'Siemens', price: 150000 },
    { id: 2, name: 'جهاز الموجات فوق الصوتية', category: 'diagnostic', status: 'available', quantity: 1, manufacturer: 'GE Healthcare', price: 85000 },
    { id: 3, name: 'جهاز رسم القلب', category: 'diagnostic', status: 'maintenance', quantity: 1, manufacturer: 'Philips', price: 25000 },
    { id: 4, name: 'جهاز التنفس الصناعي', category: 'therapeutic', status: 'available', quantity: 3, manufacturer: 'Medtronic', price: 120000 },
    { id: 5, name: 'جهاز تحاليل الدم', category: 'lab', status: 'available', quantity: 2, manufacturer: 'Roche', price: 45000 }
  ]

  const defaultRevenue = [
    { name: 'يناير', revenue: 45000, profit: 32000 },
    { name: 'فبراير', revenue: 52000, profit: 38000 },
    { name: 'مارس', revenue: 48000, profit: 35000 },
    { name: 'أبريل', revenue: 61000, profit: 45000 },
    { name: 'مايو', revenue: 58000, profit: 42000 },
    { name: 'يونيو', revenue: 65000, profit: 48000 }
  ]

  // ========== تحميل البيانات ==========
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) setUser(JSON.parse(userData))
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    setApiError(null)
    try {
      await Promise.all([
        loadPatients(),
        loadDoctors(),
        loadInvoices(),
        loadAppointments(),
        loadDevices(),
        loadRevenueData()
      ])
      calculateStats()
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setApiError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل المرضى من API ==========
  const loadPatients = async () => {
    try {
      if (!isOnline) {
        const saved = localStorage.getItem('mcsos_patients_v2')
        if (saved) {
          setPatients(JSON.parse(saved))
          return
        }
        setPatients([])
        return
      }

      const response = await patientsService.getPatients()
      
      let data = Array.isArray(response) ? response : []
      if (!Array.isArray(response) && response?.patients) {
        data = response.patients
      }
      
      if (data && data.length > 0) {
        setPatients(data)
        localStorage.setItem('mcsos_patients_v2', JSON.stringify(data))
      } else {
        setPatients([])
      }
      
    } catch (error) {
      console.error('Error loading patients from API:', error)
      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_patients_v2')
      if (saved) {
        setPatients(JSON.parse(saved))
      } else {
        setPatients([])
      }
    }
  }

  // ========== تحميل الأطباء من API ==========
  const loadDoctors = async () => {
    try {
      if (!isOnline) {
        const saved = localStorage.getItem('mcsos_doctors')
        if (saved) {
          setDoctors(JSON.parse(saved))
          return
        }
        setDoctors([])
        return
      }

      const response = await doctorsService.getDoctors()
      
      let data = Array.isArray(response) ? response : []
      if (!Array.isArray(response) && response?.doctors) {
        data = response.doctors
      }
      
      if (data && data.length > 0) {
        setDoctors(data)
        localStorage.setItem('mcsos_doctors', JSON.stringify(data))
      } else {
        setDoctors([])
      }
      
    } catch (error) {
      console.error('Error loading doctors from API:', error)
      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_doctors')
      if (saved) {
        setDoctors(JSON.parse(saved))
      } else {
        setDoctors([])
      }
    }
  }

  // ========== تحميل الفواتير (محلياً) ==========
  const loadInvoices = async () => {
    try {
      const saved = localStorage.getItem('mcsos_invoices')
      if (saved) {
        const data = JSON.parse(saved)
        if (data && data.length > 0) {
          setInvoices(data)
          return
        }
      }
      // ✅ بيانات افتراضية
      setInvoices(defaultInvoices)
      localStorage.setItem('mcsos_invoices', JSON.stringify(defaultInvoices))
    } catch (error) {
      console.error('Error loading invoices:', error)
      setInvoices(defaultInvoices)
    }
  }

  // ========== تحميل المواعيد (محلياً) ==========
  const loadAppointments = async () => {
    try {
      const saved = localStorage.getItem('mcsos_appointments')
      if (saved) {
        const data = JSON.parse(saved)
        if (data && data.length > 0) {
          setAppointments(data)
          return
        }
      }
      // ✅ بيانات افتراضية
      setAppointments(defaultAppointments)
      localStorage.setItem('mcsos_appointments', JSON.stringify(defaultAppointments))
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments(defaultAppointments)
    }
  }

  // ========== تحميل الأجهزة الطبية (محلياً) ==========
  const loadDevices = async () => {
    try {
      const saved = localStorage.getItem('mcsos_medical_devices')
      if (saved) {
        const data = JSON.parse(saved)
        if (data && data.length > 0) {
          setMedicalDevices(data)
          return
        }
      }
      // ✅ بيانات افتراضية
      setMedicalDevices(defaultDevices)
      localStorage.setItem('mcsos_medical_devices', JSON.stringify(defaultDevices))
    } catch (error) {
      console.error('Error loading devices:', error)
      setMedicalDevices(defaultDevices)
    }
  }

  // ========== تحميل بيانات الإيرادات (محلياً) ==========
  const loadRevenueData = async () => {
    try {
      const saved = localStorage.getItem('mcsos_revenue_data')
      if (saved) {
        const data = JSON.parse(saved)
        if (data && data.length > 0) {
          setRevenueData(data)
          return
        }
      }
      // ✅ بيانات افتراضية
      setRevenueData(defaultRevenue)
      localStorage.setItem('mcsos_revenue_data', JSON.stringify(defaultRevenue))
    } catch (error) {
      console.error('Error loading revenue data:', error)
      setRevenueData(defaultRevenue)
    }
  }

  // ========== حساب الإحصائيات ==========
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0]
    
    const totalPatients = patients.length
    const totalDoctors = doctors.length
    const totalAppointments = appointments.length
    const todayAppointments = appointments.filter(a => a.date === today || a.date?.startsWith(today)).length
    const completedAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'attended').length
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || Number(inv.total) || 0), 0)
    const pendingRevenue = invoices
      .filter(inv => inv.status === 'pending' || inv.paymentStatus === 'pending' || inv.paymentStatus === 'unpaid')
      .reduce((sum, inv) => sum + (Number(inv.amount) || Number(inv.total) || 0), 0)

    setStats({
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue,
      pendingRevenue,
      todayAppointments,
      completedAppointments
    })
  }

  // ========== دوال مساعدة ==========
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'needed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': return 'متاح'
      case 'maintenance': return 'صيانة'
      case 'needed': return 'مطلوب'
      default: return status || 'غير محدد'
    }
  }

  const getCategoryText = (category) => {
    switch(category?.toLowerCase()) {
      case 'diagnostic': return 'تشخيصي'
      case 'therapeutic': return 'علاجي'
      case 'lab': return 'معملي'
      default: return category || 'عام'
    }
  }

  const getPatientStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ نشط</span>
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">✓ مكتمل</span>
      case 'pending': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ قيد الانتظار</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status || 'غير محدد'}</span>
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // ========== تجهيز بيانات الرسم البياني ==========
  const doctorPerformanceData = doctors.slice(0, 6).map(d => ({
    name: isRTL ? (d.nameAr || d.name) : (d.nameEn || d.name),
    patients: d.patientsCount || d.patients || 0,
    sessions: d.sessionsCount || d.sessions || 0,
    revenue: d.revenue || 0,
    performance: d.performance || d.utilization || 0
  }))

  // ========== تجهيز بيانات حالة الأجهزة ==========
  const availableDevices = medicalDevices.filter(d => d.status === 'available').reduce((sum, d) => sum + (d.quantity || 0), 0)
  const maintenanceDevices = medicalDevices.filter(d => d.status === 'maintenance').length
  const neededDevices = medicalDevices.filter(d => d.status === 'needed').length
  const totalDevicesValue = medicalDevices.reduce((sum, d) => sum + ((d.price || 0) * (d.quantity || 0)), 0)

  const deviceStatusData = [
    { name: 'متاح', value: availableDevices, color: '#22c55e' },
    { name: 'صيانة', value: maintenanceDevices, color: '#eab308' },
    { name: 'مطلوب', value: neededDevices, color: '#ef4444' }
  ].filter(d => d.value > 0)

  const COLORS = ['#22c55e', '#eab308', '#ef4444']

  // ========== دوال الأجهزة (محلية) ==========
  const handleAddDevice = () => {
    if (!deviceForm.name) {
      toast.error('الرجاء إدخال اسم الجهاز')
      return
    }

    setIsSubmitting(true)
    try {
      const newDevice = {
        id: Date.now(),
        ...deviceForm,
        quantity: parseInt(deviceForm.quantity) || 1,
        price: parseFloat(deviceForm.price) || 0
      }
      
      const updatedDevices = [...medicalDevices, newDevice]
      setMedicalDevices(updatedDevices)
      localStorage.setItem('mcsos_medical_devices', JSON.stringify(updatedDevices))
      
      toast.success('تم إضافة الجهاز بنجاح')
      setShowDeviceModal(false)
      setDeviceForm({ name: '', category: 'diagnostic', status: 'available', quantity: 1, purchaseDate: '', warrantyUntil: '', manufacturer: '', price: 0, notes: '' })
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إضافة الجهاز')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditDevice = (device) => {
    setEditingDevice(device)
    setDeviceForm(device)
    setShowDeviceModal(true)
  }

  const handleUpdateDevice = () => {
    if (!deviceForm.name) {
      toast.error('الرجاء إدخال اسم الجهاز')
      return
    }

    setIsSubmitting(true)
    try {
      const updatedDevices = medicalDevices.map(d => 
        d.id === editingDevice.id ? { 
          ...deviceForm, 
          id: d.id,
          quantity: parseInt(deviceForm.quantity) || 1,
          price: parseFloat(deviceForm.price) || 0
        } : d
      )
      
      setMedicalDevices(updatedDevices)
      localStorage.setItem('mcsos_medical_devices', JSON.stringify(updatedDevices))
      
      toast.success('تم تحديث الجهاز بنجاح')
      setShowDeviceModal(false)
      setEditingDevice(null)
      setDeviceForm({ name: '', category: 'diagnostic', status: 'available', quantity: 1, purchaseDate: '', warrantyUntil: '', manufacturer: '', price: 0, notes: '' })
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث الجهاز')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDevice = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجهاز؟')) return

    try {
      const updatedDevices = medicalDevices.filter(d => d.id !== id)
      setMedicalDevices(updatedDevices)
      localStorage.setItem('mcsos_medical_devices', JSON.stringify(updatedDevices))
      toast.success('تم حذف الجهاز بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الجهاز')
    }
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
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-400 mt-1">
            نظرة شاملة على أداء المستشفى
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل - بيانات محلية
              </span>
            )}
            {apiError && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                ⚠️ خطأ في الخادم
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshData} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث البيانات
          </button>
          <button 
            onClick={() => { setDeviceForm({ name: '', category: 'diagnostic', status: 'available', quantity: 1, purchaseDate: '', warrantyUntil: '', manufacturer: '', price: 0, notes: '' }); setEditingDevice(null); setShowDeviceModal(true); }} 
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-500/30"
          >
            <Plus size={18} /> إضافة جهاز
          </button>
          <button onClick={() => window.print()} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
            <Printer size={18} /> طباعة
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المرضى</p>
              <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={28} /></div>
          </div>
          <div className="mt-2 text-sm text-gray-400">الأطباء: <span className="text-white">{stats.totalDoctors}</span></div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl"><DollarSign className="text-green-400" size={28} /></div>
          </div>
          <div className="mt-2 text-sm text-gray-400">المعلق: <span className="text-yellow-400">{formatCurrency(stats.pendingRevenue)}</span></div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مواعيد اليوم</p>
              <p className="text-3xl font-bold text-white">{stats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={28} /></div>
          </div>
          <div className="mt-2 text-sm text-gray-400">مكتملة: <span className="text-green-400">{stats.completedAppointments}</span></div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المواعيد</p>
              <p className="text-3xl font-bold text-white">{stats.totalAppointments}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl"><Activity className="text-orange-400" size={28} /></div>
          </div>
          <div className="mt-2 text-sm text-gray-400">نسبة الإنجاز: <span className="text-blue-400">{stats.totalAppointments > 0 ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}%</span></div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">الإيرادات والأرباح الشهرية</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="الإيرادات" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#22c55e" name="الأرباح" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">لا توجد بيانات كافية</div>
          )}
        </div>
        
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">أداء الأطباء</h2>
          {doctorPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={doctorPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                <Legend />
                <Bar dataKey="patients" fill="#3b82f6" name="المرضى" />
                <Bar dataKey="sessions" fill="#8b5cf6" name="الجلسات" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">لا توجد بيانات كافية</div>
          )}
        </div>
      </div>

      {/* جدول الأطباء */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">أداء الأطباء</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm text-gray-300">الطبيب</th>
                <th className="px-6 py-3 text-sm text-gray-300">التخصص</th>
                <th className="px-6 py-3 text-sm text-gray-300">المرضى</th>
                <th className="px-6 py-3 text-sm text-gray-300">الجلسات</th>
                <th className="px-6 py-3 text-sm text-gray-300">الإيرادات</th>
                <th className="px-6 py-3 text-sm text-gray-300">الأداء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {doctors.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
              ) : (
                doctors.slice(0, 10).map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-semibold text-white">
                      {isRTL ? (doctor.nameAr || doctor.name) : (doctor.nameEn || doctor.name)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {isRTL ? (doctor.specializationAr || doctor.specialization) : (doctor.specializationEn || doctor.specialization)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{doctor.patientsCount || doctor.patients || 0}</td>
                    <td className="px-6 py-4 text-gray-300">{doctor.sessionsCount || doctor.sessions || 0}</td>
                    <td className="px-6 py-4 font-semibold text-green-400">{formatCurrency(doctor.revenue || 0)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${doctor.performance || doctor.utilization || 0}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-400">{doctor.performance || doctor.utilization || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* الأجهزة الطبية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">حالة الأجهزة</h2>
          {deviceStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={deviceStatusData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  dataKey="value" 
                  label
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">لا توجد بيانات</div>
          )}
          <div className="mt-4 space-y-2">
            {deviceStatusData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-300">{item.name}</span>
                </span>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white">قائمة الأجهزة الطبية</h2>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                  <th className="px-4 py-3 text-sm text-gray-300">الجهاز</th>
                  <th className="px-4 py-3 text-sm text-gray-300">الفئة</th>
                  <th className="px-4 py-3 text-sm text-gray-300">الكمية</th>
                  <th className="px-4 py-3 text-sm text-gray-300">السعر</th>
                  <th className="px-4 py-3 text-sm text-gray-300">الحالة</th>
                  <th className="px-4 py-3 text-sm text-gray-300">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {medicalDevices.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">لا توجد أجهزة</td></tr>
                ) : (
                  medicalDevices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{device.name}</div>
                        <div className="text-xs text-gray-500">{device.manufacturer || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{getCategoryText(device.category)}</td>
                      <td className="px-4 py-3 text-gray-300">{device.quantity}</td>
                      <td className="px-4 py-3 text-gray-300">{formatCurrency(device.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(device.status)}`}>
                          {getStatusText(device.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditDevice(device)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteDevice(device.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                            <Trash2 size={16} />
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
      </div>

      {/* تقدم المرضى */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">تقدم المرضى</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm text-gray-300">المريض</th>
                <th className="px-6 py-3 text-sm text-gray-300">التشخيص</th>
                <th className="px-6 py-3 text-sm text-gray-300">الجلسات</th>
                <th className="px-6 py-3 text-sm text-gray-300">التقدم</th>
                <th className="px-6 py-3 text-sm text-gray-300">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {patients.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
              ) : (
                patients.slice(0, 10).map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-semibold text-white">
                      {isRTL ? (patient.nameAr || patient.name) : (patient.nameEn || patient.name)}
                      <span className="text-xs text-gray-500 ml-2">({patient.age || 0} سنة)</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{patient.diagnosis || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{patient.completedSessions || 0}/{patient.totalSessions || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${(patient.progress || 0) >= 70 ? 'bg-green-500' : (patient.progress || 0) >= 40 ? 'bg-yellow-500' : 'bg-blue-500'}`} 
                               style={{ width: `${patient.progress || 0}%` }}>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{Math.round(patient.progress || 0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getPatientStatusBadge(patient.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة/تعديل جهاز */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingDevice ? 'تعديل جهاز طبي' : 'إضافة جهاز طبي جديد'}</h2>
              <button onClick={() => setShowDeviceModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">اسم الجهاز *</label>
                <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.name} onChange={(e) => setDeviceForm({...deviceForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">الفئة</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.category} onChange={(e) => setDeviceForm({...deviceForm, category: e.target.value})}>
                  <option value="diagnostic">تشخيصي</option>
                  <option value="therapeutic">علاجي</option>
                  <option value="lab">معملي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">الحالة</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.status} onChange={(e) => setDeviceForm({...deviceForm, status: e.target.value})}>
                  <option value="available">متاح</option>
                  <option value="maintenance">صيانة</option>
                  <option value="needed">مطلوب</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">الكمية</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.quantity} onChange={(e) => setDeviceForm({...deviceForm, quantity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">السعر</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.price} onChange={(e) => setDeviceForm({...deviceForm, price: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">الشركة المصنعة</label>
                <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.manufacturer} onChange={(e) => setDeviceForm({...deviceForm, manufacturer: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">تاريخ الشراء</label>
                <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.purchaseDate} onChange={(e) => setDeviceForm({...deviceForm, purchaseDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">تاريخ انتهاء الضمان</label>
                <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={deviceForm.warrantyUntil} onChange={(e) => setDeviceForm({...deviceForm, warrantyUntil: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">ملاحظات</label>
                <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={deviceForm.notes} onChange={(e) => setDeviceForm({...deviceForm, notes: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
              <button onClick={editingDevice ? handleUpdateDevice : handleAddDevice} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'جاري الحفظ...' : (editingDevice ? 'تحديث' : 'إضافة')}
              </button>
              <button onClick={() => setShowDeviceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}