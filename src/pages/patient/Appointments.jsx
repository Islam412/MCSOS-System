// src/pages/patient/Appointments.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, Clock, MapPin, Stethoscope, CheckCircle, CalendarDays, 
  Bell, MessageCircle, Eye, Plus, Search, Filter, X, 
  User, Phone, Mail, AlertCircle, Video, Download, Printer,
  ChevronRight, ChevronLeft, Sparkles, Heart, Shield, Star,
  ArrowRight, Clock8, CalendarCheck, Building, Smartphone, Award,
  Send, Copy, Share2, Bookmark, Trash2, Edit, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { confirmAlert } from '../../utils/confirmAlert'
import BookingCalendar from '../../components/scheduling/BookingCalendar'

// ========== استيراد الخدمات ==========
import { appointmentsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function Appointments() {
  const navigate = useNavigate()
  
  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()
  
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('calendar') // 'list' | 'calendar'
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadAppointments()
  }, [])

  // ========== تحميل المواعيد من API ==========
  const loadAppointments = async () => {
    setLoading(true)
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => appointmentsService.getAppointments({ patientId: user?.id }),
          'appointments',
          JSON.parse(localStorage.getItem('mcsos_appointments_v2') || '[]')
        )
        const data = response || []
        setAppointments(data)
        localStorage.setItem('mcsos_appointments_v2', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_appointments_v2')
        if (saved) {
          setAppointments(JSON.parse(saved))
        } else {
          // بيانات تجريبية في حالة عدم وجود بيانات محلية
          const demoAppointments = getDemoAppointments()
          setAppointments(demoAppointments)
          localStorage.setItem('mcsos_appointments_v2', JSON.stringify(demoAppointments))
        }
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('حدث خطأ في تحميل المواعيد')
      // استخدام البيانات المحلية كاحتياطي
      const saved = localStorage.getItem('mcsos_appointments_v2')
      if (saved) {
        setAppointments(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  // ========== بيانات تجريبية ==========
  const getDemoAppointments = () => {
    return [
      { 
        id: 1, 
        doctor: 'د. أحمد علي',
        doctorName: 'Ahmed Ali',
        specialization: 'استشاري جراحة عظام',
        date: '2024-05-25',
        time: '10:00',
        status: 'upcoming',
        type: 'كشف طبي',
        location: 'مجمع العيادات - الطابق الأول',
        room: 'عيادة 203',
        phone: '0501112222',
        whatsapp: '966501112222',
        email: 'ahmed@medical.com',
        notes: 'يرجى إحضار التقارير السابقة',
        icon: '🦴',
        color: 'blue'
      },
      { 
        id: 2, 
        doctor: 'د. منى حسن',
        doctorName: 'Mona Hassan',
        specialization: 'أخصائية علاج طبيعي',
        date: '2024-05-28',
        time: '11:00',
        status: 'upcoming',
        type: 'جلسة علاج طبيعي',
        location: 'مركز العلاج الطبيعي',
        room: 'غرفة 305',
        phone: '0502223333',
        whatsapp: '966502223333',
        email: 'mona@medical.com',
        notes: '',
        icon: '💪',
        color: 'green'
      },
      { 
        id: 3, 
        doctor: 'د. محمد عبدالله',
        doctorName: 'Mohamed Abdullah',
        specialization: 'استشاري جراحة عامة',
        date: '2024-06-01',
        time: '09:30',
        status: 'upcoming',
        type: 'استشارة جراحية',
        location: 'مجمع العيادات - الطابق الثاني',
        room: 'عيادة 150',
        phone: '0505556666',
        whatsapp: '966505556666',
        email: 'mohamed@medical.com',
        notes: 'صيام 8 ساعات قبل الموعد',
        icon: '🔪',
        color: 'orange'
      },
      { 
        id: 4, 
        doctor: 'د. خالد محمود',
        doctorName: 'Khaled Mahmoud',
        specialization: 'استشاري أعصاب',
        date: '2024-05-18',
        time: '09:00',
        status: 'completed',
        type: 'متابعة',
        location: 'مجمع العيادات',
        room: 'عيادة 101',
        phone: '0503334444',
        whatsapp: '966503334444',
        email: 'khaled@medical.com',
        notes: 'تحسن ملحوظ في الحالة',
        icon: '🧠',
        color: 'purple'
      },
      { 
        id: 5, 
        doctor: 'د. نورة سعيد',
        doctorName: 'Noura Saeed',
        specialization: 'استشارية أطفال',
        date: '2024-05-15',
        time: '14:00',
        status: 'completed',
        type: 'فحص دوري',
        location: 'مجمع العيادات',
        room: 'عيادة 402',
        phone: '0504445555',
        whatsapp: '966504445555',
        email: 'noura@medical.com',
        notes: 'الحالة جيدة',
        icon: '👶',
        color: 'pink'
      }
    ]
  }

  // ========== تنسيق التاريخ ==========
  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (d.toDateString() === today.toDateString()) return 'اليوم'
    if (d.toDateString() === tomorrow.toDateString()) return 'غداً'
    
    return `${d.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][d.getMonth()]}`
  }

  // ========== حساب الأيام المتبقية ==========
  const getDaysLeft = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return null
    if (diff === 0) return 'اليوم'
    if (diff === 1) return 'غداً'
    return `باقي ${diff} أيام`
  }

  // ========== ألوان المواعيد ==========
  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', gradient: 'from-green-500 to-green-600' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' },
      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500 to-pink-600' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600' }
    }
    return colors[color] || colors.blue
  }

  // ========== عرض تفاصيل الموعد ==========
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  // ========== التواصل عبر واتساب ==========
  const handleContactWhatsApp = (phoneNumber, doctorName) => {
    let cleanPhone = phoneNumber?.replace(/[^0-9]/g, '') || ''
    if (!cleanPhone.startsWith('966') && cleanPhone.length === 9) {
      cleanPhone = '966' + cleanPhone
    }
    if (!cleanPhone.startsWith('966') && cleanPhone.length === 10) {
      cleanPhone = '966' + cleanPhone.substring(1)
    }
    const message = `مرحباً د. ${doctorName}، أنا ${user?.name || 'مريض'}، أرغب في الاستفسار عن موعدي`
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success(`جاري فتح واتساب للتواصل مع ${doctorName}`)
  }

  // ========== الاتصال ==========
  const handleCall = (phoneNumber, doctorName) => {
    const cleanPhone = phoneNumber?.replace(/[^0-9]/g, '') || ''
    window.location.href = `tel:${cleanPhone}`
    toast.success(`جاري الاتصال بـ ${doctorName}`)
  }

  // ========== نسخ رقم الهاتف ==========
  const handleCopyPhone = (phoneNumber, doctorName) => {
    navigator.clipboard.writeText(phoneNumber)
    toast.success(`تم نسخ رقم هاتف ${doctorName}`)
  }

  // ========== حجز موعد جديد ==========
  const handleBookNewAppointment = () => {
    navigate('/book-appointment')
  }

  // ========== إلغاء موعد ==========
  const handleCancelAppointment = async (id) => {
    if (!(await confirmAlert({ title: 'تأكيد الإلغاء', text: 'هل أنت متأكد من إلغاء هذا الموعد؟' }))) return

    setIsSubmitting(true)
    try {
      if (isOnline) {
        await appointmentsService.cancelAppointment(id, 'تم الإلغاء من قبل المريض')
      }
      
      const updatedAppointments = appointments.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled', _syncPending: !isOnline } : apt
      )
      setAppointments(updatedAppointments)
      localStorage.setItem('mcsos_appointments_v2', JSON.stringify(updatedAppointments))
      
      toast.success('تم إلغاء الموعد بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إلغاء الموعد')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== إرسال تذكير ==========
  const handleReminder = (doctor, date, time) => {
    toast.success(`تم إرسال تذكير للموعد مع ${doctor} يوم ${date} الساعة ${time}`)
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadAppointments()
    toast.success('تم تحديث البيانات')
  }

  // ========== تصفية المواعيد ==========
  const filteredApps = appointments.filter(apt => {
    if (filter === 'upcoming') return apt.status === 'upcoming' || apt.status === 'scheduled'
    if (filter === 'past') return apt.status === 'completed'
    if (filter === 'cancelled') return apt.status === 'cancelled'
    return true
  }).filter(apt => 
    apt.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (apt.specialization && apt.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const upcomingApps = filteredApps.filter(a => a.status === 'upcoming' || a.status === 'scheduled')
  const pastApps = filteredApps.filter(a => a.status === 'completed')
  const cancelledApps = filteredApps.filter(a => a.status === 'cancelled')

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">جاري تحميل مواعيدك...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
              <CalendarDays size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">مواعيدي</h1>
          </div>
          <p className="text-gray-400">
            إدارة ومتابعة جميع مواعيدك الطبية
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-800/80 p-1 rounded-xl border border-gray-700/60 mr-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar size={14} />
              عرض الكالندر
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarDays size={14} />
              قائمة المواعيد
            </button>
          </div>

          <button
            onClick={refreshData}
            className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition flex items-center gap-2 border border-green-500/30 text-xs font-semibold"
          >
            تحديث
          </button>
          <button
            onClick={handleBookNewAppointment}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25 text-xs font-semibold"
          >
            <Plus size={18} />
            <span>حجز موعد جديد</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <BookingCalendar />
      ) : (
        <>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-blue-400">{appointments.length}</div>
          <div className="text-xs text-gray-400">إجمالي المواعيد</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-green-400">{upcomingApps.length}</div>
          <div className="text-xs text-gray-400">قادمة</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-purple-400">{pastApps.length}</div>
          <div className="text-xs text-gray-400">سابقة</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-red-400">{cancelledApps.length}</div>
          <div className="text-xs text-gray-400">ملغية</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="ابحث عن موعد..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl transition ${filter === 'all' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}>الكل</button>
          <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-xl transition ${filter === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}>القادمة</button>
          <button onClick={() => setFilter('past')} className={`px-4 py-2 rounded-xl transition ${filter === 'past' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}>السابقة</button>
          <button onClick={() => setFilter('cancelled')} className={`px-4 py-2 rounded-xl transition ${filter === 'cancelled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}>الملغية</button>
        </div>
      </div>

      {/* المواعيد القادمة */}
      {upcomingApps.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">مواعيدك القادمة</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {upcomingApps.map((apt) => {
              const colors = getColorClasses(apt.color)
              const isPending = apt._syncPending === true
              return (
                <div key={apt.id} className={`group bg-gray-800/40 rounded-2xl border ${colors.border} hover:border-blue-500/50 transition-all duration-300 overflow-hidden hover:shadow-xl`}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center text-3xl`}>{apt.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              {apt.doctor}
                              {isPending && (
                                <span className="text-xs text-yellow-400">⏳ مزامنة</span>
                              )}
                            </h3>
                            <p className={`text-sm ${colors.text}`}>{apt.specialization}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleReminder(apt.doctor, apt.date, apt.time)} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"><Bell size={16} /></button>
                            <button onClick={() => handleContactWhatsApp(apt.whatsapp || apt.phone, apt.doctor)} className="p-1.5 text-gray-400 hover:text-green-400 transition-colors"><MessageCircle size={16} /></button>
                            <button onClick={() => handleCancelAppointment(apt.id)} disabled={isSubmitting} className="p-1.5 text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"><X size={16} /></button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-400"><Calendar size={14} className={colors.text} /><span>{formatDate(apt.date)}</span></div>
                          <div className="flex items-center gap-1.5 text-gray-400"><Clock size={14} className={colors.text} /><span>{apt.time}</span></div>
                          <div className="flex items-center gap-1.5 text-gray-400"><MapPin size={14} className={colors.text} /><span>{apt.room}</span></div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="flex justify-between items-center mb-1"><span className="text-xs text-gray-500">الموعد</span><span className={`text-xs font-medium ${colors.text}`}>{getDaysLeft(apt.date)}</span></div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5"><div className={`h-1.5 rounded-full bg-gradient-to-r ${colors.gradient}`} style={{ width: `${Math.min(100, Math.max(0, 100 - (new Date(apt.date) - new Date()) / (1000 * 60 * 60 * 24) * 5))}%` }}></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* المواعيد السابقة */}
      {pastApps.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-gray-500" />
            <h2 className="text-xl font-bold text-white">المواعيد السابقة</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-500/50 to-transparent"></div>
          </div>
          
          <div className="space-y-3">
            {pastApps.map((apt) => (
              <div key={apt.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 hover:bg-gray-800/50 transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center text-xl">{apt.icon}</div>
                    <div>
                      <p className="font-semibold text-white">{apt.doctor}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>{formatDate(apt.date)}</span>
                        <span>•</span>
                        <span>{apt.time}</span>
                        <span>•</span>
                        <span>{apt.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/15 rounded-full">
                      <CheckCircle size={12} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400">مكتمل</span>
                    </div>
                    <button 
                      onClick={() => handleViewDetails(apt)}
                      className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* المواعيد الملغية */}
      {cancelledApps.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <X size={20} className="text-red-400" />
            <h2 className="text-xl font-bold text-white">المواعيد الملغية</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>
          
          <div className="space-y-3">
            {cancelledApps.map((apt) => (
              <div key={apt.id} className="bg-gray-800/30 rounded-xl p-4 border border-red-500/20 hover:bg-gray-800/50 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-xl">{apt.icon}</div>
                    <div>
                      <p className="font-semibold text-white">{apt.doctor}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>{formatDate(apt.date)}</span>
                        <span>•</span>
                        <span>{apt.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/15 rounded-full">
                      <X size={12} className="text-red-400" />
                      <span className="text-xs text-red-400">ملغي</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredApps.length === 0 && (
        <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700/50">
          <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">لا توجد مواعيد</p>
          <p className="text-gray-500 text-sm mt-2">يمكنك حجز موعد جديد من خلال الضغط على الزر أعلاه</p>
        </div>
      )}

      {/* Banner */}
      <div className="mt-8 bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-xl p-5 border border-blue-500/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Smartphone size={24} className="text-blue-400" /></div>
            <div><h3 className="font-semibold text-white">تطبيق المركز الطبي</h3><p className="text-sm text-gray-400">حمل التطبيق لتلقي الإشعارات وتتبع مواعيدك</p></div>
          </div>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition text-sm">تحميل التطبيق</button>
        </div>
      </div>
      </>
      )}

      {/* Modal عرض تفاصيل الموعد */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تفاصيل الموعد</h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-3xl">
                  {selectedAppointment.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedAppointment.doctor}</h3>
                  <p className="text-blue-400 text-sm">{selectedAppointment.specialization}</p>
                  {selectedAppointment._syncPending && (
                    <span className="text-xs text-yellow-400">⏳ في انتظار المزامنة</span>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2"><Calendar size={16} /> معلومات الموعد</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">التاريخ:</span><span className="text-white">{formatDate(selectedAppointment.date)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">الوقت:</span><span className="text-white">{selectedAppointment.time}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">نوع الموعد:</span><span className="text-white">{selectedAppointment.type}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">الموقع:</span><span className="text-white">{selectedAppointment.room}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">الحالة:</span><span className="text-green-400">مكتمل</span></div>
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2"><Phone size={16} /> معلومات التواصل</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">رقم الطبيب:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white dir-ltr">{selectedAppointment.phone}</span>
                      <button onClick={() => handleCopyPhone(selectedAppointment.phone, selectedAppointment.doctor)} className="p-1 text-gray-500 hover:text-blue-400 transition" title="نسخ الرقم"><Copy size={14} /></button>
                    </div>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-400">البريد الإلكتروني:</span><span className="text-white">{selectedAppointment.email}</span></div>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2"><AlertCircle size={16} /> ملاحظات</h4>
                  <p className="text-gray-300 text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button 
                  onClick={() => handleContactWhatsApp(selectedAppointment.whatsapp || selectedAppointment.phone, selectedAppointment.doctor)}
                  className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> واتساب
                </button>
                <button 
                  onClick={() => handleCall(selectedAppointment.phone, selectedAppointment.doctor)}
                  className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <Phone size={16} /> اتصال
                </button>
                <button onClick={() => setShowDetailsModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إغلاق</button>
              </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}