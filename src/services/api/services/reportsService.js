import { ENDPOINTS } from '../config'
import { get } from '../client'

const withRange = (base, from, to) =>
  `${base}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

export const reportsService = {
  getPatientSource: (from, to) =>
    get(withRange(ENDPOINTS.REPORTS.PATIENT_SOURCE, from, to)),
  getCapacity: (from, to) => get(withRange(ENDPOINTS.REPORTS.CAPACITY, from, to)),
  getAttendance: (from, to) =>
    get(withRange(ENDPOINTS.REPORTS.ATTENDANCE, from, to)),
  getPackages: (from, to) => get(withRange(ENDPOINTS.REPORTS.PACKAGES, from, to)),
  getFinance: (from, to) => get(withRange(ENDPOINTS.REPORTS.FINANCE, from, to)),
}
