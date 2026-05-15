import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, Users, DollarSign, Activity, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import { useTheme } from '../../context/ThemeContext'

const navItems = [
  { to: '/', label: 'sidebar.reception', icon: Users },
  { to: '/doctor', label: 'sidebar.doctor', icon: Activity },
  { to: '/finance', label: 'sidebar.finance', icon: DollarSign },
  { to: '/operations', label: 'sidebar.operations', icon: Calendar },
]

export default function DashboardLayout() {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-dark-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-dark-200 shadow-md flex flex-col">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="font-bold text-xl">
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                {t('app.title')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('app.name')}</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="font-medium">{t(item.label)}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <button className="flex items-center gap-3 text-red-600 dark:text-red-400 w-full hover:bg-red-50 dark:hover:bg-red-900/50 p-2.5 rounded-lg transition-colors">
              <LogOut size={18} /> {t('sidebar.logout')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
