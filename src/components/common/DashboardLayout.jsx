import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, Users, DollarSign, Activity, LogOut, Menu, X, Clock, Package, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import { useTheme } from '../../context/ThemeContext'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/', label: 'sidebar.reception', icon: Users },
  { to: '/doctor', label: 'sidebar.doctor', icon: Activity },
  { to: '/finance', label: 'sidebar.finance', icon: DollarSign },
  { to: '/operations', label: 'sidebar.operations', icon: Calendar },
  { to: '/scheduling', label: 'sidebar.scheduling', icon: Clock },
  { to: '/packages', label: 'sidebar.packages', icon: Package },
  { to: '/whatsapp', label: 'sidebar.whatsapp', icon: MessageCircle },
]

export default function DashboardLayout() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isRTL = i18n.language === 'ar'

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // تحديث اتجاه الصفحة
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [isRTL, i18n.language])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* زر القائمة - يظهر فقط في الشاشات الصغيرة */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={`fixed top-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${isRTL ? 'right-4' : 'left-4'}`}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* السايد بار - للشاشات الصغيرة فقط يظهر ويختفي */}
        {(!isMobile || (isMobile && sidebarOpen)) && (
          <>
            <div
              className={`
                fixed top-0 z-40 h-full bg-white dark:bg-gray-800 shadow-2xl flex flex-col transition-all duration-300 ease-in-out
                ${isRTL ? 'right-0' : 'left-0'}
                w-72
              `}
              style={{
                [isRTL ? 'right' : 'left']: 0,
                top: 0,
                height: '100vh'
              }}
            >
              {/* Logo Area */}
              <div className={`p-6 border-b border-gray-100 dark:border-gray-700 ${isRTL ? 'text-right' : 'text-left'} ${isMobile ? 'mt-12' : 'mt-0'}`}>
                <div className="font-bold text-2xl">
                  <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                    {t('app.title')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('app.name')}</p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${isRTL ? 'flex-row-reverse' : ''}`
                    }
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{t(item.label)}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Bottom Section */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>
                <button 
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 text-red-600 dark:text-red-400 w-full hover:bg-red-50 dark:hover:bg-red-900/30 p-3 rounded-xl transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <LogOut size={20} />
                  <span className="font-medium">{t('sidebar.logout')}</span>
                </button>
              </div>
            </div>

            {/* Overlay للشاشات الصغيرة */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/50 z-30"
                onClick={closeSidebar}
              />
            )}
          </>
        )}

        {/* المحتوى الرئيسي */}
        <main 
          className={`
            min-h-screen transition-all duration-300
            ${!isMobile && !isRTL ? 'lg:ml-72' : ''}
            ${!isMobile && isRTL ? 'lg:mr-72' : ''}
          `}
        >
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
