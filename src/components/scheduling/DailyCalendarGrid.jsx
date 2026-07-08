import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, User, Plus, MapPin, Search, Filter, Clock, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import DirectBookingModal from './DirectBookingModal'
import AddPatientModal from '../common/AddPatientModal'

export default function DailyCalendarGrid({ selectedWaitlistEntry, onAssignComplete, onViewSession, refreshTrigger }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [doctors, setDoctors] = useState([])
  const [sessions, setSessions] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [assigningSlot, setAssigningSlot] = useState(null)
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [directBookingSlot, setDirectBookingSlot] = useState(null)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedShift, setSelectedShift] = useState('all') // 'all', 'morning', 'evening'

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

  // Time slots from 08:00 to 21:30 (half-hour intervals)
  let timeSlots = []
  for (let hour = 8; hour < 22; hour++) {
    const hh = String(hour).padStart(2, '0')
    timeSlots.push(`${hh}:00`)
    timeSlots.push(`${hh}:30`)
  }

  if (selectedShift === 'morning') {
    timeSlots = timeSlots.filter(t => {
      const hour = parseInt(t.split(':')[0], 10)
      return hour >= 8 && hour < 15 // 08:00 to 14:30
    })
  } else if (selectedShift === 'evening') {
    timeSlots = timeSlots.filter(t => {
      const hour = parseInt(t.split(':')[0], 10)
      return hour >= 15 && hour < 22 // 15:00 to 21:30
    })
  }

  // Extract unique specializations
  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))]

  // Filtered Doctors
  const filteredDoctors = doctors.filter(doc => {
    const nameMatch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const specMatch = !selectedSpecialization || doc.specialization === selectedSpecialization
    return nameMatch && specMatch
  })

  // Initials Helper
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [selectedDate, refreshTrigger])

  const fetchInitialData = async () => {
    const token = localStorage.getItem('mcsos_token')
    try {
      // 1. Fetch Doctors
      const docsRes = await fetch(`${API_BASE}/doctors?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDoctors(docsData.data || docsData)
      }

      // 2. Fetch Rooms
      const roomsRes = await fetch(`${API_BASE}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        setRooms(roomsData)
      }
    } catch (error) {
      console.error('Error fetching initial grid data:', error)
    }
  }

  const fetchSessions = async () => {
    setLoading(true)
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}/sessions/date/${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  // Find session for a doctor and time slot
  const findSession = (doctorId, timeStr) => {
    return sessions.find(s => {
      const sDocId = s.doctor_id || s.doctor?.id
      if (sDocId !== doctorId) return false
      
      const sessionDateObj = new Date(s.session_date)
      const hours = sessionDateObj.getHours().toString().padStart(2, '0')
      const minutes = sessionDateObj.getMinutes().toString().padStart(2, '0')
      const sessionTime = `${hours}:${minutes}`
      
      return sessionTime === timeStr
    })
  }

  // Handle cell click for waitlist assignment or direct booking
  const handleCellClick = (doctor, timeStr) => {
    if (!selectedWaitlistEntry) {
      setDirectBookingSlot({ doctor, timeStr, dateStr: selectedDate })
      return
    }
    
    // Set the assigning slot state to open the Room selection dialog
    setAssigningSlot({ doctor, timeStr })
    if (rooms.length > 0) {
      setSelectedRoomId(rooms[0].id)
    }
  }

  const handleConfirmAssignment = async () => {
    if (!assigningSlot || !selectedWaitlistEntry) return
    
    const { doctor, timeStr } = assigningSlot
    const token = localStorage.getItem('mcsos_token')
    
    // Build slot date-time
    const [hours, minutes] = timeStr.split(':')
    const sessionDate = new Date(selectedDate)
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    try {
      setLoading(true)
      
      // Step 1: Assign waitlist to session
      const response = await fetch(`${API_BASE}/waitlist/${selectedWaitlistEntry.id}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slot_id: null,
          session_date: sessionDate.toISOString(),
          doctor_id: doctor.id
        })
      })

      if (!response.ok) throw new Error()
      const result = await response.json()
      
      // Step 2: Assign room if selected
      if (selectedRoomId && result.session?.id) {
        await fetch(`${API_BASE}/sessions/${result.session.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            room_id: selectedRoomId,
            doctor_id: doctor.id // update preferred doctor if needed
          })
        })
      }

      toast.success(isRTL ? 'تم تعيين الجلسة بنجاح!' : 'Session assigned successfully!')
      setAssigningSlot(null)
      fetchSessions()
      if (onAssignComplete) onAssignComplete()
    } catch (error) {
      toast.error(isRTL ? 'فشل تعيين الجلسة' : 'Failed to assign session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Grid Header Controls */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-indigo-500" size={20} />
            <span className="font-extrabold text-gray-800 dark:text-white text-base">
              {isRTL ? 'الجدول اليومي للمركز' : 'Medical Center Daily Schedule'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Selector */}
            <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={handlePrevDay} 
                className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700"
              >
                <ChevronRight size={16} />
              </button>
              
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border-0 bg-transparent text-sm font-bold dark:text-white focus:ring-0 outline-none cursor-pointer"
              />

              <button 
                onClick={handleNextDay} 
                className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <button 
              onClick={fetchSessions} 
              disabled={loading}
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition text-xs font-bold shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </button>

            <button 
              onClick={() => setShowAddPatientModal(true)} 
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 rounded-xl hover:shadow-indigo-500/50 flex items-center gap-2 transition-all duration-300 text-xs font-bold"
            >
              <UserPlus size={16} />
              <span>{isRTL ? 'مريض جديد' : 'Add new Patient'}</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-3 items-center pt-3 border-t border-gray-200/40 dark:border-gray-700/50">
          {/* Search Doctor */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isRTL ? 'البحث عن طبيب بالاسم...' : 'Search doctor by name...'}
              className="w-full pr-9 pl-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          {/* Specialization Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute right-3 top-2.5 text-gray-400" size={16} />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm appearance-none"
            >
              <option value="">{isRTL ? 'كل التخصصات' : 'All Specializations'}</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div className="relative min-w-[200px]">
            <Clock className="absolute right-3 top-2.5 text-gray-400" size={16} />
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm appearance-none"
            >
              <option value="all">{isRTL ? 'اليوم بالكامل' : 'Full Day'}</option>
              <option value="morning">{isRTL ? 'شيفت صباحي' : 'Morning Shift'}</option>
              <option value="evening">{isRTL ? 'شيفت مسائي' : 'Evening Shift'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto relative max-h-[65vh]">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800">
            <User size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
              {isRTL ? 'لم يتم العثور على أطباء يطابقون خيارات التصفية' : 'No doctors matching the filter criteria found'}
            </p>
          </div>
        ) : (
          <table 
            className="w-full border-collapse border-spacing-0 table-fixed"
            style={{ minWidth: `${80 + filteredDoctors.length * 180}px` }}
          >
            {/* Header row (Doctors) */}
            <thead>
              <tr className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
                <th className="w-[80px] min-w-[80px] p-3 text-xs font-bold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-900 z-30 text-center">
                  {isRTL ? 'الوقت' : 'Time'}
                </th>
                {filteredDoctors.map(doc => (
                  <th key={doc.id} className="w-[180px] min-w-[180px] p-3 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
                      <span className="text-xs font-extrabold text-gray-800 dark:text-gray-150 block truncate max-w-[150px]">
                        {doc.name}
                      </span>
                    </div>
                    {doc.specialization && (
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full inline-block truncate max-w-[160px] mt-0.5 border border-indigo-100/50 dark:border-indigo-900/30">
                        {doc.specialization}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Time Rows */}
            <tbody>
              {timeSlots.map(timeStr => (
                <tr key={timeStr} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/40 dark:hover:bg-gray-800/10">
                  {/* Time header */}
                  <td className="p-3 text-center text-xs font-mono font-extrabold text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    {timeStr}
                  </td>

                  {/* Doctor cells */}
                  {filteredDoctors.map(doc => {
                    const session = findSession(doc.id, timeStr)
                    
                    return (
                      <td 
                        key={doc.id}
                        onClick={() => !session && handleCellClick(doc, timeStr)}
                        className={`w-[180px] min-w-[180px] p-2 border-r border-gray-200 dark:border-gray-700 text-center relative ${
                          !session 
                            ? selectedWaitlistEntry
                              ? 'hover:bg-indigo-50/40 dark:hover:bg-indigo-950/5 cursor-pointer bg-indigo-50/5 dark:bg-indigo-950/2'
                              : 'cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/10'
                            : ''
                        }`}
                      >
                        {session ? (
                          /* Booked session card */
                          <div 
                            onClick={(e) => {
                              e.stopPropagation()
                              onViewSession(session)
                            }}
                            className={`p-2.5 rounded-xl text-right border text-xs shadow-sm cursor-pointer transition duration-300 transform hover:scale-[1.02] hover:shadow-md flex flex-col justify-between border-l-4 h-full min-h-[55px] ${
                              session.confirm_status === 'CONFIRMED' 
                                ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300 border-l-emerald-500' 
                                : session.confirm_status === 'DECLINED'
                                ? 'bg-rose-50/90 border-rose-200/80 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300 border-l-rose-500'
                                : 'bg-amber-50/90 border-amber-200/80 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300 border-l-amber-500'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold flex items-center justify-center shrink-0">
                                {getInitials(session.patient ? `${session.patient.first_name} ${session.patient.last_name}` : 'N A')}
                              </div>
                              <div className="font-extrabold truncate text-gray-800 dark:text-white text-[11px] leading-tight">
                                {session.patient ? `${session.patient.first_name} ${session.patient.last_name}` : 'N/A'}
                              </div>
                            </div>
                            
                            {session.room && (
                              <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 dark:text-gray-400 mt-1.5 font-semibold bg-white/40 dark:bg-black/10 px-1.5 py-0.5 rounded w-max self-end font-mono">
                                <span>{session.room.name || session.room.code}</span>
                                <MapPin size={9} className="text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>
                        ) : selectedWaitlistEntry ? (
                          /* Interactive cell in assign mode */
                          <div className="border border-dashed border-indigo-300 hover:border-indigo-500 dark:border-indigo-800 dark:hover:border-indigo-600 rounded-xl p-2.5 text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition duration-300 flex items-center justify-center gap-1 shadow-sm">
                            <Plus size={12} className="shrink-0" />
                            <span>{isRTL ? 'تسكين' : 'Assign'}</span>
                          </div>
                        ) : (
                          /* Interactive cell in direct booking mode */
                          <div className="group/cell h-full min-h-[55px] flex items-center justify-center relative p-1">
                            <div className="opacity-0 group-hover/cell:opacity-100 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:border-transparent rounded-xl p-2 w-full h-full text-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:shadow-indigo-500/20">
                              <Plus size={14} className="shrink-0" />
                              <span>{isRTL ? 'حجز مباشر' : 'Book'}</span>
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Room Selection Popup Modal during assignment */}
      {assigningSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
              {isRTL ? 'تخصيص غرفة للجلسة' : 'Assign Room for Session'}
            </h4>
            
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              {isRTL 
                ? `تسكين الجلسة عند الأخصائي/الطبيب ${assigningSlot.doctor.name} في تمام الساعة ${assigningSlot.timeStr}`
                : `Assigning session with Dr. ${assigningSlot.doctor.name} at ${assigningSlot.timeStr}`}
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                {isRTL ? 'اختر الغرفة' : 'Select Room'}
              </label>
              <select 
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              >
                <option value="">{isRTL ? 'بدون غرفة' : 'No Room'}</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleConfirmAssignment}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-xl text-sm transition"
              >
                {isRTL ? 'تأكيد التسكين' : 'Confirm'}
              </button>
              <button 
                onClick={() => setAssigningSlot(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-xl text-sm transition"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Direct Booking Modal */}
      <DirectBookingModal
        isOpen={!!directBookingSlot}
        onClose={() => setDirectBookingSlot(null)}
        slotInfo={directBookingSlot}
        rooms={rooms}
        onBookingComplete={() => {
          setDirectBookingSlot(null)
          fetchSessions()
        }}
      />

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onPatientAdded={(newPatient) => {
          // You could potentially open the direct booking modal with this new patient 
          // or just show success, the modal already handles the toast.
        }}
      />
    </div>
  )
}
