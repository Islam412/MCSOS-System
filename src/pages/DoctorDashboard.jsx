import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, Activity, Calendar, Clock, Edit, Save, X, UserPlus, 
  Trash2, CheckCircle, FileText, Image, Pill, Stethoscope,
  Calendar as CalendarIcon, Clock as ClockIcon, Phone, Mail,
  AlertCircle, TrendingUp, Plus, Eye, Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  getPatients, savePatients, addPatient, updatePatient, deletePatient,
  addSession, updateSessionStatus, addReport, addImage,
  availableDoctors, severityLevels, sessionStatus,
  getDoctorName
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
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMedicationModal, setShowMedicationModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  
  const [formData, setFormData] = useState({
    nameAr: '', nameEn: '', nameFr: '', age: '', phone: '', email: '',
    diagnosis: '', diagnosisDate: '', severity: 'moderate',
    mainDoctorId: '', secondaryDoctorId: '', totalSessions: '',
    medications: [], medicalRecommendations: '', notes: ''
  })
  
  const [newSession, setNewSession] = useState({ date: '', time: '', notes: '' })
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
  
  const handleMarkAttendance = (patientId, sessionId) => {
    const updated = updateSessionStatus(patientId, sessionId, 'attended')
    setPatients(updated)
    toast.success('تم تسجيل الحضور بنجاح')
  }
  
  const handleAddSession = () => {
    if (!newSession.date || !newSession.time) {
      toast.error('الرجاء إدخال التاريخ والوقت')
      return
    }
    const updated = addSession(selectedPatient.id, { ...newSession, status: 'scheduled' })
    setPatients(updated)
    setShowSessionModal(false)
    setNewSession({ date: '', time: '', notes: '' })
    toast.success('تم إضافة الجلسة بنجاح')
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
    return <span className={`text-xs px-2 py-1 rounded-full ${s?.color} bg-opacity-20 bg-current`}>{currentLang === 'ar' ? s?.ar : s?.en}</span>
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
      
      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.length}</div><div className="text-sm text-gray-400">إجمالي المرضى</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.filter(p => p.status === 'active').length}</div><div className="text-sm text-gray-400">مرضى نشطين</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.reduce((sum, p) => sum + p.totalSessions, 0)}</div><div className="text-sm text-gray-400">إجمالي الجلسات</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-xl"><Clock className="text-orange-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{patients.reduce((sum, p) => sum + p.completedSessions, 0)}</div><div className="text-sm text-gray-400">جلسات مكتملة</div></div></div>
        </div>
      </div>
      
      {/* قائمة المرضى */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-800/50">
              <div className="flex justify-between items-start">
                <div><h3 className="text-lg font-bold text-white">{getPatientName(patient)}</h3><p className="text-sm text-gray-400">{patient.age} سنة</p></div>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(patient.severity)} bg-opacity-20 bg-current`}>{getSeverityText(patient.severity)}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm"><Stethoscope size={14} className="text-blue-400" /><span className="text-gray-300">الدكتور: {getDoctorName(patient.mainDoctorId, currentLang)}</span></div>
              <div className="flex items-center gap-2 text-sm"><CalendarIcon size={14} className="text-purple-400" /><span className="text-gray-300">الموعد القادم: {patient.nextSession?.date || 'غير محدد'}</span></div>
              <div className="flex items-center gap-2 text-sm"><Activity size={14} className="text-green-400" /><span className="text-gray-300">التقدم: {Math.round(patient.progress)}%</span></div>
              <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${patient.progress}%` }}></div></div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setSelectedPatient(patient); setActiveTab('info'); setShowPatientModal(true); }} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm hover:bg-blue-500/30">تفاصيل</button>
                <button onClick={() => { setSelectedPatient(patient); setShowSessionModal(true); }} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm hover:bg-green-500/30">إضافة جلسة</button>
              </div>
            </div>
          </div>
        ))}
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
            <div className="flex gap-2 border-b border-gray-700 mb-4">
              {['info', 'sessions', 'medications', 'reports'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm rounded-t-lg transition ${activeTab === tab ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>
                  {tab === 'info' && 'معلومات عامة'} {tab === 'sessions' && 'الجلسات'} {tab === 'medications' && 'الأدوية'} {tab === 'reports' && 'التقارير'}
                </button>
              ))}
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
                <div className="bg-gray-700/30 p-3 rounded-lg"><div className="flex justify-between items-center"><span className="text-gray-400">نسبة التقدم العلاجي</span><span className="text-white font-bold">{Math.round(selectedPatient.progress)}%</span></div><div className="w-full bg-gray-600 rounded-full h-2 mt-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${selectedPatient.progress}%` }}></div></div></div>
              </div>
            )}
            
            {/* Tab: الجلسات */}
            {activeTab === 'sessions' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-white">سجل الجلسات</h3><button onClick={() => setShowSessionModal(true)} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={14} /> جلسة جديدة</button></div>
                {selectedPatient.sessionsHistory?.length > 0 ? selectedPatient.sessionsHistory.map((session) => (
                  <div key={session.id} className="bg-gray-700/30 rounded-lg p-3 flex justify-between items-center">
                    <div><p className="text-white">{session.date} - {session.time}</p>{session.notes && <p className="text-sm text-gray-400">{session.notes}</p>}</div>
                    <div className="flex items-center gap-2">{getSessionStatusBadge(session.status)}</div>
                  </div>
                )) : <p className="text-gray-400 text-center py-8">لا توجد جلسات مسجلة</p>}
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
          </div>
        </div>
      )}
      
      {/* Modal إضافة مريض جديد */}
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
              <div><label className="block text-sm text-gray-400">التشخيص</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">تاريخ التشخيص</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.diagnosisDate} onChange={(e) => setFormData({...formData, diagnosisDate: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400">درجة الحالة</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})}><option value="mild">بسيط</option><option value="moderate">متوسط</option><option value="severe">شديد</option></select></div>
              <div><label className="block text-sm text-gray-400">الدكتور المعالج</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.mainDoctorId} onChange={(e) => setFormData({...formData, mainDoctorId: e.target.value})}><option value="">اختر الدكتور</option>{availableDoctors.map(d => <option key={d.id} value={d.id}>{currentLang === 'ar' ? d.nameAr : d.nameEn}</option>)}</select></div>
              <div><label className="block text-sm text-gray-400">عدد الجلسات المطلوبة</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.totalSessions} onChange={(e) => setFormData({...formData, totalSessions: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400">التوصيات الطبية</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.medicalRecommendations} onChange={(e) => setFormData({...formData, medicalRecommendations: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400">ملاحظات إضافية</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700"><button onClick={handleAddPatient} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">إضافة</button><button onClick={() => setShowAddPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button></div>
          </div>
        </div>
      )}
      
      {/* Modal إضافة جلسة */}
      {showSessionModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة جلسة جديدة</h2>
            <div className="space-y-3">
              <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSession.date} onChange={(e) => setNewSession({...newSession, date: e.target.value})} />
              <input type="time" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSession.time} onChange={(e) => setNewSession({...newSession, time: e.target.value})} />
              <textarea placeholder="ملاحظات الجلسة" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" value={newSession.notes} onChange={(e) => setNewSession({...newSession, notes: e.target.value})} />
              <div className="flex gap-3"><button onClick={handleAddSession} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowSessionModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal إضافة دواء */}
      {showMedicationModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة دواء جديد</h2>
            <div className="space-y-3">
              <input type="text" placeholder="اسم الدواء" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.name} onChange={(e) => setNewMedication({...newMedication, name: e.target.value})} />
              <input type="text" placeholder="الجرعة (مثال: 500mg)" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.dosage} onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})} />
              <input type="text" placeholder="عدد المرات (مثال: مرتين يومياً)" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.frequency} onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})} />
              <input type="date" placeholder="تاريخ البدء" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.startDate} onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})} />
              <input type="date" placeholder="تاريخ الانتهاء" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newMedication.endDate} onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})} />
              <div className="flex gap-3"><button onClick={handleAddMedication} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowMedicationModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal إضافة تقرير */}
      {showReportModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة تقرير طبي</h2>
            <div className="space-y-3">
              <input type="text" placeholder="عنوان التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newReport.title} onChange={(e) => setNewReport({...newReport, title: e.target.value})} />
              <textarea placeholder="محتوى التقرير" className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="5" value={newReport.content} onChange={(e) => setNewReport({...newReport, content: e.target.value})} />
              <div className="flex gap-3"><button onClick={handleAddReport} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowReportModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
