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
  Filter as FilterIcon, ChevronLeft, ChevronRight, XCircle, Briefcase
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PatientDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
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

  // قائمة التخصصات
  const specialties = [
    { id: 'all', name: 'جميع التخصصات', nameEn: 'All Specialties', icon: '🏥' },
    { id: 'Orthopedic', name: 'جراحة عظام', nameEn: 'Orthopedic', icon: '🦴' },
    { id: 'Physical Therapy', name: 'علاج طبيعي', nameEn: 'Physical Therapy', icon: '💪' },
    { id: 'Neurology', name: 'أعصاب', nameEn: 'Neurology', icon: '🧠' },
    { id: 'Pediatrics', name: 'أطفال', nameEn: 'Pediatrics', icon: '👶' },
    { id: 'General Surgery', name: 'جراحة عامة', nameEn: 'General Surgery', icon: '🔪' },
    { id: 'Dermatology', name: 'جلدية', nameEn: 'Dermatology', icon: '✨' },
    { id: 'Cardiology', name: 'قلب', nameEn: 'Cardiology', icon: '❤️' },
    { id: 'Dentistry', name: 'أسنان', nameEn: 'Dentistry', icon: '🦷' },
    { id: 'Ophthalmology', name: 'عيون', nameEn: 'Ophthalmology', icon: '👁️' },
    { id: 'ENT', name: 'أنف وأذن وحنجرة', nameEn: 'ENT', icon: '👂' },
    { id: 'Urology', name: 'مسالك بولية', nameEn: 'Urology', icon: '💧' },
    { id: 'Gynecology', name: 'نساء وتوليد', nameEn: 'Gynecology', icon: '👩' },
    { id: 'Psychiatry', name: 'طب نفسي', nameEn: 'Psychiatry', icon: '🧘' },
    { id: 'Radiology', name: 'أشعة', nameEn: 'Radiology', icon: '📷' }
  ]

  // بيانات الأطباء الكاملة
  const [doctors, setDoctors] = useState([
    { 
      id: 1, 
      name: 'د. أحمد علي', 
      nameEn: 'Dr. Ahmed Ali',
      specialization: 'جراحة عظام', 
      specializationEn: 'Orthopedic',
      experience: 15,
      rating: 4.8,
      reviews: 128,
      price: 300,
      available: true,
      image: null,
      bio: 'استشاري جراحة العظام والمفاصل، خبرة 15 سنة في المملكة المتحدة ومصر. حاصل على الزمالة البريطانية في جراحة العظام.',
      phone: '+966 50 111 2222',
      email: 'ahmed.ali@medical.com',
      education: [
        'دكتوراه في جراحة العظام - جامعة القاهرة',
        'زمالة جراحة المفاصل - المملكة المتحدة',
        'بكالوريوس الطب والجراحة - جامعة الملك سعود'
      ],
      languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
      clinicHours: {
        sat: '9:00 - 17:00',
        sun: '9:00 - 17:00',
        mon: '9:00 - 17:00',
        tue: '9:00 - 17:00',
        wed: '9:00 - 14:00',
        thu: 'off',
        fri: 'off'
      },
      availableSlots: [
        { date: '2024-05-25', time: '09:00', available: true },
        { date: '2024-05-25', time: '10:00', available: true },
        { date: '2024-05-25', time: '11:00', available: false },
        { date: '2024-05-26', time: '09:00', available: true },
        { date: '2024-05-26', time: '14:00', available: true },
        { date: '2024-05-27', time: '10:00', available: true }
      ],
      nextAvailable: '2024-05-25',
      awards: ['أفضل طبيب عظام 2023', 'جائزة التميز الطبي'],
      patientsCount: 245,
      satisfactionRate: 96
    },
    { 
      id: 2, 
      name: 'د. منى حسن', 
      nameEn: 'Dr. Mona Hassan',
      specialization: 'علاج طبيعي', 
      specializationEn: 'Physical Therapy',
      experience: 10,
      rating: 4.9,
      reviews: 95,
      price: 250,
      available: true,
      image: null,
      bio: 'أخصائية علاج طبيعي، حاصلة على دكتوراه في العلاج الطبيعي من جامعة لندن. متخصصة في إعادة التأهيل الرياضي.',
      phone: '+966 50 222 3333',
      email: 'mona.hassan@medical.com',
      education: [
        'دكتوراه في العلاج الطبيعي - جامعة لندن',
        'ماجستير في إعادة التأهيل الرياضي - جامعة القاهرة'
      ],
      languages: ['العربية', 'الإنجليزية'],
      clinicHours: {
        sat: '10:00 - 18:00',
        sun: '10:00 - 18:00',
        mon: '10:00 - 18:00',
        tue: '10:00 - 18:00',
        wed: '10:00 - 14:00',
        thu: 'off',
        fri: 'off'
      },
      availableSlots: [
        { date: '2024-05-24', time: '10:00', available: true },
        { date: '2024-05-24', time: '11:00', available: true },
        { date: '2024-05-25', time: '14:00', available: true }
      ],
      nextAvailable: '2024-05-24',
      awards: ['أفضل أخصائي علاج طبيعي 2022'],
      patientsCount: 189,
      satisfactionRate: 98
    },
    { 
      id: 3, 
      name: 'د. خالد محمود', 
      nameEn: 'Dr. Khaled Mahmoud',
      specialization: 'أعصاب', 
      specializationEn: 'Neurology',
      experience: 20,
      rating: 4.7,
      reviews: 210,
      price: 400,
      available: true,
      image: null,
      bio: 'استشاري أمراض المخ والأعصاب، زمالة أوروبية في طب الأعصاب. خبرة واسعة في علاج الصرع والتصلب المتعدد.',
      phone: '+966 50 333 4444',
      email: 'khaled.mahmoud@medical.com',
      education: [
        'دكتوراه في طب الأعصاب - جامعة باريس',
        'زمالة طب الأعصاب - ألمانيا'
      ],
      languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
      clinicHours: {
        sat: '9:00 - 15:00',
        sun: '9:00 - 15:00',
        mon: '9:00 - 15:00',
        tue: '9:00 - 15:00',
        wed: '9:00 - 12:00',
        thu: 'off',
        fri: 'off'
      },
      availableSlots: [
        { date: '2024-05-27', time: '09:00', available: true },
        { date: '2024-05-27', time: '11:00', available: true }
      ],
      nextAvailable: '2024-05-27',
      awards: ['جائزة البحث العلمي في طب الأعصاب 2021'],
      patientsCount: 312,
      satisfactionRate: 94
    },
    { 
      id: 4, 
      name: 'د. نورة سعيد', 
      nameEn: 'Dr. Noura Saeed',
      specialization: 'أطفال', 
      specializationEn: 'Pediatrics',
      experience: 12,
      rating: 4.9,
      reviews: 156,
      price: 280,
      available: true,
      image: null,
      bio: 'استشارية طب الأطفال وحديثي الولادة. حاصلة على الزمالة الكندية في طب الأطفال.',
      phone: '+966 50 444 5555',
      email: 'noura.saeed@medical.com',
      education: [
        'زمالة طب الأطفال - كندا',
        'ماجستير طب الأطفال - جامعة الملك عبدالعزيز'
      ],
      languages: ['العربية', 'الإنجليزية'],
      clinicHours: {
        sat: '9:00 - 16:00',
        sun: '9:00 - 16:00',
        mon: '9:00 - 16:00',
        tue: '9:00 - 16:00',
        wed: '9:00 - 13:00',
        thu: 'off',
        fri: 'off'
      },
      availableSlots: [
        { date: '2024-05-23', time: '14:00', available: true },
        { date: '2024-05-24', time: '09:00', available: true }
      ],
      nextAvailable: '2024-05-23',
      awards: ['أفضل طبيبة أطفال 2023'],
      patientsCount: 278,
      satisfactionRate: 97
    },
    { 
      id: 5, 
      name: 'د. محمد عبدالله', 
      nameEn: 'Dr. Mohamed Abdullah',
      specialization: 'جراحة عامة', 
      specializationEn: 'General Surgery',
      experience: 18,
      rating: 4.8,
      reviews: 180,
      price: 350,
      available: true,
      image: null,
      bio: 'استشاري الجراحة العامة والمناظير. خبرة في جراحات السمنة والمناظير المتقدمة.',
      phone: '+966 50 555 6666',
      email: 'mohamed.abdullah@medical.com',
      education: [
        'دكتوراه في الجراحة العامة - جامعة القاهرة',
        'زمالة جراحة المناظير - فرنسا'
      ],
      languages: ['العربية', 'الإنجليزية'],
      clinicHours: {
        sat: '8:00 - 16:00',
        sun: '8:00 - 16:00',
        mon: '8:00 - 16:00',
        tue: '8:00 - 16:00',
        wed: '8:00 - 12:00',
        thu: 'off',
        fri: 'off'
      },
      availableSlots: [
        { date: '2024-05-26', time: '10:00', available: true },
        { date: '2024-05-26', time: '11:00', available: true }
      ],
      nextAvailable: '2024-05-26',
      awards: ['جائزة الابتكار في الجراحة 2022'],
      patientsCount: 367,
      satisfactionRate: 95
    },
    { 
      id: 6, 
      name: 'د. سارة أحمد', 
      nameEn: 'Dr. Sara Ahmed',
      specialization: 'جلدية', 
      specializationEn: 'Dermatology',
      experience: 8,
      rating: 4.8,
      reviews: 89,
      price: 320,
      available: true,
      image: null,
      bio: 'أخصائية الأمراض الجلدية والتجميل. خبرة في علاج حب الشباب والليزر والتقشير الكيميائي.',
      phone: '+966 50 666 7777',
      email: 'sara.ahmed@medical.com',
      education: [
        'ماجستير الأمراض الجلدية - جامعة عين شمس',
        'دبلوم التجميل الطبي - لندن'
      ],
      languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
      clinicHours: {
        sat: '10:00 - 18:00',
        sun: '10:00 - 18:00',
        mon: '10:00 - 18:00',
        tue: '10:00 - 18:00',
        wed: '10:00 - 14:00',
        thu: 'off',
        fri: 'off'
      },
      availableSlots: [
        { date: '2024-05-28', time: '10:00', available: true },
        { date: '2024-05-28', time: '11:00', available: true }
      ],
      nextAvailable: '2024-05-28',
      awards: ['أفضل طبيبة جلدية 2023'],
      patientsCount: 156,
      satisfactionRate: 96
    }
  ])

  // بيانات المريض
  const [patientData, setPatientData] = useState({
    id: 1,
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    age: 35,
    phone: '+966 50 123 4567',
    email: 'ahmed@example.com',
    bloodType: 'O+',
    allergies: ['لا يوجد'],
    chronicDiseases: ['لا يوجد'],
    doctor: 'د. أحمد علي',
    doctorSpecialization: 'جراحة عظام',
    nextAppointment: '2024-05-25',
    nextAppointmentTime: '10:00',
    totalSessions: 12,
    completedSessions: 8,
    progress: 66.7,
    diagnosis: 'تمزق في الرباط الصليبي',
    treatmentPlan: 'علاج طبيعي مكثف + تمارين إطالة',
    joinDate: '2024-01-15',
    lastVisit: '2024-05-18',
    upcomingAppointments: [
      { id: 1, date: '2024-05-25', time: '10:00', doctor: 'د. أحمد علي', type: 'جلسة علاج', status: 'upcoming' },
      { id: 2, date: '2024-05-28', time: '11:00', doctor: 'د. أحمد علي', type: 'متابعة', status: 'upcoming' },
    ],
    pastAppointments: [
      { id: 1, date: '2024-05-18', time: '10:00', doctor: 'د. أحمد علي', type: 'جلسة علاج', status: 'completed' },
      { id: 2, date: '2024-05-15', time: '11:00', doctor: 'د. أحمد علي', type: 'متابعة', status: 'completed' },
    ],
    prescriptions: [
      { id: 1, date: '2024-05-15', doctor: 'د. أحمد علي', medications: [{ name: 'بروفين', dosage: '500mg', frequency: 'مرتين يومياً' }], notes: 'تناول بعد الأكل' },
    ],
    medicalReports: [
      { id: 1, title: 'تقرير الأشعة', date: '2024-05-10', type: 'xray', doctor: 'د. أحمد علي', description: 'تظهر الأشعة تحسناً ملحوظاً في حالة المفصل مع اختفاء الالتهاب' },
    ],
    progressHistory: [
      { date: '2024-05-01', progress: 0, note: 'بداية العلاج' },
      { date: '2024-05-08', progress: 25, note: 'تحسن ملحوظ' },
      { date: '2024-05-15', progress: 50, note: 'استمرار التحسن' },
      { date: '2024-05-20', progress: 66.7, note: 'تقدم جيد' },
    ],
    vitals: {
      bloodPressure: '120/80',
      heartRate: 72,
      weight: 75,
      height: 175,
      bmi: 24.5
    },
    bookedAppointments: []
  })

  // المواعيد المتاحة
  const [availableSlots, setAvailableSlots] = useState([])

  useEffect(() => {
    setTimeout(() => {
      const userData = localStorage.getItem('mcsos_user')
      if (userData) {
        const user = JSON.parse(userData)
        setPatientData(prev => ({ ...prev, name: user.name, nameEn: user.nameEn, email: user.email }))
      }
      setPatient(patientData)
      setLoading(false)
      
      const allSlots = doctors.flatMap(doctor => 
        doctor.availableSlots
          .filter(slot => slot.available)
          .map(slot => ({
            id: `${doctor.id}-${slot.date}-${slot.time}`,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialization: doctor.specialization,
            date: slot.date,
            time: slot.time,
            price: doctor.price,
            available: true
          }))
      )
      setAvailableSlots(allSlots)
    }, 500)
  }, [])

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

  const getSpecialtyIcon = (specialty) => {
    const icons = {
      'جراحة عظام': '🦴',
      'علاج طبيعي': '💪',
      'أعصاب': '🧠',
      'أطفال': '👶',
      'جراحة عامة': '🔪',
      'جلدية': '✨'
    }
    return icons[specialty] || '👨‍⚕️'
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specializationEn === selectedSpecialty || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedDate('')
    setSelectedTime('')
    setShowBookingModal(true)
  }

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('الرجاء اختيار التاريخ والوقت')
      return
    }

    const newAppointment = {
      id: Date.now(),
      date: selectedDate,
      time: selectedTime,
      doctor: selectedDoctor.name,
      doctorId: selectedDoctor.id,
      type: bookingType === 'clinic' ? 'كشف طبي' : 'استشارة أونلاين',
      status: 'upcoming',
      location: bookingType === 'clinic' ? 'العيادة - الطابق الأول' : 'رابط الاجتماع: سيتم إرساله لاحقاً'
    }

    setPatientData(prev => ({
      ...prev,
      upcomingAppointments: [...prev.upcomingAppointments, newAppointment]
    }))

    toast.success(`تم حجز موعد مع ${selectedDoctor.name} يوم ${selectedDate} الساعة ${selectedTime}`)
    setShowBookingModal(false)
    setSelectedDoctor(null)
  }

  const handleViewDoctorDetails = (doctor) => {
    setViewingDoctor(doctor)
    setShowDoctorDetails(true)
  }

  // ========== دالة واتساب ==========
  const handleContactDoctor = (doctor) => {
    const phoneNumber = doctor.phone || '966500000000'
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('مرحباً دكتور، أرغب في الاستفسار عن موعد')}`
    window.open(whatsappUrl, '_blank')
    toast.success(`جاري فتح واتساب للتواصل مع ${doctor.name}`)
  }

  // ========== دالة طباعة الروشتة ==========
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

  // ========== دالة تحميل التقرير ==========
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

  const handleCancelAppointment = (id) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) {
      setPatientData(prev => ({
        ...prev,
        upcomingAppointments: prev.upcomingAppointments.filter(apt => apt.id !== id)
      }))
      toast.success('تم إلغاء الموعد بنجاح')
    }
  }

  const handleSubmitReview = () => {
    toast.success(`شكراً لتقييمك ${reviewData.rating} نجوم`)
    setShowReviewModal(false)
    setReviewData({ rating: 5, comment: '' })
  }

  const getAvailableTimesForDate = (date) => {
    if (!selectedDoctor) return []
    return selectedDoctor.availableSlots
      .filter(slot => slot.date === date && slot.available)
      .map(slot => slot.time)
  }

  const getAvailableDates = () => {
    if (!selectedDoctor) return []
    const dates = [...new Set(selectedDoctor.availableSlots
      .filter(slot => slot.available)
      .map(slot => slot.date))]
    return dates.sort()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل بياناتك الصحية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                  <h1 className="text-xl font-bold text-white">مرحباً، {patient?.name}</h1>
                  <p className="text-xs text-gray-400">آخر زيارة: {new Date(patientData.lastVisit).toLocaleDateString('ar')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                  <div><p className="text-gray-400 text-sm">نسبة التقدم</p><p className="text-3xl font-bold text-white">{patient?.progress}%</p></div>
                  <div className="p-3 bg-blue-500/20 rounded-xl"><TrendingUp className="text-blue-400" size={28} /></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${patient?.progress}%` }}></div></div>
                <p className="text-xs text-gray-400 mt-2">{patient?.completedSessions}/{patient?.totalSessions} جلسة مكتملة</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-3xl font-bold text-white">{patient?.completedSessions}/{patient?.totalSessions}</p></div>
                  <div className="p-3 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={28} /></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الموعد القادم</p><p className="text-xl font-bold text-white">{patient?.nextAppointment}</p></div>
                  <div className="p-3 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={28} /></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">الساعة {patient?.nextAppointmentTime}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">الطبيب المعالج</p><p className="text-xl font-bold text-white">{patient?.doctor}</p></div>
                  <div className="p-3 bg-orange-500/20 rounded-xl"><Stethoscope className="text-orange-400" size={28} /></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{patient?.doctorSpecialization}</p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">📈 تقدمي العلاجي</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={patientData.progressHistory}>
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
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">ضغط الدم</p><p className="text-2xl font-bold text-white">{patientData.vitals.bloodPressure}</p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">معدل ضربات القلب</p><p className="text-2xl font-bold text-white">{patientData.vitals.heartRate} <span className="text-sm">نبضة/د</span></p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">الوزن</p><p className="text-2xl font-bold text-white">{patientData.vitals.weight} <span className="text-sm">كجم</span></p></div>
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center"><p className="text-gray-400 text-sm">مؤشر كتلة الجسم</p><p className="text-2xl font-bold text-white">{patientData.vitals.bmi}</p></div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ClipboardList className="text-blue-400" /> معلومات التشخيص</h2>
                <div className="space-y-3">
                  <div><p className="text-gray-400 text-sm">التشخيص</p><p className="text-white">{patientData.diagnosis}</p></div>
                  <div><p className="text-gray-400 text-sm">خطة العلاج</p><p className="text-white text-sm">{patientData.treatmentPlan}</p></div>
                  <div><p className="text-gray-400 text-sm">فصيلة الدم</p><p className="text-white">{patientData.bloodType}</p></div>
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
                      <div className="flex items-start gap-3"><div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><CalendarDays size={24} className="text-blue-400" /></div><div><p className="font-semibold text-white">{new Date(app.date).toLocaleDateString('ar')} - {app.time}</p><p className="text-sm text-gray-400">الدكتور: {app.doctor}</p><p className="text-xs text-gray-500">النوع: {app.type} | الموقع: {app.location}</p></div></div>
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

        {/* ========== تبويب الروشتات مع زر طباعة يعمل ========== */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {patientData.prescriptions.map(prescription => (
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
            ))}
          </div>
        )}

        {/* ========== تبويب التقارير مع زر تحميل يعمل ========== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {patientData.medicalReports.map(report => (
              <div key={report.id} className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition">
                <div className="flex justify-between items-start">
                  <div><h3 className="font-semibold text-white">{report.title}</h3><p className="text-xs text-gray-400">{report.date} | الدكتور: {report.doctor}</p>{report.description && <p className="text-sm text-gray-300 mt-2">{report.description}</p>}</div>
                  <button onClick={() => handleDownloadReport(report)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"><Download size={18} /></button>
                </div>
              </div>
            ))}
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
                <div><p className="text-gray-400 text-sm">فصيلة الدم</p><p className="text-white">{patientData.bloodType}</p></div>
                <div><p className="text-gray-400 text-sm">تاريخ التسجيل</p><p className="text-white">{patientData.joinDate}</p></div>
                <div><p className="text-gray-400 text-sm">آخر زيارة</p><p className="text-white">{patientData.lastVisit}</p></div>
                <div className="md:col-span-2"><p className="text-gray-400 text-sm">الحساسية</p><p className="text-white">{patientData.allergies.join(', ')}</p></div>
                <div className="md:col-span-2"><p className="text-gray-400 text-sm">الأمراض المزمنة</p><p className="text-white">{patientData.chronicDiseases.join(', ')}</p></div>
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
              <div className="bg-gray-700/30 rounded-lg p-4"><h3 className="font-bold text-white mb-2">ساعات العمل</h3><div className="grid grid-cols-2 gap-2 text-sm"><div className="flex justify-between"><span className="text-gray-400">السبت:</span><span className="text-white">{viewingDoctor.clinicHours.sat}</span></div><div className="flex justify-between"><span className="text-gray-400">الأحد:</span><span className="text-white">{viewingDoctor.clinicHours.sun}</span></div><div className="flex justify-between"><span className="text-gray-400">الإثنين:</span><span className="text-white">{viewingDoctor.clinicHours.mon}</span></div><div className="flex justify-between"><span className="text-gray-400">الثلاثاء:</span><span className="text-white">{viewingDoctor.clinicHours.tue}</span></div><div className="flex justify-between"><span className="text-gray-400">الأربعاء:</span><span className="text-white">{viewingDoctor.clinicHours.wed}</span></div></div></div>
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
              <div className="flex gap-3 pt-4"><button onClick={handleConfirmBooking} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"><CalendarCheck size={16} /> تأكيد الحجز</button><button onClick={() => setShowBookingModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">إلغاء</button></div>
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