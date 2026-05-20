import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/auth/Login'
import ProtectedRoute from './components/common/ProtectedRoute'
import DashboardLayout from './components/common/DashboardLayout'
import HospitalDashboard from './pages/dashboard/HospitalDashboard'
import ReceptionDashboard from './pages/ReceptionDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import FinanceManager from './components/finance/FinanceManager'
import OperationsDashboard from './pages/OperationsDashboard'
import SchedulingEngine from './components/scheduling/SchedulingEngine'
import PackagesManager from './components/packages/PackagesManager'
import WhatsAppManager from './components/whatsapp/WhatsAppManager'
import InvoiceManager from './components/invoice/InvoiceManager'
import PrescriptionManager from './components/prescription/PrescriptionManager'
import PatientProfile from './pages/patient/PatientProfile'
import Profile from './pages/profile/Profile'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<HospitalDashboard />} />
            <Route index element={<ReceptionDashboard />} />
            <Route path="doctor" element={<DoctorDashboard />} />
            <Route path="finance" element={<FinanceManager />} />
            <Route path="operations" element={<OperationsDashboard />} />
            <Route path="scheduling" element={<SchedulingEngine />} />
            <Route path="packages" element={<PackagesManager />} />
            <Route path="whatsapp" element={<WhatsAppManager />} />
            <Route path="invoice" element={<InvoiceManager />} />
            <Route path="prescription" element={<PrescriptionManager />} />
            <Route path="patients" element={<PatientProfile />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
