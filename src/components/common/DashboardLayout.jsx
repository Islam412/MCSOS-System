import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, Users, DollarSign, LogOut, Menu, X, Clock, Package, MessageCircle, FileText, Pill, UserCircle, LayoutDashboard, User, Stethoscope, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import { useTheme } from '../../context/ThemeContext'
import { useState, useEffect } from 'react'

export default function DashboardLayout() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('')
  const isRTL = i18n.language === 'ar'
  
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [isRTL, i18n.language])
  
  useEffect(() => {
    const userData = localStorage.getItem('mcsos_user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setUserRole(parsed.role)
    }
  }, [])
  
  // قائمة الروابط حسب الدور
  const getNavItems = () => {
    // روابط مشتركة للجميع
    const profileItem = { to: '/profile', label: 'sidebar.profile', icon: User }
    
    if (userRole === 'admin') {
      return [
        { to: '/admin', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/patients', label: 'sidebar.patients', icon: Users },
        { to: '/doctors-manager', label: 'sidebar.doctors_manager', icon: Stethoscope },  // <-- أضف هذا السطر
        { to: '/doctor', label: 'sidebar.doctor', icon: Stethoscope },
        { to: '/finance', label: 'sidebar.finance', icon: DollarSign },
        { to: '/operations', label: 'sidebar.operations', icon: CalendarDays },
        { to: '/scheduling', label: 'sidebar.scheduling', icon: Clock },
        { to: '/packages', label: 'sidebar.packages', icon: Package },
        { to: '/whatsapp', label: 'sidebar.whatsapp', icon: MessageCircle },
        { to: '/invoice', label: 'sidebar.invoice', icon: FileText },
        { to: '/prescription', label: 'sidebar.prescription', icon: Pill },
        profileItem
      ]
    } else if (userRole === 'doctor') {
      return [
        { to: '/doctor-dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/patients', label: 'sidebar.patients', icon: Users },
        { to: '/prescription', label: 'sidebar.prescription', icon: Pill },
        { to: '/scheduling', label: 'sidebar.scheduling', icon: Clock },
        profileItem
      ]
    } else if (userRole === 'reception') {
      return [
        { to: '/reception-dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/reception', label: 'sidebar.reception', icon: Users },
        { to: '/scheduling', label: 'sidebar.scheduling', icon: Clock },
        { to: '/patients', label: 'sidebar.patients', icon: UserCircle },
        profileItem
      ]
    } else if (userRole === 'user' || userRole === 'patient') {
      return [
        { to: '/patient-dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/profile', label: 'sidebar.profile', icon: User },
        { to: '/prescription', label: 'sidebar.prescription', icon: Pill },
        { to: '/appointments', label: 'sidebar.appointments', icon: Calendar },
        profileItem
      ]
    } else {
      return [
        { to: '/dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/patients', label: 'sidebar.patients', icon: Users },
        { to: '/appointments', label: 'sidebar.appointments', icon: Calendar },
        profileItem
      ]
    }
  }
  
  const navItems = getNavItems()
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => { if (isMobile) setSidebarOpen(false) }
  
  const handleLogout = () => {
    localStorage.removeItem('mcsos_user')
    localStorage.removeItem('mcsos_token')
    window.location.href = '/login'
  }
  
  const getRoleName = () => {
    if (userRole === 'admin') return isRTL ? 'مدير النظام' : 'System Administrator'
    if (userRole === 'doctor') return isRTL ? 'طبيب' : 'Doctor'
    if (userRole === 'reception') return isRTL ? 'موظف استقبال' : 'Receptionist'
    if (userRole === 'user' || userRole === 'patient') return isRTL ? 'مريض' : 'Patient'
    return isRTL ? 'مستخدم' : 'User'
  }
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-gray-900`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {isMobile && (
          <button onClick={toggleSidebar} className={`fixed top-4 z-50 p-3 rounded-xl bg-gray-800/80 backdrop-blur-md shadow-lg hover:bg-gray-700 transition-all duration-300 ${isRTL ? 'right-4' : 'left-4'}`}>
            {sidebarOpen ? <X size={24} className="text-blue-400" /> : <Menu size={24} className="text-blue-400" />}
          </button>
        )}
        
        <div className={`fixed top-0 z-40 h-full bg-gray-800/95 backdrop-blur-md shadow-2xl flex flex-col transition-all duration-300 ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'} ${isRTL ? 'right-0' : 'left-0'} w-80`}>
          <div className={`p-6 border-b border-gray-700 ${isRTL ? 'text-right' : 'text-left'} ${isMobile ? 'mt-12' : 'mt-0'}`}>
            <div className="font-bold text-2xl"><span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">{t('app.title')}</span></div>
            <p className="text-xs text-gray-400 mt-2">{user ? (isRTL ? user.name : user.nameEn) : t('app.name')}</p>
            <p className="text-xs text-blue-400 mt-1">{getRoleName()}</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                onClick={closeSidebar} 
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'} ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <item.icon size={20} />
                <span className="font-medium text-base">{t(item.label)}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-700 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <button 
              onClick={handleLogout} 
              className={`flex items-center gap-3 text-red-400 hover:text-red-300 w-full hover:bg-red-500/10 p-3 rounded-xl transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <LogOut size={20} />
              <span className="font-medium">{t('sidebar.logout')}</span>
            </button>
          </div>
        </div>
        
        {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={closeSidebar} />}
        
        <main className={`min-h-screen transition-all duration-300 ${!isMobile && !isRTL ? 'ml-80' : ''} ${!isMobile && isRTL ? 'mr-80' : ''}`}>
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}