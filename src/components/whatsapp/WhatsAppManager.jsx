// src/components/whatsapp/WhatsAppManager.jsx
import { useState, useEffect } from 'react'
import { confirmAlert } from '../../utils/confirmAlert'
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
  Check, XIcon, AlertTriangle, Info, MessageSquareMore,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { whatsappService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

// ========== مفاتيح التخزين في localStorage ==========
const STORAGE_KEYS = {
  CONTACTS: 'mcsos_whatsapp_contacts',
  TEMPLATES: 'mcsos_whatsapp_templates',
  FLOWS: 'mcsos_whatsapp_flows',
  HISTORY: 'mcsos_whatsapp_history'
}

// ========== دالة مساعدة للوصول إلى localStorage ==========
const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error reading ${key}:`, error)
    return null
  }
}

// ========== البيانات الافتراضية (للاختبار) ==========
const defaultContacts = [
  { id: '1', name: 'أحمد محمد', phone: '0501111111', department: 'مرضى', icon: '👤' },
  { id: '2', name: 'د. أحمد علي', phone: '0502222222', department: 'أطباء', icon: '👨‍⚕️' },
  { id: '3', name: 'نورة عبدالله', phone: '0503333333', department: 'مرضى', icon: '👩' },
  { id: '4', name: 'موظف الاستقبال', phone: '0504444444', department: 'استقبال', icon: '📞' }
]

const defaultTemplates = [
  { id: '1', nameAr: 'تذكير بموعد', nameEn: 'Appointment Reminder', icon: '📅', messageAr: 'تذكير بموعدك مع د. {doctor} يوم {date} الساعة {time}', messageEn: 'Reminder for your appointment with Dr. {doctor} on {date} at {time}' },
  { id: '2', nameAr: 'تأكيد موعد', nameEn: 'Appointment Confirmation', icon: '✅', messageAr: 'تم تأكيد موعدك مع د. {doctor} يوم {date} الساعة {time}', messageEn: 'Your appointment with Dr. {doctor} on {date} at {time} has been confirmed' },
  { id: '3', nameAr: 'استفسار', nameEn: 'Inquiry', icon: '❓', messageAr: 'استفسار بخصوص {topic}', messageEn: 'Inquiry regarding {topic}' },
  { id: '4', nameAr: 'تأكيد دفع', nameEn: 'Payment Confirmation', icon: '💰', messageAr: 'تم تأكيد دفع مبلغ {amount} عن الفاتورة {invoice}', messageEn: 'Payment of {amount} for invoice {invoice} has been confirmed' }
]

const defaultFlows = [
  { id: '1', nameAr: 'تذكير بالموعد', nameEn: 'Appointment Reminder', message: 'تذكير بموعدك مع د. {doctor} يوم {date} الساعة {time}', delay: 24, delayUnit: 'hours', enabled: true },
  { id: '2', nameAr: 'متابعة ما بعد الموعد', nameEn: 'Post-Appointment Follow-up', message: 'كيف كانت تجربتك مع د. {doctor}؟', delay: 2, delayUnit: 'days', enabled: true },
  { id: '3', nameAr: 'تأكيد الحضور', nameEn: 'Attendance Confirmation', message: 'يرجى تأكيد حضورك للموعد مع د. {doctor} يوم {date}', delay: 48, delayUnit: 'hours', enabled: false }
]

const defaultHistory = []

export default function WhatsAppManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language
  
  // ========== استخدام خدمات API ==========
  const { isOnline, executeWithOfflineSupport } = useServices()
  
  // جلب بيانات المستخدم من localStorage
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('')
  
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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ==================== بيانات من API ====================
  const [contactsList, setContactsList] = useState([])
  const [templates, setTemplates] = useState([])
  const [autoFlows, setAutoFlows] = useState([])

  // ==================== تحميل البيانات ====================
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setUserRole(parsed.role)
    }
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadContacts(),
        loadTemplates(),
        loadFlows(),
        loadHistory()
      ])
    } catch (error) {
      console.error('Error loading WhatsApp data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  // ==================== تحميل جهات الاتصال ====================
  const loadContacts = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => whatsappService.getContacts(),
            'whatsapp_contacts',
            getLocalData(STORAGE_KEYS.CONTACTS)
          )
          
          let data = []
          if (response && response.contacts) {
            data = response.contacts
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            setContactsList(data)
            localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(data))
            return
          }
        } catch (apiError) {
          console.warn('API contacts failed:', apiError)
        }
      }
      
      // استخدام localStorage كاحتياطي
      const saved = getLocalData(STORAGE_KEYS.CONTACTS)
      if (saved && saved.length > 0) {
        setContactsList(saved)
      } else {
        setContactsList(defaultContacts)
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(defaultContacts))
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
      const saved = getLocalData(STORAGE_KEYS.CONTACTS)
      setContactsList(saved && saved.length > 0 ? saved : defaultContacts)
    }
  }

  // ==================== تحميل القوالب ====================
  const loadTemplates = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => whatsappService.getTemplates(),
            'whatsapp_templates',
            getLocalData(STORAGE_KEYS.TEMPLATES)
          )
          
          let data = []
          if (response && response.templates) {
            data = response.templates
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            setTemplates(data)
            localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data))
            return
          }
        } catch (apiError) {
          console.warn('API templates failed:', apiError)
        }
      }
      
      const saved = getLocalData(STORAGE_KEYS.TEMPLATES)
      if (saved && saved.length > 0) {
        setTemplates(saved)
      } else {
        setTemplates(defaultTemplates)
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(defaultTemplates))
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      const saved = getLocalData(STORAGE_KEYS.TEMPLATES)
      setTemplates(saved && saved.length > 0 ? saved : defaultTemplates)
    }
  }

  // ==================== تحميل التدفقات الآلية ====================
  const loadFlows = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => whatsappService.getFlows(),
            'whatsapp_flows',
            getLocalData(STORAGE_KEYS.FLOWS)
          )
          
          let data = []
          if (response && response.flows) {
            data = response.flows
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            setAutoFlows(data)
            localStorage.setItem(STORAGE_KEYS.FLOWS, JSON.stringify(data))
            return
          }
        } catch (apiError) {
          console.warn('API flows failed:', apiError)
        }
      }
      
      const saved = getLocalData(STORAGE_KEYS.FLOWS)
      if (saved && saved.length > 0) {
        setAutoFlows(saved)
      } else {
        setAutoFlows(defaultFlows)
        localStorage.setItem(STORAGE_KEYS.FLOWS, JSON.stringify(defaultFlows))
      }
    } catch (error) {
      console.error('Error loading flows:', error)
      const saved = getLocalData(STORAGE_KEYS.FLOWS)
      setAutoFlows(saved && saved.length > 0 ? saved : defaultFlows)
    }
  }

  // ==================== تحميل سجل الرسائل ====================
  const loadHistory = async () => {
    try {
      if (isOnline) {
        try {
          const response = await executeWithOfflineSupport(
            () => whatsappService.getHistory(),
            'whatsapp_history',
            getLocalData(STORAGE_KEYS.HISTORY)
          )
          
          let data = []
          if (response && response.messages) {
            data = response.messages
          } else if (Array.isArray(response)) {
            data = response
          }
          
          if (data.length > 0) {
            setScheduledMessages(data)
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data))
            return
          }
        } catch (apiError) {
          console.warn('API history failed:', apiError)
        }
      }
      
      const saved = getLocalData(STORAGE_KEYS.HISTORY)
      if (saved && saved.length > 0) {
        setScheduledMessages(saved)
      } else {
        setScheduledMessages(defaultHistory)
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(defaultHistory))
      }
    } catch (error) {
      console.error('Error loading history:', error)
      const saved = getLocalData(STORAGE_KEYS.HISTORY)
      setScheduledMessages(saved && saved.length > 0 ? saved : defaultHistory)
    }
  }

  // ==================== دوال مساعدة ====================
  const getTemplateName = (template) => currentLang === 'ar' ? template.nameAr : template.nameEn
  const getTemplateMessage = (template) => currentLang === 'ar' ? template.messageAr : template.messageEn
  const getFlowName = (flow) => currentLang === 'ar' ? flow.nameAr : flow.nameEn

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

  // ==================== معالجة القوالب ====================
  const handleTemplateChange = (e) => {
    const templateId = e.target.value
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      let msg = getTemplateMessage(template)
      msg = msg.replace(/{doctor}/g, selectedContact?.name || 'الطبيب')
      msg = msg.replace(/{patient}/g, selectedContact?.name || 'المريض')
      msg = msg.replace(/{date}/g, new Date().toLocaleDateString('ar-EG'))
      msg = msg.replace(/{time}/g, new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
      msg = msg.replace(/{amount}/g, '500')
      msg = msg.replace(/{invoice}/g, 'INV-001')
      msg = msg.replace(/{announcement}/g, 'إعلان جديد')
      msg = msg.replace(/{topic}/g, 'خدمات المركز')
      setMessage(msg)
    }
  }

  // ==================== اختيار جهة اتصال ====================
  const handleSelectContact = (contact) => {
    setSelectedContact(contact)
    setPhoneNumber(contact.phone)
    setShowContactModal(false)
    toast.success(`تم تحديد ${contact.name}`)
  }

  // ==================== إرسال رسالة ====================
  const handleSendMessage = async () => {
    if (!phoneNumber) {
      toast.error('الرجاء إدخال رقم الجوال أو اختيار جهة اتصال')
      return
    }
    if (!message) {
      toast.error('الرجاء إدخال الرسالة')
      return
    }

    setSubmitting(true)
    try {
      // فتح واتساب
      const formattedPhone = phoneNumber.replace(/[^0-9]/g, '')
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')

      // حفظ في API
      if (isOnline) {
        try {
          await whatsappService.sendMessage({
            phone: phoneNumber,
            message: message,
            templateId: selectedTemplate || undefined
          })
        } catch (apiError) {
          console.warn('API send failed, saving locally:', apiError)
        }
      }

      const newMessage = {
        id: Date.now(),
        phone: phoneNumber,
        message: message,
        date: new Date().toLocaleString(),
        status: 'sent',
        type: 'instant',
        role: userRole,
        sender: user?.name,
        recipient: selectedContact?.name,
        _syncPending: !isOnline
      }
      
      const updated = [newMessage, ...scheduledMessages]
      setScheduledMessages(updated)
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
      
      toast.success('تم إرسال الرسالة')
      setPhoneNumber('')
      setMessage('')
      setSelectedTemplate('')
      setSelectedContact(null)
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إرسال الرسالة')
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== جدولة رسالة ====================
  const handleScheduleMessage = async () => {
    if (!phoneNumber || !message || !scheduleDateTime) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }

    setSubmitting(true)
    try {
      if (isOnline) {
        try {
          await whatsappService.scheduleMessage({
            phone: phoneNumber,
            message: message,
            scheduledTime: scheduleDateTime
          })
        } catch (apiError) {
          console.warn('API schedule failed, saving locally:', apiError)
        }
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
        createdAt: new Date().toISOString(),
        _syncPending: !isOnline
      }
      
      const updated = [newSchedule, ...scheduledMessages]
      setScheduledMessages(updated)
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
      
      toast.success('تم جدولة الرسالة')
      setShowScheduleModal(false)
      setPhoneNumber('')
      setMessage('')
      setScheduleDateTime('')
      setSelectedTemplate('')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في جدولة الرسالة')
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== حذف رسالة ====================
  const handleDeleteMessage = async (id) => {
    if ((await confirmAlert({ title: 'تأكيد', text: 'هل أنت متأكد من حذف هذه الرسالة؟' }))) {
      const updated = scheduledMessages.filter(m => m.id !== id)
      setScheduledMessages(updated)
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
      toast.success('تم حذف الرسالة')
    }
  }

  // ==================== إعادة إرسال رسالة ====================
  const handleResendMessage = (msg) => {
    const formattedPhone = msg.phone.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg.message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('جاري إعادة إرسال الرسالة')
  }

  // ==================== التدفقات الآلية ====================
  const toggleAutoFlow = async (id) => {
    try {
      const flow = autoFlows.find(f => f.id === id)
      if (!flow) return

      const newEnabled = !flow.enabled
      
      if (isOnline) {
        try {
          await whatsappService.updateFlow(id, { enabled: newEnabled })
        } catch (apiError) {
          console.warn('API update flow failed, updating locally:', apiError)
        }
      }

      const updated = autoFlows.map(f => 
        f.id === id ? { ...f, enabled: newEnabled, _syncPending: !isOnline } : f
      )
      setAutoFlows(updated)
      localStorage.setItem(STORAGE_KEYS.FLOWS, JSON.stringify(updated))
      toast.success('تم تحديث الإعدادات')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث التدفق')
    }
  }

  const handlePreviewFlow = (flow) => {
    let previewMsg = flow.message
    previewMsg = previewMsg.replace(/{doctor}/g, 'د. أحمد علي')
    previewMsg = previewMsg.replace(/{patient}/g, 'أحمد محمد')
    previewMsg = previewMsg.replace(/{date}/g, '2024-05-25')
    previewMsg = previewMsg.replace(/{time}/g, '10:00 صباحاً')
    previewMsg = previewMsg.replace(/{amount}/g, '500')
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

  const handleSaveFlowEdit = async () => {
    try {
      const updatedFlow = {
        ...editingFlow,
        nameAr: editFlowData.nameAr || editingFlow.nameAr,
        nameEn: editFlowData.nameEn || editingFlow.nameEn,
        message: editFlowData.message,
        delay: editFlowData.delay,
        delayUnit: editFlowData.delayUnit
      }

      if (isOnline) {
        try {
          await whatsappService.updateFlow(editingFlow.id, updatedFlow)
        } catch (apiError) {
          console.warn('API update flow failed, saving locally:', apiError)
        }
      }

      const updated = autoFlows.map(flow => 
        flow.id === editingFlow.id ? { ...updatedFlow, _syncPending: !isOnline } : flow
      )
      setAutoFlows(updated)
      localStorage.setItem(STORAGE_KEYS.FLOWS, JSON.stringify(updated))
      
      setShowEditFlowModal(false)
      setEditingFlow(null)
      toast.success('تم تحديث التدفق بنجاح')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في تحديث التدفق')
    }
  }

  // ==================== حالة الرسالة ====================
  const getStatusBadge = (status) => {
    if (status === 'sent') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle size={12} className="inline ml-1" /> مرسلة</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"><Clock size={12} className="inline ml-1" /> مجدولة</span>
  }

  // ==================== إحصائيات ====================
  const stats = {
    messagesSent: scheduledMessages.filter(m => m.status === 'sent').length,
    scheduledCount: scheduledMessages.filter(m => m.status === 'scheduled').length,
    activeChats: contactsList.length,
    automatedCount: autoFlows.filter(f => f.enabled).length
  }

  const getDelayText = (delay, unit) => {
    if (delay === 0) return 'فوري'
    const unitText = unit === 'hours' ? 'ساعة' : 'يوم'
    return `${delay} ${unitText} قبل الموعد`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-green-500 animate-spin mb-4" />
          <div className="text-white">جاري التحميل...</div>
        </div>
      </div>
    )
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
            <p className="text-gray-400 mt-1">
              {getRoleSubtitle()}
              {!isOnline && (
                <span className="inline-block mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                  ⚡ غير متصل
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadAllData}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30 transition"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30 transition"
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
                    placeholder="أدخل رقم الجوال..." 
                    className="flex-1 p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    disabled={submitting}
                  />
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="px-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition"
                    disabled={submitting}
                  >
                    <Users size={18} />
                  </button>
                </div>
                {selectedContact && (
                  <p className="text-xs text-green-400 mt-1">✓ تم اختيار: {selectedContact.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  القالب
                </label>
                <select 
                  className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition" 
                  value={selectedTemplate} 
                  onChange={handleTemplateChange} 
                  disabled={submitting}
                >
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
                  disabled={submitting}
                />
                <div className="text-right text-xs text-gray-500 mt-1">{message.length} / 1000</div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSendMessage} 
                  disabled={submitting} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {submitting ? 'جاري الإرسال...' : 'إرسال الآن'}
                </button>
                <button 
                  onClick={() => setShowScheduleModal(true)} 
                  disabled={submitting} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl p-6 border border-green-500/30">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Award size={18} className="text-green-400" /> 
                نصائح سريعة
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> استخدم القوالب الجاهزة لتوفير الوقت</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> يمكنك جدولة الرسائل لوقت لاحق</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> استخدم جهات الاتصال للوصول السريع</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* تبويب جهات الاتصال */}
      {activeTab === 'contacts' && (
        <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Users className="text-blue-500" size={22} /> 
            جهات الاتصال
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contactsList.map(contact => (
              <div key={contact.id} className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition cursor-pointer" onClick={() => handleSelectContact(contact)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-xl">{contact.icon || '👤'}</div>
                  <div>
                    <p className="font-semibold text-white">{contact.name}</p>
                    <p className="text-xs text-gray-400">{contact.department || 'مستخدم'}</p>
                    <p className="text-xs text-gray-500 dir-ltr">{contact.phone}</p>
                    {contact.nextAppointment && <p className="text-xs text-green-400">الموعد القادم: {contact.nextAppointment}</p>}
                    {contact._syncPending && (
                      <span className="text-xs text-yellow-400">⏳ في انتظار المزامنة</span>
                    )}
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
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {getFlowName(flow)}
                      {flow._syncPending && (
                        <span className="text-xs text-yellow-400">⏳ مزامنة</span>
                      )}
                    </h3>
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
                      {msg._syncPending && (
                        <span className="text-xs text-yellow-400">⏳ مزامنة</span>
                      )}
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
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-xl">{contact.icon || '👤'}</div>
                    <div>
                      <p className="font-semibold text-white">{contact.name}</p>
                      <p className="text-xs text-gray-400">{contact.department || 'مستخدم'}</p>
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
                <button onClick={handleScheduleMessage} disabled={submitting} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 size={16} className="animate-spin inline mr-1" /> : null}
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
                    <p className="text-sm text-gray-400">{getRoleTitle()}</p>
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