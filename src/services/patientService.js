// src/services/patientService.js
// خدمة متكاملة لإدارة بيانات المرضى - تدعم API و localStorage كاحتياطي

import { patientsService, prescriptionsService } from './api'

const STORAGE_KEYS = {
  PATIENTS: 'mcsos_patients_v2',
  DOCTORS: 'mcsos_doctors',
  REPORTS: 'mcsos_reports'
}

// الأطباء المتاحين
export const availableDoctors = [
  { id: 1, nameAr: 'د. أحمد علي', nameEn: 'Dr. Ahmed Ali', specializationAr: 'جراحة عظام', specializationEn: 'Orthopedic', phone: '0501111111' },
  { id: 2, nameAr: 'د. منى حسن', nameEn: 'Dr. Mona Hassan', specializationAr: 'علاج طبيعي', specializationEn: 'Physical Therapy', phone: '0502222222' },
  { id: 3, nameAr: 'د. خالد محمود', nameEn: 'Dr. Khaled Mahmoud', specializationAr: 'أعصاب', specializationEn: 'Neurology', phone: '0503333333' },
  { id: 4, nameAr: 'د. نورة سعيد', nameEn: 'Dr. Noura Saeed', specializationAr: 'أطفال', specializationEn: 'Pediatrics', phone: '0504444444' }
]

// درجات الحالة
export const severityLevels = {
  mild: { ar: 'بسيط', en: 'Mild', color: 'text-green-400', weight: 1, progressBonus: 10 },
  moderate: { ar: 'متوسط', en: 'Moderate', color: 'text-yellow-400', weight: 2, progressBonus: 5 },
  severe: { ar: 'شديد', en: 'Severe', color: 'text-red-400', weight: 3, progressBonus: 0 }
}

// حالة الجلسة
export const sessionStatus = {
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'text-blue-400', progressValue: 0 },
  attended: { ar: 'حاضر', en: 'Attended', color: 'text-green-400', progressValue: 100 },
  absent: { ar: 'غائب', en: 'Absent', color: 'text-red-400', progressValue: 0 },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-gray-400', progressValue: 0 }
}

// حالة المريض العامة
export const patientStatus = {
  critical: { ar: 'حرج', en: 'Critical', color: 'text-red-600', progressBonus: -20, description: 'حالة حرجة تحتاج تدخل فوري' },
  declining: { ar: 'متدهور', en: 'Declining', color: 'text-red-400', progressBonus: -10, description: 'الحالة في تدهور' },
  stable: { ar: 'مستقر', en: 'Stable', color: 'text-yellow-400', progressBonus: 0, description: 'الحالة مستقرة بدون تغيير' },
  improving: { ar: 'يتحسن', en: 'Improving', color: 'text-blue-400', progressBonus: 10, description: 'هناك تحسن ملحوظ' },
  active: { ar: 'نشط', en: 'Active', color: 'text-green-400', progressBonus: 15, description: 'يستجيب بشكل جيد للعلاج' },
  excellent: { ar: 'ممتاز', en: 'Excellent', color: 'text-emerald-400', progressBonus: 20, description: 'تحسن كبير وممتاز' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'text-gray-400', progressBonus: 0, description: 'اكتمل العلاج' }
}

// البيانات الافتراضية
const defaultPatients = [
  {
    id: 1,
    nameAr: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    nameFr: 'Ahmed Mohamed',
    age: 35,
    phone: '0501234567',
    email: 'ahmed@example.com',
    diagnosis: 'تمزق في الرباط الصليبي',
    diagnosisDate: '2024-01-15',
    severity: 'moderate',
    mainDoctorId: 1,
    secondaryDoctorId: 2,
    totalSessions: 12,
    completedSessions: 3,
    status: 'improving',
    medications: [
      { name: 'بروفين', dosage: '500mg', frequency: 'مرتين يومياً', startDate: '2024-01-15', endDate: '2024-02-15' }
    ],
    medicalRecommendations: 'الراحة التامة مع تمارين إطالة خفيفة، تجنب المجهود الزائد',
    sessionsHistory: [
      { id: 1, date: '2024-05-15', time: '10:00', status: 'attended', notes: 'تحسن ملحوظ في الحركة', doctorNotes: 'يستجيب بشكل جيد' },
      { id: 2, date: '2024-05-17', time: '10:00', status: 'attended', notes: 'لا يوجد شكوى', doctorNotes: '' },
      { id: 3, date: '2024-05-20', time: '10:00', status: 'scheduled', notes: '', doctorNotes: '' }
    ],
    reports: [],
    images: [],
    progressHistory: [],
    lastAssessmentDate: '2024-05-17',
    doctorAssessment: 'يستجيب بشكل جيد للعلاج، يوصى بالاستمرار',
    progress: 25,
    notes: 'يستجيب بشكل جيد للعلاج'
  }
]

// ========== الحصول على المرضى (مع دعم API) ==========
export const getPatients = async () => {
  try {
    const response = await patientsService.getPatients()
    return response || JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]')
  } catch (error) {
    console.warn('API getPatients failed, using local:', error)
    const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS)
    return saved ? JSON.parse(saved) : defaultPatients
  }
}

export const savePatients = async (patients) => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
  try {
    for (const patient of patients) {
      await patientsService.updatePatient(patient.id, patient)
    }
  } catch (error) {
    console.warn('Failed to save patients to API:', error)
  }
}

export const addPatient = async (patient) => {
  const patients = await getPatients()
  const newId = Math.max(...patients.map(p => p.id || 0), 0) + 1
  const newPatient = { ...patient, id: newId, sessionsHistory: [], reports: [], images: [], progressHistory: [], completedSessions: 0, progress: 0 }
  const updated = [...patients, newPatient]
  await savePatients(updated)
  return updated
}

export const updatePatient = async (id, updatedData) => {
  const patients = await getPatients()
  const updated = patients.map(p => p.id === id ? { ...p, ...updatedData } : p)
  await savePatients(updated)
  await updatePatientProgress(id)
  return updated
}

export const deletePatient = async (id) => {
  const patients = await getPatients()
  const updated = patients.filter(p => p.id !== id)
  await savePatients(updated)
  return updated
}

// ========== إدارة الجلسات ==========
export const addSession = async (patientId, sessionData) => {
  const patients = await getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const newSession = { id: Date.now(), ...sessionData }
    patient.sessionsHistory = [newSession, ...(patient.sessionsHistory || [])]
    await savePatients(patients)
    await updatePatientProgress(patientId)
  }
  return patients
}

export const updateSessionStatus = async (patientId, sessionId, status, notes = '') => {
  const patients = await getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const session = patient.sessionsHistory.find(s => s.id === sessionId)
    if (session) {
      const oldStatus = session.status
      session.status = status
      session.notes = notes || session.notes
      
      if (status === 'attended' && oldStatus !== 'attended') {
        patient.completedSessions = (patient.completedSessions || 0) + 1
      } else if (oldStatus === 'attended' && status !== 'attended') {
        patient.completedSessions = Math.max(0, (patient.completedSessions || 0) - 1)
      }
      
      await savePatients(patients)
      await updatePatientProgress(patientId)
    }
  }
  return patients
}

// ========== إدارة التقارير ==========
export const addReport = async (patientId, reportData) => {
  const patients = await getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const newReport = { id: Date.now(), date: new Date().toISOString(), ...reportData }
    patient.reports = [newReport, ...(patient.reports || [])]
    await savePatients(patients)
    await updatePatientProgress(patientId)
  }
  return patients
}

// ========== إدارة الصور ==========
export const addImageToPatient = (patientId, imageFile, type, title, description = '') => {
  return new Promise(async (resolve) => {
    const reader = new FileReader()
    reader.onloadend = async () => {
      const patients = await getPatients()
      const patient = patients.find(p => p.id === patientId)
      if (patient) {
        const newImage = {
          id: Date.now(),
          type: type,
          title: title,
          description: description,
          data: reader.result,
          fileName: imageFile.name,
          fileSize: imageFile.size,
          date: new Date().toISOString()
        }
        patient.images = [newImage, ...(patient.images || [])]
        await savePatients(patients)
        resolve(patients)
      }
      resolve(null)
    }
    reader.readAsDataURL(imageFile)
  })
}

export const deleteImage = async (patientId, imageId) => {
  const patients = await getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient && patient.images) {
    patient.images = patient.images.filter(img => img.id !== imageId)
    await savePatients(patients)
  }
  return patients
}

// ========== تقييم التقدم ==========
export const addProgressAssessment = async (patientId, assessment) => {
  const patients = await getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const progressHistory = patient.progressHistory || []
    progressHistory.push({
      date: new Date().toISOString().split('T')[0],
      progress: patient.progress,
      note: assessment.note,
      doctorName: assessment.doctorName,
      nextSteps: assessment.nextSteps
    })
    patient.progressHistory = progressHistory
    patient.lastAssessmentDate = new Date().toISOString().split('T')[0]
    patient.doctorAssessment = assessment.note
    await savePatients(patients)
    await updatePatientProgress(patientId)
  }
  return patients
}

// ========== حساب التقدم ==========
export const calculateProgress = (patient) => {
  let progress = 0
  let factors = []
  
  const sessionProgress = (patient.completedSessions / patient.totalSessions) * 40
  factors.push({ name: 'الجلسات المكتملة', value: sessionProgress, max: 40, current: patient.completedSessions, total: patient.totalSessions })
  progress += sessionProgress
  
  const totalSessions = patient.sessionsHistory?.length || 0
  const attendedSessions = patient.sessionsHistory?.filter(s => s.status === 'attended').length || 0
  const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 15 : 0
  factors.push({ name: 'نسبة الحضور', value: attendanceRate, max: 15, attended: attendedSessions, total: totalSessions })
  progress += attendanceRate
  
  const statusBonus = patientStatus[patient.status]?.progressBonus || 0
  let statusValue = Math.max(0, statusBonus)
  if (statusBonus < 0) statusValue = 0
  factors.push({ name: 'حالة المريض', value: statusValue, max: 20, status: patient.status, bonus: statusBonus })
  progress += statusValue
  
  const severityBonus = severityLevels[patient.severity]?.progressBonus || 0
  factors.push({ name: 'درجة الحالة', value: severityBonus, max: 10, severity: patient.severity })
  progress += severityBonus
  
  const positiveReports = patient.reports?.filter(r => r.type === 'positive').length || 0
  const reportBonus = Math.min(10, positiveReports * 2)
  factors.push({ name: 'التقارير الإيجابية', value: reportBonus, max: 10, count: positiveReports })
  progress += reportBonus
  
  let regularityBonus = 0
  if (patient.sessionsHistory && patient.sessionsHistory.length >= 2) {
    const days = patient.sessionsHistory.map(s => new Date(s.date).getDay())
    const isRegular = days.every(d => d === days[0])
    regularityBonus = isRegular ? 5 : 0
  }
  factors.push({ name: 'انتظام الجلسات', value: regularityBonus, max: 5 })
  progress += regularityBonus
  
  progress = Math.min(100, Math.max(0, Math.round(progress)))
  
  let newStatus = patient.status
  if (progress >= 90) newStatus = 'completed'
  else if (progress >= 75) newStatus = 'excellent'
  else if (progress >= 60) newStatus = 'active'
  else if (progress >= 40) newStatus = 'improving'
  else if (progress >= 20) newStatus = 'stable'
  else if (progress >= 5) newStatus = 'declining'
  else newStatus = 'critical'
  
  if (progress !== patient.progress) {
    const progressHistory = patient.progressHistory || []
    progressHistory.push({
      date: new Date().toISOString().split('T')[0],
      progress: progress,
      oldProgress: patient.progress || 0,
      change: progress - (patient.progress || 0),
      note: `تحديث التقدم من ${patient.progress || 0}% إلى ${progress}%`,
      factors: factors
    })
    patient.progressHistory = progressHistory
    patient.progress = progress
    patient.status = newStatus
  }
  
  return { progress, factors, newStatus }
}

export const updatePatientProgress = async (patientId) => {
  const patients = await getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const { progress, factors, newStatus } = calculateProgress(patient)
    patient.progress = progress
    patient.status = newStatus
    await savePatients(patients)
    return { progress, factors, newStatus }
  }
  return null
}

export const getDoctorName = (doctorId, lang = 'ar') => {
  const doctor = availableDoctors.find(d => d.id === doctorId)
  if (!doctor) return lang === 'ar' ? 'غير محدد' : 'Not assigned'
  return lang === 'ar' ? doctor.nameAr : doctor.nameEn
}

export const getProgressDetails = async (patientId) => {
  const patients = await getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (!patient) return null
  
  const totalSessions = patient.sessionsHistory?.length || 0
  const attendedSessions = patient.sessionsHistory?.filter(s => s.status === 'attended').length || 0
  const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0
  
  return {
    currentProgress: patient.progress,
    sessionProgress: (patient.completedSessions / patient.totalSessions) * 40,
    attendanceProgress: attendanceRate * 0.15,
    statusBonus: patientStatus[patient.status]?.progressBonus || 0,
    severityBonus: severityLevels[patient.severity]?.progressBonus || 0,
    reportBonus: Math.min(10, (patient.reports?.filter(r => r.type === 'positive').length || 0) * 2),
    totalCalculated: patient.progress,
    factors: [
      { name: 'الجلسات المكتملة', value: patient.completedSessions, total: patient.totalSessions, weight: 40 },
      { name: 'نسبة الحضور', value: attendedSessions, total: totalSessions, weight: 15 },
      { name: 'حالة المريض', value: patient.status, weight: 20 },
      { name: 'درجة الحالة', value: patient.severity, weight: 10 },
      { name: 'التقارير الإيجابية', value: patient.reports?.filter(r => r.type === 'positive').length || 0, weight: 10 },
      { name: 'انتظام الجلسات', value: 'منتظم', weight: 5 }
    ]
  }
}