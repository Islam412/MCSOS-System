import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Calendar, Clock, Activity, CheckCircle, TrendingUp, User, Stethoscope, Pill } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    todayPatients: 8,
    totalPatients: 45,
    completedSessions: 38,
    pendingSessions: 7,
    upcomingAppointments: 5,
    averageRating: 4.8
  })
  
  const [todaySchedule, setTodaySchedule] = useState([
    { id: 1, time: '09:00', patient: 'أحمد محمد', type: 'كشف', status: 'completed' },
    { id: 2, time: '10:00', patient: 'سارة حسن', type: 'متابعة', status: 'completed' },
    { id: 3, time: '11:00', patient: 'محمود علي', type: 'جلسة علاج', status: 'in-progress' },
    { id: 4, time: '12:00', patient: 'نورة عبدالله', type: 'كشف', status: 'upcoming' },
    { id: 5, time: '13:00', patient: 'عمر خالد', type: 'فحص', status: 'upcoming' },
  ])
  
  const [recentPatients, setRecentPatients] = useState([
    { id: 1, name: 'أحمد محمد', age: 35, lastVisit: '2024-05-18', diagnosis: 'تمزق في الرباط الصليبي', progress: 75 },
    { id: 2, name: 'سارة حسن', age: 28, lastVisit: '2024-05-17', diagnosis: 'انزلاق غضروفي', progress: 60 },
    { id: 3, name: 'محمود علي', age: 42, lastVisit: '2024-05-19', diagnosis: 'التهاب المفاصل', progress: 90 },
  ])
  
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">مكتمل</span>
      case 'in-progress': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">قيد التنفيذ</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">قادم</span>
    }
  }
  
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold gradient-text">لوحة تحكم الطبيب</h1><p className="text-gray-400 mt-1">مرحباً د.{user?.name || 'أحمد علي'} | ملخص عملك اليوم</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">مرضى اليوم</p><p className="text-3xl font-bold text-white">{stats.todayPatients}</p></div><div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={28} /></div></div></div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">إجمالي المرضى</p><p className="text-3xl font-bold text-white">{stats.totalPatients}</p></div><div className="p-3 bg-green-500/20 rounded-xl"><User className="text-green-400" size={28} /></div></div></div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-3xl font-bold text-white">{stats.completedSessions}</p></div><div className="p-3 bg-purple-500/20 rounded-xl"><CheckCircle className="text-purple-400" size={28} /></div></div></div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">تقييم المرضى</p><p className="text-3xl font-bold text-white">{stats.averageRating}</p></div><div className="p-3 bg-orange-500/20 rounded-xl"><TrendingUp className="text-orange-400" size={28} /></div></div></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-400" /> جدول المواعيد اليوم</h2><div className="space-y-3">{todaySchedule.map((app) => (<div key={app.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"><div className="flex items-center gap-3"><div className="w-16 text-white font-medium">{app.time}</div><div><p className="text-white">{app.patient}</p><p className="text-xs text-gray-400">{app.type}</p></div></div>{getStatusBadge(app.status)}</div>))}</div></div>
        
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Activity size={20} className="text-green-400" /> آخر المرضى</h2><div className="space-y-3">{recentPatients.map((patient) => (<div key={patient.id} className="p-3 bg-gray-700/30 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-semibold text-white">{patient.name}</p><p className="text-xs text-gray-400">{patient.age} سنة - آخر زيارة: {patient.lastVisit}</p><p className="text-sm text-gray-300 mt-1">{patient.diagnosis}</p></div><div className="text-right"><div className="text-sm text-blue-400">{patient.progress}%</div><div className="w-24 bg-gray-600 rounded-full h-1.5 mt-1"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${patient.progress}%` }}></div></div></div></div></div>))}</div></div>
      </div>
      
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Stethoscope size={20} className="text-purple-400" /> إجراءات سريعة</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><button className="p-3 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/30 transition">عرض المرضى</button><button className="p-3 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30 transition">تسجيل حضور</button><button className="p-3 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/30 transition">كتابة روشتة</button><button className="p-3 bg-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/30 transition">تحديث التقرير</button></div></div>
    </div>
  )
}
