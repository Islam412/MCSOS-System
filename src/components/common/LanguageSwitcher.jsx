import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[1];

  const changeLanguage = (langCode, dir) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    document.documentElement.dir = dir;
    document.documentElement.lang = langCode;
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code, lang.dir)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
                {i18n.language === lang.code && <Check size={16} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
