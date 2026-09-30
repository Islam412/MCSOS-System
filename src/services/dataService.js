// src/services/dataService.js
// API helpers for dashboards. No invented demo numbers — empty/error on failure (T-012 stage 1).

import { getToken } from './api/client'

const STORAGE_KEYS = {
  STATS: 'mcsos_stats',
  DOCTORS: 'mcsos_doctors',
  WEEKLY_SCHEDULE: 'mcsos_weekly_schedule',
  PATIENTS: 'mcsos_patients',
  APPOINTMENTS: 'mcsos_appointments',
  TRANSACTIONS: 'mcsos_transactions',
  PACKAGES: 'mcsos_packages'
}

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

async function apiFetch(endpoint, options = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const err = new Error(`API ${endpoint} failed: ${response.status}`)
    err.status = response.status
    throw err
  }
  if (response.status === 204) return null
  return response.json()
}

const get = (endpoint) => apiFetch(endpoint)
const put = (endpoint, data) =>
  apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) })

/** @returns {Promise<object|null>} null when the API is unreachable or empty */
export const getStats = async () => {
  try {
    const response = await get('/stats/operations')
    return response ?? null
  } catch (error) {
    console.warn('API getStats failed:', error)
    return null
  }
}

export const getDoctors = async () => {
  try {
    const response = await get('/doctors')
    const list = response?.doctors || response
    return Array.isArray(list) ? list : []
  } catch (error) {
    console.warn('API getDoctors failed:', error)
    return []
  }
}

export const getWeeklySchedule = async () => {
  try {
    const response = await get('/schedule/weekly')
    const schedule = response?.schedule || response
    return Array.isArray(schedule) ? schedule : []
  } catch (error) {
    console.warn('API getWeeklySchedule failed:', error)
    return []
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

/** Clear cached dashboard keys only — does not invent replacement figures. */
export const resetAllData = async () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  return { stats: null, doctors: [], schedule: [] }
}