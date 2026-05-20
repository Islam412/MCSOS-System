import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ProtectedRoute from './components/common/ProtectedRoute'
import DashboardLayout from './components/common/DashboardLayout'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import DoctorDashboard from './pages/dashboard/DoctorDashboard'
import ReceptionDashboard from './pages/dashboard/ReceptionDashboard'
import HospitalDashboard from './pages/dashboard/HospitalDashboard'
import ReceptionPage from './pages/ReceptionDashboard'
import DoctorPage from './pages/DoctorDashboard'
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
  // دالة للحصول على الدور وتوجيهه للوحة المناسبة
  const getDashboardByRole = () => {
    const user = localStorage.getItem('mcsos_user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role === 'admin') return <AdminDashboard />
      if (userData.role === 'doctor') return <DoctorDashboard />
      if (userData.role === 'reception') return <ReceptionDashboard />
    }
    return <HospitalDashboard />
  }
  
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={getDashboardByRole()} />
            <Route path="dashboard" element={<HospitalDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="reception-dashboard" element={<ReceptionDashboard />} />
            <Route path="reception" element={<ReceptionPage />} />
            <Route path="doctor" element={<DoctorPage />} />
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
