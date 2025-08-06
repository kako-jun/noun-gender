'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: '/', description: 'Focus search input' },
    { key: 'Ctrl + K', description: 'Focus search input' },
    { key: 'Esc', description: 'Clear search' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="
          p-2 rounded-full transition-all duration-300 transform hover:scale-110
          bg-stone-200 hover:bg-stone-300 shadow-md hover:shadow-lg
          dark:bg-stone-700 dark:hover:bg-stone-600
          text-stone-700 dark:text-stone-200
        "
        title="Keyboard shortcuts"
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
            <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-6 m-4 max-w-md w-full shadow-xl border border-stone-200 dark:border-stone-700 pointer-events-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 bg-stone-200 dark:bg-stone-600 text-stone-800 dark:text-stone-200 rounded text-sm font-mono">
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