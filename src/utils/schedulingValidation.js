// src/utils/schedulingValidation.js

/**
 * دالة التحقق من توفر الطبيب في الوقت المحدد
 */
export function validateDoctorAvailability(doctorId, startTime, endTime, sessions = [], excludeSessionId = null) {
  if (!doctorId || !startTime || !endTime) return { isValid: true, conflictSession: null }
  
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()

  const conflict = sessions.find(s => {
    if (excludeSessionId && (s.id === excludeSessionId || s._id === excludeSessionId)) return false
    if (s.status === 'CANCELLED' || s.status === 'MISSED') return false
    
    // فحص الطبيب
    const sDocId = s.doctor_id || s.doctor?.id
    if (sDocId && String(sDocId) !== String(doctorId)) return false

    const sStart = new Date(s.session_date || s.start_time || s.start).getTime()
    const sEnd = s.end_time || s.end ? new Date(s.end_time || s.end).getTime() : sStart + (45 * 60 * 1000)

    // تداخل المواعيد (Overlap check: start < sEnd && end > sStart)
    return start < sEnd && end > sStart
  })

  return {
    isValid: !conflict,
    conflictSession: conflict || null
  }
}

/**
 * دالة التحقق من توفر الغرفة في الوقت المحدد
 */
export function validateRoomAvailability(roomId, startTime, endTime, sessions = [], excludeSessionId = null) {
  if (!roomId || !startTime || !endTime) return { isValid: true, conflictSession: null }

  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()

  const conflict = sessions.find(s => {
    if (excludeSessionId && (s.id === excludeSessionId || s._id === excludeSessionId)) return false
    if (s.status === 'CANCELLED' || s.status === 'MISSED') return false

    const sRoomId = s.room_id || s.room?.id
    if (!sRoomId || String(sRoomId) !== String(roomId)) return false

    const sStart = new Date(s.session_date || s.start_time || s.start).getTime()
    const sEnd = s.end_time || s.end ? new Date(s.end_time || s.end).getTime() : sStart + (45 * 60 * 1000)

    return start < sEnd && end > sStart
  })

  return {
    isValid: !conflict,
    conflictSession: conflict || null
  }
}

/**
 * دالة التحقق من الطاقة الاستيعابية للعيادة والغرفة
 */
export function validateSlotCapacity(roomId, startTime, endTime, rooms = [], sessions = [], excludeSessionId = null) {
  if (!startTime || !endTime) return { isValid: true, currentCount: 0, maxCapacity: 5 }

  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()

  // العثور على الغرفة المحددة إن وجدت
  const roomObj = rooms.find(r => String(r.id) === String(roomId))
  const maxCapacity = roomObj?.capacity || roomObj?.max_capacity || 4 // الافتراضي 4 جلسات تزامنية بالغرفة

  // إحصاء عدد الجلسات النشطة المتداخلة مع هذا الوقت
  const overlappingSessions = sessions.filter(s => {
    if (excludeSessionId && (s.id === excludeSessionId || s._id === excludeSessionId)) return false
    if (s.status === 'CANCELLED' || s.status === 'MISSED') return false

    if (roomId) {
      const sRoomId = s.room_id || s.room?.id
      if (sRoomId && String(sRoomId) !== String(roomId)) return false
    }

    const sStart = new Date(s.session_date || s.start_time || s.start).getTime()
    const sEnd = s.end_time || s.end ? new Date(s.end_time || s.end).getTime() : sStart + (45 * 60 * 1000)

    return start < sEnd && end > sStart
  })

  const currentCount = overlappingSessions.length

  return {
    isValid: currentCount < maxCapacity,
    currentCount,
    maxCapacity
  }
}

/**
 * دالة فحص وشاملة لكل الاشتراطات الثلاثة معاً (الطبيب، الغرفة، الطاقة الاستيعابية)
 */
export function validateAppointmentReschedule({
  sessionId,
  doctorId,
  roomId,
  startTime,
  endTime,
  sessions = [],
  rooms = []
}) {
  const doctorCheck = validateDoctorAvailability(doctorId, startTime, endTime, sessions, sessionId)
  const roomCheck = validateRoomAvailability(roomId, startTime, endTime, sessions, sessionId)
  const capacityCheck = validateSlotCapacity(roomId, startTime, endTime, rooms, sessions, sessionId)

  const errors = []

  if (!doctorCheck.isValid) {
    const patientName = doctorCheck.conflictSession?.patient?.full_name_ar || 
      doctorCheck.conflictSession?.patient?.first_name || 'مريض آخر'
    errors.push(`الطبيب لديه موعد متداخل مسبقاً مع (${patientName})`)
  }

  if (!roomCheck.isValid) {
    const patientName = roomCheck.conflictSession?.patient?.full_name_ar || 
      roomCheck.conflictSession?.patient?.first_name || 'موعد آخر'
    errors.push(`الغرفة محجوزة مسبقاً في هذا الوقت لـ (${patientName})`)
  }

  if (!capacityCheck.isValid) {
    errors.push(`تم الوصول للحد الأقصى للطاقة الاستيعابية للغرفة (${capacityCheck.currentCount}/${capacityCheck.maxCapacity} جلسات)`)
  }

  return {
    isValid: doctorCheck.isValid && roomCheck.isValid && capacityCheck.isValid,
    checks: {
      doctor: doctorCheck,
      room: roomCheck,
      capacity: capacityCheck
    },
    errors
  }
}
