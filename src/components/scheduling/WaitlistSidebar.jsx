import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User, ClipboardList, RefreshCw, Check, AlertCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import AddToWaitlistModal from './AddToWaitlistModal'

export default function WaitlistSidebar({ onSelectEntry, selectedEntryId, refreshTrigger, doctors }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`
  
  useEffect(() => {
    fetchWaitlist()
  }, [refreshTrigger])

  const fetchWaitlist = async () => {
    setLoading(true)
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}/waitlist?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error()
      const data = await response.json()
      
      // Filter only WAITING status entries
      const list = data.data || data
      if (Array.isArray(list)) {
        setEntries(list.filter(e => e.status === 'WAITING' || !e.status))
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ClipboardList className="text-indigo-500" size={18} />
          {isRTL ? 'قائمة الانتظار' : 'Waiting List'}
          {entries.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full">
              {entries.length}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-1.5 text-indigo-650 hover:text-indigo-850 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
            title={isRTL ? 'إضافة للانتظار' : 'Add to Waitlist'}
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={fetchWaitlist} 
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
            <RefreshCw className="animate-spin mb-2" size={20} />
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm text-center">
            <ClipboardList className="mb-2 opacity-40" size={32} />
            {isRTL ? 'لا يوجد مرضى في قائمة الانتظار' : 'Waitlist is empty'}
          </div>
        ) : (
          entries.map(entry => {
            const isSelected = selectedEntryId === entry.id
            const patientName = entry.patient ? `${entry.patient.first_name} ${entry.patient.last_name}` : 'N/A'
            const doctorName = entry.doctor ? entry.doctor.name : null
            
            return (
              <div 
                key={entry.id}
                onClick={() => onSelectEntry(isSelected ? null : entry)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col gap-2 hover:shadow-md ${
                  isSelected 
                    ? 'bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border-indigo-400 dark:from-indigo-950/20 dark:to-indigo-950/40 dark:border-indigo-700 shadow-md ring-1 ring-indigo-500/25 scale-[1.01]' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 shadow-[0_2px_4px_rgba(0,0,0,0.01)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-100/30 dark:border-indigo-900/30">
                      {getInitials(patientName)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-[13px] text-gray-805 dark:text-gray-100 truncate">
                        {patientName}
                      </span>
                      {entry.patient?.patient_code && (
                        <span className="text-[9px] font-mono text-gray-400 mt-0.5">
                          {entry.patient.patient_code}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse shrink-0">
                      <Check size={8} />
                      {isRTL ? 'نشط' : 'Active'}
                    </span>
                  )}
                </div>
                
                {doctorName && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded-lg border border-gray-100/50 dark:border-gray-850/50 w-max flex items-center gap-1">
                    <span className="text-gray-400 font-medium">{isRTL ? 'الطبيب المفضل:' : 'Preferred:'}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{doctorName}</span>
                  </div>
                )}
                
                {entry.notes && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] text-gray-600 dark:text-gray-400 leading-normal">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">{isRTL ? 'ملاحظات:' : 'Notes:'}</span>
                    <span className="font-medium italic">"{entry.notes}"</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      {selectedEntryId && (
        <div className="mt-4 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/30 rounded-2xl flex items-start gap-2 animate-bounce-subtle">
          <AlertCircle className="text-indigo-500 shrink-0 mt-0.5 animate-pulse" size={16} />
          <p className="text-[11px] text-indigo-700 dark:text-indigo-350 leading-relaxed font-semibold">
            {isRTL 
              ? 'وضع التسكين نشط. اضغط على أي خانة فارغة في جدول التقويم لتسكين هذا المريض.' 
              : 'Assign mode active. Click on any empty cell in the calendar grid to assign this patient.'}
          </p>
        </div>
      )}
      {/* Add to Waitlist Modal */}
      <AddToWaitlistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        doctors={doctors}
        onAddComplete={() => {
          setShowAddModal(false)
          fetchWaitlist()
        }}
      />
    </div>
  )
}
