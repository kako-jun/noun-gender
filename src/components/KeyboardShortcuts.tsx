'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useTranslations } from '@/contexts/TranslationsContext';

export function KeyboardShortcuts() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: '/', description: t('shortcuts.focusSearch') },
    { key: 'Esc', description: t('shortcuts.clearSearch') },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="
          w-9 h-9 flex items-center justify-center flex-shrink-0
          rounded-full transition-all duration-300 transform hover:scale-105
          bg-solarized-base3 hover:bg-solarized-base1 shadow-sm hover:shadow-md border border-solarized-base1
          dark:bg-solarized-base03 dark:hover:bg-solarized-base01 dark:border-solarized-base01
          text-solarized-base01 hover:text-solarized-base3 dark:text-solarized-base1 dark:hover:text-solarized-base03
        "
        title={t('shortcuts.title')}
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-50" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-2xl p-6 m-4 max-w-md w-full shadow-xl border border-solarized-base1 dark:border-solarized-base01 pointer-events-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-solarized-base01 dark:text-solarized-base1">
                  {t('shortcuts.title')}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-solarized-base00 hover:text-solarized-base01 dark:text-solarized-base0 dark:hover:text-solarized-base1 p-1 rounded-full hover:bg-solarized-base2 dark:hover:bg-solarized-base02 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-solarized-base00 dark:text-solarized-base0">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 bg-solarized-base3 dark:bg-solarized-base03 text-solarized-base01 dark:text-solarized-base1 rounded text-sm font-mono border border-solarized-base1 dark:border-solarized-base01">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}