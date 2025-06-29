'use client';

import { Home } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a 
              href="https://llll-ll.com"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Home className="w-4 h-4" />
              <span>llll-ll.com</span>
            </a>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2025 kako-jun - Learn noun genders across languages
          </div>
        </div>
      </div>
    </footer>
  );
}