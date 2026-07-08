// src/components/reception/PatientRegistration.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Mail, Phone, User, IdCard, Sparkles, Loader2, X } from 'lucide-react'

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
    first_name: '',
    last_name: '',
    phone: '',
    whatsapp_number: '',
    sameAsPhone: true,
    referral_source: '',
    national_id_photo: '',
    email: '',
    address: '',
    gender: 'male',
    date_of_birth: ''
  })
  const [loading, setLoading] = useState(false)

  // ========== معالجة تسجيل المريض ==========
  const handleSubmit = async (e) => {
    e.preventDefault()

    // التحقق من الحقول المطلوبة
    if (!form.first_name || !form.phone) {
      toast.error('الرجاء ملء الحقول المطلوبة')
      return
    }

    setLoading(true)
    try {
      // ✅ البيانات بالشكل المطلوب من الـ API
      const patientData = {
        first_name: form.first_name,
        last_name: form.last_name || form.first_name,
        gender: form.gender || 'male',
        date_of_birth: form.date_of_birth || new Date(Date.now() - 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        address: form.address || '',
        phone: form.phone,
        whatsapp_number: form.sameAsPhone ? form.phone : form.whatsapp_number || form.phone,
        referral_source: form.referral_source || '',
        national_id_photo: form.national_id_photo || '',
        emergency_contact: form.phone,
        email: form.email || '',
        notes: 'تم التسجيل عبر الاستقبال'
      }

      let response

      if (isOnline) {
        // محاولة التسجيل عبر API
        response = await patientsService.createPatient(patientData)
        const newPatient = response?.patient || response

        toast.success(`${form.first_name} ${form.last_name || ''} تم التسجيل بنجاح`)

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

        toast.success(`${form.first_name} تم التسجيل بنجاح (تم الحفظ محلياً)`)

        if (onRegistrationSuccess) {
          onRegistrationSuccess(newPatient)
        }
      }

      // إعادة تعيين النموذج
      setForm({
        first_name: '',
        last_name: '',
        phone: '',
        whatsapp_number: '',
        sameAsPhone: true,
        referral_source: '',
        national_id_photo: '',
        email: '',
        address: '',
        gender: 'male',
        date_of_birth: ''
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
        {/* الاسم الأول */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            الاسم الأول <span className="text-red-500">*</span>
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              required
              placeholder="أدخل الاسم الأول"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* اسم العائلة */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            اسم العائلة
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              placeholder="أدخل اسم العائلة"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
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

        {/* خيار رقم الواتساب هو نفسه رقم الجوال */}
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            id="sameAsPhone"
            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
            checked={form.sameAsPhone}
            onChange={(e) => setForm({ ...form, sameAsPhone: e.target.checked })}
            disabled={loading}
          />
          <label htmlFor="sameAsPhone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            رقم الواتساب هو نفسه رقم الجوال
          </label>
        </div>

        {!form.sameAsPhone && (
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              رقم الواتساب
            </label>
            <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
              <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input
                type="tel"
                placeholder="أدخل رقم الواتساب"
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* جهة التحويل */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            جهة التحويل
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <Sparkles className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              placeholder="جهة التحويل (مثال: دكتور محول، فيسبوك...)"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.referral_source}
              onChange={(e) => setForm({ ...form, referral_source: e.target.value })}
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

        {/* العنوان */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            العنوان
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              placeholder="أدخل العنوان"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* النوع */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            النوع
          </label>
          <select
            className={`w-full py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all ${isRTL ? 'pr-4 pl-4' : 'pr-4 pl-4'}`}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            disabled={loading}
          >
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>

        {/* تاريخ الميلاد */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            تاريخ الميلاد
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <input
              type="date"
              className={`w-full py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all ${isRTL ? 'pr-4 pl-4' : 'pr-4 pl-4'}`}
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* صورة البطاقة */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            صورة البطاقة
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت')
                    return
                  }
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    setForm({ ...form, national_id_photo: reader.result })
                  }
                  reader.readAsDataURL(file)
                }
              }}
              disabled={loading}
            />
            {form.national_id_photo && (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-1">
                <img src={form.national_id_photo} alt="National ID" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, national_id_photo: '' })}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}
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