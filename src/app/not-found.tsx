'use client';

import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/Footer';
import { Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-solarized-base3 dark:bg-solarized-base03 transition-colors">
      {/* Header */}
      <header className="bg-solarized-base2 dark:bg-solarized-base02 border-b border-solarized-base1 dark:border-solarized-base01 relative">
        <div className="absolute top-4 right-4 flex space-x-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-stone-800 dark:text-stone-100">
              <button 
                onClick={() => router.push('/')}
                className="hover:text-solarized-blue transition-colors cursor-pointer"
              >
                Noun Gender
              </button>
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-300">
              Master noun genders across languages
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-9xl font-bold text-solarized-orange mb-8">404</div>
          
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-lg text-stone-600 dark:text-stone-300 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>

          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-8 py-4 bg-solarized-blue hover:bg-solarized-blue/80 text-white rounded-lg transition-colors font-medium text-lg"
          >
            <Home className="w-6 h-6 mr-3" />
            Back to Home
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}