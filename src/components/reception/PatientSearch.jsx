// src/components/reception/PatientSearch.jsx
import { Search, User, Phone, Star, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

// ========== استيراد الخدمات ==========
import { patientsService } from '../../services/api'
import { useServices } from '../../context/ServiceContext'

export default function PatientSearch({ onSelectPatient }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // ========== استخدام خدمات API ==========
  const { isOnline } = useServices()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)

  // ========== دالة البحث ==========
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      let patients = []

      if (isOnline) {
        try {
          // محاولة البحث عبر API
          const response = await patientsService.searchPatients(searchQuery)
          // ✅ التأكد من أن response مصفوفة
          if (Array.isArray(response)) {
            patients = response
          } else if (response?.patients && Array.isArray(response.patients)) {
            patients = response.patients
          } else {
            patients = []
          }
        } catch (apiError) {
          console.warn('API search failed, using local:', apiError)
          // وضع غير متصل - البحث في localStorage
          const savedPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
          patients = savedPatients.filter(p =>
            (p.first_name || p.name || p.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.last_name || p.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.phone || '').includes(searchQuery)
          )
        }
      } else {
        // وضع غير متصل - البحث في localStorage
        const savedPatients = JSON.parse(localStorage.getItem('mcsos_patients_v2') || '[]')
        patients = savedPatients.filter(p =>
          (p.first_name || p.name || p.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.last_name || p.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.phone || '').includes(searchQuery)
        )
      }

      setResults(patients)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('حدث خطأ في البحث عن المرضى')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [isOnline])

  // ========== معالجة تغيير النص مع Debounce ==========
  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)

    // إلغاء الطلب السابق
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // تأخير البحث لتحسين الأداء
    const timeout = setTimeout(() => {
      performSearch(value)
    }, 500)

    setDebounceTimeout(timeout)
  }

  // ========== تنظيف الـ timeout عند إلغاء التثبيت ==========
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [debounceTimeout])

  // ========== اختيار مريض ==========
  const handleSelectPatient = (patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient)
    }
  }

  // ========== الحصول على اسم المريض حسب اللغة ==========
  const getPatientName = (patient) => {
    if (isRTL) {
      return patient.first_name || patient.nameAr || patient.name || 'مريض'
    }
    return patient.first_name || patient.nameEn || patient.name || 'Patient'
  }

  const getFullName = (patient) => {
    const firstName = patient.first_name || patient.name || patient.nameAr || ''
    const lastName = patient.last_name || patient.nameEn || ''
    return `${firstName} ${lastName}`.trim() || 'مريض'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
      <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
          <Search className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            البحث عن مريض
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ابحث بالاسم أو رقم الجوال
            {!isOnline && (
              <span className="block text-xs text-yellow-400">⚡ غير متصل - بحث محلي</span>
            )}
          </p>
        </div>
      </div>

      <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الجوال..."
          className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all`}
          value={query}
          onChange={handleSearch}
          disabled={loading}
        />
        {loading && (
          <Loader2 className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-teal-500 animate-spin`} size={18} />
        )}
      </div>

      {/* عرض النتائج */}
      {results.length > 0 && (
        <ul className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {results.map((p) => (
            <li
              key={p.id}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200"
              onClick={() => handleSelectPatient(p)}
            >
              <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <User size={18} className="text-blue-500" />
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {getFullName(p)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {p.visits || p.visitsCount || 0} زيارة
                  </span>
                </div>
              </div>
              <div className={`flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  <span>{p.phone || p.phone_number || '-'}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  {p.patient_code && (
                    <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-semibold">
                      كود: {p.patient_code}
                    </span>
                  )}
                  {p.profile_number && (
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-semibold">
                      ملف: {p.profile_number}
                    </span>
                  )}
                </div>
              </div>
              {p._syncPending && (
                <span className="text-xs text-yellow-400 mt-1 block">⏳ في انتظار المزامنة</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* عدم وجود نتائج */}
      {query.length > 1 && results.length === 0 && !loading && (
        <div className="text-center py-8">
          <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">لا يوجد مرضى مطابقين للبحث</p>
        </div>
      )}

      {/* حالة التحميل الأولي */}
      {loading && query.length > 1 && results.length === 0 && (
        <div className="text-center py-8">
          <Loader2 size={32} className="mx-auto text-teal-500 animate-spin mb-3" />
          <p className="text-gray-500 dark:text-gray-400">جاري البحث...</p>
        </div>
      )}

      {/* رسالة عند عدم كتابة كافٍ */}
      {query.length > 0 && query.length < 2 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">اكتب حرفين على الأقل للبحث</p>
        </div>
      )}
    </div>
  )
}