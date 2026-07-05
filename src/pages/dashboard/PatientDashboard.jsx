import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, Users, Calendar, Clock, Activity, Pill, FileText, 
  CheckCircle, AlertCircle, TrendingUp, Heart, 
  Stethoscope, Syringe, ClipboardList, Eye, Download,
  CalendarDays, Phone, Mail, MapPin, Award, Target,
  Search, Filter, Star, StarHalf, UserPlus, Video, MessageCircle,
  DollarSign, CreditCard, Bell, Shield, HelpCircle, Settings,
  LogOut, Menu, X, Home, History, FileBadge, Brain, Bone,
  Thermometer, Droplet, Microscope, Scissors, Ambulance,
  Printer, Bookmark, CalendarCheck, VideoIcon, PhoneCall, Clock8,
  Filter as FilterIcon, ChevronLeft, ChevronRight, XCircle, Briefcase,
  Loader2, RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// ========== استيراد الخدمات ==========
import { patientsService, doctorsService, appointmentsService, prescriptionsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function PatientDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingType, setBookingType] = useState('clinic')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [showDoctorDetails, setShowDoctorDetails] = useState(false)
  const [viewingDoctor, setViewingDoctor] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ========== قائمة التخصصات ==========
  const specialties = [
    // الكل
    { id: 'all', name: 'جميع التخصصات', nameEn: 'All Specialties', icon: '🏥' },
    
    // ========== تخصصات الطب البشري ==========
    { id: 'Cardiology', name: 'أمراض القلب', nameEn: 'Cardiology', icon: '❤️' },
    { id: 'Orthopedic', name: 'جراحة عظام', nameEn: 'Orthopedic Surgery', icon: '🦴' },
    { id: 'Neurology', name: 'أعصاب', nameEn: 'Neurology', icon: '🧠' },
    { id: 'Neurosurgery', name: 'جراحة أعصاب', nameEn: 'Neurosurgery', icon: '🧠' },
    { id: 'VascularSurgery', name: 'جراحة أوعية دموية', nameEn: 'Vascular Surgery', icon: '🩸' },
    { id: 'CardiothoracicSurgery', name: 'جراحة صدر', nameEn: 'Cardiothoracic Surgery', icon: '🫁' },
    { id: 'Gastroenterology', name: 'جهاز هضمي', nameEn: 'Gastroenterology', icon: '🫃' },
    { id: 'Urology', name: 'مسالك بولية', nameEn: 'Urology', icon: '🧬' },
    { id: 'PlasticSurgery', name: 'جراحة تجميل', nameEn: 'Plastic Surgery', icon: '✨' },
    { id: 'BurnSurgery', name: 'جراحة حروق', nameEn: 'Burn Surgery', icon: '🔥' },
    { id: 'LaparoscopicSurgery', name: 'جراحة مناظير', nameEn: 'Laparoscopic Surgery', icon: '🔬' },
    { id: 'OncologySurgery', name: 'جراحة أورام', nameEn: 'Surgical Oncology', icon: '🎗️' },
    { id: 'PediatricSurgery', name: 'جراحة أطفال', nameEn: 'Pediatric Surgery', icon: '👶' },
    { id: 'Gynecology', name: 'نساء وتوليد', nameEn: 'Gynecology', icon: '🤱' },
    { id: 'Ophthalmology', name: 'عيون', nameEn: 'Ophthalmology', icon: '👁️' },
    { id: 'ENT', name: 'أنف وأذن وحنجرة', nameEn: 'ENT', icon: '👂' },
    { id: 'Dermatology', name: 'جلدية', nameEn: 'Dermatology', icon: '✨' },
    { id: 'InternalMedicine', name: 'باطنية', nameEn: 'Internal Medicine', icon: '🫀' },
    { id: 'Hepatology', name: 'أمراض كبد', nameEn: 'Hepatology', icon: '🫘' },
    { id: 'Nephrology', name: 'أمراض كلى', nameEn: 'Nephrology', icon: '🫘' },
    { id: 'Pulmonology', name: 'أمراض رئة', nameEn: 'Pulmonology', icon: '🫁' },
    { id: 'Hematology', name: 'أمراض دم', nameEn: 'Hematology', icon: '🩸' },
    { id: 'Endocrinology', name: 'غدد صماء', nameEn: 'Endocrinology', icon: '🧬' },
    { id: 'Diabetes', name: 'أمراض سكري', nameEn: 'Diabetes', icon: '🍬' },
    { id: 'Rheumatology', name: 'روماتيزم', nameEn: 'Rheumatology', icon: '🦴' },
    { id: 'Allergy', name: 'حساسية', nameEn: 'Allergy', icon: '🤧' },
    { id: 'InfectiousDiseases', name: 'أمراض معدية', nameEn: 'Infectious Diseases', icon: '🦠' },
    { id: 'Emergency', name: 'طوارئ', nameEn: 'Emergency Medicine', icon: '🚑' },
    { id: 'FamilyMedicine', name: 'طب أسرة', nameEn: 'Family Medicine', icon: '🏠' },
    { id: 'Pediatrics', name: 'أطفال', nameEn: 'Pediatrics', icon: '👶' },
    { id: 'Obstetrics', name: 'توليد', nameEn: 'Obstetrics', icon: '🤱' },
    { id: 'Andrology', name: 'طب ذكورة', nameEn: 'Andrology', icon: '🧔' },
    { id: 'Geriatrics', name: 'طب شيخوخة', nameEn: 'Geriatrics', icon: '👴' },
    { id: 'PainMedicine', name: 'طب ألم', nameEn: 'Pain Medicine', icon: '💊' },
    { id: 'SleepMedicine', name: 'طب نوم', nameEn: 'Sleep Medicine', icon: '😴' },
    { id: 'SportsMedicine', name: 'طب رياضي', nameEn: 'Sports Medicine', icon: '🏃' },
    { id: 'Psychiatry', name: 'طب نفسي', nameEn: 'Psychiatry', icon: '🧠' },
    { id: 'Anesthesiology', name: 'تخدير', nameEn: 'Anesthesiology', icon: '😷' },
    { id: 'ICU', name: 'عناية مركزة', nameEn: 'Intensive Care', icon: '🫀' },
    { id: 'PalliativeCare', name: 'رعاية تلطيفية', nameEn: 'Palliative Care', icon: '🕊️' },
    { id: 'Radiology', name: 'أشعة تشخيصية', nameEn: 'Diagnostic Radiology', icon: '📷' },
    { id: 'InterventionalRadiology', name: 'أشعة تداخلية', nameEn: 'Interventional Radiology', icon: '🎯' },
    { id: 'RadiationOncology', name: 'علاج إشعاعي', nameEn: 'Radiation Oncology', icon: '☢️' },
    { id: 'Chemotherapy', name: 'علاج كيميائي', nameEn: 'Chemotherapy', icon: '🧪' },
    { id: 'GeneralSurgery', name: 'جراحة عامة', nameEn: 'General Surgery', icon: '🔪' },
    { id: 'Vascular', name: 'أوعية دموية', nameEn: 'Vascular', icon: '🩸' },
    { id: 'MaxillofacialSurgery', name: 'جراحة وجه وفكين', nameEn: 'Maxillofacial Surgery', icon: '🦷' },
    
    // ========== تخصصات العلاج الطبيعي ==========
    { id: 'PhysicalTherapy', name: 'علاج طبيعي عام', nameEn: 'Physical Therapy', icon: '💪' },
    { id: 'SportsPhysicalTherapy', name: 'علاج طبيعي رياضي', nameEn: 'Sports Physical Therapy', icon: '🏃' },
    { id: 'NeurologicalPhysicalTherapy', name: 'علاج طبيعي أعصاب', nameEn: 'Neurological Physical Therapy', icon: '🧠' },
    { id: 'PediatricPhysicalTherapy', name: 'علاج طبيعي أطفال', nameEn: 'Pediatric Physical Therapy', icon: '👶' },
    { id: 'GeriatricPhysicalTherapy', name: 'علاج طبيعي شيخوخة', nameEn: 'Geriatric Physical Therapy', icon: '👴' },
    { id: 'OrthopedicPhysicalTherapy', name: 'علاج طبيعي عظام', nameEn: 'Orthopedic Physical Therapy', icon: '🦴' },
    { id: 'CardiovascularPhysicalTherapy', name: 'علاج طبيعي قلب', nameEn: 'Cardiovascular Physical Therapy', icon: '❤️' },
    { id: 'OccupationalTherapy', name: 'علاج وظيفي', nameEn: 'Occupational Therapy', icon: '🤲' },
    { id: 'SpeechTherapy', name: 'علاج نطق', nameEn: 'Speech Therapy', icon: '🗣️' },
    { id: 'HandTherapy', name: 'علاج يد', nameEn: 'Hand Therapy', icon: '🤚' },
    { id: 'PelvicFloorTherapy', name: 'علاج قاع حوض', nameEn: 'Pelvic Floor Therapy', icon: '🫀' },
    { id: 'VestibularTherapy', name: 'علاج التوازن', nameEn: 'Vestibular Therapy', icon: '🔄' },
    
    // ========== تخصصات طب الأسنان ==========
    { id: 'GeneralDentistry', name: 'طب أسنان عام', nameEn: 'General Dentistry', icon: '🦷' },
    { id: 'Orthodontics', name: 'تقويم أسنان', nameEn: 'Orthodontics', icon: '😬' },
    { id: 'OralSurgery', name: 'جراحة فم وأسنان', nameEn: 'Oral Surgery', icon: '🦷' },
    { id: 'DentalImplants', name: 'زراعة أسنان', nameEn: 'Dental Implants', icon: '🦷' },
    { id: 'Endodontics', name: 'علاج جذور', nameEn: 'Endodontics', icon: '🦷' },
    { id: 'Periodontics', name: 'علاج لثة', nameEn: 'Periodontics', icon: '🩸' },
    { id: 'PediatricDentistry', name: 'أسنان أطفال', nameEn: 'Pediatric Dentistry', icon: '👶' },
    { id: 'CosmeticDentistry', name: 'أسنان تجميل', nameEn: 'Cosmetic Dentistry', icon: '✨' },
    { id: 'GeriatricDentistry', name: 'أسنان شيخوخة', nameEn: 'Geriatric Dentistry', icon: '👴' },
    { id: 'PreventiveDentistry', name: 'أسنان وقائي', nameEn: 'Preventive Dentistry', icon: '🛡️' },
    { id: 'DigitalDentistry', name: 'أسنان رقمي', nameEn: 'Digital Dentistry', icon: '💻' },
    { id: 'RestorativeDentistry', name: 'أسنان ترميمي', nameEn: 'Restorative Dentistry', icon: '🦷' },
    { id: 'Prosthodontics', name: 'أسنان تعويضي', nameEn: 'Prosthodontics', icon: '🦷' },
  ]

  // ========== بيانات من API ==========
  const [doctors, setDoctors] = useState([])
  const [patientData, setPatientData] = useState({
    id: 1,
    name: '',
    nameEn: '',
    age: 0,
    phone: '',
    email: '',
    bloodType: '',
    allergies: [],
    chronicDiseases: [],
    doctor: '',
    doctorSpecialization: '',
    nextAppointment: '',
    nextAppointmentTime: '',
    totalSessions: 0,
    completedSessions: 0,
    progress: 0,
    diagnosis: '',
    treatmentPlan: '',
    joinDate: '',
    lastVisit: '',
    upcomingAppointments: [],
    pastAppointments: [],
    prescriptions: [],
    medicalReports: [],
    progressHistory: [],
    vitals: {
      bloodPressure: '',
      heartRate: 0,
      weight: 0,
      height: 0,
      bmi: 0
    },
    bookedAppointments: []
  })

  // المواعيد المتاحة
  const [availableSlots, setAvailableSlots] = useState([])

  // ========== تحميل البيانات ==========
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      const user = JSON.parse(userData)
      setPatientData(prev => ({ ...prev, name: user.name, nameEn: user.nameEn, email: user.email, id: user.id }))
    }
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPatientData(),
        loadDoctors(),
        loadAppointments(),
        loadPrescriptions(),
        loadReports()
      ])
    } catch (error) {
      console.error('Error loading patient data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل بيانات المريض ==========
  const loadPatientData = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => patientsService.getPatient(patientData.id),
          'patient_data',
          JSON.parse(localStorage.getItem('mcsos_patient_data') || '{}')
        )
        const data = response || {}
        setPatientData(prev => ({
          ...prev,
          ...data,
          age: data.age || 0,
          bloodType: data.bloodType || '',
          allergies: data.allergies || [],
          chronicDiseases: data.chronicDiseases || [],
          doctor: data.doctor || '',
          doctorSpecialization: data.doctorSpecialization || '',
          diagnosis: data.diagnosis || '',
          treatmentPlan: data.treatmentPlan || '',
          joinDate: data.joinDate || '',
          lastVisit: data.lastVisit || '',
          totalSessions: data.totalSessions || 0,
          completedSessions: data.completedSessions || 0,
          progress: data.progress || 0,
          vitals: data.vitals || { bloodPressure: '', heartRate: 0, weight: 0, height: 0, bmi: 0 }
        }))
        localStorage.setItem('mcsos_patient_data', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_patient_data')
        if (saved) {
          const data = JSON.parse(saved)
          setPatientData(prev => ({ ...prev, ...data }))
        }
      }
    } catch (error) {
      console.error('Error loading patient data:', error)
    }
  }

  // ========== تحميل الأطباء ==========
  const loadDoctors = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => doctorsService.getDoctors(),
          'doctors',
          JSON.parse(localStorage.getItem('mcsos_doctors') || '[]')
        )
        const data = response || []
        setDoctors(data)
        localStorage.setItem('mcsos_doctors', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_doctors')
        if (saved) setDoctors(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  // ========== تحميل المواعيد ==========
  const loadAppointments = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => appointmentsService.getAppointments({ patientId: patientData.id }),
          'appointments',
          JSON.parse(localStorage.getItem('mcsos_patient_appointments') || '[]')
        )
        const data = response || []
        const upcoming = data.filter(a => a.status === 'scheduled' || a.status === 'upcoming')
        const past = data.filter(a => a.status === 'completed' || a.status === 'past')
        setPatientData(prev => ({
          ...prev,
          upcomingAppointments: upcoming,
          pastAppointments: past
        }))
        localStorage.setItem('mcsos_patient_appointments', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_patient_appointments')
        if (saved) {
          const data = JSON.parse(saved)
          const upcoming = data.filter(a => a.status === 'scheduled' || a.status === 'upcoming')
          const past = data.filter(a => a.status === 'completed' || a.status === 'past')
          setPatientData(prev => ({ ...prev, upcomingAppointments: upcoming, pastAppointments: past }))
        }
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    }
  }

  // ========== تحميل الروشتات ==========
  const loadPrescriptions = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => prescriptionsService.getPrescriptionsByPatient(patientData.id),
          'prescriptions',
          JSON.parse(localStorage.getItem('mcsos_patient_prescriptions') || '[]')
        )
        const data = response || []
        setPatientData(prev => ({ ...prev, prescriptions: data }))
        localStorage.setItem('mcsos_patient_prescriptions', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_patient_prescriptions')
        if (saved) setPatientData(prev => ({ ...prev, prescriptions: JSON.parse(saved) }))
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error)
    }
  }

  // ========== تحميل التقارير ==========
  const loadReports = async () => {
    try {
      if (isOnline) {
        const response = await executeWithOfflineSupport(
          () => get(`/reports/patient/${patientData.id}`),
          'reports',
          JSON.parse(localStorage.getItem('mcsos_patient_reports') || '[]')
        )
        const data = response || []
        setPatientData(prev => ({ ...prev, medicalReports: data }))
        localStorage.setItem('mcsos_patient_reports', JSON.stringify(data))
      } else {
        const saved = localStorage.getItem('mcsos_patient_reports')
        if (saved) setPatientData(prev => ({ ...prev, medicalReports: JSON.parse(saved) }))
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    }
  }

  // ========== دالة مساعدة للـ GET ==========
  const get = async (endpoint) => {
    const response = await fetch(`${API_BASE.replace('/v1', '')}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mcsos_token')}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  // ========== عرض النجوم ==========
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />)
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={16} className="fill-yellow-500 text-yellow-500" />)
    }
    while (stars.length < 5) {
      stars.push(<Star key={stars.length} size={16} className="text-gray-500" />)
    }
    return stars
  }

  // ========== أيقونة التخصص ==========
  const getSpecialtyIcon = (specialty) => {
    const icons = {
      'جراحة عظام': '🦴',
      'علاج طبيعي': '💪',
      'علاج طبيعي عام': '💪',
      'علاج طبيعي رياضي': '🏃',
      'علاج طبيعي أعصاب': '🧠',
      'علاج طبيعي أطفال': '👶',
      'علاج طبيعي شيخوخة': '👴',
      'علاج طبيعي عظام': '🦴',
      'علاج طبيعي قلب': '❤️',
      'علاج وظيفي': '🤲',
      'علاج نطق': '🗣️',
      'علاج يد': '🤚',
      'علاج قاع حوض': '🫀',
      'علاج التوازن': '🔄',
      'أعصاب': '🧠',
      'جراحة أعصاب': '🧠',
      'أطفال': '👶',
      'جراحة أطفال': '👶',
      'جراحة عامة': '🔪',
      'نساء وتوليد': '🤱',
      'توليد': '🤱',
      'قلب': '❤️',
      'أمراض القلب': '❤️',
      'جلدية': '✨',
      'جراحة تجميل': '✨',
      'عيون': '👁️',
      'أنف وأذن وحنجرة': '👂',
      'مسالك بولية': '🧬',
      'جهاز هضمي': '🫃',
      'باطنية': '🫀',
      'أمراض كبد': '🫘',
      'أمراض كلى': '🫘',
      'أمراض رئة': '🫁',
      'جراحة صدر': '🫁',
      'أمراض دم': '🩸',
      'غدد صماء': '🧬',
      'أمراض سكري': '🍬',
      'روماتيزم': '🦴',
      'حساسية': '🤧',
      'أمراض معدية': '🦠',
      'طوارئ': '🚑',
      'طب أسرة': '🏠',
      'طب شيخوخة': '👴',
      'طب ألم': '💊',
      'طب نوم': '😴',
      'طب رياضي': '🏃',
      'طب نفسي': '🧠',
      'تخدير': '😷',
      'عناية مركزة': '🫀',
      'رعاية تلطيفية': '🕊️',
      'أشعة تشخيصية': '📷',
      'أشعة تداخلية': '🎯',
      'علاج إشعاعي': '☢️',
      'علاج كيميائي': '🧪',
      'جراحة أوعية دموية': '🩸',
      'جراحة حروق': '🔥',
      'جراحة مناظير': '🔬',
      'جراحة أورام': '🎗️',
      'جراحة وجه وفكين': '🦷',
      'طب أسنان عام': '🦷',
      'تقويم أسنان': '😬',
      'جراحة فم وأسنان': '🦷',
      'زراعة أسنان': '🦷',
      'علاج جذور': '🦷',
      'علاج لثة': '🩸',
      'أسنان أطفال': '👶',
      'أسنان تجميل': '✨',
      'أسنان شيخوخة': '👴',
      'أسنان وقائي': '🛡️',
      'أسنان رقمي': '💻',
      'أسنان ترميمي': '🦷',
      'أسنان تعويضي': '🦷',
    }
    return icons[specialty] || '👨‍⚕️'
  }

  // ========== تصفية الأطباء ==========
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specializationEn === selectedSpecialty || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  // ========== حجز موعد ==========
  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedDate('')
    setSelectedTime('')
    setShowBookingModal(true)
  }

  // ========== تأكيد الحجز ==========
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('الرجاء اختيار التاريخ والوقت')
      return
    }

    setIsSubmitting(true)
    try {
      const bookingData = {
        doctorId: selectedDoctor.id,
        patientId: patientData.id,
        date: selectedDate,
        time: selectedTime,
        type: bookingType === 'clinic' ? 'clinic' : 'online'
      }

      let newAppointment
      if (isOnline) {
        const response = await appointmentsService.bookAppointment(bookingData)
        newAppointment = response
      } else {
        newAppointment = {
          ...bookingData,
          id: Date.now(),
          status: 'scheduled',
          location: bookingType === 'clinic' ? 'العيادة - الطابق الأول' : 'رابط الاجتماع: سيتم إرساله لاحقاً',
          _syncPending: true
        }
        toast.info('تم الحجز في وضع عدم الاتصال')
      }

      setPatientData(prev => ({
        ...prev,
        upcomingAppointments: [newAppointment, ...prev.upcomingAppointments]
      }))

      toast.success(`تم حجز موعد مع ${selectedDoctor.name} يوم ${selectedDate} الساعة ${selectedTime}`)
      setShowBookingModal(false)
      setSelectedDoctor(null)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حجز الموعد')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== عرض تفاصيل الطبيب ==========
  const handleViewDoctorDetails = (doctor) => {
    setViewingDoctor(doctor)
    setShowDoctorDetails(true)
  }

  // ========== واتساب ==========
  const handleContactDoctor = (doctor) => {
    const phoneNumber = doctor.phone || '966500000000'
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('مرحباً دكتور، أرغب في الاستفسار عن موعد')}`
    window.open(whatsappUrl, '_blank')
    toast.success(`جاري فتح واتساب للتواصل مع ${doctor.name}`)
  }

  // ========== طباعة الروشتة ==========
  const handlePrintPrescription = (prescription) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>روشتة طبية - ${prescription.date}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; background: white; margin: 0; }
            .prescription { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a5f; }
            .doctor-name { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 10px; }
            .date { color: #6b7280; margin-top: 5px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .medication-item { background: #f3f4f6; padding: 12px; margin: 10px 0; border-radius: 8px; }
            .med-name { font-weight: bold; color: #1e3a5f; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
            @media print { body { padding: 0; } .prescription { box-shadow: none; padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="prescription">
            <div class="header">
              <div class="title">روشتة طبية</div>
              <div class="doctor-name">${prescription.doctor}</div>
              <div class="date">التاريخ: ${prescription.date}</div>
            </div>
            <div class="info-row"><span>اسم المريض:</span><strong>${patientData.name}</strong></div>
            <div class="info-row"><span>العمر:</span><strong>${patientData.age} سنة</strong></div>
            <div style="margin: 20px 0;"><h3>الأدوية الموصوفة:</h3>
              ${prescription.medications.map(med => `
                <div class="medication-item">
                  <div class="med-name">${med.name}</div>
                  <div>الجرعة: ${med.dosage}</div>
                  <div>عدد المرات: ${med.frequency}</div>
                </div>
              `).join('')}
            </div>
            ${prescription.notes ? `<div class="info-row"><span>ملاحظات:</span><strong>${prescription.notes}</strong></div>` : ''}
            <div class="footer">تم إنشاء هذه الروشتة بواسطة نظام المركز الطبي MCSOS</div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('جاري طباعة الروشتة...')
  }

  // ========== تحميل التقرير ==========
  const handleDownloadReport = (report) => {
    const reportContent = `
===================================
تقرير طبي - ${report.title}
===================================

التاريخ: ${report.date}
الدكتور: ${report.doctor}
نوع التقرير: ${report.type === 'xray' ? 'أشعة' : 'تقرير طبي'}

المحتوى:
${report.description || 'لا يوجد وصف تفصيلي'}

===================================
تم إنشاء هذا التقرير بواسطة نظام MCSOS
===================================
    `
    
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title}_${report.date}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('جاري تحميل التقرير...')
  }

  // ========== إلغاء موعد ==========
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return

    try {
      if (isOnline) {
        await appointmentsService.cancelAppointment(id, 'تم الإلغاء من قبل المريض')
      }
      setPatientData(prev => ({
        ...prev,
        upcomingAppointments: prev.upcomingAppointments.filter(apt => apt.id !== id)
      }))
      toast.success('تم إلغاء الموعد بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إلغاء الموعد')
    }
  }

  // ========== تقييم الطبيب ==========
  const handleSubmitReview = () => {
    toast.success(`شكراً لتقييمك ${reviewData.rating} نجوم`)
    setShowReviewModal(false)
    setReviewData({ rating: 5, comment: '' })
  }

  // ========== المواعيد المتاحة ==========
  const getAvailableTimesForDate = (date) => {
    if (!selectedDoctor || !selectedDoctor.availableSlots) return []
    return selectedDoctor.availableSlots
      .filter(slot => slot.date === date && slot.available)
      .map(slot => slot.time)
  }

  const getAvailableDates = () => {
    if (!selectedDoctor || !selectedDoctor.availableSlots) return []
    const dates = [...new Set(selectedDoctor.availableSlots
      .filter(slot => slot.available)
      .map(slot => slot.date))]
    return dates.sort()
  }

  // ========== تحديث البيانات ==========
  const refreshData = () => {
    loadAllData()
    toast.success('تم تحديث البيانات')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-white text-lg">جاري تحميل بياناتك الصحية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Stethoscope size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">مرحباً، {patientData.name || 'مريض'}</h1>
                  <p className="text-xs text-gray-400">
                    آخر زيارة: {patientData.lastVisit || 'لا توجد زيارات'}
                    {!isOnline && (
                      <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                        ⚡ غير متصل
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={refreshData} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition">
                <RefreshCw size={20} />
              </button>
              <div className="relative">
                <button className="relative p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white transition">
                  <Bell size={20} />
                </button>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar للهواتف */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} w-64 h-full bg-gray-800 shadow-xl p-4`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-bold">القائمة</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-2">
              <button onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><Home size={18} /> نظرة عامة</button>
              <button onClick={() => { setActiveTab('doctors'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'doctors' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><Stethoscope size={18} /> الأطباء</button>
              <button onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'appointments' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><Calendar size={18} /> مواعيدي</button>
              <button onClick={() => { setActiveTab('prescriptions'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'prescriptions' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><Pill size={18} /> الروشتات</button>
              <button onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'reports' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><FileText size={18} /> التقارير</button>
              <button onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}><User size={18} /> ملفي الشخصي</button>
            </nav>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-6">
        {/* أزرار التبويب */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('overview')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>📊 نظرة عامة</button>
          <button onClick={() => setActiveTab('doctors')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'doctors' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>👨‍⚕️ الأطباء</button>
          <button onClick={() => setActiveTab('appointments')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'appointments' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>📅 مواعيدي</button>
          <button onClick={() => setActiveTab('prescriptions')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'prescriptions' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>💊 الروشتات</button>
          <button onClick={() => setActiveTab('reports')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'reports' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>📄 التقارير</button>
          <button onClick={() => setActiveTab('profile')} className={`px-5 py-2 rounded-xl whitespace-nowrap transition ${activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>👤 ملفي الشخصي</button>
        </div>

        {/* ========== تبويب نظرة عامة ========== */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">نسبة التقدم</p><p className="text-3xl font-bold text-white">{patientData.progress || 0}%</p></div>
                  <div className="p-3 bg-blue-500/20 rounded-xl"><TrendingUp className="text-blue-400" size={28} /></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${patientData.progress || 0}%` }}></div></div>
                <p className="text-xs text-gray-400 mt-2">{patientData.completedSessions || 0}/{patientData.totalSessions || 0} جلسة مكتملة</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-3xl font-bold text-white">{patientData.completedSessions || 0}/{patientData.totalSessions || 0}</p></div>
                  <div className="p-3 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={28} /></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الموعد القادم</p><p className="text-xl font-bold text-white">{patientData.nextAppointment || 'لا يوجد'}</p></div>
                  <div className="p-3 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={28} /></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">الساعة {patientData.nextAppointmentTime || '-'}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الطبيب المعالج</p><p className="text-xl font-bold text-white">{patientData.doctor || 'غير محدد'}</p></div>
                  <div className="p-3 bg-orange-500/20 rounded-xl"><Stethoscope className="text-orange-400" size={28} /></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{patientData.doctorSpecialization || ''}</p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">📈 تقدمي العلاجي</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={patientData.progressHistory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  <Area type="monotone" dataKey="progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="نسبة التقدم %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Heart className="text-red-400" /> العلامات الحيوية</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">ضغط الدم</p><p className="text-2xl font-bold text-white">{patientData.vitals?.bloodPressure || '-'}</p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">معدل ضربات القلب</p><p className="text-2xl font-bold text-white">{patientData.vitals?.heartRate || 0} <span className="text-sm">نبضة/د</span></p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">الوزن</p><p className="text-2xl font-bold text-white">{patientData.vitals?.weight || 0} <span className="text-sm">كجم</span></p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">مؤشر كتلة الجسم</p><p className="text-2xl font-bold text-white">{patientData.vitals?.bmi || 0}</p></div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ClipboardList className="text-blue-400" /> معلومات التشخيص</h2>
                <div className="space-y-3">
                  <div><p className="text-gray-400 text-sm">التشخيص</p><p className="text-white">{patientData.diagnosis || 'لا يوجد تشخيص'}</p></div>
                  <div><p className="text-gray-400 text-sm">خطة العلاج</p><p className="text-white text-sm">{patientData.treatmentPlan || 'لا توجد خطة علاج'}</p></div>
                  <div><p className="text-gray-400 text-sm">فصيلة الدم</p><p className="text-white">{patientData.bloodType || '-'}</p></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========== تبويب الأطباء ========== */}
        {activeTab === 'doctors' && (
          <>
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" placeholder="ابحث عن طبيب بالاسم أو التخصص..." className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {specialties.map((spec) => (
                    <button key={spec.id} onClick={() => setSelectedSpecialty(spec.id)} className={`px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${selectedSpecialty === spec.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>
                      <span>{spec.icon}</span><span>{isRTL ? spec.name : spec.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-white">{doctors.length}</p><p className="text-xs text-gray-400">طبيب متخصص</p></div>
              <div className="bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-yellow-400">4.8</p><p className="text-xs text-gray-400">متوسط التقييم</p></div>
              <div className="bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-400">95%</p><p className="text-xs text-gray-400">رضا المرضى</p></div>
              <div className="bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-blue-400">25+</p><p className="text-xs text-gray-400">موعد يومياً</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl">{getSpecialtyIcon(doctor.specialization)}</div>
                        <div><h3 className="text-xl font-bold text-white">{doctor.name}</h3><p className="text-blue-400 text-sm">{doctor.specialization}</p><div className="flex items-center gap-1 mt-1">{renderStars(doctor.rating)}<span className="text-xs text-gray-400 ml-1">({doctor.reviews} تقييم)</span></div></div>
                      </div>
                      <div className="text-right"><div className="text-lg font-bold text-green-400">{doctor.price} <span className="text-xs">ر.س</span></div><p className="text-xs text-gray-400">رسوم الكشف</p></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2"><Award size={16} className="text-blue-400" /><span className="text-gray-300">خبرة {doctor.experience} سنة</span></div>
                      <div className="flex items-center gap-2"><Users size={16} className="text-green-400" /><span className="text-gray-300">{doctor.patientsCount} مريض</span></div>
                      <div className="flex items-center gap-2"><Heart size={16} className="text-red-400" /><span className="text-gray-300">نسبة رضا {doctor.satisfactionRate}%</span></div>
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-purple-400" /><span className="text-gray-300">متاح: {doctor.nextAvailable}</span></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-3 line-clamp-2">{doctor.bio}</p>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                      <button onClick={() => handleViewDoctorDetails(doctor)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"><Eye size={16} /> عرض التفاصيل</button>
                      <button onClick={() => handleBookAppointment(doctor)} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"><Calendar size={16} /> حجز موعد</button>
                      <button onClick={() => handleContactDoctor(doctor)} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"><MessageCircle size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredDoctors.length === 0 && (<div className="text-center py-12"><p className="text-gray-400">لا توجد أطباء مطابقين لبحثك</p></div>)}
          </>
        )}

        {/* ========== تبويب مواعيدي ========== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar className="text-blue-400" /> المواعيد القادمة</h2>
              <div className="space-y-3">
                {patientData.upcomingAppointments.length === 0 ? (<p className="text-gray-400 text-center py-8">لا توجد مواعيد قادمة. يمكنك حجز موعد جديد من خلال قسم الأطباء</p>) : (
                  patientData.upcomingAppointments.map(app => (
                    <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition">
                      <div className="flex items-start gap-3"><div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><CalendarDays size={24} className="text-blue-400" /></div><div><p className="font-semibold text-white">{new Date(app.date).toLocaleDateString('ar')} - {app.time}</p><p className="text-sm text-gray-400">الدكتور: {app.doctor}</p><p className="text-xs text-gray-500">النوع: {app.type} | الموقع: {app.location}</p>{app._syncPending && <span className="text-xs text-yellow-400">⏳ في انتظار المزامنة</span>}</div></div>
                      <div className="flex gap-2 mt-3 md:mt-0"><span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">⏰ قادم</span><button onClick={() => handleCancelAppointment(app.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition flex items-center gap-1"><XCircle size={14} /> إلغاء</button></div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><History className="text-green-400" /> المواعيد السابقة</h2>
              <div className="space-y-3">
                {patientData.pastAppointments.map(app => (
                  <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-start gap-3"><div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center"><CheckCircle size={24} className="text-green-400" /></div><div><p className="font-semibold text-white">{new Date(app.date).toLocaleDateString('ar')} - {app.time}</p><p className="text-sm text-gray-400">الدكتور: {app.doctor} - {app.type}</p></div></div>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✓ مكتمل</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== تبويب الروشتات ========== */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {patientData.prescriptions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">لا توجد روشتات</div>
            ) : (
              patientData.prescriptions.map(prescription => (
                <div key={prescription.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <div><h3 className="font-bold text-white flex items-center gap-2"><Pill className="text-green-400" size={18} /> روشتة طبية</h3><p className="text-xs text-gray-400">التاريخ: {prescription.date} | الدكتور: {prescription.doctor}</p></div>
                    <button onClick={() => handlePrintPrescription(prescription)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"><Printer size={18} /></button>
                  </div>
                  <div className="space-y-2">
                    {prescription.medications.map((med, idx) => (
                      <div key={idx} className="bg-gray-700/30 rounded-lg p-2"><div className="flex justify-between"><span className="font-semibold text-white">{med.name}</span><span className="text-gray-300">{med.dosage}</span></div><p className="text-xs text-gray-400">{med.frequency}</p></div>
                    ))}
                  </div>
                  {prescription.notes && <p className="text-xs text-gray-400 mt-2">📋 ملاحظات: {prescription.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== تبويب التقارير ========== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {patientData.medicalReports.length === 0 ? (
              <div className="text-center py-12 text-gray-400">لا توجد تقارير</div>
            ) : (
              patientData.medicalReports.map(report => (
                <div key={report.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition">
                  <div className="flex justify-between items-start">
                    <div><h3 className="font-semibold text-white">{report.title}</h3><p className="text-xs text-gray-400">{report.date} | الدكتور: {report.doctor}</p>{report.description && <p className="text-sm text-gray-300 mt-2">{report.description}</p>}</div>
                    <button onClick={() => handleDownloadReport(report)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"><Download size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== تبويب الملف الشخصي ========== */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4"><User size={40} className="text-white" /></div>
              <h2 className="text-xl font-bold text-white">{patientData.name}</h2><p className="text-gray-400">رقم الملف: PAT-{patientData.id}</p>
              <div className="mt-4 pt-4 border-t border-gray-700"><p className="text-sm text-gray-400 flex items-center justify-center gap-2"><Phone size={14} /> {patientData.phone}</p><p className="text-sm text-gray-400 flex items-center justify-center gap-2 mt-2"><Mail size={14} /> {patientData.email}</p></div>
            </div>
            <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">المعلومات الشخصية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-gray-400 text-sm">العمر</p><p className="text-white">{patientData.age} سنة</p></div>
                <div><p className="text-gray-400 text-sm">فصيلة الدم</p><p className="text-white">{patientData.bloodType || '-'}</p></div>
                <div><p className="text-gray-400 text-sm">تاريخ التسجيل</p><p className="text-white">{patientData.joinDate || '-'}</p></div>
                <div><p className="text-gray-400 text-sm">آخر زيارة</p><p className="text-white">{patientData.lastVisit || '-'}</p></div>
                <div className="md:col-span-2"><p className="text-gray-400 text-sm">الحساسية</p><p className="text-white">{patientData.allergies?.length > 0 ? patientData.allergies.join(', ') : 'لا توجد حساسية'}</p></div>
                <div className="md:col-span-2"><p className="text-gray-400 text-sm">الأمراض المزمنة</p><p className="text-white">{patientData.chronicDiseases?.length > 0 ? patientData.chronicDiseases.join(', ') : 'لا توجد أمراض مزمنة'}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal عرض تفاصيل الطبيب */}
      {showDoctorDetails && viewingDoctor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3"><div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl">{getSpecialtyIcon(viewingDoctor.specialization)}</div><div><h2 className="text-2xl font-bold text-white">{viewingDoctor.name}</h2><p className="text-blue-400">{viewingDoctor.specialization}</p><div className="flex items-center gap-1 mt-1">{renderStars(viewingDoctor.rating)}<span className="text-xs text-gray-400">({viewingDoctor.reviews} تقييم)</span></div></div></div>
              <button onClick={() => setShowDoctorDetails(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-2">نبذة عن الطبيب</h3><p className="text-gray-300 text-sm">{viewingDoctor.bio}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-3"><p className="text-gray-400 text-sm">📚 المؤهلات العلمية</p><ul className="text-sm text-gray-300 mt-1 list-disc list-inside">{viewingDoctor.education?.map((edu, i) => (<li key={i}>{edu}</li>))}</ul></div>
                <div className="bg-gray-700/30 rounded-lg p-3"><p className="text-gray-400 text-sm">🗣️ اللغات</p><div className="flex flex-wrap gap-1 mt-1">{viewingDoctor.languages?.map((lang, i) => (<span key={i} className="px-2 py-0.5 bg-gray-600 rounded-full text-xs text-white">{lang}</span>))}</div><p className="text-gray-400 text-sm mt-3">🏆 الجوائز</p><ul className="text-sm text-gray-300 mt-1 list-disc list-inside">{viewingDoctor.awards?.map((award, i) => (<li key={i}>{award}</li>))}</ul></div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-2">ساعات العمل</h3><div className="grid grid-cols-2 gap-2 text-sm"><div className="flex justify-between"><span className="text-gray-400">السبت:</span><span className="text-white">{viewingDoctor.clinicHours?.sat}</span></div><div className="flex justify-between"><span className="text-gray-400">الأحد:</span><span className="text-white">{viewingDoctor.clinicHours?.sun}</span></div><div className="flex justify-between"><span className="text-gray-400">الإثنين:</span><span className="text-white">{viewingDoctor.clinicHours?.mon}</span></div><div className="flex justify-between"><span className="text-gray-400">الثلاثاء:</span><span className="text-white">{viewingDoctor.clinicHours?.tue}</span></div><div className="flex justify-between"><span className="text-gray-400">الأربعاء:</span><span className="text-white">{viewingDoctor.clinicHours?.wed}</span></div></div></div>
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => { handleBookAppointment(viewingDoctor); setShowDoctorDetails(false); }} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"><Calendar size={16} /> حجز موعد</button>
                <button onClick={() => { handleContactDoctor(viewingDoctor); setShowDoctorDetails(false); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"><MessageCircle size={16} /> واتساب</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal حجز موعد */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">حجز موعد مع {selectedDoctor.name}</h2><button onClick={() => setShowBookingModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">نوع الموعد</label><div className="flex gap-3"><button onClick={() => setBookingType('clinic')} className={`flex-1 py-2 rounded-lg transition ${bookingType === 'clinic' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>🏥 كشف في العيادة</button><button onClick={() => setBookingType('online')} className={`flex-1 py-2 rounded-lg transition ${bookingType === 'online' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>💻 استشارة أونلاين</button></div></div>
              <div><label className="block text-sm text-gray-400 mb-1">اختر التاريخ</label><select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}><option value="">اختر التاريخ</option>{getAvailableDates().map(date => (<option key={date} value={date}>{new Date(date).toLocaleDateString('ar')}</option>))}</select></div>
              {selectedDate && (<div><label className="block text-sm text-gray-400 mb-1">اختر الوقت</label><div className="grid grid-cols-3 gap-2">{getAvailableTimesForDate(selectedDate).map(time => (<button key={time} onClick={() => setSelectedTime(time)} className={`py-2 rounded-lg transition ${selectedTime === time ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{time}</button>))}</div></div>)}
              <div className="bg-gray-700/30 rounded-lg p-3"><div className="flex justify-between items-center"><span className="text-gray-400">رسوم الكشف:</span><span className="text-green-400 font-bold">{selectedDoctor.price} ر.س</span></div><div className="flex justify-between items-center mt-1"><span className="text-gray-400">رسوم الخدمة:</span><span className="text-gray-300">0 ر.س</span></div><div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-600"><span className="text-white font-bold">الإجمالي:</span><span className="text-green-400 font-bold">{selectedDoctor.price} ر.س</span></div></div>
              <div className="flex gap-3 pt-4"><button onClick={handleConfirmBooking} disabled={isSubmitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><CalendarCheck size={16} /> {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}</button><button onClick={() => setShowBookingModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal تقييم الطبيب */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">تقييم الطبيب</h2><button onClick={() => setShowReviewModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-2">تقييمك</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setReviewData({...reviewData, rating: star})} className="text-2xl">{star <= reviewData.rating ? <Star className="fill-yellow-500 text-yellow-500" size={28} /> : <Star className="text-gray-500" size={28} />}</button>))}</div></div>
              <div><label className="block text-sm text-gray-400 mb-1">تعليقك</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" placeholder="شاركنا رأيك في تجربتك..." value={reviewData.comment} onChange={(e) => setReviewData({...reviewData, comment: e.target.value})} /></div>
              <div className="flex gap-3 pt-4"><button onClick={handleSubmitReview} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition">إرسال التقييم</button><button onClick={() => setShowReviewModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}