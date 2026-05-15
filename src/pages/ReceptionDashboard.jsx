import { useState } from 'react'
import PatientRegistration from '../components/reception/PatientRegistration'
import PatientSearch from '../components/reception/PatientSearch'
import AppointmentBooking from '../components/reception/AppointmentBooking'

export default function ReceptionDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reception Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientRegistration />
        <PatientSearch onSelectPatient={setSelectedPatient} />
      </div>

      {selectedPatient && <AppointmentBooking patient={selectedPatient} />}
    </div>
  )
}