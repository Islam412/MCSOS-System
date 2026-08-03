// src/components/common/UnifiedPatientForm.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Phone, Mail, MapPin, Briefcase, Calendar, FileText, Upload, X, Loader2, Sparkles, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { compressImage } from '../../utils/imageCompressor'
import { patientsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function UnifiedPatientForm({
  variant = 'modal', // 'modal' | 'inline' | 'compact'
  onSuccess,
  onCancel,
  showExtras = false,
  submitBtnText,
  initialValues = {}
}) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline } = useServices()

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: initialValues.first_name || '',
    last_name: initialValues.last_name || '',
    full_name_ar: initialValues.full_name_ar || '',
    nationality: initialValues.nationality || (isRTL ? 'مصر - Egypt' : 'Egypt'),
    occupation: initialValues.occupation || '',
    phone: initialValues.phone || '',
    whatsapp_number: initialValues.whatsapp_number || '',
    sameAsPhone: initialValues.sameAsPhone !== undefined ? initialValues.sameAsPhone : true,
    referral_source: initialValues.referral_source || 'Social Media',
    national_id_front: initialValues.national_id_front || '',
    national_id_back: initialValues.national_id_back || '',
    email: initialValues.email || '',
    address: initialValues.address || '',
    gender: initialValues.gender || 'male',
    date_of_birth: initialValues.date_of_birth || ''
  })

  // Auto Age Calculation
  const calculateAge = (dob) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }

  const currentAge = calculateAge(form.date_of_birth)

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Validate Required Fields
    const fullName = form.full_name_ar.trim() || `${form.first_name} ${form.last_name}`.trim()
    if (!fullName || !form.phone.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال الاسم ورقم الهاتف' : 'Please enter patient name and phone number')
      return
    }

    if (!form.national_id_front) {
      toast.error(isRTL ? 'الرجاء رفع صورة الوجه الأمامي للهوية الوطنية (إلزامي)' : 'Please upload Front view of National ID (Required)')
      return
    }

    setLoading(true)

    // Name parts logic
    let firstName = form.first_name.trim()
    let lastName = form.last_name.trim()
    if (!firstName && fullName) {
      const parts = fullName.split(/\s+/)
      firstName = parts[0]
      lastName = parts.slice(1).join(' ') || parts[0]
    }
    if (!lastName) lastName = firstName

    const patientPayload = {
      first_name: firstName,
      last_name: lastName,
      full_name_ar: fullName,
      phone: form.phone.trim(),
      whatsapp_number: form.sameAsPhone ? form.phone.trim() : (form.whatsapp_number.trim() || form.phone.trim()),
      referral_source: form.referral_source || 'Social Media',
      national_id_front: form.national_id_front || undefined,
      national_id_back: form.national_id_back || undefined,
      national_id_photo: form.national_id_front || undefined,
      gender: form.gender || 'male',
      date_of_birth: form.date_of_birth || undefined,
      nationality: form.nationality || 'Egypt',
      occupation: form.occupation || undefined,
      email: (showExtras || variant === 'inline') ? (form.email.trim() || undefined) : undefined,
      address: (showExtras || variant === 'inline') ? (form.address.trim() || undefined) : undefined,
      age: currentAge !== null ? currentAge : undefined
    }

    try {
      let createdPatient
      if (isOnline) {
        const response = await patientsService.createPatient(patientPayload)
        createdPatient = response?.patient || response
        toast.success(isRTL ? `تم تسجيل المريض (${fullName}) بنجاح!` : `Patient (${fullName}) registered successfully!`)
      } else {
        // Offline Fallback
        createdPatient = {
          ...patientPayload,
          id: 'P' + Math.floor(Math.random() * 100000),
          profile_number: 'PAT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          _syncPending: true,
          registerDate: new Date().toISOString()
        }
        const existing = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
        existing.push(createdPatient)
        localStorage.setItem('mcsos_patients_v2', JSON.stringify(existing))
        toast.success(isRTL ? `تم تسجيل المريض محلياً (${fullName})` : `Patient saved locally (${fullName})`)
      }

      if (onSuccess) onSuccess(createdPatient)
    } catch (error) {
      console.error('Unified Patient Registration error:', error)
      toast.error(isRTL ? 'فشل تسجيل المريض الجديد' : 'Failed to register patient')
    } finally {
      setLoading(false)
    }
  }

  const isCompact = variant === 'compact'

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Full Name (4 Parts) */}
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
          {isRTL ? 'الاسم رباعي (بالكامل)' : 'Full Name (4 Parts)'} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.full_name_ar}
          onChange={(e) => setForm({ ...form, full_name_ar: e.target.value })}
          placeholder={isRTL ? 'مثال: أحمد محمد علي حسن' : 'e.g., Ahmed Mohamed Ali Hassan'}
          className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition"
        />
      </div>

      {/* Phone & Nationality */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? 'رقم الجوال' : 'Phone Number'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+20 100 000 0000"
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dir-ltr text-left font-mono transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? 'الجنسية' : 'Nationality'} <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="مصري - Egypt">{isRTL ? 'مصري - Egypt' : 'Egyptian - Egypt'}</option>
            <option value="سعودي - Saudi Arabia">{isRTL ? 'سعودي - Saudi Arabia' : 'Saudi - Saudi Arabia'}</option>
            <option value="إماراتي - UAE">{isRTL ? 'إماراتي - UAE' : 'Emirati - UAE'}</option>
            <option value="كويتي - Kuwait">{isRTL ? 'كويتي - Kuwait' : 'Kuwaiti - Kuwait'}</option>
            <option value="قطري - Qatar">{isRTL ? 'قطري - Qatar' : 'Qatari - Qatar'}</option>
            <option value="أردني - Jordan">{isRTL ? 'أردني - Jordan' : 'Jordanian - Jordan'}</option>
            <option value="سوري - Syria">{isRTL ? 'سوري - Syria' : 'Syrian - Syria'}</option>
            <option value="لبناني - Lebanon">{isRTL ? 'لبناني - Lebanon' : 'Lebanese - Lebanon'}</option>
            <option value="عراقي - Iraq">{isRTL ? 'عراقي - Iraq' : 'Iraqi - Iraq'}</option>
            <option value="فلسطيني - Palestine">{isRTL ? 'فلسطيني - Palestine' : 'Palestinian - Palestine'}</option>
            <option value="أجنبي / آخر - Other">{isRTL ? 'أجنبي / آخر - Other' : 'Other'}</option>
          </select>
        </div>
      </div>

      {/* Same as phone checkbox */}
      <div className="flex items-center gap-2 px-1">
        <input
          type="checkbox"
          id="unifiedSameAsPhone"
          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          checked={form.sameAsPhone}
          onChange={(e) => setForm({ ...form, sameAsPhone: e.target.checked })}
        />
        <label htmlFor="unifiedSameAsPhone" className="text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
          {isRTL ? 'رقم الواتساب هو نفسه رقم الهاتف' : 'WhatsApp number is same as phone'}
        </label>
      </div>

      {!form.sameAsPhone && (
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}</label>
          <input
            type="text"
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dir-ltr text-left font-mono"
          />
        </div>
      )}

      {/* Referral & Occupation & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'جهة التحويل' : 'Referral Source'}</label>
          <select
            value={form.referral_source}
            onChange={(e) => setForm({ ...form, referral_source: e.target.value })}
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Social Media">{isRTL ? 'سوشيال ميديا (Social Media)' : 'Social Media'}</option>
            <option value="Google Search">{isRTL ? 'بحث جوجل (Google Search)' : 'Google Search'}</option>
            <option value="Friend">{isRTL ? 'ترشيح صديق / أقارب' : 'Friend / Family'}</option>
            <option value="Doctor Referral">{isRTL ? 'تحويل طبيب' : 'Doctor Referral'}</option>
            <option value="Advertisement">{isRTL ? 'إعلانات' : 'Advertisement'}</option>
            <option value="Walk-in">{isRTL ? 'زيارة مباشرة' : 'Walk-in'}</option>
            <option value="Other">{isRTL ? 'أخرى' : 'Other'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'المهنة (اختياري)' : 'Occupation'}</label>
          <input
            type="text"
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            placeholder={isRTL ? 'مثال: مهندس، طبيب...' : 'Occupation...'}
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'النوع' : 'Gender'}</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
            <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
          </select>
        </div>
      </div>

      {/* Date of Birth & Auto Age */}
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
        <input
          type="date"
          value={form.date_of_birth}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {currentAge !== null && (
          <div className="mt-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg inline-block border border-indigo-100 dark:border-indigo-800">
            🎂 {isRTL ? `العمر محسوب تلقائياً: ${currentAge} سنة` : `Auto Age: ${currentAge} Yrs`}
          </div>
        )}
      </div>

      {/* Optional Extra Fields (Email & Address) */}
      {(showExtras || variant === 'inline') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="patient@example.com"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dir-ltr text-left"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isRTL ? 'العنوان السكني' : 'Home Address'}</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder={isRTL ? 'مثال: القاهرة، مدينة نصر...' : 'Address...'}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* National ID Copy Section (Front & Back) with Auto Compression */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          {isRTL ? 'صورة الهوية الوطنية / البطاقة الشخصية' : 'National ID Copy'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Front */}
          <div className="p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/60 dark:bg-gray-900/40">
            <span className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>{isRTL ? '• الوجه الأمامي (Front)' : '• Front View'}</span>
              <span className="text-rose-500 font-bold">* ({isRTL ? 'إلزامي' : 'Required'})</span>
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-600 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files[0]
                if (file) {
                  const compressed = await compressImage(file)
                  setForm(prev => ({ ...prev, national_id_front: compressed }))
                }
              }}
              disabled={loading}
            />
            {form.national_id_front && (
              <div className="relative w-full h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mt-2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {form.national_id_front.includes('application/pdf') ? (
                  <div className="text-center p-2">
                    <span className="text-xl block">📄</span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">PDF Document</span>
                  </div>
                ) : (
                  <img src={form.national_id_front} alt="ID Front" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, national_id_front: '' })}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition shadow"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Back */}
          <div className="p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/60 dark:bg-gray-900/40">
            <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
              {isRTL ? '• الوجه الخلفي (Back - اختياري)' : '• Back View (Optional)'}
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-600 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files[0]
                if (file) {
                  const compressed = await compressImage(file)
                  setForm(prev => ({ ...prev, national_id_back: compressed }))
                }
              }}
              disabled={loading}
            />
            {form.national_id_back && (
              <div className="relative w-full h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mt-2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {form.national_id_back.includes('application/pdf') ? (
                  <div className="text-center p-2">
                    <span className="text-xl block">📄</span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">PDF Document</span>
                  </div>
                ) : (
                  <img src={form.national_id_back} alt="ID Back" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, national_id_back: '' })}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition shadow"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold transition"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isRTL ? 'جاري التسجيل...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{submitBtnText || (isRTL ? 'حفظ وتسجيل المريض' : 'Save & Register Patient')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
