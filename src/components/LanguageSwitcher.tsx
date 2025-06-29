'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useTranslations } from '@/hooks/useTranslations';

export function LanguageSwitcher() {
  const { locale: currentLocale, changeLanguage, isLoading } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (locale: Locale) => {
    setIsOpen(false);
    await changeLanguage(locale);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-2 rounded-lg transition-colors
          bg-gray-200 hover:bg-gray-300
          dark:bg-gray-700 dark:hover:bg-gray-600
          text-gray-800 dark:text-gray-200
          flex items-center space-x-1
        "
        title="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{localeFlags[currentLocale]}</span>
      </button>

      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* ドロップダウンメニュー */}
          <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 min-w-48">
            <div className="py-1">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => handleLanguageChange(locale)}
                  disabled={isLoading}
                  className={`
                    w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                    ${currentLocale === locale ? 'bg-blue-50 dark:bg-blue-900' : ''}
                  `}
                >
                  <span className="text-lg">{localeFlags[locale]}</span>
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {localeNames[locale]}
                  </span>
                  {currentLocale === locale && (
                    <span className="ml-auto text-blue-500 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}