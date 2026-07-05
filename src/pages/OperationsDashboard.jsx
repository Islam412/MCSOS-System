// src/pages/OperationsDashboard.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  TrendingUp, Users, Calendar, Activity, Download, 
  Calendar as CalendarIcon, CheckCircle, XCircle, Edit, Plus, 
  Trash2, RefreshCw, Loader2, FileText, Eye, Printer
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService } from '../services/api'
import { useServices } from '../context/ServiceContext'

export default function OperationsDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  // ========== استخدام خدمات API ==========
  const { isOnline } = useServices()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

  // ========== بيانات ==========
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    averageWaitTime: 0,
    doctorUtilization: 0,
    patientSatisfaction: 0,
    revenueThisMonth: 0
  })

  const [doctorPerformance, setDoctorPerformance] = useState([])
  const [dailyReport, setDailyReport] = useState(null)
  const [conversionRate, setConversionRate] = useState({
    assessed: 0,
    converted: 0,
    rate: 0
  })

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    setApiError(null)
    try {
      await Promise.all([
        loadStats(),
        loadDoctors(),
        loadDailyReport(),
        loadConversionRate()
      ])
    } catch (error) {
      console.error('Error loading operations data:', error)
      setApiError(error.message)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل الإحصائيات ==========
  const loadStats = async () => {
    try {
      // ✅ محاولة جلب الإحصائيات من API (Sessions)
      if (isOnline) {
        try {
          const response = await fetch(
            `${API_BASE}/sessions`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
              const total = data.length
              const completed = data.filter(s => s.status === 'completed' || s.status === 'attended').length
              const cancelled = data.filter(s => s.status === 'cancelled').length
              const noShow = data.filter(s => s.status === 'no-show' || s.status === 'no_show').length
              
              setStats({
                totalAppointments: total,
                completedAppointments: completed,
                cancelledAppointments: cancelled,
                noShowAppointments: noShow,
                averageWaitTime: 0,
                doctorUtilization: total > 0 ? Math.round((completed / total) * 100) : 0,
                patientSatisfaction: 0,
                revenueThisMonth: 0
              })
              return
            }
          }
        } catch (e) {
          console.warn('⚠️ Failed to load stats from API:', e)
        }
      }

      // ✅ إذا فشل API أو غير متصل، استخدم localStorage
      const saved = localStorage.getItem('mcsos_operations_stats')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setStats(data)
        } catch (e) {
          console.warn('Error parsing saved stats:', e)
        }
      }

    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // ========== تحميل الأطباء ==========
  const loadDoctors = async () => {
    try {
      if (!isOnline) {
        const saved = localStorage.getItem('mcsos_doctor_performance')
        if (saved) {
          try {
            setDoctorPerformance(JSON.parse(saved))
          } catch (e) {
            console.warn('Error parsing saved doctors:', e)
          }
        }
        return
      }

      // ✅ جلب الأطباء من API
      const doctors = await doctorsService.getDoctors()
      
      if (Array.isArray(doctors) && doctors.length > 0) {
        const performance = doctors.map(d => ({
          id: d.id,
          name: currentLang === 'ar' ? (d.nameAr || d.name) : (d.nameEn || d.name),
          specialization: currentLang === 'ar' ? (d.specializationAr || d.specialization) : (d.specializationEn || d.specialization),
          patients: d.patientsCount || d.patients || 0,
          sessions: d.sessionsCount || d.sessions || 0,
          attendance: d.attendance || d.attendanceRate || 0,
          utilization: d.utilization || d.performance || 0,
          revenue: d.revenue || 0
        }))
        
        setDoctorPerformance(performance)
        // ✅ حفظ في localStorage كاحتياطي
        localStorage.setItem('mcsos_doctor_performance', JSON.stringify(performance))
      } else {
        // ✅ إذا مفيش أطباء، استخدم localStorage
        const saved = localStorage.getItem('mcsos_doctor_performance')
        if (saved) {
          try {
            setDoctorPerformance(JSON.parse(saved))
          } catch (e) {
            console.warn('Error parsing saved doctors:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_doctor_performance')
      if (saved) {
        try {
          setDoctorPerformance(JSON.parse(saved))
        } catch (e) {
          console.warn('Error parsing saved doctors:', e)
        }
      }
    }
  }

  // ========== تحميل التقرير اليومي ==========
  const loadDailyReport = async () => {
    try {
      // ✅ محاولة جلب التقرير اليومي من API
      if (isOnline) {
        try {
          const today = new Date().toISOString().split('T')[0]
          const response = await fetch(
            `${API_BASE}/sessions?date=${today}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data)) {
              const total = data.length
              const completed = data.filter(s => s.status === 'completed' || s.status === 'attended').length
              const cancelled = data.filter(s => s.status === 'cancelled').length
              const pending = data.filter(s => s.status === 'scheduled' || s.status === 'pending').length
              
              const report = {
                date: today,
                totalAppointments: total,
                completed: completed,
                cancelled: cancelled,
                pending: pending,
                noShow: data.filter(s => s.status === 'no-show').length
              }
              
              setDailyReport(report)
              localStorage.setItem('mcsos_daily_report', JSON.stringify(report))
              return
            }
          }
        } catch (e) {
          console.warn('⚠️ Failed to load daily report from API:', e)
        }
      }

      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_daily_report')
      if (saved) {
        try {
          setDailyReport(JSON.parse(saved))
        } catch (e) {
          console.warn('Error parsing daily report:', e)
        }
      }

    } catch (error) {
      console.error('Error loading daily report:', error)
    }
  }

  // ========== تحميل نسبة التحويل ==========
  const loadConversionRate = async () => {
    try {
      // ✅ محاولة جلب نسبة التحويل من API
      if (isOnline) {
        try {
          const [patientsRes, sessionsRes] = await Promise.all([
            fetch(
              `${API_BASE}/patients`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
                  'Content-Type': 'application/json'
                }
              }
            ),
            fetch(
              `${API_BASE}/sessions`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
                  'Content-Type': 'application/json'
                }
              }
            )
          ])

          let assessed = 0
          let converted = 0

          if (patientsRes.ok) {
            const patients = await patientsRes.json()
            assessed = Array.isArray(patients) ? patients.length : 0
          }

          if (sessionsRes.ok) {
            const sessions = await sessionsRes.json()
            if (Array.isArray(sessions)) {
              converted = sessions.filter(s => s.status === 'completed' || s.status === 'attended').length
            }
          }

          const rate = assessed > 0 ? Math.round((converted / assessed) * 100) : 0
          
          if (assessed > 0 || converted > 0) {
            const newRate = { assessed, converted, rate }
            setConversionRate(newRate)
            localStorage.setItem('mcsos_conversion_rate', JSON.stringify(newRate))
            return
          }
        } catch (e) {
          console.warn('⚠️ Failed to load conversion rate from API:', e)
        }
      }

      // ✅ استخدام localStorage كاحتياطي
      const saved = localStorage.getItem('mcsos_conversion_rate')
      if (saved) {
        try {
          setConversionRate(JSON.parse(saved))
        } catch (e) {
          console.warn('Error parsing conversion rate:', e)
        }
      }

    } catch (error) {
      console.error('Error loading conversion rate:', error)
    }
  }

  // ========== تحديث نسب الاستخدام (محلياً فقط) ==========
  const handleUpdateUtilization = () => {
    if (doctorPerformance.length === 0) {
      toast.warning('لا يوجد أطباء لتحديث نسب الاستخدام')
      return
    }

    const updated = doctorPerformance.map(d => ({
      ...d,
      utilization: Math.min(100, Math.max(0, (d.utilization || 0) + (Math.random() * 10 - 5)))
    }))
    
    setDoctorPerformance(updated)
    localStorage.setItem('mcsos_doctor_performance', JSON.stringify(updated))
    toast.success('تم تحديث نسب الاستخدام')
  }

  // ========== تصدير التقرير ==========
  const handleExportReport = () => {
    try {
      const reportData = {
        stats,
        doctors: doctorPerformance,
        dailyReport,
        conversionRate,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `operations_report_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('تم تصدير التقرير بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في تصدير التقرير')
    }
  }

  // ========== طباعة التقرير ==========
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير العمليات - ${new Date().toLocaleDateString()}</title>
          <style>
            *{margin:0;padding:0;box-sizing:border-box;}
            body{font-family:'Cairo',Arial,sans-serif;padding:40px;background:white;}
            .header{text-align:center;border-bottom:2px solid #2563eb;padding-bottom:20px;margin-bottom:20px;}
            .title{font-size:24px;font-weight:bold;color:#1e3a5f;}
            .date{color:#6b7280;margin-top:5px;}
            .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0;}
            .stat-card{background:#f3f4f6;padding:15px;border-radius:8px;text-align:center;}
            .stat-value{font-size:24px;font-weight:bold;color:#1e3a5f;}
            .stat-label{font-size:12px;color:#6b7280;}
            table{width:100%;border-collapse:collapse;margin:15px 0;}
            th,td{border:1px solid #e5e7eb;padding:10px;text-align:${isRTL ? 'right' : 'left'};}
            th{background:#f1f5f9;font-weight:bold;}
            .footer{text-align:center;margin-top:30px;padding-top:15px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;}
            @media print{body{padding:0;}}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">تقرير العمليات - MCSOS</div>
            <div class="date">التاريخ: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-value">${stats.totalAppointments}</div><div class="stat-label">إجمالي المواعيد</div></div>
            <div class="stat-card"><div class="stat-value">${stats.completedAppointments}</div><div class="stat-label">مكتملة</div></div>
            <div class="stat-card"><div class="stat-value">${stats.doctorUtilization}%</div><div class="stat-label">استخدام الأطباء</div></div>
            <div class="stat-card"><div class="stat-value">${stats.patientSatisfaction}%</div><div class="stat-label">رضا المرضى</div></div>
          </div>
          <h3 style="margin:20px 0 10px;">أداء الأطباء</h3>
          <table>
            <thead><tr><th>الطبيب</th><th>التخصص</th><th>المرضى</th><th>الجلسات</th><th>الحضور</th><th>الاستخدام</th></tr></thead>
            <tbody>
              ${doctorPerformance.map(d => `
                <tr>
                  <td>${d.name}</td>
                  <td>${d.specialization}</td>
                  <td>${d.patients}</td>
                  <td>${d.sessions}</td>
                  <td>${d.attendance}%</td>
                  <td>${d.utilization}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">تم إنشاء هذا التقرير بواسطة نظام MCSOS - ${new Date().toLocaleString()}</div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري طباعة التقرير...')
  }

  // ========== إعادة تعيين البيانات ==========
  const handleResetData = () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) return

    const defaultStats = {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      averageWaitTime: 0,
      doctorUtilization: 0,
      patientSatisfaction: 0,
      revenueThisMonth: 0
    }

    setStats(defaultStats)
    setDoctorPerformance([])
    setDailyReport(null)
    setConversionRate({ assessed: 0, converted: 0, rate: 0 })
    
    localStorage.removeItem('mcsos_operations_stats')
    localStorage.removeItem('mcsos_doctor_performance')
    localStorage.removeItem('mcsos_daily_report')
    localStorage.removeItem('mcsos_conversion_rate')
    
    toast.success('تم إعادة تعيين البيانات')
    loadAllData()
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadAllData()
    toast.success('تم تحديث البيانات')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">جاري تحميل بيانات العمليات...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">العمليات</h1>
          <p className="text-gray-400 mt-1">
            إدارة العمليات اليومية ومتابعة أداء الأطباء
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
            {apiError && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                ⚠️ خطأ في الخادم
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={refreshData} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button onClick={handleUpdateUtilization} disabled={isSubmitting || doctorPerformance.length === 0} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30 disabled:opacity-50">
            <TrendingUp size={18} /> تحديث النسب
          </button>
          <button onClick={handleExportReport} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
            <Download size={18} /> تصدير
          </button>
          <button onClick={handlePrintReport} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-orange-500/30">
            <Printer size={18} /> طباعة
          </button>
          <button onClick={handleResetData} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-red-500/30">
            <RefreshCw size={18} /> إعادة تعيين
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={20} /></div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalAppointments || 0}</div>
              <div className="text-sm text-gray-400">إجمالي المواعيد</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={20} /></div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.completedAppointments || 0}</div>
              <div className="text-sm text-gray-400">مكتملة</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl"><TrendingUp className="text-purple-400" size={20} /></div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.doctorUtilization || 0}%</div>
              <div className="text-sm text-gray-400">استخدام الأطباء</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl"><Users className="text-orange-400" size={20} /></div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.patientSatisfaction || 0}%</div>
              <div className="text-sm text-gray-400">رضا المرضى</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Report */}
      {dailyReport && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-blue-400" />
              التقرير اليومي - {dailyReport.date}
            </h2>
            <div className="flex gap-2 text-sm">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg">✓ {dailyReport.completed || 0} مكتمل</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg">⏳ {dailyReport.pending || 0} معلق</span>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg">✗ {dailyReport.cancelled || 0} ملغي</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{dailyReport.totalAppointments || 0}</div>
              <div className="text-xs text-gray-400">إجمالي</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{dailyReport.completed || 0}</div>
              <div className="text-xs text-gray-400">مكتمل</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{dailyReport.pending || 0}</div>
              <div className="text-xs text-gray-400">معلق</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{dailyReport.cancelled || 0}</div>
              <div className="text-xs text-gray-400">ملغي</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-400">{dailyReport.noShow || 0}</div>
              <div className="text-xs text-gray-400">عدم حضور</div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Performance Table */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            أداء الأطباء
          </h2>
          <span className="text-sm text-gray-400">{doctorPerformance.length} طبيب</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm text-gray-300">الطبيب</th>
                <th className="px-6 py-3 text-sm text-gray-300">التخصص</th>
                <th className="px-6 py-3 text-sm text-gray-300">المرضى</th>
                <th className="px-6 py-3 text-sm text-gray-300">الجلسات</th>
                <th className="px-6 py-3 text-sm text-gray-300">الحضور</th>
                <th className="px-6 py-3 text-sm text-gray-300">الاستخدام</th>
                <th className="px-6 py-3 text-sm text-gray-300">الإيرادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {doctorPerformance.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">لا توجد بيانات</td></tr>
              ) : (
                doctorPerformance.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-semibold text-white">{doctor.name}</td>
                    <td className="px-6 py-4 text-gray-300">{doctor.specialization}</td>
                    <td className="px-6 py-4 text-gray-300">{doctor.patients}</td>
                    <td className="px-6 py-4 text-gray-300">{doctor.sessions}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doctor.attendance >= 90 ? 'bg-green-500/20 text-green-400' :
                        doctor.attendance >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {doctor.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${doctor.utilization}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-400">{doctor.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-400">${doctor.revenue || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-400" />
          نسبة التحويل (التقييم → الدفع)
        </h2>
        <div className="flex items-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{conversionRate.assessed || 0}</div>
            <div className="text-sm text-gray-400">تم التقييم</div>
          </div>
          <div className="text-2xl text-gray-500">→</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{conversionRate.converted || 0}</div>
            <div className="text-sm text-gray-400">تم التحويل</div>
          </div>
          <div className="text-2xl text-gray-500">=</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400">{conversionRate.rate || 0}%</div>
            <div className="text-sm text-gray-400">نسبة التحويل</div>
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, conversionRate.rate || 0)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}