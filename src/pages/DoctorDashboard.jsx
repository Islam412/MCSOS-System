import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Activity, Calendar, Clock, Edit, Save, X, UserPlus, Trash2, CheckCircle, Stethoscope, ListChecks } from 'lucide-react'
import toast from 'react-hot-toast'

// خدمة تخزين البيانات في LocalStorage
const STORAGE_KEYS = {
  PATIENTS: 'mcsos_patients_v2',
  DOCTORS: 'mcsos_doctors'
}

const defaultPatients = [
  { id: 1, nameAr: 'أحمد محمد', nameEn: 'Ahmed Mohamed', nameFr: 'Ahmed Mohamed', age: 35, diagnosisAr: 'تمزق في الرباط الصليبي', diagnosisEn: 'ACL Tear', diagnosisFr: 'Déchirure du LCA', treatmentAr: 'علاج طبيعي', treatmentEn: 'Physical Therapy', treatmentFr: 'Physiothérapie', sessions: 8, completed: 3, status: 'active' },
  { id: 2, nameAr: 'سارة حسن', nameEn: 'Sara Hassan', nameFr: 'Sara Hassan', age: 28, diagnosisAr: 'انزلاق غضروفي', diagnosisEn: 'Herniated Disc', diagnosisFr: 'Hernie Discale', treatmentAr: 'تمارين إطالة', treatmentEn: 'Stretching Exercises', treatmentFr: 'Exercices étirement', sessions: 12, completed: 5, status: 'active' },
  { id: 3, nameAr: 'محمود علي', nameEn: 'Mahmoud Ali', nameFr: 'Mahmoud Ali', age: 42, diagnosisAr: 'التهاب المفاصل', diagnosisEn: 'Arthritis', diagnosisFr: 'Arthrite', treatmentAr: 'علاج دوائي', treatmentEn: 'Medication', treatmentFr: 'Médicaments', sessions: 6, completed: 6, status: 'completed' },
]

const defaultDoctors = [
  { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic' },
  { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy' },
  { id: 3, nameAr: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specializationAr: 'أعصاب', specializationEn: 'Neurology' },
  { id: 4, nameAr: 'د. نورة سعيد', nameEn: 'Dr. Noura Saeed', specializationAr: 'أطفال', specializationEn: 'Pediatrics' },
]

const getPatients = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS)
  return saved ? JSON.parse(saved) : defaultPatients
}

const savePatients = (patients) => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
}

const getDoctors = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.DOCTORS)
  return saved ? JSON.parse(saved) : defaultDoctors
}

const saveDoctors = (doctors) => {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors))
}

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language
  
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [assessmentData, setAssessmentData] = useState({ diagnosis: '', treatment: '', sessions: '', notes: '' })
  const [newPatient, setNewPatient] = useState({ nameAr: '', nameEn: '', nameFr: '', age: '', diagnosisAr: '', diagnosisEn: '', diagnosisFr: '', treatmentAr: '', treatmentEn: '', treatmentFr: '', sessions: '' })
  const [newDoctor, setNewDoctor] = useState({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '' })
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = () => {
    setPatients(getPatients())
    setDoctors(getDoctors())
    setLoading(false)
  }
  
  const getPatientName = (patient) => {
    if (currentLang === 'ar') return patient.nameAr
    if (currentLang === 'fr') return patient.nameFr
    return patient.nameEn
  }
  
  const getDoctorName = (doctor) => {
    if (currentLang === 'ar') return doctor.nameAr
    return doctor.nameEn
  }
  
  const getSpecialization = (doctor) => {
    if (currentLang === 'ar') return doctor.specializationAr
    return doctor.specializationEn
  }
  
  const handleAddDoctor = () => {
    if (!newDoctor.nameAr || !newDoctor.specializationAr) {
      toast.error('الرجاء إدخال اسم الطبيب والتخصص')
      return
    }
    const doctor = {
      id: Date.now(),
      nameAr: newDoctor.nameAr,
      nameEn: newDoctor.nameEn || newDoctor.nameAr,
      specializationAr: newDoctor.specializationAr,
      specializationEn: newDoctor.specializationEn || newDoctor.specializationAr
    }
    const updatedDoctors = [...doctors, doctor]
    setDoctors(updatedDoctors)
    saveDoctors(updatedDoctors)
    setShowAddDoctorModal(false)
    setNewDoctor({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '' })
    toast.success('تم إضافة الطبيب بنجاح')
  }
  
  const handleDeleteDoctor = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      const updated = doctors.filter(d => d.id !== id)
      setDoctors(updated)
      saveDoctors(updated)
      toast.success('تم حذف الطبيب بنجاح')
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
    const updated = [...patients, patient]
    setPatients(updated)
    savePatients(updated)
    setShowAddPatientModal(false)
    setNewPatient({ nameAr: '', nameEn: '', nameFr: '', age: '', diagnosisAr: '', diagnosisEn: '', diagnosisFr: '', treatmentAr: '', treatmentEn: '', treatmentFr: '', sessions: '' })
    toast.success('تم إضافة المريض بنجاح')
  }
  
  const handleDeletePatient = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المريض؟')) {
      const updated = patients.filter(p => p.id !== id)
      setPatients(updated)
      savePatients(updated)
      toast.success('تم حذف المريض بنجاح')
    }
  }
  
  const getStatusBadge = (status) => status === 'active'
    ? <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">نشط</span>
    : <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">مكتمل</span>
  
  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.status === 'active').length
  const totalSessions = patients.reduce((sum, p) => sum + p.sessions, 0)
  const completedSessions = patients.reduce((sum, p) => sum + p.completed, 0)
  
  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div><h1 className="text-3xl font-bold gradient-text">لوحة الأطباء</h1><p className="text-gray-400 mt-1">إدارة الأطباء والمرضى</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddDoctorModal(true)} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30"><UserPlus size={18} /> إضافة طبيب</button>
          <button onClick={() => setShowAddPatientModal(true)} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30"><UserPlus size={18} /> إضافة مريض</button>
        </div>
      </div>
      
      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{totalPatients}</div><div className="text-sm text-gray-400">إجمالي المرضى</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{activePatients}</div><div className="text-sm text-gray-400">مرضى نشطين</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{totalSessions}</div><div className="text-sm text-gray-400">إجمالي الجلسات</div></div></div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-xl"><Clock className="text-orange-400" size={20} /></div><div><div className="text-2xl font-bold text-white">{completedSessions}</div><div className="text-sm text-gray-400">جلسات مكتملة</div></div></div>
        </div>
      </div>
      
      {/* قائمة الأطباء */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Stethoscope size={20} className="text-purple-400" /> قائمة الأطباء</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-6 py-3 text-sm text-gray-300">الطبيب</th><th className="px-6 py-3 text-sm text-gray-300">التخصص</th><th className="px-6 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {doctors.map((doctor) => (<tr key={doctor.id}><td className="px-6 py-4 font-semibold text-white">{getDoctorName(doctor)}</td><td className="px-6 py-4 text-gray-300">{getSpecialization(doctor)}</td><td className="px-6 py-4"><button onClick={() => handleDeleteDoctor(doctor.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button></td></tr>))}
              {doctors.length === 0 && <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">لا يوجد أطباء</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* قائمة المرضى */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">قائمة المرضى</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-6 py-3 text-sm text-gray-300">المريض</th><th className="px-6 py-3 text-sm text-gray-300">العمر</th><th className="px-6 py-3 text-sm text-gray-300">التشخيص</th><th className="px-6 py-3 text-sm text-gray-300">الجلسات</th><th className="px-6 py-3 text-sm text-gray-300">الحالة</th><th className="px-6 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {patients.map((patient) => (<tr key={patient.id}><td className="px-6 py-4 font-semibold text-white">{getPatientName(patient)}</td><td className="px-6 py-4 text-gray-300">{patient.age} سنة</td><td className="px-6 py-4 text-gray-300">{patient.diagnosisAr}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-16 bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(patient.completed / patient.sessions) * 100}%` }}></div></div><span className="text-sm text-gray-400">{patient.completed}/{patient.sessions}</span></div></td><td className="px-6 py-4">{getStatusBadge(patient.status)}</td><td className="px-6 py-4"><button onClick={() => handleDeletePatient(patient.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button></td></tr>))}
              {patients.length === 0 && <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">لا يوجد مرضى</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal إضافة طبيب */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">إضافة طبيب جديد</h2><button onClick={() => setShowAddDoctorModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-3"><input type="text" placeholder="الاسم (عربي)" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameAr} onChange={(e) => setNewDoctor({...newDoctor, nameAr: e.target.value})} /><input type="text" placeholder="الاسم (English)" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameEn} onChange={(e) => setNewDoctor({...newDoctor, nameEn: e.target.value})} /><input type="text" placeholder="التخصص (عربي)" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.specializationAr} onChange={(e) => setNewDoctor({...newDoctor, specializationAr: e.target.value})} /><div className="flex gap-3 pt-4"><button onClick={handleAddDoctor} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowAddDoctorModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div></div>
          </div>
        </div>
      )}
      
      {/* Modal إضافة مريض */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">إضافة مريض جديد</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400">الاسم (عربي) *</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.nameAr} onChange={(e) => setNewPatient({...newPatient, nameAr: e.target.value})} /></div><div><label className="block text-sm text-gray-400">العمر *</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} /></div><div><label className="block text-sm text-gray-400">عدد الجلسات</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newPatient.sessions} onChange={(e) => setNewPatient({...newPatient, sessions: e.target.value})} /></div><div className="md:col-span-2"><label className="block text-sm text-gray-400">التشخيص (عربي)</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={newPatient.diagnosisAr} onChange={(e) => setNewPatient({...newPatient, diagnosisAr: e.target.value})} /></div><div className="md:col-span-2"><label className="block text-sm text-gray-400">خطة العلاج (عربي)</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={newPatient.treatmentAr} onChange={(e) => setNewPatient({...newPatient, treatmentAr: e.target.value})} /></div></div>
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700"><button onClick={handleAddPatient} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg">إضافة</button><button onClick={() => setShowAddPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
