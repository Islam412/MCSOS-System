import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [loading, setLoading] = useState(false)
  const [regForm, setRegForm] = useState({
    fullName: '',
    phone: '',
    whatsapp_number: '',
    sameAsPhone: true,
    referral_source: '',
    national_id_front: '',
    national_id_back: '',
    national_id_photo: '',
    gender: 'male',
    date_of_birth: ''
  })

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!regForm.fullName.trim() || !regForm.phone) {
      toast.error(isRTL ? 'الرجاء إدخال الاسم الكامل ورقم الهاتف' : 'Please enter full name and phone number')
      return
    }

    if (!regForm.national_id_front) {
      toast.error(isRTL ? 'الرجاء رفع صورة الوجه الأمامي للهوية الوطنية (إلزامي)' : 'Please upload Front view of National ID (Required)')
      return
    }
    
    const nameParts = regForm.fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || 'مريض'
    const lastName = nameParts.slice(1).join(' ') || nameParts[0]
    
    const token = localStorage.getItem('mcsos_token')
    try {
      setLoading(true)
      const payload = {
        first_name: firstName,
        last_name: lastName,
        full_name_ar: regForm.fullName.trim(),
        phone: regForm.phone.trim(),
        whatsapp_number: regForm.sameAsPhone ? regForm.phone.trim() : (regForm.whatsapp_number.trim() || regForm.phone.trim()),
        referral_source: regForm.referral_source || undefined,
        national_id_front: regForm.national_id_front || undefined,
        national_id_back: regForm.national_id_back || undefined,
        national_id_photo: regForm.national_id_front || regForm.national_id_photo || undefined,
        gender: regForm.gender || 'male',
        date_of_birth: regForm.date_of_birth || undefined
      }
      
      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) throw new Error('Failed to register patient')
      const newPatient = await response.json()
      toast.success(isRTL ? 'تم تسجيل المريض بنجاح!' : 'Patient registered successfully!')
      
      setRegForm({
        fullName: '',
        phone: '',
        whatsapp_number: '',
        sameAsPhone: true,
        referral_source: '',
        national_id_front: '',
        national_id_back: '',
        national_id_photo: '',
        gender: 'male',
        date_of_birth: ''
      })
      
      if (onPatientAdded) onPatientAdded(newPatient)
      onClose()
    } catch (error) {
      toast.error(isRTL ? 'فشل تسجيل المريض الجديد' : 'Failed to register new patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-150 dark:border-gray-700 overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-900">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <UserPlus className="text-indigo-500" size={20} />
            {isRTL ? 'تسجيل مريض جديد' : 'Register New Patient'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'الاسم الكامل *' : 'Full Name *'}</label>
            <input
              type="text"
              required
              placeholder={isRTL ? 'أدخل اسم المريض بالكامل...' : 'Enter patient full name...'}
              value={regForm.fullName}
              onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
              className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'رقم الهاتف *' : 'Phone Number *'}</label>
            <input
              type="text"
              required
              value={regForm.phone}
              onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="modalSameAsPhone"
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-gray-700 border-gray-600"
              checked={regForm.sameAsPhone}
              onChange={(e) => setRegForm({ ...regForm, sameAsPhone: e.target.checked })}
            />
            <label htmlFor="modalSameAsPhone" className="text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer">
              {isRTL ? 'رقم الواتساب هو نفسه رقم الهاتف' : 'WhatsApp number is same as phone'}
            </label>
          </div>

          {!regForm.sameAsPhone && (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}</label>
              <input
                type="text"
                value={regForm.whatsapp_number}
                onChange={(e) => setRegForm({ ...regForm, whatsapp_number: e.target.value })}
                className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'جهة التحويل' : 'Referral Source'}</label>
            <input
              type="text"
              value={regForm.referral_source}
              onChange={(e) => setRegForm({ ...regForm, referral_source: e.target.value })}
              className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'الجنس' : 'Gender'}</label>
              <select
                value={regForm.gender}
                onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
              <input
                type="date"
                value={regForm.date_of_birth}
                onChange={(e) => setRegForm({ ...regForm, date_of_birth: e.target.value })}
                className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* National ID Copy Upload Section (Front & Back) */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-750">
            <label className="block text-xs font-bold text-gray-400">
              {isRTL ? 'صورة الهوية الوطنية / البطاقة الشخصية' : 'National ID Copy'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Front */}
              <div className="p-3 border-2 border-dashed border-gray-250 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <span className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                  <span>{isRTL ? '• الوجه الأمامي (Front)' : '• Front View'}</span>
                  <span className="text-red-500 font-bold">* ({isRTL ? 'إلزامي' : 'Required'})</span>
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error(isRTL ? 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت' : 'File size must not exceed 5MB')
                        return
                      }
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setRegForm({ ...regForm, national_id_front: reader.result })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  disabled={loading}
                />
                {regForm.national_id_front && (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2">
                    <img src={regForm.national_id_front} alt="ID Front" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, national_id_front: '' })}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Back (Optional) */}
              <div className="p-3 border-2 border-dashed border-gray-250 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  {isRTL ? '• الوجه الخلفي (Back - اختياري)' : '• Back View (Optional)'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error(isRTL ? 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت' : 'File size must not exceed 5MB')
                        return
                      }
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setRegForm({ ...regForm, national_id_back: reader.result })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  disabled={loading}
                />
                {regForm.national_id_back && (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2">
                    <img src={regForm.national_id_back} alt="ID Back" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, national_id_back: '' })}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {isRTL ? 'حفظ وتسجيل المريض' : 'Save & Register Patient'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-150 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl text-sm transition duration-200"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
