import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <Globe size={18} />
        <span className="text-sm">{languages.find(l => l.code === i18n.language)?.flag}</span>
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
              i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''
            }`}
          >
            <span>{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
