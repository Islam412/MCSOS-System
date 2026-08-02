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
    fullName: '',
    phone: '',
    whatsapp_number: '',
    sameAsPhone: true,
    referral_source: '',
    national_id_front: '',
    national_id_back: '',
    national_id_photo: '',
    gender: 'male',
    date_of_birth: '',
    nationality: 'مصري - Egypt',
    occupation: ''
  })

  const calculateAge = (dob) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age > 0 ? age : 0
  }

  const currentAge = calculateAge(regForm.date_of_birth)
  
  // Booking Fields
  const [sessionType, setSessionType] = useState('TREATMENT')
  const [scheduledDuration, setScheduledDuration] = useState(60)
  const [roomId, setRoomId] = useState('')
  const [receptionNotes, setReceptionNotes] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  
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
    if (!regForm.fullName.trim() || !regForm.phone) {
      toast.error(isRTL ? 'الرجاء إدخال الاسم الكامل ورقم الهاتف' : 'Please enter full name and phone number')
      return null
    }

    if (!regForm.national_id_front) {
      toast.error(isRTL ? 'الرجاء رفع صورة الوجه الأمامي للهوية الوطنية (إلزامي)' : 'Please upload Front view of National ID (Required)')
      return null
    }
    
    const nameParts = regForm.fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || 'مريض'
    const lastName = nameParts.slice(1).join(' ') || nameParts[0]
    
    const token = localStorage.getItem('mcsos_token')
    try {
      setLoading(true)
      const payload = {
        first_name: firstName,
        last_name: lastName,
        full_name_ar: regForm.fullName.trim(),
        phone: regForm.phone.trim(),
        whatsapp_number: regForm.sameAsPhone ? regForm.phone.trim() : (regForm.whatsapp_number.trim() || regForm.phone.trim()),
        referral_source: regForm.referral_source || undefined,
        national_id_front: regForm.national_id_front || undefined,
        national_id_back: regForm.national_id_back || undefined,
        national_id_photo: regForm.national_id_front || regForm.national_id_photo || undefined,
        gender: regForm.gender || 'male',
        date_of_birth: regForm.date_of_birth || undefined,
        nationality: regForm.nationality || 'Egypt',
        occupation: regForm.occupation || undefined,
        age: currentAge !== null ? currentAge : undefined
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
          scheduled_duration_minutes: sessionType === 'ASSESSMENT' ? scheduledDuration : 45,
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
      setRegForm({
        fullName: '',
        phone: '',
        whatsapp_number: '',
        sameAsPhone: true,
        referral_source: '',
        national_id_front: '',
        national_id_back: '',
        national_id_photo: '',
        gender: 'male',
        date_of_birth: '',
        nationality: 'مصري - Egypt',
        occupation: ''
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
              
              <div>
                <input
                  type="text"
                  required
                  placeholder={isRTL ? 'الاسم الكامل *' : 'Full Name *'}
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-gray-800 dark:text-white"
                />
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
                <select
                  value={regForm.referral_source || ''}
                  onChange={(e) => setRegForm({ ...regForm, referral_source: e.target.value })}
                  className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 dark:text-gray-200"
                >
                  <option value="">{isRTL ? 'جهة التحويل (كيف عرفتنا؟)' : 'Referral Source'}</option>
                  <option value="Social Media">{isRTL ? 'سوشيال ميديا (Social Media)' : 'Social Media'}</option>
                  <option value="Google Search">{isRTL ? 'بحث جوجل (Google Search)' : 'Google Search'}</option>
                  <option value="Friend">{isRTL ? 'ترشيح صديق / أقارب' : 'Friend / Family'}</option>
                  <option value="Doctor Referral">{isRTL ? 'تحويل طبيب' : 'Doctor Referral'}</option>
                  <option value="Advertisement">{isRTL ? 'إعلانات' : 'Advertisement'}</option>
                  <option value="Walk-in">{isRTL ? 'زيارة مباشرة' : 'Walk-in'}</option>
                  <option value="Other">{isRTL ? 'أخرى' : 'Other'}</option>
                </select>
              </div>

              {/* Nationality & Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    list="direct_nationalities"
                    placeholder={isRTL ? 'الجنسية (إلزامي)...' : 'Nationality *...'}
                    value={regForm.nationality || ''}
                    onChange={(e) => setRegForm({ ...regForm, nationality: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-gray-800 dark:text-white"
                  />
                  <datalist id="direct_nationalities">
                    <option value="مصري - Egypt" />
                    <option value="سعودي - Saudi Arabia" />
                    <option value="إماراتي - UAE" />
                    <option value="كويتي - Kuwait" />
                    <option value="قطري - Qatar" />
                    <option value="أردني - Jordan" />
                    <option value="سوري - Syria" />
                    <option value="لبناني - Lebanon" />
                    <option value="عراقي - Iraq" />
                    <option value="فلسطيني - Palestine" />
                    <option value="أجنبي / آخر - Other" />
                  </datalist>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder={isRTL ? 'الوظيفة (اختياري)...' : 'Occupation (Optional)...'}
                    value={regForm.occupation || ''}
                    onChange={(e) => setRegForm({ ...regForm, occupation: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-white"
                  />
                </div>
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
                  {currentAge !== null && (
                    <div className="mt-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md inline-block">
                      🎂 {isRTL ? `العمر محسوب: ${currentAge} سنة` : `Auto Age: ${currentAge} Yrs`}
                    </div>
                  )}
                </div>
              </div>

              {/* National ID Front & Back */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-[11px] font-bold text-gray-400">
                  {isRTL ? 'صورة الهوية الوطنية / البطاقة الشخصية' : 'National ID Copy'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                    <span className="block text-[10px] font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      <span>{isRTL ? '• الوجه الأمامي (Front)' : '• Front View'}</span>
                      <span className="text-red-500 font-bold">* ({isRTL ? 'إلزامي' : 'Required'})</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="w-full text-[10px] text-gray-500 dark:text-gray-400 file:mr-1 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error(isRTL ? 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت' : 'File size must not exceed 5MB')
                            return
                          }
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setRegForm({ ...regForm, national_id_front: reader.result })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      disabled={loading}
                    />
                    {regForm.national_id_front && (
                      <div className="relative w-full h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-700 mt-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {regForm.national_id_front.includes('application/pdf') ? (
                          <div className="text-center p-1">
                            <span className="text-xl block">📄</span>
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">PDF Document</span>
                          </div>
                        ) : (
                          <img src={regForm.national_id_front} alt="ID Front" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, national_id_front: '' })}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                    <span className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {isRTL ? '• الوجه الخلفي (Back - اختياري)' : '• Back View (Optional)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="w-full text-[10px] text-gray-500 dark:text-gray-400 file:mr-1 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error(isRTL ? 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت' : 'File size must not exceed 5MB')
                            return
                          }
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setRegForm({ ...regForm, national_id_back: reader.result })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      disabled={loading}
                    />
                    {regForm.national_id_back && (
                      <div className="relative w-full h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-700 mt-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {regForm.national_id_back.includes('application/pdf') ? (
                          <div className="text-center p-1">
                            <span className="text-xl block">📄</span>
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">PDF Document</span>
                          </div>
                        ) : (
                          <img src={regForm.national_id_back} alt="ID Back" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, national_id_back: '' })}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

            {sessionType === 'ASSESSMENT' && (
              <div className="col-span-2 p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2 shadow-xs transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300">
                    {isRTL ? '⏱️ مدة التقييم المجدولة (للمراقبة الآلية):' : '⏱️ Scheduled Assessment Duration:'}
                  </span>
                  <select
                    value={scheduledDuration}
                    onChange={(e) => setScheduledDuration(Number(e.target.value))}
                    className="py-1.5 px-2.5 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-200 outline-none shadow-xs"
                  >
                    <option value={30}>{isRTL ? '30 دقيقة' : '30 Minutes'}</option>
                    <option value={60}>{isRTL ? '60 دقيقة (قياسي)' : '60 Minutes (Standard)'}</option>
                    <option value={90}>{isRTL ? '90 دقيقة' : '90 Minutes'}</option>
                  </select>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                  {isRTL 
                    ? '⚠️ تنبيه: جلسة التقييم الطبي ستتطلب اعتماد وتأكيد الدفعة المالية من قِبل قسم الحسابات ولن تُفتح لبدء التنفيذ دون التحقق.' 
                    : '⚠️ Note: Assessment session requires financial verification from Finance department before starting.'}
                </p>
              </div>
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  🤖 {isRTL ? 'اقتراح المواعيد التلقائي الذكي (Phase 8)' : 'Auto Booking Suggestions'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs"
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
