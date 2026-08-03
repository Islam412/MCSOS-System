import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { compressImage } from '../../utils/imageCompressor'

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
    date_of_birth: '',
    nationality: 'مصري - Egypt',
    occupation: ''
  })

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
    return age > 0 ? age : 0
  }

  const currentAge = calculateAge(regForm.date_of_birth)

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
        date_of_birth: regForm.date_of_birth || undefined,
        nationality: regForm.nationality || 'Egypt',
        occupation: regForm.occupation || undefined,
        age: currentAge !== null ? currentAge : undefined
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
        date_of_birth: '',
        nationality: 'مصري - Egypt',
        occupation: ''
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
            <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'الاسم الكامل (رباعي) *' : 'Full Name (4 parts) *'}</label>
            <input
              type="text"
              required
              placeholder={isRTL ? 'مثال: أحمد محمد علي حسن...' : 'e.g., Ahmed Mohamed Ali Hassan...'}
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
            <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'جهة التحويل (كيف عرفتنا؟)' : 'Referral Source'}</label>
            <select
              value={regForm.referral_source || ''}
              onChange={(e) => setRegForm({ ...regForm, referral_source: e.target.value })}
              className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200"
            >
              <option value="">{isRTL ? '-- اختر مصدر التعرف علينا --' : '-- Select Referral Source --'}</option>
              <option value="Social Media">{isRTL ? 'سوشيال ميديا (Social Media)' : 'Social Media'}</option>
              <option value="Google Search">{isRTL ? 'بحث جوجل (Google Search)' : 'Google Search'}</option>
              <option value="Friend">{isRTL ? 'ترشيح صديق / أقارب' : 'Friend / Family'}</option>
              <option value="Doctor Referral">{isRTL ? 'تحويل طبيب' : 'Doctor Referral'}</option>
              <option value="Advertisement">{isRTL ? 'إعلانات' : 'Advertisement'}</option>
              <option value="Walk-in">{isRTL ? 'زيارة مباشرة' : 'Walk-in'}</option>
              <option value="Other">{isRTL ? 'أخرى' : 'Other'}</option>
            </select>
          </div>

          {/* Nationality & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'الجنسية (إلزامي)' : 'Nationality *'}</label>
              <input
                type="text"
                required
                list="modal_nationalities"
                placeholder={isRTL ? 'ابحث أو اختر الجنسية...' : 'Search nationality...'}
                value={regForm.nationality || ''}
                onChange={(e) => setRegForm({ ...regForm, nationality: e.target.value })}
                className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800 dark:text-white"
              />
              <datalist id="modal_nationalities">
                <option value="مصري - Egypt" />
                <option value="سعودي - Saudi Arabia" />
                <option value="إماراتي - UAE" />
                <option value="كويتي - Kuwait" />
                <option value="قطري - Qatar" />
                <option value="أردني - Jordan" />
                <option value="سوري - Syria" />
                <option value="لبناني - Lebanon" />
                <option value="عراقي - Iraq" />
                <option value="فلسطيني - Palestine" />
                <option value="أجنبي / آخر - Other" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">{isRTL ? 'الوظيفة (اختياري)' : 'Occupation'}</label>
              <input
                type="text"
                placeholder={isRTL ? 'مثال: مهندس، معلم...' : 'e.g., Engineer...'}
                value={regForm.occupation || ''}
                onChange={(e) => setRegForm({ ...regForm, occupation: e.target.value })}
                className="w-full p-2.5 border border-gray-250 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white"
              />
            </div>
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
              {currentAge !== null && (
                <div className="mt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md inline-block">
                  🎂 {isRTL ? `العمر محسوب تلقائياً: ${currentAge} سنة` : `Auto Age: ${currentAge} Yrs`}
                </div>
              )}
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
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const compressed = await compressImage(file)
                      setRegForm(prev => ({ ...prev, national_id_front: compressed }))
                    }
                  }}
                  disabled={loading}
                />
                {regForm.national_id_front && (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {regForm.national_id_front.includes('application/pdf') ? (
                      <div className="text-center p-2">
                        <span className="text-2xl block">📄</span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{isRTL ? 'مُرفق ملف PDF' : 'PDF Document'}</span>
                      </div>
                    ) : (
                      <img src={regForm.national_id_front} alt="ID Front" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, national_id_front: '' })}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
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
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const compressed = await compressImage(file)
                      setRegForm(prev => ({ ...prev, national_id_back: compressed }))
                    }
                  }}
                  disabled={loading}
                />
                {regForm.national_id_back && (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {regForm.national_id_back.includes('application/pdf') ? (
                      <div className="text-center p-2">
                        <span className="text-2xl block">📄</span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{isRTL ? 'مُرفق ملف PDF' : 'PDF Document'}</span>
                      </div>
                    ) : (
                      <img src={regForm.national_id_back} alt="ID Back" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, national_id_back: '' })}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
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
