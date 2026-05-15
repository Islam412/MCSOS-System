import { useState } from 'react'
import PatientRegistration from '../components/reception/PatientRegistration'
import PatientSearch from '../components/reception/PatientSearch'
import AppointmentBooking from '../components/reception/AppointmentBooking'

export default function ReceptionDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Reception Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Manage patient registration, search, and appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientRegistration />
        <PatientSearch onSelectPatient={setSelectedPatient} />
      </div>

      {selectedPatient && <AppointmentBooking patient={selectedPatient} />}
    </div>
  )
}
