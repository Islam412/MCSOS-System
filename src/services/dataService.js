// خدمة إدارة البيانات - حفظ واسترجاع البيانات من LocalStorage

const STORAGE_KEYS = {
  STATS: 'mcsos_stats',
  DOCTORS: 'mcsos_doctors',
  WEEKLY_SCHEDULE: 'mcsos_weekly_schedule',
  PATIENTS: 'mcsos_patients',
  APPOINTMENTS: 'mcsos_appointments',
  TRANSACTIONS: 'mcsos_transactions',
  PACKAGES: 'mcsos_packages'
}

// البيانات الافتراضية
const defaultStats = {
  totalAppointments: 156,
  completedAppointments: 128,
  cancelledAppointments: 18,
  noShowAppointments: 10,
  averageWaitTime: 12,
  doctorUtilization: 78,
  patientSatisfaction: 92,
  revenueThisMonth: 12450
}

const defaultDoctors = [
  { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic', patients: 45, sessions: 38, attendance: 94, utilization: 85 },
  { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy', patients: 38, sessions: 32, attendance: 89, utilization: 78 },
  { id: 3, nameAr: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specializationAr: 'أعصاب', specializationEn: 'Neurology', patients: 42, sessions: 40, attendance: 97, utilization: 92 },
  { id: 4, nameAr: 'د. نورة سعيد', nameEn: 'Dr. Noura Saeed', specializationAr: 'أطفال', specializationEn: 'Pediatrics', patients: 52, sessions: 48, attendance: 92, utilization: 88 }
]

const defaultWeeklySchedule = [
  { id: 1, day: 'السبت', date: '2024-05-20', morning: 12, evening: 8, total: 20 },
  { id: 2, day: 'الأحد', date: '2024-05-21', morning: 14, evening: 10, total: 24 },
  { id: 3, day: 'الإثنين', date: '2024-05-22', morning: 10, evening: 6, total: 16 },
  { id: 4, day: 'الثلاثاء', date: '2024-05-23', morning: 15, evening: 9, total: 24 },
  { id: 5, day: 'الأربعاء', date: '2024-05-24', morning: 13, evening: 7, total: 20 },
  { id: 6, day: 'الخميس', date: '2024-05-25', morning: 11, evening: 5, total: 16 }
]

// الحصول على البيانات
export const getStats = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.STATS)
  return saved ? JSON.parse(saved) : defaultStats
}

export const getDoctors = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.DOCTORS)
  return saved ? JSON.parse(saved) : defaultDoctors
}

export const getWeeklySchedule = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY_SCHEDULE)
  return saved ? JSON.parse(saved) : defaultWeeklySchedule
}

// حفظ البيانات
export const saveStats = (data) => {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data))
}

export const saveDoctors = (data) => {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(data))
}

export const saveWeeklySchedule = (data) => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULE, JSON.stringify(data))
}

// تحديث بيانات محددة
export const updateDoctor = (id, updatedData) => {
  const doctors = getDoctors()
  const updated = doctors.map(d => d.id === id ? { ...d, ...updatedData } : d)
  saveDoctors(updated)
  return updated
}

export const addDoctor = (doctor) => {
  const doctors = getDoctors()
  const newId = Math.max(...doctors.map(d => d.id), 0) + 1
  const newDoctor = { ...doctor, id: newId }
  const updated = [...doctors, newDoctor]
  saveDoctors(updated)
  return updated
}

export const deleteDoctor = (id) => {
  const doctors = getDoctors()
  const updated = doctors.filter(d => d.id !== id)
  saveDoctors(updated)
  return updated
}

export const updateSchedule = (id, updatedData) => {
  const schedule = getWeeklySchedule()
  const updated = schedule.map(s => s.id === id ? { ...s, ...updatedData, total: (updatedData.morning || s.morning) + (updatedData.evening || s.evening) } : s)
  saveWeeklySchedule(updated)
  return updated
}

export const addSchedule = (schedule) => {
  const schedules = getWeeklySchedule()
  const newId = Math.max(...schedules.map(s => s.id), 0) + 1
  const newSchedule = { ...schedule, id: newId, total: (schedule.morning || 0) + (schedule.evening || 0) }
  const updated = [...schedules, newSchedule]
  saveWeeklySchedule(updated)
  return updated
}

export const deleteSchedule = (id) => {
  const schedules = getWeeklySchedule()
  const updated = schedules.filter(s => s.id !== id)
  saveWeeklySchedule(updated)
  return updated
}

// حساب الإحصائيات تلقائياً من الجدول
export const calculateStatsFromSchedule = (schedule) => {
  const total = schedule.reduce((sum, day) => sum + day.total, 0)
  const completed = schedule.reduce((sum, day) => sum + (day.morning + day.evening), 0)
  return { totalAppointments: total, completedAppointments: completed }
}

// إعادة تعيين جميع البيانات للقيم الافتراضية
export const resetAllData = () => {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(defaultStats))
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(defaultDoctors))
  localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULE, JSON.stringify(defaultWeeklySchedule))
  return { stats: defaultStats, doctors: defaultDoctors, schedule: defaultWeeklySchedule }
}
