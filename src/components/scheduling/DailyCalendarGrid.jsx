// src/components/scheduling/DailyCalendarGrid.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, User, Plus, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DailyCalendarGrid({ selectedWaitlistEntry, onAssignComplete, onViewSession }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [doctors, setDoctors] = useState([])
  const [sessions, setSessions] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [assigningSlot, setAssigningSlot] = useState(null)
  const [selectedRoomId, setSelectedRoomId] = useState('')

  const API_BASE = 'https://medical-center-app-production.up.railway.app/api/v1'

  // Time slots from 08:00 to 21:30 (half-hour intervals)
  const timeSlots = []
  for (let hour = 8; hour < 22; hour++) {
    const hh = String(hour).padStart(2, '0')
    timeSlots.push(`${hh}:00`)
    timeSlots.push(`${hh}:30`)
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [selectedDate])

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
      if (s.doctor_id !== doctorId) return false
      const sessionTime = new Date(s.session_date).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
      // Match by comparing first 5 characters (HH:MM)
      return sessionTime.startsWith(timeStr)
    })
  }

  // Handle cell click for waitlist assignment
  const handleCellClick = (doctor, timeStr) => {
    if (!selectedWaitlistEntry) return
    
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
          session_date: sessionDate.toISOString()
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
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/10">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-blue-500" size={20} />
          <span className="font-bold text-gray-800 dark:text-white">
            {isRTL ? 'الجدول اليومي للمركز' : 'Medical Center Daily Schedule'}
          </span>
        </div>
        
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
            className="p-2 border-0 bg-transparent text-sm font-semibold dark:text-white focus:ring-0 outline-none cursor-pointer"
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
          className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition text-xs font-semibold shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {isRTL ? 'تحديث الجدول' : 'Refresh Grid'}
        </button>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto relative max-h-[65vh]">
        <table className="w-full border-collapse border-spacing-0 table-fixed min-w-[700px]">
          {/* Header row (Doctors) */}
          <thead>
            <tr className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th className="w-20 p-3 text-xs font-bold text-gray-400 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-900 z-30">
                {isRTL ? 'الوقت' : 'Time'}
              </th>
              {doctors.map(doc => (
                <th key={doc.id} className="p-3 text-center border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block truncate max-w-[120px]">
                      {doc.name}
                    </span>
                  </div>
                  {doc.specialization && (
                    <span className="text-[10px] text-gray-400 font-normal block truncate mt-0.5">
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
              <tr key={timeStr} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/20 dark:hover:bg-gray-800/10">
                {/* Time header */}
                <td className="p-2 text-center text-xs font-mono font-bold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-850 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                  {timeStr}
                </td>

                {/* Doctor cells */}
                {doctors.map(doc => {
                  const session = findSession(doc.id, timeStr)
                  
                  return (
                    <td 
                      key={doc.id}
                      onClick={() => !session && handleCellClick(doc, timeStr)}
                      className={`p-1.5 border-r border-gray-100 dark:border-gray-800 text-center relative ${
                        !session && selectedWaitlistEntry
                          ? 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 cursor-pointer border-dashed border-indigo-200 dark:border-indigo-850'
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
                          className={`p-2 rounded-lg text-right border text-xs shadow-sm cursor-pointer transition transform hover:scale-[1.01] ${
                            session.confirm_status === 'CONFIRMED' 
                              ? 'bg-green-50/70 border-green-200 text-green-800 dark:bg-green-950/15 dark:border-green-900/30 dark:text-green-300' 
                              : session.confirm_status === 'DECLINED'
                              ? 'bg-red-50/70 border-red-200 text-red-800 dark:bg-red-950/15 dark:border-red-900/30 dark:text-red-300'
                              : 'bg-yellow-50/70 border-yellow-200 text-yellow-800 dark:bg-yellow-950/15 dark:border-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          <div className="font-bold truncate">
                            {session.patient ? `${session.patient.first_name} ${session.patient.last_name}` : 'N/A'}
                          </div>
                          
                          {session.room && (
                            <div className="flex items-center justify-end gap-0.5 text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                              <span>{session.room.name || session.room.code}</span>
                              <MapPin size={9} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      ) : selectedWaitlistEntry ? (
                        /* Interactive cell in assign mode */
                        <div className="border border-dashed border-indigo-300 dark:border-indigo-800 rounded-lg p-2 text-center text-[10px] font-semibold text-indigo-500 hover:bg-indigo-600 hover:text-white transition">
                          <Plus size={10} className="inline mr-1" />
                          {isRTL ? 'تعيين' : 'Assign'}
                        </div>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  )
}
