import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationAR from './locales/ar/translation.json'
import translationEN from './locales/en/translation.json'
import translationFR from './locales/fr/translation.json'

const resources = {
  ar: { translation: translationAR },
  en: { translation: translationEN },
  fr: { translation: translationFR },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

// تحسين RTL للغة العربية
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar'
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
  document.documentElement.classList.toggle('rtl', isRTL)
  document.documentElement.classList.toggle('ltr', !isRTL)
  
  if (isRTL) {
    document.body.style.direction = 'rtl'
    document.body.style.textAlign = 'right'
  } else {
    document.body.style.direction = 'ltr'
    document.body.style.textAlign = 'left'
  }
})

// تعيين اللغة الأولية
const savedLanguage = localStorage.getItem('language') || 'ar'
if (savedLanguage === 'ar') {
  document.documentElement.dir = 'rtl'
  document.documentElement.classList.add('rtl')
  document.body.style.direction = 'rtl'
  document.body.style.textAlign = 'right'
}

export default i18n
