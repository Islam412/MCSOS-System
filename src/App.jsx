// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ProtectedRoute from './components/common/ProtectedRoute'
import DashboardLayout from './components/common/DashboardLayout'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import DoctorDashboard from './pages/dashboard/DoctorDashboard'
import ReceptionDashboard from './pages/dashboard/ReceptionDashboard'
import PatientDashboard from './pages/dashboard/PatientDashboard'
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
import DoctorsManager from './components/admin/DoctorsManager'
import UsersManager from './components/admin/UsersManager'
import Appointments from './pages/patient/Appointments' 
import BookAppointment from './pages/patient/BookAppointment'

function App() {
  return (
    <ThemeProvider>
      {/* ❌ إزالة <Router> من هنا لأنها موجودة في main.jsx */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* مسارات الأدمن */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="doctors-manager" element={<DoctorsManager />} />
          <Route path="users-manager" element={<UsersManager />} />
          
          {/* مسارات الدكتور */}
          <Route path="doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="doctor" element={<DoctorPage />} />
          
          {/* مسارات الاستقبال */}
          <Route path="reception-dashboard" element={<ReceptionDashboard />} />
          <Route path="reception" element={<ReceptionPage />} />
          
          {/* مسار المريض */}
          <Route path="patient-dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<Appointments />} />
          
          {/* المسارات المشتركة */}
          <Route path="finance" element={<FinanceManager />} />
          <Route path="operations" element={<OperationsDashboard />} />
          <Route path="scheduling" element={<SchedulingEngine />} />
          <Route path="packages" element={<PackagesManager />} />
          <Route path="whatsapp" element={<WhatsAppManager />} />
          <Route path="invoice" element={<InvoiceManager />} />
          <Route path="prescription" element={<PrescriptionManager />} />
          <Route path="patients" element={<PatientProfile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          
          {/* الصفحة الرئيسية الافتراضية */}
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App