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
  mild: { ar: 'بسيط', en: 'Mild', color: 'text-green-400' },
  moderate: { ar: 'متوسط', en: 'Moderate', color: 'text-yellow-400' },
  severe: { ar: 'شديد', en: 'Severe', color: 'text-red-400' }
}

// حالة الجلسة
export const sessionStatus = {
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'text-blue-400' },
  attended: { ar: 'حاضر', en: 'Attended', color: 'text-green-400' },
  absent: { ar: 'غائب', en: 'Absent', color: 'text-red-400' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-gray-400' }
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
    status: 'active',
    medications: [
      { name: 'بروفين', dosage: '500mg', frequency: 'مرتين يومياً', startDate: '2024-01-15', endDate: '2024-02-15' }
    ],
    medicalRecommendations: 'الراحة التامة مع تمارين إطالة خفيفة، تجنب المجهود الزائد',
    sessionsHistory: [
      { id: 1, date: '2024-05-15', time: '10:00', status: 'attended', notes: 'تحسن ملحوظ في الحركة', doctorNotes: 'يستجيب بشكل جيد' },
      { id: 2, date: '2024-05-17', time: '10:00', status: 'attended', notes: 'لا يوجد شكوى', doctorNotes: '' },
      { id: 3, date: '2024-05-20', time: '10:00', status: 'scheduled', notes: '', doctorNotes: '' }
    ],
    nextSession: { date: '2024-05-22', time: '10:00' },
    reports: [],
    images: [],
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
    status: 'active',
    medications: [
      { name: 'مرخي عضلات', dosage: 'قرص', frequency: '3 مرات يومياً', startDate: '2024-01-20', endDate: '2024-02-20' }
    ],
    medicalRecommendations: 'تمارين تقوية الظهر، تجنب الجلوس الطويل',
    sessionsHistory: [
      { id: 1, date: '2024-05-14', time: '11:00', status: 'attended', notes: '', doctorNotes: '' },
      { id: 2, date: '2024-05-16', time: '11:00', status: 'attended', notes: 'تحسن طفيف', doctorNotes: '' },
      { id: 3, date: '2024-05-19', time: '11:00', status: 'scheduled', notes: '', doctorNotes: '' }
    ],
    nextSession: { date: '2024-05-21', time: '11:00' },
    reports: [],
    images: [],
    progress: 41.7,
    notes: 'تحسن تدريجي'
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
  const newPatient = { ...patient, id: newId, sessionsHistory: [], reports: [], images: [], completedSessions: 0, progress: 0 }
  const updated = [...patients, newPatient]
  savePatients(updated)
  return updated
}

export const updatePatient = (id, updatedData) => {
  const patients = getPatients()
  const updated = patients.map(p => p.id === id ? { ...p, ...updatedData } : p)
  savePatients(updated)
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
    patient.sessionsHistory = [newSession, ...patient.sessionsHistory]
    savePatients(patients)
  }
  return patients
}

export const updateSessionStatus = (patientId, sessionId, status, notes = '') => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const session = patient.sessionsHistory.find(s => s.id === sessionId)
    if (session) {
      session.status = status
      session.notes = notes
      if (status === 'attended') {
        patient.completedSessions = (patient.completedSessions || 0) + 1
        patient.progress = (patient.completedSessions / patient.totalSessions) * 100
      }
      savePatients(patients)
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
  }
  return patients
}

export const addImage = (patientId, imageData) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient) {
    const newImage = { id: Date.now(), date: new Date().toISOString(), ...imageData }
    patient.images = [newImage, ...(patient.images || [])]
    savePatients(patients)
  }
  return patients
}

export const getDoctorName = (doctorId, lang = 'ar') => {
  const doctor = availableDoctors.find(d => d.id === doctorId)
  if (!doctor) return lang === 'ar' ? 'غير محدد' : 'Not assigned'
  return lang === 'ar' ? doctor.nameAr : doctor.nameEn
}

// إضافة صورة جديدة للمريض
export const addImageToPatient = (patientId, imageFile, type, title, description = '') => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const patients = getPatients()
      const patient = patients.find(p => p.id === patientId)
      if (patient) {
        const newImage = {
          id: Date.now(),
          type: type, // 'xray' or 'report'
          title: title,
          description: description,
          data: reader.result, // base64 string
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

// حذف صورة
export const deleteImage = (patientId, imageId) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (patient && patient.images) {
    patient.images = patient.images.filter(img => img.id !== imageId)
    savePatients(patients)
  }
  return patients
}

// الحصول على صور المريض
export const getPatientImages = (patientId, type = null) => {
  const patients = getPatients()
  const patient = patients.find(p => p.id === patientId)
  if (!patient || !patient.images) return []
  if (type) {
    return patient.images.filter(img => img.type === type)
  }
  return patient.images
}
