// خدمة متكاملة لإدارة بيانات المرضى

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

// حالة المريض العامة (محدثة)
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

export const getPatients = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS)
  return saved ? JSON.parse(saved) : defaultPatients
}

export const savePatients = (patients) => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
}

export const addPatient = (patient) => {
  const patients = getPatients()
  const newId = Math.max(...patients.map(p => p.id), 0) + 1
  const newPatient = { ...patient, id: newId, sessionsHistory: [], reports: [], images: [], progressHistory: [], completedSessions: 0, progress: 0 }
  const updated = [...patients, newPatient]
  savePatients(updated)
  return updated
}

export const updatePatient = (id, updatedData) => {
  const patients = getPatients()
  const updated = patients.map(p => p.id === id ? { ...p, ...updatedData } : p)
  savePatients(updated)
  updatePatientProgress(id)
  return updated
}

export const deletePatient = (id) => {
  const patients = getPatients()
  const updated = patients.filter(p => p.id !== id)
  savePatients(updated)
  return updated
}

export const addSession = (patientId, sessionData) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const newSession = { id: Date.now(), ...sessionData }
    patient.sessionsHistory = [newSession, ...(patient.sessionsHistory || [])]
    savePatients(patients)
    updatePatientProgress(patientId)
  }
  return patients
}

export const updateSessionStatus = (patientId, sessionId, status, notes = '') => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const session = patient.sessionsHistory.find(s => s.id === sessionId)
    if (session) {
      const oldStatus = session.status
      session.status = status
      session.notes = notes || session.notes
      
      // تحديث عدد الجلسات المكتملة
      if (status === 'attended' && oldStatus !== 'attended') {
        patient.completedSessions = (patient.completedSessions || 0) + 1
      } else if (oldStatus === 'attended' && status !== 'attended') {
        patient.completedSessions = Math.max(0, (patient.completedSessions || 0) - 1)
      }
      
      savePatients(patients)
      updatePatientProgress(patientId)
    }
  }
  return patients
}

export const addReport = (patientId, reportData) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const newReport = { id: Date.now(), date: new Date().toISOString(), ...reportData }
    patient.reports = [newReport, ...(patient.reports || [])]
    savePatients(patients)
    updatePatientProgress(patientId)
  }
  return patients
}

export const addImageToPatient = (patientId, imageFile, type, title, description = '') => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const patients = getPatients()
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
        savePatients(patients)
        resolve(patients)
      }
      resolve(null)
    }
    reader.readAsDataURL(imageFile)
  })
}

export const deleteImage = (patientId, imageId) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient && patient.images) {
    patient.images = patient.images.filter(img => img.id !== imageId)
    savePatients(patients)
  }
  return patients
}

export const addProgressAssessment = (patientId, assessment) => {
  const patients = getPatients()
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
    savePatients(patients)
    updatePatientProgress(patientId)
  }
  return patients
}

// حساب التقدم العلاجي المحسن
export const calculateProgress = (patient) => {
  let progress = 0
  let factors = []
  
  // 1. الجلسات المكتملة (40% من التقدم)
  const sessionProgress = (patient.completedSessions / patient.totalSessions) * 40
  factors.push({ name: 'الجلسات المكتملة', value: sessionProgress, max: 40, current: patient.completedSessions, total: patient.totalSessions })
  progress += sessionProgress
  
  // 2. نسبة حضور الجلسات (15% من التقدم)
  const totalSessions = patient.sessionsHistory?.length || 0
  const attendedSessions = patient.sessionsHistory?.filter(s => s.status === 'attended').length || 0
  const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 15 : 0
  factors.push({ name: 'نسبة الحضور', value: attendanceRate, max: 15, attended: attendedSessions, total: totalSessions })
  progress += attendanceRate
  
  // 3. حالة المريض (20% من التقدم)
  const statusBonus = patientStatus[patient.status]?.progressBonus || 0
  let statusValue = Math.max(0, statusBonus)
  if (statusBonus < 0) statusValue = 0
  factors.push({ name: 'حالة المريض', value: statusValue, max: 20, status: patient.status, bonus: statusBonus })
  progress += statusValue
  
  // 4. درجة الحالة (10% من التقدم)
  const severityBonus = severityLevels[patient.severity]?.progressBonus || 0
  factors.push({ name: 'درجة الحالة', value: severityBonus, max: 10, severity: patient.severity })
  progress += severityBonus
  
  // 5. التقارير الإيجابية (10% من التقدم)
  const positiveReports = patient.reports?.filter(r => r.type === 'positive').length || 0
  const reportBonus = Math.min(10, positiveReports * 2)
  factors.push({ name: 'التقارير الإيجابية', value: reportBonus, max: 10, count: positiveReports })
  progress += reportBonus
  
  // 6. انتظام الجلسات (5% من التقدم)
  // حساب إذا كانت الجلسات منتظمة (في نفس اليوم من كل أسبوع)
  let regularityBonus = 0
  if (patient.sessionsHistory && patient.sessionsHistory.length >= 2) {
    const days = patient.sessionsHistory.map(s => new Date(s.date).getDay())
    const isRegular = days.every(d => d === days[0])
    regularityBonus = isRegular ? 5 : 0
  }
  factors.push({ name: 'انتظام الجلسات', value: regularityBonus, max: 5 })
  progress += regularityBonus
  
  // التأكد من أن النسبة بين 0 و 100
  progress = Math.min(100, Math.max(0, Math.round(progress)))
  
  // تحديد حالة المريض بناءً على التقدم
  let newStatus = patient.status
  if (progress >= 90) newStatus = 'completed'
  else if (progress >= 75) newStatus = 'excellent'
  else if (progress >= 60) newStatus = 'active'
  else if (progress >= 40) newStatus = 'improving'
  else if (progress >= 20) newStatus = 'stable'
  else if (progress >= 5) newStatus = 'declining'
  else newStatus = 'critical'
  
  // حفظ تاريخ التقدم إذا تغيرت النسبة
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

// تحديث تقدم المريض بعد كل تغيير
export const updatePatientProgress = (patientId) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const { progress, factors, newStatus } = calculateProgress(patient)
    patient.progress = progress
    patient.status = newStatus
    savePatients(patients)
    return { progress, factors, newStatus }
  }
  return null
}

export const getDoctorName = (doctorId, lang = 'ar') => {
  const doctor = availableDoctors.find(d => d.id === doctorId)
  if (!doctor) return lang === 'ar' ? 'غير محدد' : 'Not assigned'
  return lang === 'ar' ? doctor.nameAr : doctor.nameEn
}

// دالة للحصول على تفاصيل التقدم
export const getProgressDetails = (patientId) => {
  const patients = getPatients()
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
