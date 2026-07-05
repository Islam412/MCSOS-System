// src/components/scheduling/AddToWaitlistModal.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Search, Plus, User, ClipboardList, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddToWaitlistModal({ isOpen, onClose, doctors, onAddComplete }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  
  // Existing Patient Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [patientsList, setPatientsList] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  // Form Fields
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0])
  const [preferredTime, setPreferredTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  
  const searchTimeoutRef = useRef(null)
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

  useEffect(() => {
    if (!isOpen) return
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchPatients(searchQuery)
    }, 300)
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery, isOpen])

  const fetchPatients = async (query = '') => {
    setSearching(true)
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}/patients?limit=10&search=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPatientsList(data.data || data || [])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setSearching(false)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      toast.error(isRTL ? 'الرجاء اختيار مريض أولاً' : 'Please select a patient first')
      return
    }

    const token = localStorage.getItem('mcsos_token')
    
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE}/waitlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          doctor_id: selectedDoctorId || null,
          preferred_date: preferredDate || null,
          preferred_time: preferredTime ? `${preferredTime}:00` : null,
          notes: notes || null
        })
      })

      if (!response.ok) throw new Error()
      
      toast.success(isRTL ? 'تمت إضافة المريض لقائمة الانتظار بنجاح!' : 'Patient added to waitlist successfully!')
      
      // Reset State
      setSelectedPatient(null)
      setSearchQuery('')
      setNotes('')
      setSelectedDoctorId('')
      
      if (onAddComplete) onAddComplete()
    } catch (error) {
      toast.error(isRTL ? 'فشل إضافة المريض لقائمة الانتظار' : 'Failed to add patient to waitlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-150 dark:border-gray-700 overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-900">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ClipboardList className="text-indigo-500" size={20} />
              {isRTL ? 'إضافة إلى قائمة الانتظار' : 'Add to Waitlist'}
            </h3>
            <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">
              {isRTL ? 'أدخل تفاصيل المريض والطلب لجدولته لاحقاً' : 'Enter patient request to schedule later'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
          
          {/* Patient Selection Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              {isRTL ? 'البحث عن المريض' : 'Search Patient'}
            </label>
            
            <div className="relative">
              <Search className="absolute right-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={isRTL ? 'ابحث بالاسم، كود المريض، أو الهاتف...' : 'Search by name, code, phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Suggestions List */}
            <div className="max-h-[140px] overflow-y-auto border border-gray-150 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-900 shadow-inner">
              {searching ? (
                <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                  {isRTL ? 'جاري البحث...' : 'Searching...'}
                </div>
              ) : patientsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  {isRTL ? 'لم يتم العثور على مرضى' : 'No patients found'}
                </div>
              ) : (
                patientsList.map(pat => {
                  const isSelected = selectedPatient?.id === pat.id
                  return (
                    <div
                      key={pat.id}
                      type="button"
                      onClick={() => setSelectedPatient(pat)}
                      className={`p-3 text-right cursor-pointer flex items-center justify-between text-xs transition duration-200 ${
                        isSelected 
                          ? 'bg-indigo-500 text-white font-bold' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold">{pat.first_name} {pat.last_name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-gray-400'} mt-0.5`}>
                          {pat.phone || (isRTL ? 'بدون هاتف' : 'No phone')}
                        </span>
                      </div>
                      <span className={`font-mono text-[10px] ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {pat.patient_code}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
            
            {selectedPatient && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                  </div>
                  <span className="font-bold">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                </div>
                <span className="font-mono text-gray-550 dark:text-gray-400">{selectedPatient.patient_code}</span>
              </div>
            )}
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Preferences Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isRTL ? 'الطبيب المفضل (اختياري)' : 'Preferred Doctor (Optional)'}
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{isRTL ? 'أي طبيب متاح' : 'Any Available Doctor'}</option>
                {doctors && doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'التاريخ المفضل' : 'Preferred Date'}
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2.2 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'الوقت المفضل' : 'Preferred Time'}
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full p-2.2 border border-gray-255 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isRTL ? 'ملاحظات وحالة المريض' : 'Notes & Patient State'}
              </label>
              <textarea
                placeholder={isRTL ? 'اكتب أي ملاحظات أو شكوى طبية لتسكين الموعد بشكل أفضل...' : 'Enter any notes or medical complaints...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <ArrowRight size={14} />
              )}
              {isRTL ? 'إضافة للانتظار' : 'Add to Waitlist'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-150 hover:bg-gray-205 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl text-xs transition duration-200"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
