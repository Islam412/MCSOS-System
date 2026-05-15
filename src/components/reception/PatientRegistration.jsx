import { useState } from 'react'
import { UserPlus, Mail, Phone, User, IdCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientRegistration() {
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    idNumber: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Please fill required fields (Name and Phone)')
      return
    }
    const patientId = 'P' + Math.floor(Math.random() * 10000)
    toast.success(`Patient ${form.name} registered successfully! ID: ${patientId}`)
    setForm({ name: '', phone: '', email: '', idNumber: '' })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <UserPlus className="text-blue-600" /> New Patient Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              required
              placeholder="Enter full name"
              className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone (WhatsApp) *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="tel"
              required
              placeholder="+20 100 123 4567"
              className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="patient@example.com"
              className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">National ID (Optional)</label>
          <div className="relative">
            <IdCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="National ID number"
              className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Register Patient
        </button>
      </form>
    </div>
  )
}
