'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import { i18nConfig } from '../../../i18nConfig';

export default function LanguageSelector() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current locale from pathname
  const getCurrentLocale = () => {
    const pathSegments = pathname.split('/');
    const localeSegment = pathSegments[1];
    return i18nConfig.locales.includes(localeSegment as typeof i18nConfig.locales[number]) ? localeSegment : i18nConfig.defaultLocale;
  };

  const currentLocale = getCurrentLocale();

  // Handle language change
  const handleLanguageChange = (locale: typeof i18nConfig.locales[number]) => {
    const pathSegments = pathname.split('/');
    const firstSegmentIsLocale = i18nConfig.locales.includes(pathSegments[1] as typeof i18nConfig.locales[number]);
    if (firstSegmentIsLocale) {
      pathSegments[1] = locale;
    } else {
      pathSegments.splice(1, 0, locale);
    }
    const newPath = pathSegments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get language name based on locale
  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'en':
        return t('english');
      case 'ja':
        return t('japanese');
      case 'fr':
        return t('french');
      default:
        return locale;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-gray-600 dark:text-gray-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {getLanguageName(currentLocale)}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              {t('language')}
            </div>
            {i18nConfig.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLocale === locale
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                {getLanguageName(locale)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
