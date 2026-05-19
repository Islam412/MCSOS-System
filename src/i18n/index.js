import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationAR from './locales/ar/translation.json'
import translationEN from './locales/en/translation.json'
import translationFR from './locales/fr/translation.json'

const resources = {
  ar: { translation: translationAR },
  en: { translation: translationEN },
  fr: { translation: translationFR }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  })

// تحديث اتجاه الصفحة حسب اللغة
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar'
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
  document.body.style.direction = isRTL ? 'rtl' : 'ltr'
  document.body.style.textAlign = isRTL ? 'right' : 'left'
})

export default i18n
