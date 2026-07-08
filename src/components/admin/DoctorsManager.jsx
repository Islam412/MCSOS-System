// src/components/admin/DoctorsManager.jsx

import { useState, useEffect } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
import { useTranslation } from 'react-i18next'
import { 
  Stethoscope, Plus, Edit, Trash2, Calendar, Clock, 
  DollarSign, Award, Phone, Mail, MapPin, X, Save,
  Eye, Star, Users, Heart, Brain, Bone, Activity,
  ChevronLeft, ChevronRight, Search, Filter, RefreshCw,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { doctorsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

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
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Smart Schedule Modal State
  const [showSmartScheduleModal, setShowSmartScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    mode: 'quick', 
    date: '', 
    time: '',
    startDate: '',
    endDate: '',
    workDays: [],
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30
  })
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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedSpecialty])

  // ========== التخصصات ==========
  const defaultSpecialties = [
    { id: 'orthopedic', nameAr: 'جراحة عظام', nameEn: 'Orthopedic Surgery', icon: '🦴' },
    { id: 'physical_therapy', nameAr: 'علاج طبيعي', nameEn: 'Physical Therapy', icon: '💪' },
    { id: 'neurology', nameAr: 'أعصاب', nameEn: 'Neurology', icon: '🧠' },
    { id: 'pediatrics', nameAr: 'أطفال', nameEn: 'Pediatrics', icon: '👶' },
    { id: 'general_surgery', nameAr: 'جراحة عامة', nameEn: 'General Surgery', icon: '🔪' },
    { id: 'cardiology', nameAr: 'قلب', nameEn: 'Cardiology', icon: '❤️' },
    { id: 'dermatology', nameAr: 'جلدية', nameEn: 'Dermatology', icon: '✨' },
    { id: 'gynecology', nameAr: 'نساء وتوليد', nameEn: 'Gynecology', icon: '👩' },
    { id: 'ophthalmology', nameAr: 'عيون', nameEn: 'Ophthalmology', icon: '👁️' },
    { id: 'urology', nameAr: 'مسالك بولية', nameEn: 'Urology', icon: '🧬' },
  ]

  // ========== تحميل البيانات ==========
  useEffect(() => {
    loadData()
  }, [])

  // ========== تحميل الأطباء ==========
  const loadData = async () => {
    setLoading(true)
    try {
      // ✅ تحميل التخصصات من localStorage
      const savedSpecialties = localStorage.getItem('mcsos_specialties')
      if (savedSpecialties) {
        setSpecialties(JSON.parse(savedSpecialties))
      } else {
        setSpecialties(defaultSpecialties)
        localStorage.setItem('mcsos_specialties', JSON.stringify(defaultSpecialties))
      }

      // ✅ تحميل الأطباء من localStorage أولاً
      const localData = JSON.parse(localStorage.getItem('mcsos_doctors_v2') || '[]')
      
      if (localData.length > 0) {
        setDoctors(localData)
        console.log('📥 Loaded from localStorage:', localData.length, 'doctors')
      }

      // ✅ محاولة جلب من API (للمزامنة)
      if (isOnline) {
        try {
          const response = await doctorsService.getDoctors()
          console.log('📥 API Response:', response)
          
          let apiData = []
          if (Array.isArray(response)) {
            apiData = response
          } else if (response?.doctors && Array.isArray(response.doctors)) {
            apiData = response.doctors
          } else if (response?.data && Array.isArray(response.data)) {
            apiData = response.data
          }
          
          if (apiData.length > 0) {
            // ✅ دمج بيانات API مع البيانات المحلية
            const mergedData = [...localData]
            
            apiData.forEach(apiDoctor => {
              const exists = mergedData.some(d => 
                d.id === apiDoctor.id || 
                d.email === apiDoctor.email ||
                d.nameAr === apiDoctor.name
              )
              
              if (!exists) {
                mergedData.push({
                  id: apiDoctor.id || apiDoctor._id || Date.now(),
                  nameAr: apiDoctor.name || apiDoctor.nameAr,
                  nameEn: apiDoctor.nameEn || apiDoctor.name,
                  specialization: apiDoctor.specialization || apiDoctor.specialty || 'general',
                  specializationAr: apiDoctor.specializationAr || apiDoctor.specialty || 'عام',
                  specializationEn: apiDoctor.specializationEn || apiDoctor.specialty || 'General',
                  phone: apiDoctor.phone || '',
                  email: apiDoctor.email || '',
                  isActive: apiDoctor.is_active !== undefined ? apiDoctor.is_active : true,
                  experience: apiDoctor.experience || 0,
                  rating: apiDoctor.rating || 0,
                  reviews: apiDoctor.reviews || 0,
                  price: apiDoctor.price || apiDoctor.consultationFee || 0,
                  bioAr: apiDoctor.bioAr || apiDoctor.bio || '',
                  bioEn: apiDoctor.bioEn || '',
                  workDays: apiDoctor.workDays || apiDoctor.workingDays || [],
                  workHours: apiDoctor.workHours || apiDoctor.workingHours || { start: '09:00', end: '17:00' },
                  availableSlots: apiDoctor.availableSlots || [],
                  patientsCount: apiDoctor.patientsCount || 0,
                  satisfactionRate: apiDoctor.satisfactionRate || 0,
                  _syncPending: false,
                  _fromAPI: true
                })
              }
            })
            
            setDoctors(mergedData)
            localStorage.setItem('mcsos_doctors_v2', JSON.stringify(mergedData))
            console.log('📥 Merged:', mergedData.length, 'doctors total')
          }
        } catch (apiError) {
          console.warn('⚠️ API request failed:', apiError)
        }
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ========== حفظ الأطباء ==========
  const saveDoctors = async (newDoctors) => {
    localStorage.setItem('mcsos_doctors_v2', JSON.stringify(newDoctors))
    setDoctors(newDoctors)
    
    if (isOnline) {
      try {
        for (const doctor of newDoctors) {
          if (doctor._syncPending && !doctor._fromAPI) {
            try {
              // ✅ البيانات المطلوبة حسب Swagger (CreateDoctorDto)
              const doctorData = {
                name: doctor.nameAr,
                specialization: doctor.specialization,
                phone: doctor.phone || '',
                email: doctor.email || ''
              }
              
              console.log('📤 Syncing doctor:', JSON.stringify(doctorData, null, 2))
              
              const response = await doctorsService.createDoctor(doctorData)
              console.log('✅ Sync response:', response)
              
              if (response && response.id) {
                const synced = newDoctors.map(d => 
                  d.id === doctor.id ? { ...d, id: response.id, _syncPending: false, _fromAPI: true } : d
                )
                localStorage.setItem('mcsos_doctors_v2', JSON.stringify(synced))
                setDoctors(synced)
                toast.success(`تمت مزامنة الطبيب ${doctor.nameAr} بنجاح`)
              }
            } catch (syncError) {
              console.warn('❌ Failed to sync doctor:', doctor.nameAr, syncError)
            }
          }
        }
      } catch (error) {
        console.warn('❌ Failed to sync doctors:', error)
      }
    }
  }

  // ========== إضافة طبيب جديد ==========
  const handleAddDoctor = async () => {
    if (!doctorForm.nameAr || !doctorForm.specialization) {
      toast.error('الرجاء ملء الحقول الأساسية')
      return
    }

    setIsSubmitting(true)
    try {
      const specializationObj = specialties.find(s => s.id === doctorForm.specialization)
      
      // ✅ إنشاء الطبيب محلياً مع كل البيانات
      const newDoctor = {
        id: Date.now(),
        nameAr: doctorForm.nameAr,
        nameEn: doctorForm.nameEn || doctorForm.nameAr,
        specialization: doctorForm.specialization,
        specializationAr: specializationObj?.nameAr || doctorForm.specialization,
        specializationEn: specializationObj?.nameEn || doctorForm.specialization,
        experience: parseInt(doctorForm.experience) || 0,
        price: parseInt(doctorForm.price) || 0,
        phone: doctorForm.phone || '',
        email: doctorForm.email || '',
        bioAr: doctorForm.bioAr || '',
        bioEn: doctorForm.bioEn || '',
        workDays: doctorForm.workDays || [],
        workHours: doctorForm.workHours || { start: '09:00', end: '17:00' },
        rating: 0,
        reviews: 0,
        patientsCount: 0,
        satisfactionRate: 0,
        availableSlots: [],
        isActive: true,
        _syncPending: true,
        _fromAPI: false
      }

      // ✅ حفظ في localStorage أولاً
      const updatedDoctors = [...doctors, newDoctor]
      localStorage.setItem('mcsos_doctors_v2', JSON.stringify(updatedDoctors))
      setDoctors(updatedDoctors)
      
      // ✅ محاولة المزامنة مع API
      if (isOnline) {
        try {
          // ✅ البيانات المطلوبة حسب Swagger (CreateDoctorDto)
          const doctorData = {
            name: doctorForm.nameAr,
            specialization: doctorForm.specialization,
            phone: doctorForm.phone || '',
            email: doctorForm.email || ''
          }
          
          console.log('📤 Sending doctor data:', JSON.stringify(doctorData, null, 2))
          
          const response = await doctorsService.createDoctor(doctorData)
          console.log('✅ API Response:', response)
          
          if (response && response.id) {
            // ✅ تحديث الـ ID من API
            const syncedDoctors = updatedDoctors.map(d => 
              d.id === newDoctor.id ? { ...d, id: response.id, _syncPending: false, _fromAPI: true } : d
            )
            localStorage.setItem('mcsos_doctors_v2', JSON.stringify(syncedDoctors))
            setDoctors(syncedDoctors)
            toast.success('تم إضافة الطبيب والمزامنة مع الخادم')
          } else {
            toast.success('تم إضافة الطبيب محلياً (الخادم لم يستجب)', { icon: 'ℹ️' })
          }
        } catch (apiError) {
          console.warn('❌ API create failed:', apiError)
          toast.success('تم إضافة الطبيب محلياً (غير متصل بالخادم)', { icon: 'ℹ️' })
        }
      } else {
        toast.success('تم إضافة الطبيب في وضع عدم الاتصال', { icon: '📶' })
      }

      setShowDoctorModal(false)
      resetDoctorForm()
    } catch (error) {
      console.error('❌ Add doctor error:', error)
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
      experience: doctor.experience || '',
      price: doctor.price || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      bioAr: doctor.bioAr || '',
      bioEn: doctor.bioEn || '',
      workDays: doctor.workDays || [],
      workHours: doctor.workHours || { start: '09:00', end: '17:00' }
    })
    setShowDoctorModal(true)
  }

  // ========== حفظ تعديل الطبيب ==========
  const handleSaveDoctorEdit = async () => {
    setIsSubmitting(true)
    try {
      const updatedDoctor = {
        ...editingDoctor,
        nameAr: doctorForm.nameAr,
        nameEn: doctorForm.nameEn || doctorForm.nameAr,
        specialization: doctorForm.specialization,
        specializationAr: specialties.find(s => s.id === doctorForm.specialization)?.nameAr || doctorForm.specialization,
        specializationEn: specialties.find(s => s.id === doctorForm.specialization)?.nameEn || doctorForm.specialization,
        experience: parseInt(doctorForm.experience) || 0,
        price: parseInt(doctorForm.price) || 0,
        phone: doctorForm.phone || '',
        email: doctorForm.email || '',
        bioAr: doctorForm.bioAr || '',
        bioEn: doctorForm.bioEn || '',
        workDays: doctorForm.workDays || [],
        workHours: doctorForm.workHours || { start: '09:00', end: '17:00' },
        _syncPending: true
      }

      if (isOnline) {
        try {
          // ✅ البيانات المطلوبة حسب Swagger (UpdateDoctorDto)
          const doctorData = {
            name: doctorForm.nameAr,
            specialization: doctorForm.specialization,
            phone: doctorForm.phone || '',
            email: doctorForm.email || '',
            is_active: true
          }
          await doctorsService.updateDoctor(editingDoctor.id, doctorData)
          updatedDoctor._syncPending = false
          toast.success('تم تحديث بيانات الطبيب')
        } catch (apiError) {
          console.warn('❌ API update failed:', apiError)
          toast.success('تم الحفظ محلياً (الخادم غير متاح)', { icon: '⚠️', duration: 4000 })
        }
      } else {
        toast.success('تم الحفظ في وضع عدم الاتصال', { icon: '📶', duration: 4000 })
      }

      const updatedDoctors = doctors.map(d => 
        d.id === editingDoctor.id ? updatedDoctor : d
      )
      await saveDoctors(updatedDoctors)
      setShowDoctorModal(false)
      setEditingDoctor(null)
      resetDoctorForm()
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث الطبيب')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== حذف طبيب ==========
  const handleDeleteDoctor = async (id) => {
    if (!(await confirmAlert({ title: 'تأكيد', text: 'هل أنت متأكد من حذف هذا الطبيب؟' }))) return

    try {
      if (isOnline) {
        try {
          await doctorsService.deleteDoctor(id)
        } catch (apiError) {
          console.warn('❌ API delete failed, removing locally:', apiError)
        }
      }
      
      const updatedDoctors = doctors.filter(d => d.id !== id)
      await saveDoctors(updatedDoctors)
      toast.success('تم حذف الطبيب')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في حذف الطبيب')
    }
  }

  // ========== إدارة المواعيد (Smart Schedule) ==========
  const handleManageSchedule = (doctor) => {
    setSelectedDoctor(doctor)
    setScheduleForm({
      mode: 'quick',
      date: new Date().toISOString().split('T')[0], 
      time: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workDays: doctor.workDays || [],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30
    })
    setShowSmartScheduleModal(true)
  }

  const handleGenerateSmartSlots = () => {
    if (scheduleForm.mode === 'quick') {
      if (!scheduleForm.date || !scheduleForm.time) {
        toast.error('الرجاء اختيار التاريخ والوقت')
        return
      }
      addSlotsToDoctor([{ date: scheduleForm.date, time: scheduleForm.time, available: true }])
      toast.success('تم إضافة الموعد بنجاح')
      return
    }

    if (!scheduleForm.startDate || !scheduleForm.endDate || scheduleForm.workDays.length === 0) {
      toast.error('الرجاء تعبئة جميع الحقول المطلوبة للتوليد الذكي')
      return
    }

    const generatedSlots = []
    let currentDate = new Date(scheduleForm.startDate)
    const end = new Date(scheduleForm.endDate)

    const daysMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6
    }
    const selectedDaysInt = scheduleForm.workDays.map(d => daysMap[d])

    while (currentDate <= end) {
      if (selectedDaysInt.includes(currentDate.getDay())) {
        const dateString = currentDate.toISOString().split('T')[0]
        let currentSlotTime = new Date(`${dateString}T${scheduleForm.startTime}`)
        const endTime = new Date(`${dateString}T${scheduleForm.endTime}`)

        while (currentSlotTime < endTime) {
          const timeString = currentSlotTime.toTimeString().substring(0, 5)
          generatedSlots.push({ date: dateString, time: timeString, available: true })
          currentSlotTime = new Date(currentSlotTime.getTime() + scheduleForm.slotDuration * 60000)
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (generatedSlots.length === 0) {
      toast.error('لم يتم العثور على أيام تطابق اختيارك في هذه الفترة')
      return
    }

    addSlotsToDoctor(generatedSlots)
    toast.success(`تم توليد ${generatedSlots.length} موعد بنجاح`)
  }

  const addSlotsToDoctor = (newSlots) => {
    const updatedDoctors = doctors.map(d => {
      if (d.id === selectedDoctor.id) {
        const existingSlots = d.availableSlots || []
        const uniqueNewSlots = newSlots.filter(newSlot => 
          !existingSlots.some(s => s.date === newSlot.date && s.time === newSlot.time)
        )
        const allSlots = [...existingSlots, ...uniqueNewSlots].sort((a, b) => {
          if (a.date === b.date) return a.time.localeCompare(b.time)
          return a.date.localeCompare(b.date)
        })
        setSelectedDoctor({ ...d, availableSlots: allSlots })
        return { ...d, availableSlots: allSlots }
      }
      return d
    })
    saveDoctors(updatedDoctors)
  }

  // ========== حذف موعد ==========
  const handleDeleteSlot = async (doctorId, slotIndex) => {
    if ((await confirmAlert({ title: 'تأكيد', text: 'هل أنت متأكد من حذف هذا الموعد؟' }))) {
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
    const matchesSearch = doctor.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specializationAr?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-4" />
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-4 border border-slate-200 dark:border-gray-700/50 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن طبيب..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <p>لا توجد أطباء</p>
          </div>
        ) : (
          <>
            {paginatedDoctors.map(doctor => {
              const isPending = doctor._syncPending === true;
              
              // Sort and get upcoming slots
              const allSlots = doctor.availableSlots || [];
              const sortedSlots = [...allSlots].sort((a, b) => {
                if (a.date === b.date) return a.time.localeCompare(b.time);
                return a.date.localeCompare(b.date);
              });
              // filter out past slots (optional, for now just slice)
              const upcomingSlots = sortedSlots.slice(0, 3);
              
              return (
                <div key={doctor.id} className="bg-white dark:bg-gray-800/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-700/50 hover:border-blue-500/50 hover:shadow-xl dark:hover:shadow-blue-500/10 transition-all group shadow-sm">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
                          {specialties.find(s => s.id === doctor.specialization)?.icon || '👨‍⚕️'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {doctor.nameAr}
                            {isPending && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                                ⏳ قيد المزامنة
                              </span>
                            )}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{doctor.specializationAr}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-900/50 px-2 py-0.5 rounded-full">
                              <Star size={12} className="fill-yellow-500 text-yellow-500" />
                              <span className="text-slate-700 dark:text-white text-xs font-bold">{doctor.rating || 0}</span>
                            </div>
                            <span className="text-xs text-gray-400">({doctor.reviews || 0} تقييم)</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-gray-900/30 p-3 rounded-xl mb-4 border border-slate-100 dark:border-gray-800/50">
                      <div className="flex items-center gap-2"><Award size={16} className="text-blue-500 dark:text-blue-400" /><span className="text-slate-700 dark:text-gray-300 font-medium">{doctor.experience || 0} <span className="text-slate-500 dark:text-gray-500 text-xs">سنة خبرة</span></span></div>
                      <div className="flex items-center gap-2"><Users size={16} className="text-emerald-600 dark:text-emerald-400" /><span className="text-slate-700 dark:text-gray-300 font-medium">{doctor.patientsCount || 0} <span className="text-slate-500 dark:text-gray-500 text-xs">مريض</span></span></div>
                      <div className="flex items-center gap-2"><Heart size={16} className="text-rose-500 dark:text-rose-400" /><span className="text-slate-700 dark:text-gray-300 font-medium">{doctor.satisfactionRate || 0}% <span className="text-slate-500 dark:text-gray-500 text-xs">رضا</span></span></div>
                      <div className="flex items-center gap-2"><Phone size={16} className="text-purple-600 dark:text-purple-400" /><span className="text-slate-700 dark:text-gray-300 text-xs tracking-wider font-medium">{doctor.phone || '—'}</span></div>
                    </div>

                    {/* المواعيد المتاحة */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm text-slate-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                          <Calendar size={16} className="text-blue-400" /> المواعيد القادمة
                        </p>
                        <button onClick={() => handleManageSchedule(doctor)} className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition border border-blue-500/30 font-medium">
                          <Clock size={14} /> إدارة المواعيد
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {upcomingSlots.length > 0 ? (
                          upcomingSlots.map((slot, idx) => (
                            <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${slot.available ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                              <span className="opacity-70">{slot.date?.substring(5) || slot.date}</span>
                              <span className="font-bold">{slot.time}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-gray-500 bg-slate-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700">لا توجد مواعيد متاحة</span>
                        )}
                        {allSlots.length > 3 && (
                          <span className="text-xs text-gray-400 flex items-center px-2">+{allSlots.length - 3} أخرى</span>
                        )}
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="mt-5 pt-4 border-t border-gray-700/50 flex gap-3">
                      <button onClick={() => handleEditDoctor(doctor)} className="flex-1 bg-slate-100 dark:bg-gray-700/50 text-slate-700 dark:text-gray-300 py-2 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center gap-2 border border-slate-200 dark:border-gray-600/50 font-semibold shadow-sm">
                        <Edit size={16} /> تعديل
                      </button>
                      <button onClick={() => handleDeleteDoctor(doctor.id)} className="flex-1 bg-rose-50 dark:bg-red-500/10 text-rose-600 dark:text-red-400 py-2 rounded-xl text-sm hover:bg-rose-100 dark:hover:bg-red-500/20 transition flex items-center justify-center gap-2 border border-rose-200 dark:border-red-500/20 font-semibold shadow-sm">
                        <Trash2 size={16} /> حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition border border-slate-200 dark:border-gray-700 shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-gray-700 shadow-sm'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition border border-slate-200 dark:border-gray-700 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      )}

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
                <label className="block text-sm text-gray-400 mb-1">رقم الجوال *</label>
                <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني *</label>
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

      {/* ========== Modal إدارة المواعيد الذكي ========== */}
      {showSmartScheduleModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-gray-800 shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center bg-white/95 dark:bg-gray-800/80 sticky top-0 z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar className="text-blue-500" /> إدارة المواعيد - {selectedDoctor.nameAr}
                </h2>
                <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">قم بتوليد مواعيد ذكية أو إضافة مواعيد بشكل فردي</p>
              </div>
              <button onClick={() => setShowSmartScheduleModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex gap-4 mb-6 border-b border-gray-700 pb-4">
                <button 
                  onClick={() => setScheduleForm({...scheduleForm, mode: 'quick'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${scheduleForm.mode === 'quick' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-gray-700/50 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  إضافة سريعة
                </button>
                <button 
                  onClick={() => setScheduleForm({...scheduleForm, mode: 'smart'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${scheduleForm.mode === 'smart' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-100 dark:bg-gray-700/50 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  توليد ذكي (Smart Generate)
                </button>
              </div>

              {scheduleForm.mode === 'quick' ? (
                <div className="space-y-5 bg-slate-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-slate-200/60 dark:border-gray-700/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">التاريخ</label>
                      <input type="date" className="w-full p-3 bg-white dark:bg-gray-700 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" value={scheduleForm.date} onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">الوقت</label>
                      <input type="time" className="w-full p-3 bg-white dark:bg-gray-700 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" value={scheduleForm.time} onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 bg-slate-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-slate-200/60 dark:border-gray-700/50">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">من تاريخ</label>
                      <input type="date" className="w-full p-3 bg-white dark:bg-gray-700 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" value={scheduleForm.startDate} onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">إلى تاريخ</label>
                      <input type="date" className="w-full p-3 bg-white dark:bg-gray-700 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" value={scheduleForm.endDate} onChange={(e) => setScheduleForm({...scheduleForm, endDate: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">أيام العمل</label>
                    <div className="flex flex-wrap gap-2">
                      {workDaysList.map(day => (
                        <button
                          key={day.id}
                          onClick={() => {
                            const newDays = scheduleForm.workDays.includes(day.id) 
                              ? scheduleForm.workDays.filter(d => d !== day.id)
                              : [...scheduleForm.workDays, day.id];
                            setScheduleForm({...scheduleForm, workDays: newDays})
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${scheduleForm.workDays.includes(day.id) ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/50' : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-600'}`}
                        >
                          {isRTL ? day.nameAr : day.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">بداية الدوام</label>
                      <input type="time" className="w-full p-3 bg-white dark:bg-gray-700 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">نهاية الدوام</label>
                      <input type="time" className="w-full p-3 bg-white dark:bg-gray-700 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2 font-medium">مدة الموعد (بالدقائق)</label>
                      <select className="w-full p-3 bg-white dark:bg-gray-700 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" value={scheduleForm.slotDuration} onChange={(e) => setScheduleForm({...scheduleForm, slotDuration: Number(e.target.value)})}>
                        <option value={10}>10 دقائق</option>
                        <option value={15}>15 دقيقة</option>
                        <option value={20}>20 دقيقة</option>
                        <option value={30}>30 دقيقة</option>
                        <option value={45}>45 دقيقة</option>
                        <option value={60}>60 دقيقة</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* قائمة المواعيد الحالية */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="text-teal-400" /> المواعيد الحالية المحفوظة
                </h3>
                <div className="bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-4 max-h-60 overflow-y-auto shadow-inner">
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.availableSlots && selectedDoctor.availableSlots.length > 0 ? (
                      selectedDoctor.availableSlots.map((slot, idx) => (
                        <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border ${slot.available ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                          <span className="opacity-70">{slot.date}</span>
                          <span className="font-bold">{slot.time}</span>
                          <button onClick={() => toggleSlotAvailability(selectedDoctor.id, idx)} className="ml-1 hover:opacity-70 transition p-1 hover:bg-white/10 rounded-full" title="تبديل الإتاحة">
                            {slot.available ? '✓' : '✗'}
                          </button>
                          <button onClick={() => handleDeleteSlot(selectedDoctor.id, idx)} className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-500/10 rounded-full" title="حذف">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center py-6 text-gray-500">
                        لا توجد مواعيد محفوظة حتى الآن
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/80 rounded-b-2xl">
              <button 
                onClick={handleGenerateSmartSlots} 
                className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-2 ${scheduleForm.mode === 'smart' ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-500/20 text-white' : 'bg-green-600 hover:bg-green-500 shadow-green-500/20 text-white'}`}
              >
                <Save size={20} />
                {scheduleForm.mode === 'smart' ? 'توليد المواعيد ذكياً' : 'إضافة الموعد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}