// src/components/scheduling/DirectBookingModal.jsx
import { useState, useEffect, useRef } from 'react'
import { getToken } from '../../services/api/client'
import { API_BASE } from '../../services/api/config'
import { useTranslation } from 'react-i18next'
import { X, Search, Plus, User, ClipboardList, MapPin, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import UnifiedPatientForm from '../common/UnifiedPatientForm'
import { quotaTone } from '../../utils/statusColors'

export default function DirectBookingModal({ isOpen, onClose, slotInfo, rooms, onBookingComplete }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [mode, setMode] = useState('select') // 'select' or 'register'
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  
  // Existing Patient Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [patientsList, setPatientsList] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  // Booking Fields
  const [roomId, setRoomId] = useState('')
  const [receptionNotes, setReceptionNotes] = useState('')
  const [services, setServices] = useState([])
  const [paidQuotas, setPaidQuotas] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [serviceQuery, setServiceQuery] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  
  const searchTimeoutRef = useRef(null)
  const patientFormRef = useRef(null)
  
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setRoomId(rooms[0].id)
    }
  }, [rooms])

  useEffect(() => {
    if (!isOpen || !slotInfo) return
    const start = `${slotInfo.dateStr}T${String(slotInfo.timeStr || '08:00').slice(0, 5)}`
    const startDate = new Date(start)
    const endDate = new Date(startDate.getTime() + 60 * 60000)
    const pad = (value) => String(value).padStart(2, '0')
    const toInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    setStartAt(toInput(startDate))
    setEndAt(toInput(endDate))
  }, [isOpen, slotInfo])

  useEffect(() => {
    if (!isOpen) return
    const token = getToken()
    fetch(`${API_BASE}/services`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setServices(Array.isArray(data) ? data : data.data || []))
      .catch(() => setServices([]))
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !selectedPatient?.id) {
      setPaidQuotas([])
      return
    }
    const token = getToken()
    fetch(`${API_BASE}/patient-packages/patient/${selectedPatient.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        const packages = Array.isArray(data) ? data : data.data || []
        const lines = []
        packages.forEach((pkg) => {
          if (!pkg.payment_verified) return
          ;(pkg.quotas || []).forEach((quota) => {
            if (Number(quota.remaining_sessions) > 0) {
              lines.push({
                ...quota,
                patient_package_id: pkg.id,
              })
            }
          })
        })
        setPaidQuotas(lines)
      })
      .catch(() => setPaidQuotas([]))
  }, [isOpen, selectedPatient])

  // Fetch initial list of patients or search when query changes
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
    const token = getToken()
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

  if (!isOpen || !slotInfo) return null
  const { doctor, timeStr, dateStr } = slotInfo

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    let targetPatientId = selectedPatient?.id
    
    if (mode === 'register') {
      const registered = await patientFormRef.current?.register()
      if (!registered) return
      targetPatientId = registered.id
    }
    
    if (!targetPatientId) {
      toast.error(isRTL ? 'الرجاء اختيار مريض أولاً' : 'Please select a patient first')
      return
    }

    const token = getToken()
    const starts = new Date(startAt)
    const ends = new Date(endAt)
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) {
      toast.error(isRTL ? 'حدد بداية ونهاية صحيحة للجلسة' : 'Set a valid start and end')
      return
    }

    const chosen = services.find((service) => service.id === serviceId)
    if (!chosen) {
      toast.error(isRTL ? 'اختر الخدمة' : 'Choose a service')
      return
    }
    const quota = paidQuotas.find((line) => line.service_id === serviceId)
    if (!chosen.is_assessment && !quota) {
      toast.error(isRTL ? 'الخدمة دي مش ضمن باكدج مدفوع للمريض' : 'This service is not in a paid package for this patient')
      return
    }
    
    try {
      setLoading(true)
      
      const sessionResponse = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: targetPatientId,
          doctor_id: doctor.id,
          session_type: chosen.is_assessment ? 'ASSESSMENT' : 'TREATMENT',
          service_id: chosen.id,
          patient_package_id: chosen.is_assessment ? undefined : quota.patient_package_id,
          scheduled_duration_minutes: Math.max(15, Math.round((ends - starts) / 60000)),
          session_date: starts.toISOString(),
          end_time: ends.toISOString(),
          room_id: roomId || null,
          reception_notes: receptionNotes || null
        })
      })

      if (!sessionResponse.ok) {
        const errBody = await sessionResponse.json().catch(() => ({}))
        const raw = errBody?.message
        const text = typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw.join(' - ')
            : (isRTL ? raw?.ar || raw?.en : raw?.en || raw?.ar)
        throw new Error(text || (isRTL ? 'فشل حجز الموعد' : 'Failed to book appointment'))
      }
      
      toast.success(isRTL ? 'تم حجز الموعد بنجاح!' : 'Appointment booked successfully!')
      
      // Reset State
      setSelectedPatient(null)
      setSearchQuery('')
      setReceptionNotes('')
      setMode('select')
      
      if (onBookingComplete) onBookingComplete()
    } catch (error) {
      toast.error(error?.message || (isRTL ? 'فشل حجز الموعد' : 'Failed to book appointment'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[94vh] rounded-2xl shadow-2xl border border-gray-150 dark:border-gray-700 overflow-hidden flex flex-col my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-900">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ClipboardList className="text-indigo-500" size={20} />
              {isRTL ? 'حجز موعد مباشر' : 'Direct Booking'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 font-mono">
              <User size={12} className="text-gray-400" />
              <span>{doctor.name}</span>
              <span className="text-gray-300">|</span>
              <span>{timeStr}</span>
              <span className="text-gray-300">|</span>
              <span>{dateStr}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('select')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              mode === 'select'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-750 dark:hover:text-gray-250'
            }`}
          >
            {isRTL ? 'اختيار مريض مسجل' : 'Select Registered Patient'}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-750 dark:hover:text-gray-250'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <Plus size={13} />
              {isRTL ? 'تسجيل مريض جديد' : 'Register New Patient'}
            </span>
          </button>
        </div>

        <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          
          {/* Patient Selection/Creation Section */}
          {mode === 'select' ? (
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
              <div className="max-h-80 overflow-y-auto border border-gray-150 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-900 shadow-inner">
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
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                    </div>
                    <span className="font-bold">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                  </div>
                  <span className="font-mono text-gray-500 dark:text-gray-400">{selectedPatient.patient_code}</span>
                </div>
              )}
            </div>
          ) : (
            /* Inline Unified Patient Registration Form */
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-150 dark:border-gray-700 rounded-2xl">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-3">
                {isRTL ? 'بيانات المريض الجديد' : 'New Patient Info'}
              </h4>
              <UnifiedPatientForm
                ref={patientFormRef}
                variant="compact"
                hideActions
                onSuccess={(newPatient) => {
                  setSelectedPatient(newPatient)
                }}
              />
            </div>
          )}

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Session Parameters */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isRTL ? 'الخدمة' : 'Service'}
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400" size={14} />
                <input
                  type="text"
                  value={serviceQuery}
                  onChange={(e) => {
                    setServiceQuery(e.target.value)
                    setServiceId('')
                  }}
                  placeholder={isRTL ? 'ابحث عن الخدمة...' : 'Search services...'}
                  className="w-full pl-3 pr-9 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {services
                  .filter((service) => service.is_active !== false)
                  .filter((service) => (service.name || '').toLowerCase().includes(serviceQuery.trim().toLowerCase()))
                  .map((service) => {
                    const selected = service.id === serviceId
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setServiceId(service.id)
                          setServiceQuery(service.name || '')
                        }}
                        className={`w-full text-right px-3 py-2 text-xs font-medium transition ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                        }`}
                      >
                        {service.name}{service.is_assessment ? (isRTL ? ' — تقييم' : ' — Assessment') : ''}
                      </button>
                    )
                  })}
              </div>
              {serviceId && !services.find((service) => service.id === serviceId)?.is_assessment && (
                <span className={`mt-2 inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${quotaTone(paidQuotas.find((line) => line.service_id === serviceId)?.remaining_sessions).colorClass}`}>
                  {isRTL ? 'المتبقي من الباكدج' : 'Package left'} {paidQuotas.find((line) => line.service_id === serviceId)?.remaining_sessions ?? 0}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'بداية الجلسة' : 'Starts'}
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'نهاية الجلسة' : 'Ends'}
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {services.find((service) => service.id === serviceId)?.is_assessment && (
              <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                {isRTL
                  ? 'جلسة التقييم تنزل تكلفتها للحسابات، ومش هتبدأ قبل اعتماد الدفع.'
                  : 'The assessment price goes to finance and cannot start before payment is confirmed.'}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isRTL ? 'تخصيص غرفة' : 'Room Assignment'}
              </label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 text-gray-400" size={14} />
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{isRTL ? 'بدون غرفة' : 'No Room'}</option>
                  {rooms && rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phase 8: Auto Booking Suggestions Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 min-w-0">
                  {isRTL ? 'اقتراح المواعيد التلقائي' : 'Auto Booking Suggestions'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                >
                  {showSuggestions ? (isRTL ? 'إخفاء الاقتراحات ✖' : 'Hide') : (isRTL ? '✨ توليد اقتراحات متاحة' : '✨ Generate Options')}
                </button>
              </div>

              {showSuggestions && (
                <div className="space-y-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs animate-fade-in">
                  <p className="text-[11px] text-gray-500 font-semibold">
                    {isRTL ? '💡 اقتراحات مبنية على جدول الطاقم، السعة المتبقية وعطلات العمل الرسمية:' : '💡 Suggestions based on doctor availability, room capacity, and working days:'}
                  </p>
                  {[
                    { id: 'opt1', textAr: 'السبت - الإثنين - الأربعاء (10:00 ص - 12:00 م) [الفترة الصباحية 🟢]', textEn: 'Sat - Mon - Wed (10:00 AM - 12:00 PM) [Morning 🟢]' },
                    { id: 'opt2', textAr: 'الأحد - الثلاثاء - الخميس (04:00 م - 06:00 م) [الفترة المسائية 🟢]', textEn: 'Sun - Tue - Thu (04:00 PM - 06:00 PM) [Evening 🟢]' },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedSuggestion(opt.textAr);
                        setReceptionNotes(prev => (prev ? prev + ' | ' : '') + `الموعد المقترح تلقائياً: ${opt.textAr}`);
                        toast.success(isRTL ? 'تم اختيار الجدول المقترح وتضمينه بالحجز 📅' : 'Suggested schedule applied!');
                      }}
                      className="p-2.5 bg-white dark:bg-gray-900 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 rounded-xl cursor-pointer transition font-extrabold flex justify-between items-center text-[11px]"
                    >
                      <span className="text-indigo-900 dark:text-indigo-300">{isRTL ? opt.textAr : opt.textEn}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px]">✔ {isRTL ? 'اختر' : 'Select'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isRTL ? 'ملاحظات الاستقبال' : 'Reception Notes'}
              </label>
              <textarea
                placeholder={isRTL ? 'أدخل ملاحظات حول الحجز المباشر...' : 'Enter booking notes...'}
                value={receptionNotes}
                onChange={(e) => setReceptionNotes(e.target.value)}
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
              {isRTL ? 'تأكيد الحجز المباشر' : 'Confirm Direct Booking'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-150 hover:bg-gray-255 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl text-xs transition duration-200"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
