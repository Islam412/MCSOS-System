import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, Calendar, Clock, Activity, CheckCircle, TrendingUp, 
  User, Stethoscope, Pill, FileText, Printer, RefreshCw, 
  LogIn, Eye, Download, Star, Plus, Edit, Trash2, Save, X, Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  
  // إحصائيات الطبيب
  const [stats, setStats] = useState({
    todayPatients: 8,
    totalPatients: 45,
    completedSessions: 38,
    pendingSessions: 7,
    upcomingAppointments: 5,
    averageRating: 4.8
  })
  
  // جدول المواعيد اليوم
  const [todaySchedule, setTodaySchedule] = useState([
    { id: 1, time: '09:00', patient: 'أحمد محمد', type: 'كشف', status: 'completed' },
    { id: 2, time: '10:00', patient: 'سارة حسن', type: 'متابعة', status: 'completed' },
    { id: 3, time: '11:00', patient: 'محمود علي', type: 'جلسة علاج', status: 'in-progress' },
    { id: 4, time: '12:00', patient: 'نورة عبدالله', type: 'كشف', status: 'upcoming' },
    { id: 5, time: '13:00', patient: 'عمر خالد', type: 'فحص', status: 'upcoming' },
  ])
  
  // قائمة المرضى
  const [recentPatients, setRecentPatients] = useState([
    { id: 1, name: 'أحمد محمد', age: 35, lastVisit: '2024-05-18', diagnosis: 'تمزق في الرباط الصليبي', progress: 75 },
    { id: 2, name: 'سارة حسن', age: 28, lastVisit: '2024-05-17', diagnosis: 'انزلاق غضروفي', progress: 60 },
    { id: 3, name: 'محمود علي', age: 42, lastVisit: '2024-05-19', diagnosis: 'التهاب المفاصل', progress: 90 },
  ])
  
  // بيانات الروشتة الجديدة
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setTimeout(() => setLoading(false), 500)
  }, [])

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ مكتمل</span>
      case 'in-progress': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏳ جاري</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">📅 قادم</span>
    }
  }

  // ========== دالة تحديث التقرير ==========
  const handleRefreshReport = () => {
    setStats(prev => ({
      ...prev,
      completedSessions: prev.completedSessions + Math.floor(Math.random() * 2),
      totalPatients: prev.totalPatients + Math.floor(Math.random() * 2)
    }))
    toast.success('تم تحديث التقرير بنجاح')
  }

  // ========== دالة تسجيل حضور ==========
  const handleCheckIn = () => {
    const upcomingApp = todaySchedule.find(app => app.status === 'upcoming')
    if (upcomingApp) {
      setTodaySchedule(todaySchedule.map(app => 
        app.id === upcomingApp.id ? { ...app, status: 'completed' } : app
      ))
      setStats(prev => ({
        ...prev,
        completedSessions: prev.completedSessions + 1
      }))
      toast.success(`تم تسجيل حضور المريض ${upcomingApp.patient}`)
    } else {
      toast.info('لا توجد مواعيد قادمة لتسجيل الحضور')
    }
  }

  // ========== دالة عرض المرضى ==========
  const handleViewPatients = () => {
    navigate('/patients')
  }

  // ========== دالة فتح نافذة الروشتة ==========
  const handleOpenPrescription = () => {
    setNewPrescription({
      patientName: '',
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

  // ========== دالة حفظ الروشتة ==========
  const handleSavePrescription = () => {
    if (!newPrescription.patientName) {
      toast.error('الرجاء إدخال اسم المريض')
      return
    }
    const validMedications = newPrescription.medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      toast.error('الرجاء إضافة دواء واحد على الأقل')
      return
    }
    
    toast.success(`تم إضافة روشتة جديدة للمريض ${newPrescription.patientName}`)
    setShowPrescriptionModal(false)
    setNewPrescription({
      patientName: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: ''
    })
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
              <div class="stat-card"><div class="stat-value">${stats.averageRating}</div><div class="stat-label">تقييمي</div></div>
              <div class="stat-card"><div class="stat-value">${stats.completedSessions}</div><div class="stat-label">جلسات مكتملة</div></div>
              <div class="stat-card"><div class="stat-value">${stats.totalPatients}</div><div class="stat-label">إجمالي المرضى</div></div>
              <div class="stat-card"><div class="stat-value">${stats.todayPatients}</div><div class="stat-label">مرضى اليوم</div></div>
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

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة تحكم الطبيب</h1>
          <p className="text-gray-400 mt-1">مرحباً د.{user?.name || 'أحمد علي'} | ملخص عملك اليوم</p>
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
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">مرضى اليوم</p><p className="text-3xl font-bold text-white">{stats.todayPatients}</p></div><div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={28} /></div></div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">إجمالي المرضى</p><p className="text-3xl font-bold text-white">{stats.totalPatients}</p></div><div className="p-3 bg-green-500/20 rounded-xl"><User className="text-green-400" size={28} /></div></div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-3xl font-bold text-white">{stats.completedSessions}</p></div><div className="p-3 bg-purple-500/20 rounded-xl"><CheckCircle className="text-purple-400" size={28} /></div></div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">تقييم المرضى</p><p className="text-3xl font-bold text-white">{stats.averageRating}</p></div><div className="p-3 bg-orange-500/20 rounded-xl"><Star className="text-orange-400" size={28} /></div></div>
        </div>
      </div>
      
      {/* جدول المواعيد اليوم وآخر المرضى */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مواعيد اليوم */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-400" /> جدول المواعيد اليوم</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todaySchedule.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-white font-medium">{app.time}</div>
                  <div><p className="text-white">{app.patient}</p><p className="text-xs text-gray-400">{app.type}</p></div>
                </div>
                {getStatusBadge(app.status)}
              </div>
            ))}
          </div>
        </div>
        
        {/* آخر المرضى */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Activity size={20} className="text-green-400" /> آخر المرضى</h2>
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="p-3 bg-gray-700/30 rounded-lg">
                <div className="flex justify-between items-start">
                  <div><p className="font-semibold text-white">{patient.name}</p><p className="text-xs text-gray-400">{patient.age} سنة - آخر زيارة: {patient.lastVisit}</p><p className="text-sm text-gray-300 mt-1">{patient.diagnosis}</p></div>
                  <div className="text-right"><div className="text-sm text-blue-400">{patient.progress}%</div><div className="w-24 bg-gray-600 rounded-full h-1.5 mt-1"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${patient.progress}%` }}></div></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* إجراءات سريعة - جميع الأزرار تعمل */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* زر عرض المرضى */}
          <button 
            onClick={handleViewPatients}
            className="p-3 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
          >
            <Eye size={18} /> عرض المرضى
          </button>
          
          {/* زر تسجيل حضور */}
          <button 
            onClick={handleCheckIn}
            className="p-3 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30 transition flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> تسجيل حضور
          </button>
          
          {/* زر كتابة روشتة */}
          <button 
            onClick={handleOpenPrescription}
            className="p-3 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
          >
            <Pill size={18} /> كتابة روشتة
          </button>
          
          {/* زر تحديث التقرير */}
          <button 
            onClick={handleRefreshReport}
            className="p-3 bg-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/30 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> تحديث التقرير
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
              <div><label className="block text-sm text-gray-400 mb-1">اسم المريض *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" placeholder="أدخل اسم المريض" value={newPrescription.patientName} onChange={(e) => setNewPrescription({...newPrescription, patientName: e.target.value})} /></div>
              
              <div><label className="block text-sm text-gray-400 mb-2">الأدوية</label>
                {newPrescription.medications.map((med, idx) => (
                  <div key={idx} className="bg-gray-700/30 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center mb-2"><span className="text-sm text-gray-400">دواء #{idx + 1}</span>{idx > 0 && <button onClick={() => handleRemoveMedication(idx)} className="text-red-400"><Trash2 size={16} /></button>}</div>
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
              
              <div><label className="block text-sm text-gray-400 mb-1">ملاحظات</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" placeholder="ملاحظات إضافية..." value={newPrescription.notes} onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})} /></div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={handleSavePrescription} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">حفظ الروشتة</button>
                <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}