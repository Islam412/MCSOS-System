import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, Calendar, Clock, Activity, Pill, FileText, 
  CheckCircle, AlertCircle, TrendingUp, Heart, 
  Stethoscope, Syringe, ClipboardList, Eye, Download,
  CalendarDays, Phone, Mail, MapPin, Award, Target,
  Search, Filter, Star, StarHalf, UserPlus, Video, MessageCircle,
  DollarSign, CreditCard, Bell, Shield, HelpCircle, Settings,
  LogOut, Menu, X, Home, History, FileBadge, Brain, Bone,
  Thermometer, Droplet, Microscope, Scissors, Ambulance,
  Printer  // <-- أضف هذا السطر
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PatientDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'تذكير بموعد', message: 'لديك موعد غداً الساعة 10:00 صباحاً', time: '2024-05-25 09:00', read: false, type: 'reminder' },
    { id: 2, title: 'نتائج الفحوصات', message: 'نتائج فحص الدم جاهزة للاطلاع', time: '2024-05-24 14:30', read: false, type: 'lab' },
    { id: 3, title: 'روشتة جديدة', message: 'تم إضافة روشتة جديدة من قبل الدكتور', time: '2024-05-23 11:00', read: true, type: 'prescription' }
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  // بيانات المريض الكاملة
  const [patientData, setPatientData] = useState({
    id: 1,
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    age: 35,
    phone: '+966 50 123 4567',
    email: 'ahmed@example.com',
    address: 'الرياض، حي النخيل، شارع الأمير سلطان',
    bloodType: 'O+',
    allergies: ['لا يوجد حساسية معروفة'],
    chronicDiseases: ['ضغط الدم (بسيط)'],
    doctor: 'د. أحمد علي',
    doctorSpecialization: 'جراحة عظام',
    doctorPhone: '+966 50 111 2222',
    nextAppointment: '2024-05-25',
    nextAppointmentTime: '10:00',
    totalSessions: 12,
    completedSessions: 8,
    progress: 66.7,
    diagnosis: 'تمزق جزئي في الرباط الصليبي الأمامي للركبة اليمنى',
    diagnosisDate: '2024-01-15',
    treatmentPlan: 'علاج طبيعي مكثف (3 مرات أسبوعياً) + تمارين إطالة وتقوية عضلات الفخذ + جلسات علاج طبيعي',
    joinDate: '2024-01-15',
    lastVisit: '2024-05-18',
    upcomingAppointments: [
      { id: 1, date: '2024-05-25', time: '10:00', doctor: 'د. أحمد علي', type: 'جلسة علاج طبيعي', location: 'الطابق الأول - عيادة 3', status: 'upcoming' },
      { id: 2, date: '2024-05-28', time: '11:00', doctor: 'د. أحمد علي', type: 'متابعة', location: 'الطابق الأول - عيادة 3', status: 'upcoming' },
      { id: 3, date: '2024-06-01', time: '09:30', doctor: 'د. منى حسن', type: 'جلسة علاج طبيعي', location: 'الطابق الثاني - قسم العلاج الطبيعي', status: 'upcoming' },
    ],
    pastAppointments: [
      { id: 1, date: '2024-05-18', time: '10:00', doctor: 'د. أحمد علي', type: 'جلسة علاج', status: 'completed', notes: 'تحسن ملحوظ في نطاق الحركة' },
      { id: 2, date: '2024-05-15', time: '11:00', doctor: 'د. أحمد علي', type: 'متابعة', status: 'completed', notes: 'تم تعديل خطة العلاج' },
      { id: 3, date: '2024-05-10', time: '09:00', doctor: 'د. منى حسن', type: 'علاج طبيعي', status: 'completed', notes: 'جلسة مكثفة' },
      { id: 4, date: '2024-05-05', time: '10:30', doctor: 'د. أحمد علي', type: 'كشف', status: 'completed', notes: 'تقييم الحالة' },
    ],
    prescriptions: [
      { id: 1, date: '2024-05-15', doctor: 'د. أحمد علي', medications: [{ name: 'بروفين', dosage: '500mg', frequency: 'مرتين يومياً', duration: 'أسبوع' }], notes: 'تناول بعد الأكل مع كوب ماء', refillable: false },
      { id: 2, date: '2024-05-01', doctor: 'د. أحمد علي', medications: [{ name: 'فولتارين', dosage: '75mg', frequency: 'مرة يومياً', duration: 'أسبوعين' }, { name: 'بانادول', dosage: '500mg', frequency: 'عند الحاجة', duration: '' }], notes: 'مرهم للركبة مرتين يومياً', refillable: true },
    ],
    medicalReports: [
      { id: 1, title: 'تقرير الأشعة المقطعية', date: '2024-05-10', type: 'ct_scan', doctor: 'د. أحمد علي', description: 'تظهر الأشعة تمزقاً جزئياً في الرباط الصليبي الأمامي مع وجود تورم بسيط حول المفصل', fileUrl: null },
      { id: 2, title: 'تقرير تحليل الدم', date: '2024-05-05', type: 'blood_test', doctor: 'د. أحمد علي', description: 'نسبة الالتهاب مرتفعة قليلاً، باقي التحاليل ضمن المعدل الطبيعي', fileUrl: null },
      { id: 3, title: 'تقرير الأشعة السينية', date: '2024-04-20', type: 'xray', doctor: 'د. أحمد علي', description: 'لا توجد كسور أو تشوهات في العظام', fileUrl: null },
    ],
    progressHistory: [
      { date: '2024-01-15', progress: 0, note: 'بداية العلاج - تشخيص الحالة', phase: 'التشخيص' },
      { date: '2024-01-30', progress: 10, note: 'بدء جلسات العلاج الطبيعي', phase: 'العلاج' },
      { date: '2024-02-15', progress: 25, note: 'تحسن ملحوظ في الحركة', phase: 'العلاج' },
      { date: '2024-03-01', progress: 35, note: 'انخفاض ملحوظ في الألم', phase: 'العلاج' },
      { date: '2024-03-20', progress: 45, note: 'استمرار التحسن', phase: 'العلاج' },
      { date: '2024-04-10', progress: 55, note: 'تحسن كبير في نطاق الحركة', phase: 'العلاج' },
      { date: '2024-05-01', progress: 60, note: 'التقدم جيد جداً', phase: 'العلاج' },
      { date: '2024-05-18', progress: 66.7, note: 'تقدم جيد - 8 جلسات مكتملة', phase: 'العلاج' },
    ],
    vitals: {
      bloodPressure: '120/80',
      heartRate: 72,
      weight: 75,
      height: 175,
      bmi: 24.5,
      temperature: 36.6,
      oxygenLevel: 98
    },
    payments: [
      { id: 1, date: '2024-01-15', amount: 2000, type: 'باقة علاجية', status: 'paid' },
      { id: 2, date: '2024-02-15', amount: 2000, type: 'باقة علاجية', status: 'paid' },
      { id: 3, date: '2024-03-15', amount: 2000, type: 'باقة علاجية', status: 'paid' },
      { id: 4, date: '2024-04-15', amount: 2000, type: 'باقة علاجية', status: 'paid' },
      { id: 5, date: '2024-05-15', amount: 2000, type: 'باقة علاجية', status: 'pending' },
    ],
    healthMetrics: [
      { month: 'يناير', pain: 8, mobility: 3, inflammation: 7 },
      { month: 'فبراير', pain: 6, mobility: 5, inflammation: 5 },
      { month: 'مارس', pain: 4, mobility: 7, inflammation: 3 },
      { month: 'أبريل', pain: 3, mobility: 8, inflammation: 2 },
      { month: 'مايو', pain: 2, mobility: 9, inflammation: 1 },
    ]
  })

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      const userData = localStorage.getItem('mcsos_user')
      if (userData) {
        const user = JSON.parse(userData)
        setPatientData(prev => ({ ...prev, name: user.name, nameEn: user.nameEn, email: user.email }))
      }
      setPatient(patientData)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ مكتمل</span>
    } else if (status === 'upcoming') {
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">⏰ قادم</span>
    } else if (status === 'paid') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ مدفوع</span>
    } else if (status === 'pending') {
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ معلق</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">{status}</span>
  }

  const getReportTypeIcon = (type) => {
    switch(type) {
      case 'ct_scan': return <Microscope size={16} className="text-purple-400" />
      case 'blood_test': return <Droplet size={16} className="text-red-400" />
      case 'xray': return <Bone size={16} className="text-blue-400" />
      default: return <FileText size={16} className="text-gray-400" />
    }
  }

  const getReportTypeName = (type) => {
    switch(type) {
      case 'ct_scan': return isRTL ? 'أشعة مقطعية' : 'CT Scan'
      case 'blood_test': return isRTL ? 'تحليل دم' : 'Blood Test'
      case 'xray': return isRTL ? 'أشعة سينية' : 'X-Ray'
      default: return isRTL ? 'تقرير طبي' : 'Medical Report'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar' : 'en', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const totalPaid = patientData.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = patientData.payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

  const progressData = patientData.progressHistory.map(p => ({ date: p.date, progress: p.progress }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل بياناتك الصحية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Stethoscope size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">مرحبا، {patient?.name}</h1>
                  <p className="text-xs text-gray-400">آخر زيارة: {formatDate(patient?.lastVisit)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* الإشعارات */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white transition"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-80 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50`}>
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                      <h3 className="text-white font-bold">الإشعارات</h3>
                      <button className="text-xs text-blue-400 hover:text-blue-300">تحديد الكل كمقروء</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-3 border-b border-gray-700 hover:bg-gray-700/30 transition cursor-pointer ${!notif.read ? 'bg-blue-500/10' : ''}`}>
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              {notif.type === 'reminder' ? <Calendar size={14} className="text-blue-400" /> : 
                               notif.type === 'lab' ? <Microscope size={14} className="text-purple-400" /> : 
                               <Pill size={14} className="text-green-400" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-semibold">{notif.title}</p>
                              <p className="text-gray-400 text-xs">{notif.message}</p>
                              <p className="text-gray-500 text-xs mt-1">{new Date(notif.time).toLocaleString()}</p>
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* صورة المستخدم */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar للهواتف */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} w-64 h-full bg-gray-800 shadow-xl p-4`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-bold">القائمة</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-2">
              <button onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><Home size={18} /> نظرة عامة</button>
              <button onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'appointments' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><Calendar size={18} /> المواعيد</button>
              <button onClick={() => { setActiveTab('prescriptions'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'prescriptions' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><Pill size={18} /> الروشتات</button>
              <button onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'reports' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><FileText size={18} /> التقارير</button>
              <button onClick={() => { setActiveTab('payments'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'payments' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><DollarSign size={18} /> المدفوعات</button>
              <button onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><User size={18} /> ملفي الشخصي</button>
            </nav>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-6">
        {/* أزرار التبويب (سطح المكتب) */}
        <div className="hidden lg:flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('overview')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>نظرة عامة</button>
          <button onClick={() => setActiveTab('appointments')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'appointments' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>المواعيد</button>
          <button onClick={() => setActiveTab('prescriptions')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'prescriptions' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>الروشتات</button>
          <button onClick={() => setActiveTab('reports')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'reports' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>التقارير</button>
          <button onClick={() => setActiveTab('payments')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'payments' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>المدفوعات</button>
          <button onClick={() => setActiveTab('profile')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>ملفي الشخصي</button>
        </div>

        {/* ========== تبويب نظرة عامة ========== */}
        {activeTab === 'overview' && (
          <>
            {/* بطاقات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">نسبة التقدم</p><p className="text-3xl font-bold text-white">{patient?.progress}%</p></div>
                  <div className="p-3 bg-blue-500/20 rounded-xl"><TrendingUp className="text-blue-400" size={28} /></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${patient?.progress}%` }}></div></div>
                <p className="text-xs text-gray-400 mt-2">{patient?.completedSessions}/{patient?.totalSessions} جلسة مكتملة</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-3xl font-bold text-white">{patient?.completedSessions}/{patient?.totalSessions}</p></div>
                  <div className="p-3 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={28} /></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الموعد القادم</p><p className="text-xl font-bold text-white">{patient?.nextAppointment}</p></div>
                  <div className="p-3 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={28} /></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">الساعة {patient?.nextAppointmentTime}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الطبيب المعالج</p><p className="text-xl font-bold text-white">{patient?.doctor}</p></div>
                  <div className="p-3 bg-orange-500/20 rounded-xl"><Stethoscope className="text-orange-400" size={28} /></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{patient?.doctorSpecialization}</p>
              </div>
            </div>

            {/* الرسم البياني للتقدم */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">📈 تقدمي العلاجي</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  <Area type="monotone" dataKey="progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="نسبة التقدم %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* مقاييس الصحة */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">📊 مقاييس الصحة</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={patientData.healthMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  <Legend />
                  <Line type="monotone" dataKey="pain" stroke="#ef4444" name="الألم" strokeWidth={2} />
                  <Line type="monotone" dataKey="mobility" stroke="#22c55e" name="الحركة" strokeWidth={2} />
                  <Line type="monotone" dataKey="inflammation" stroke="#eab308" name="الالتهاب" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* معلومات سريعة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Heart className="text-red-400" /> العلامات الحيوية</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">ضغط الدم</p><p className="text-2xl font-bold text-white">{patientData.vitals.bloodPressure}</p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">معدل ضربات القلب</p><p className="text-2xl font-bold text-white">{patientData.vitals.heartRate} <span className="text-sm">نبضة/د</span></p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">الوزن</p><p className="text-2xl font-bold text-white">{patientData.vitals.weight} <span className="text-sm">كجم</span></p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">مؤشر كتلة الجسم</p><p className="text-2xl font-bold text-white">{patientData.vitals.bmi}</p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">درجة الحرارة</p><p className="text-2xl font-bold text-white">{patientData.vitals.temperature}°C</p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">تشبع الأكسجين</p><p className="text-2xl font-bold text-white">{patientData.vitals.oxygenLevel}%</p></div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ClipboardList className="text-blue-400" /> معلومات التشخيص</h2>
                <div className="space-y-3">
                  <div><p className="text-gray-400 text-sm">التشخيص</p><p className="text-white">{patientData.diagnosis}</p></div>
                  <div><p className="text-gray-400 text-sm">تاريخ التشخيص</p><p className="text-white">{formatDate(patientData.diagnosisDate)}</p></div>
                  <div><p className="text-gray-400 text-sm">خطة العلاج</p><p className="text-white text-sm">{patientData.treatmentPlan}</p></div>
                  <div><p className="text-gray-400 text-sm">فصيلة الدم</p><p className="text-white">{patientData.bloodType}</p></div>
                  <div><p className="text-gray-400 text-sm">الأمراض المزمنة</p><p className="text-white">{patientData.chronicDiseases.join(', ')}</p></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========== تبويب المواعيد ========== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar className="text-blue-400" /> المواعيد القادمة</h2>
              <div className="space-y-3">
                {patientData.upcomingAppointments.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">لا توجد مواعيد قادمة</p>
                ) : (
                  patientData.upcomingAppointments.map(app => (
                    <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CalendarDays size={24} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{formatDate(app.date)} - {app.time}</p>
                          <p className="text-sm text-gray-400">الدكتور: {app.doctor}</p>
                          <p className="text-xs text-gray-500">النوع: {app.type}</p>
                          <p className="text-xs text-gray-500">الموقع: {app.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0">
                        {getStatusBadge(app.status)}
                        <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition flex items-center gap-1">
                          <MessageCircle size={14} /> تذكير
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><History className="text-green-400" /> المواعيد السابقة</h2>
              <div className="space-y-3">
                {patientData.pastAppointments.map(app => (
                  <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
                        <CheckCircle size={24} className="text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{formatDate(app.date)} - {app.time}</p>
                        <p className="text-sm text-gray-400">الدكتور: {app.doctor} - {app.type}</p>
                        {app.notes && <p className="text-xs text-gray-500">ملاحظات: {app.notes}</p>}
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== تبويب الروشتات ========== */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            {patientData.prescriptions.map(prescription => (
              <div key={prescription.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Pill className="text-green-400" /> روشتة طبية</h3>
                    <p className="text-sm text-gray-400">التاريخ: {formatDate(prescription.date)} | الدكتور: {prescription.doctor}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition flex items-center gap-1">
                    <Printer size={14} /> طباعة
                  </button>
                </div>
                <div className="space-y-3">
                  {prescription.medications.map((med, idx) => (
                    <div key={idx} className="bg-gray-700/30 rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div><span className="text-gray-400">الدواء:</span> <span className="text-white">{med.name}</span></div>
                        <div><span className="text-gray-400">الجرعة:</span> <span className="text-white">{med.dosage}</span></div>
                        <div><span className="text-gray-400">العدد:</span> <span className="text-white">{med.frequency}</span></div>
                        {med.duration && <div><span className="text-gray-400">المدة:</span> <span className="text-white">{med.duration}</span></div>}
                      </div>
                      {med.instructions && <p className="text-xs text-gray-400 mt-2">📝 تعليمات: {med.instructions}</p>}
                    </div>
                  ))}
                </div>
                {prescription.notes && <p className="text-sm text-gray-400 mt-3 border-t border-gray-700 pt-3">📋 ملاحظات: {prescription.notes}</p>}
                {prescription.refillable && <p className="text-xs text-green-400 mt-2">🔄 يمكن إعادة صرف هذه الروشتة</p>}
              </div>
            ))}
          </div>
        )}

        {/* ========== تبويب التقارير ========== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {patientData.medicalReports.map(report => (
              <div key={report.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{report.title}</h3>
                      <p className="text-xs text-gray-400">{getReportTypeName(report.type)} | {formatDate(report.date)} | الدكتور: {report.doctor}</p>
                      <p className="text-sm text-gray-300 mt-2">{report.description}</p>
                    </div>
                  </div>
                  <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== تبويب المدفوعات ========== */}
        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
                <p className="text-gray-400 text-sm">إجمالي المدفوع</p>
                <p className="text-3xl font-bold text-white">{totalPaid.toLocaleString()} <span className="text-sm">ر.س</span></p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-5 border border-yellow-500/30">
                <p className="text-gray-400 text-sm">المدفوعات المعلقة</p>
                <p className="text-3xl font-bold text-white">{totalPending.toLocaleString()} <span className="text-sm">ر.س</span></p>
              </div>
            </div>
            <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">سجل المدفوعات</h2>
              <div className="space-y-3">
                {patientData.payments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{payment.type}</p>
                      <p className="text-xs text-gray-400">{formatDate(payment.date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-green-400">{payment.amount.toLocaleString()} ر.س</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== تبويب الملف الشخصي ========== */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{patientData.name}</h2>
              <p className="text-gray-400">رقم الملف: PAT-{patientData.id}</p>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2"><Phone size={14} /> {patientData.phone}</p>
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2 mt-2"><Mail size={14} /> {patientData.email}</p>
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2 mt-2"><MapPin size={14} /> {patientData.address}</p>
              </div>
            </div>
            <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">المعلومات الشخصية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-gray-400 text-sm">العمر</p><p className="text-white">{patientData.age} سنة</p></div>
                <div><p className="text-gray-400 text-sm">فصيلة الدم</p><p className="text-white">{patientData.bloodType}</p></div>
                <div><p className="text-gray-400 text-sm">تاريخ التسجيل</p><p className="text-white">{formatDate(patientData.joinDate)}</p></div>
                <div><p className="text-gray-400 text-sm">آخر زيارة</p><p className="text-white">{formatDate(patientData.lastVisit)}</p></div>
                <div className="md:col-span-2"><p className="text-gray-400 text-sm">الحساسية</p><p className="text-white">{patientData.allergies.join(', ')}</p></div>
                <div className="md:col-span-2"><p className="text-gray-400 text-sm">الأمراض المزمنة</p><p className="text-white">{patientData.chronicDiseases.join(', ')}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}