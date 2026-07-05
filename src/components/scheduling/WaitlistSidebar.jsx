// src/components/scheduling/WaitlistSidebar.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User, ClipboardList, RefreshCw, Check, AlertCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WaitlistSidebar({ onSelectEntry, selectedEntryId, refreshTrigger }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  
  const API_BASE = 'https://medical-center-app-production.up.railway.app/api/v1'
  
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl flex flex-col h-full">
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
        <button 
          onClick={fetchWaitlist} 
          disabled={loading}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
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
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 hover:shadow-md ${
                  isSelected 
                    ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800' 
                    : 'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <User size={14} className="text-gray-500" />
                    </div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                      {patientName}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] bg-indigo-600 text-white font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                      <Check size={8} />
                      {isRTL ? 'نشط' : 'Active'}
                    </span>
                  )}
                </div>
                
                {doctorName && (
                  <div className="text-[11px] text-gray-400">
                    {isRTL ? 'الطبيب المفضل: ' : 'Preferred: '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">{doctorName}</span>
                  </div>
                )}
                
                {entry.notes && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic truncate">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      {selectedEntryId && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-2">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-normal">
            {isRTL 
              ? 'وضع التعيين نشط. اضغط على أي خانة فارغة في جدول التقويم لتسكين هذا المريض.' 
              : 'Assign mode active. Click on any empty cell in the calendar grid to assign this patient.'}
          </p>
        </div>
      )}
    </div>
  )
}
