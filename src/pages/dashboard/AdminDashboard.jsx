import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, Activity,
  Stethoscope, Pill, UserCheck, UserPlus, Clock, AlertCircle,
  Shield, Award, Target, Sparkles, Building, Heart, Brain,
  Download, Printer, Eye, Edit, Trash2, Plus, X, CheckCircle, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalPatients: 156,
    totalDoctors: 12,
    totalStaff: 28,
    totalRevenue: 125000,
    pendingApprovals: 5,
    todayAppointments: 24,
    completedAppointments: 128,
    cancellationRate: 8.5,
    occupancyRate: 78
  })
  
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'تسجيل مريض جديد - أحمد محمد', time: '2024-05-20 10:30:00', user: 'نورة عبدالله', type: 'success' },
    { id: 2, action: 'إضافة طبيب جديد - د. خالد محمود', time: '2024-05-20 09:15:00', user: 'أحمد محمد', type: 'info' },
    { id: 3, action: 'إنشاء فاتورة جديدة - عملية جراحية', time: '2024-05-19 16:45:00', user: 'خالد محمد', type: 'success' },
    { id: 4, action: 'تحديث إعدادات النظام', time: '2024-05-19 14:20:00', user: 'أحمد محمد', type: 'warning' },
    { id: 5, action: 'موافقة على حساب جديد - د. سارة أحمد', time: '2024-05-19 11:00:00', user: 'أحمد محمد', type: 'success' },
  ])
  
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, name: 'د. سارة أحمد', email: 'sara@medical.com', role: 'doctor', date: '2024-05-19' },
    { id: 2, name: 'عمر خالد', email: 'omar@medical.com', role: 'reception', date: '2024-05-18' },
    { id: 3, name: 'ليلى عبدالله', email: 'leila@medical.com', role: 'doctor', date: '2024-05-17' },
  ])
  
  const revenueData = [
    { month: 'يناير', revenue: 45000, profit: 32000, expenses: 13000 },
    { month: 'فبراير', revenue: 52000, profit: 38000, expenses: 14000 },
    { month: 'مارس', revenue: 48000, profit: 35000, expenses: 13000 },
    { month: 'أبريل', revenue: 61000, profit: 45000, expenses: 16000 },
    { month: 'مايو', revenue: 58000, profit: 42000, expenses: 16000 },
    { month: 'يونيو', revenue: 65000, profit: 48000, expenses: 17000 },
  ]
  
  const departmentData = [
    { name: 'جراحة', value: 45, color: '#3b82f6' },
    { name: 'علاج طبيعي', value: 28, color: '#22c55e' },
    { name: 'أعصاب', value: 18, color: '#eab308' },
    { name: 'أطفال', value: 22, color: '#ef4444' },
    { name: 'أسنان', value: 15, color: '#8b5cf6' },
  ]
  
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
  const handleApprove = (id) => {
    setPendingApprovals(pendingApprovals.filter(a => a.id !== id))
    toast.success('تم الموافقة على الطلب')
  }
  
  const handleReject = (id) => {
    setPendingApprovals(pendingApprovals.filter(a => a.id !== id))
    toast.error('تم رفض الطلب')
  }
  
  const refreshData = () => {
    toast.success('تم تحديث البيانات')
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة تحكم المدير</h1>
          <p className="text-gray-400 mt-1">مرحباً {user?.name || 'أحمد محمد'} | نظرة شاملة على أداء المركز الطبي</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshData} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
            <RefreshCw size={18} /> تحديث
          </button>
          <button onClick={() => window.print()} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
            <Printer size={18} /> طباعة التقرير
          </button>
        </div>
      </div>
      
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">إجمالي المرضى</p><p className="text-3xl font-bold text-white">{stats.totalPatients}</p></div><div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={28} /></div></div>
          <div className="mt-2 text-sm text-green-400">+12 هذا الشهر</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الإيرادات</p><p className="text-3xl font-bold text-white">${stats.totalRevenue}</p></div><div className="p-3 bg-green-500/20 rounded-xl"><DollarSign className="text-green-400" size={28} /></div></div>
          <div className="mt-2 text-sm text-green-400">+8% عن الشهر الماضي</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الموظفين</p><p className="text-3xl font-bold text-white">{stats.totalStaff}</p></div><div className="p-3 bg-purple-500/20 rounded-xl"><UserCheck className="text-purple-400" size={28} /></div></div>
          <div className="mt-2 text-sm text-green-400">{stats.totalDoctors} أطباء</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
          <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">مواعيد اليوم</p><p className="text-3xl font-bold text-white">{stats.todayAppointments}</p></div><div className="p-3 bg-orange-500/20 rounded-xl"><Calendar className="text-orange-400" size={28} /></div></div>
          <div className="mt-2 text-sm text-green-400">{stats.completedAppointments} مكتملة</div>
        </div>
      </div>
      
      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">الإيرادات والمصروفات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="الإيرادات" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#22c55e" name="الأرباح" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="المصروفات" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">توزيع المرضى حسب الأقسام</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                {departmentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* الطلبات المعلقة */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus size={20} className="text-yellow-400" /> طلبات الموافقة المعلقة ({pendingApprovals.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80"><tr><th className="px-6 py-3 text-sm text-gray-300">الاسم</th><th className="px-6 py-3 text-sm text-gray-300">البريد الإلكتروني</th><th className="px-6 py-3 text-sm text-gray-300">نوع الحساب</th><th className="px-6 py-3 text-sm text-gray-300">تاريخ الطلب</th><th className="px-6 py-3 text-sm text-gray-300">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-700/50">
              {pendingApprovals.map((req) => (<tr key={req.id} className="hover:bg-gray-700/30"><td className="px-6 py-4 font-semibold text-white">{req.name}</td><td className="px-6 py-4 text-gray-300">{req.email}</td><td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">{req.role === 'doctor' ? 'طبيب' : 'موظف استقبال'}</span></td><td className="px-6 py-4 text-gray-400">{req.date}</td><td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => handleApprove(req.id)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><CheckCircle size={18} /></button><button onClick={() => handleReject(req.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><X size={18} /></button></div></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* النشاطات الأخيرة */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock size={20} className="text-blue-400" /> النشاطات الأخيرة</h2></div>
        <div className="divide-y divide-gray-700/50">
          {recentActivities.map((activity) => (<div key={activity.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-700/30"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' : activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div><div><p className="text-white text-sm">{activity.action}</p><p className="text-xs text-gray-500">{activity.time} - بواسطة {activity.user}</p></div></div><span className={`text-xs px-2 py-1 rounded-full ${activity.type === 'success' ? 'bg-green-500/20 text-green-400' : activity.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{activity.type === 'success' ? 'تم بنجاح' : activity.type === 'warning' ? 'تنبيه' : 'معلومات'}</span></div>))}
        </div>
      </div>
    </div>
  )
}
