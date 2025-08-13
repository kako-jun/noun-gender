'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz } from '@/components/Quiz';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { VoiceSelector } from '@/components/VoiceSelector';
import { Footer } from '@/components/Footer';

export default function QuizPage() {
  const [showQuiz, setShowQuiz] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setShowQuiz(false);
    router.replace('/');
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
              Noun Gender Quiz
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-300 mb-3">
              Test your knowledge of noun genders
            </p>
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