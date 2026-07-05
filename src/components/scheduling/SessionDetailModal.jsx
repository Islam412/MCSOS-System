// src/components/scheduling/SessionDetailModal.jsx
import { useState, useEffect } from 'react'
import { X, Clock, Check, Play, Square, AlertTriangle, ShieldCheck, MapPin, User, Stethoscope, FileText, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function SessionDetailModal({ isOpen, onClose, session, onUpdate }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState({
    doctorNotes: session?.doctor_notes || '',
    receptionNotes: session?.reception_notes || ''
  })
  
  const [doctors, setDoctors] = useState([])
  const [rooms, setRooms] = useState([])
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    doctorId: '',
    date: '',
    time: '',
    roomId: ''
  })

  useEffect(() => {
    if (session) {
      const d = new Date(session.session_date)
      const hours = d.getHours().toString().padStart(2, '0')
      const minutes = d.getMinutes().toString().padStart(2, '0')
      setRescheduleData({
        doctorId: session.doctor?.id || session.doctor_id || '',
        date: d.toISOString().split('T')[0],
        time: `${hours}:${minutes}`,
        roomId: session.room?.id || session.room_id || ''
      })
    }
  }, [session])

  useEffect(() => {
    if (isOpen) {
      fetchDoctorsAndRooms()
    }
  }, [isOpen])

  const fetchDoctorsAndRooms = async () => {
    const token = localStorage.getItem('mcsos_token')
    try {
      const docsRes = await fetch(`${API_BASE}/doctors?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDoctors(docsData.data || docsData)
      }

      const roomsRes = await fetch(`${API_BASE}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        setRooms(roomsData)
      }
    } catch (error) {
      console.error('Error fetching doctors/rooms in modal:', error)
    }
  }

  const handleRescheduleConfirm = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error(isRTL ? 'الرجاء تحديد التاريخ والوقت' : 'Please select date and time')
      return
    }

    const [hours, minutes] = rescheduleData.time.split(':')
    const sessionDate = new Date(rescheduleData.date)
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    try {
      await handleAction('update', {
        doctor_id: rescheduleData.doctorId || null,
        room_id: rescheduleData.roomId || null,
        session_date: sessionDate.toISOString()
      })
      setIsRescheduling(false)
    } catch (error) {
      console.error(error)
    }
  }

  const userStr = localStorage.getItem('mcsos_user')
  const currentUser = userStr ? JSON.parse(userStr) : null
  const isAdmin = currentUser?.role === 'admin'

  if (!isOpen || !session) return null

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

  const handleAction = async (actionType, body = {}) => {
    setSubmitting(true)
    const token = localStorage.getItem('mcsos_token')
    let url = `${API_BASE}/sessions/${session.id}`
    let method = 'PUT'

    if (actionType === 'confirm') {
      url = `${API_BASE}/sessions/${session.id}/confirm`
    } else if (actionType === 'start') {
      url = `${API_BASE}/sessions/${session.id}/start`
      method = 'POST'
    } else if (actionType === 'end') {
      url = `${API_BASE}/sessions/${session.id}/end`
      method = 'POST'
    } else if (actionType === 'cancel') {
      url = `${API_BASE}/sessions/${session.id}`
      method = 'PUT'
      body = { status: 'CANCELED' }
    } else if (actionType === 'delete') {
      url = `${API_BASE}/sessions/${session.id}`
      method = 'DELETE'
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        throw new Error('فشلت العملية')
      }

      const updatedSession = method === 'DELETE' ? null : await response.json()
      toast.success(isRTL ? 'تمت العملية بنجاح' : 'Operation successful')
      if (onUpdate) onUpdate(updatedSession)
      if (method === 'DELETE' || body.status === 'CANCELED') {
        onClose()
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ أثناء التحديث')
    } finally {
      setSubmitting(false)
    }
  }

  const saveNotes = () => {
    handleAction('update', {
      doctor_notes: notes.doctorNotes,
      reception_notes: notes.receptionNotes
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            {isRTL ? 'تفاصيل الجلسة' : 'Session Details'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-white hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Patient info */}
          <div className="flex items-start gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-50 dark:border-blue-900/20">
            <div className="p-3 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20">
              <User size={22} />
            </div>
            <div className="flex-1">
              <span className="text-xs text-blue-500 font-semibold tracking-wider uppercase">
                {isRTL ? 'المريض' : 'Patient'}
              </span>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">
                {session.patient ? `${session.patient.first_name} ${session.patient.last_name}` : 'N/A'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                {session.patient?.patient_code}
              </p>
            </div>
          </div>

          {/* Details Grid or Rescheduling Form */}
          {isRescheduling ? (
            <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-xl space-y-3.5 border border-indigo-100/50 dark:border-indigo-900/30 animate-fade-in">
              <h5 className="text-xs font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
                {isRTL ? 'إعادة جدولة الموعد' : 'Reschedule Appointment'}
              </h5>
              
              <div className="space-y-3">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'الأخصائي / الطبيب' : 'Doctor'}</label>
                  <select
                    value={rescheduleData.doctorId}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, doctorId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">{isRTL ? 'بدون طبيب' : 'No Doctor'}</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'التاريخ' : 'Date'}</label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'الوقت' : 'Time'}</label>
                    <input
                      type="time"
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{isRTL ? 'الغرفة' : 'Room'}</label>
                  <select
                    value={rescheduleData.roomId}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, roomId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">{isRTL ? 'بدون غرفة' : 'No Room'}</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRescheduleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition"
                >
                  {isRTL ? 'تأكيد النقل' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="flex-1 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-750 dark:text-gray-200 font-semibold py-2.5 px-3 rounded-xl text-xs transition"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Doctor */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <Stethoscope className="text-purple-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'الطبيب' : 'Doctor'}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {session.doctor?.name || (isRTL ? 'غير محدد' : 'Not assigned')}
                    </p>
                  </div>
                </div>

                {/* Room */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <MapPin className="text-red-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'الغرفة' : 'Room'}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {session.room?.name || session.room?.code || (isRTL ? 'غير محدد' : 'Not assigned')}
                    </p>
                  </div>
                </div>

                {/* Confirmation status */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <ShieldCheck className="text-green-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'تأكيد الحجز' : 'Confirmation'}</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                      session.confirm_status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      session.confirm_status === 'DECLINED' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {session.confirm_status || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Payment status */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <CreditCard className="text-blue-500 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400">{isRTL ? 'حالة الدفع' : 'Payment Status'}</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                      session.is_deducted ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {session.is_deducted ? (isRTL ? 'مخصوم من الباقة' : 'Deducted') : (isRTL ? 'معلق' : 'Pending')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Tracking */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl space-y-3">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <Clock size={16} className="text-blue-500" />
                  {isRTL ? 'وقت الجلسة الفعلي' : 'Actual Session Duration'}
                </h5>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 block">{isRTL ? 'بدأت في' : 'Started at'}</span>
                    <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                      {formatTime(session.start_time)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 block">{isRTL ? 'انتهت في' : 'Ended at'}</span>
                    <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                      {formatTime(session.end_time)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

            <div className="flex gap-2 pt-2">
              {session.confirm_status !== 'CONFIRMED' && session.status !== 'CANCELED' && (
                <button
                  disabled={submitting}
                  onClick={() => handleAction('confirm', { confirm_status: 'CONFIRMED' })}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  <Check size={16} />
                  {isRTL ? 'تأكيد الحجز' : 'Confirm'}
                </button>
              )}

              {!session.start_time && session.status !== 'CANCELED' && (
                <button
                  type="button"
                  onClick={() => setIsRescheduling(true)}
                  className="flex-1 border border-indigo-200 hover:bg-indigo-50 text-indigo-650 dark:border-indigo-900/30 dark:hover:bg-indigo-950/20 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  {isRTL ? 'إعادة جدولة' : 'Reschedule'}
                </button>
              )}
              
              {session.start_time && !session.end_time && session.status !== 'CANCELED' ? (
                <button
                  disabled={submitting}
                  onClick={() => handleAction('end')}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  <Square size={16} />
                  {isRTL ? 'إنهاء الجلسة' : 'End Session'}
                </button>
              ) : null}
            </div>

            {/* Cancel and Delete Actions */}
            {session.status !== 'CANCELED' && !session.end_time && (
              <div className="flex gap-2 pt-1">
                <button
                  disabled={submitting}
                  onClick={() => {
                    if (window.confirm(isRTL ? 'هل أنت متأكد من إلغاء هذه الجلسة؟' : 'Are you sure you want to cancel this session?')) {
                      handleAction('cancel')
                    }
                  }}
                  className="flex-1 border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:hover:bg-rose-950/20 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                >
                  {isRTL ? 'إلغاء الموعد' : 'Cancel Appointment'}
                </button>

                {isAdmin && (
                  <button
                    disabled={submitting}
                    onClick={() => {
                      if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الجلسة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete this session? This action cannot be undone.')) {
                        handleAction('delete')
                      }
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                  >
                    {isRTL ? 'حذف نهائي' : 'Delete'}
                  </button>
                )}
              </div>
            )}

          {/* Notes Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                <FileText size={14} />
                {isRTL ? 'ملاحظات الطبيب' : 'Doctor Notes'}
              </label>
              <textarea
                className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows="2"
                value={notes.doctorNotes}
                onChange={(e) => setNotes({ ...notes, doctorNotes: e.target.value })}
                placeholder={isRTL ? 'أكتب ملاحظات الطبيب هنا...' : 'Enter doctor notes...'}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                <FileText size={14} />
                {isRTL ? 'ملاحظات الاستقبال' : 'Reception Notes'}
              </label>
              <textarea
                className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows="2"
                value={notes.receptionNotes}
                onChange={(e) => setNotes({ ...notes, receptionNotes: e.target.value })}
                placeholder={isRTL ? 'أكتب ملاحظات الاستقبال هنا...' : 'Enter reception notes...'}
              />
            </div>
            <button
              onClick={saveNotes}
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl font-semibold transition"
            >
              {isRTL ? 'حفظ الملاحظات' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
