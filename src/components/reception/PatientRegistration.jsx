import { useState } from 'react'
import { UserPlus, Mail, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientRegistration() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success(`Patient ${form.name} registered successfully!`)
    setForm({ name: '', phone: '', email: '' })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <UserPlus className="text-blue-600" /> New Patient Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              required
              className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone (WhatsApp)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="tel"
              required
              className="pl-10 w-full border rounded-lg p-2"
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
              className="pl-10 w-full border rounded-lg p-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Register Patient
        </button>
      </form>
    </div>
  )
}