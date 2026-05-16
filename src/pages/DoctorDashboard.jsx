import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Activity, Calendar, Clock, Edit, Save, X, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language
  
  // بيانات المرضى مع ترجمات متعددة
  const [patients, setPatients] = useState([
    { 
      id: 1, 
      nameAr: 'أحمد محمد', 
      nameEn: 'Ahmed Mohamed', 
      nameFr: 'Ahmed Mohamed',
      age: 35, 
      diagnosisAr: 'تمزق في الرباط الصليبي', 
      diagnosisEn: 'ACL Tear', 
      diagnosisFr: 'Déchirure du LCA',
      treatmentAr: 'علاج طبيعي', 
      treatmentEn: 'Physical Therapy', 
      treatmentFr: 'Physiothérapie',
      sessions: 8, 
      completed: 3, 
      status: 'active' 
    },
    { 
      id: 2, 
      nameAr: 'سارة حسن', 
      nameEn: 'Sara Hassan', 
      nameFr: 'Sara Hassan',
      age: 28, 
      diagnosisAr: 'انزلاق غضروفي', 
      diagnosisEn: 'Herniated Disc', 
      diagnosisFr: 'Hernie Discale',
      treatmentAr: 'تمارين إطالة', 
      treatmentEn: 'Stretching Exercises', 
      treatmentFr: 'Exercices d\'étirement',
      sessions: 12, 
      completed: 5, 
      status: 'active' 
    },
    { 
      id: 3, 
      nameAr: 'محمود علي', 
      nameEn: 'Mahmoud Ali', 
      nameFr: 'Mahmoud Ali',
      age: 42, 
      diagnosisAr: 'التهاب المفاصل', 
      diagnosisEn: 'Arthritis', 
      diagnosisFr: 'Arthrite',
      treatmentAr: 'علاج دوائي', 
      treatmentEn: 'Medication', 
      treatmentFr: 'Médicaments',
      sessions: 6, 
      completed: 6, 
      status: 'completed' 
    },
    { 
      id: 4, 
      nameAr: 'نورة عبدالله', 
      nameEn: 'Noura Abdullah', 
      nameFr: 'Noura Abdullah',
      age: 30, 
      diagnosisAr: 'شد عضلي', 
      diagnosisEn: 'Muscle Strain', 
      diagnosisFr: 'Déchirure musculaire',
      treatmentAr: 'راحة وعلاج طبيعي', 
      treatmentEn: 'Rest & Physical Therapy', 
      treatmentFr: 'Repos et physiothérapie',
      sessions: 10, 
      completed: 0, 
      status: 'active' 
    }
  ])
  
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [newPatient, setNewPatient] = useState({
    nameAr: '',
    nameEn: '',
    nameFr: '',
    age: '',
    diagnosisAr: '',
    diagnosisEn: '',
    diagnosisFr: '',
    treatmentAr: '',
    treatmentEn: '',
    treatmentFr: '',
    sessions: ''
  })
  
  const [assessmentData, setAssessmentData] = useState({
    diagnosis: '',
    treatment: '',
    sessions: '',
    notes: ''
  })
  
  // دالة للحصول على الاسم حسب اللغة
  const getPatientName = (patient) => {
    if (currentLang === 'ar') return patient.nameAr
    if (currentLang === 'fr') return patient.nameFr
    return patient.nameEn
  }
  
  // دالة للحصول على التشخيص حسب اللغة
  const getDiagnosis = (patient) => {
    if (currentLang === 'ar') return patient.diagnosisAr
    if (currentLang === 'fr') return patient.diagnosisFr
    return patient.diagnosisEn
  }
  
  // دالة للحصول على العلاج حسب اللغة
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
          ? { 
              ...p, 
              sessions: parseInt(assessmentData.sessions),
              completed: assessmentData.completed || p.completed
            }
          : p
      )
      setPatients(updatedPatients)
      toast.success(t('doctor.assessment_saved'))
      setShowAssessmentModal(false)
    }
  }
  
  const handleAddPatient = () => {
    if (!newPatient.nameAr || !newPatient.age) {
      toast.error('الرجاء إدخال اسم المريض والعمر')
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
    
    setPatients([...patients, patient])
    toast.success(`تم إضافة المريض ${patient.nameAr} بنجاح`)
    setShowAddPatientModal(false)
    setNewPatient({ nameAr: '', nameEn: '', nameFr: '', age: '', diagnosisAr: '', diagnosisEn: '', diagnosisFr: '', treatmentAr: '', treatmentEn: '', treatmentFr: '', sessions: '' })
  }
  
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{t('status.active')}</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{t('status.completed')}</span>
  }
  
  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.status === 'active').length
  const totalSessions = patients.reduce((sum, p) => sum + p.sessions, 0)
  const completedSessions = patients.reduce((sum, p) => sum + p.completed, 0)
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {t('doctor.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('doctor.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddPatientModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
        >
          <UserPlus size={18} />
          {t('doctor.add_patient')}
        </button>
      </div>
      
      {/* احصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="text-blue-600" size={18} /></div>
            <div><div className="text-xl md:text-2xl font-bold">{totalPatients}</div><div className="text-xs md:text-sm text-gray-500">{t('doctor.total_patients')}</div></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Activity className="text-green-600" size={18} /></div>
            <div><div className="text-xl md:text-2xl font-bold">{activePatients}</div><div className="text-xs md:text-sm text-gray-500">{t('doctor.active_treatments')}</div></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="text-purple-600" size={18} /></div>
            <div><div className="text-xl md:text-2xl font-bold">{totalSessions}</div><div className="text-xs md:text-sm text-gray-500">{t('doctor.total_sessions')}</div></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-sm border">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><Clock className="text-orange-600" size={18} /></div>
            <div><div className="text-xl md:text-2xl font-bold">{completedSessions}</div><div className="text-xs md:text-sm text-gray-500">{t('doctor.completed_sessions')}</div></div>
          </div>
        </div>
      </div>
      
      {/* جدول المرضى */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b">
          <h2 className="text-lg md:text-xl font-bold">{t('doctor.my_patients')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 md:px-6 py-3 text-xs md:text-sm font-semibold text-center">{t('reception.patient_details')}</th>
                <th className="px-3 md:px-6 py-3 text-xs md:text-sm font-semibold text-center">{t('doctor.diagnosis')}</th>
                <th className="px-3 md:px-6 py-3 text-xs md:text-sm font-semibold text-center">{t('doctor.treatment_plan')}</th>
                <th className="px-3 md:px-6 py-3 text-xs md:text-sm font-semibold text-center">{t('doctor.sessions_count')}</th>
                <th className="px-3 md:px-6 py-3 text-xs md:text-sm font-semibold text-center">{t('status.active')}</th>
                <th className="px-3 md:px-6 py-3 text-xs md:text-sm font-semibold text-center">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                    <div className="font-semibold text-sm md:text-base">{getPatientName(patient)}</div>
                    <div className="text-xs text-gray-500">{patient.age} {t('doctor.years')}</div>
                   </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base text-center">{getDiagnosis(patient)}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-base text-center">{getTreatment(patient)}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 md:w-20 bg-gray-200 rounded-full h-1.5 md:h-2">
                        <div className="bg-blue-600 h-1.5 md:h-2 rounded-full" style={{ width: `${(patient.completed / patient.sessions) * 100}%` }}></div>
                      </div>
                      <span className="text-xs md:text-sm text-gray-600">{patient.completed}/{patient.sessions}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center">{getStatusBadge(patient.status)}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                    <button
                      onClick={() => handleSelectPatient(patient)}
                      className="p-1.5 md:p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* مودال إضافة مريض */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('doctor.add_patient')}</h2>
              <button onClick={() => setShowAddPatientModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold mb-1">الاسم (عربي) *</label><input type="text" className="w-full p-2 border rounded-lg" value={newPatient.nameAr} onChange={(e) => setNewPatient({...newPatient, nameAr: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1">الاسم (English)</label><input type="text" className="w-full p-2 border rounded-lg" value={newPatient.nameEn} onChange={(e) => setNewPatient({...newPatient, nameEn: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1">العمر *</label><input type="number" className="w-full p-2 border rounded-lg" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1">عدد الجلسات</label><input type="number" className="w-full p-2 border rounded-lg" value={newPatient.sessions} onChange={(e) => setNewPatient({...newPatient, sessions: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold mb-1">التشخيص (عربي)</label><textarea className="w-full p-2 border rounded-lg" rows="2" value={newPatient.diagnosisAr} onChange={(e) => setNewPatient({...newPatient, diagnosisAr: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold mb-1">خطة العلاج (عربي)</label><textarea className="w-full p-2 border rounded-lg" rows="2" value={newPatient.treatmentAr} onChange={(e) => setNewPatient({...newPatient, treatmentAr: e.target.value})} /></div>
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t">
              <button onClick={handleAddPatient} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{t('common.save')}</button>
              <button onClick={() => setShowAddPatientModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* مودال التقييم */}
      {showAssessmentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('doctor.medical_assessment')}</h2>
              <button onClick={() => setShowAssessmentModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold mb-1">{t('doctor.patient_name')}</label><input type="text" value={getPatientName(selectedPatient)} disabled className="w-full p-2 border rounded-lg bg-gray-50" /></div>
              <div><label className="block text-sm font-semibold mb-1">{t('doctor.sessions_count')}</label><input type="number" className="w-full p-2 border rounded-lg" value={assessmentData.sessions} onChange={(e) => setAssessmentData({...assessmentData, sessions: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold mb-1">{t('doctor.notes')}</label><textarea className="w-full p-2 border rounded-lg" rows="3" placeholder={t('doctor.notes_placeholder')} value={assessmentData.notes} onChange={(e) => setAssessmentData({...assessmentData, notes: e.target.value})} /></div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveAssessment} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={16} /> {t('common.save')}</button>
                <button onClick={() => setShowAssessmentModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
