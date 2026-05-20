import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Calendar, Clock, Users, CheckCircle, Activity, Search, Phone, Mail, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReceptionDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    todayAppointments: 24,
    completedCheckIns: 18,
    waitingPatients: 6,
    newRegistrations: 4
  })
  
  const [todayAppointments, setTodayAppointments] = useState([
    { id: 1, time: '09:00', patient: 'أحمد محمد', phone: '0501234567', status: 'checked-in', doctor: 'د. أحمد علي' },
    { id: 2, time: '09:30', patient: 'سارة حسن', phone: '0507654321', status: 'checked-in', doctor: 'د. منى حسن' },
    { id: 3, time: '10:00', patient: 'محمود علي', phone: '0505566778', status: 'waiting', doctor: 'د. خالد محمود' },
    { id: 4, time: '10:30', patient: 'نورة عبدالله', phone: '0509988776', status: 'scheduled', doctor: 'د. أحمد علي' },
    { id: 5, time: '11:00', patient: 'عمر خالد', phone: '0501122334', status: 'scheduled', doctor: 'د. منى حسن' },
  ])
  
  const [recentPatients, setRecentPatients] = useState([
    { id: 1, name: 'أحمد محمد', phone: '0501234567', time: '09:30', registeredBy: 'نورة' },
    { id: 2, name: 'سارة حسن', phone: '0507654321', time: '09:45', registeredBy: 'أحمد' },
    { id: 3, name: 'محمود علي', phone: '0505566778', time: '10:00', registeredBy: 'نورة' },
  ])
  
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'checked-in': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">تم الحضور</span>
      case 'waiting': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">في الانتظار</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">مجدول</span>
    }
  }
  
  const handleCheckIn = (id) => {
    setTodayAppointments(todayAppointments.map(app => app.id === id ? { ...app, status: 'checked-in' } : app))
    toast.success('تم تسجيل حضور المريض')
  }
  
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold gradient-text">لوحة تحكم الاستقبال</h1><p className="text-gray-400 mt-1">مرحباً {user?.name || 'نورة عبدالله'} | إدارة المرضى والمواعيد</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">مواعيد اليوم</p><p className="text-3xl font-bold text-white">{stats.todayAppointments}</p></div><div className="p-3 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={28} /></div></div></div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">تم الحضور</p><p className="text-3xl font-bold text-white">{stats.completedCheckIns}</p></div><div className="p-3 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={28} /></div></div></div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-5 border border-yellow-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">مرضى في الانتظار</p><p className="text-3xl font-bold text-white">{stats.waitingPatients}</p></div><div className="p-3 bg-yellow-500/20 rounded-xl"><Clock className="text-yellow-400" size={28} /></div></div></div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">تسجيلات جديدة</p><p className="text-3xl font-bold text-white">{stats.newRegistrations}</p></div><div className="p-3 bg-purple-500/20 rounded-xl"><UserPlus className="text-purple-400" size={28} /></div></div></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-400" /> مواعيد اليوم</h2><div className="space-y-3 max-h-96 overflow-y-auto">{todayAppointments.map((app) => (<div key={app.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"><div className="flex items-center gap-3"><div className="w-16 text-white font-medium">{app.time}</div><div><p className="text-white">{app.patient}</p><p className="text-xs text-gray-400">{app.doctor}</p></div></div><div className="flex items-center gap-2">{getStatusBadge(app.status)}<button onClick={() => handleCheckIn(app.id)} disabled={app.status !== 'scheduled'} className={`px-2 py-1 rounded-lg text-xs ${app.status === 'scheduled' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-600 text-gray-500 cursor-not-allowed'}`}>تسجيل حضور</button></div></div>))}</div></div>
        
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UserPlus size={20} className="text-green-400" /> آخر المرضى المسجلين</h2><div className="space-y-3">{recentPatients.map((patient) => (<div key={patient.id} className="p-3 bg-gray-700/30 rounded-lg"><div className="flex justify-between"><div><p className="font-semibold text-white">{patient.name}</p><p className="text-xs text-gray-400">{patient.phone}</p></div><span className="text-xs text-gray-500">{patient.time}</span></div><div className="flex justify-between items-center mt-2"><span className="text-xs text-gray-400">بواسطة: {patient.registeredBy}</span><button className="text-blue-400 hover:text-blue-300 text-xs">عرض التفاصيل</button></div></div>))}</div></div>
      </div>
      
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Search size={20} className="text-purple-400" /> إجراءات سريعة</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><button className="p-3 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/30 transition">تسجيل مريض جديد</button><button className="p-3 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30 transition">حجز موعد</button><button className="p-3 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/30 transition">بحث عن مريض</button><button className="p-3 bg-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/30 transition">تقرير يومي</button></div></div>
    </div>
  )
}
