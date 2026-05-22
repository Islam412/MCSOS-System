import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  MessageCircle, Send, Clock, Users, Bell, Settings, 
  Phone, CheckCircle, XCircle, Calendar, FileText, 
  Star, TrendingUp, AlertCircle, Edit, Trash2, Plus,
  RefreshCw, Download, Filter, Search, Eye, EyeOff,
  Zap, Target, Award, Shield, Mail, UserCheck, 
  Moon, Sun, Monitor, Globe, Key, Lock, Save, X, Copy,
  User, Stethoscope, UserPlus, DollarSign, Building,
  CalendarDays, Pill, FileBadge, CreditCard, Smartphone,
  Headphones, Gift, Sparkles, Heart, Activity, LogOut,
  Home, BarChart3, MessageSquare, FolderKanban, Users2,
  UserCog, Hospital, Ambulance, Syringe, Bone, Brain,
  Microscope, ClipboardList, CalendarCheck, Wallet,
  Check, X as XIcon, AlertTriangle, Info, MessageSquareMore
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function WhatsAppManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language
  
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [activePatient, setActivePatient] = useState(null) // المريض النشط للطبيب

  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [scheduledMessages, setScheduledMessages] = useState([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showEditFlowModal, setShowEditFlowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')
  const [scheduleDateTime, setScheduleDateTime] = useState('')
  const [activeTab, setActiveTab] = useState('compose')
  const [editingFlow, setEditingFlow] = useState(null)
  const [editFlowData, setEditFlowData] = useState({
    name: '',
    message: '',
    delay: 0,
    enabled: true
  })
  const [selectedContact, setSelectedContact] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    patientName: '',
    patientPhone: '',
    doctorName: '',
    date: '',
    time: '',
    type: 'new' // new, cancel, confirm
  })

  // ==================== بيانات خاصة بكل دور ====================

  // بيانات المريض المسجل (للدكتور والاستقبال)
  const registeredPatients = [
    { id: 1, name: 'أحمد محمد', phone: '966508889999', doctor: 'د. أحمد علي', lastVisit: '2024-05-20', nextAppointment: '2024-05-25', balance: 500, status: 'نشط' },
    { id: 2, name: 'سارة حسن', phone: '966509990000', doctor: 'د. منى حسن', lastVisit: '2024-05-19', nextAppointment: '2024-05-26', balance: 0, status: 'نشط' },
    { id: 3, name: 'محمد علي', phone: '966501112233', doctor: 'د. خالد محمود', lastVisit: '2024-05-18', nextAppointment: '2024-05-27', balance: 200, status: 'قيد العلاج' },
    { id: 4, name: 'فاطمة خالد', phone: '966502223344', doctor: 'د. أحمد علي', lastVisit: '2024-05-17', nextAppointment: '2024-05-28', balance: 0, status: 'جديد' },
    { id: 5, name: 'عمر خالد', phone: '966503334455', doctor: 'د. منى حسن', lastVisit: '2024-05-16', nextAppointment: '2024-05-29', balance: 750, status: 'نشط' }
  ]

  // بيانات الأطباء
  const doctorsList = [
    { id: 1, name: 'د. أحمد علي', specialty: 'جراحة عظام', phone: '966501112222', department: 'العظام', patients: registeredPatients.filter(p => p.doctor === 'د. أحمد علي') },
    { id: 2, name: 'د. منى حسن', specialty: 'علاج طبيعي', phone: '966502223333', department: 'العلاج الطبيعي', patients: registeredPatients.filter(p => p.doctor === 'د. منى حسن') },
    { id: 3, name: 'د. خالد محمود', specialty: 'أعصاب', phone: '966503334444', department: 'الأعصاب', patients: registeredPatients.filter(p => p.doctor === 'د. خالد محمود') }
  ]

  // بيانات موظفي الاستقبال
  const receptionStaff = [
    { id: 1, name: 'نورة عبدالله', phone: '966504445555', shift: 'صباحي' },
    { id: 2, name: 'سارة أحمد', phone: '966505556666', shift: 'مسائي' }
  ]

  // بيانات الموظفين الماليين
  const financeStaff = [
    { id: 1, name: 'خالد محمد', phone: '966506667777', role: 'محاسب أول' },
    { id: 2, name: 'ريما سعد', phone: '966507778888', role: 'محاسبة' }
  ]

  // بيانات مدير النظام
  const systemAdmins = [
    { id: 1, name: 'مدير النظام', phone: '966500000001', role: 'مدير تقنية' },
    { id: 2, name: 'مدير المستشفى', phone: '966500000002', role: 'مدير عام' }
  ]

  // ==================== جهات الاتصال حسب الدور ====================
  
  const getContactsByRole = () => {
    const roleContacts = {
      // المريض: يتواصل مع طبيبه المعالج وموظف الاستقبال
      patient: () => {
        // نفترض أن المريض الحالي هو "أحمد محمد" (id=1) وطبيبه المعالج هو "د. أحمد علي"
        const currentPatient = registeredPatients[0]
        const myDoctor = doctorsList.find(d => d.name === currentPatient.doctor)
        
        return [
          { id: 'my_doctor', name: myDoctor?.name || 'د. أحمد علي', phone: myDoctor?.phone || '966501112222', department: 'طبيبي المعالج', icon: '👨‍⚕️', role: 'doctor', specialty: myDoctor?.specialty },
          { id: 'reception', name: 'موظف الاستقبال', phone: receptionStaff[0].phone, department: 'خدمة العملاء', icon: '📞', role: 'reception', name2: receptionStaff[0].name },
          { id: 'support', name: 'خدمة العملاء', phone: '966500000003', department: 'الدعم الفني', icon: '🆘', role: 'support' }
        ]
      },
      
      // المستخدم العادي: يتواصل مع الاستقبال والدعم الفني فقط
      user: () => [
        { id: 'reception', name: 'موظف الاستقبال', phone: receptionStaff[0].phone, department: 'خدمة العملاء', icon: '📞', role: 'reception' },
        { id: 'support', name: 'الدعم الفني', phone: '966500000003', department: 'تقنية المعلومات', icon: '💻', role: 'support' }
      ],
      
      // الطبيب: يتواصل مع مرضاه فقط
      doctor: () => {
        // نفترض أن الدكتور الحالي هو "د. أحمد علي"
        const currentDoctor = doctorsList[0]
        return currentDoctor.patients.map(p => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
          department: `مريض - آخر زيارة: ${p.lastVisit}`,
          icon: '👤',
          role: 'patient',
          nextAppointment: p.nextAppointment,
          balance: p.balance
        }))
      },
      
      // موظف الاستقبال: يتواصل مع جميع المرضى والأطباء
      reception: () => {
        const allPatients = registeredPatients.map(p => ({
          id: `patient_${p.id}`,
          name: p.name,
          phone: p.phone,
          department: `مريض - الدكتور: ${p.doctor}`,
          icon: '👤',
          role: 'patient',
          nextAppointment: p.nextAppointment,
          doctor: p.doctor
        }))
        
        const allDoctors = doctorsList.map(d => ({
          id: `doctor_${d.id}`,
          name: d.name,
          phone: d.phone,
          department: `طبيب - ${d.specialty}`,
          icon: '👨‍⚕️',
          role: 'doctor',
          specialty: d.specialty
        }))
        
        return [...allPatients, ...allDoctors]
      },
      
      // القسم المالي: يتواصل مع جميع العاملين (أطباء، استقبال، مدير)
      finance: () => {
        const allDoctors = doctorsList.map(d => ({
          id: `doctor_${d.id}`,
          name: d.name,
          phone: d.phone,
          department: `طبيب - ${d.specialty}`,
          icon: '👨‍⚕️',
          role: 'doctor'
        }))
        
        const allReception = receptionStaff.map(r => ({
          id: `reception_${r.id}`,
          name: r.name,
          phone: r.phone,
          department: `استقبال - ${r.shift}`,
          icon: '📞',
          role: 'reception'
        }))
        
        const admins = systemAdmins.map(a => ({
          id: `admin_${a.id}`,
          name: a.name,
          phone: a.phone,
          department: a.role,
          icon: '👔',
          role: 'admin'
        }))
        
        return [...allDoctors, ...allReception, ...admins]
      },
      
      // مدير النظام: يتواصل مع الجميع
      admin: () => {
        const allDoctors = doctorsList.map(d => ({
          id: `doctor_${d.id}`,
          name: d.name,
          phone: d.phone,
          department: `طبيب - ${d.specialty}`,
          icon: '👨‍⚕️',
          role: 'doctor'
        }))
        
        const allReception = receptionStaff.map(r => ({
          id: `reception_${r.id}`,
          name: r.name,
          phone: r.phone,
          department: `استقبال - ${r.shift}`,
          icon: '📞',
          role: 'reception'
        }))
        
        const allFinance = financeStaff.map(f => ({
          id: `finance_${f.id}`,
          name: f.name,
          phone: f.phone,
          department: `مالية - ${f.role}`,
          icon: '💰',
          role: 'finance'
        }))
        
        const allPatients = registeredPatients.map(p => ({
          id: `patient_${p.id}`,
          name: p.name,
          phone: p.phone,
          department: `مريض - الدكتور: ${p.doctor}`,
          icon: '👤',
          role: 'patient'
        }))
        
        return [...allDoctors, ...allReception, ...allFinance, ...allPatients, ...systemAdmins]
      }
    }
    
    const contactsGetter = roleContacts[userRole]
    return contactsGetter ? contactsGetter() : []
  }

  const [contacts, setContacts] = useState([])

  // ==================== القوالب حسب الدور ====================
  
  const getTemplatesByRole = () => {
    const roleTemplates = {
      // المريض
      patient: [
        { id: 'ask_doctor', nameAr: 'استفسار للطبيب', nameEn: 'Ask Doctor', messageAr: '👨‍⚕️ دكتور {doctor}، لدي استفسار بخصوص حالتي الصحية...', messageEn: 'Dr. {doctor}, I have a question about my health condition...', icon: '❓' },
        { id: 'book_appointment', nameAr: 'طلب حجز موعد', nameEn: 'Book Appointment', messageAr: '📅 أرغب في حجز موعد مع الدكتور {doctor} في أقرب وقت ممكن', messageEn: 'I would like to book an appointment with Dr. {doctor} as soon as possible', icon: '📅' },
        { id: 'cancel_appointment', nameAr: 'إلغاء موعد', nameEn: 'Cancel Appointment', messageAr: '❌ أرغب في إلغاء موعدي يوم {date} الساعة {time} مع الدكتور {doctor}', messageEn: 'I would like to cancel my appointment on {date} at {time} with Dr. {doctor}', icon: '❌' },
        { id: 'ask_reception', nameAr: 'استفسار للإستقبال', nameEn: 'Ask Reception', messageAr: '📞 مساء الخير، لدي استفسار بخصوص {topic}، أرجو المساعدة', messageEn: 'Good evening, I have an inquiry about {topic}, please help', icon: '📞' }
      ],
      
      // المستخدم العادي
      user: [
        { id: 'general_inquiry', nameAr: 'استفسار عام', nameEn: 'General Inquiry', messageAr: '❓ مرحباً، لدي استفسار بخصوص {topic}، يرجى المساعدة', messageEn: 'Hello, I have an inquiry about {topic}, please help', icon: '❓' },
        { id: 'technical_support', nameAr: 'دعم فني', nameEn: 'Technical Support', messageAr: '💻 يواجهني مشكلة تقنية: {issue}، يرجى المساعدة', messageEn: 'I am facing a technical issue: {issue}, please help', icon: '💻' },
        { id: 'complaint', nameAr: 'شكوى', nameEn: 'Complaint', messageAr: '⚠️ أرغب في تقديم شكوى بخصوص {complaint}', messageEn: 'I would like to file a complaint regarding {complaint}', icon: '⚠️' }
      ],
      
      // الطبيب
      doctor: [
        { id: 'appointment_reminder', nameAr: 'تذكير موعد', nameEn: 'Appointment Reminder', messageAr: '⏰ تذكير: لديك موعد مع الدكتور {doctor} يوم {date} الساعة {time}', messageEn: 'Reminder: You have an appointment with Dr. {doctor} on {date} at {time}', icon: '⏰' },
        { id: 'prescription', nameAr: 'روشتة طبية', nameEn: 'Prescription', messageAr: '💊 روشتتك الطبية: {medicines}\nالجرعة: {dosage}\nملاحظات: {notes}', messageEn: 'Your prescription: {medicines}\nDosage: {dosage}\nNotes: {notes}', icon: '💊' },
        { id: 'follow_up', nameAr: 'متابعة', nameEn: 'Follow-up', messageAr: '📞 متابعة: كيف حالك بعد الجلسة؟ نتمنى لك الشفاء العاجل', messageEn: 'Follow-up: How are you feeling after the session? Wishing you a speedy recovery', icon: '📞' },
        { id: 'lab_result', nameAr: 'نتيجة تحليل', nameEn: 'Lab Result', messageAr: '🔬 نتائج التحاليل جاهزة. يرجى مراجعة العيادة لاستلامها', messageEn: 'Lab results are ready. Please visit the clinic to receive them', icon: '🔬' }
      ],
      
      // موظف الاستقبال
      reception: [
        { id: 'confirm_appointment', nameAr: 'تأكيد موعد', nameEn: 'Confirm Appointment', messageAr: '✅ تم تأكيد موعدك مع الدكتور {doctor} يوم {date} الساعة {time}', messageEn: 'Your appointment with Dr. {doctor} has been confirmed on {date} at {time}', icon: '✅' },
        { id: 'cancel_appointment', nameAr: 'إلغاء موعد', nameEn: 'Cancel Appointment', messageAr: '❌ تم إلغاء موعدك مع الدكتور {doctor} يوم {date}', messageEn: 'Your appointment with Dr. {doctor} on {date} has been cancelled', icon: '❌' },
        { id: 'reschedule_appointment', nameAr: 'إعادة جدولة', nameEn: 'Reschedule', messageAr: '📅 تم إعادة جدولة موعدك ليوم {newDate} الساعة {newTime}', messageEn: 'Your appointment has been rescheduled to {newDate} at {newTime}', icon: '📅' },
        { id: 'payment_reminder', nameAr: 'تذكير بدفع', nameEn: 'Payment Reminder', messageAr: '💰 تذكير: لديك مبلغ مستحق قيمته {amount} ريال', messageEn: 'Reminder: You have an outstanding payment of {amount} SAR', icon: '💰' },
        { id: 'registration_complete', nameAr: 'اكتمال التسجيل', nameEn: 'Registration Complete', messageAr: '📝 تم تسجيلك بنجاح في المركز الطبي. رقم ملفك: {fileNumber}', messageEn: 'Successfully registered at the medical center. Your file number: {fileNumber}', icon: '📝' }
      ],
      
      // القسم المالي
      finance: [
        { id: 'payment_due_doctor', nameAr: 'مستحقات طبيب', nameEn: 'Doctor Payment', messageAr: '💰 دكتور {doctor}، مستحقاتك لهذا الشهر: {amount} ريال', messageEn: 'Dr. {doctor}, your monthly dues: {amount} SAR', icon: '💰' },
        { id: 'payment_due_staff', nameAr: 'مستحقات موظف', nameEn: 'Staff Payment', messageAr: '💰 الأستاذ {name}، مستحقاتك لهذا الشهر: {amount} ريال', messageEn: 'Mr./Ms. {name}, your monthly dues: {amount} SAR', icon: '💰' },
        { id: 'invoice_reminder', nameAr: 'تذكير فاتورة', nameEn: 'Invoice Reminder', messageAr: '📄 فاتورة رقم {invoice} مستحقة الدفع بقيمة {amount} ريال', messageEn: 'Invoice #{invoice} is due for payment of {amount} SAR', icon: '📄' },
        { id: 'financial_report', nameAr: 'تقرير مالي', nameEn: 'Financial Report', messageAr: '📊 التقرير المالي للشهر: الإيرادات {revenue} ريال، المصروفات {expenses} ريال', messageEn: 'Monthly financial report: Revenue {revenue} SAR, Expenses {expenses} SAR', icon: '📊' },
        { id: 'complaint_finance', nameAr: 'شكوى مالية', nameEn: 'Financial Complaint', messageAr: '⚠️ يوجد شكوى مالية من المريض {patient} بخصوص {issue}', messageEn: 'There is a financial complaint from patient {patient} regarding {issue}', icon: '⚠️' }
      ],
      
      // مدير النظام
      admin: [
        { id: 'system_update', nameAr: 'تحديث النظام', nameEn: 'System Update', messageAr: '🔄 سيتم تحديث النظام يوم {date} من الساعة {startTime} إلى {endTime}', messageEn: 'The system will be updated on {date} from {startTime} to {endTime}', icon: '🔄' },
        { id: 'staff_meeting', nameAr: 'اجتماع الموظفين', nameEn: 'Staff Meeting', messageAr: '👥 اجتماع للموظفين يوم {date} الساعة {time} في {location}', messageEn: 'Staff meeting on {date} at {time} at {location}', icon: '👥' },
        { id: 'announcement', nameAr: 'إعلان عام', nameEn: 'Announcement', messageAr: '📢 إعلان: {announcement}', messageEn: 'Announcement: {announcement}', icon: '📢' },
        { id: 'emergency', nameAr: 'حالة طارئة', nameEn: 'Emergency', messageAr: '🚨 حالة طارئة: {emergency}. يرجى اتخاذ الإجراءات اللازمة', messageEn: 'Emergency: {emergency}. Please take necessary actions', icon: '🚨' },
        { id: 'performance_report', nameAr: 'تقرير الأداء', nameEn: 'Performance Report', messageAr: '📊 تقرير أداء الموظفين: {report}', messageEn: 'Staff performance report: {report}', icon: '📊' }
      ]
    }
    
    return roleTemplates[userRole] || roleTemplates.user
  }

  const [templates, setTemplates] = useState([])

  // ==================== التدفقات الآلية حسب الدور ====================
  
  const getAutoFlowsByRole = () => {
    const roleFlows = {
      patient: [
        { id: 1, nameAr: 'تذكير موعد', nameEn: 'Appointment Reminder', enabled: true, delay: 24, delayUnit: 'hours', message: '⏰ تذكير: لديك موعد مع الدكتور {doctor} غداً الساعة {time}' },
        { id: 2, nameAr: 'تأكيد حجز', nameEn: 'Booking Confirmation', enabled: true, delay: 0, delayUnit: 'hours', message: '✅ تم تأكيد حجز موعدك مع الدكتور {doctor} يوم {date} الساعة {time}' }
      ],
      doctor: [
        { id: 1, nameAr: 'تذكير موعد مريض', nameEn: 'Patient Reminder', enabled: true, delay: 24, delayUnit: 'hours', message: '⏰ تذكير: لديك موعد مع المريض {patient} غداً الساعة {time}' },
        { id: 2, nameAr: 'روشتة إلكترونية', nameEn: 'E-Prescription', enabled: true, delay: 0, delayUnit: 'hours', message: '💊 تم إرسال روشتة للمريض {patient}' }
      ],
      reception: [
        { id: 1, nameAr: 'تأكيد موعد', nameEn: 'Confirm Appointment', enabled: true, delay: 48, delayUnit: 'hours', message: '✅ تم تأكيد موعدك مع الدكتور {doctor} يوم {date} الساعة {time}' },
        { id: 2, nameAr: 'تذكير بدفع', nameEn: 'Payment Reminder', enabled: true, delay: 0, delayUnit: 'hours', message: '💰 تذكير: لديك مبلغ مستحق قيمته {amount} ريال' }
      ],
      finance: [
        { id: 1, nameAr: 'مستحقات شهرية', nameEn: 'Monthly Dues', enabled: true, delay: 0, delayUnit: 'hours', message: '💰 مستحقاتك لهذا الشهر: {amount} ريال' },
        { id: 2, nameAr: 'تقرير مالي', nameEn: 'Financial Report', enabled: true, delay: 0, delayUnit: 'hours', message: '📊 التقرير المالي الشهري جاهز للاطلاع' }
      ],
      admin: [
        { id: 1, nameAr: 'تحديث نظام', nameEn: 'System Update', enabled: true, delay: 0, delayUnit: 'hours', message: '🔄 سيتم تحديث النظام يوم {date}' },
        { id: 2, nameAr: 'تقرير أداء', nameEn: 'Performance Report', enabled: true, delay: 0, delayUnit: 'hours', message: '📊 تقرير أداء النظام لهذا الأسبوع جاهز' }
      ],
      user: [
        { id: 1, nameAr: 'رسالة ترحيب', nameEn: 'Welcome', enabled: true, delay: 0, delayUnit: 'hours', message: '👋 مرحباً بك في نظام المركز الطبي' }
      ]
    }
    return roleFlows[userRole] || roleFlows.user
  }

  const [autoFlows, setAutoFlows] = useState([])

  // ==================== إحصائيات حسب الدور ====================
  
  const getStatsByRole = () => {
    const baseStats = {
      messagesSent: scheduledMessages.filter(m => m.status === 'sent').length,
      scheduledCount: scheduledMessages.filter(m => m.status === 'scheduled').length,
      automatedCount: autoFlows.filter(f => f.enabled).length
    }
    
    const roleStats = {
      patient: { ...baseStats, activeChats: 2, myDoctor: 'د. أحمد علي', nextAppointment: '2024-05-25' },
      user: { ...baseStats, activeChats: 1 },
      doctor: { ...baseStats, activeChats: doctorsList[0]?.patients.length || 0, myPatients: doctorsList[0]?.patients.length || 0 },
      reception: { ...baseStats, activeChats: registeredPatients.length + doctorsList.length, pendingAppointments: registeredPatients.filter(p => p.nextAppointment).length },
      finance: { ...baseStats, activeChats: doctorsList.length + receptionStaff.length, pendingPayments: registeredPatients.filter(p => p.balance > 0).length },
      admin: { ...baseStats, activeChats: registeredPatients.length + doctorsList.length + receptionStaff.length + financeStaff.length }
    }
    
    return roleStats[userRole] || baseStats
  }

  const stats = getStatsByRole()

  // ==================== دوال المساعدة ====================
  
  const [contactsList, setContactsList] = useState([])

  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setUserRole(parsed.role)
      setIsNewUser(parsed.isNew || false)
    } else {
      setShowRoleSelector(true)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (userRole) {
      setTemplates(getTemplatesByRole())
      setAutoFlows(getAutoFlowsByRole())
      setContactsList(getContactsByRole())
    }
  }, [userRole])

  const loadData = () => {
    const savedMessages = localStorage.getItem(`mcsos_whatsapp_messages_${userRole}`)
    if (savedMessages) {
      setScheduledMessages(JSON.parse(savedMessages))
    }
    const savedFlows = localStorage.getItem(`mcsos_whatsapp_flows_${userRole}`)
    if (savedFlows) {
      setAutoFlows(JSON.parse(savedFlows))
    }
  }

  useEffect(() => {
    if (userRole) {
      localStorage.setItem(`mcsos_whatsapp_messages_${userRole}`, JSON.stringify(scheduledMessages))
    }
  }, [scheduledMessages, userRole])

  useEffect(() => {
    if (userRole) {
      localStorage.setItem(`mcsos_whatsapp_flows_${userRole}`, JSON.stringify(autoFlows))
    }
  }, [autoFlows, userRole])

  const getTemplateName = (template) => {
    if (currentLang === 'ar') return template.nameAr
    return template.nameEn
  }

  const getTemplateMessage = (template) => {
    if (currentLang === 'ar') return template.messageAr
    return template.messageEn
  }

  const getFlowName = (flow) => {
    if (currentLang === 'ar') return flow.nameAr
    return flow.nameEn
  }

  const getRoleTitle = () => {
    const titles = {
      admin: 'نظام واتساب - المدير العام',
      doctor: 'نظام واتساب - الطبيب',
      reception: 'نظام واتساب - موظف الاستقبال',
      finance: 'نظام واتساب - القسم المالي',
      patient: 'نظام واتساب - المريض',
      user: 'نظام واتساب - مستخدم النظام'
    }
    return titles[userRole] || 'نظام واتساب'
  }

  const getRoleSubtitle = () => {
    const subtitles = {
      admin: 'إدارة عامة، تواصل مع جميع الموظفين والمرضى',
      doctor: 'التواصل مع مرضاك، إرسال التذكيرات والروشتات',
      reception: 'إدارة المواعيد، التواصل مع المرضى والأطباء',
      finance: 'إدارة المستحقات المالية، التواصل مع جميع العاملين',
      patient: 'التواصل مع طبيبك وموظفي الاستقبال',
      user: 'التواصل مع خدمة العملاء والدعم الفني'
    }
    return subtitles[userRole] || 'نظام التواصل عبر واتساب'
  }

  const getRoleIcon = () => {
    const icons = {
      admin: <UserCog size={24} className="text-purple-400" />,
      doctor: <Stethoscope size={24} className="text-blue-400" />,
      reception: <UserPlus size={24} className="text-green-400" />,
      finance: <DollarSign size={24} className="text-yellow-400" />,
      patient: <User size={24} className="text-pink-400" />,
      user: <UserCheck size={24} className="text-gray-400" />
    }
    return icons[userRole] || <MessageCircle size={24} className="text-green-500" />
  }

  const getPlaceholderPhone = () => {
    const placeholders = {
      admin: 'ابحث عن موظف أو مريض...',
      doctor: 'ابحث عن مريض...',
      reception: 'ابحث عن مريض أو طبيب...',
      finance: 'ابحث عن طبيب أو موظف...',
      patient: 'اختر طبيبك المعالج أو الاستقبال...',
      user: 'اختر جهة الاتصال...'
    }
    return placeholders[userRole] || 'أدخل رقم الجوال...'
  }

  const handleRoleSelect = (role) => {
    let userName = ''
    switch(role) {
      case 'patient': userName = 'أحمد محمد'; break
      case 'doctor': userName = 'د. أحمد علي'; break
      case 'reception': userName = 'نورة عبدالله'; break
      case 'finance': userName = 'خالد محمد'; break
      case 'admin': userName = 'مدير النظام'; break
      default: userName = 'مستخدم النظام'
    }
    
    const newUser = {
      id: Date.now(),
      name: userName,
      role: role,
      isNew: true,
      joinedAt: new Date().toISOString()
    }
    localStorage.setItem('mcsos_user', JSON.stringify(newUser))
    setUser(newUser)
    setUserRole(role)
    setIsNewUser(true)
    setShowRoleSelector(false)
    toast.success(`مرحباً بك في نظام واتساب - ${getRoleTitle()}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('mcsos_user')
    setUser(null)
    setUserRole('')
    setShowRoleSelector(true)
    toast.success('تم تسجيل الخروج بنجاح')
  }

  const handleTemplateChange = (e) => {
    const templateId = e.target.value
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      let msg = getTemplateMessage(template)
      // استبدال المتغيرات
      msg = msg.replace('{doctor}', selectedContact?.name || 'الطبيب')
      msg = msg.replace('{patient}', selectedContact?.name || 'المريض')
      msg = msg.replace('{date}', new Date().toLocaleDateString('ar-EG'))
      msg = msg.replace('{time}', new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
      msg = msg.replace('{amount}', '500')
      setMessage(msg)
    }
  }

  const handleSelectContact = (contact) => {
    setSelectedContact(contact)
    setPhoneNumber(contact.phone)
    setShowContactModal(false)
    toast.success(`تم تحديد ${contact.name}`)
  }

  const handleSendMessage = () => {
    if (!phoneNumber) {
      toast.error('الرجاء إدخال رقم الجوال أو اختيار جهة اتصال')
      return
    }
    if (!message) {
      toast.error('الرجاء إدخال الرسالة')
      return
    }

    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    const newMessage = {
      id: Date.now(),
      phone: phoneNumber,
      message: message,
      date: new Date().toLocaleString(),
      status: 'sent',
      type: 'instant',
      role: userRole,
      sender: user?.name,
      recipient: selectedContact?.name
    }
    setScheduledMessages([newMessage, ...scheduledMessages])
    
    toast.success('تم إرسال الرسالة')
    setPhoneNumber('')
    setMessage('')
    setSelectedTemplate('')
    setSelectedContact(null)
  }

  const handleScheduleMessage = () => {
    if (!phoneNumber || !message || !scheduleDateTime) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }

    const newSchedule = {
      id: Date.now(),
      phone: phoneNumber,
      message: message,
      scheduledTime: scheduleDateTime,
      status: 'scheduled',
      type: 'scheduled',
      role: userRole,
      sender: user?.name,
      recipient: selectedContact?.name,
      createdAt: new Date().toISOString()
    }
    setScheduledMessages([newSchedule, ...scheduledMessages])
    toast.success('تم جدولة الرسالة')
    
    setShowScheduleModal(false)
    setPhoneNumber('')
    setMessage('')
    setScheduleDateTime('')
    setSelectedTemplate('')
  }

  const handleDeleteMessage = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      setScheduledMessages(scheduledMessages.filter(m => m.id !== id))
      toast.success('تم حذف الرسالة')
    }
  }

  const handleResendMessage = (msg) => {
    const formattedPhone = msg.phone.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg.message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('جاري إعادة إرسال الرسالة')
  }

  const toggleAutoFlow = (id) => {
    setAutoFlows(autoFlows.map(flow => 
      flow.id === id ? { ...flow, enabled: !flow.enabled } : flow
    ))
    toast.success('تم تحديث الإعدادات')
  }

  const handlePreviewFlow = (flow) => {
    let previewMsg = flow.message
    previewMsg = previewMsg.replace('{doctor}', 'د. أحمد علي')
    previewMsg = previewMsg.replace('{patient}', 'أحمد محمد')
    previewMsg = previewMsg.replace('{date}', '2024-05-25')
    previewMsg = previewMsg.replace('{time}', '10:00 صباحاً')
    previewMsg = previewMsg.replace('{amount}', '500')
    setPreviewMessage(previewMsg)
    setShowPreviewModal(true)
  }

  const handleEditFlow = (flow) => {
    setEditingFlow(flow)
    setEditFlowData({
      name: flow.name,
      nameAr: flow.nameAr,
      nameEn: flow.nameEn,
      message: flow.message,
      delay: flow.delay,
      delayUnit: flow.delayUnit || 'hours',
      enabled: flow.enabled
    })
    setShowEditFlowModal(true)
  }

  const handleSaveFlowEdit = () => {
    const updatedFlows = autoFlows.map(flow => 
      flow.id === editingFlow.id ? {
        ...flow,
        nameAr: editFlowData.nameAr || flow.nameAr,
        nameEn: editFlowData.nameEn || flow.nameEn,
        message: editFlowData.message,
        delay: editFlowData.delay,
        delayUnit: editFlowData.delayUnit
      } : flow
    )
    setAutoFlows(updatedFlows)
    setShowEditFlowModal(false)
    setEditingFlow(null)
    toast.success('تم تحديث التدفق بنجاح')
  }

  const getStatusBadge = (status) => {
    if (status === 'sent') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle size={12} className="inline ml-1" /> مرسلة</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"><Clock size={12} className="inline ml-1" /> مجدولة</span>
  }

  const getDelayText = (delay, unit) => {
    if (delay === 0) return 'فوري'
    const unitText = unit === 'hours' ? 'ساعة' : 'يوم'
    return `${delay} ${unitText} قبل الموعد`
  }

  // قائمة الأدوار لشاشة الاختيار
  const availableRoles = [
    { id: 'admin', name: 'المدير العام', icon: <UserCog size={28} />, color: 'purple', description: 'إدارة عامة، تواصل مع جميع الموظفين والمرضى' },
    { id: 'doctor', name: 'طبيب', icon: <Stethoscope size={28} />, color: 'blue', description: 'متابعة مرضاك، إرسال التذكيرات والروشتات' },
    { id: 'reception', name: 'موظف استقبال', icon: <UserPlus size={28} />, color: 'green', description: 'إدارة المواعيد، التواصل مع المرضى والأطباء' },
    { id: 'finance', name: 'القسم المالي', icon: <DollarSign size={28} />, color: 'yellow', description: 'إدارة المستحقات، التواصل مع جميع العاملين' },
    { id: 'patient', name: 'مريض', icon: <User size={28} />, color: 'pink', description: 'التواصل مع طبيبك وموظفي الاستقبال' },
    { id: 'user', name: 'مستخدم عام', icon: <UserCheck size={28} />, color: 'gray', description: 'استفسارات عامة وتواصل مع الدعم' }
  ]

  // شاشة اختيار الدور
  if (showRoleSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl mb-4">
              <MessageCircle size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">نظام الترسل الطبي</h1>
            <p className="text-gray-400">اختر دورك للدخول إلى نظام التواصل عبر واتساب</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="bg-gray-800/80 hover:bg-gray-700/80 rounded-2xl p-6 text-right transition-all duration-300 border border-gray-700 hover:border-green-500/50 group"
              >
                <div className={`inline-flex p-3 bg-${role.color}-500/20 rounded-xl mb-4 text-${role.color}-400 group-hover:scale-110 transition`}>
                  {role.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{role.name}</h3>
                <p className="text-gray-400 text-sm">{role.description}</p>
                <div className="mt-4 text-green-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  اختيار <span className="text-lg">←</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!userRole) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-700/50 rounded-xl">{getRoleIcon()}</div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              {getRoleTitle()}
            </h1>
            <p className="text-gray-400 mt-1">{getRoleSubtitle()}</p>
            {isNewUser && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full mt-1">
                <Sparkles size={10} /> مستخدم جديد
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{availableRoles.find(r => r.id === userRole)?.name}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-red-500/30 transition"
          >
            <LogOut size={18} /> تسجيل الخروج
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30 transition"
          >
            <Settings size={18} /> إعدادات
          </button>
        </div>
      </div>

      {/* تبويبات التنقل */}
      <div className="flex gap-2 border-b border-gray-700 pb-2 flex-wrap">
        <button onClick={() => setActiveTab('compose')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'compose' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
          <Send size={18} className="inline ml-2" /> كتابة رسالة
        </button>
        <button onClick={() => setActiveTab('contacts')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'contacts' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
          <Users size={18} className="inline ml-2" /> جهات الاتصال
        </button>
        {userRole === 'reception' && (
          <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'appointments' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
            <Calendar size={18} className="inline ml-2" /> إدارة المواعيد
          </button>
        )}
        <button onClick={() => setActiveTab('flows')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'flows' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
          <Zap size={18} className="inline ml-2" /> تدفقات آلية
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'history' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
          <Clock size={18} className="inline ml-2" /> سجل الرسائل
        </button>
      </div>

      {/* تبويب كتابة رسالة */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <MessageCircle className="text-green-500" size={22} />
              كتابة رسالة جديدة
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  جهة الاتصال
                </label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    placeholder={getPlaceholderPhone()} 
                    className="flex-1 p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                  />
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="px-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition"
                  >
                    <Users size={18} />
                  </button>
                </div>
                {selectedContact && (
                  <p className="text-xs text-green-400 mt-1">✓ تم اختيار: {selectedContact.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {userRole === 'patient' && 'يمكنك التواصل مع طبيبك المعالج أو موظف الاستقبال'}
                  {userRole === 'doctor' && 'يمكنك التواصل مع مرضاك المسجلين'}
                  {userRole === 'reception' && 'يمكنك التواصل مع المرضى والأطباء'}
                  {userRole === 'finance' && 'يمكنك التواصل مع جميع العاملين في النظام'}
                  {userRole === 'admin' && 'يمكنك التواصل مع جميع الموظفين والمرضى'}
                  {userRole === 'user' && 'يمكنك التواصل مع خدمة العملاء والدعم الفني'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  القالب
                </label>
                <select className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition" value={selectedTemplate} onChange={handleTemplateChange}>
                  <option value="">اختر قالباً</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.icon} {getTemplateName(template)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  الرسالة
                </label>
                <textarea 
                  rows="6" 
                  className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="اكتب رسالتك هنا..."
                />
                <div className="text-right text-xs text-gray-500 mt-1">{message.length} / 1000</div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={handleSendMessage} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 font-semibold">
                  <Send size={18} /> إرسال الآن
                </button>
                <button onClick={() => setShowScheduleModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 font-semibold">
                  <Clock size={18} /> جدولة
                </button>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <TrendingUp className="text-blue-500" size={22} /> 
                إحصائيات
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                  <Send size={24} className="mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-green-400">{stats.messagesSent}</div>
                  <div className="text-sm text-gray-400">رسائل مرسلة</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <Clock size={24} className="mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{stats.scheduledCount}</div>
                  <div className="text-sm text-gray-400">مجدولة</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <Users size={24} className="mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold text-purple-400">{stats.activeChats}</div>
                  <div className="text-sm text-gray-400">جهات اتصال</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <Zap size={24} className="mx-auto text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">{stats.automatedCount}</div>
                  <div className="text-sm text-gray-400">تدفقات آلية</div>
                </div>
              </div>
              
              {/* معلومات إضافية حسب الدور */}
              {userRole === 'patient' && stats.myDoctor && (
                <div className="mt-4 p-3 bg-pink-500/10 rounded-xl border border-pink-500/30">
                  <p className="text-sm text-pink-300">👨‍⚕️ طبيبك المعالج: {stats.myDoctor}</p>
                  <p className="text-sm text-pink-300">📅 موعدك القادم: {stats.nextAppointment}</p>
                </div>
              )}
              {userRole === 'doctor' && stats.myPatients && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <p className="text-sm text-blue-300">👥 عدد مرضاك: {stats.myPatients} مريض</p>
                </div>
              )}
              {userRole === 'reception' && stats.pendingAppointments && (
                <div className="mt-4 p-3 bg-orange-500/10 rounded-xl border border-orange-500/30">
                  <p className="text-sm text-orange-300">⏳ مواعيد قادمة: {stats.pendingAppointments}</p>
                </div>
              )}
              {userRole === 'finance' && stats.pendingPayments && (
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <p className="text-sm text-yellow-300">💰 مدفوعات مستحقة: {stats.pendingPayments}</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl p-6 border border-green-500/30">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Award size={18} className="text-green-400" /> 
                نصائح سريعة
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {userRole === 'patient' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> يمكنك التواصل مع طبيبك المعالج مباشرة</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> استخدم قالب "طلب حجز موعد" لحجز موعد جديد</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> يمكنك إلغاء أو إعادة جدولة مواعيدك</li>
                  </>
                )}
                {userRole === 'doctor' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> تواصل مع مرضاك عبر جهات الاتصال</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> استخدم قالب "روشتة طبية" لإرسال الوصفات</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> جدولة تذكيرات للمواعيد القادمة</li>
                  </>
                )}
                {userRole === 'reception' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> تأكيد وإلغاء مواعيد المرضى</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> إرسال تذكيرات للمواعيد</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> التواصل مع الأطباء بخصوص جداولهم</li>
                  </>
                )}
                {userRole === 'finance' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> التواصل مع الأطباء بخصوص مستحقاتهم</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> إرسال تذكيرات دفع للمرضى</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> متابعة الشكاوى المالية</li>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> التواصل مع جميع الموظفين والمرضى</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> إرسال إعلانات عامة وتحديثات النظام</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> متابعة أداء النظام والتقارير</li>
                  </>
                )}
                {userRole === 'user' && (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> التواصل مع خدمة العملاء للاستفسارات</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> الإبلاغ عن المشكلات التقنية</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> تقديم الشكاوى والاقتراحات</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* تبويب جهات الاتصال - حسب الدور */}
      {activeTab === 'contacts' && (
        <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Users className="text-blue-500" size={22} /> 
            جهات الاتصال - {availableRoles.find(r => r.id === userRole)?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contactsList.map(contact => (
              <div key={contact.id} className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition cursor-pointer" onClick={() => handleSelectContact(contact)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-xl">{contact.icon}</div>
                  <div>
                    <p className="font-semibold text-white">{contact.name}</p>
                    <p className="text-xs text-gray-400">{contact.department}</p>
                    <p className="text-xs text-gray-500 dir-ltr">{contact.phone}</p>
                    {contact.nextAppointment && <p className="text-xs text-green-400">الموعد القادم: {contact.nextAppointment}</p>}
                    {contact.balance > 0 && <p className="text-xs text-yellow-400">المستحق: {contact.balance} ريال</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {contactsList.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              لا توجد جهات اتصال متاحة لدورك
            </div>
          )}
        </div>
      )}

      {/* تبويب إدارة المواعيد - لموظف الاستقبال فقط */}
      {activeTab === 'appointments' && userRole === 'reception' && (
        <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Calendar className="text-green-500" size={22} /> 
            إدارة المواعيد
          </h2>
          <div className="space-y-3">
            {registeredPatients.map(patient => (
              <div key={patient.id} className="bg-gray-700/30 rounded-xl p-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-white">{patient.name}</p>
                    <p className="text-xs text-gray-400">الدكتور: {patient.doctor}</p>
                    <p className="text-xs text-gray-500">الموعد القادم: {patient.nextAppointment}</p>
                    {patient.balance > 0 && <p className="text-xs text-yellow-400">المستحق: {patient.balance} ريال</p>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setPhoneNumber(patient.phone)
                        setMessage(`✅ تم تأكيد موعدك مع الدكتور ${patient.doctor} يوم ${patient.nextAppointment}`)
                        setActiveTab('compose')
                        toast.success('تم تجهيز رسالة التأكيد')
                      }}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition flex items-center gap-1"
                    >
                      <Check size={14} /> تأكيد
                    </button>
                    <button 
                      onClick={() => {
                        setPhoneNumber(patient.phone)
                        setMessage(`❌ تم إلغاء موعدك مع الدكتور ${patient.doctor} يوم ${patient.nextAppointment}`)
                        setActiveTab('compose')
                        toast.success('تم تجهيز رسالة الإلغاء')
                      }}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition flex items-center gap-1"
                    >
                      <XIcon size={14} /> إلغاء
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedContact({ name: patient.name, phone: patient.phone })
                        setPhoneNumber(patient.phone)
                        setActiveTab('compose')
                      }}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition flex items-center gap-1"
                    >
                      <MessageCircle size={14} /> مراسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تبويب التدفقات الآلية */}
      {activeTab === 'flows' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {autoFlows.map((flow) => (
            <div key={flow.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Zap size={20} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{getFlowName(flow)}</h3>
                    <p className="text-xs text-gray-400">{getDelayText(flow.delay, flow.delayUnit)}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={flow.enabled} onChange={() => toggleAutoFlow(flow.id)} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 mt-2">
                <p className="text-sm text-gray-300 line-clamp-2">{flow.message}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEditFlow(flow)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition flex items-center justify-center gap-2">
                  <Edit size={14} /> تعديل
                </button>
                <button onClick={() => handlePreviewFlow(flow)} className="flex-1 bg-purple-500/20 text-purple-400 py-2 rounded-lg text-sm hover:bg-purple-500/30 transition flex items-center justify-center gap-2">
                  <Eye size={14} /> معاينة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* تبويب سجل الرسائل */}
      {activeTab === 'history' && (
        <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Clock className="text-blue-500" size={22} /> 
            سجل الرسائل
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scheduledMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                لا توجد رسائل
              </div>
            ) : (
              scheduledMessages.map(msg => (
                <div key={msg.id} className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="font-mono text-sm text-white">{msg.phone}</span>
                      {msg.recipient && <span className="text-xs text-gray-400">← {msg.recipient}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(msg.status)}
                      <span className="text-xs text-gray-500">{msg.date || msg.scheduledTime}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{msg.message}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleResendMessage(msg)} className="text-green-400 hover:bg-green-500/20 p-1 rounded text-xs flex items-center gap-1">
                      <Send size={12} /> إعادة إرسال
                    </button>
                    <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 hover:bg-red-500/20 p-1 rounded text-xs flex items-center gap-1">
                      <Trash2 size={12} /> حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* مودال اختيار جهة اتصال */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-blue-400" /> 
                جهات الاتصال
              </h2>
              <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {contactsList.map(contact => (
                <div key={contact.id} className="bg-gray-700/30 rounded-xl p-3 hover:bg-gray-700/50 transition cursor-pointer" onClick={() => handleSelectContact(contact)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-xl">{contact.icon}</div>
                    <div>
                      <p className="font-semibold text-white">{contact.name}</p>
                      <p className="text-xs text-gray-400">{contact.department}</p>
                      <p className="text-xs text-gray-500 dir-ltr">{contact.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* مودال جدولة رسالة */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">جدولة رسالة</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">رقم الجوال</label>
                <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">الرسالة</label>
                <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">تاريخ ووقت الإرسال</label>
                <input type="datetime-local" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={scheduleDateTime} onChange={(e) => setScheduleDateTime(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleScheduleMessage} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">
                  جدولة
                </button>
                <button onClick={() => setShowScheduleModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل التدفق */}
      {showEditFlowModal && editingFlow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">تعديل التدفق</h2>
              <button onClick={() => setShowEditFlowModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">نص الرسالة</label>
                <textarea className="w-full p-3 bg-gray-700 rounded-lg text-white" rows="5" value={editFlowData.message} onChange={(e) => setEditFlowData({...editFlowData, message: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1">يمكنك استخدام المتغيرات: {`{doctor}, {patient}, {date}, {time}, {amount}`}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">المدة</label>
                  <input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editFlowData.delay} onChange={(e) => setEditFlowData({...editFlowData, delay: parseInt(e.target.value) || 0})} min="0" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">الوحدة</label>
                  <select className="w-full p-2 bg-gray-700 rounded-lg text-white" value={editFlowData.delayUnit} onChange={(e) => setEditFlowData({...editFlowData, delayUnit: e.target.value})}>
                    <option value="hours">ساعات</option>
                    <option value="days">أيام</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveFlowEdit} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">
                  <Save size={16} /> حفظ
                </button>
                <button onClick={() => setShowEditFlowModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال معاينة الرسالة */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">معاينة الرسالة</h2>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={16} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="bg-green-500/20 rounded-2xl rounded-tr-none p-3">
                    <p className="text-white text-sm whitespace-pre-wrap">{previewMessage}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 mt-4">
              <button onClick={() => { setMessage(previewMessage); setShowPreviewModal(false); setActiveTab('compose'); toast.success('تم نسخ الرسالة'); }} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition">
                <Copy size={16} /> استخدام هذه الرسالة
              </button>
              <button onClick={() => setShowPreviewModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الإعدادات */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">إعدادات واتساب</h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">معلومات الحساب</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  {getRoleIcon()}
                  <div>
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-sm text-gray-400">{availableRoles.find(r => r.id === userRole)?.name}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">إعدادات الإشعارات</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">تفعيل الإشعارات</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">تفعيل الرد التلقائي</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button onClick={() => setShowSettingsModal(false)} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">
                  <Save size={18} /> حفظ الإعدادات
                </button>
                <button onClick={() => setShowSettingsModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
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