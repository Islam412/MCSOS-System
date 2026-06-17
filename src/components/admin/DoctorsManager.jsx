// src/components/admin/DoctorsManager.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Stethoscope, Plus, Edit, Trash2, Calendar, Clock, 
  DollarSign, Award, Phone, Mail, MapPin, X, Save,
  Eye, Star, Users, Heart, Brain, Bone, Activity,
  ChevronLeft, ChevronRight, Search, Filter, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// مفتاح التخزين في localStorage
const STORAGE_KEYS = {
  DOCTORS: 'mcsos_doctors_v2',
  APPOINTMENTS: 'mcsos_appointments_v2',
  SPECIALTIES: 'mcsos_specialties'
}

// دالة مساعدة للوصول إلى localStorage مع التعامل مع الأخطاء
const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key}:`, error)
    return null
  }
}

// التخصصات الطبية الافتراضية
const defaultSpecialties = [
  { id: 'orthopedic', nameAr: 'جراحة عظام', nameEn: 'Orthopedic Surgery', icon: '🦴' },
  { id: 'physical_therapy', nameAr: 'علاج طبيعي', nameEn: 'Physical Therapy', icon: '💪' },
  { id: 'neurology', nameAr: 'أعصاب', nameEn: 'Neurology', icon: '🧠' },
  { id: 'pediatrics', nameAr: 'أطفال', nameEn: 'Pediatrics', icon: '👶' },
  { id: 'general_surgery', nameAr: 'جراحة عامة', nameEn: 'General Surgery', icon: '🔪' },
  { id: 'dermatology', nameAr: 'جلدية', nameEn: 'Dermatology', icon: '✨' },
  { id: 'cardiology', nameAr: 'قلب', nameEn: 'Cardiology', icon: '❤️' },
  { id: 'dentistry', nameAr: 'أسنان', nameEn: 'Dentistry', icon: '🦷' },
  { id: 'ophthalmology', nameAr: 'عيون', nameEn: 'Ophthalmology', icon: '👁️' },
  { id: 'ent', nameAr: 'أنف وأذن وحنجرة', nameEn: 'ENT', icon: '👂' },
  { id: 'urology', nameAr: 'مسالك بولية', nameEn: 'Urology', icon: '💧' },
  { id: 'gynecology', nameAr: 'نساء وتوليد', nameEn: 'Gynecology', icon: '👩' }
]

// الأطباء الافتراضيون
const defaultDoctors = [
  {
    id: 1,
    nameAr: 'د. أحمد علي',
    nameEn: 'Dr. Ahmed Ali',
    specialization: 'orthopedic',
    specializationAr: 'جراحة عظام',
    specializationEn: 'Orthopedic Surgery',
    experience: 15,
    rating: 4.8,
    reviews: 128,
    price: 300,
    phone: '+966 50 111 2222',
    email: 'ahmed.ali@medical.com',
    bioAr: 'استشاري جراحة العظام والمفاصل، خبرة 15 سنة في المملكة المتحدة ومصر',
    bioEn: 'Consultant Orthopedic Surgery, 15 years experience',
    educationAr: ['دكتوراه في جراحة العظام - جامعة القاهرة', 'زمالة جراحة المفاصل - المملكة المتحدة'],
    educationEn: ['PhD in Orthopedic Surgery', 'Fellowship in Joint Surgery'],
    languages: ['العربية', 'English', 'Français'],
    awards: ['أفضل طبيب عظام 2023', 'جائزة التميز الطبي'],
    patientsCount: 245,
    satisfactionRate: 96,
    workDays: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'],
    workHours: {
      start: '09:00',
      end: '17:00'
    },
    availableSlots: [
      { date: '2024-05-25', time: '09:00', available: true },
      { date: '2024-05-25', time: '10:00', available: true },
      { date: '2024-05-25', time: '11:00', available: false },
      { date: '2024-05-26', time: '09:00', available: true },
      { date: '2024-05-26', time: '14:00', available: true }
    ],
    isActive: true
  },
  {
    id: 2,
    nameAr: 'د. منى حسن',
    nameEn: 'Dr. Mona Hassan',
    specialization: 'physical_therapy',
    specializationAr: 'علاج طبيعي',
    specializationEn: 'Physical Therapy',
    experience: 10,
    rating: 4.9,
    reviews: 95,
    price: 250,
    phone: '+966 50 222 3333',
    email: 'mona.hassan@medical.com',
    bioAr: 'أخصائية علاج طبيعي، حاصلة على دكتوراه في العلاج الطبيعي',
    bioEn: 'Physical Therapy Specialist, PhD in Physical Therapy',
    educationAr: ['دكتوراه في العلاج الطبيعي - جامعة لندن', 'ماجستير في إعادة التأهيل الرياضي'],
    educationEn: ['PhD in Physical Therapy', 'Master in Sports Rehabilitation'],
    languages: ['العربية', 'English'],
    awards: ['أفضل أخصائي علاج طبيعي 2022'],
    patientsCount: 189,
    satisfactionRate: 98,
    workDays: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'],
    workHours: { start: '10:00', end: '18:00' },
    availableSlots: [
      { date: '2024-05-24', time: '10:00', available: true },
      { date: '2024-05-24', time: '11:00', available: true }
    ],
    isActive: true
  }
]

export default function DoctorsManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()

  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // نموذج إضافة/تعديل طبيب
  const [doctorForm, setDoctorForm] = useState({
    nameAr: '', nameEn: '', specialization: '', experience: '', price: '',
    phone: '', email: '', bioAr: '', bioEn: '', workDays: [], workHours: { start: '09:00', end: '17:00' }
  })
  
  // نموذج إضافة موعد
  const [slotForm, setSlotForm] = useState({
    date: '', time: '', available: true
  })

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadData()
  }, [])

  // ========== دالة تحميل البيانات المتكاملة ==========
  const loadData = async () => {
    setLoading(true)
    try {
      // 1. تحميل التخصصات (من localStorage دائماً)
      const savedSpecialties = getLocalData(STORAGE_KEYS.SPECIALTIES)
      if (savedSpecialties) {
        setSpecialties(savedSpecialties)
      } else {
        setSpecialties(defaultSpecialties)
        localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(defaultSpecialties))
      }

      // 2. تحميل الأطباء (مع دعم API)
      if (isOnline) {
        try {
          // محاولة جلب البيانات من الخادم
          const response = await executeWithOfflineSupport(
            () => doctorsService.getDoctors(),
            'doctors',
            getLocalData(STORAGE_KEYS.DOCTORS)
          )
          
          // التحقق من هيكل الاستجابة
          if (response && response.doctors) {
            setDoctors(response.doctors)
            // تحديث localStorage
            localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(response.doctors))
          } else if (response && Array.isArray(response)) {
            // إذا كانت الاستجابة مصفوفة مباشرة
            setDoctors(response)
            localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(response))
          } else {
            // إذا لم تكن هناك بيانات، استخدام البيانات المحلية
            loadLocalDoctors()
          }
        } catch (apiError) {
          console.warn('API request failed, falling back to local data:', apiError)
          loadLocalDoctors()
        }
      } else {
        // وضع غير متصل - استخدام البيانات المحلية
        loadLocalDoctors()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
      // محاولة التحميل من localStorage كحل أخير
      loadLocalDoctors()
    } finally {
      setLoading(false)
    }
  }

  // ========== تحميل الأطباء من localStorage ==========
  const loadLocalDoctors = () => {
    const savedDoctors = getLocalData(STORAGE_KEYS.DOCTORS)
    if (savedDoctors && savedDoctors.length > 0) {
      setDoctors(savedDoctors)
    } else {
      setDoctors(defaultDoctors)
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(defaultDoctors))
    }
  }

  // ========== حفظ الأطباء (محلي + API) ==========
  const saveDoctors = async (newDoctors) => {
    // حفظ محلياً
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(newDoctors))
    setDoctors(newDoctors)
    
    // محاولة المزامنة مع الخادم إذا كان متصلاً
    if (isOnline) {
      try {
        // ملاحظة: هذا يفترض وجود endpoint لتحديث قائمة الأطباء بالكامل
        // أو يمكن تنفيذ مزامنة فردية لكل طبيب
        await doctorsService.syncDoctors(newDoctors)
      } catch (error) {
        console.warn('Failed to sync doctors with server:', error)
        // لا نعرض رسالة خطأ للمستخدم لأن البيانات محفوظة محلياً
      }
    }
    
    // إشعار التحديث
    window.dispatchEvent(new Event('doctorsUpdated'))
  }

  // ========== إضافة طبيب جديد (مع دعم API) ==========
  const handleAddDoctor = async () => {
    if (!doctorForm.nameAr || !doctorForm.specialization || !doctorForm.price) {
      toast.error('الرجاء ملء الحقول الأساسية')
      return
    }

    setIsSubmitting(true)
    try {
      const specializationObj = specialties.find(s => s.id === doctorForm.specialization)
      
      const newDoctorData = {
        nameAr: doctorForm.nameAr,
        nameEn: doctorForm.nameEn || doctorForm.nameAr,
        specialization: doctorForm.specialization,
        specializationAr: specializationObj?.nameAr || doctorForm.specialization,
        specializationEn: specializationObj?.nameEn || doctorForm.specialization,
        experience: parseInt(doctorForm.experience) || 0,
        price: parseInt(doctorForm.price),
        phone: doctorForm.phone || '',
        email: doctorForm.email || '',
        bioAr: doctorForm.bioAr || '',
        bioEn: doctorForm.bioEn || '',
        workDays: doctorForm.workDays,
        workHours: doctorForm.workHours,
        isActive: true
      }

      let newDoctor

      if (isOnline) {
        try {
          // محاولة الإضافة عبر الخادم
          newDoctor = await doctorsService.createDoctor(newDoctorData)
          // إذا نجحت العملية، نضيف الطبيب للقائمة المحلية
          const updatedDoctors = [...doctors, newDoctor]
          localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updatedDoctors))
          setDoctors(updatedDoctors)
        } catch (apiError) {
          console.warn('API create failed, saving locally:', apiError)
          // في حالة فشل API، نحفظ محلياً مع علامة معلقة
          newDoctor = {
            ...newDoctorData,
            id: Date.now(),
            _syncPending: true
          }
          const updatedDoctors = [...doctors, newDoctor]
          localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updatedDoctors))
          setDoctors(updatedDoctors)
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        // وضع غير متصل - حفظ محلياً مع علامة معلقة
        newDoctor = {
          ...newDoctorData,
          id: Date.now(),
          _syncPending: true
        }
        const updatedDoctors = [...doctors, newDoctor]
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updatedDoctors))
        setDoctors(updatedDoctors)
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      toast.success('تم إضافة الطبيب بنجاح')
      setShowDoctorModal(false)
      resetDoctorForm()
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إضافة الطبيب')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== تعديل طبيب ==========
  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor)
    setDoctorForm({
      nameAr: doctor.nameAr,
      nameEn: doctor.nameEn,
      specialization: doctor.specialization,
      experience: doctor.experience,
      price: doctor.price,
      phone: doctor.phone,
      email: doctor.email,
      bioAr: doctor.bioAr,
      bioEn: doctor.bioEn,
      workDays: doctor.workDays || [],
      workHours: doctor.workHours || { start: '09:00', end: '17:00' }
    })
    setShowDoctorModal(true)
  }

  // ========== حفظ تعديل الطبيب (مع دعم API) ==========
  const handleSaveDoctorEdit = async () => {
    setIsSubmitting(true)
    try {
      const updatedDoctorData = {
        nameAr: doctorForm.nameAr,
        nameEn: doctorForm.nameEn,
        specialization: doctorForm.specialization,
        specializationAr: specialties.find(s => s.id === doctorForm.specialization)?.nameAr || doctorForm.specialization,
        specializationEn: specialties.find(s => s.id === doctorForm.specialization)?.nameEn || doctorForm.specialization,
        experience: parseInt(doctorForm.experience),
        price: parseInt(doctorForm.price),
        phone: doctorForm.phone,
        email: doctorForm.email,
        bioAr: doctorForm.bioAr,
        bioEn: doctorForm.bioEn,
        workDays: doctorForm.workDays,
        workHours: doctorForm.workHours
      }

      let updatedDoctors

      if (isOnline) {
        try {
          // محاولة التحديث عبر الخادم
          await doctorsService.updateDoctor(editingDoctor.id, updatedDoctorData)
          // تحديث محلياً
          updatedDoctors = doctors.map(d => 
            d.id === editingDoctor.id ? {
              ...d,
              ...updatedDoctorData,
              _syncPending: false
            } : d
          )
        } catch (apiError) {
          console.warn('API update failed, saving locally:', apiError)
          // تحديث محلياً مع علامة معلقة
          updatedDoctors = doctors.map(d => 
            d.id === editingDoctor.id ? {
              ...d,
              ...updatedDoctorData,
              _syncPending: true
            } : d
          )
          toast.warning('تم الحفظ محلياً، سيتم المزامنة عند الاتصال')
        }
      } else {
        // وضع غير متصل
        updatedDoctors = doctors.map(d => 
          d.id === editingDoctor.id ? {
            ...d,
            ...updatedDoctorData,
            _syncPending: true
          } : d
        )
        toast.info('تم الحفظ في وضع عدم الاتصال')
      }

      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updatedDoctors))
      setDoctors(updatedDoctors)
      
      toast.success('تم تحديث بيانات الطبيب')
      setShowDoctorModal(false)
      setEditingDoctor(null)
      resetDoctorForm()
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث الطبيب')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف طبيب (مع دعم API) ==========
  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return

    try {
      if (isOnline) {
        try {
          await doctorsService.deleteDoctor(id)
        } catch (apiError) {
          console.warn('API delete failed, removing locally:', apiError)
        }
      }
      
      // حذف محلياً
      const updatedDoctors = doctors.filter(d => d.id !== id)
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updatedDoctors))
      setDoctors(updatedDoctors)
      toast.success('تم حذف الطبيب')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الطبيب')
    }
  }

  // ========== إضافة موعد جديد ==========
  const handleAddSlot = (doctor) => {
    setSelectedDoctor(doctor)
    setSlotForm({ date: '', time: '', available: true })
    setShowSlotModal(true)
  }

  // ========== حفظ الموعد الجديد ==========
  const handleSaveSlot = () => {
    if (!slotForm.date || !slotForm.time) {
      toast.error('الرجاء اختيار التاريخ والوقت')
      return
    }

    const updatedDoctors = doctors.map(d => {
      if (d.id === selectedDoctor.id) {
        const newSlot = {
          date: slotForm.date,
          time: slotForm.time,
          available: slotForm.available
        }
        const existingSlots = d.availableSlots || []
        const slotExists = existingSlots.some(s => s.date === slotForm.date && s.time === slotForm.time)
        
        if (slotExists) {
          toast.error('هذا الموعد موجود بالفعل')
          return d
        }
        
        return { ...d, availableSlots: [...existingSlots, newSlot] }
      }
      return d
    })
    
    saveDoctors(updatedDoctors)
    toast.success('تم إضافة الموعد بنجاح')
    setShowSlotModal(false)
  }

  // ========== حذف موعد ==========
  const handleDeleteSlot = (doctorId, slotIndex) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      const updatedDoctors = doctors.map(d => {
        if (d.id === doctorId) {
          const newSlots = [...(d.availableSlots || [])]
          newSlots.splice(slotIndex, 1)
          return { ...d, availableSlots: newSlots }
        }
        return d
      })
      saveDoctors(updatedDoctors)
      toast.success('تم حذف الموعد')
    }
  }

  // ========== تغيير حالة الموعد ==========
  const toggleSlotAvailability = (doctorId, slotIndex) => {
    const updatedDoctors = doctors.map(d => {
      if (d.id === doctorId) {
        const newSlots = [...(d.availableSlots || [])]
        newSlots[slotIndex] = { ...newSlots[slotIndex], available: !newSlots[slotIndex].available }
        return { ...d, availableSlots: newSlots }
      }
      return d
    })
    saveDoctors(updatedDoctors)
    toast.success('تم تحديث حالة الموعد')
  }

  // ========== دوال مساعدة ==========
  const resetDoctorForm = () => {
    setDoctorForm({
      nameAr: '', nameEn: '', specialization: '', experience: '', price: '',
      phone: '', email: '', bioAr: '', bioEn: '', workDays: [], workHours: { start: '09:00', end: '17:00' }
    })
  }

  const toggleWorkDay = (day) => {
    setDoctorForm(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day) 
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }))
  }

  // ========== التصفية والبحث ==========
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.nameAr.includes(searchTerm) || 
                          doctor.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specializationAr.includes(searchTerm)
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty && doctor.isActive !== false
  })

  const workDaysList = [
    { id: 'saturday', nameAr: 'السبت', nameEn: 'Saturday' },
    { id: 'sunday', nameAr: 'الأحد', nameEn: 'Sunday' },
    { id: 'monday', nameAr: 'الإثنين', nameEn: 'Monday' },
    { id: 'tuesday', nameAr: 'الثلاثاء', nameEn: 'Tuesday' },
    { id: 'wednesday', nameAr: 'الأربعاء', nameEn: 'Wednesday' },
    { id: 'thursday', nameAr: 'الخميس', nameEn: 'Thursday' },
    { id: 'friday', nameAr: 'الجمعة', nameEn: 'Friday' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header مع حالة الاتصال */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">إدارة الأطباء</h1>
          <p className="text-gray-400 mt-1">
            إضافة وتعديل وحذف الأطباء والمواعيد
            {!isOnline && (
              <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                ⚡ غير متصل
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={() => { setEditingDoctor(null); resetDoctorForm(); setShowDoctorModal(true); }}
          disabled={isSubmitting}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> إضافة طبيب جديد
        </button>
      </div>

      {/* بحث وتصفية */}
      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن طبيب..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="all">جميع التخصصات</option>
            {specialties.map(spec => (
              <option key={spec.id} value={spec.id}>{isRTL ? spec.nameAr : spec.nameEn}</option>
            ))}
          </select>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl flex items-center gap-2 border border-blue-500/30 transition"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
        </div>
      </div>

      {/* قائمة الأطباء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
            <p>لا توجد أطباء مطابقين للبحث</p>
          </div>
        ) : (
          filteredDoctors.map(doctor => {
            // التحقق من وجود علامة معلقة
            const isPending = doctor._syncPending === true
            
            return (
              <div key={doctor.id} className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl">
                        {specialties.find(s => s.id === doctor.specialization)?.icon || '👨‍⚕️'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {doctor.nameAr}
                          {isPending && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                              ⏳ مزامنة
                            </span>
                          )}
                        </h3>
                        <p className="text-blue-400 text-sm">{doctor.specializationAr}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                          <span className="text-white text-sm">{doctor.rating || 0}</span>
                          <span className="text-xs text-gray-400">({doctor.reviews || 0} تقييم)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">{doctor.price} <span className="text-xs">ر.س</span></div>
                      <p className="text-xs text-gray-400">رسوم الكشف</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2"><Award size={14} className="text-blue-400" /><span className="text-gray-300">{doctor.experience || 0} سنة خبرة</span></div>
                    <div className="flex items-center gap-2"><Users size={14} className="text-green-400" /><span className="text-gray-300">{doctor.patientsCount || 0} مريض</span></div>
                    <div className="flex items-center gap-2"><Heart size={14} className="text-red-400" /><span className="text-gray-300">نسبة رضا {doctor.satisfactionRate || 0}%</span></div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-purple-400" /><span className="text-gray-300 text-xs">{doctor.phone || '—'}</span></div>
                  </div>

                  {/* المواعيد المتاحة */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-400 flex items-center gap-1"><Clock size={14} /> المواعيد المتاحة</p>
                      <button onClick={() => handleAddSlot(doctor)} className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition">
                        <Plus size={12} /> إضافة موعد
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                        doctor.availableSlots.map((slot, idx) => (
                          <div key={idx} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${slot.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <span>{slot.date?.substring(5) || slot.date}</span>
                            <span>{slot.time}</span>
                            <button onClick={() => toggleSlotAvailability(doctor.id, idx)} className="hover:opacity-70 transition">
                              {slot.available ? '✓' : '✗'}
                            </button>
                            <button onClick={() => handleDeleteSlot(doctor.id, idx)} className="text-red-400 hover:text-red-300 transition">×</button>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">لا توجد مواعيد</span>
                      )}
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                    <button onClick={() => handleEditDoctor(doctor)} className="flex-1 bg-yellow-500/20 text-yellow-400 py-1.5 rounded-lg text-sm hover:bg-yellow-500/30 transition flex items-center justify-center gap-1">
                      <Edit size={14} /> تعديل
                    </button>
                    <button onClick={() => handleDeleteDoctor(doctor.id)} className="flex-1 bg-red-500/20 text-red-400 py-1.5 rounded-lg text-sm hover:bg-red-500/30 transition flex items-center justify-center gap-1">
                      <Trash2 size={14} /> حذف
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ========== Modal إضافة/تعديل طبيب ========== */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingDoctor ? 'تعديل طبيب' : 'إضافة طبيب جديد'}</h2>
              <button onClick={() => setShowDoctorModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">الاسم (عربي) *</label>
                <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.nameAr} onChange={(e) => setDoctorForm({...doctorForm, nameAr: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">الاسم (English)</label>
                <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.nameEn} onChange={(e) => setDoctorForm({...doctorForm, nameEn: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">التخصص *</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.specialization} onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}>
                  <option value="">اختر التخصص</option>
                  {specialties.map(spec => (
                    <option key={spec.id} value={spec.id}>{isRTL ? spec.nameAr : spec.nameEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">سنوات الخبرة</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.experience} onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">رسوم الكشف (ر.س) *</label>
                <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.price} onChange={(e) => setDoctorForm({...doctorForm, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">رقم الجوال</label>
                <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                <input type="email" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">نبذة (عربي)</label>
                <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={doctorForm.bioAr} onChange={(e) => setDoctorForm({...doctorForm, bioAr: e.target.value})} />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">أيام العمل</label>
                <div className="flex flex-wrap gap-2">
                  {workDaysList.map(day => (
                    <button key={day.id} type="button" onClick={() => toggleWorkDay(day.id)} className={`px-3 py-1 rounded-lg text-sm transition ${doctorForm.workDays.includes(day.id) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>
                      {isRTL ? day.nameAr : day.nameEn}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">بداية الدوام</label>
                <input type="time" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.workHours.start} onChange={(e) => setDoctorForm({...doctorForm, workHours: {...doctorForm.workHours, start: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">نهاية الدوام</label>
                <input type="time" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.workHours.end} onChange={(e) => setDoctorForm({...doctorForm, workHours: {...doctorForm.workHours, end: e.target.value}})} />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
              <button 
                onClick={editingDoctor ? handleSaveDoctorEdit : handleAddDoctor} 
                disabled={isSubmitting}
                className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} className="inline ml-1" /> 
                {isSubmitting ? 'جاري الحفظ...' : (editingDoctor ? 'حفظ التعديلات' : 'إضافة طبيب')}
              </button>
              <button onClick={() => setShowDoctorModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Modal إضافة موعد ========== */}
      {showSlotModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">إضافة موعد - {selectedDoctor.nameAr}</h2>
              <button onClick={() => setShowSlotModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">التاريخ</label>
                <input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={slotForm.date} onChange={(e) => setSlotForm({...slotForm, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">الوقت</label>
                <input type="time" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={slotForm.time} onChange={(e) => setSlotForm({...slotForm, time: e.target.value})} />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" checked={slotForm.available} onChange={(e) => setSlotForm({...slotForm, available: e.target.checked})} />
                  <span className="text-gray-300">متاح للحجز</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveSlot} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">
                  <Save size={16} className="inline ml-1" /> حفظ
                </button>
                <button onClick={() => setShowSlotModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}