import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Users, Calendar, Activity, Download, Calendar as CalendarIcon, CheckCircle, XCircle, Edit, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OperationsDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [stats, setStats] = useState({
    totalAppointments: 156,
    completedAppointments: 128,
    doctorUtilization: 78,
    patientSatisfaction: 92
  })
  
  const [doctors, setDoctors] = useState([
    { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic', patients: 45, sessions: 38, attendance: 94, utilization: 85 },
    { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy', patients: 38, sessions: 32, attendance: 89, utilization: 78 },
    { id: 3, nameAr: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specializationAr: 'أعصاب', specializationEn: 'Neurology', patients: 42, sessions: 40, attendance: 97, utilization: 92 },
    { id: 4, nameAr: 'د. نورة سعيد', nameEn: 'Dr. Noura Saeed', specializationAr: 'أطفال', specializationEn: 'Pediatrics', patients: 52, sessions: 48, attendance: 92, utilization: 88 }
  ])
  
  const [weeklySchedule] = useState([
    { id: 1, day: 'السبت', morning: 12, evening: 8, total: 20 },
    { id: 2, day: 'الأحد', morning: 14, evening: 10, total: 24 },
    { id: 3, day: 'الإثنين', morning: 10, evening: 6, total: 16 },
    { id: 4, day: 'الثلاثاء', morning: 15, evening: 9, total: 24 },
    { id: 5, day: 'الأربعاء', morning: 13, evening: 7, total: 20 },
    { id: 6, day: 'الخميس', morning: 11, evening: 5, total: 16 }
  ])
  
  const [showEditStatsModal, setShowEditStatsModal] = useState(false)
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [editStats, setEditStats] = useState({ ...stats })
  const [editDoctor, setEditDoctor] = useState({})
  const [newDoctor, setNewDoctor] = useState({ nameAr: '', specializationAr: '', patients: '', sessions: '', attendance: '', utilization: '' })
  
  const getDoctorName = (doctor) => isRTL ? doctor.nameAr : doctor.nameEn
  const getSpecialization = (doctor) => isRTL ? doctor.specializationAr : doctor.specializationEn
  
  const handleSaveStats = () => {
    setStats(editStats)
    setShowEditStatsModal(false)
    toast.success('تم تحديث الإحصائيات بنجاح')
  }
  
  const handleSaveDoctor = () => {
    setDoctors(doctors.map(d => d.id === editDoctor.id ? editDoctor : d))
    setShowEditDoctorModal(false)
    toast.success('تم تحديث بيانات الطبيب بنجاح')
  }
  
  const handleAddDoctor = () => {
    const doctor = {
      id: Date.now(),
      nameAr: newDoctor.nameAr,
      nameEn: newDoctor.nameAr,
      specializationAr: newDoctor.specializationAr,
      specializationEn: newDoctor.specializationAr,
      patients: parseInt(newDoctor.patients) || 0,
      sessions: parseInt(newDoctor.sessions) || 0,
      attendance: parseInt(newDoctor.attendance) || 0,
      utilization: parseInt(newDoctor.utilization) || 0
    }
    setDoctors([...doctors, doctor])
    setShowAddDoctorModal(false)
    setNewDoctor({ nameAr: '', specializationAr: '', patients: '', sessions: '', attendance: '', utilization: '' })
    toast.success('تم إضافة الطبيب بنجاح')
  }
  
  const handleDeleteDoctor = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      setDoctors(doctors.filter(d => d.id !== id))
      toast.success('تم حذف الطبيب بنجاح')
    }
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
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة العمليات</h1>
          <p className="text-gray-400 mt-1">متابعة الأداء والتقارير</p>
        </div>
        <button onClick={handleExportReport} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
          <Download size={18} /> تصدير تقرير
        </button>
      </div>
      
      <div className="relative">
        <button onClick={() => setShowEditStatsModal(true)} className="absolute top-2 right-2 p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600 z-10">
          <Edit size={16} className="text-gray-300" />
        </button>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={20} /></div>
              <div><div className="text-2xl font-bold text-white">{stats.totalAppointments}</div><div className="text-sm text-gray-400">إجمالي المواعيد</div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={20} /></div>
              <div><div className="text-2xl font-bold text-white">{stats.completedAppointments}</div><div className="text-sm text-gray-400">مكتملة</div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl"><TrendingUp className="text-purple-400" size={20} /></div>
              <div><div className="text-2xl font-bold text-white">{stats.doctorUtilization}%</div><div className="text-sm text-gray-400">استخدام الأطباء</div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-4 border border-orange-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-xl"><Users className="text-orange-400" size={20} /></div>
              <div><div className="text-2xl font-bold text-white">{stats.patientSatisfaction}%</div><div className="text-sm text-gray-400">رضا المرضى</div></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* جدول أداء الأطباء */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-blue-400" /> أداء الأطباء</h2>
          <button onClick={() => setShowAddDoctorModal(true)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 text-sm"><Plus size={14} /> إضافة طبيب</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-6 py-3 text-sm text-gray-300">الطبيب</th>
                <th className="px-6 py-3 text-sm text-gray-300">التخصص</th>
                <th className="px-6 py-3 text-sm text-gray-300">المرضى</th>
                <th className="px-6 py-3 text-sm text-gray-300">الجلسات</th>
                <th className="px-6 py-3 text-sm text-gray-300">الحضور</th>
                <th className="px-6 py-3 text-sm text-gray-300">الاستخدام</th>
                <th className="px-6 py-3 text-sm text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 font-semibold text-white">{getDoctorName(doctor)}</td>
                  <td className="px-6 py-4 text-gray-300">{getSpecialization(doctor)}</td>
                  <td className="px-6 py-4 text-gray-300">{doctor.patients}</td>
                  <td className="px-6 py-4 text-gray-300">{doctor.sessions}</td>
                  <td className={`px-6 py-4 font-semibold ${getAttendanceColor(doctor.attendance)}`}>{doctor.attendance}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${doctor.utilization}%` }}></div></div>
                      <span className="text-sm text-gray-400">{doctor.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditDoctor(doctor); setShowEditDoctorModal(true); }} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteDoctor(doctor.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><XCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* الجدول الأسبوعي */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={20} className="text-purple-400" /> الجدول الأسبوعي</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-6 py-3 text-sm text-gray-300">اليوم</th>
                <th className="px-6 py-3 text-sm text-gray-300">الفترة الصباحية</th>
                <th className="px-6 py-3 text-sm text-gray-300">الفترة المسائية</th>
                <th className="px-6 py-3 text-sm text-gray-300">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {weeklySchedule.map((day) => (
                <tr key={day.id}>
                  <td className="px-6 py-4 font-semibold text-white">{day.day}</td>
                  <td className="px-6 py-4 text-gray-300">{day.morning} موعد</td>
                  <td className="px-6 py-4 text-gray-300">{day.evening} موعد</td>
                  <td className="px-6 py-4 font-semibold text-blue-400">{day.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal Edit Stats */}
      {showEditStatsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">تعديل الإحصائيات</h2>
            <div className="space-y-3">
              <input type="number" placeholder="إجمالي المواعيد" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editStats.totalAppointments} onChange={(e) => setEditStats({...editStats, totalAppointments: parseInt(e.target.value)})} />
              <input type="number" placeholder="المواعيد المكتملة" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editStats.completedAppointments} onChange={(e) => setEditStats({...editStats, completedAppointments: parseInt(e.target.value)})} />
              <input type="number" placeholder="نسبة استخدام الأطباء" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editStats.doctorUtilization} onChange={(e) => setEditStats({...editStats, doctorUtilization: parseInt(e.target.value)})} />
              <input type="number" placeholder="نسبة رضا المرضى" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editStats.patientSatisfaction} onChange={(e) => setEditStats({...editStats, patientSatisfaction: parseInt(e.target.value)})} />
              <div className="flex gap-3">
                <button onClick={handleSaveStats} className="flex-1 bg-blue-500 py-2 rounded-lg">حفظ</button>
                <button onClick={() => setShowEditStatsModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Edit Doctor */}
      {showEditDoctorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">تعديل بيانات الطبيب</h2>
            <div className="space-y-3">
              <input type="text" placeholder="الاسم" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.nameAr} onChange={(e) => setEditDoctor({...editDoctor, nameAr: e.target.value})} />
              <input type="text" placeholder="التخصص" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.specializationAr} onChange={(e) => setEditDoctor({...editDoctor, specializationAr: e.target.value})} />
              <input type="number" placeholder="عدد المرضى" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.patients} onChange={(e) => setEditDoctor({...editDoctor, patients: parseInt(e.target.value)})} />
              <input type="number" placeholder="عدد الجلسات" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.sessions} onChange={(e) => setEditDoctor({...editDoctor, sessions: parseInt(e.target.value)})} />
              <input type="number" placeholder="نسبة الحضور" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.attendance} onChange={(e) => setEditDoctor({...editDoctor, attendance: parseInt(e.target.value)})} />
              <input type="number" placeholder="نسبة الاستخدام" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editDoctor.utilization} onChange={(e) => setEditDoctor({...editDoctor, utilization: parseInt(e.target.value)})} />
              <div className="flex gap-3">
                <button onClick={handleSaveDoctor} className="flex-1 bg-blue-500 py-2 rounded-lg">حفظ</button>
                <button onClick={() => setShowEditDoctorModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Add Doctor */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">إضافة طبيب جديد</h2>
            <div className="space-y-3">
              <input type="text" placeholder="الاسم" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.nameAr} onChange={(e) => setNewDoctor({...newDoctor, nameAr: e.target.value})} />
              <input type="text" placeholder="التخصص" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.specializationAr} onChange={(e) => setNewDoctor({...newDoctor, specializationAr: e.target.value})} />
              <input type="number" placeholder="عدد المرضى" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.patients} onChange={(e) => setNewDoctor({...newDoctor, patients: e.target.value})} />
              <input type="number" placeholder="عدد الجلسات" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.sessions} onChange={(e) => setNewDoctor({...newDoctor, sessions: e.target.value})} />
              <input type="number" placeholder="نسبة الحضور" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.attendance} onChange={(e) => setNewDoctor({...newDoctor, attendance: e.target.value})} />
              <input type="number" placeholder="نسبة الاستخدام" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={newDoctor.utilization} onChange={(e) => setNewDoctor({...newDoctor, utilization: e.target.value})} />
              <div className="flex gap-3">
                <button onClick={handleAddDoctor} className="flex-1 bg-green-500 py-2 rounded-lg">إضافة</button>
                <button onClick={() => setShowAddDoctorModal(false)} className="flex-1 bg-gray-600 py-2 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
