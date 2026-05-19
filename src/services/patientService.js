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
  mild: { ar: 'بسيط', en: 'Mild', color: 'text-green-400', weight: 1 },
  moderate: { ar: 'متوسط', en: 'Moderate', color: 'text-yellow-400', weight: 2 },
  severe: { ar: 'شديد', en: 'Severe', color: 'text-red-400', weight: 3 }
}

// حالة الجلسة
export const sessionStatus = {
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'text-blue-400', weight: 0 },
  attended: { ar: 'حاضر', en: 'Attended', color: 'text-green-400', weight: 10 },
  absent: { ar: 'غائب', en: 'Absent', color: 'text-red-400', weight: 0 },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-gray-400', weight: 0 }
}

// حالة المريض العامة
export const patientStatus = {
  active: { ar: 'نشط', en: 'Active', color: 'text-green-400', progressBonus: 5 },
  improving: { ar: 'يتحسن', en: 'Improving', color: 'text-blue-400', progressBonus: 10 },
  stable: { ar: 'مستقر', en: 'Stable', color: 'text-yellow-400', progressBonus: 0 },
  declining: { ar: 'متدهور', en: 'Declining', color: 'text-red-400', progressBonus: -10 },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'text-gray-400', progressBonus: 0 }
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
    totalSessions: 8,
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
    progressHistory: [
      { date: '2024-05-01', progress: 0, note: 'بداية العلاج' },
      { date: '2024-05-15', progress: 25, note: 'تحسن بعد أول جلسة' },
      { date: '2024-05-17', progress: 37.5, note: 'استمرار التحسن' }
    ],
    lastAssessmentDate: '2024-05-17',
    doctorAssessment: 'يستجيب بشكل جيد للعلاج، يوصى بالاستمرار',
    progress: 37.5,
    notes: 'يستجيب بشكل جيد للعلاج'
  },
  {
    id: 2,
    nameAr: 'سارة حسن',
    nameEn: 'Sara Hassan',
    nameFr: 'Sara Hassan',
    age: 28,
    phone: '0507654321',
    email: 'sara@example.com',
    diagnosis: 'انزلاق غضروفي',
    diagnosisDate: '2024-01-20',
    severity: 'moderate',
    mainDoctorId: 3,
    secondaryDoctorId: null,
    totalSessions: 12,
    completedSessions: 5,
    status: 'improving',
    medications: [
      { name: 'مرخي عضلات', dosage: 'قرص', frequency: '3 مرات يومياً', startDate: '2024-01-20', endDate: '2024-02-20' }
    ],
    medicalRecommendations: 'تمارين تقوية الظهر، تجنب الجلوس الطويل',
    sessionsHistory: [
      { id: 1, date: '2024-05-14', time: '11:00', status: 'attended', notes: '', doctorNotes: '' },
      { id: 2, date: '2024-05-16', time: '11:00', status: 'attended', notes: 'تحسن طفيف', doctorNotes: '' },
      { id: 3, date: '2024-05-19', time: '11:00', status: 'scheduled', notes: '', doctorNotes: '' }
    ],
    reports: [],
    images: [],
    progressHistory: [
      { date: '2024-05-01', progress: 0, note: 'بداية العلاج' },
      { date: '2024-05-16', progress: 41.7, note: 'تحسن ملحوظ' }
    ],
    lastAssessmentDate: '2024-05-16',
    doctorAssessment: 'تحسن تدريجي، يوصى بمواصلة التمارين',
    progress: 41.7,
    notes: 'تحسن تدريجي'
  }
]

// حساب التقدم العلاجي
export const calculateProgress = (patient) => {
  let progress = 0
  let factors = []
  
  // 1. حساب من الجلسات المكتملة (70% من التقدم)
  const sessionProgress = (patient.completedSessions / patient.totalSessions) * 70
  factors.push({ name: 'الجلسات المكتملة', value: sessionProgress, weight: 70 })
  progress += sessionProgress
  
  // 2. حساب من حالة المريض (15% من التقدم)
  const statusProgress = patientStatus[patient.status]?.progressBonus || 0
  let statusValue = 0
  if (patient.status === 'improving') statusValue = 15
  else if (patient.status === 'active') statusValue = 10
  else if (patient.status === 'stable') statusValue = 5
  else if (patient.status === 'declining') statusValue = -10
  factors.push({ name: 'حالة المريض', value: statusValue, weight: 15 })
  progress += statusValue
  
  // 3. حساب من درجة الحالة (10% من التقدم)
  const severityWeight = severityLevels[patient.severity]?.weight || 2
  let severityValue = 0
  if (patient.severity === 'mild') severityValue = 10
  else if (patient.severity === 'moderate') severityValue = 5
  else if (patient.severity === 'severe') severityValue = 0
  factors.push({ name: 'درجة الحالة', value: severityValue, weight: 10 })
  progress += severityValue
  
  // 4. حساب من عدد التقارير الإيجابية (5% من التقدم)
  const positiveReports = patient.reports?.filter(r => r.type === 'positive').length || 0
  const reportValue = Math.min(5, positiveReports * 2)
  factors.push({ name: 'التقارير الإيجابية', value: reportValue, weight: 5 })
  progress += reportValue
  
  // التأكد من أن النسبة بين 0 و 100
  progress = Math.min(100, Math.max(0, Math.round(progress)))
  
  // حفظ تاريخ التقدم
  if (progress !== patient.progress) {
    const progressHistory = patient.progressHistory || []
    progressHistory.push({
      date: new Date().toISOString().split('T')[0],
      progress: progress,
      note: `تحديث التقدم من ${patient.progress}% إلى ${progress}%`,
      factors: factors
    })
    patient.progressHistory = progressHistory
    patient.progress = progress
    
    // تحديث حالة المريض بناءً على التقدم
    if (progress >= 90) patient.status = 'completed'
    else if (progress >= 70) patient.status = 'improving'
    else if (progress >= 40) patient.status = 'active'
    else if (progress >= 20) patient.status = 'stable'
    else patient.status = 'declining'
  }
  
  return { progress, factors }
}

// تحديث تقدم المريض بعد كل تغيير
export const updatePatientProgress = (patientId) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const { progress, factors } = calculateProgress(patient)
    patient.progress = progress
    savePatients(patients)
    return { progress, factors }
  }
  return null
}

// إضافة تقييم تقدم من الطبيب
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
  
  const sessionProgress = (patient.completedSessions / patient.totalSessions) * 70
  const statusBonus = patientStatus[patient.status]?.progressBonus || 0
  const severityBonus = patient.severity === 'mild' ? 10 : patient.severity === 'moderate' ? 5 : 0
  const reportBonus = Math.min(5, (patient.reports?.filter(r => r.type === 'positive').length || 0) * 2)
  
  return {
    currentProgress: patient.progress,
    sessionProgress,
    statusBonus,
    severityBonus,
    reportBonus,
    totalCalculated: sessionProgress + statusBonus + severityBonus + reportBonus,
    factors: [
      { name: 'الجلسات المكتملة', value: sessionProgress, max: 70 },
      { name: 'حالة المريض', value: statusBonus, max: 15 },
      { name: 'درجة الحالة', value: severityBonus, max: 10 },
      { name: 'التقارير الإيجابية', value: reportBonus, max: 5 }
    ]
  }
}
