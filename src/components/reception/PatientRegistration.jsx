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
    full_name_ar: '',
    nationality: 'مصر',
    occupation: '',
    phone: '',
    whatsapp_number: '',
    sameAsPhone: true,
    referral_source: 'Social Media',
    national_id_front: '',
    national_id_back: '',
    email: '',
    address: '',
    gender: 'male',
    date_of_birth: ''
  })
  const [loading, setLoading] = useState(false)

  // حساب العمر تلقائياً
  const calculateAge = (dob) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }

  // ========== معالجة تسجيل المريض ==========
  const handleSubmit = async (e) => {
    e.preventDefault()

    // التحقق من الحقول المطلوبة
    if (!form.first_name || !form.phone || !form.nationality) {
      toast.error('الرجاء ملء الحقول المطلوبة (الاسم الأول، الهاتف، والجنسية)')
      return
    }

    if (!form.national_id_front) {
      toast.error('الرجاء رفع صورة الوجه الأمامي للهوية الوطنية (إلزامي)')
      return
    }

    setLoading(true)
    try {
      // ✅ البيانات بالشكل المطلوب من الـ API
      const patientData = {
        first_name: form.first_name,
        last_name: form.last_name || form.first_name,
        full_name_ar: form.full_name_ar || undefined,
        nationality: form.nationality || undefined,
        occupation: form.occupation || undefined,
        gender: form.gender || 'male',
        date_of_birth: form.date_of_birth || undefined,
        address: form.address || undefined,
        phone: form.phone,
        whatsapp_number: form.sameAsPhone ? form.phone : form.whatsapp_number || form.phone,
        referral_source: form.referral_source || 'Social Media',
        national_id_front: form.national_id_front || undefined,
        national_id_back: form.national_id_back || undefined,
        national_id_photo: form.national_id_front || undefined,
        emergency_contact: form.phone,
        email: form.email || undefined,
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
          profile_number: 'PRF-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
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
        full_name_ar: '',
        nationality: 'مصر',
        occupation: '',
        phone: '',
        whatsapp_number: '',
        sameAsPhone: true,
        referral_source: 'Social Media',
        national_id_front: '',
        national_id_back: '',
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
        {/* الاسم الأول واحترافي بالإنجليزي */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              الاسم الأول (إنجليزي) <span className="text-red-500">*</span>
            </label>
            <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
              <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input
                type="text"
                required
                placeholder="First Name"
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              اسم العائلة (إنجليزي)
            </label>
            <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
              <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input
                type="text"
                placeholder="Last Name"
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* الاسم رباعي بالعربي */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            الاسم رباعي (بالعربي)
          </label>
          <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
            <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
            <input
              type="text"
              placeholder="أدخل الاسم رباعي باللغة العربية"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
              value={form.full_name_ar}
              onChange={(e) => setForm({ ...form, full_name_ar: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* الجنسية والمهنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              الجنسية <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              disabled={loading}
            >
              <option value="مصر">مصري (مصر)</option>
              <option value="السعودية">سعودي (السعودية)</option>
              <option value="الإمارات">إماراتي (الإمارات)</option>
              <option value="الكويت">كويتي (الكويت)</option>
              <option value="قطر">قطري (قطر)</option>
              <option value="الأردن">أردني (الأردن)</option>
              <option value="السودان">سوداني (السودان)</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              المهنة / الوظيفة
            </label>
            <input
              type="text"
              placeholder="مثال: مهندس، معلم، طبيب..."
              className="w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
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

        {/* كيف عرفتنا؟ (Referral Source Dropdown) */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            كيف عرفتنا؟ (مصدر التعرف علينا)
          </label>
          <select
            className="w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
            value={form.referral_source}
            onChange={(e) => setForm({ ...form, referral_source: e.target.value })}
            disabled={loading}
          >
            <option value="Social Media">سوشيال ميديا (Social Media)</option>
            <option value="Google Search">بحث جوجل (Google Search)</option>
            <option value="Friend">ترشيح صديق (Friend)</option>
            <option value="Doctor Referral">تحويل طبيب (Doctor Referral)</option>
            <option value="Advertisement">إعلانات (Advertisement)</option>
            <option value="Walk-in">زيارة مباشرة (Walk-in)</option>
            <option value="Other">أخرى (Other)</option>
          </select>
        </div>

        {/* البريد الإلكتروني والعنوان */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              العنوان
            </label>
            <input
              type="text"
              placeholder="أدخل العنوان"
              className="w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* النوع وتاريخ الميلاد والعمر المحسوب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              النوع
            </label>
            <select
              className="w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              disabled={loading}
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              تاريخ الميلاد {calculateAge(form.date_of_birth) !== null && (
                <span className="text-blue-600 dark:text-blue-400 font-bold mr-2">
                  (العمر: {calculateAge(form.date_of_birth)} سنة)
                </span>
              )}
            </label>
            <input
              type="date"
              className="w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>

        {/* رفع صور البطاقة الشخصية (وجه وظهر) */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            صورة الهوية الوطنية / البطاقة الشخصية
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* الوجه الأمامي */}
            <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                الوجه الأمامي (Front) <span className="text-red-500 font-bold">* (إلزامي)</span>
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('حجم الملف يجب أن لا يتجاوز 5 ميجابايت')
                      return
                    }
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setForm({ ...form, national_id_front: reader.result })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                disabled={loading}
              />
              {form.national_id_front && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2">
                  <img src={form.national_id_front} alt="ID Front" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, national_id_front: '' })}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* الوجه الخلفي */}
            <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">الوجه الخلفي (Back - اختياري)</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('حجم الملف يجب أن لا يتجاوز 5 ميجابايت')
                      return
                    }
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setForm({ ...form, national_id_back: reader.result })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                disabled={loading}
              />
              {form.national_id_back && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2">
                  <img src={form.national_id_back} alt="ID Back" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, national_id_back: '' })}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
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