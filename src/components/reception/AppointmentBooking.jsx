import { useState } from 'react'
import { Calendar, Clock, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AppointmentBooking({ patient }) {
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const handleBooking = () => {
    toast.success(`Assessment booked for ${patient.name} with Dr. ${doctor}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <UserCheck className="text-green-600" /> Book Appointment for {patient.name}
      </h2>
      <div className="space-y-4">
        <select
          className="w-full border rounded-lg p-2"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
        >
          <option value="">Select Doctor</option>
          <option>Dr. Ahmed (Specialist)</option>
          <option>Dr. Mona (Therapist)</option>
        </select>
        <input
          type="date"
          className="w-full border rounded-lg p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          className="w-full border rounded-lg p-2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button
          onClick={handleBooking}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Book Assessment Session
        </button>
      </div>
    </div>
  )
}