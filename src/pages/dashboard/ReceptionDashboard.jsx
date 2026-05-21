import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Calendar, Clock, Users, CheckCircle, Activity, Search, Phone, Mail, MapPin, X, Save, Eye, Printer, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReceptionDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  
  // حالة النوافذ المنبثقة
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // بيانات المريض الجديد
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    phone: '',
    address: ''
  })
  
  // بيانات الموعد الجديد
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    date: '',
    time: ''
  })
  
  const [stats, setStats] = useState({
    todayAppointments: 24,
    completedCheckIns: 18,
    waitingPatients: 6,
    newRegistrations: 4
  })
  
  const [todayAppointments, setTodayAppointments] = useState([
    { id: 1, time: '09:00', patient: 'أحمد محمد', phone: '0501234567', status: 'checked-in', doctor: 'د. أحمد علي' },
    { id: 2, time: '09:30', patient: 'سارة حسن', phone: '0507654321', status: 'checked-in', doctor: 'د. منى حسن' },
    { id: 3, time: '10:00', patient: 'محمود علي', phone: '0505566778', status: 'waiting', doctor: 'د. خالد محمود' },
    { id: 4, time: '10:30', patient: 'نورة عبدالله', phone: '0509988776', status: 'scheduled', doctor: 'د. أحمد علي' },
    { id: 5, time: '11:00', patient: 'عمر خالد', phone: '0501122334', status: 'scheduled', doctor: 'د. منى حسن' },
  ])
  
  const [recentPatients, setRecentPatients] = useState([
    { id: 1, name: 'أحمد محمد', phone: '0501234567', time: '09:30', registeredBy: 'نورة' },
    { id: 2, name: 'سارة حسن', phone: '0507654321', time: '09:45', registeredBy: 'أحمد' },
    { id: 3, name: 'محمود علي', phone: '0505566778', time: '10:00', registeredBy: 'نورة' },
  ])
  
  // قائمة الأطباء
  const doctors = [
    { id: 1, name: 'د. أحمد علي', specialization: 'جراحة عظام' },
    { id: 2, name: 'د. منى حسن', specialization: 'علاج طبيعي' },
    { id: 3, name: 'د. خالد محمود', specialization: 'أعصاب' },
    { id: 4, name: 'د. نورة سعيد', specialization: 'أطفال' }
  ]
  
  // قائمة المرضى (من localStorage)
  const [patientsList, setPatientsList] = useState([])
  
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // تحميل قائمة المرضى
    const savedPatients = localStorage.getItem('mcsos_patients_v2')
    if (savedPatients) {
      setPatientsList(JSON.parse(savedPatients))
    }
  }, [])
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'checked-in': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">تم الحضور</span>
      case 'waiting': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">في الانتظار</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">مجدول</span>
    }
  }
  
  const handleCheckIn = (id) => {
    setTodayAppointments(todayAppointments.map(app => app.id === id ? { ...app, status: 'checked-in' } : app))
    toast.success('تم تسجيل حضور المريض')
    
    // تحديث الإحصائيات
    setStats(prev => ({
      ...prev,
      completedCheckIns: prev.completedCheckIns + 1,
      waitingPatients: Math.max(0, prev.waitingPatients - 1)
    }))
  }
  
  // دالة تسجيل مريض جديد
  const handleRegisterPatient = () => {
    if (!newPatient.name) {
      toast.error('الرجاء إدخال اسم المريض')
      return
    }
    
    const patient = {
      id: Date.now(),
      nameAr: newPatient.name,
      nameEn: newPatient.name,
      age: parseInt(newPatient.age) || 0,
      phone: newPatient.phone || '',
      address: newPatient.address || '',
      status: 'active',
      completedSessions: 0,
      totalSessions: 6,
      progress: 0,
      registerDate: new Date().toISOString(),
      registeredBy: user?.name || 'موظف الاستقبال'
    }
    
    // حفظ في localStorage
    const existingPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
    existingPatients.push(patient)
    localStorage.setItem('mcsos_patients_v2', JSON.stringify(existingPatients))
    
    // تحديث القائمة
    setPatientsList(existingPatients)
    
    // تحديث الإحصائيات
    setStats(prev => ({
      ...prev,
      newRegistrations: prev.newRegistrations + 1
    }))
    
    // إضافة إلى آخر المرضى المسجلين
    setRecentPatients(prev => [
      { id: patient.id, name: patient.nameAr, phone: patient.phone, time: new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }), registeredBy: user?.name || 'موظف' },
      ...prev.slice(0, 4)
    ])
    
    toast.success(`تم تسجيل المريض ${newPatient.name} بنجاح`)
    
    // إعادة تعيين النموذج
    setNewPatient({ name: '', age: '', phone: '', address: '' })
    setShowNewPatientModal(false)
  }
  
  // دالة حجز موعد جديد
  const handleBookAppointment = () => {
    if (!newAppointment.patientName || !newAppointment.doctorName || !newAppointment.date || !newAppointment.time) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }
    
    const appointment = {
      id: Date.now(),
      patient: newAppointment.patientName,
      patientId: newAppointment.patientId,
      doctor: newAppointment.doctorName,
      doctorId: newAppointment.doctorId,
      date: newAppointment.date,
      time: newAppointment.time,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }
    
    // حفظ في localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('mcsos_appointments') || '[]')
    existingAppointments.push(appointment)
    localStorage.setItem('mcsos_appointments', JSON.stringify(existingAppointments))
    
    // تحديث قائمة مواعيد اليوم
    setTodayAppointments(prev => [...prev, {
      id: appointment.id,
      time: appointment.time,
      patient: appointment.patient,
      phone: '',
      status: 'scheduled',
      doctor: appointment.doctor
    }])
    
    // تحديث الإحصائيات
    setStats(prev => ({
      ...prev,
      todayAppointments: prev.todayAppointments + 1
    }))
    
    toast.success(`تم حجز موعد للمريض ${newAppointment.patientName} مع ${newAppointment.doctorName}`)
    
    // إعادة تعيين النموذج
    setNewAppointment({ patientId: '', patientName: '', doctorId: '', doctorName: '', date: '', time: '' })
    setShowAppointmentModal(false)
  }
  
  // دالة البحث عن مريض
  const handleSearchPatient = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    
    const allPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
    const results = allPatients.filter(p => 
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery))
    )
    setSearchResults(results)
  }
  
  // دالة عرض تفاصيل المريض
  const viewPatientDetails = (patient) => {
    toast.success(`عرض بيانات المريض: ${patient.nameAr}`)
    // يمكن إضافة navigation إلى صفحة المريض
    // navigate(`/patients/${patient.id}`)
  }
  
  // دالة إنشاء تقرير يومي
  const generateDailyReport = () => {
    const today = new Date().toLocaleDateString('ar')
    const allPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
    const allAppointments = JSON.parse(localStorage.getItem('mcsos_appointments') || '[]')
    
    const todayPatients = allPatients.filter(p => {
      const pDate = new Date(p.registerDate).toLocaleDateString('ar')
      return pDate === today
    })
    
    const todayApps = allAppointments.filter(a => {
      const aDate = new Date(a.date).toLocaleDateString('ar')
      return aDate === today
    })
    
    const reportContent = `
      ========== التقرير اليومي ==========
      التاريخ: ${today}
      المستخدم: ${user?.name || 'موظف الاستقبال'}
      -----------------------------------
      
      📊 إحصائيات اليوم:
      • إجمالي مواعيد اليوم: ${stats.todayAppointments}
      • تم الحضور: ${stats.completedCheckIns}
      • مرضى في الانتظار: ${stats.waitingPatients}
      • مرضى جدد اليوم: ${todayPatients.length}
      
      📋 قائمة مواعيد اليوم:
      ${todayApps.map(a => `  • ${a.time} - ${a.patient} مع ${a.doctor}`).join('\n') || '  • لا توجد مواعيد'}
      
      👤 آخر المرضى المسجلين:
      ${recentPatients.map(p => `  • ${p.name} - ${p.time}`).join('\n')}
      
      ===================================
      تم إنشاء التقرير بواسطة نظام MCSOS
    `
    
    // فتح نافذة الطباعة
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>التقرير اليومي - ${today}</title>
          <style>
            body {
              font-family: 'Cairo', Arial, sans-serif;
              padding: 40px;
              background: white;
              margin: 0;
            }
            .report {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1e3a5f;
            }
            .date {
              color: #6b7280;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-weight: bold;
              font-size: 18px;
              color: #2563eb;
              border-right: 3px solid #2563eb;
              padding-right: 10px;
              margin-bottom: 15px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #1e3a5f;
            }
            .stat-label {
              font-size: 12px;
              color: #6b7280;
            }
            .list-item {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
            @media print {
              body { padding: 0; }
              .report { box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <div class="title">نظام المركز الطبي MCSOS</div>
              <div class="date">التقرير اليومي - ${today}</div>
            </div>
            
            <div class="section">
              <div class="section-title">📊 إحصائيات اليوم</div>
              <div class="stats-grid">
                <div class="stat-item"><div class="stat-value">${stats.todayAppointments}</div><div class="stat-label">مواعيد اليوم</div></div>
                <div class="stat-item"><div class="stat-value">${stats.completedCheckIns}</div><div class="stat-label">تم الحضور</div></div>
                <div class="stat-item"><div class="stat-value">${stats.waitingPatients}</div><div class="stat-label">مرضى في الانتظار</div></div>
                <div class="stat-item"><div class="stat-value">${todayPatients.length}</div><div class="stat-label">مرضى جدد</div></div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">📋 مواعيد اليوم</div>
              ${todayApps.map(a => `<div class="list-item">⏰ ${a.time} - ${a.patient} (${a.doctor})</div>`).join('') || '<div class="list-item">لا توجد مواعيد اليوم</div>'}
            </div>
            
            <div class="section">
              <div class="section-title">👤 آخر المرضى المسجلين</div>
              ${recentPatients.map(p => `<div class="list-item">👨‍⚕️ ${p.name} - ${p.time}</div>`).join('')}
            </div>
            
            <div class="footer">
              تم إنشاء التقرير بواسطة ${user?.name || 'موظف الاستقبال'} | نظام MCSOS
            </div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    
    toast.success('تم إنشاء التقرير اليومي')
  }
  
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold gradient-text">لوحة تحكم الاستقبال</h1><p className="text-gray-400 mt-1">مرحباً {user?.name || 'نورة عبدالله'} | إدارة المرضى والمواعيد</p></div>
      
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">مواعيد اليوم</p><p className="text-3xl font-bold text-white">{stats.todayAppointments}</p></div>
            <div className="p-3 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={28} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">تم الحضور</p><p className="text-3xl font-bold text-white">{stats.completedCheckIns}</p></div>
            <div className="p-3 bg-green-500/20 rounded-xl"><CheckCircle className="text-green-400" size={28} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-5 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">مرضى في الانتظار</p><p className="text-3xl font-bold text-white">{stats.waitingPatients}</p></div>
            <div className="p-3 bg-yellow-500/20 rounded-xl"><Clock className="text-yellow-400" size={28} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-400 text-sm">تسجيلات جديدة</p><p className="text-3xl font-bold text-white">{stats.newRegistrations}</p></div>
            <div className="p-3 bg-purple-500/20 rounded-xl"><UserPlus className="text-purple-400" size={28} /></div>
          </div>
        </div>
      </div>
      
      {/* مواعيد اليوم وآخر المرضى */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-400" /> مواعيد اليوم</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayAppointments.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-white font-medium">{app.time}</div>
                  <div><p className="text-white">{app.patient}</p><p className="text-xs text-gray-400">{app.doctor}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(app.status)}
                  <button onClick={() => handleCheckIn(app.id)} disabled={app.status !== 'scheduled'} className={`px-2 py-1 rounded-lg text-xs ${app.status === 'scheduled' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-600 text-gray-500 cursor-not-allowed'}`}>تسجيل حضور</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UserPlus size={20} className="text-green-400" /> آخر المرضى المسجلين</h2>
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="p-3 bg-gray-700/30 rounded-lg">
                <div className="flex justify-between">
                  <div><p className="font-semibold text-white">{patient.name}</p><p className="text-xs text-gray-400">{patient.phone}</p></div>
                  <span className="text-xs text-gray-500">{patient.time}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">بواسطة: {patient.registeredBy}</span>
                  <button className="text-blue-400 hover:text-blue-300 text-xs">عرض التفاصيل</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* إجراءات سريعة - مع وظائف كاملة */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Search size={20} className="text-purple-400" /> إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => setShowNewPatientModal(true)}
            className="p-3 bg-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> تسجيل مريض جديد
          </button>
          <button 
            onClick={() => setShowAppointmentModal(true)}
            className="p-3 bg-green-500/20 rounded-xl text-green-400 hover:bg-green-500/30 transition flex items-center justify-center gap-2"
          >
            <Calendar size={18} /> حجز موعد
          </button>
          <button 
            onClick={() => setShowSearchModal(true)}
            className="p-3 bg-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
          >
            <Search size={18} /> بحث عن مريض
          </button>
          <button 
            onClick={generateDailyReport}
            className="p-3 bg-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/30 transition flex items-center justify-center gap-2"
          >
            <Printer size={18} /> تقرير يومي
          </button>
        </div>
      </div>
      
      {/* Modal تسجيل مريض جديد */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تسجيل مريض جديد</h2>
              <button onClick={() => setShowNewPatientModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="الاسم الكامل *" 
                className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="العمر" 
                className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                value={newPatient.age}
                onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder="رقم الجوال" 
                className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                value={newPatient.phone}
                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="العنوان" 
                className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                value={newPatient.address}
                onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
              />
              <div className="flex gap-3 pt-4">
                <button onClick={handleRegisterPatient} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">
                  <Save size={16} className="inline ml-1" /> حفظ
                </button>
                <button onClick={() => setShowNewPatientModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal حجز موعد */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">حجز موعد جديد</h2>
              <button onClick={() => setShowAppointmentModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="اسم المريض *" 
                className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                value={newAppointment.patientName}
                onChange={(e) => setNewAppointment({...newAppointment, patientName: e.target.value})}
              />
              <select 
                className="w-full p-2 bg-gray-700 rounded-lg text-white"
                value={newAppointment.doctorId}
                onChange={(e) => {
                  const doctor = doctors.find(d => d.id === parseInt(e.target.value))
                  setNewAppointment({
                    ...newAppointment, 
                    doctorId: doctor?.id || '', 
                    doctorName: doctor?.name || ''
                  })
                }}
              >
                <option value="">اختر الطبيب *</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
                ))}
              </select>
              <input 
                type="date" 
                className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
              />
              <input 
                type="time" 
                className="w-full p-2 bg-gray-700 rounded-lg text-white" 
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
              />
              <div className="flex gap-3 pt-4">
                <button onClick={handleBookAppointment} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">
                  <Calendar size={16} className="inline ml-1" /> حجز
                </button>
                <button onClick={() => setShowAppointmentModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal بحث عن مريض */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">البحث عن مريض</h2>
              <button onClick={() => setShowSearchModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو رقم الجوال..." 
                className="flex-1 p-2 bg-gray-700 rounded-lg text-white" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearchPatient()
                }}
              />
              <button onClick={handleSearchPatient} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                <Search size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {searchResults.length === 0 && searchQuery && (
                <div className="text-center text-gray-400 py-8">لا توجد نتائج</div>
              )}
              {searchResults.map(patient => (
                <div key={patient.id} className="bg-gray-700/50 rounded-lg p-3 mb-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{patient.nameAr}</div>
                    <div className="text-xs text-gray-400">{patient.phone || 'لا يوجد رقم'} | العمر: {patient.age || '-'}</div>
                  </div>
                  <button onClick={() => viewPatientDetails(patient)} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition flex items-center gap-1">
                    <Eye size={14} /> عرض
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}