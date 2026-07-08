// src/components/scheduling/SchedulingEngine.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Users, Plus, Trash2, Save, Zap, Loader2, RefreshCw, Edit, X, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== استيراد المكونات الجديدة ==========
import DailyCalendarGrid from './DailyCalendarGrid'
import SessionDetailModal from './SessionDetailModal'
import WaitlistSidebar from './WaitlistSidebar'
import SchedulingPackages from './SchedulingPackages'

// ========== عنوان الـ API ==========
const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

export default function SchedulingEngine() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ========== حالات المكونات الجديدة ==========
  const [activeTab, setActiveTab] = useState('grid') // 'grid' or 'slots'
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [waitlistRefreshTrigger, setWaitlistRefreshTrigger] = useState(0)

  const bulkPatterns = [
    { id: 'sun_tue_thu', nameAr: 'الأحد - الثلاثاء - الخميس', nameEn: 'Sun - Tue - Thu' },
    { id: 'mon_wed_sat', nameAr: 'الإثنين - الأربعاء - السبت', nameEn: 'Mon - Wed - Sat' },
    { id: 'daily', nameAr: 'يومياً', nameEn: 'Daily' },
  ]

  // ========== دالة مساعدة للـ GET ==========
  const fetchApi = async (endpoint) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`⚠️ API ${endpoint} failed:`, error.message)
      return null
    }
  }

  // ========== دالة مساعدة للـ POST ==========
  const postApi = async (endpoint, data) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`⚠️ POST ${endpoint} failed:`, error.message)
      throw error
    }
  }

  // ========== دالة مساعدة للـ PUT ==========
  const putApi = async (endpoint, data) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`⚠️ PUT ${endpoint} failed:`, error.message)
      throw error
    }
  }

  // ========== دالة مساعدة للـ DELETE ==========
  const deleteApi = async (endpoint) => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return true
    } catch (error) {
      console.warn(`⚠️ DELETE ${endpoint} failed:`, error.message)
      throw error
    }
  }

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await loadDoctors()
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل الأطباء ==========
  const loadDoctors = async () => {
    try {
      if (!isOnline) {
        const saved = localStorage.getItem('mcsos_doctors')
        if (saved) {
          setDoctors(JSON.parse(saved))
        }
        return
      }

      const doctors = await doctorsService.getDoctors()
      if (Array.isArray(doctors) && doctors.length > 0) {
        setDoctors(doctors)
        localStorage.setItem('mcsos_doctors', JSON.stringify(doctors))
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      const saved = localStorage.getItem('mcsos_doctors')
      if (saved) {
        setDoctors(JSON.parse(saved))
      }
    }
  }

  // ========== دوال مساعدة ==========
  const getDoctorName = (doctor) => {
    if (!doctor) return ''
    return isRTL ? (doctor.nameAr || doctor.name) : (doctor.nameEn || doctor.name)
  }

  const getDoctorById = (id) => {
    return doctors.find(d => d.id == id)
  }



  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadData()
    toast.success('تم تحديث البيانات')
  }
  // ========== حالة الموعد ==========
  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ متاح</span>
      case 'booked':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">📅 محجوز</span>
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">✗ ملغي</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section remains the same */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {t('scheduling.title') || 'Scheduling System'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t('scheduling.subtitle') || 'Smart appointment scheduling'}
          </p>
        </div>
        
        <button 
          onClick={refreshData}
          disabled={loading}
          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-500/20 transition-all font-semibold"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {isRTL ? 'تحديث البيانات' : 'Refresh'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-2">
        <div className="flex w-full max-w-lg bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-1.5 shadow-inner gap-2">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex-1 py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'grid'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-150 hover:bg-white/50 dark:hover:bg-gray-800/30'
            }`}
          >
            <Calendar size={16} />
            {isRTL ? 'مخطط التقويم اليومي' : 'Daily Calendar Grid'}
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex-1 py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'packages'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-150 hover:bg-white/50 dark:hover:bg-gray-800/30'
            }`}
          >
            <Zap size={16} />
            {isRTL ? 'باقات المرضى' : 'Packages'}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <DailyCalendarGrid 
              selectedWaitlistEntry={selectedWaitlistEntry}
              refreshTrigger={waitlistRefreshTrigger}
              onAssignComplete={() => {
                setSelectedWaitlistEntry(null)
                setWaitlistRefreshTrigger(prev => prev + 1)
              }}
              onViewSession={(session) => setSelectedSession(session)}
            />
          </div>
          <div className="lg:col-span-1">
            <WaitlistSidebar 
              selectedEntryId={selectedWaitlistEntry?.id}
              onSelectEntry={(entry) => setSelectedWaitlistEntry(entry)}
              refreshTrigger={waitlistRefreshTrigger}
              doctors={doctors}
            />
          </div>
        </div>
      ) : (
        /* Packages View */
        <SchedulingPackages />
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal 
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onUpdate={(updatedSession) => {
          setSelectedSession(null)
          setWaitlistRefreshTrigger(prev => prev + 1) // Refresh waitlist sidebar & grid
        }}
      />
    </div>
  )
}