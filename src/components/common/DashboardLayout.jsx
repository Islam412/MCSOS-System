import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, Users, DollarSign, Activity, LogOut, Menu, X, Clock, Package, MessageCircle, FileText } from 'lucide-react'
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
  { to: '/prescription', label: 'sidebar.prescription', icon: FileText },
]

export default function DashboardLayout() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isRTL = i18n.language === 'ar'

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => setMobileMenuOpen(!mobileMenuOpen)
  const closeSidebar = () => setMobileMenuOpen(false)

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-gray-900`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* زر القائمة للشاشات الصغيرة */}
        {mobileMenuOpen && (
          <button onClick={toggleSidebar} className={`fixed top-4 z-50 p-3 rounded-xl bg-gray-800/80 backdrop-blur-md shadow-lg ${isRTL ? 'right-4' : 'left-4'}`}>
            <X size={24} className="text-blue-400" />
          </button>
        )}
        {!mobileMenuOpen && (
          <button onClick={toggleSidebar} className={`fixed top-4 z-50 p-3 rounded-xl bg-gray-800/80 backdrop-blur-md shadow-lg lg:hidden ${isRTL ? 'right-4' : 'left-4'}`}>
            <Menu size={24} className="text-blue-400" />
          </button>
        )}

        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed lg:relative z-40 h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl flex flex-col transition-all duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isRTL ? 'right-0' : 'left-0'} w-72`}>
            <div className={`p-6 border-b border-blue-500/20 ${isRTL ? 'text-right' : 'text-left'} ${mobileMenuOpen ? 'mt-12' : 'mt-0'}`}>
              <div className="font-bold text-2xl"><span className="gradient-text">{t('app.title')}</span></div>
              <p className="text-xs text-gray-400 mt-2">{t('app.name')}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={closeSidebar} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <item.icon size={20} className="icon-glow" />
                  <span className="font-medium">{t(item.label)}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-blue-500/20 space-y-3">
              <div className="grid grid-cols-2 gap-3"><LanguageSwitcher /><ThemeSwitcher /></div>
              <button className={`flex items-center gap-3 text-red-400 hover:text-red-300 w-full hover:bg-red-500/10 p-3 rounded-xl transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                <LogOut size={20} className="icon-glow" />
                <span className="font-medium">{t('sidebar.logout')}</span>
              </button>
            </div>
          </div>

          {/* Overlay للشاشات الصغيرة */}
          {mobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={closeSidebar} />}

          {/* المحتوى الرئيسي */}
          <main className={`flex-1 min-h-screen w-full transition-all duration-300 ${!mobileMenuOpen && !isRTL ? 'lg:ml-72' : ''} ${!mobileMenuOpen && isRTL ? 'lg:mr-72' : ''}`}>
            <div className="p-4 md:p-8"><Outlet /></div>
          </main>
        </div>
      </div>
    </div>
  )
}
