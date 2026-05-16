import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Send, Clock, Users, Bell, Settings, Mail, Phone, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WhatsAppManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [scheduledMessages, setScheduledMessages] = useState([])
  
  const templates = [
    { 
      id: 'welcome', 
      nameAr: 'رسالة ترحيب', 
      nameEn: 'Welcome Message',
      messageAr: 'مرحباً بك في مركزنا الطبي. نتمنى لك دوام الصحة والعافية',
      messageEn: 'Welcome to our medical center. We wish you health and wellness'
    },
    { 
      id: 'reminder', 
      nameAr: 'تذكير موعد', 
      nameEn: 'Appointment Reminder',
      messageAr: 'تذكير: لديك موعد غداً الساعة',
      messageEn: 'Reminder: You have an appointment tomorrow at'
    },
    { 
      id: 'followup', 
      nameAr: 'متابعة بعد الموعد', 
      nameEn: 'Post-appointment Follow-up',
      messageAr: 'كيف كانت تجربتك معنا؟ نتمنى لك الشفاء العاجل',
      messageEn: 'How was your experience with us? Wishing you a speedy recovery'
    },
    { 
      id: 'missed', 
      nameAr: 'تأكيد غياب', 
      nameEn: 'Missed Appointment',
      messageAr: 'لقد تغيبت عن موعدك. يرجى التواصل معنا لإعادة الحجز',
      messageEn: 'You missed your appointment. Please contact us to reschedule'
    },
    { 
      id: 'payment', 
      nameAr: 'تذكير دفع', 
      nameEn: 'Payment Reminder',
      messageAr: 'تذكير: لديك مبلغ مستحق للدفع قيمته',
      messageEn: 'Reminder: You have an outstanding payment of'
    }
  ]
  
  const getTemplateName = (template) => {
    return isRTL ? template.nameAr : template.nameEn
  }
  
  const getTemplateMessage = (template) => {
    return isRTL ? template.messageAr : template.messageEn
  }
  
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
      toast.error(t('whatsapp.enter_phone'))
      return
    }
    if (!message) {
      toast.error(t('whatsapp.enter_message'))
      return
    }
    
    // محاكاة إرسال رسالة واتساب
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    toast.success(t('whatsapp.message_sent'))
    
    // تسجيل الرسالة
    const newMessage = {
      id: Date.now(),
      phone: phoneNumber,
      message: message,
      date: new Date().toLocaleString(),
      status: 'sent'
    }
    setScheduledMessages([newMessage, ...scheduledMessages])
    
    setPhoneNumber('')
    setMessage('')
    setSelectedTemplate('')
  }
  
  const handleScheduleMessage = () => {
    if (!phoneNumber || !message) {
      toast.error(t('whatsapp.fill_fields'))
      return
    }
    
    const scheduledTime = prompt(t('whatsapp.schedule_time'))
    if (scheduledTime) {
      const newSchedule = {
        id: Date.now(),
        phone: phoneNumber,
        message: message,
        scheduledTime: scheduledTime,
        status: 'scheduled'
      }
      setScheduledMessages([newSchedule, ...scheduledMessages])
      toast.success(t('whatsapp.message_scheduled'))
    }
  }
  
  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            {t('whatsapp.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('whatsapp.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-2">
            <Settings size={18} />
            {t('whatsapp.settings')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Message Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="text-green-500" />
            {t('whatsapp.compose_message')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('whatsapp.template')}</label>
              <select
                className="w-full p-3 border rounded-xl dark:bg-gray-900"
                value={selectedTemplate}
                onChange={handleTemplateChange}
              >
                <option value="">{t('whatsapp.select_template')}</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{getTemplateName(template)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">{t('reception.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="9665XXXXXXXX"
                  className="w-full pl-10 p-3 border rounded-xl dark:bg-gray-900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">{t('whatsapp.message')}</label>
              <textarea
                rows="4"
                className="w-full p-3 border rounded-xl dark:bg-gray-900"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('whatsapp.type_message')}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {t('whatsapp.send_now')}
              </button>
              <button
                onClick={handleScheduleMessage}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Clock size={18} />
                {t('whatsapp.schedule')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-blue-500" />
              {t('whatsapp.statistics')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <MessageCircle size={24} className="mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-600">{t('whatsapp.messages_sent')}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Clock size={24} className="mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-blue-600">23</div>
                <div className="text-sm text-gray-600">{t('whatsapp.scheduled')}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Users size={24} className="mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold text-purple-600">89</div>
                <div className="text-sm text-gray-600">{t('whatsapp.active_chats')}</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <Bell size={24} className="mx-auto text-yellow-500 mb-2" />
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-gray-600">{t('whatsapp.automated')}</div>
              </div>
            </div>
          </div>
          
          {/* Automated Flows */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="text-purple-500" />
              {t('whatsapp.automated_flows')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('whatsapp.booking_confirmation')}</div>
                    <div className="text-sm text-gray-500">{t('whatsapp.auto_after_booking')}</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <Bell size={18} className="text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('whatsapp.reminder_before')}</div>
                    <div className="text-sm text-gray-500">{t('whatsapp.auto_24h_before')}</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <XCircle size={18} className="text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('whatsapp.missed_followup')}</div>
                    <div className="text-sm text-gray-500">{t('whatsapp.auto_after_missed')}</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Message History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="text-blue-500" />
          {t('whatsapp.message_history')}
        </h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {scheduledMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              {t('whatsapp.no_messages')}
            </div>
          ) : (
            scheduledMessages.map(msg => (
              <div key={msg.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span className="font-mono text-sm">{msg.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.status === 'sent' ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <Clock size={14} className="text-yellow-500" />
                    )}
                    <span className="text-xs text-gray-500">{msg.date || msg.scheduledTime}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{msg.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
