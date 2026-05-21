// src/pages/patient/BookAppointment.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, Clock, MapPin, Stethoscope, CheckCircle, 
  CalendarDays, Search, Filter, Star, StarHalf, 
  Award, Users, Heart, MessageCircle, Phone,
  X, AlertCircle, CalendarCheck, Building, Smartphone,
  DollarSign, User, Mail, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

// بيانات الأطباء الثابتة (لن تتعطل أبداً)
const FIXED_DOCTORS = [
  { 
    id: 1, 
    name: 'د. أحمد علي', 
    specialization: 'جراحة عظام', 
    experience: 15,
    rating: 4.8,
    reviews: 128,
    price: 300,
    bio: 'استشاري جراحة العظام والمفاصل، خبرة 15 سنة',
    availableSlots: [
      { date: '2024-05-25', time: '09:00', available: true },
      { date: '2024-05-25', time: '10:00', available: true },
      { date: '2024-05-26', time: '09:00', available: true },
      { date: '2024-05-26', time: '14:00', available: true }
    ],
    color: 'blue'
  },
  { 
    id: 2, 
    name: 'د. منى حسن', 
    specialization: 'علاج طبيعي', 
    experience: 10,
    rating: 4.9,
    reviews: 95,
    price: 250,
    bio: 'أخصائية علاج طبيعي، حاصلة على دكتوراه في العلاج الطبيعي',
    availableSlots: [
      { date: '2024-05-24', time: '10:00', available: true },
      { date: '2024-05-24', time: '11:00', available: true },
      { date: '2024-05-25', time: '14:00', available: true }
    ],
    color: 'green'
  },
  { 
    id: 3, 
    name: 'د. خالد محمود', 
    specialization: 'أعصاب', 
    experience: 20,
    rating: 4.7,
    reviews: 210,
    price: 400,
    bio: 'استشاري أمراض المخ والأعصاب، زمالة أوروبية',
    availableSlots: [
      { date: '2024-05-27', time: '09:00', available: true },
      { date: '2024-05-27', time: '11:00', available: true }
    ],
    color: 'purple'
  },
  { 
    id: 4, 
    name: 'د. نورة سعيد', 
    specialization: 'أطفال', 
    experience: 12,
    rating: 4.9,
    reviews: 156,
    price: 280,
    bio: 'استشارية طب الأطفال وحديثي الولادة',
    availableSlots: [
      { date: '2024-05-23', time: '14:00', available: true },
      { date: '2024-05-24', time: '09:00', available: true }
    ],
    color: 'pink'
  },
  { 
    id: 5, 
    name: 'د. محمد عبدالله', 
    specialization: 'جراحة عامة', 
    experience: 18,
    rating: 4.8,
    reviews: 180,
    price: 350,
    bio: 'استشاري الجراحة العامة والمناظير',
    availableSlots: [
      { date: '2024-05-26', time: '10:00', available: true },
      { date: '2024-05-26', time: '11:00', available: true }
    ],
    color: 'orange'
  }
]

export default function BookAppointment() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [doctors, setDoctors] = useState(FIXED_DOCTORS) // استخدام البيانات الثابتة مباشرة
  const [loading, setLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [bookingType, setBookingType] = useState('clinic')

  const specialties = [
    { id: 'all', name: 'جميع التخصصات', icon: '🏥' },
    { id: 'جراحة عظام', name: 'جراحة عظام', icon: '🦴' },
    { id: 'علاج طبيعي', name: 'علاج طبيعي', icon: '💪' },
    { id: 'أعصاب', name: 'أعصاب', icon: '🧠' },
    { id: 'أطفال', name: 'أطفال', icon: '👶' },
    { id: 'جراحة عامة', name: 'جراحة عامة', icon: '🔪' }
  ]

  useEffect(() => {
    try {
      const userData = localStorage.getItem('mcsos_user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
    // استخدام البيانات الثابتة مباشرة
    setDoctors(FIXED_DOCTORS)
    setLoading(false)
  }, [])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />)
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} size={16} className="text-gray-500" />)
    }
    return stars
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', gradient: 'from-green-500 to-green-600' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' },
      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500 to-pink-600' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600' }
    }
    return colors[color] || colors.blue
  }

  const handleBookNow = (doctor) => {
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

    try {
      const newAppointment = {
        id: Date.now(),
        patient: user?.name || 'مريض',
        patientId: user?.id || Date.now(),
        doctor: selectedDoctor.name,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        type: bookingType === 'clinic' ? 'كشف طبي' : 'استشارة أونلاين',
        status: 'scheduled',
        location: bookingType === 'clinic' ? 'العيادة - الطابق الأول' : 'رابط الاجتماع: سيتم إرساله لاحقاً',
        price: selectedDoctor.price,
        createdAt: new Date().toISOString()
      }

      const existingAppointments = JSON.parse(localStorage.getItem('mcsos_appointments') || '[]')
      existingAppointments.push(newAppointment)
      localStorage.setItem('mcsos_appointments', JSON.stringify(existingAppointments))

      toast.success(`تم حجز موعد مع ${selectedDoctor.name} يوم ${selectedDate} الساعة ${selectedTime}`)
      setShowBookingModal(false)
      setSelectedDoctor(null)
      
      setTimeout(() => {
        navigate('/appointments')
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى')
    }
  }

  const getAvailableDates = () => {
    if (!selectedDoctor || !selectedDoctor.availableSlots) return []
    const dates = [...new Set(selectedDoctor.availableSlots
      .filter(slot => slot.available)
      .map(slot => slot.date))]
    return dates.sort()
  }

  const getAvailableTimesForDate = (date) => {
    if (!selectedDoctor || !selectedDoctor.availableSlots) return []
    return selectedDoctor.availableSlots
      .filter(slot => slot.date === date && slot.available)
      .map(slot => slot.time)
  }

  // تصفية الأطباء مع التحقق من وجود البيانات
  const filteredDoctors = doctors.filter(doctor => {
    if (!doctor || !doctor.name) return false
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                <CalendarCheck size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">حجز موعد</h1>
            </div>
            <p className="text-gray-400">اختر الطبيب المناسب واحجز موعدك بسهولة</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User size={16} className="text-blue-400" />
            <span>{user?.name || 'زائر'}</span>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-blue-400">{doctors.length}</div>
          <div className="text-sm text-gray-400">طبيب متخصص</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-yellow-400">4.8</div>
          <div className="text-sm text-gray-400">متوسط التقييم</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-green-400">95%</div>
          <div className="text-sm text-gray-400">رضا المرضى</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-purple-400">50+</div>
          <div className="text-sm text-gray-400">موعد أسبوعياً</div>
        </div>
      </div>

      {/* بحث وتصفية */}
      <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن طبيب بالاسم أو التخصص..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {specialties.map((spec) => (
              <button 
                key={spec.id} 
                onClick={() => setSelectedSpecialty(spec.id)} 
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${selectedSpecialty === spec.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
              >
                <span>{spec.icon}</span>
                <span>{spec.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* قائمة الأطباء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doctor) => {
          const colors = getColorClasses(doctor.color)
          return (
            <div key={doctor.id} className={`group bg-gray-800/40 rounded-2xl border ${colors.border} hover:border-blue-500/50 transition-all duration-300 overflow-hidden hover:shadow-xl`}>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center text-3xl`}>
                      {doctor.specialization === 'جراحة عظام' ? '🦴' : 
                       doctor.specialization === 'علاج طبيعي' ? '💪' :
                       doctor.specialization === 'أعصاب' ? '🧠' :
                       doctor.specialization === 'أطفال' ? '👶' : '👨‍⚕️'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{doctor.name}</h3>
                      <p className={`text-sm ${colors.text}`}>{doctor.specialization}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(doctor.rating)}
                        <span className="text-xs text-gray-400 ml-1">({doctor.reviews} تقييم)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{doctor.price} <span className="text-xs">ر.س</span></div>
                    <p className="text-xs text-gray-400">رسوم الكشف</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2"><Award size={16} className="text-blue-400" /><span className="text-gray-300">خبرة {doctor.experience} سنة</span></div>
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-purple-400" /><span className="text-gray-300">مواعيد متاحة</span></div>
                </div>
                
                <p className="text-gray-400 text-sm mt-3 line-clamp-2">{doctor.bio}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button 
                    onClick={() => handleBookNow(doctor)}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CalendarCheck size={18} /> حجز موعد
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">لا توجد أطباء مطابقين لبحثك</p>
        </div>
      )}

      {/* Modal حجز موعد */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">حجز موعد مع {selectedDoctor.name}</h2>
              <button onClick={() => setShowBookingModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400 mb-1">بيانات المريض</p>
              <p className="text-white font-semibold">{user?.name || 'زائر'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">نوع الموعد</label>
                <div className="flex gap-3">
                  <button onClick={() => setBookingType('clinic')} className={`flex-1 py-2 rounded-lg transition ${bookingType === 'clinic' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>🏥 كشف في العيادة</button>
                  <button onClick={() => setBookingType('online')} className={`flex-1 py-2 rounded-lg transition ${bookingType === 'online' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400'}`}>💻 استشارة أونلاين</button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">اختر التاريخ</label>
                <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                  <option value="">اختر التاريخ</option>
                  {getAvailableDates().map(date => (
                    <option key={date} value={date}>{new Date(date).toLocaleDateString('ar')}</option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">اختر الوقت</label>
                  <div className="grid grid-cols-3 gap-2">
                    {getAvailableTimesForDate(selectedDate).map(time => (
                      <button key={time} onClick={() => setSelectedTime(time)} className={`py-2 rounded-lg transition ${selectedTime === time ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{time}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex justify-between"><span className="text-gray-400">رسوم الكشف:</span><span className="text-green-400 font-bold">{selectedDoctor.price} ر.س</span></div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-600"><span className="text-white font-bold">الإجمالي:</span><span className="text-green-400 font-bold">{selectedDoctor.price} ر.س</span></div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleConfirmBooking} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition"><CalendarCheck size={16} /> تأكيد الحجز</button>
                <button onClick={() => setShowBookingModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}