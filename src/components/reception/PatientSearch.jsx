import { Search, User, Phone, Star } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const dummyPatients = [
  { id: 'P001', name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@example.com', visits: 12 },
  { id: 'P002', name: 'سارة حسن', phone: '0507654321', email: 'sara@example.com', visits: 8 },
  { id: 'P003', name: 'محمود علي', phone: '0505566778', email: 'mahmoud@example.com', visits: 5 },
  { id: 'P004', name: 'نورة عبدالله', phone: '0509988776', email: 'noura@example.com', visits: 15 },
]

export default function PatientSearch({ onSelectPatient }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 1) {
      const filtered = dummyPatients.filter(p => 
        p.name.includes(value) || 
        p.phone.includes(value)
      )
      setResults(filtered)
    } else {
      setResults([])
    }
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
        />
      </div>

      {results.length > 0 && (
        <ul className="mt-4 space-y-3">
          {results.map(p => (
            <li
              key={p.id}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200"
              onClick={() => onSelectPatient(p)}
            >
              <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <User size={18} className="text-blue-500" />
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{p.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{p.visits} زيارة</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone size={14} />
                <span>{p.phone}</span>
                <span className="text-gray-300 mx-2">|</span>
                <span className="text-xs">{p.id}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {query.length > 1 && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">لا يوجد مرضى</p>
        </div>
      )}
    </div>
  )
}
