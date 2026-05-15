import { Search } from 'lucide-react'
import { useState } from 'react'

const dummyPatients = [
  { id: 'P001', name: 'Ahmed Mohamed', phone: '01001234567' },
  { id: 'P002', name: 'Sara Hassan', phone: '01007654321' },
]

export default function PatientSearch({ onSelectPatient }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 1) {
      setResults(dummyPatients.filter(p => p.name.includes(value) || p.phone.includes(value)))
    } else {
      setResults([])
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Search className="text-blue-600" /> Search Patient
      </h2>
      <input
        type="text"
        placeholder="Search by name or phone..."
        className="w-full border rounded-lg p-2 mb-3"
        value={query}
        onChange={handleSearch}
      />
      {results.length > 0 && (
        <ul className="border rounded-lg divide-y">
          {results.map(p => (
            <li
              key={p.id}
              className="p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectPatient(p)}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-500">{p.phone}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}