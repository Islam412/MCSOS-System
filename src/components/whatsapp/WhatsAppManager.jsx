import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  MessageCircle, Send, Clock, Users, Bell, Settings, 
  Phone, CheckCircle, XCircle, Calendar, FileText, 
  Star, TrendingUp, AlertCircle, Edit, Trash2, Plus,
  RefreshCw, Download, Filter, Search, Eye, EyeOff,
  Zap, Target, Award, Shield, Mail, UserCheck, 
  Moon, Sun, Monitor, Globe, Key, Lock, Save, X, Copy
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function WhatsAppManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

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

  // إعدادات الواتساب
  const [whatsappSettings, setWhatsappSettings] = useState({
    apiKey: '',
    businessPhone: '',
    webhookUrl: '',
    autoReplyEnabled: true,
    sendReadReceipts: true,
    notificationsEnabled: true,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    workingDays: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    autoReplyMessage: 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.',
    defaultTemplate: 'welcome',
    maxMessagesPerDay: 100,
    messageRateLimit: 10
  })

  const [autoFlows, setAutoFlows] = useState([
    { id: 1, name: 'booking_confirmation', nameAr: 'تأكيد الحجز', nameEn: 'Booking Confirmation', enabled: true, delay: 0, delayUnit: 'hours', message: 'تم تأكيد حجز موعدك مع الدكتور {doctor} بتاريخ {date} الساعة {time}' },
    { id: 2, name: 'reminder_before', nameAr: 'تذكير قبل الموعد', nameEn: 'Appointment Reminder', enabled: true, delay: 24, delayUnit: 'hours', message: 'تذكير: لديك موعد غداً الساعة {time} مع الدكتور {doctor}' },
    { id: 3, name: 'missed_followup', nameAr: 'متابعة الغياب', nameEn: 'Missed Follow-up', enabled: true, delay: 1, delayUnit: 'days', message: 'لقد تغيبت عن موعدك مع الدكتور {doctor}. يرجى التواصل معنا لإعادة الحجز' }
  ])

  const templates = [
    { 
      id: 'welcome', 
      nameAr: 'رسالة ترحيب', 
      nameEn: 'Welcome Message',
      nameFr: 'Message de bienvenue',
      messageAr: 'مرحباً بك في مركزنا الطبي. نتمنى لك دوام الصحة والعافية',
      messageEn: 'Welcome to our medical center. We wish you health and wellness',
      messageFr: 'Bienvenue dans notre centre médical. Nous vous souhaitons santé et bien-être',
      icon: '👋'
    },
    { 
      id: 'reminder', 
      nameAr: 'تذكير موعد', 
      nameEn: 'Appointment Reminder',
      nameFr: 'Rappel de rendez-vous',
      messageAr: 'تذكير: لديك موعد غداً الساعة {time} مع الدكتور {doctor}',
      messageEn: 'Reminder: You have an appointment tomorrow at {time} with Dr. {doctor}',
      messageFr: 'Rappel: Vous avez un rendez-vous demain à {time} avec Dr. {doctor}',
      icon: '⏰'
    },
    { 
      id: 'followup', 
      nameAr: 'متابعة بعد الموعد', 
      nameEn: 'Post-appointment Follow-up',
      nameFr: 'Suivi post-rendez-vous',
      messageAr: 'كيف كانت تجربتك معنا؟ نتمنى لك الشفاء العاجل',
      messageEn: 'How was your experience with us? Wishing you a speedy recovery',
      messageFr: 'Comment s\'est passée votre expérience avec nous? Prompt rétablissement',
      icon: '📋'
    },
    { 
      id: 'missed', 
      nameAr: 'تأكيد غياب', 
      nameEn: 'Missed Appointment',
      nameFr: 'Rendez-vous manqué',
      messageAr: 'لقد تغيبت عن موعدك مع الدكتور {doctor}. يرجى التواصل معنا لإعادة الحجز',
      messageEn: 'You missed your appointment with Dr. {doctor}. Please contact us to reschedule',
      messageFr: 'Vous avez manqué votre rendez-vous avec Dr. {doctor}. Veuillez nous contacter pour reprogrammer',
      icon: '❌'
    },
    { 
      id: 'payment', 
      nameAr: 'تذكير دفع', 
      nameEn: 'Payment Reminder',
      nameFr: 'Rappel de paiement',
      messageAr: 'تذكير: لديك مبلغ مستحق للدفع قيمته {amount} ريال',
      messageEn: 'Reminder: You have an outstanding payment of {amount} SAR',
      messageFr: 'Rappel: Vous avez un paiement impayé de {amount} SAR',
      icon: '💰'
    },
    { 
      id: 'satisfaction', 
      nameAr: 'تقييم الخدمة', 
      nameEn: 'Service Satisfaction',
      nameFr: 'Satisfaction du service',
      messageAr: 'نرجو تقييم تجربتك مع مركزنا الطبي من 1 إلى 5',
      messageEn: 'Please rate your experience with our medical center from 1 to 5',
      messageFr: 'Veuillez évaluer votre expérience avec notre centre médical de 1 à 5',
      icon: '⭐'
    },
    { 
      id: 'congrats', 
      nameAr: 'تهنئة بالشفاء', 
      nameEn: 'Get Well Soon',
      nameFr: 'Bon rétablissement',
      messageAr: 'نهنئك بمناسبة إتمام علاجك بنجاح. نتمنى لك دوام الصحة',
      messageEn: 'Congratulations on completing your treatment successfully. Wishing you continued health',
      messageFr: 'Félicitations pour avoir terminé votre traitement avec succès. Bonne santé',
      icon: '🎉'
    }
  ]

  const getTemplateName = (template) => {
    if (currentLang === 'ar') return template.nameAr
    if (currentLang === 'fr') return template.nameFr
    return template.nameEn
  }

  const getTemplateMessage = (template) => {
    if (currentLang === 'ar') return template.messageAr
    if (currentLang === 'fr') return template.messageFr
    return template.messageEn
  }

  const getFlowName = (flow) => {
    if (currentLang === 'ar') return flow.nameAr
    return flow.nameEn
  }

  // دالة عرض معاينة الرسالة
  const handlePreviewFlow = (flow) => {
    // بيانات تجريبية للمعاينة
    const previewData = {
      doctor: 'د. أحمد علي',
      date: '2024-05-25',
      time: '10:00 صباحاً',
      amount: '500'
    }
    
    let previewMsg = flow.message
    previewMsg = previewMsg.replace('{doctor}', previewData.doctor)
    previewMsg = previewMsg.replace('{date}', previewData.date)
    previewMsg = previewMsg.replace('{time}', previewData.time)
    previewMsg = previewMsg.replace('{amount}', previewData.amount)
    
    setPreviewMessage(previewMsg)
    setShowPreviewModal(true)
  }

  // دالة فتح نافذة تعديل التدفق
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

  // دالة حفظ تعديل التدفق
  const handleSaveFlowEdit = () => {
    if (!editFlowData.message) {
      toast.error(isRTL ? 'الرجاء إدخال نص الرسالة' : 'Please enter message content')
      return
    }
    
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
    toast.success(isRTL ? 'تم تحديث التدفق بنجاح' : 'Flow updated successfully')
  }

  // دالة معاينة القالب
  const handlePreviewTemplate = (template) => {
    const previewMsg = getTemplateMessage(template)
    setPreviewMessage(previewMsg)
    setShowPreviewModal(true)
  }

  useEffect(() => {
    const saved = localStorage.getItem('mcsos_whatsapp_messages')
    if (saved) {
      setScheduledMessages(JSON.parse(saved))
    }
    const savedSettings = localStorage.getItem('mcsos_whatsapp_settings')
    if (savedSettings) {
      setWhatsappSettings(JSON.parse(savedSettings))
    }
    const savedFlows = localStorage.getItem('mcsos_whatsapp_flows')
    if (savedFlows) {
      setAutoFlows(JSON.parse(savedFlows))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('mcsos_whatsapp_messages', JSON.stringify(scheduledMessages))
  }, [scheduledMessages])

  useEffect(() => {
    localStorage.setItem('mcsos_whatsapp_settings', JSON.stringify(whatsappSettings))
  }, [whatsappSettings])

  useEffect(() => {
    localStorage.setItem('mcsos_whatsapp_flows', JSON.stringify(autoFlows))
  }, [autoFlows])

  const handleTemplateChange = (e) => {
    const templateId = e.target.value
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setMessage(getTemplateMessage(template))
    }
  }

  const handleSendMessage = () => {
    if (!phoneNumber) {
      toast.error(isRTL ? 'الرجاء إدخال رقم الجوال' : 'Please enter phone number')
      return
    }
    if (!message) {
      toast.error(isRTL ? 'الرجاء إدخال الرسالة' : 'Please enter message')
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
      type: 'instant'
    }
    setScheduledMessages([newMessage, ...scheduledMessages])
    
    toast.success(isRTL ? 'تم إرسال الرسالة' : 'Message sent')
    setPhoneNumber('')
    setMessage('')
    setSelectedTemplate('')
  }

  const handleScheduleMessage = () => {
    if (!phoneNumber || !message || !scheduleDateTime) {
      toast.error(isRTL ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields')
      return
    }

    const newSchedule = {
      id: Date.now(),
      phone: phoneNumber,
      message: message,
      scheduledTime: scheduleDateTime,
      status: 'scheduled',
      type: 'scheduled',
      createdAt: new Date().toISOString()
    }
    setScheduledMessages([newSchedule, ...scheduledMessages])
    toast.success(isRTL ? 'تم جدولة الرسالة' : 'Message scheduled')
    
    setShowScheduleModal(false)
    setPhoneNumber('')
    setMessage('')
    setScheduleDateTime('')
    setSelectedTemplate('')
  }

  const handleDeleteMessage = (id) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) {
      setScheduledMessages(scheduledMessages.filter(m => m.id !== id))
      toast.success(isRTL ? 'تم حذف الرسالة' : 'Message deleted')
    }
  }

  const handleResendMessage = (msg) => {
    const formattedPhone = msg.phone.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg.message)}`
    window.open(whatsappUrl, '_blank')
    toast.success(isRTL ? 'جاري إعادة إرسال الرسالة' : 'Resending message')
  }

  const toggleAutoFlow = (id) => {
    setAutoFlows(autoFlows.map(flow => 
      flow.id === id ? { ...flow, enabled: !flow.enabled } : flow
    ))
    toast.success(isRTL ? 'تم تحديث الإعدادات' : 'Settings updated')
  }

  const handleSaveSettings = () => {
    toast.success(isRTL ? 'تم حفظ إعدادات واتساب بنجاح' : 'WhatsApp settings saved successfully')
    setShowSettingsModal(false)
  }

  const getStatusBadge = (status) => {
    if (status === 'sent') {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"><CheckCircle size={12} className="inline ml-1" /> مرسلة</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"><Clock size={12} className="inline ml-1" /> مجدولة</span>
  }

  const stats = {
    messagesSent: scheduledMessages.filter(m => m.status === 'sent').length,
    scheduledCount: scheduledMessages.filter(m => m.status === 'scheduled').length,
    activeChats: 89,
    automatedCount: autoFlows.filter(f => f.enabled).length
  }

  // دالة الحصول على نص المدة
  const getDelayText = (delay, unit) => {
    if (delay === 0) return isRTL ? 'فوري' : 'Instant'
    const unitText = unit === 'hours' ? (isRTL ? 'ساعة' : 'hours') : (isRTL ? 'يوم' : 'days')
    return `${delay} ${unitText} ${delay === 0 ? '' : (isRTL ? 'قبل الموعد' : 'before')}`
  }

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            {isRTL ? 'نظام واتساب' : 'WhatsApp System'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isRTL ? 'إرسال رسائل وتذكيرات أوتوماتيكية' : 'Send automatic messages and reminders'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30 transition"
          >
            <Settings size={18} /> {isRTL ? 'إعدادات' : 'Settings'}
          </button>
        </div>
      </div>

      {/* أزرار التبويب */}
      <div className="flex gap-2 border-b border-gray-700 pb-2 flex-wrap">
        <button onClick={() => setActiveTab('compose')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'compose' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
          <MessageCircle size={18} className="inline ml-2" /> {isRTL ? 'كتابة رسالة' : 'Compose Message'}
        </button>
        <button onClick={() => setActiveTab('flows')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'flows' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
          <Zap size={18} className="inline ml-2" /> {isRTL ? 'التدفقات الآلية' : 'Automated Flows'}
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'history' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
          <Clock size={18} className="inline ml-2" /> {isRTL ? 'سجل الرسائل' : 'Message History'}
        </button>
      </div>

      {/* تبويب كتابة الرسالة */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* قسم كتابة الرسالة */}
          <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <MessageCircle className="text-green-500" size={22} />
              {isRTL ? 'كتابة رسالة جديدة' : 'New Message'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  {isRTL ? 'القالب' : 'Template'}
                </label>
                <select
                  className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition"
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                >
                  <option value="">{isRTL ? 'اختر قالباً' : 'Select Template'}</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.icon} {getTemplateName(template)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  {isRTL ? 'رقم الجوال' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    placeholder={isRTL ? 'مثال: 9665XXXXXXXX' : 'Example: 9665XXXXXXXX'}
                    className="w-full pl-10 pr-4 p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  {isRTL ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  rows="6"
                  className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-green-500 transition"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {message.length} / 1000
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Send size={18} /> {isRTL ? 'إرسال الآن' : 'Send Now'}
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Clock size={18} /> {isRTL ? 'جدولة' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>

          {/* قسم الإحصائيات */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <TrendingUp className="text-blue-500" size={22} />
                {isRTL ? 'إحصائيات' : 'Statistics'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                  <Send size={24} className="mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-green-400">{stats.messagesSent}</div>
                  <div className="text-sm text-gray-400">{isRTL ? 'رسائل مرسلة' : 'Messages Sent'}</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <Clock size={24} className="mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{stats.scheduledCount}</div>
                  <div className="text-sm text-gray-400">{isRTL ? 'رسائل مجدولة' : 'Scheduled'}</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <Users size={24} className="mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold text-purple-400">{stats.activeChats}</div>
                  <div className="text-sm text-gray-400">{isRTL ? 'محادثات نشطة' : 'Active Chats'}</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <Zap size={24} className="mx-auto text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">{stats.automatedCount}</div>
                  <div className="text-sm text-gray-400">{isRTL ? 'تدفقات آلية' : 'Automated Flows'}</div>
                </div>
              </div>
            </div>

            {/* نصائح سريعة */}
            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl p-6 border border-green-500/30">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Award size={18} className="text-green-400" />
                {isRTL ? 'نصائح سريعة' : 'Quick Tips'}
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> {isRTL ? 'استخدم القوالب الجاهزة لتوفير الوقت' : 'Use templates to save time'}</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> {isRTL ? 'يمكنك جدولة الرسائل لوقت لاحق' : 'You can schedule messages for later'}</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> {isRTL ? 'تفعيل التدفقات الآلية للإشعارات التلقائية' : 'Enable automatic flows for notifications'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* تبويب التدفقات الآلية - مع أزرار تعديل ومعاينة تعمل */}
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
                    <p className="text-xs text-gray-400">
                      {getDelayText(flow.delay, flow.delayUnit)}
                    </p>
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
                <button 
                  onClick={() => handleEditFlow(flow)}
                  className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <Edit size={14} /> {isRTL ? 'تعديل' : 'Edit'}
                </button>
                <button 
                  onClick={() => handlePreviewFlow(flow)}
                  className="flex-1 bg-purple-500/20 text-purple-400 py-2 rounded-lg text-sm hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> {isRTL ? 'معاينة' : 'Preview'}
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
            {isRTL ? 'سجل الرسائل' : 'Message History'}
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scheduledMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                {isRTL ? 'لا توجد رسائل' : 'No messages'}
              </div>
            ) : (
              scheduledMessages.map(msg => (
                <div key={msg.id} className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="font-mono text-sm text-white">{msg.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(msg.status)}
                      <span className="text-xs text-gray-500">{msg.date || msg.scheduledTime}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{msg.message}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleResendMessage(msg)} className="text-green-400 hover:bg-green-500/20 p-1 rounded text-xs flex items-center gap-1">
                      <Send size={12} /> {isRTL ? 'إعادة إرسال' : 'Resend'}
                    </button>
                    <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 hover:bg-red-500/20 p-1 rounded text-xs flex items-center gap-1">
                      <Trash2 size={12} /> {isRTL ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal تعديل التدفق */}
      {showEditFlowModal && editingFlow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit size={20} className="text-yellow-400" />
                {isRTL ? 'تعديل التدفق' : 'Edit Flow'} - {getFlowName(editingFlow)}
              </h2>
              <button onClick={() => setShowEditFlowModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'نص الرسالة' : 'Message Content'}</label>
                <textarea 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white" 
                  rows="5"
                  value={editFlowData.message}
                  onChange={(e) => setEditFlowData({...editFlowData, message: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isRTL ? 'يمكنك استخدام المتغيرات: {doctor}, {date}, {time}, {amount}' : 'You can use variables: {doctor}, {date}, {time}, {amount}'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'المدة' : 'Delay'}</label>
                  <input 
                    type="number" 
                    className="w-full p-2 bg-gray-700 rounded-lg text-white"
                    value={editFlowData.delay}
                    onChange={(e) => setEditFlowData({...editFlowData, delay: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'الوحدة' : 'Unit'}</label>
                  <select 
                    className="w-full p-2 bg-gray-700 rounded-lg text-white"
                    value={editFlowData.delayUnit}
                    onChange={(e) => setEditFlowData({...editFlowData, delayUnit: e.target.value})}
                  >
                    <option value="hours">{isRTL ? 'ساعات' : 'Hours'}</option>
                    <option value="days">{isRTL ? 'أيام' : 'Days'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveFlowEdit} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2">
                  <Save size={16} /> {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
                <button onClick={() => setShowEditFlowModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal معاينة الرسالة */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye size={20} className="text-purple-400" />
                {isRTL ? 'معاينة الرسالة' : 'Message Preview'}
              </h2>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
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
              <button 
                onClick={() => {
                  setMessage(previewMessage)
                  setShowPreviewModal(false)
                  setActiveTab('compose')
                  toast.success(isRTL ? 'تم نسخ الرسالة إلى محرر الكتابة' : 'Message copied to composer')
                }}
                className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
              >
                <Copy size={16} /> {isRTL ? 'استخدام هذه الرسالة' : 'Use This Message'}
              </button>
              <button onClick={() => setShowPreviewModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal إعدادات واتساب */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={22} className="text-purple-400" />
                {isRTL ? 'إعدادات واتساب' : 'WhatsApp Settings'}
              </h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* قسم إعدادات الحساب */}
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Phone size={18} className="text-green-400" />
                  {isRTL ? 'إعدادات الحساب' : 'Account Settings'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'رقم الهاتف التجاري' : 'Business Phone Number'}</label>
                    <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={whatsappSettings.businessPhone} onChange={(e) => setWhatsappSettings({...whatsappSettings, businessPhone: e.target.value})} placeholder="9665XXXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'مفتاح API' : 'API Key'}</label>
                    <input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={whatsappSettings.apiKey} onChange={(e) => setWhatsappSettings({...whatsappSettings, apiKey: e.target.value})} placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>

              {/* قسم إعدادات الإشعارات */}
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Bell size={18} className="text-yellow-400" />
                  {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{isRTL ? 'تفعيل الإشعارات' : 'Enable Notifications'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={whatsappSettings.notificationsEnabled} onChange={(e) => setWhatsappSettings({...whatsappSettings, notificationsEnabled: e.target.checked})} />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{isRTL ? 'تفعيل الرد التلقائي' : 'Enable Auto Reply'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={whatsappSettings.autoReplyEnabled} onChange={(e) => setWhatsappSettings({...whatsappSettings, autoReplyEnabled: e.target.checked})} />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button onClick={handleSaveSettings} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2">
                  <Save size={18} /> {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                </button>
                <button onClick={() => setShowSettingsModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition flex items-center justify-center gap-2">
                  <X size={18} /> {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal جدولة الرسالة */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{isRTL ? 'جدولة رسالة' : 'Schedule Message'}</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'رقم الجوال' : 'Phone Number'}</label>
                <input type="tel" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'الرسالة' : 'Message'}</label>
                <textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{isRTL ? 'تاريخ ووقت الإرسال' : 'Send Date & Time'}</label>
                <input type="datetime-local" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={scheduleDateTime} onChange={(e) => setScheduleDateTime(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleScheduleMessage} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30 transition">
                  {isRTL ? 'جدولة' : 'Schedule'}
                </button>
                <button onClick={() => setShowScheduleModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500 transition">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}