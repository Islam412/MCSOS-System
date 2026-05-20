import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, Calendar, Clock, Activity, Pill, FileText, 
  CheckCircle, AlertCircle, TrendingUp, Heart, 
  Stethoscope, Syringe, ClipboardList, Eye, Download,
  CalendarDays, Phone, Mail, MapPin, Award, Target,
  Search, Filter, Star, StarHalf, UserPlus, Video, MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PatientDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  
  // بيانات الأطباء
  const [doctors, setDoctors] = useState([
    { 
      id: 1, 
      name: 'د. أحمد علي', 
      nameEn: 'Dr. Ahmed Ali',
      specialization: 'جراحة عظام', 
      specializationEn: 'Orthopedic Surgery',
      experience: 15,
      rating: 4.8,
      reviews: 128,
      price: 300,
      available: true,
      image: null,
      bio: 'استشاري جراحة العظام والمفاصل، خبرة 15 سنة في المملكة المتحدة ومصر',
      phone: '+966 50 111 2222',
      email: 'ahmed.ali@medical.com',
      clinicHours: {
        sat: '9:00 - 17:00',
        sun: '9:00 - 17:00',
        mon: '9:00 - 17:00',
        tue: '9:00 - 17:00',
        wed: '9:00 - 14:00'
      },
      nextAvailable: '2024-05-25'
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
      bio: 'أخصائية علاج طبيعي، حاصلة على دكتوراه في العلاج الطبيعي',
      phone: '+966 50 222 3333',
      email: 'mona.hassan@medical.com',
      clinicHours: {
        sat: '10:00 - 18:00',
        sun: '10:00 - 18:00',
        mon: '10:00 - 18:00',
        tue: '10:00 - 18:00',
        wed: '10:00 - 14:00'
      },
      nextAvailable: '2024-05-24'
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
      bio: 'استشاري أمراض المخ والأعصاب، زمالة أوروبية',
      phone: '+966 50 333 4444',
      email: 'khaled.mahmoud@medical.com',
      clinicHours: {
        sat: '9:00 - 15:00',
        sun: '9:00 - 15:00',
        mon: '9:00 - 15:00',
        tue: '9:00 - 15:00',
        wed: '9:00 - 12:00'
      },
      nextAvailable: '2024-05-27'
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
      bio: 'استشارية طب الأطفال وحديثي الولادة',
      phone: '+966 50 444 5555',
      email: 'noura.saeed@medical.com',
      clinicHours: {
        sat: '9:00 - 16:00',
        sun: '9:00 - 16:00',
        mon: '9:00 - 16:00',
        tue: '9:00 - 16:00',
        wed: '9:00 - 13:00'
      },
      nextAvailable: '2024-05-23'
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
      bio: 'استشاري الجراحة العامة والمناظير',
      phone: '+966 50 555 6666',
      email: 'mohamed.abdullah@medical.com',
      clinicHours: {
        sat: '8:00 - 16:00',
        sun: '8:00 - 16:00',
        mon: '8:00 - 16:00',
        tue: '8:00 - 16:00',
        wed: '8:00 - 12:00'
      },
      nextAvailable: '2024-05-26'
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
      bio: 'أخصائية الأمراض الجلدية والتجميل',
      phone: '+966 50 666 7777',
      email: 'sara.ahmed@medical.com',
      clinicHours: {
        sat: '10:00 - 18:00',
        sun: '10:00 - 18:00',
        mon: '10:00 - 18:00',
        tue: '10:00 - 18:00',
        wed: '10:00 - 14:00'
      },
      nextAvailable: '2024-05-28'
    }
  ])
  
  // بيانات جدول المواعيد
  const [scheduleSlots, setScheduleSlots] = useState([
    { id: 1, doctorId: 1, doctorName: 'د. أحمد علي', date: '2024-05-25', time: '09:00', available: true },
    { id: 2, doctorId: 1, doctorName: 'د. أحمد علي', date: '2024-05-25', time: '10:00', available: true },
    { id: 3, doctorId: 1, doctorName: 'د. أحمد علي', date: '2024-05-25', time: '11:00', available: false },
    { id: 4, doctorId: 2, doctorName: 'د. منى حسن', date: '2024-05-24', time: '10:00', available: true },
    { id: 5, doctorId: 2, doctorName: 'د. منى حسن', date: '2024-05-24', time: '11:00', available: true },
    { id: 6, doctorId: 3, doctorName: 'د. خالد محمود', date: '2024-05-27', time: '09:00', available: true },
    { id: 7, doctorId: 4, doctorName: 'د. نورة سعيد', date: '2024-05-23', time: '14:00', available: true },
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
      { id: 1, date: '2024-05-25', time: '10:00', doctor: 'د. أحمد علي', type: 'جلسة علاج' },
      { id: 2, date: '2024-05-28', time: '11:00', doctor: 'د. أحمد علي', type: 'متابعة' },
    ],
    pastAppointments: [
      { id: 1, date: '2024-05-18', time: '10:00', doctor: 'د. أحمد علي', type: 'جلسة علاج', status: 'completed' },
      { id: 2, date: '2024-05-15', time: '11:00', doctor: 'د. أحمد علي', type: 'متابعة', status: 'completed' },
    ],
    prescriptions: [
      { id: 1, date: '2024-05-15', doctor: 'د. أحمد علي', medications: [{ name: 'بروفين', dosage: '500mg', frequency: 'مرتين يومياً' }], notes: 'تناول بعد الأكل' },
    ],
    medicalReports: [
      { id: 1, title: 'تقرير الأشعة', date: '2024-05-10', type: 'xray', doctor: 'د. أحمد علي' },
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
    }
  })
  
  // قائمة التخصصات
  const specialties = [
    { id: 'all', name: 'جميع التخصصات', nameEn: 'All Specialties' },
    { id: 'جراحة عظام', name: 'جراحة عظام', nameEn: 'Orthopedic' },
    { id: 'علاج طبيعي', name: 'علاج طبيعي', nameEn: 'Physical Therapy' },
    { id: 'أعصاب', name: 'أعصاب', nameEn: 'Neurology' },
    { id: 'أطفال', name: 'أطفال', nameEn: 'Pediatrics' },
    { id: 'جراحة عامة', name: 'جراحة عامة', nameEn: 'General Surgery' },
    { id: 'جلدية', name: 'جلدية', nameEn: 'Dermatology' },
  ]
  
  useEffect(() => {
    setTimeout(() => {
      setPatient(patientData)
      setLoading(false)
    }, 500)
  }, [])
  
  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">مكتمل</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">قادم</span>
  }
  
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />)
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={14} className="fill-yellow-500 text-yellow-500" />)
    }
    while (stars.length < 5) {
      stars.push(<Star key={stars.length} size={14} className="text-gray-500" />)
    }
    return stars
  }
  
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })
  
  const handleBookAppointment = (doctor) => {
    toast.success(`جاري تحويلك لحجز موعد مع ${doctor.name}`)
  }
  
  const handleContactDoctor = (doctor) => {
    toast.success(`سيتم التواصل مع ${doctor.name} عبر الواتساب`)
  }
  
  const progressData = patientData.progressHistory.map(p => ({
    date: p.date,
    progress: p.progress,
    note: p.note
  }))
  
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">لوحة تحكم المريض</h1>
          <p className="text-gray-400 mt-1">مرحباً {patient?.name} | متابعة حالتك الصحية وعلاجك</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>نظرة عامة</button>
          <button onClick={() => setActiveTab('doctors')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'doctors' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>الأطباء</button>
          <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'schedule' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>المواعيد</button>
        </div>
      </div>
      
      {/* تبويب نظرة عامة */}
      {activeTab === 'overview' && (
        <>
          {/* بطاقات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
              <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">نسبة التقدم</p><p className="text-3xl font-bold text-white">{patient?.progress}%</p></div><div className="p-3 bg-blue-500/20 rounded-xl"><TrendingUp className="text-blue-400" size={28} /></div></div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${patient?.progress}%` }}></div></div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
              <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الجلسات المكتملة</p><p className="text-3xl font-bold text-white">{patient?.completedSessions}/{patient?.totalSessions}</p></div><div className="p-3 bg-green-500/20 rounded-xl"><Activity className="text-green-400" size={28} /></div></div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
              <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الموعد القادم</p><p className="text-xl font-bold text-white">{patient?.nextAppointment}</p></div><div className="p-3 bg-purple-500/20 rounded-xl"><Calendar className="text-purple-400" size={28} /></div></div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
              <div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">الطبيب المعالج</p><p className="text-xl font-bold text-white">{patient?.doctor}</p></div><div className="p-3 bg-orange-500/20 rounded-xl"><Stethoscope className="text-orange-400" size={28} /></div></div>
            </div>
          </div>
          
          {/* الرسم البياني للتقدم */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">تقدمي العلاجي</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                <Area type="monotone" dataKey="progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="نسبة التقدم %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* المواعيد القادمة والروشتات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">مواعيدي القادمة</h2>
              <div className="space-y-3">
                {patient?.upcomingAppointments.map((app) => (<div key={app.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"><div><p className="text-white">{app.date} - {app.time}</p><p className="text-sm text-gray-400">{app.doctor} - {app.type}</p></div>{getStatusBadge('upcoming')}</div>))}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">آخر روشتة</h2>
              {patient?.prescriptions[0] && (<div className="p-4 bg-gray-700/30 rounded-lg"><p className="font-semibold text-white">روشتة بتاريخ {patient.prescriptions[0].date}</p><p className="text-sm text-gray-400">الدكتور: {patient.prescriptions[0].doctor}</p><div className="mt-2">{patient.prescriptions[0].medications.map((med, idx) => (<div key={idx} className="flex justify-between py-1"><span className="text-white">{med.name}</span><span className="text-gray-400">{med.dosage} - {med.frequency}</span></div>))}</div></div>)}
            </div>
          </div>
        </>
      )}
      
      {/* تبويب الأطباء */}
      {activeTab === 'doctors' && (
        <>
          {/* بحث وتصفية */}
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="ابحث عن طبيب بالاسم أو التخصص..." className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {specialties.map((spec) => (<button key={spec.id} onClick={() => setSelectedSpecialty(spec.id)} className={`px-4 py-2 rounded-xl whitespace-nowrap transition ${selectedSpecialty === spec.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>{isRTL ? spec.name : spec.nameEn}</button>))}
              </div>
            </div>
          </div>
          
          {/* قائمة الأطباء */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div><h3 className="text-xl font-bold text-white">{doctor.name}</h3><p className="text-gray-400">{doctor.specialization}</p></div>
                    <div className="text-right"><div className="flex items-center gap-1">{renderStars(doctor.rating)}<span className="text-white text-sm ml-1">{doctor.rating}</span></div><p className="text-xs text-gray-500">({doctor.reviews} تقييم)</p></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Award size={16} className="text-blue-400" /><span className="text-gray-300">خبرة {doctor.experience} سنة</span></div>
                    <div className="flex items-center gap-2"><DollarSign size={16} className="text-green-400" /><span className="text-gray-300">{doctor.price} ر.س</span></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-3 line-clamp-2">{doctor.bio}</p>
                  <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                    <button onClick={() => handleBookAppointment(doctor)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"><Calendar size={16} /> حجز موعد</button>
                    <button onClick={() => handleContactDoctor(doctor)} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"><MessageCircle size={16} /> تواصل</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* تبويب المواعيد - جدول الأطباء */}
      {activeTab === 'schedule' && (
        <>
          <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">جدول مواعيد الأطباء</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-700 rounded-lg text-sm text-gray-300">هذا الأسبوع</button>
                <button className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm text-gray-500">الأسبوع القادم</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/80">
                  <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <th className="px-6 py-3 text-sm text-gray-300">الطبيب</th>
                    <th className="px-6 py-3 text-sm text-gray-300">التخصص</th>
                    <th className="px-6 py-3 text-sm text-gray-300">أيام العمل</th>
                    <th className="px-6 py-3 text-sm text-gray-300">الموعد المتاح</th>
                    <th className="px-6 py-3 text-sm text-gray-300">السعر</th>
                    <th className="px-6 py-3 text-sm text-gray-300">حجز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4"><div className="font-semibold text-white">{doctor.name}</div><div className="text-xs text-gray-500">{doctor.experience} سنة خبرة</div></td>
                      <td className="px-6 py-4 text-gray-300">{doctor.specialization}</td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">السبت</span>
                          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">الأحد</span>
                          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">الإثنين</span>
                          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">الثلاثاء</span>
                          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">الأربعاء</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-green-400">{doctor.nextAvailable}</td>
                      <td className="px-6 py-4 font-semibold text-green-400">{doctor.price} ر.س</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleBookAppointment(doctor)} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition">حجز</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* المواعيد المتاحة */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">المواعيد المتاحة لهذا الأسبوع</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scheduleSlots.filter(slot => slot.available).map((slot) => (
                <div key={slot.id} className="bg-gray-700/30 rounded-lg p-3 flex justify-between items-center">
                  <div><p className="text-white font-medium">{slot.doctorName}</p><p className="text-sm text-gray-400">{slot.date} - {slot.time}</p></div>
                  <button onClick={() => handleBookAppointment({ name: slot.doctorName })} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30">احجز</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}