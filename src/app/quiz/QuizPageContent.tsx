'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz } from '@/components/Quiz';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { VoiceSelector } from '@/components/VoiceSelector';
import { Footer } from '@/components/Footer';
import { StatsHeader } from '@/components/StatsHeader';
import { useTranslations } from '@/hooks/useTranslations';
import { Info } from 'lucide-react';

export default function QuizPageContent() {
  const [showQuiz, setShowQuiz] = useState(true);
  const router = useRouter();
  const { t, isLoading: translationsLoading } = useTranslations();

  const handleClose = () => {
    setShowQuiz(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-solarized-base3 dark:bg-solarized-base03 transition-colors">
      {/* Header */}
      <header className="bg-solarized-base2 dark:bg-solarized-base02 border-b border-solarized-base1 dark:border-solarized-base01 relative">
        {/* VoiceSelectorを左上に配置 */}
        <div className="absolute top-4 left-4">
          <VoiceSelector onVoiceGenderChange={() => {}} />
        </div>

        {/* ボタン群を右上に配置 */}
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
            <p className="text-lg text-stone-600 dark:text-stone-300 mb-3">
              {translationsLoading ? 'Master noun genders across languages' : t('header.subtitle')}
              {!translationsLoading && (
                <span className="mx-2 text-stone-500 dark:text-stone-400">|</span>
              )}
              <a 
                href="/about" 
                className="inline-flex items-center space-x-1 text-sm text-stone-500 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Info className="w-3 h-3" />
                <span>About</span>
              </a>
            </p>
            <StatsHeader />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        {showQuiz && (
          <Quiz onClose={handleClose} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}