import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Stethoscope, ClipboardList, FileText, Calendar, Users, Clock, Activity, Plus, Edit, Save, X, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [patients, setPatients] = useState([
    { id: 1, name: 'أحمد محمد', age: 35, diagnosis: 'تمزق في الرباط الصليبي', treatment: 'علاج طبيعي', sessions: 8, completed: 3, status: 'active' },
    { id: 2, name: 'سارة حسن', age: 28, diagnosis: 'انزلاق غضروفي', treatment: 'تمارين إطالة', sessions: 12, completed: 5, status: 'active' },
    { id: 3, name: 'محمود علي', age: 42, diagnosis: 'التهاب المفاصل', treatment: 'علاج دوائي', sessions: 6, completed: 6, status: 'completed' },
  ])
  
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    diagnosis: '',
    treatment: '',
    sessions: ''
  })
  
  const [assessmentData, setAssessmentData] = useState({
    diagnosis: '',
    treatment: '',
    sessions: '',
    notes: ''
  })
  
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setAssessmentData({
      diagnosis: patient.diagnosis,
      treatment: patient.treatment,
      sessions: patient.sessions,
      notes: ''
    })
    setShowAssessmentModal(true)
  }
  
  const handleSaveAssessment = () => {
    if (selectedPatient) {
      setPatients(patients.map(p => 
        p.id === selectedPatient.id 
          ? { ...p, diagnosis: assessmentData.diagnosis, treatment: assessmentData.treatment, sessions: parseInt(assessmentData.sessions) }
          : p
      ))
      toast.success(t('doctor.assessment_saved'))
      setShowAssessmentModal(false)
    }
  }
  
  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.age) {
      toast.error('الرجاء إدخال اسم المريض والعمر')
      return
    }
    
    const patient = {
      id: Date.now(),
      name: newPatient.name,
      age: parseInt(newPatient.age),
      diagnosis: newPatient.diagnosis || 'قيد التشخيص',
      treatment: newPatient.treatment || 'قيد التحديد',
      sessions: parseInt(newPatient.sessions) || 6,
      completed: 0,
      status: 'active'
    }
    
    setPatients([...patients, patient])
    toast.success(`تم إضافة المريض ${patient.name} بنجاح`)
    setShowAddPatientModal(false)
    setNewPatient({ name: '', age: '', diagnosis: '', treatment: '', sessions: '' })
  }
  
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{t('status.active')}</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{t('status.completed')}</span>
  }
  
  // حساب الإحصائيات
  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.status === 'active').length
  const totalSessions = patients.reduce((sum, p) => sum + p.sessions, 0)
  const completedSessions = patients.reduce((sum, p) => sum + p.completed, 0)
  
  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
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
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPatients}</div>
              <div className="text-sm text-gray-500">{t('doctor.total_patients')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Activity className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activePatients}</div>
              <div className="text-sm text-gray-500">{t('doctor.active_treatments')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSessions}</div>
              <div className="text-sm text-gray-500">{t('doctor.total_sessions')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="text-orange-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedSessions}</div>
              <div className="text-sm text-gray-500">{t('doctor.completed_sessions')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('doctor.my_patients')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('reception.patient_details')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('doctor.diagnosis')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('doctor.treatment_plan')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('doctor.sessions_count')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('status.active')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('common.actions')}</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.age} {t('doctor.years')}</div>
                    </div>
                   </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{patient.diagnosis}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{patient.treatment}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(patient.completed / patient.sessions) * 100}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-600">{patient.completed}/{patient.sessions}</span>
                    </div>
                   </td>
                  <td className="px-6 py-4">{getStatusBadge(patient.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSelectPatient(patient)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
      
      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('doctor.add_patient')}</h2>
              <button onClick={() => setShowAddPatientModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('reception.name')} *</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  placeholder="أدخل اسم المريض"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.years')} *</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                  placeholder="أدخل العمر"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.diagnosis')}</label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  rows="2"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({...newPatient, diagnosis: e.target.value})}
                  placeholder="أدخل التشخيص"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.treatment_plan')}</label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  rows="2"
                  value={newPatient.treatment}
                  onChange={(e) => setNewPatient({...newPatient, treatment: e.target.value})}
                  placeholder="أدخل خطة العلاج"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.sessions_count')}</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  value={newPatient.sessions}
                  onChange={(e) => setNewPatient({...newPatient, sessions: e.target.value})}
                  placeholder="عدد الجلسات"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddPatient}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  {t('common.save')}
                </button>
                <button
                  onClick={() => setShowAddPatientModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Assessment Modal */}
      {showAssessmentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('doctor.medical_assessment')}</h2>
              <button onClick={() => setShowAssessmentModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.patient_name')}</label>
                <input type="text" value={selectedPatient.name} disabled className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.diagnosis')}</label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  rows="2"
                  value={assessmentData.diagnosis}
                  onChange={(e) => setAssessmentData({...assessmentData, diagnosis: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.treatment_plan')}</label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  rows="2"
                  value={assessmentData.treatment}
                  onChange={(e) => setAssessmentData({...assessmentData, treatment: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.sessions_count')}</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  value={assessmentData.sessions}
                  onChange={(e) => setAssessmentData({...assessmentData, sessions: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t('doctor.notes')}</label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  rows="3"
                  placeholder={t('doctor.notes_placeholder')}
                  value={assessmentData.notes}
                  onChange={(e) => setAssessmentData({...assessmentData, notes: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveAssessment}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {t('common.save')}
                </button>
                <button
                  onClick={() => setShowAssessmentModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
