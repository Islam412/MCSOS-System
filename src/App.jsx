import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import DashboardLayout from './components/common/DashboardLayout'
import ReceptionDashboard from './pages/ReceptionDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import FinanceDashboard from './pages/FinanceDashboard'
import OperationsDashboard from './pages/OperationsDashboard'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<ReceptionDashboard />} />
            <Route path="doctor" element={<DoctorDashboard />} />
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="operations" element={<OperationsDashboard />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
