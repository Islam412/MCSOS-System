// src/components/common/PhoneInputWithCountry.jsx
import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Phone, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const COUNTRIES = [
  { code: 'EG', dial: '+20', flag: '🇪🇬', nameAr: 'مصر', nameEn: 'Egypt', example: '100 123 4567' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', nameAr: 'السعودية', nameEn: 'Saudi Arabia', example: '50 123 4567' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', nameAr: 'الإمارات', nameEn: 'UAE', example: '50 123 4567' },
  { code: 'KW', dial: '+965', flag: '🇰🇼', nameAr: 'الكويت', nameEn: 'Kuwait', example: '50 123 456' },
  { code: 'QA', dial: '+974', flag: '🇶🇦', nameAr: 'قطر', nameEn: 'Qatar', example: '50 123 456' },
  { code: 'OM', dial: '+968', flag: '🇴🇲', nameAr: 'عُمان', nameEn: 'Oman', example: '90 123 456' },
  { code: 'BH', dial: '+973', flag: '🇧🇭', nameAr: 'البحرين', nameEn: 'Bahrain', example: '30 123 456' },
  { code: 'JO', dial: '+962', flag: '🇯🇴', nameAr: 'الأردن', nameEn: 'Jordan', example: '79 123 4567' },
  { code: 'SY', dial: '+963', flag: '🇸🇾', nameAr: 'سوريا', nameEn: 'Syria', example: '93 123 4567' },
  { code: 'LB', dial: '+961', flag: '🇱🇧', nameAr: 'لبنان', nameEn: 'Lebanon', example: '70 123 456' },
  { code: 'IQ', dial: '+964', flag: '🇮🇶', nameAr: 'العراق', nameEn: 'Iraq', example: '770 123 4567' },
  { code: 'PS', dial: '+970', flag: '🇵🇸', nameAr: 'فلسطين', nameEn: 'Palestine', example: '59 123 4567' },
  { code: 'YE', dial: '+967', flag: '🇾🇪', nameAr: 'اليمن', nameEn: 'Yemen', example: '77 123 4567' },
  { code: 'SD', dial: '+249', flag: '🇸🇩', nameAr: 'السودان', nameEn: 'Sudan', example: '91 123 4567' },
  { code: 'LY', dial: '+218', flag: '🇱🇾', nameAr: 'ليبيا', nameEn: 'Libya', example: '91 123 4567' },
  { code: 'TN', dial: '+216', flag: '🇹🇳', nameAr: 'تونس', nameEn: 'Tunisia', example: '20 123 456' },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', nameAr: 'الجزائر', nameEn: 'Algeria', example: '55 123 4567' },
  { code: 'MA', dial: '+212', flag: '🇲🇦', nameAr: 'المغرب', nameEn: 'Morocco', example: '60 123 4567' },
  { code: 'US', dial: '+1', flag: '🇺🇸', nameAr: 'أمريكا / كندا', nameEn: 'USA / Canada', example: '555 123 4567' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', nameAr: 'بريطانيا', nameEn: 'UK', example: '7911 123456' },
]

export default function PhoneInputWithCountry({
  value = '',
  onChange,
  defaultCountry = 'EG',
  placeholder,
  className = '',
  id,
  disabled = false,
}) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Parse initial value to extract country code and local number
  const findCountryFromValue = (val) => {
    if (!val) return COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
    const matched = COUNTRIES.slice()
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => val.startsWith(c.dial))
    return matched || COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
  }

  const [selectedCountry, setSelectedCountry] = useState(() => findCountryFromValue(value))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  // Extract pure national digits from value
  const getNationalNumber = (fullVal, country) => {
    if (!fullVal) return ''
    if (fullVal.startsWith(country.dial)) {
      return fullVal.slice(country.dial.length).replace(/[^0-9]/g, '')
    }
    return fullVal.replace(/[^0-9]/g, '')
  }

  const [localNumber, setLocalNumber] = useState(() => getNationalNumber(value, selectedCountry))

  // Sync state if external value changes
  useEffect(() => {
    const c = findCountryFromValue(value)
    setSelectedCountry(c)
    setLocalNumber(getNationalNumber(value, c))
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setDropdownOpen(false)
    setSearchQuery('')
    const combined = localNumber ? `${country.dial} ${localNumber}` : ''
    onChange?.(combined, { countryCode: country.code, dialCode: country.dial, localNumber })
  }

  const handleNumberChange = (e) => {
    // Strictly strip non-digits
    const rawVal = e.target.value.replace(/[^0-9]/g, '')
    setLocalNumber(rawVal)
    const combined = rawVal ? `${selectedCountry.dial} ${rawVal}` : ''
    onChange?.(combined, {
      countryCode: selectedCountry.code,
      dialCode: selectedCountry.dial,
      localNumber: rawVal,
    })
  }

  const handleKeyDown = (e) => {
    // Allow navigation, deletion, copy/paste, etc.
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]
    if (
      allowedKeys.includes(e.key) ||
      (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) ||
      (e.metaKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
    ) {
      return
    }
    // Block non-digit keys
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.nameAr.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
    )
  })

  return (
    <div className={`relative flex items-center dir-ltr ${className}`} ref={dropdownRef}>
      {/* Country Selector Dropdown Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-l-xl text-xs font-semibold text-gray-700 dark:text-gray-200 transition shrink-0 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title={isRTL ? selectedCountry.nameAr : selectedCountry.nameEn}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200">
          {selectedCountry.dial}
        </span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {/* Number Input Field (Strictly Digits Only) */}
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        value={localNumber}
        onChange={handleNumberChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || selectedCountry.example}
        className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-xl text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider transition"
      />

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 max-h-64 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 p-1.5">
          {/* Search box inside dropdown */}
          <div className="p-1 mb-1 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'بحث عن دولة أو كود...' : 'Search country...'}
              className="w-full p-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-0.5">
            {filteredCountries.map((country) => {
              const isSelected = country.code === selectedCountry.code
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span className="truncate max-w-[120px]">
                      {isRTL ? country.nameAr : country.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
                      {country.dial}
                    </span>
                    {isSelected && <Check size={12} className="text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </button>
              )
            })}
            {filteredCountries.length === 0 && (
              <div className="p-3 text-center text-xs text-gray-400">
                {isRTL ? 'لا توجد نتائج' : 'No countries found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
