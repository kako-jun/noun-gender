'use client';

import { Home, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-solarized-base2 dark:bg-solarized-base02 border-t border-solarized-base1 dark:border-solarized-base01">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a 
              href="https://llll-ll.com"
              className="flex items-center space-x-2 text-stone-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Home className="w-4 h-4" />
              <span>llll-ll.com</span>
            </a>
            
            <div className="text-sm text-stone-500 dark:text-stone-400">
              © 2025 kako-jun
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="/about"
              className="flex items-center space-x-1 text-stone-600 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}