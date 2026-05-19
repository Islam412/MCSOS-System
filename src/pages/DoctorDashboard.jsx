import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Activity, Calendar, Clock, Edit, Save, X, UserPlus, TrendingUp, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

// خدمة تخزين البيانات في LocalStorage
const STORAGE_KEYS = {
  PATIENTS: 'mcsos_patients'
}

const defaultPatients = [
  { id: 1, nameAr: 'أحمد محمد', nameEn: 'Ahmed Mohamed', nameFr: 'Ahmed Mohamed', age: 35, diagnosisAr: 'تمزق في الرباط الصليبي', diagnosisEn: 'ACL Tear', diagnosisFr: 'Déchirure du LCA', treatmentAr: 'علاج طبيعي', treatmentEn: 'Physical Therapy', treatmentFr: 'Physiothérapie', sessions: 8, completed: 3, status: 'active' },
  { id: 2, nameAr: 'سارة حسن', nameEn: 'Sara Hassan', nameFr: 'Sara Hassan', age: 28, diagnosisAr: 'انزلاق غضروفي', diagnosisEn: 'Herniated Disc', diagnosisFr: 'Hernie Discale', treatmentAr: 'تمارين إطالة', treatmentEn: 'Stretching Exercises', treatmentFr: 'Exercices étirement', sessions: 12, completed: 5, status: 'active' },
  { id: 3, nameAr: 'محمود علي', nameEn: 'Mahmoud Ali', nameFr: 'Mahmoud Ali', age: 42, diagnosisAr: 'التهاب المفاصل', diagnosisEn: 'Arthritis', diagnosisFr: 'Arthrite', treatmentAr: 'علاج دوائي', treatmentEn: 'Medication', treatmentFr: 'Médicaments', sessions: 6, completed: 6, status: 'completed' },
  { id: 4, nameAr: 'نورة عبدالله', nameEn: 'Noura Abdullah', nameFr: 'Noura Abdullah', age: 30, diagnosisAr: 'شد عضلي', diagnosisEn: 'Muscle Strain', diagnosisFr: 'Déchirure musculaire', treatmentAr: 'راحة وعلاج طبيعي', treatmentEn: 'Rest & Therapy', treatmentFr: 'Repos et thérapie', sessions: 10, completed: 0, status: 'active' }
]

// دوال حفظ واسترجاع البيانات
const getPatients = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS)
  return saved ? JSON.parse(saved) : defaultPatients
}

const savePatients = (patients) => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
}

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language
  
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [assessmentData, setAssessmentData] = useState({
    diagnosis: '',
    treatment: '',
    sessions: '',
    notes: ''
  })
  
  const [newPatient, setNewPatient] = useState({
    nameAr: '', nameEn: '', nameFr: '',
    age: '',
    diagnosisAr: '', diagnosisEn: '', diagnosisFr: '',
    treatmentAr: '', treatmentEn: '', treatmentFr: '',
    sessions: ''
  })
  
  // تحميل البيانات
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
  
  const getDiagnosis = (patient) => {
    if (currentLang === 'ar') return patient.diagnosisAr
    if (currentLang === 'fr') return patient.diagnosisFr
    return patient.diagnosisEn
  }
  
  const getTreatment = (patient) => {
    if (currentLang === 'ar') return patient.treatmentAr
    if (currentLang === 'fr') return patient.treatmentFr
    return patient.treatmentEn
  }
  
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setAssessmentData({
      diagnosis: getDiagnosis(patient),
      treatment: getTreatment(patient),
      sessions: patient.sessions,
      notes: ''
    })
    setShowAssessmentModal(true)
  }
  
  const handleSaveAssessment = () => {
    if (selectedPatient) {
      const updatedPatients = patients.map(p => 
        p.id === selectedPatient.id 
          ? { ...p, sessions: parseInt(assessmentData.sessions) }
          : p
      )
      setPatients(updatedPatients)
      savePatients(updatedPatients)
      toast.success('تم حفظ التقييم بنجاح')
      setShowAssessmentModal(false)
    }
  }
  
  const handleAddPatient = () => {
    if (!newPatient.nameAr || !newPatient.age) {
      toast.error('الرجاء إدخال الاسم والعمر')
      return
    }
    
    const patient = {
      id: Date.now(),
      nameAr: newPatient.nameAr,
      nameEn: newPatient.nameEn || newPatient.nameAr,
      nameFr: newPatient.nameFr || newPatient.nameAr,
      age: parseInt(newPatient.age),
      diagnosisAr: newPatient.diagnosisAr || 'قيد التشخيص',
      diagnosisEn: newPatient.diagnosisEn || 'Under Diagnosis',
      diagnosisFr: newPatient.diagnosisFr || 'En diagnostic',
      treatmentAr: newPatient.treatmentAr || 'قيد التحديد',
      treatmentEn: newPatient.treatmentEn || 'To be determined',
      treatmentFr: newPatient.treatmentFr || 'À déterminer',
      sessions: parseInt(newPatient.sessions) || 6,
      completed: 0,
      status: 'active'
    }
    
    const updatedPatients = [...patients, patient]
    setPatients(updatedPatients)
    savePatients(updatedPatients)
    toast.success(`تم إضافة المريض ${patient.nameAr} بنجاح`)
    setShowAddPatientModal(false)
    setNewPatient({
      nameAr: '', nameEn: '', nameFr: '',
      age: '',
      diagnosisAr: '', diagnosisEn: '', diagnosisFr: '',
      treatmentAr: '', treatmentEn: '', treatmentFr: '',
      sessions: ''
    })
  }
  
  const handleDeletePatient = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المريض؟')) {
      const updatedPatients = patients.filter(p => p.id !== id)
      setPatients(updatedPatients)
      savePatients(updatedPatients)
      toast.success('تم حذف المريض بنجاح')
    }
  }
  
  const handleUpdateStatus = (id, newStatus) => {
    const updatedPatients = patients.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    )
    setPatients(updatedPatients)
    savePatients(updatedPatients)
    toast.success(`تم تحديث حالة المريض إلى ${newStatus === 'active' ? 'نشط' : 'مكتمل'}`)
  }
  
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">نشط</span>
    }
    return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">مكتمل</span>
  }
  
  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.status === 'active').length
  const totalSessions = patients.reduce((sum, p) => sum + p.sessions, 0)
  const completedSessions = patients.reduce((sum, p) => sum + p.completed, 0)
  
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة الأطباء</h1>
          <p className="text-gray-400 mt-1">إدارة التقييمات والخطط العلاجية</p>
        </div>
        <button onClick={() => setShowAddPatientModal(true)} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-blue-500/30">
          <UserPlus size={18} /> إضافة مريض
        </button>
      </div>
      
      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{totalPatients}</div><div className="text-sm text-gray-400">إجمالي المرضى</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{activePatients}</div><div className="text-sm text-gray-400">علاجات نشطة</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{totalSessions}</div><div className="text-sm text-gray-400">إجمالي الجلسات</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl"><Clock className="text-orange-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{completedSessions}</div><div className="text-sm text-gray-400">جلسات مكتملة</div></div>
          </div>
        </div>
      </div>
      
      {/* جدول المرضى */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">مرضاي</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">تفاصيل المريض</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">التشخيص</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">خطة العلاج</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">الجلسات</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">الحالة</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{getPatientName(patient)}</div>
                    <div className="text-sm text-gray-400">{patient.age} سنة</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{getDiagnosis(patient)}</td>
                  <td className="px-6 py-4 text-gray-300">{getTreatment(patient)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(patient.completed / patient.sessions) * 100}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-400">{patient.completed}/{patient.sessions}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={patient.status}
                      onChange={(e) => handleUpdateStatus(patient.id, e.target.value)}
                      className="bg-gray-700 rounded-lg px-2 py-1 text-sm text-white border border-gray-600"
                    >
                      <option value="active">نشط</option>
                      <option value="completed">مكتمل</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleSelectPatient(patient)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeletePatient(patient.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal إضافة مريض - كامل */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">إضافة مريض جديد</h2>
              <button onClick={() => setShowAddPatientModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">الاسم (عربي) *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.nameAr} onChange={(e) => setNewPatient({...newPatient, nameAr: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">الاسم (English)</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.nameEn} onChange={(e) => setNewPatient({...newPatient, nameEn: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">العمر *</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">عدد الجلسات</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.sessions} onChange={(e) => setNewPatient({...newPatient, sessions: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold mb-1 text-gray-300">التشخيص (عربي)</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={newPatient.diagnosisAr} onChange={(e) => setNewPatient({...newPatient, diagnosisAr: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold mb-1 text-gray-300">خطة العلاج (عربي)</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={newPatient.treatmentAr} onChange={(e) => setNewPatient({...newPatient, treatmentAr: e.target.value})} /></div>
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
              <button onClick={handleAddPatient} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 border border-green-500/30">إضافة</button>
              <button onClick={() => setShowAddPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal التقييم الطبي */}
      {showAssessmentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">التقييم الطبي</h2>
              <button onClick={() => setShowAssessmentModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">اسم المريض</label><input type="text" value={getPatientName(selectedPatient)} disabled className="w-full p-2 bg-gray-700/50 rounded-lg text-white" /></div>
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">التشخيص</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={assessmentData.diagnosis} onChange={(e) => setAssessmentData({...assessmentData, diagnosis: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">خطة العلاج</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={assessmentData.treatment} onChange={(e) => setAssessmentData({...assessmentData, treatment: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">عدد الجلسات</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={assessmentData.sessions} onChange={(e) => setAssessmentData({...assessmentData, sessions: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1 text-gray-300">ملاحظات</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" placeholder="أضف ملاحظاتك هنا..." value={assessmentData.notes} onChange={(e) => setAssessmentData({...assessmentData, notes: e.target.value})} /></div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveAssessment} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 border border-blue-500/30">حفظ</button>
                <button onClick={() => setShowAssessmentModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
