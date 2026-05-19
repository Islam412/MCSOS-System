import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Users, Calendar, Activity, Download, Calendar as CalendarIcon, CheckCircle, XCircle, Edit, Plus, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  getStats, getDoctors, getWeeklySchedule,
  saveStats, saveDoctors, saveWeeklySchedule,
  addDoctor, deleteDoctor, updateDoctor,
  addSchedule, deleteSchedule, updateSchedule,
  calculateStatsFromSchedule, resetAllData
} from '../services/dataService'

export default function OperationsDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [stats, setStats] = useState({})
  const [doctors, setDoctors] = useState([])
  const [weeklySchedule, setWeeklySchedule] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false)
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  
  const [editSchedule, setEditSchedule] = useState({})
  const [newSchedule, setNewSchedule] = useState({ day: '', date: '', morning: 0, evening: 0 })
  const [editDoctor, setEditDoctor] = useState({})
  const [newDoctor, setNewDoctor] = useState({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '', patients: '', sessions: '', attendance: '', utilization: '' })
  
  useEffect(() => {
    loadData()
  }, [])
  
  useEffect(() => {
    if (weeklySchedule.length > 0) {
      const { totalAppointments, completedAppointments } = calculateStatsFromSchedule(weeklySchedule)
      const updatedStats = { ...stats, totalAppointments, completedAppointments }
      setStats(updatedStats)
      saveStats(updatedStats)
    }
  }, [weeklySchedule])
  
  const loadData = () => {
    setStats(getStats())
    setDoctors(getDoctors())
    setWeeklySchedule(getWeeklySchedule())
    setLoading(false)
  }
  
  const getDoctorName = (doctor) => isRTL ? doctor.nameAr : doctor.nameEn
  const getSpecialization = (doctor) => isRTL ? doctor.specializationAr : doctor.specializationEn
  
  const updateScheduleTotal = (morning, evening) => (parseInt(morning) || 0) + (parseInt(evening) || 0)
  
  const handleSaveSchedule = () => {
    const updated = updateSchedule(editSchedule.id, editSchedule)
    setWeeklySchedule(updated)
    setShowEditScheduleModal(false)
    toast.success(t('common.success'))
  }
  
  const handleAddSchedule = () => {
    if (!newSchedule.day) {
      toast.error('الرجاء اختيار اليوم')
      return
    }
    const updated = addSchedule(newSchedule)
    setWeeklySchedule(updated)
    setShowAddScheduleModal(false)
    setNewSchedule({ day: '', date: '', morning: 0, evening: 0 })
    toast.success(t('common.success'))
  }
  
  const handleDeleteSchedule = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا اليوم؟')) {
      const updated = deleteSchedule(id)
      setWeeklySchedule(updated)
      toast.success(t('common.success'))
    }
  }
  
  const handleSaveDoctor = () => {
    const updated = updateDoctor(editDoctor.id, editDoctor)
    setDoctors(updated)
    setShowEditDoctorModal(false)
    toast.success(t('common.success'))
  }
  
  const handleAddDoctor = () => {
    if (!newDoctor.nameAr || !newDoctor.specializationAr) {
      toast.error('الرجاء إدخال الاسم والتخصص')
      return
    }
    const doctor = {
      nameAr: newDoctor.nameAr,
      nameEn: newDoctor.nameEn || newDoctor.nameAr,
      specializationAr: newDoctor.specializationAr,
      specializationEn: newDoctor.specializationEn || newDoctor.specializationAr,
      patients: parseInt(newDoctor.patients) || 0,
      sessions: parseInt(newDoctor.sessions) || 0,
      attendance: parseInt(newDoctor.attendance) || 0,
      utilization: parseInt(newDoctor.utilization) || 0
    }
    const updated = addDoctor(doctor)
    setDoctors(updated)
    setShowAddDoctorModal(false)
    setNewDoctor({ nameAr: '', nameEn: '', specializationAr: '', specializationEn: '', patients: '', sessions: '', attendance: '', utilization: '' })
    toast.success(t('common.success'))
  }
  
  const handleDeleteDoctor = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      const updated = deleteDoctor(id)
      setDoctors(updated)
      toast.success(t('common.success'))
    }
  }
  
  const handleUpdateUtilization = () => {
    const updated = doctors.map(d => ({
      ...d,
      utilization: Math.min(100, Math.max(0, d.utilization + (Math.random() * 10 - 5)))
    }))
    setDoctors(updated)
    saveDoctors(updated)
    toast.success('تم تحديث نسب الاستخدام')
  }
  
  const handleResetData = () => {
    const { stats: newStats, doctors: newDoctors, schedule: newSchedule } = resetAllData()
    setStats(newStats)
    setDoctors(newDoctors)
    setWeeklySchedule(newSchedule)
    setShowResetModal(false)
    toast.success('تم إعادة تعيين جميع البيانات')
  }
  
  const handleExportReport = () => {
    const reportData = { stats, doctors, weeklySchedule, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `operations_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تصدير التقرير بنجاح')
  }
  
  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-green-400'
    if (attendance >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">{t('common.loading')}</div></div>
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('operations.title')}</h1>
          <p className="text-gray-400 mt-1">{t('operations.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleUpdateUtilization} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30">
            <RefreshCw size={18} /> {t('operations.update_rates')}
          </button>
          <button onClick={handleExportReport} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
            <Download size={18} /> {t('operations.export_report')}
          </button>
          <button onClick={() => setShowResetModal(true)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-red-500/30">
            <RefreshCw size={18} /> {t('operations.reset_data')}
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.totalAppointments || 0}</div><div className="text-sm text-gray-400">{t('operations.total_appointments')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.completedAppointments || 0}</div><div className="text-sm text-gray-400">{t('operations.completed_appointments')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl"><TrendingUp className="text-purple-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.doctorUtilization || 0}%</div><div className="text-sm text-gray-400">{t('operations.doctor_utilization')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl"><Users className="text-orange-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.patientSatisfaction || 0}%</div><div className="text-sm text-gray-400">{t('operations.patient_satisfaction')}</div></div>
          </div>
        </div>
      </div>
      
      {/* Weekly Schedule Table */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={20} className="text-purple-400" /> {t('operations.weekly_schedule')}</h2>
          <button onClick={() => setShowAddScheduleModal(true)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 text-sm"><Plus size={14} /> {t('operations.add_day')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr><th className="px-6 py-3 text-sm text-gray-300">{t('operations.day')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.date')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.morning')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.evening')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.total')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.actions')}</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {weeklySchedule.map((day) => (
                <tr key={day.id}>
                  <td className="px-6 py-4 font-semibold text-white">{day.day}</td>
                  <td className="px-6 py-4 text-gray-400">{day.date}</td>
                  <td className="px-6 py-4 text-gray-300">{day.morning} {t('operations.appointments')}</td>
                  <td className="px-6 py-4 text-gray-300">{day.evening} {t('operations.appointments')}</td>
                  <td className="px-6 py-4 font-semibold text-blue-400">{day.total}</td>
                  <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => { setEditSchedule(day); setShowEditScheduleModal(true); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button><button onClick={() => handleDeleteSchedule(day.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex justify-between items-center"><span className="text-gray-400">{t('operations.total_week')}</span><span className="text-xl font-bold text-white">{weeklySchedule.reduce((sum, d) => sum + d.total, 0)} {t('operations.appointments')}</span></div>
        </div>
      </div>
      
      {/* Doctor Performance Table */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-blue-400" /> {t('operations.doctor_performance')}</h2>
          <button onClick={() => setShowAddDoctorModal(true)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 text-sm"><Plus size={14} /> إضافة طبيب</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr><th className="px-6 py-3 text-sm text-gray-300">{t('operations.doctor')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.specialization')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.patients')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.sessions')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.attendance')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.utilization')}</th><th className="px-6 py-3 text-sm text-gray-300">{t('operations.actions')}</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 font-semibold text-white">{getDoctorName(doctor)}</td>
                  <td className="px-6 py-4 text-gray-300">{getSpecialization(doctor)}</td>
                  <td className="px-6 py-4 text-gray-300">{doctor.patients}</td>
                  <td className="px-6 py-4 text-gray-300">{doctor.sessions}</td>
                  <td className={`px-6 py-4 font-semibold ${getAttendanceColor(doctor.attendance)}`}>{doctor.attendance}%</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-24 bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${doctor.utilization}%` }}></div></div><span className="text-sm text-gray-400">{doctor.utilization}%</span></div></td>
                  <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => { setEditDoctor(doctor); setShowEditDoctorModal(true); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button><button onClick={() => handleDeleteDoctor(doctor.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><XCircle size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals - same as before */}
      {showEditScheduleModal && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">{t('operations.edit')} {t('operations.weekly_schedule')}</h2><div className="space-y-3"><input type="text" placeholder={t('operations.day')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.day} onChange={(e) => setEditSchedule({...editSchedule, day: e.target.value})} /><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.date} onChange={(e) => setEditSchedule({...editSchedule, date: e.target.value})} /><input type="number" placeholder={t('operations.morning')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.morning} onChange={(e) => setEditSchedule({...editSchedule, morning: parseInt(e.target.value), total: updateScheduleTotal(e.target.value, editSchedule.evening)})} /><input type="number" placeholder={t('operations.evening')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editSchedule.evening} onChange={(e) => setEditSchedule({...editSchedule, evening: parseInt(e.target.value), total: updateScheduleTotal(editSchedule.morning, e.target.value)})} /><div className="flex gap-3"><button onClick={handleSaveSchedule} className="flex-1 bg-blue-500 py-2 rounded-lg">{t('common.save')}</button><button onClick={() => setShowEditScheduleModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button></div></div></div></div>)}
      
      {showAddScheduleModal && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">{t('operations.add_day')}</h2><div className="space-y-3"><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.day} onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})}><option value="">{t('operations.day')}</option><option>السبت</option><option>الأحد</option><option>الإثنين</option><option>الثلاثاء</option><option>الأربعاء</option><option>الخميس</option></select><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.date} onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})} /><input type="number" placeholder={t('operations.morning')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.morning} onChange={(e) => setNewSchedule({...newSchedule, morning: parseInt(e.target.value)})} /><input type="number" placeholder={t('operations.evening')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newSchedule.evening} onChange={(e) => setNewSchedule({...newSchedule, evening: parseInt(e.target.value)})} /><div className="flex gap-3"><button onClick={handleAddSchedule} className="flex-1 bg-green-500 py-2 rounded-lg">{t('common.save')}</button><button onClick={() => setShowAddScheduleModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button></div></div></div></div>)}
      
      {showEditDoctorModal && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">{t('operations.edit')} {t('operations.doctor')}</h2><div className="space-y-3"><input type="text" placeholder={t('operations.doctor')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.nameAr} onChange={(e) => setEditDoctor({...editDoctor, nameAr: e.target.value})} /><input type="text" placeholder={t('operations.specialization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.specializationAr} onChange={(e) => setEditDoctor({...editDoctor, specializationAr: e.target.value})} /><input type="number" placeholder={t('operations.patients')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.patients} onChange={(e) => setEditDoctor({...editDoctor, patients: parseInt(e.target.value)})} /><input type="number" placeholder={t('operations.sessions')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.sessions} onChange={(e) => setEditDoctor({...editDoctor, sessions: parseInt(e.target.value)})} /><input type="number" placeholder={t('operations.attendance')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.attendance} onChange={(e) => setEditDoctor({...editDoctor, attendance: parseInt(e.target.value)})} /><input type="number" placeholder={t('operations.utilization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.utilization} onChange={(e) => setEditDoctor({...editDoctor, utilization: parseInt(e.target.value)})} /><div className="flex gap-3"><button onClick={handleSaveDoctor} className="flex-1 bg-blue-500 py-2 rounded-lg">{t('common.save')}</button><button onClick={() => setShowEditDoctorModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button></div></div></div></div>)}
      
      {showAddDoctorModal && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">إضافة طبيب جديد</h2><div className="space-y-3"><input type="text" placeholder={t('operations.doctor')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameAr} onChange={(e) => setNewDoctor({...newDoctor, nameAr: e.target.value})} /><input type="text" placeholder={t('operations.specialization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.specializationAr} onChange={(e) => setNewDoctor({...newDoctor, specializationAr: e.target.value})} /><input type="number" placeholder={t('operations.patients')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.patients} onChange={(e) => setNewDoctor({...newDoctor, patients: e.target.value})} /><input type="number" placeholder={t('operations.sessions')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.sessions} onChange={(e) => setNewDoctor({...newDoctor, sessions: e.target.value})} /><input type="number" placeholder={t('operations.attendance')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.attendance} onChange={(e) => setNewDoctor({...newDoctor, attendance: e.target.value})} /><input type="number" placeholder={t('operations.utilization')} className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.utilization} onChange={(e) => setNewDoctor({...newDoctor, utilization: e.target.value})} /><div className="flex gap-3"><button onClick={handleAddDoctor} className="flex-1 bg-green-500 py-2 rounded-lg">{t('common.save')}</button><button onClick={() => setShowAddDoctorModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button></div></div></div></div>)}
      
      {showResetModal && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold text-white mb-4">{t('operations.reset_data')}</h2><p className="text-gray-400 mb-4">هل أنت متأكد؟ سيتم فقدان جميع التغييرات التي قمت بها.</p><div className="flex gap-3"><button onClick={handleResetData} className="flex-1 bg-red-500 py-2 rounded-lg">نعم، إعادة تعيين</button><button onClick={() => setShowResetModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">{t('common.cancel')}</button></div></div></div>)}
    </div>
  )
}
