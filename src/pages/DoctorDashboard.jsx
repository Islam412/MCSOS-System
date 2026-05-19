import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, Activity, Calendar, Clock, Edit, Save, X, UserPlus, 
  Trash2, CheckCircle, FileText, Image, Pill, Stethoscope,
  Calendar as CalendarIcon, Phone, Mail, Plus, Eye, Upload,
  Image as ImageIcon, FileImage, XCircle, AlertCircle, Check,
  CalendarDays, Timer, TrendingUp, ListChecks, Ban
} from 'lucide-react'
import toast from 'react-hot-toast'
import ImageViewer from '../components/doctor/ImageViewer'
import { 
  getPatients, savePatients, addPatient, updatePatient, deletePatient,
  addSession, updateSessionStatus, addReport, addImageToPatient, deleteImage,
  availableDoctors, severityLevels, sessionStatus, getDoctorName
} from '../services/patientService'

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language
  
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMedicationModal, setShowMedicationModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [viewerImages, setViewerImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [uploadType, setUploadType] = useState('xray')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  
  const [formData, setFormData] = useState({
    nameAr: '', nameEn: '', nameFr: '', age: '', phone: '', email: '',
    diagnosis: '', diagnosisDate: '', severity: 'moderate',
    mainDoctorId: '', secondaryDoctorId: '', totalSessions: '',
    medications: [], medicalRecommendations: '', notes: ''
  })
  
  const [newSession, setNewSession] = useState({ date: '', time: '', notes: '', status: 'scheduled' })
  const [newReport, setNewReport] = useState({ title: '', content: '' })
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', startDate: '', endDate: '' })
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = () => {
    setPatients(getPatients())
    setLoading(false)
  }
  
  const getPatientName = (patient) => {
    if (currentLang === 'ar') return patient.nameAr
    if (currentLang === 'fr') return patient.nameFr
    return patient.nameEn
  }
  
  const getSeverityText = (severity) => {
    return currentLang === 'ar' ? severityLevels[severity]?.ar : severityLevels[severity]?.en
  }
  
  const getSeverityColor = (severity) => {
    return severityLevels[severity]?.color || 'text-gray-400'
  }
  
  // حساب الإحصائيات للمريض
  const getPatientStats = (patient) => {
    const completed = patient.sessionsHistory?.filter(s => s.status === 'attended').length || 0
    const scheduled = patient.sessionsHistory?.filter(s => s.status === 'scheduled').length || 0
    const absent = patient.sessionsHistory?.filter(s => s.status === 'absent').length || 0
    const cancelled = patient.sessionsHistory?.filter(s => s.status === 'cancelled').length || 0
    const remaining = patient.totalSessions - completed
    const progress = patient.totalSessions > 0 ? (completed / patient.totalSessions) * 100 : 0
    
    return { completed, scheduled, absent, cancelled, remaining, progress }
  }
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة صالح')
        return
      }
      setSelectedFile(file)
    }
  }
  
  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast.error('الرجاء اختيار صورة')
      return
    }
    if (!uploadTitle) {
      toast.error('الرجاء إدخال عنوان للصورة')
      return
    }
    
    const updated = await addImageToPatient(
      selectedPatient.id, 
      selectedFile, 
      uploadType, 
      uploadTitle, 
      uploadDesc
    )
    if (updated) {
      setPatients(updated)
      const updatedPatient = updated.find(p => p.id === selectedPatient.id)
      setSelectedPatient(updatedPatient)
      toast.success('تم رفع الصورة بنجاح')
      setShowImageModal(false)
      setSelectedFile(null)
      setUploadTitle('')
      setUploadDesc('')
    }
  }
  
  const handleDeleteImage = (imageId) => {
    const updated = deleteImage(selectedPatient.id, imageId)
    setPatients(updated)
    const updatedPatient = updated.find(p => p.id === selectedPatient.id)
    setSelectedPatient(updatedPatient)
    toast.success('تم حذف الصورة بنجاح')
  }
  
  const handleViewImage = (images, startIndex = 0) => {
    setViewerImages(images)
    setShowImageViewer(true)
  }
  
  // تسجيل حضور جلسة
  const handleMarkAttendance = (sessionId, status) => {
    const updated = updateSessionStatus(selectedPatient.id, sessionId, status)
    setPatients(updated)
    const updatedPatient = updated.find(p => p.id === selectedPatient.id)
    setSelectedPatient(updatedPatient)
    
    const statusText = status === 'attended' ? 'حضور' : status === 'absent' ? 'غياب' : 'إلغاء'
    toast.success(`تم تسجيل ${statusText} الجلسة بنجاح`)
    setShowSessionDetailsModal(false)
  }
  
  // إضافة جلسة جديدة
  const handleAddSession = () => {
    if (!newSession.date || !newSession.time) {
      toast.error('الرجاء إدخال التاريخ والوقت')
      return
    }
    const updated = addSession(selectedPatient.id, { ...newSession, status: 'scheduled' })
    setPatients(updated)
    const updatedPatient = updated.find(p => p.id === selectedPatient.id)
    setSelectedPatient(updatedPatient)
    setShowSessionModal(false)
    setNewSession({ date: '', time: '', notes: '', status: 'scheduled' })
    toast.success('تم إضافة الجلسة بنجاح')
  }
  
  // إضافة جلسات متعددة دفعة واحدة
  const handleAddMultipleSessions = () => {
    const sessionsToAdd = []
    const startDate = new Date(newSession.date)
    for (let i = 0; i < 4; i++) {
      const sessionDate = new Date(startDate)
      sessionDate.setDate(startDate.getDate() + (i * 7)) // كل أسبوع
      sessionsToAdd.push({
        date: sessionDate.toISOString().split('T')[0],
        time: newSession.time,
        notes: newSession.notes,
        status: 'scheduled'
      })
    }
    
    let updated = [...patients]
    for (const session of sessionsToAdd) {
      updated = addSession(selectedPatient.id, session)
    }
    setPatients(updated)
    const updatedPatient = updated.find(p => p.id === selectedPatient.id)
    setSelectedPatient(updatedPatient)
    setShowSessionModal(false)
    setNewSession({ date: '', time: '', notes: '', status: 'scheduled' })
    toast.success('تم إضافة 4 جلسات أسبوعية بنجاح')
  }
  
  const handleAddReport = () => {
    if (!newReport.title) {
      toast.error('الرجاء إدخال عنوان التقرير')
      return
    }
    const updated = addReport(selectedPatient.id, newReport)
    setPatients(updated)
    setShowReportModal(false)
    setNewReport({ title: '', content: '' })
    toast.success('تم إضافة التقرير بنجاح')
  }
  
  const handleAddMedication = () => {
    if (!newMedication.name) {
      toast.error('الرجاء إدخال اسم الدواء')
      return
    }
    const updatedMedications = [...(selectedPatient.medications || []), { ...newMedication, id: Date.now() }]
    const updated = updatePatient(selectedPatient.id, { medications: updatedMedications })
    setPatients(updated)
    setSelectedPatient({ ...selectedPatient, medications: updatedMedications })
    setShowMedicationModal(false)
    setNewMedication({ name: '', dosage: '', frequency: '', startDate: '', endDate: '' })
    toast.success('تم إضافة الدواء بنجاح')
  }
  
  const handleAddPatient = () => {
    if (!formData.nameAr || !formData.age) {
      toast.error('الرجاء إدخال الاسم والعمر')
      return
    }
    const newPatient = {
      nameAr: formData.nameAr, nameEn: formData.nameEn || formData.nameAr,
      nameFr: formData.nameFr || formData.nameAr,
      age: parseInt(formData.age), phone: formData.phone || '', email: formData.email || '',
      diagnosis: formData.diagnosis || 'قيد التشخيص', diagnosisDate: formData.diagnosisDate || new Date().toISOString().split('T')[0],
      severity: formData.severity, mainDoctorId: parseInt(formData.mainDoctorId) || null,
      secondaryDoctorId: parseInt(formData.secondaryDoctorId) || null,
      totalSessions: parseInt(formData.totalSessions) || 6, completedSessions: 0,
      status: 'active', medications: [], medicalRecommendations: formData.medicalRecommendations || '',
      sessionsHistory: [], reports: [], images: [], progress: 0, notes: formData.notes || ''
    }
    const updated = addPatient(newPatient)
    setPatients(updated)
    setShowAddPatientModal(false)
    setFormData({ nameAr: '', nameEn: '', nameFr: '', age: '', phone: '', email: '', diagnosis: '', diagnosisDate: '', severity: 'moderate', mainDoctorId: '', secondaryDoctorId: '', totalSessions: '', medications: [], medicalRecommendations: '', notes: '' })
    toast.success('تم إضافة المريض بنجاح')
  }
  
  const getSessionStatusBadge = (status) => {
    const s = sessionStatus[status]
    const bgColor = status === 'attended' ? 'bg-green-500/20' : status === 'scheduled' ? 'bg-blue-500/20' : status === 'absent' ? 'bg-red-500/20' : 'bg-gray-500/20'
    return <span className={`text-xs px-2 py-1 rounded-full ${bgColor} ${s?.color}`}>{currentLang === 'ar' ? s?.ar : s?.en}</span>
  }
  
  const getSessionStatusIcon = (status) => {
    switch(status) {
      case 'attended': return <Check size={14} className="text-green-400" />
      case 'scheduled': return <Calendar size={14} className="text-blue-400" />
      case 'absent': return <Ban size={14} className="text-red-400" />
      default: return <XCircle size={14} className="text-gray-400" />
    }
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div><h1 className="text-3xl font-bold gradient-text">لوحة الأطباء</h1><p className="text-gray-400 mt-1">إدارة المرضى والجلسات والتقارير</p></div>
        <button onClick={() => setShowAddPatientModal(true)} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30"><UserPlus size={18} /> إضافة مريض</button>
      </div>
      
      {/* إحصائيات عامة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.length}</div><div className="text-sm text-gray-400">إجمالي المرضى</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.filter(p => p.status === 'active').length}</div><div className="text-sm text-gray-400">مرضى نشطين</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.reduce((sum, p) => sum + (p.sessionsHistory?.length || 0), 0)}</div><div className="text-sm text-gray-400">إجمالي الجلسات</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-xl"><CheckCircle className="text-orange-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.reduce((sum, p) => sum + (p.sessionsHistory?.filter(s => s.status === 'attended').length || 0), 0)}</div><div className="text-sm text-gray-400">جلسات مكتملة</div></div></div>
        </div>
      </div>
      
      {/* قائمة المرضى */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => {
          const stats = getPatientStats(patient)
          return (
            <div key={patient.id} className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
              <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-800/50">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-lg font-bold text-white">{getPatientName(patient)}</h3><p className="text-sm text-gray-400">{patient.age} سنة</p></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(patient.severity)} bg-opacity-20 bg-current`}>{getSeverityText(patient.severity)}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm"><Stethoscope size={14} className="text-blue-400" /><span className="text-gray-300">الدكتور: {getDoctorName(patient.mainDoctorId, currentLang)}</span></div>
                <div className="flex items-center gap-2 text-sm"><CalendarDays size={14} className="text-purple-400" /><span className="text-gray-300">الجلسات المتبقية: {stats.remaining}</span></div>
                <div className="flex items-center gap-2 text-sm"><ListChecks size={14} className="text-green-400" /><span className="text-gray-300">التقدم: {Math.round(stats.progress)}%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.progress}%` }}></div></div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setSelectedPatient(patient); setActiveTab('info'); setShowPatientModal(true); }} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm hover:bg-blue-500/30">تفاصيل</button>
                  <button onClick={() => { setSelectedPatient(patient); setShowSessionModal(true); }} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm hover:bg-green-500/30">جلسة جديدة</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Modal تفاصيل المريض الكامل */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{getPatientName(selectedPatient)}</h2>
              <button onClick={() => setShowPatientModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-700 mb-4 overflow-x-auto">
              <button onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm rounded-t-lg transition ${activeTab === 'info' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>معلومات عامة</button>
              <button onClick={() => setActiveTab('sessions')} className={`px-4 py-2 text-sm rounded-t-lg transition ${activeTab === 'sessions' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>الجلسات</button>
              <button onClick={() => setActiveTab('medications')} className={`px-4 py-2 text-sm rounded-t-lg transition ${activeTab === 'medications' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>الأدوية</button>
              <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm rounded-t-lg transition ${activeTab === 'reports' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>التقارير</button>
              <button onClick={() => setActiveTab('images')} className={`px-4 py-2 text-sm rounded-t-lg transition ${activeTab === 'images' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>الصور والأشعة</button>
            </div>
            
            {/* Tab: معلومات عامة */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-400">الاسم</label><p className="text-white">{getPatientName(selectedPatient)}</p></div>
                  <div><label className="block text-sm text-gray-400">العمر</label><p className="text-white">{selectedPatient.age} سنة</p></div>
                  <div><label className="block text-sm text-gray-400">رقم الجوال</label><p className="text-white">{selectedPatient.phone || 'غير محدد'}</p></div>
                  <div><label className="block text-sm text-gray-400">البريد الإلكتروني</label><p className="text-white">{selectedPatient.email || 'غير محدد'}</p></div>
                  <div><label className="block text-sm text-gray-400">التشخيص</label><p className="text-white">{selectedPatient.diagnosis}</p></div>
                  <div><label className="block text-sm text-gray-400">تاريخ التشخيص</label><p className="text-white">{selectedPatient.diagnosisDate}</p></div>
                  <div><label className="block text-sm text-gray-400">درجة الحالة</label><p className={getSeverityColor(selectedPatient.severity)}>{getSeverityText(selectedPatient.severity)}</p></div>
                  <div><label className="block text-sm text-gray-400">الدكتور المعالج</label><p className="text-white">{getDoctorName(selectedPatient.mainDoctorId, currentLang)}</p></div>
                  <div className="md:col-span-2"><label className="block text-sm text-gray-400">التوصيات الطبية</label><p className="text-white">{selectedPatient.medicalRecommendations || 'لا توجد توصيات'}</p></div>
                  <div className="md:col-span-2"><label className="block text-sm text-gray-400">ملاحظات</label><p className="text-white">{selectedPatient.notes || 'لا توجد ملاحظات'}</p></div>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center"><span className="text-gray-400">نسبة التقدم العلاجي</span><span className="text-white font-bold">{Math.round(getPatientStats(selectedPatient).progress)}%</span></div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${getPatientStats(selectedPatient).progress}%` }}></div></div>
                </div>
              </div>
            )}
            
            {/* Tab: الجلسات - نظام متكامل */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><CalendarDays size={18} className="text-purple-400" /> سجل الجلسات</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setShowSessionModal(true)} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={14} /> جلسة مفردة</button>
                  </div>
                </div>
                
                {/* إحصائيات الجلسات */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-green-500/10 rounded-lg p-2 text-center"><CheckCircle size={20} className="text-green-400 mx-auto mb-1" /><div className="text-lg font-bold text-white">{getPatientStats(selectedPatient).completed}</div><div className="text-xs text-gray-400">حاضر</div></div>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-center"><Calendar size={20} className="text-blue-400 mx-auto mb-1" /><div className="text-lg font-bold text-white">{getPatientStats(selectedPatient).scheduled}</div><div className="text-xs text-gray-400">مجدول</div></div>
                  <div className="bg-red-500/10 rounded-lg p-2 text-center"><Ban size={20} className="text-red-400 mx-auto mb-1" /><div className="text-lg font-bold text-white">{getPatientStats(selectedPatient).absent}</div><div className="text-xs text-gray-400">غائب</div></div>
                  <div className="bg-gray-500/10 rounded-lg p-2 text-center"><XCircle size={20} className="text-gray-400 mx-auto mb-1" /><div className="text-lg font-bold text-white">{getPatientStats(selectedPatient).cancelled}</div><div className="text-xs text-gray-400">ملغي</div></div>
                </div>
                
                {/* قائمة الجلسات */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedPatient.sessionsHistory?.length > 0 ? (
                    [...selectedPatient.sessionsHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map((session) => (
                      <div key={session.id} className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition cursor-pointer" onClick={() => { setSelectedSession(session); setShowSessionDetailsModal(true); }}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {getSessionStatusIcon(session.status)}
                            <div><p className="text-white font-medium">{session.date} - {session.time}</p>{session.notes && <p className="text-sm text-gray-400 mt-1">{session.notes.substring(0, 50)}</p>}</div>
                          </div>
                          {getSessionStatusBadge(session.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">لا توجد جلسات مسجلة. أضف جلسة جديدة باستخدام الزر أعلاه.</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Tab: الأدوية */}
            {activeTab === 'medications' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-white">الأدوية الموصوفة</h3><button onClick={() => setShowMedicationModal(true)} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={14} /> إضافة دواء</button></div>
                {selectedPatient.medications?.length > 0 ? selectedPatient.medications.map((med, idx) => (
                  <div key={idx} className="bg-gray-700/30 rounded-lg p-3"><div className="flex items-center gap-2"><Pill size={16} className="text-green-400" /><p className="font-semibold text-white">{med.name}</p></div><p className="text-sm text-gray-400 ml-6">{med.dosage} - {med.frequency}</p><p className="text-xs text-gray-500 ml-6">{med.startDate} إلى {med.endDate}</p></div>
                )) : <p className="text-gray-400 text-center py-8">لا توجد أدوية مسجلة</p>}
              </div>
            )}
            
            {/* Tab: التقارير */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-white">التقارير الطبية</h3><button onClick={() => setShowReportModal(true)} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={14} /> تقرير جديد</button></div>
                {selectedPatient.reports?.length > 0 ? selectedPatient.reports.map((report) => (
                  <div key={report.id} className="bg-gray-700/30 rounded-lg p-3"><div className="flex justify-between items-start"><div><p className="font-semibold text-white">{report.title}</p><p className="text-sm text-gray-400">{report.content}</p><p className="text-xs text-gray-500 mt-1">{new Date(report.date).toLocaleDateString()}</p></div><FileText size={20} className="text-blue-400" /></div></div>
                )) : <p className="text-gray-400 text-center py-8">لا توجد تقارير مسجلة</p>}
              </div>
            )}
            
            {/* Tab: الصور والأشعة */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-white">الصور والأشعة</h3><button onClick={() => { setUploadType('xray'); setUploadTitle(''); setUploadDesc(''); setSelectedFile(null); setShowImageModal(true); }} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Upload size={14} /> رفع صورة</button></div>
                
                {selectedPatient.images?.filter(i => i.type === 'xray').length > 0 && (
                  <div><h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2"><ImageIcon size={16} className="text-blue-400" /> الأشعة</h4><div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPatient.images.filter(i => i.type === 'xray').map((img, idx) => (
                      <div key={img.id} className="bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer group" onClick={() => handleViewImage(selectedPatient.images.filter(i => i.type === 'xray'), idx)}>
                        <img src={img.data} alt={img.title} className="w-full h-32 object-cover" />
                        <div className="p-2"><p className="text-sm text-white truncate">{img.title}</p><p className="text-xs text-gray-400">{new Date(img.date).toLocaleDateString()}</p></div>
                      </div>
                    ))}
                  </div></div>
                )}
                
                {selectedPatient.images?.filter(i => i.type === 'report').length > 0 && (
                  <div><h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2"><FileImage size={16} className="text-green-400" /> التقارير المصورة</h4><div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPatient.images.filter(i => i.type === 'report').map((img, idx) => (
                      <div key={img.id} className="bg-gray-700/50 rounded-lg overflow-hidden cursor-pointer group" onClick={() => handleViewImage(selectedPatient.images.filter(i => i.type === 'report'), idx)}>
                        <img src={img.data} alt={img.title} className="w-full h-32 object-cover" />
                        <div className="p-2"><p className="text-sm text-white truncate">{img.title}</p><p className="text-xs text-gray-400">{new Date(img.date).toLocaleDateString()}</p></div>
                      </div>
                    ))}
                  </div></div>
                )}
                
                {(!selectedPatient.images || selectedPatient.images.length === 0) && (
                  <p className="text-gray-400 text-center py-8">لا توجد صور أو أشعة مسجلة</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal تفاصيل الجلسة - لتسجيل الحضور/الغياب */}
      {showSessionDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تفاصيل الجلسة</h2>
              <button onClick={() => setShowSessionDetailsModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-white">{selectedSession.date}</p><p className="text-gray-400">{selectedSession.time}</p></div>
              {selectedSession.notes && <div><label className="block text-sm text-gray-400">ملاحظات</label><p className="text-white bg-gray-700/30 p-2 rounded-lg">{selectedSession.notes}</p></div>}
              
              <div className="border-t border-gray-700 pt-4">
                <label className="block text-sm text-gray-400 mb-2">حالة الجلسة الحالية</label>
                <div className="flex items-center gap-2 mb-4">{getSessionStatusIcon(selectedSession.status)}<span className="text-white">{currentLang === 'ar' ? sessionStatus[selectedSession.status]?.ar : sessionStatus[selectedSession.status]?.en}</span></div>
                
                <label className="block text-sm text-gray-400 mb-2">تحديث الحالة</label>
                <div className="flex gap-2">
                  <button onClick={() => handleMarkAttendance(selectedSession.id, 'attended')} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 flex items-center justify-center gap-2"><Check size={16} /> حضور</button>
                  <button onClick={() => handleMarkAttendance(selectedSession.id, 'absent')} className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 flex items-center justify-center gap-2"><Ban size={16} /> غياب</button>
                  <button onClick={() => handleMarkAttendance(selectedSession.id, 'cancelled')} className="flex-1 bg-gray-500/20 text-gray-400 py-2 rounded-lg hover:bg-gray-500/30 flex items-center justify-center gap-2"><XCircle size={16} /> إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal إضافة جلسة جديدة */}
      {showSessionModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة جلسة جديدة</h2>
            <div className="space-y-3">
              <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSession.date} onChange={(e) => setNewSession({...newSession, date: e.target.value})} />
              <input type="time" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSession.time} onChange={(e) => setNewSession({...newSession, time: e.target.value})} />
              <textarea placeholder="ملاحظات الجلسة (اختياري)" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={newSession.notes} onChange={(e) => setNewSession({...newSession, notes: e.target.value})} />
              <div className="flex gap-2 pt-2">
                <button onClick={handleAddSession} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">إضافة جلسة</button>
                <button onClick={handleAddMultipleSessions} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 text-sm">إضافة 4 جلسات أسبوعية</button>
              </div>
              <button onClick={() => setShowSessionModal(false)} className="w-full bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button>
            </div>
          </div>
        </div>
      )}
      
      {/* باقي المودالات (Add Patient, Upload Image, Add Medication, Add Report) */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة مريض جديد</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-400">الاسم (عربي) *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">الاسم (English)</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">العمر *</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">رقم الجوال</label><input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">البريد الإلكتروني</label><input type="email" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">عدد الجلسات المطلوبة</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.totalSessions} onChange={(e) => setFormData({...formData, totalSessions: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">التشخيص</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">درجة الحالة</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})}><option value="mild">بسيط</option><option value="moderate">متوسط</option><option value="severe">شديد</option></select></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400">الدكتور المعالج</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.mainDoctorId} onChange={(e) => setFormData({...formData, mainDoctorId: e.target.value})}><option value="">اختر الدكتور</option>{availableDoctors.map(d => <option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn}</option>)}</select></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400">التوصيات الطبية</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.medicalRecommendations} onChange={(e) => setFormData({...formData, medicalRecommendations: e.target.value})} /></div>
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700"><button onClick={handleAddPatient} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">إضافة</button><button onClick={() => setShowAddPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button></div>
          </div>
        </div>
      )}
      
      {showImageModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">رفع صورة جديدة</h2>
            <div className="space-y-3">
              <div className="flex gap-2"><button onClick={() => setUploadType('xray')} className={`flex-1 py-2 rounded-lg ${uploadType === 'xray' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>أشعة</button><button onClick={() => setUploadType('report')} className={`flex-1 py-2 rounded-lg ${uploadType === 'report' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>تقرير مصور</button></div>
              <input type="text" placeholder="عنوان الصورة" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
              <textarea placeholder="وصف الصورة (اختياري)" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} />
              <input type="file" accept="image/*" onChange={handleFileSelect} className="w-full p-2 bg-gray-700 rounded-lg text-white file:mr-2 file:py-1 file:px-3 file:rounded-lg file:bg-blue-500/20 file:text-blue-400 file:border-0" />
              {selectedFile && <p className="text-sm text-green-400">✓ تم اختيار: {selectedFile.name}</p>}
              <div className="flex gap-3 pt-4"><button onClick={handleUploadImage} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">رفع</button><button onClick={() => setShowImageModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}
      
      {showMedicationModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة دواء جديد</h2>
            <div className="space-y-3"><input type="text" placeholder="اسم الدواء" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.name} onChange={(e) => setNewMedication({...newMedication, name: e.target.value})} /><input type="text" placeholder="الجرعة" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.dosage} onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})} /><input type="text" placeholder="عدد المرات" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.frequency} onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})} /><input type="date" placeholder="تاريخ البدء" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.startDate} onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})} /><input type="date" placeholder="تاريخ الانتهاء" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.endDate} onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})} /><div className="flex gap-3"><button onClick={handleAddMedication} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowMedicationModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
          </div>
        </div>
      )}
      
      {showReportModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة تقرير طبي</h2>
            <div className="space-y-3"><input type="text" placeholder="عنوان التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newReport.title} onChange={(e) => setNewReport({...newReport, title: e.target.value})} /><textarea placeholder="محتوى التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="5" value={newReport.content} onChange={(e) => setNewReport({...newReport, content: e.target.value})} /><div className="flex gap-3"><button onClick={handleAddReport} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowReportModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
          </div>
        </div>
      )}
      
      {showImageViewer && (
        <ImageViewer images={viewerImages} onDelete={(imageId) => handleDeleteImage(imageId)} onClose={() => setShowImageViewer(false)} />
      )}
    </div>
  )
}
