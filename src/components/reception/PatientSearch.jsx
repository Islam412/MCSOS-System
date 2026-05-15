import { Search, User, Phone } from 'lucide-react'
import { useState } from 'react'

const dummyPatients = [
  { id: 'P001', name: 'Ahmed Mohamed', phone: '01001234567', email: 'ahmed@example.com' },
  { id: 'P002', name: 'Sara Hassan', phone: '01007654321', email: 'sara@example.com' },
  { id: 'P003', name: 'Mahmoud Ali', phone: '01005556677', email: 'mahmoud@example.com' },
]

export default function PatientSearch({ onSelectPatient }) {
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
    <div className="bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Search className="text-blue-600" /> Search Patient
      </h2>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or phone number..."
          className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={query}
          onChange={handleSearch}
        />
      </div>
      {results.length > 0 && (
        <ul className="mt-3 border rounded-lg divide-y">
          {results.map(p => (
            <li
              key={p.id}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectPatient(p)}
            >
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{p.id}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Phone size={14} />
                <span>{p.phone}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {query.length > 1 && results.length === 0 && (
        <p className="text-gray-500 text-sm mt-3 text-center">No patients found</p>
      )}
    </div>
  )
}
