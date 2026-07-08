// src/components/scheduling/DirectBookingModal.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Search, Plus, User, ClipboardList, MapPin, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

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
  
  // Registration Form States
  const [regForm, setRegForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    whatsapp_number: '',
    sameAsPhone: true,
    referral_source: '',
    national_id_photo: '',
    gender: 'male',
    date_of_birth: ''
  })
  
  // Booking Fields
  const [sessionType, setSessionType] = useState('TREATMENT')
  const [roomId, setRoomId] = useState('')
  const [receptionNotes, setReceptionNotes] = useState('')
  
  const searchTimeoutRef = useRef(null)
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`
  
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setRoomId(rooms[0].id)
    }
  }, [rooms])

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

  if (!isOpen || !slotInfo) return null
  const { doctor, timeStr, dateStr } = slotInfo

  // Handle register and submit
  const handleRegisterPatient = async () => {
    if (!regForm.first_name || !regForm.last_name) {
      toast.error(isRTL ? 'الرجاء إدخال الاسم الأول والأخير للمريض' : 'Please enter the first and last name of the patient')
      return null
    }
    
    const token = localStorage.getItem('mcsos_token')
    try {
      setLoading(true)
      const payload = {
        first_name: regForm.first_name,
        last_name: regForm.last_name,
        phone: regForm.phone,
        whatsapp_number: regForm.sameAsPhone ? regForm.phone : regForm.whatsapp_number || regForm.phone,
        referral_source: regForm.referral_source || '',
        national_id_photo: regForm.national_id_photo || '',
        gender: regForm.gender,
        date_of_birth: regForm.date_of_birth || undefined
      }
      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) throw new Error('Failed to register patient')
      const newPatient = await response.json()
      toast.success(isRTL ? 'تم تسجيل المريض بنجاح!' : 'Patient registered successfully!')
      return newPatient
    } catch (error) {
      toast.error(isRTL ? 'فشل تسجيل المريض الجديد' : 'Failed to register new patient')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    let targetPatientId = selectedPatient?.id
    
    if (mode === 'register') {
      const registered = await handleRegisterPatient()
      if (!registered) return
      targetPatientId = registered.id
    }
    
    if (!targetPatientId) {
      toast.error(isRTL ? 'الرجاء اختيار مريض أولاً' : 'Please select a patient first')
      return
    }

    const token = localStorage.getItem('mcsos_token')
    
    // Construct datetime
    const [hours, minutes] = timeStr.split(':')
    const sessionDate = new Date(dateStr)
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
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
          session_type: sessionType,
          session_date: sessionDate.toISOString(),
          room_id: roomId || null,
          reception_notes: receptionNotes || null
        })
      })

      if (!sessionResponse.ok) throw new Error()
      
      toast.success(isRTL ? 'تم حجز الموعد بنجاح!' : 'Appointment booked successfully!')
      
      // Reset State
      setSelectedPatient(null)
      setSearchQuery('')
      setReceptionNotes('')
      setMode('select')
      setRegForm({
        first_name: '',
        last_name: '',
        phone: '',
        gender: 'male',
        date_of_birth: ''
      })
      
      if (onBookingComplete) onBookingComplete()
    } catch (error) {
      toast.error(isRTL ? 'فشل حجز الموعد' : 'Failed to book appointment')
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

        <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
          
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
              <div className="max-h-[160px] overflow-y-auto border border-gray-150 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-900 shadow-inner">
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
            /* Inline Patient Registration Fields */
            <div className="space-y-3 p-3 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-150 dark:border-gray-700 rounded-xl">
              <label className="block text-xs font-bold text-gray-400 tracking-wider">
                {isRTL ? 'بيانات المريض الجديد' : 'New Patient Info'}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder={isRTL ? 'الاسم الأول *' : 'First Name *'}
                    value={regForm.first_name}
                    onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder={isRTL ? 'الاسم الأخير *' : 'Last Name *'}
                    value={regForm.last_name}
                    onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* خيار رقم الواتساب هو نفسه رقم الجوال */}
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="directAddSameAsPhone"
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-gray-700 border-gray-600"
                  checked={regForm.sameAsPhone}
                  onChange={(e) => setRegForm({ ...regForm, sameAsPhone: e.target.checked })}
                />
                <label htmlFor="directAddSameAsPhone" className="text-xs font-semibold text-gray-400 cursor-pointer">
                  {isRTL ? 'رقم الواتساب هو نفسه رقم الهاتف' : 'WhatsApp number is same as phone'}
                </label>
              </div>

              {!regForm.sameAsPhone && (
                <div>
                  <input
                    type="text"
                    placeholder={isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}
                    value={regForm.whatsapp_number}
                    onChange={(e) => setRegForm({ ...regForm, whatsapp_number: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder={isRTL ? 'جهة التحويل' : 'Referral Source'}
                  value={regForm.referral_source}
                  onChange={(e) => setRegForm({ ...regForm, referral_source: e.target.value })}
                  className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                    <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>
                <div>
                  <input
                    type="date"
                    value={regForm.date_of_birth}
                    onChange={(e) => setRegForm({ ...regForm, date_of_birth: e.target.value })}
                    className="w-full p-2.2 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* صورة البطاقة */}
              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isRTL ? 'صورة البطاقة' : 'National ID Photo'}</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error(isRTL ? 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت' : 'Image size must not exceed 5MB')
                        return
                      }
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setRegForm({ ...regForm, national_id_photo: reader.result })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                {regForm.national_id_photo && (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-700 mt-1">
                    <img src={regForm.national_id_photo} alt="National ID" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, national_id_photo: '' })}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Session Parameters */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isRTL ? 'نوع الجلسة' : 'Session Type'}
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TREATMENT">{isRTL ? 'جلسة علاج طبيعي' : 'Treatment Session'}</option>
                <option value="ASSESSMENT">{isRTL ? 'كشف / تقييم' : 'Assessment'}</option>
                <option value="FOLLOWUP">{isRTL ? 'متابعة' : 'Followup'}</option>
              </select>
            </div>

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
