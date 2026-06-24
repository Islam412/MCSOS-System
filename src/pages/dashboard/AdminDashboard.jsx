// src/pages/dashboard/AdminDashboard.jsx
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
  Package, Box, Database, CreditCard, Wallet, Truck, Clipboard,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ========== استيراد الخدمات ==========
import { usersService, doctorsService, patientsService, invoicesService, get } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()
  
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [loading, setLoading] = useState(true)

  // ========== بيانات الموظفين (من API) ==========
  const [employees, setEmployees] = useState({
    reception: [],
    doctors: [],
    nurses: [],
    finance: []
  })

  // ========== بيانات المواد الطبية (من API) ==========
  const [medicalSupplies, setMedicalSupplies] = useState([])

  // ========== بيانات أنواع العلاج (من API) ==========
  const [treatmentTypes, setTreatmentTypes] = useState([])

  // ========== بيانات الخزنة (من API) ==========
  const [inventory, setInventory] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    criticalItems: 0,
    categories: []
  })

  // ========== تحميل البيانات ==========
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) setUser(JSON.parse(userData))
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadEmployees(),
        loadMedicalSupplies(),
        loadTreatmentTypes(),
        loadInventoryStats()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ✅ دالة مساعدة لاستخراج المصفوفة من الاستجابة
  const extractArray = (response, fallback = []) => {
    // إذا كانت الاستجابة مصفوفة مباشرة
    if (Array.isArray(response)) return response
    
    // إذا كانت الاستجابة كائن يحتوي على خاصية data أو items أو users أو treatments
    if (response && typeof response === 'object') {
      if (Array.isArray(response.data)) return response.data
      if (Array.isArray(response.items)) return response.items
      if (Array.isArray(response.users)) return response.users
      if (Array.isArray(response.treatments)) return response.treatments
      if (Array.isArray(response.results)) return response.results
      if (Array.isArray(response.doctors)) return response.doctors
      if (Array.isArray(response.patients)) return response.patients
      
      // محاولة العثور على أي خاصية تحتوي على مصفوفة
      for (const key of Object.keys(response)) {
        if (Array.isArray(response[key])) return response[key]
      }
    }
    
    return fallback
  }

  // ========== تحميل بيانات الموظفين ==========
  const loadEmployees = async () => {
    try {
      let data = []
      
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => usersService.getUsers(),
          'users',
          JSON.parse(localStorage.getItem('mcsos_users_v2') || '[]')
        )
        
        // ✅ استخراج المصفوفة من الاستجابة
        data = extractArray(response, [])
        
        // ✅ التأكد من أن data مصفوفة
        if (!Array.isArray(data)) data = []
        
        // تصنيف الموظفين حسب الدور (مع دعم الأحرف الكبيرة والصغيرة)
        const grouped = {
          doctors: data.filter(u => u.role?.toLowerCase() === 'doctor' || u.role === 'DOCTOR'),
          reception: data.filter(u => u.role?.toLowerCase() === 'reception' || u.role === 'RECEPTIONIST' || u.role === 'receptionist'),
          finance: data.filter(u => u.role?.toLowerCase() === 'finance' || u.role === 'FINANCE'),
          nurses: data.filter(u => u.role?.toLowerCase() === 'nurse' || u.department?.includes('تمريض'))
        }
        setEmployees(grouped)
        localStorage.setItem('mcsos_users_v2', JSON.stringify(data))
      } else {
        // وضع غير متصل - استخدام البيانات المحلية
        const saved = localStorage.getItem('mcsos_users_v2')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            data = parsed
            const grouped = {
              doctors: data.filter(u => u.role?.toLowerCase() === 'doctor' || u.role === 'DOCTOR'),
              reception: data.filter(u => u.role?.toLowerCase() === 'reception' || u.role === 'RECEPTIONIST' || u.role === 'receptionist'),
              finance: data.filter(u => u.role?.toLowerCase() === 'finance' || u.role === 'FINANCE'),
              nurses: data.filter(u => u.role?.toLowerCase() === 'nurse' || u.department?.includes('تمريض'))
            }
            setEmployees(grouped)
          }
        }
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      // ✅ عدم عرض toast للمستخدم
    }
  }

  // ========== تحميل المواد الطبية ==========
  const loadMedicalSupplies = async () => {
    try {
      let data = []
      
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => get('/inventory/items'),
          'inventory_items',
          JSON.parse(localStorage.getItem('mcsos_inventory_items') || '[]')
        )
        
        data = extractArray(response, [])
        if (!Array.isArray(data)) data = []
        
        setMedicalSupplies(data)
        localStorage.setItem('mcsos_inventory_items', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_inventory_items')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setMedicalSupplies(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading medical supplies:', error)
    }
  }

  // ========== تحميل أنواع العلاج ==========
  const loadTreatmentTypes = async () => {
    try {
      let data = []
      
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => get('/treatments'),
          'treatments',
          JSON.parse(localStorage.getItem('mcsos_treatments') || '[]')
        )
        
        data = extractArray(response, [])
        if (!Array.isArray(data)) data = []
        
        setTreatmentTypes(data)
        localStorage.setItem('mcsos_treatments', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_treatments')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setTreatmentTypes(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading treatments:', error)
    }
  }

  // ========== تحميل إحصائيات المخزون ==========
  const loadInventoryStats = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => get('/stats/inventory'),
          'inventory_stats',
          JSON.parse(localStorage.getItem('mcsos_inventory_stats') || '{"totalItems":0,"totalValue":0,"lowStockItems":0,"criticalItems":0,"categories":[]}')
        )
        
        // ✅ التأكد من أن الاستجابة كائن وليس مصفوفة
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          setInventory({
            totalItems: response.totalItems || 0,
            totalValue: response.totalValue || 0,
            lowStockItems: response.lowStockItems || 0,
            criticalItems: response.criticalItems || 0,
            categories: Array.isArray(response.categories) ? response.categories : []
          })
          localStorage.setItem('mcsos_inventory_stats', JSON.stringify(response))
        } else {
          // استخدام القيم الافتراضية
          setInventory({
            totalItems: 0,
            totalValue: 0,
            lowStockItems: 0,
            criticalItems: 0,
            categories: []
          })
        }
      } else {
        const saved = localStorage.getItem('mcsos_inventory_stats')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              setInventory({
                totalItems: parsed.totalItems || 0,
                totalValue: parsed.totalValue || 0,
                lowStockItems: parsed.lowStockItems || 0,
                criticalItems: parsed.criticalItems || 0,
                categories: Array.isArray(parsed.categories) ? parsed.categories : []
              })
            }
          } catch (e) {
            console.error('Error parsing inventory stats:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error loading inventory stats:', error)
    }
  }

  // ========== دوال مساعدة ==========
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': 
      case 'active': 
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ حاضر</span>
      case 'absent': 
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">✗ غائب</span>
      case 'late': 
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⏰ متأخر</span>
      default: 
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status || 'غير محدد'}</span>
    }
  }

  const getStockStatusBadge = (quantity, lowStock) => {
    const qty = Number(quantity) || 0
    const low = Number(lowStock) || 10
    if (qty <= low / 2) return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">⚠️ حرج</span>
    if (qty <= low) return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⚠️ منخفض</span>
    return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ متوفر</span>
  }

  // حساب إجمالي الموظفين
  const totalEmployees = Object.values(employees).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
  const totalDoctors = Array.isArray(employees.doctors) ? employees.doctors.length : 0
  const totalReception = Array.isArray(employees.reception) ? employees.reception.length : 0
  const totalNurses = Array.isArray(employees.nurses) ? employees.nurses.length : 0
  const totalFinance = Array.isArray(employees.finance) ? employees.finance.length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة تحكم المدير</h1>
          <p className="text-gray-400 mt-1">
            مرحباً {user?.name || 'أحمد محمد'} | نظرة شاملة على المركز الطبي
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAllData} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button onClick={() => window.print()} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30">
            <Printer size={18} /> طباعة
          </button>
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
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-sm">إجمالي الموظفين</p><p className="text-3xl font-bold text-white">{totalEmployees}</p></div>
                <div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={28} /></div>
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-blue-400">{totalDoctors} أطباء</span>
                <span className="text-gray-600">|</span>
                <span className="text-green-400">{totalReception} استقبال</span>
                <span className="text-gray-600">|</span>
                <span className="text-pink-400">{totalNurses} تمريض</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-sm">قيمة المخزون</p><p className="text-3xl font-bold text-white">${inventory.totalValue?.toLocaleString() || 0}</p></div>
                <div className="p-3 bg-green-500/20 rounded-xl"><Package className="text-green-400" size={28} /></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-sm">أنواع العلاج</p><p className="text-3xl font-bold text-white">{Array.isArray(treatmentTypes) ? treatmentTypes.length : 0}</p></div>
                <div className="p-3 bg-purple-500/20 rounded-xl"><Syringe className="text-purple-400" size={28} /></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-400 text-sm">أصناف المخزون</p><p className="text-3xl font-bold text-white">{inventory.totalItems || 0}</p></div>
                <div className="p-3 bg-orange-500/20 rounded-xl"><Database className="text-orange-400" size={28} /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-4">توزيع المواد الطبية حسب الفئة</h2>
              {inventory.categories && inventory.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventory.categories}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                    <Bar dataKey="count" fill="#3b82f6" name="الكمية" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">لا توجد بيانات</div>
              )}
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">حالة المخزون</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">إجمالي الأصناف</span>
                  <span className="text-white font-bold">{inventory.totalItems || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">أصناف منخفضة</span>
                  <span className="text-yellow-400 font-bold">{inventory.lowStockItems || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">أصناف حرجة</span>
                  <span className="text-red-400 font-bold">{inventory.criticalItems || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-400">قيمة المخزون</span>
                  <span className="text-green-400 font-bold">${inventory.totalValue?.toLocaleString() || 0}</span>
                </div>
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
              <thead className="bg-gray-800/80">
                <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                  <th className="px-4 py-3 text-sm text-gray-300">الموظف</th>
                  <th className="px-4 py-3 text-sm text-gray-300">القسم</th>
                  <th className="px-4 py-3 text-sm text-gray-300">الوظيفة</th>
                  <th className="px-4 py-3 text-sm text-gray-300">الجوال</th>
                  <th className="px-4 py-3 text-sm text-gray-300">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {Array.isArray(employees.doctors) && employees.doctors.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.specialty || emp.specialization}</div></td>
                    <td className="px-4 py-3">الأطباء</td>
                    <td className="px-4 py-3">طبيب</td>
                    <td className="px-4 py-3 dir-ltr">{emp.phone}</td>
                    <td className="px-4 py-3">{getStatusBadge(emp.status || 'active')}</td>
                  </tr>
                ))}
                {Array.isArray(employees.nurses) && employees.nurses.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.department}</div></td>
                    <td className="px-4 py-3">التمريض</td>
                    <td className="px-4 py-3">ممرض</td>
                    <td className="px-4 py-3 dir-ltr">{emp.phone}</td>
                    <td className="px-4 py-3">{getStatusBadge(emp.status || 'active')}</td>
                  </tr>
                ))}
                {Array.isArray(employees.reception) && employees.reception.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.shift}</div></td>
                    <td className="px-4 py-3">الاستقبال</td>
                    <td className="px-4 py-3">موظف استقبال</td>
                    <td className="px-4 py-3 dir-ltr">{emp.phone}</td>
                    <td className="px-4 py-3">{getStatusBadge(emp.status || 'active')}</td>
                  </tr>
                ))}
                {Array.isArray(employees.finance) && employees.finance.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3"><div className="font-semibold text-white">{emp.name}</div><div className="text-xs text-gray-500">{emp.position}</div></td>
                    <td className="px-4 py-3">المالية</td>
                    <td className="px-4 py-3">موظف مالي</td>
                    <td className="px-4 py-3 dir-ltr">{emp.phone}</td>
                    <td className="px-4 py-3">{getStatusBadge(emp.status || 'active')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== الأطباء ========== */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!Array.isArray(employees.doctors) || employees.doctors.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">لا توجد بيانات</div>
          ) : (
            employees.doctors.map(doctor => (
              <div key={doctor.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-lg font-bold text-white">{doctor.name}</h3><p className="text-blue-400">{doctor.specialty || doctor.specialization}</p></div>
                  <div className="text-right"><div className="text-green-400 font-bold">{doctor.rating || '4.5'} ⭐</div><p className="text-xs text-gray-400">{doctor.patientsCount || 0} مريض</p></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{doctor.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{doctor.email}</span></div>
                  <div className="flex items-center gap-2"><Activity size={14} className="text-gray-400" /><span className="text-gray-300">{doctor.sessionsCount || 0} جلسة</span></div>
                  <div className="flex items-center gap-2">{getStatusBadge(doctor.status || 'active')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== الممرضات ========== */}
      {activeTab === 'nurses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!Array.isArray(employees.nurses) || employees.nurses.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">لا توجد بيانات</div>
          ) : (
            employees.nurses.map(nurse => (
              <div key={nurse.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-pink-500/30 transition">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-lg font-bold text-white">{nurse.name}</h3><p className="text-pink-400">{nurse.department}</p></div>
                  <div className="text-right"><span className="px-2 py-1 rounded-full text-xs bg-pink-500/20 text-pink-400">{nurse.shift || 'صباحي'}</span></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{nurse.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{nurse.email}</span></div>
                  <div className="flex items-center gap-2">{getStatusBadge(nurse.status || 'active')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== موظفي الاستقبال ========== */}
      {activeTab === 'reception' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!Array.isArray(employees.reception) || employees.reception.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">لا توجد بيانات</div>
          ) : (
            employees.reception.map(emp => (
              <div key={emp.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-green-500/30 transition">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-lg font-bold text-white">{emp.name}</h3><p className="text-green-400">{emp.shift || 'صباحي'}</p></div>
                  <div>{getStatusBadge(emp.status || 'active')}</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{emp.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{emp.email}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== الموظفين الماليين ========== */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!Array.isArray(employees.finance) || employees.finance.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">لا توجد بيانات</div>
          ) : (
            employees.finance.map(emp => (
              <div key={emp.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-lg font-bold text-white">{emp.name}</h3><p className="text-purple-400">{emp.position || 'موظف مالي'}</p></div>
                  <div>{getStatusBadge(emp.status || 'active')}</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span className="text-gray-300 dir-ltr">{emp.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-300">{emp.email}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== الخزنة والمواد الطبية ========== */}
      {activeTab === 'inventory' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30 text-center">
              <Package className="mx-auto text-blue-400 mb-2" size={28} />
              <p className="text-2xl font-bold text-white">{inventory.totalItems || 0}</p>
              <p className="text-xs text-gray-400">إجمالي الأصناف</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30 text-center">
              <Database className="mx-auto text-green-400 mb-2" size={28} />
              <p className="text-2xl font-bold text-white">${inventory.totalValue?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-400">قيمة المخزون</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 border border-yellow-500/30 text-center">
              <AlertCircle className="mx-auto text-yellow-400 mb-2" size={28} />
              <p className="text-2xl font-bold text-yellow-400">{inventory.lowStockItems || 0}</p>
              <p className="text-xs text-gray-400">أصناف منخفضة</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl p-4 border border-red-500/30 text-center">
              <AlertTriangle className="mx-auto text-red-400 mb-2" size={28} />
              <p className="text-2xl font-bold text-red-400">{inventory.criticalItems || 0}</p>
              <p className="text-xs text-gray-400">أصناف حرجة</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-700/50"><h2 className="text-xl font-bold text-white">المواد الطبية المتاحة</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/80">
                  <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <th className="px-4 py-3 text-sm text-gray-300">المنتج</th>
                    <th className="px-4 py-3 text-sm text-gray-300">الفئة</th>
                    <th className="px-4 py-3 text-sm text-gray-300">الكمية</th>
                    <th className="px-4 py-3 text-sm text-gray-300">الوحدة</th>
                    <th className="px-4 py-3 text-sm text-gray-300">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {!Array.isArray(medicalSupplies) || medicalSupplies.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
                  ) : (
                    medicalSupplies.map(item => (
                      <tr key={item.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                        <td className="px-4 py-3 text-gray-300">{item.category}</td>
                        <td className="px-4 py-3 text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-300">{item.unit}</td>
                        <td className="px-4 py-3">{getStockStatusBadge(item.quantity, item.lowStock || 10)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========== أنواع العلاج ========== */}
      {activeTab === 'treatments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!Array.isArray(treatmentTypes) || treatmentTypes.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">لا توجد بيانات</div>
          ) : (
            treatmentTypes.map(treatment => (
              <div key={treatment.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-green-500/30 transition">
                <div className="flex justify-between items-start">
                  <div><h3 className="text-lg font-bold text-white">{treatment.name}</h3><p className="text-green-400">{treatment.nameEn}</p></div>
                  <div className="text-right"><p className="text-2xl font-bold text-green-400">{treatment.price} <span className="text-xs">ر.س</span></p></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">{treatment.description}</p>
                <div className="mt-3 flex gap-3 text-sm">
                  <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /><span className="text-gray-300">{treatment.sessions} جلسة</span></div>
                  <div className="flex items-center gap-2"><Activity size={14} className="text-gray-400" /><span className="text-gray-300">المدة: {treatment.duration}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}