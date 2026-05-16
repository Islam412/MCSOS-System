import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const isRTL = i18n.language === 'ar'

  const themes = [
    { value: 'light', icon: Sun, labelAr: 'فاتح', labelEn: 'Light', color: 'text-yellow-500' },
    { value: 'dark', icon: Moon, labelAr: 'داكن', labelEn: 'Dark', color: 'text-purple-500' },
    { value: 'system', icon: Monitor, labelAr: 'النظام', labelEn: 'System', color: 'text-blue-500' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  const CurrentIcon = currentTheme.icon
  const currentLabel = isRTL ? currentTheme.labelAr : currentTheme.labelEn

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 w-full"
      >
        <CurrentIcon size={18} className={currentTheme.color} />
        <span className="text-sm font-medium">{currentLabel}</span>
      </button>

      {isOpen && (
        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} bottom-full mb-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50`}>
          {themes.map((t) => {
            const Icon = t.icon
            const label = isRTL ? t.labelAr : t.labelEn
            return (
              <button
                key={t.value}
                onClick={() => changeTheme(t.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  theme === t.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Icon size={16} className={t.color} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
