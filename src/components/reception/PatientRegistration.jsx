import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Mail, Phone, User, IdCard, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { patientsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function PatientRegistration({ onRegistrationSuccess }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline } = useServices()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    idNumber: ''
  })
  const [loading, setLoading] = useState(false)

  // ========== معالجة تسجيل المريض ==========
  const handleSubmit = async (e) => {
    e.preventDefault()

    // التحقق من الحقول المطلوبة
    if (!form.name || !form.phone) {
      toast.error('الرجاء ملء الحقول المطلوبة')
      return
    }

    setLoading(true)
    try {
      const patientData = {
        nameAr: form.name,
        nameEn: form.name,
        phone: form.phone,
        email: form.email || '',
        nationalId: form.idNumber || '',
        // حقول إضافية يمكن إضافتها
        age: 0,
        address: '',
        bloodType: '',
        diagnosis: 'قيد التشخيص',
        status: 'active'
      }

      let response

      if (isOnline) {
        // محاولة التسجيل عبر API
        response = await patientsService.createPatient(patientData)
        const newPatient = response?.patient || response

        toast.success(`${form.name} تم التسجيل بنجاح - ID: ${newPatient.id || 'تم التسجيل'}`)

        // استدعاء دالة النجاح إذا وجدت
        if (onRegistrationSuccess) {
          onRegistrationSuccess(newPatient)
        }
      } else {
        // وضع غير متصل - حفظ محلياً
        const newPatient = {
          ...patientData,
          id: 'P' + Math.floor(Math.random() * 10000),
          _syncPending: true,
          registerDate: new Date().toISOString()
        }

        // حفظ في localStorage
        const existingPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
        existingPatients.push(newPatient)
        localStorage.setItem('mcsos_patients_v2', JSON.stringify(existingPatients))

        toast.success(`${form.name} تم التسجيل بنجاح - ID: ${newPatient.id} (تم الحفظ محلياً)`)

        if (onRegistrationSuccess) {
          onRegistrationSuccess(newPatient)
        }
      }

      // إعادة تعيين النموذج
      setForm({
        name: '',
        phone: '',
        email: '',
        idNumber: ''
      })

    } catch (error) {
      console.error('Registration error:', error)

      // عرض رسالة خطأ مناسبة
      if (error.message?.includes('duplicate') || error.message?.includes('exists')) {
        toast.error('هذا المريض مسجل مسبقاً')
      } else {
        toast.error(error.message || 'حدث خطأ في تسجيل المريض')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
      <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <UserPlus className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            تسجيل مريض جديد
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            معلومات التواصل
            {!isOnline && (
              <span className="block text-xs text-yellow-400">⚡ غير متصل - سيتم الحفظ محلياً</span>
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* الاسم الكامل */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              required
              placeholder="أدخل الاسم الكامل"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* رقم الجوال */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            رقم الجوال <span className="text-red-500">*</span>
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="tel"
              required
              placeholder="أدخل رقم الجوال"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* البريد الإلكتروني */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            البريد الإلكتروني
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="email"
              placeholder="أدخل البريد الإلكتروني"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* رقم الهوية */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            رقم الهوية
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <IdCard className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              placeholder="أدخل رقم الهوية"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* زر التسجيل */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'جاري التسجيل...' : 'تسجيل مريض'}
        </button>
      </form>
    </div>
  )
}