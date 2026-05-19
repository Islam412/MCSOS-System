import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, TrendingUp, Users, Calendar, Clock, Activity, Download, Eye, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OperationsDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  // بيانات إحصائيات الأداء
  const [stats, setStats] = useState({
    totalAppointments: 156,
    completedAppointments: 128,
    cancelledAppointments: 18,
    noShowAppointments: 10,
    averageWaitTime: 12, // دقائق
    doctorUtilization: 78, // نسبة مئوية
    patientSatisfaction: 92, // نسبة مئوية
    revenueThisMonth: 12450
  })
  
  // بيانات الأطباء
  const [doctors, setDoctors] = useState([
    { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic', patients: 45, sessions: 38, attendance: 94, utilization: 85 },
    { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy', patients: 38, sessions: 32, attendance: 89, utilization: 78 },
    { id: 3, nameAr: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specializationAr: 'أعصاب', specializationEn: 'Neurology', patients: 42, sessions: 40, attendance: 97, utilization: 92 },
    { id: 4, nameAr: 'د. نورة سعيد', nameEn: 'Dr. Noura Saeed', specializationAr: 'أطفال', specializationEn: 'Pediatrics', patients: 52, sessions: 48, attendance: 92, utilization: 88 },
  ])
  
  // بيانات الجدول الأسبوعي
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'السبت', date: '2024-05-20', morning: 12, evening: 8, total: 20 },
    { day: 'الأحد', date: '2024-05-21', morning: 14, evening: 10, total: 24 },
    { day: 'الإثنين', date: '2024-05-22', morning: 10, evening: 6, total: 16 },
    { day: 'الثلاثاء', date: '2024-05-23', morning: 15, evening: 9, total: 24 },
    { day: 'الأربعاء', date: '2024-05-24', morning: 13, evening: 7, total: 20 },
    { day: 'الخميس', date: '2024-05-25', morning: 11, evening: 5, total: 16 },
  ])
  
  const getDoctorName = (doctor) => {
    return isRTL ? doctor.nameAr : doctor.nameEn
  }
  
  const getSpecialization = (doctor) => {
    return isRTL ? doctor.specializationAr : doctor.specializationEn
  }
  
  const handleExportReport = () => {
    const reportData = {
      stats,
      doctors,
      weeklySchedule,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `operations_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('operations.export_success'))
  }
  
  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-green-400'
    if (attendance >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="animate-slide-left">
          <h1 className="text-3xl font-bold gradient-text">{t('operations.title')}</h1>
          <p className="text-gray-400 mt-1">{t('operations.subtitle')}</p>
        </div>
        <button 
          onClick={handleExportReport}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-blue-500/30 hover:scale-105"
        >
          <Download size={18} />
          {t('operations.export_report')}
        </button>
      </div>
      
      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 card-glow animate-fade-up delay-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.totalAppointments}</div><div className="text-sm text-gray-400">{t('operations.total_appointments')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30 card-glow animate-fade-up delay-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.completedAppointments}</div><div className="text-sm text-gray-400">{t('operations.completed')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30 card-glow animate-fade-up delay-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl"><TrendingUp className="text-purple-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.doctorUtilization}%</div><div className="text-sm text-gray-400">{t('operations.doctor_utilization')}</div></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/30 card-glow animate-fade-up delay-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl"><Users className="text-orange-400" size={20} /></div>
            <div><div className="text-2xl font-bold text-white">{stats.patientSatisfaction}%</div><div className="text-sm text-gray-400">{t('operations.satisfaction')}</div></div>
          </div>
        </div>
      </div>
      
      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">{t('operations.cancelled')}</div>
          <div className="text-xl font-bold text-white">{stats.cancelledAppointments}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">{t('operations.no_show')}</div>
          <div className="text-xl font-bold text-white">{stats.noShowAppointments}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">{t('operations.avg_wait_time')}</div>
          <div className="text-xl font-bold text-white">{stats.averageWaitTime} {t('operations.minutes')}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">{t('finance.total_revenue')}</div>
          <div className="text-xl font-bold text-green-400">${stats.revenueThisMonth}</div>
        </div>
      </div>
      
      {/* جدول أداء الأطباء */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 card-glow">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-blue-400" /> {t('operations.doctor_performance')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('sidebar.doctor')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('operations.specialization')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('doctor.total_patients')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('doctor.total_sessions')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('operations.attendance')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('operations.utilization')}</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {doctors.map((doctor, idx) => (
                <tr key={doctor.id} className="table-row-glow">
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
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
      
      {/* جدول الجدولة الأسبوعية */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 card-glow">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={20} className="text-purple-400" /> {t('operations.weekly_schedule')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('operations.day')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('operations.morning')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('operations.evening')}</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-300">{t('operations.total')}</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {weeklySchedule.map((day, idx) => (
                <tr key={idx} className="table-row-glow">
                  <td className="px-6 py-4 font-semibold text-white">{day.day}</td>
                  <td className="px-6 py-4 text-gray-300">{day.morning} {t('operations.appointments')}</td>
                  <td className="px-6 py-4 text-gray-300">{day.evening} {t('operations.appointments')}</td>
                  <td className="px-6 py-4 font-semibold text-blue-400">{day.total}</td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  )
}
