import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, Users, DollarSign, LogOut, Menu, X, Clock, Package, MessageCircle, FileText, Pill, UserCircle, LayoutDashboard, User, Stethoscope, CalendarDays, Hospital, Shield, CalendarCheck, DoorOpen, Activity, ChevronRight, ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import { useTheme } from '../../context/ThemeContext'
import { useState, useEffect } from 'react'
import { authService } from '../../services/api' // ✅ إضافة استيراد الخدمة

export default function DashboardLayout() {
  const { t, i18n } = useTranslation()
  const { theme, resolvedTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, icon: '📦', colorClass: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20', iconColor: 'text-amber-500', titleAr: 'تنبيه باقة على وشك الانتهاء', titleEn: 'Package Ending Soon Alert', descAr: 'باقة المريض (منى عبد المقصود) متبقي بها جلستان فقط. يُنصح بتجهيز الفاتورة للتجديد لتفادي انقطاع العلاج.', descEn: 'Patient package has only 2 sessions remaining. Prepare renewal invoice.', is_read: false },
    { id: 2, icon: '🔴', colorClass: 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20', iconColor: 'text-rose-600', titleAr: 'تنبيه السعة القصوى للطبيب', titleEn: 'Doctor Full Capacity Warning', descAr: 'د. محمود سعيد وصل للحد الأقصى اليوم (20 / 20 مريض). يتم تحويل المواعيد الجديدة تلقائيًا.', descEn: 'Dr. Mahmoud has reached daily maximum capacity (20/20).', is_read: false },
    { id: 3, icon: '💳', colorClass: 'hover:bg-purple-50/50 dark:hover:bg-purple-950/20', iconColor: 'text-purple-600', titleAr: 'التحقق المالي لجلسة التقييم', titleEn: 'Payment Verification Pending', descAr: 'دفعة التقييم للمريض (ريماز عبد الرزاق) في انتظار اعتماد قسم المالية للسماح ببدء الجلسة.', descEn: 'Assessment session payment pending finance verification.', is_read: false },
    { id: 4, icon: '🟢', colorClass: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20', iconColor: 'text-emerald-500', titleAr: 'تسجيل دخول مريض وإصدار تقرير', titleEn: 'Patient Checked-in & Evaluated', descAr: 'تم تسجيل حضور المريض سعد الله وبدء جلسة العلاج في صالة Pool 1.', descEn: 'Patient checked in successfully at Pool 1.', is_read: true }
  ])
  const isRTL = i18n.language === 'ar'
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('mcsos_token')
        const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'https://medical-center-app-production.up.railway.app'}/api/v1`
        const res = await fetch(`${API_BASE}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setNotifications(data.map((item, idx) => ({
              id: item.id || idx,
              icon: item.type === 'PACKAGE_ENDING_SOON' ? '📦' : item.type === 'CAPACITY_LIMIT_REACHED' ? '🔴' : item.type === 'PAYMENT_VERIFIED' ? '💳' : '🔔',
              colorClass: 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20',
              iconColor: 'text-indigo-500',
              titleAr: item.title,
              titleEn: item.title,
              descAr: item.message,
              descEn: item.message,
              is_read: item.is_read
            })))
          }
        }
      } catch (e) {
        console.warn('Using local notification alerts')
      }
    }
    fetchNotifications()
  }, [])

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  
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
        { to: '/admin', label: 'sidebar.admin_dashboard', icon: Shield },
        { to: '/dashboard', label: 'sidebar.hospital_dashboard', icon: Hospital },
        { to: '/reports', label: 'sidebar.reports', icon: Activity },
        { to: '/daily-followup', label: 'sidebar.daily_followup', icon: Clock },
        { to: '/patients', label: 'sidebar.patients', icon: Users },
        { to: '/doctors-manager', label: 'sidebar.doctors_manager', icon: Stethoscope },
        { to: '/doctor', label: 'sidebar.doctor', icon: Stethoscope },
        { to: '/finance', label: 'sidebar.finance', icon: DollarSign },
        { to: '/operations', label: 'sidebar.operations', icon: CalendarDays },
        { to: '/scheduling', label: 'sidebar.scheduling', icon: Clock },
        { to: '/packages', label: 'sidebar.packages', icon: Package },
        { to: '/whatsapp', label: 'sidebar.whatsapp', icon: MessageCircle },
        { to: '/invoice', label: 'sidebar.invoice', icon: FileText },
        { to: '/prescription', label: 'sidebar.prescription', icon: Pill },
        { to: '/rooms-manager', label: 'sidebar.rooms_manager', icon: DoorOpen },
        { to: '/services-manager', label: 'sidebar.services_manager', icon: Activity },
        profileItem
      ]
    } else if (userRole === 'doctor') {
      return [
        { to: '/doctor-dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/reports', label: 'sidebar.reports', icon: Activity },
        { to: '/daily-followup', label: 'sidebar.daily_followup', icon: Clock },
        { to: '/patients', label: 'sidebar.patients', icon: Users },
        { to: '/prescription', label: 'sidebar.prescription', icon: Pill },
        { to: '/scheduling', label: 'sidebar.scheduling', icon: Clock },
        { to: '/whatsapp', label: 'sidebar.whatsapp', icon: MessageCircle },
        profileItem
      ]
    } else if (userRole === 'reception') {
      return [
        { to: '/reception-dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/reports', label: 'sidebar.reports', icon: Activity },
        { to: '/daily-followup', label: 'sidebar.daily_followup', icon: Clock },
        { to: '/reception', label: 'sidebar.reception', icon: Users },
        { to: '/scheduling', label: 'sidebar.scheduling', icon: Clock },
        { to: '/patients', label: 'sidebar.patients', icon: UserCircle },
        { to: '/whatsapp', label: 'sidebar.whatsapp', icon: MessageCircle },
        profileItem
      ]
    } else if (userRole === 'user' || userRole === 'patient') {
      return [
        { to: '/patient-dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/book-appointment', label: 'sidebar.book_appointment', icon: CalendarCheck },
        { to: '/prescription', label: 'sidebar.prescription', icon: Pill },
        { to: '/appointments', label: 'sidebar.appointments', icon: Calendar },
        { to: '/whatsapp', label: 'sidebar.whatsapp', icon: MessageCircle },
        profileItem
      ]
    } else {
      return [
        { to: '/dashboard', label: 'sidebar.dashboard', icon: LayoutDashboard },
        { to: '/reports', label: 'sidebar.reports', icon: Activity },
        { to: '/daily-followup', label: 'sidebar.daily_followup', icon: Clock },
        { to: '/patients', label: 'sidebar.patients', icon: Users },
        { to: '/appointments', label: 'sidebar.appointments', icon: Calendar },
        profileItem
      ]
    }
  }
  
  const navItems = getNavItems()
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => { if (isMobile) setSidebarOpen(false) }
  
  // ========== تحديث دالة تسجيل الخروج ==========
  const handleLogout = () => {
    authService.logout() // استخدام خدمة المصادقة لتسجيل الخروج
    // authService.logout() تقوم بـ:
    // - localStorage.removeItem('mcsos_user')
    // - localStorage.removeItem('mcsos_token')
    // - localStorage.removeItem('mcsos_remember')
    // - localStorage.removeItem('mcsos_saved_email')
    // - window.location.href = '/login'
  }
  
  const getRoleName = () => {
    if (userRole === 'admin') return isRTL ? 'مدير النظام' : 'System Administrator'
    if (userRole === 'doctor') return isRTL ? 'طبيب' : 'Doctor'
    if (userRole === 'reception') return isRTL ? 'موظف استقبال' : 'Receptionist'
    if (userRole === 'user' || userRole === 'patient') return isRTL ? 'مريض' : 'Patient'
    return isRTL ? 'مستخدم' : 'User'
  }
  
  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">

        {/* زر فتح/غلق السايدبار في الموبايل */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={`fixed top-4 z-50 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-gray-700 ${isRTL ? 'right-4' : 'left-4'}`}
          >
            {sidebarOpen
              ? <X size={24} className="text-blue-600 dark:text-blue-400" />
              : <Menu size={24} className="text-blue-600 dark:text-blue-400" />
            }
          </button>
        )}

        {/* السايدبار */}
        <div className={`
          fixed top-0 z-40 h-full flex flex-col transition-all duration-300
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-md
          shadow-xl border-gray-200 dark:border-gray-700
          ${isRTL ? 'border-l right-0' : 'border-r left-0'}
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full') : 'translate-x-0'}
          ${sidebarOpen || isMobile ? 'w-80' : 'w-20'}
        `}>
          {/* Header */}
          <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'text-right' : 'text-left'} ${isMobile ? 'mt-12' : 'mt-0'} overflow-hidden whitespace-nowrap`}>
            <div className={`font-bold text-2xl flex items-center ${(!isMobile && !sidebarOpen) ? 'justify-center' : ''} h-8`}>
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                {(!isMobile && !sidebarOpen) ? t('app.title').charAt(0) : t('app.title')}
              </span>
            </div>
            <div className={`transition-opacity duration-300 ${(!isMobile && !sidebarOpen) ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                {user ? (isRTL ? user.name : user.nameEn) : t('app.name')}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium truncate">{getRoleName()}</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className={`flex-1 p-4 space-y-1 ${(!isMobile && !sidebarOpen) ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `group relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700/60 hover:text-blue-700 dark:hover:text-white'
                  }
                  ${(!isMobile && !sidebarOpen) ? 'justify-center px-0' : (isRTL ? 'flex-row-reverse gap-3' : 'flex-row gap-3')}`
                }
              >
                <item.icon size={22} className="min-w-[22px]" />
                {(!isMobile && !sidebarOpen) ? (
                  <div className={`
                    absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-full mr-3' : 'left-full ml-3'}
                    px-2.5 py-1.5 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg shadow-xl 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none
                  `}>
                    {t(item.label)}
                  </div>
                ) : (
                  <span className="whitespace-nowrap">{t(item.label)}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 flex flex-col items-center">
            {(!isMobile && !sidebarOpen) ? null : (
              <div className="grid grid-cols-2 gap-2 w-full">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className={`group relative flex items-center text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 w-full hover:bg-red-50 dark:hover:bg-red-500/10 p-3 rounded-xl transition-colors ${(!isMobile && !sidebarOpen) ? 'justify-center' : (isRTL ? 'flex-row-reverse gap-3' : 'gap-3')}`}
            >
              <LogOut size={22} className="min-w-[22px]" />
              {(!isMobile && !sidebarOpen) ? (
                <div className={`
                  absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-full mr-3' : 'left-full ml-3'}
                  px-2.5 py-1.5 bg-red-600 text-white text-xs rounded-lg shadow-xl 
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none
                `}>
                  {t('sidebar.logout')}
                </div>
              ) : (
                <span className="font-medium whitespace-nowrap">{t('sidebar.logout')}</span>
              )}
            </button>

            {/* زر طي/فرد السايدبار للشاشات الكبيرة */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className={`flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-full hover:bg-gray-100 dark:hover:bg-gray-700/60 p-3 rounded-xl transition-colors`}
                title={isRTL ? (sidebarOpen ? 'طي القائمة' : 'توسيع القائمة') : (sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar')}
              >
                {sidebarOpen ? (isRTL ? <ChevronRight size={22} /> : <ChevronLeft size={22} />) : (isRTL ? <ChevronLeft size={22} /> : <ChevronRight size={22} />)}
              </button>
            )}
          </div>
        </div>

        {/* Overlay موبايل */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={closeSidebar} />
        )}

        {/* المحتوى الرئيسي */}
        <main className={`min-h-screen transition-all duration-300 ${
          !isMobile 
            ? (isRTL 
                ? (sidebarOpen ? 'mr-80' : 'mr-20') 
                : (sidebarOpen ? 'ml-80' : 'ml-20')
              ) 
            : ''
        }`}>
          {/* Phase 14 & 15: RBAC Role Bar & Smart Notifications Center */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-2xs">
                🛡️ {getRoleName()} (RBAC: {userRole || 'admin'})
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                {isRTL ? '✨ النظام المتكامل للرقابة الطبية، السعة، وتدفق الباقات (Active Engine)' : '✨ Advanced MCSOS Healthcare Management Engine Active'}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shadow-2xs"
                title="إشعارات الرقابة العلاجية والمالية التلقائية"
              >
                <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                  </>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-fade-in`}>
                  <div className="p-3.5 bg-indigo-900 text-white font-extrabold flex justify-between items-center text-xs">
                    <span>🔔 {isRTL ? 'الإشعارات والتنبيهات التلقائية' : 'System Notifications Center'}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-500 rounded-md text-[10px]">{unreadCount} {isRTL ? 'تنبيهات' : 'Alerts'}</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] bg-indigo-800 hover:bg-indigo-700 px-1.5 py-0.5 rounded text-indigo-200 transition">
                          {isRTL ? 'تحديد كمقروء' : 'Mark read'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto font-bold text-xs text-left rtl:text-right">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 ${notif.colorClass || 'hover:bg-gray-50 dark:hover:bg-gray-800'} flex gap-3 transition cursor-pointer ${!notif.is_read ? 'bg-blue-50/20 dark:bg-blue-950/10' : 'opacity-75'}`} onClick={() => {
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
                        setShowNotifications(false)
                      }}>
                        <span className={`${notif.iconColor || 'text-indigo-500'} text-lg`}>{notif.icon || '🔔'}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="text-gray-900 dark:text-white font-extrabold">{isRTL ? notif.titleAr : notif.titleEn}</p>
                            {!notif.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-normal text-[11px] mt-0.5">{isRTL ? notif.descAr : notif.descEn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  )
}