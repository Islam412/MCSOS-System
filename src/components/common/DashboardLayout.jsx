import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, Users, DollarSign, Activity, LogOut, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import { useTheme } from '../../context/ThemeContext'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'sidebar.reception', icon: Users },
  { to: '/doctor', label: 'sidebar.doctor', icon: Activity },
  { to: '/finance', label: 'sidebar.finance', icon: DollarSign },
  { to: '/operations', label: 'sidebar.operations', icon: Calendar },
]

export default function DashboardLayout() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-100 dark:to-dark-200">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-dark-200 shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-xl">
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {t('app.title')}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex">
          {/* Sidebar - Desktop */}
          <aside className={`fixed lg:relative z-30 w-72 bg-white dark:bg-dark-200 shadow-xl flex flex-col transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            {/* Logo Area */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="font-bold text-2xl">
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  {t('app.title')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('app.name')}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{t(item.label)}</span>
                  {!navItems.find(i => i.to === item.to)?.isActive && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition">
                      <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
              <button className="flex items-center gap-3 text-red-600 dark:text-red-400 w-full hover:bg-red-50 dark:hover:bg-red-900/30 p-3 rounded-xl transition-colors">
                <LogOut size={20} />
                <span className="font-medium">{t('sidebar.logout')}</span>
              </button>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 lg:ml-0 min-h-screen">
            <div className="p-4 md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
