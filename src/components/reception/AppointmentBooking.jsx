import { useState } from 'react'
import { Calendar, Clock, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AppointmentBooking({ patient }) {
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  if (!patient) return null

  const handleBooking = () => {
    if (!doctor || !date || !time) {
      toast.error('Please fill all fields')
      return
    }
    toast.success(`Assessment booked for ${patient.name} with ${doctor} on ${date} at ${time}`)
    setDoctor('')
    setDate('')
    setTime('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border mt-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <UserCheck className="text-green-600" /> Book Appointment for {patient.name}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Doctor</label>
          <select
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
          >
            <option value="">Choose a doctor...</option>
            <option>Dr. Ahmed Ali (Orthopedic)</option>
            <option>Dr. Mona Hassan (Physical Therapy)</option>
            <option>Dr. Khaled Mahmoud (Neurology)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <button
          onClick={handleBooking}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Book Assessment Session
        </button>
      </div>
    </div>
  )
}
