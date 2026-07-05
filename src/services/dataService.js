// src/services/dataService.js
// خدمة إدارة البيانات - تدعم API و localStorage كاحتياطي

import { doctorsService, appointmentsService } from './api'

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

// ========== دوال مساعدة للـ API ==========
const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`
const get = async (endpoint) => {
  const token = localStorage.getItem('mcsos_token')
  const response = await fetch(`${API_BASE.replace('/v1', '')}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  return response.json()
}

const post = async (endpoint, data) => {
  const token = localStorage.getItem('mcsos_token')
  const response = await fetch(`${API_BASE.replace('/v1', '')}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}

const put = async (endpoint, data) => {
  const token = localStorage.getItem('mcsos_token')
  const response = await fetch(`${API_BASE.replace('/v1', '')}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}

const del = async (endpoint) => {
  const token = localStorage.getItem('mcsos_token')
  const response = await fetch(`${API_BASE.replace('/v1', '')}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return response.json()
}

// ========== الحصول على البيانات (مع دعم API) ==========
export const getStats = async () => {
  try {
    const response = await get('/stats/operations')
    return response || defaultStats
  } catch (error) {
    console.warn('API getStats failed, using local:', error)
    const saved = localStorage.getItem(STORAGE_KEYS.STATS)
    return saved ? JSON.parse(saved) : defaultStats
  }
}

export const getDoctors = async () => {
  try {
    const response = await get('/doctors')
    return response?.doctors || response || defaultDoctors
  } catch (error) {
    console.warn('API getDoctors failed, using local:', error)
    const saved = localStorage.getItem(STORAGE_KEYS.DOCTORS)
    return saved ? JSON.parse(saved) : defaultDoctors
  }
}

export const getWeeklySchedule = async () => {
  try {
    const response = await get('/schedule/weekly')
    return response?.schedule || response || defaultWeeklySchedule
  } catch (error) {
    console.warn('API getWeeklySchedule failed, using local:', error)
    const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY_SCHEDULE)
    return saved ? JSON.parse(saved) : defaultWeeklySchedule
  }
}

// ========== حفظ البيانات ==========
export const saveStats = async (data) => {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data))
  try {
    await put('/stats/operations', data)
  } catch (error) {
    console.warn('Failed to save stats to API:', error)
  }
}

export const saveDoctors = async (data) => {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(data))
  try {
    for (const doctor of data) {
      await put(`/doctors/${doctor.id}`, doctor)
    }
  } catch (error) {
    console.warn('Failed to save doctors to API:', error)
  }
}

export const saveWeeklySchedule = async (data) => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULE, JSON.stringify(data))
  try {
    await put('/schedule/weekly', { schedule: data })
  } catch (error) {
    console.warn('Failed to save schedule to API:', error)
  }
}

// ========== تحديث بيانات محددة ==========
export const updateDoctor = async (id, updatedData) => {
  const doctors = await getDoctors()
  const updated = doctors.map(d => d.id === id ? { ...d, ...updatedData } : d)
  await saveDoctors(updated)
  return updated
}

export const addDoctor = async (doctor) => {
  const doctors = await getDoctors()
  const newId = Math.max(...doctors.map(d => d.id || 0), 0) + 1
  const newDoctor = { ...doctor, id: newId }
  const updated = [...doctors, newDoctor]
  await saveDoctors(updated)
  return updated
}

export const deleteDoctor = async (id) => {
  const doctors = await getDoctors()
  const updated = doctors.filter(d => d.id !== id)
  await saveDoctors(updated)
  return updated
}

export const updateSchedule = async (id, updatedData) => {
  const schedule = await getWeeklySchedule()
  const updated = schedule.map(s => s.id === id ? { ...s, ...updatedData, total: (updatedData.morning || s.morning) + (updatedData.evening || s.evening) } : s)
  await saveWeeklySchedule(updated)
  return updated
}

export const addSchedule = async (schedule) => {
  const schedules = await getWeeklySchedule()
  const newId = Math.max(...schedules.map(s => s.id || 0), 0) + 1
  const newSchedule = { ...schedule, id: newId, total: (schedule.morning || 0) + (schedule.evening || 0) }
  const updated = [...schedules, newSchedule]
  await saveWeeklySchedule(updated)
  return updated
}

export const deleteSchedule = async (id) => {
  const schedules = await getWeeklySchedule()
  const updated = schedules.filter(s => s.id !== id)
  await saveWeeklySchedule(updated)
  return updated
}

// ========== حساب الإحصائيات ==========
export const calculateStatsFromSchedule = (schedule) => {
  const total = schedule.reduce((sum, day) => sum + day.total, 0)
  const completed = schedule.reduce((sum, day) => sum + (day.morning + day.evening), 0)
  return { totalAppointments: total, completedAppointments: completed }
}

// ========== إعادة تعيين البيانات ==========
export const resetAllData = async () => {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(defaultStats))
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(defaultDoctors))
  localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULE, JSON.stringify(defaultWeeklySchedule))
  
  try {
    await put('/stats/operations', defaultStats)
    for (const doctor of defaultDoctors) {
      await put(`/doctors/${doctor.id}`, doctor)
    }
    await put('/schedule/weekly', { schedule: defaultWeeklySchedule })
  } catch (error) {
    console.warn('Failed to reset data on API:', error)
  }
  
  return { stats: defaultStats, doctors: defaultDoctors, schedule: defaultWeeklySchedule }
}