import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, Activity,
  Stethoscope, Pill, UserCheck, UserPlus, Clock, AlertCircle,
  Shield, Award, Target, Sparkles, Building, Heart, Brain,
  Download, Printer, Eye, Edit, Trash2, Plus, X, CheckCircle, RefreshCw,
  LogIn, LogOut, UserX, UserCheck as UserCheckIcon, BarChart3,
  Calendar as CalendarIcon, Search, Filter, FileText, MoreHorizontal,
  Clock as ClockIcon, Check, XCircle, AlertTriangle, Star, Phone, Mail,
  PieChart as LucidePieChart, LineChart as LineChartIcon, Settings, Bell, Home,
  MapPin, Droplet, FileBadge, UserCircle, Briefcase, Syringe, Thermometer,
  Package, Box, Database, CreditCard, Wallet, Truck, Clipboard
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  // ========== بيانات الموظفين ==========
  const [employees, setEmployees] = useState({
    reception: [
      { id: 1, name: 'نورة عبدالله', nameEn: 'Noura Abdullah', phone: '0504445555', email: 'noura@medical.com', shift: 'صباحي', joinDate: '2022-01-10', status: 'active', attendance: { present: 23, absent: 0, late: 1 }, todayAttendance: { status: 'present', checkIn: '08:30', checkOut: '16:45' } },
      { id: 2, name: 'أمل سعيد', nameEn: 'Amal Saeed', phone: '0507778888', email: 'amal@medical.com', shift: 'مسائي', joinDate: '2023-03-15', status: 'active', attendance: { present: 18, absent: 2, late: 0 }, todayAttendance: { status: 'present', checkIn: '14:00', checkOut: '22:00' } }
    ],
    doctors: [
      { id: 1, name: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specialty: 'جراحة عظام', phone: '0501112222', email: 'ahmed@medical.com', patientsCount: 245, rating: 4.8, sessionsCount: 380, joinDate: '2020-01-15', status: 'active', attendance: { present: 22, absent: 2, late: 1 }, todayAttendance: { status: 'present', checkIn: '08:45', checkOut: '16:30' } },
      { id: 2, name: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specialty: 'علاج طبيعي', phone: '0502223333', email: 'mona@medical.com', patientsCount: 189, rating: 4.9, sessionsCount: 320, joinDate: '2021-03-20', status: 'active', attendance: { present: 20, absent: 1, late: 2 }, todayAttendance: { status: 'present', checkIn: '09:00', checkOut: '17:00' } },
      { id: 3, name: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specialty: 'أعصاب', phone: '0503334444', email: 'khaled@medical.com', patientsCount: 312, rating: 4.7, sessionsCount: 450, joinDate: '2019-08-10', status: 'active', attendance: { present: 18, absent: 3, late: 0 }, todayAttendance: { status: 'absent', checkIn: null, checkOut: null } }
    ],
    nurses: [
      { id: 1, name: 'سارة أحمد', nameEn: 'Sara Ahmed', phone: '0506667777', email: 'sara@medical.com', department: 'التمريض العام', shift: 'صباحي', joinDate: '2021-11-15', status: 'active', attendance: { present: 19, absent: 2, late: 2 }, todayAttendance: { status: 'late', checkIn: '09:15', checkOut: null } },
      { id: 2, name: 'فاطمة علي', nameEn: 'Fatima Ali', phone: '0508889999', email: 'fatima@medical.com', department: 'العناية المركزة', shift: 'ليلي', joinDate: '2022-06-20', status: 'active', attendance: { present: 21, absent: 1, late: 0 }, todayAttendance: { status: 'present', checkIn: '21:00', checkOut: '07:00' } }
    ],
    finance: [
      { id: 1, name: 'خالد محمد', nameEn: 'Khaled Mohamed', phone: '0509990000', email: 'khaled.finance@medical.com', position: 'مدير مالي', joinDate: '2019-01-10', status: 'active', attendance: { present: 24, absent: 0, late: 0 }, todayAttendance: { status: 'present', checkIn: '08:00', checkOut: '16:00' } },
      { id: 2, name: 'ريما سعد', nameEn: 'Reema Saad', phone: '0501110000', email: 'reema@medical.com', position: 'محاسبة', joinDate: '2021-08-01', status: 'active', attendance: { present: 22, absent: 1, late: 1 }, todayAttendance: { status: 'present', checkIn: '08:30', checkOut: '15:30' } }
    ]
  })

  // ========== بيانات المواد الطبية ==========
  const [medicalSupplies, setMedicalSupplies] = useState([
    { id: 1, name: 'باراسيتامول 500mg', category: 'مسكنات', quantity: 500, unit: 'قرص', expiryDate: '2025-12-31', price: 0.5, supplier: 'شركة الدواء', lowStock: 100, status: 'available' },
    { id: 2, name: 'إيبوبروفين 400mg', category: 'مسكنات', quantity: 300, unit: 'قرص', expiryDate: '2025-10-15', price: 0.8, supplier: 'شركة الحكمة', lowStock: 50, status: 'available' },
    { id: 3, name: 'أموكسيسيلين 500mg', category: 'مضادات حيوية', quantity: 200, unit: 'كبسولة', expiryDate: '2025-08-20', price: 1.2, supplier: 'شركة الرازي', lowStock: 30, status: 'available' },
    { id: 4, name: 'ضمادات معقمة', category: 'مستلزمات', quantity: 1000, unit: 'قطعة', expiryDate: '2026-01-01', price: 0.2, supplier: 'مستلزمات طبية', lowStock: 200, status: 'available' },
    { id: 5, name: 'محلول ملحي', category: 'محاليل', quantity: 150, unit: 'زجاجة', expiryDate: '2025-06-30', price: 3, supplier: 'المصنع العربي', lowStock: 50, status: 'low' },
    { id: 6, name: 'قفازات طبية', category: 'مستلزمات', quantity: 50, unit: 'زوج', expiryDate: '2025-09-15', price: 1.5, supplier: 'المستلزمات الطبية', lowStock: 100, status: 'critical' },
    { id: 7, name: 'الكحول الطبي', category: 'مطهرات', quantity: 80, unit: 'لتر', expiryDate: '2025-12-01', price: 8, supplier: 'شركة النظافة', lowStock: 40, status: 'available' }
  ])

  // ========== بيانات الخزنة (المخزون) ==========
  const [inventory, setInventory] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    criticalItems: 0,
    categories: [
      { name: 'مسكنات', count: 1200, value: 800 },
      { name: 'مضادات حيوية', count: 500, value: 1200 },
      { name: 'مستلزمات', count: 1500, value: 600 },
      { name: 'محاليل', count: 200, value: 450 },
      { name: 'مطهرات', count: 150, value: 640 }
    ]
  })

  // ========== بيانات أنواع العلاج ==========
  const [treatmentTypes, setTreatmentTypes] = useState([
    { id: 1, name: 'علاج طبيعي', nameEn: 'Physical Therapy', sessions: 12, price: 2500, duration: 'ساعة', description: 'جلسات علاج طبيعي لإعادة التأهيل' },
    { id: 2, name: 'علاج دوائي', nameEn: 'Medication', sessions: 30, price: 1500, duration: 'يوم', description: 'خطة علاج دوائي متكاملة' },
    { id: 3, name: 'علاج طبيعي مكثف', nameEn: 'Intensive Physical Therapy', sessions: 24, price: 4500, duration: 'ساعة', description: 'جلسات علاج طبيعي مكثفة لتحسين الحالة' },
    { id: 4, name: 'علاج تنفسي', nameEn: 'Respiratory Therapy', sessions: 10, price: 2000, duration: 'جلسة', description: 'علاج لمشاكل الجهاز التنفسي' },
    { id: 5, name: 'علاج وظيفي', nameEn: 'Occupational Therapy', sessions: 15, price: 3000, duration: 'جلسة', description: 'تحسين المهارات اليومية' },
    { id: 6, name: 'علاج نفسي', nameEn: 'Psychotherapy', sessions: 8, price: 1800, duration: 'جلسة', description: 'جلسات علاج نفسي ودعم' }
  ])

  // حساب إحصائيات المخزون
  useEffect(() => {
    const totalItems = medicalSupplies.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = medicalSupplies.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const lowStockItems = medicalSupplies.filter(item => item.quantity <= item.lowStock && item.quantity > item.lowStock / 2).length
    const criticalItems = medicalSupplies.filter(item => item.quantity <= item.lowStock / 2).length
    setInventory(prev => ({ ...prev, totalItems, totalValue, lowStockItems, criticalItems }))
  }, [medicalSupplies])

  // حساب إجمالي الموظفين
  const totalEmployees = Object.values(employees).flat().length
  const totalDoctors = employees.doctors.length
  const totalReception = employees.reception.length
  const totalNurses = employees.nurses.length
  const totalFinance = employees.finance.length
  const presentToday = Object.values(employees).flat().filter(e => e.todayAttendance?.status === 'present').length
  const absentToday = Object.values(employees).flat().filter(e => e.todayAttendance?.status === 'absent').length
  const lateToday = Object.values(employees).flat().filter(e => e.todayAttendance?.status === 'late').length

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ حاضر</span>
      case 'absent': return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">✗ غائب</span>
      case 'late': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏰ متأخر</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  const getStockStatusBadge = (quantity, lowStock) => {
    if (quantity <= lowStock / 2) return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">⚠️ حرج</span>
    if (quantity <= lowStock) return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⚠️ منخفض</span>
    return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ متوفر</span>
  }

  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة تحكم المدير</h1>
          <p className="text-gray-400 mt-1">مرحباً {user?.name || 'أحمد محمد'} | نظرة شاملة على المركز الطبي</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.location.reload()} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30"><RefreshCw size={18} /> تحديث</button>
          <button onClick={() => window.print()} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30"><Printer size={18} /> طباعة</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>📊 نظرة عامة</button>
        <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'employees' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>👥 الموظفين</button>
        <button onClick={() => setActiveTab('doctors')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'doctors' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>👨‍⚕️ الأطباء</button>
        <button onClick={() => setActiveTab('nurses')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'nurses' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>👩‍⚕️ الممرضات</button>
        <button onClick={() => setActiveTab('reception')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'reception' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>📞 الاستقبال</button>
        <button onClick={() => setActiveTab('finance')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'finance' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>💰 المالية</button>
        <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'inventory' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>📦 الخزنة والمخزون</button>
        <button onClick={() => setActiveTab('treatments')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'treatments' ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}>💊 أنواع العلاج</button>
      </div>

      {/* ========== نظرة عامة ========== */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">إجمالي الموظفين</p><p className="text-3xl font-bold text-white">{totalEmployees}</p></div><div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={28} /></div></div><div className="mt-2 flex gap-2 text-xs"><span className="text-blue-400">{totalDoctors} أطباء</span><span className="text-gray-600">|</span><span className="text-green-400">{totalReception} استقبال</span><span className="text-gray-600">|</span><span className="text-pink-400">{totalNurses} تمريض</span></div></div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">حاضرون اليوم</p><p className="text-3xl font-bold text-green-400">{presentToday}</p></div><div className="p-3 bg-green-500/20 rounded-xl"><UserCheckIcon className="text-green-400" size={28} /></div></div></div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">قيمة المخزون</p><p className="text-3xl font-bold text-white">${inventory.totalValue.toLocaleString()}</p></div><div className="p-3 bg-purple-500/20 rounded-xl"><Package className="text-purple-400" size={28} /></div></div></div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">أنواع العلاج</p><p className="text-3xl font-bold text-white">{treatmentTypes.length}</p></div><div className="p-3 bg-orange-500/20 rounded-xl"><Syringe className="text-orange-400" size={28} /></div></div></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-4">توزيع المواد الطبية حسب الفئة</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventory.categories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  <Bar dataKey="count" fill="#3b82f6" name="الكمية" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">حالة المخزون</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"><span className="text-gray-400">إجمالي الأصناف</span><span className="text-white font-bold">{inventory.totalItems}</span></div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"><span className="text-gray-400">أصناف منخفضة</span><span className="text-yellow-400 font-bold">{inventory.lowStockItems}</span></div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"><span className="text-gray-400">أصناف حرجة</span><span className="text-red-400 font-bold">{inventory.criticalItems}</span></div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"><span className="text-gray-400">قيمة المخزون</span><span className="text-green-400 font-bold">${inventory.totalValue.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== جميع الموظفين ========== */}
      {activeTab === 'employees' && (
        <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
          <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">جميع الموظفين ({totalEmployees})</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-4 py-3 text-sm text-gray-300">الموظف</th><th className="px-4 py-3 text-sm text-gray-300">القسم</th><th className="px-4 py-3 text-sm text-gray-300">الوظيفة</th><th className="px-4 py-3 text-sm text-gray-300">الجوال</th><th className="px-4 py-3 text-sm text-gray-300">حالة اليوم</th><th className="px-4 py-3 text-sm text-gray-300">حضور الشهر</th></tr></thead>
              <tbody className="divide-y divide-gray-700/50">
                {employees.doctors.map(emp => (<tr key={emp.id} className="hover:bg-gray-700/30"><td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.specialty}</div></td><td className="px-4 py-3">الأطباء</td><td className="px-4 py-3">طبيب</td><td className="px-4 py-3 dir-ltr">{emp.phone}</td><td className="px-4 py-3">{getStatusBadge(emp.todayAttendance?.status || 'absent')}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 bg-gray-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(emp.attendance.present / (emp.attendance.present + emp.attendance.absent + emp.attendance.late)) * 100}%` }}></div></div><span className="text-xs text-gray-400">{emp.attendance.present}/{emp.attendance.present + emp.attendance.absent + emp.attendance.late}</span></div></td></tr>))}
                {employees.nurses.map(emp => (<tr key={emp.id} className="hover:bg-gray-700/30"><td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.department}</div></td><td className="px-4 py-3">التمريض</td><td className="px-4 py-3">ممرض</td><td className="px-4 py-3 dir-ltr">{emp.phone}</td><td className="px-4 py-3">{getStatusBadge(emp.todayAttendance?.status || 'absent')}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 bg-gray-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(emp.attendance.present / (emp.attendance.present + emp.attendance.absent + emp.attendance.late)) * 100}%` }}></div></div><span className="text-xs text-gray-400">{emp.attendance.present}/{emp.attendance.present + emp.attendance.absent + emp.attendance.late}</span></div></td></tr>))}
                {employees.reception.map(emp => (<tr key={emp.id} className="hover:bg-gray-700/30"><td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.shift}</div></td><td className="px-4 py-3">الاستقبال</td><td className="px-4 py-3">موظف استقبال</td><td className="px-4 py-3 dir-ltr">{emp.phone}</td><td className="px-4 py-3">{getStatusBadge(emp.todayAttendance?.status || 'absent')}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 bg-gray-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(emp.attendance.present / (emp.attendance.present + emp.attendance.absent + emp.attendance.late)) * 100}%` }}></div></div><span className="text-xs text-gray-400">{emp.attendance.present}/{emp.attendance.present + emp.attendance.absent + emp.attendance.late}</span></div></td></tr>))}
                {employees.finance.map(emp => (<tr key={emp.id} className="hover:bg-gray-700/30"><td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.position}</div></td><td className="px-4 py-3">المالية</td><td className="px-4 py-3">موظف مالي</td><td className="px-4 py-3 dir-ltr">{emp.phone}</td><td className="px-4 py-3">{getStatusBadge(emp.todayAttendance?.status || 'absent')}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 bg-gray-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(emp.attendance.present / (emp.attendance.present + emp.attendance.absent + emp.attendance.late)) * 100}%` }}></div></div><span className="text-xs text-gray-400">{emp.attendance.present}/{emp.attendance.present + emp.attendance.absent + emp.attendance.late}</span></div></td></tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== الأطباء ========== */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.doctors.map(doctor => (
            <div key={doctor.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition">
              <div className="flex justify-between items-start">
                <div><h3 className="text-lg font-bold text-white">{doctor.name}</h3><p className="text-blue-400">{doctor.specialty}</p></div>
                <div className="text-right"><div className="text-green-400 font-bold">{doctor.rating} ⭐</div><p className="text-xs text-gray-400">{doctor.patientsCount} مريض</p></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{doctor.phone}</span></div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{doctor.email}</span></div>
                <div className="flex items-center gap-2"><Activity size={14} className="text-gray-400" /><span className="text-gray-300">{doctor.sessionsCount} جلسة</span></div>
                <div className="flex items-center gap-2">{getStatusBadge(doctor.todayAttendance?.status || 'absent')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== الممرضات ========== */}
      {activeTab === 'nurses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.nurses.map(nurse => (
            <div key={nurse.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-pink-500/30 transition">
              <div className="flex justify-between items-start">
                <div><h3 className="text-lg font-bold text-white">{nurse.name}</h3><p className="text-pink-400">{nurse.department}</p></div>
                <div className="text-right"><span className="px-2 py-1 rounded-full text-xs bg-pink-500/20 text-pink-400">{nurse.shift}</span></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{nurse.phone}</span></div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{nurse.email}</span></div>
                <div className="flex items-center gap-2">{getStatusBadge(nurse.todayAttendance?.status || 'absent')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== موظفي الاستقبال ========== */}
      {activeTab === 'reception' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.reception.map(emp => (
            <div key={emp.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-green-500/30 transition">
              <div className="flex justify-between items-start"><div><h3 className="text-lg font-bold text-white">{emp.name}</h3><p className="text-green-400">{emp.shift}</p></div><div>{getStatusBadge(emp.todayAttendance?.status || 'absent')}</div></div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{emp.phone}</span></div><div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{emp.email}</span></div></div>
            </div>
          ))}
        </div>
      )}

      {/* ========== الموظفين الماليين ========== */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.finance.map(emp => (
            <div key={emp.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition">
              <div className="flex justify-between items-start"><div><h3 className="text-lg font-bold text-white">{emp.name}</h3><p className="text-purple-400">{emp.position}</p></div><div>{getStatusBadge(emp.todayAttendance?.status || 'absent')}</div></div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{emp.phone}</span></div><div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{emp.email}</span></div></div>
            </div>
          ))}
        </div>
      )}

      {/* ========== الخزنة والمواد الطبية ========== */}
      {activeTab === 'inventory' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30 text-center"><Package className="mx-auto text-blue-400 mb-2" size={28} /><p className="text-2xl font-bold text-white">{inventory.totalItems}</p><p className="text-xs text-gray-400">إجمالي الأصناف</p></div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30 text-center"><Database className="mx-auto text-green-400 mb-2" size={28} /><p className="text-2xl font-bold text-white">${inventory.totalValue.toLocaleString()}</p><p className="text-xs text-gray-400">قيمة المخزون</p></div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 border border-yellow-500/30 text-center"><AlertCircle className="mx-auto text-yellow-400 mb-2" size={28} /><p className="text-2xl font-bold text-yellow-400">{inventory.lowStockItems}</p><p className="text-xs text-gray-400">أصناف منخفضة</p></div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl p-4 border border-red-500/30 text-center"><AlertTriangle className="mx-auto text-red-400 mb-2" size={28} /><p className="text-2xl font-bold text-red-400">{inventory.criticalItems}</p><p className="text-xs text-gray-400">أصناف حرجة</p></div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">المواد الطبية المتاحة</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/80"><tr className={`${isRTL ? 'text-right' : 'text-left'}`}><th className="px-4 py-3 text-sm text-gray-300">المنتج</th><th className="px-4 py-3 text-sm text-gray-300">الفئة</th><th className="px-4 py-3 text-sm text-gray-300">الكمية</th><th className="px-4 py-3 text-sm text-gray-300">الوحدة</th><th className="px-4 py-3 text-sm text-gray-300">تاريخ الصلاحية</th><th className="px-4 py-3 text-sm text-gray-300">السعر</th><th className="px-4 py-3 text-sm text-gray-300">الحالة</th></tr></thead>
                <tbody className="divide-y divide-gray-700/50">{medicalSupplies.map(item => (<tr key={item.id} className="hover:bg-gray-700/30"><td className="px-4 py-3 font-semibold text-white">{item.name}</td><td className="px-4 py-3 text-gray-300">{item.category}</td><td className="px-4 py-3 text-gray-300">{item.quantity}</td><td className="px-4 py-3 text-gray-300">{item.unit}</td><td className="px-4 py-3 text-gray-300">{item.expiryDate}</td><td className="px-4 py-3 text-green-400">${item.price}</td><td className="px-4 py-3">{getStockStatusBadge(item.quantity, item.lowStock)}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========== أنواع العلاج ========== */}
      {activeTab === 'treatments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {treatmentTypes.map(treatment => (
            <div key={treatment.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-green-500/30 transition">
              <div className="flex justify-between items-start"><div><h3 className="text-lg font-bold text-white">{treatment.name}</h3><p className="text-green-400">{treatment.nameEn}</p></div><div className="text-right"><p className="text-2xl font-bold text-green-400">{treatment.price} <span className="text-xs">ر.س</span></p></div></div>
              <p className="text-gray-400 text-sm mt-2">{treatment.description}</p>
              <div className="mt-3 flex gap-3 text-sm"><div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /><span className="text-gray-300">{treatment.sessions} جلسة</span></div><div className="flex items-center gap-2"><Activity size={14} className="text-gray-400" /><span className="text-gray-300">المدة: {treatment.duration}</span></div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}