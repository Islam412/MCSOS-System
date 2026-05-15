import { Search, User, Phone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const dummyPatients = [
  { id: 'P001', name: 'Ahmed Mohamed', phone: '01001234567', email: 'ahmed@example.com' },
  { id: 'P002', name: 'Sara Hassan', phone: '01007654321', email: 'sara@example.com' },
  { id: 'P003', name: 'Mahmoud Ali', phone: '01005556677', email: 'mahmoud@example.com' },
]

export default function PatientSearch({ onSelectPatient }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 1) {
      const filtered = dummyPatients.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase()) || 
        p.phone.includes(value)
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  return (
    <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
          <Search className="text-teal-600 dark:text-teal-400" size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('reception.search_patient')}</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('reception.search')}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-dark-300 dark:text-white transition-all"
          value={query}
          onChange={handleSearch}
        />
      </div>

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map(p => (
            <li
              key={p.id}
              className="p-3 bg-gray-50 dark:bg-dark-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200"
              onClick={() => onSelectPatient(p)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{p.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{p.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={14} />
                <span>{p.phone}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {query.length > 1 && results.length === 0 && (
        <p className="text-gray-500 text-sm mt-4 text-center">{t('reception.no_patients')}</p>
      )}
    </div>
  )
}
