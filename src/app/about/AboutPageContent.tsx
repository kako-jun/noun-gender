'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { VoiceSelector } from '@/components/VoiceSelector';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useTranslations } from '@/hooks/useTranslations';
import { Heart, Github, Coffee, Shield, Database, Lightbulb } from 'lucide-react';

function AboutContent() {
  const { t } = useTranslations();
  const router = useRouter();

  // 改行文字を<br>タグに変換するヘルパー関数
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-solarized-base3 dark:bg-solarized-base03 transition-colors">
      {/* Header */}
      <header className="bg-solarized-base2 dark:bg-solarized-base02 border-b border-solarized-base1 dark:border-solarized-base01 relative">
        <div className="absolute top-4 left-4">
          <VoiceSelector onVoiceGenderChange={() => {}} />
        </div>

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
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-2xl shadow-lg border border-solarized-base1 dark:border-solarized-base01 p-8 space-y-8">
          
          {/* サイト概要 */}
          <section>
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-solarized-blue mr-2" />
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {t('about.overview.title')}
              </h2>
            </div>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              {formatText(t('about.overview.description'))}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-solarized-base3 dark:bg-solarized-base03 rounded-lg p-3">
                <div className="text-2xl font-bold text-solarized-blue">4,600+</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">{t('about.stats.words')}</div>
              </div>
              <div className="bg-solarized-base3 dark:bg-solarized-base03 rounded-lg p-3">
                <div className="text-2xl font-bold text-solarized-orange">8</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">{t('about.stats.languages')}</div>
              </div>
              <div className="bg-solarized-base3 dark:bg-solarized-base03 rounded-lg p-3">
                <div className="text-2xl font-bold text-solarized-orange">11</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">{t('about.stats.ui_languages')}</div>
              </div>
              <div className="bg-solarized-base3 dark:bg-solarized-base03 rounded-lg p-3">
                <div className="text-2xl font-bold text-solarized-green">100%</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">{t('about.stats.free')}</div>
              </div>
            </div>
          </section>

          {/* 制作理由 */}
          <section>
            <div className="flex items-center mb-4">
              <Lightbulb className="w-6 h-6 text-solarized-yellow mr-2" />
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {t('about.purpose.title')}
              </h2>
            </div>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              {formatText(t('about.purpose.description'))}
            </p>
          </section>

          {/* 免責事項 */}
          <section>
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-solarized-orange mr-2" />
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {t('about.disclaimer.title')}
              </h2>
            </div>
            <ul className="text-stone-600 dark:text-stone-300 space-y-2 list-disc list-inside">
              <li>
                {t('about.disclaimer.accuracy')}
              </li>
              <li>
                {t('about.disclaimer.responsibility')}
              </li>
              <li>
                {t('about.disclaimer.liability')}
              </li>
            </ul>
          </section>

          {/* オープンソース */}
          <section>
            <div className="flex items-center mb-4">
              <Github className="w-6 h-6 text-stone-600 dark:text-stone-300 mr-2" />
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {t('about.opensource.title')}
              </h2>
            </div>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              {formatText(t('about.opensource.description'))}
            </p>
            <a 
              href="https://github.com/kako-jun/noun-gender" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-stone-600 hover:bg-stone-700 dark:bg-stone-500 dark:hover:bg-stone-600 text-white rounded-lg transition-colors font-medium"
            >
              <Github className="w-4 h-4 mr-2" />
              {t('about.opensource.button')}
            </a>
          </section>

          {/* サポート・寄付 */}
          <section className="bg-gradient-to-r from-solarized-base3 to-solarized-base2 dark:from-solarized-base03 dark:to-solarized-base02 rounded-lg p-6 border-l-4 border-solarized-blue">
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-solarized-red mr-2" />
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {t('about.support.title')}
              </h2>
            </div>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              {formatText(t('about.support.description'))}
            </p>
            <a 
              href="https://github.com/sponsors/kako-jun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-solarized-blue hover:bg-solarized-blue/80 text-white rounded-lg transition-colors font-medium"
            >
              <Coffee className="w-4 h-4 mr-2" />
              {t('about.support.button')}
            </a>
          </section>

        </div>
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default function AboutPageContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutContent />
    </Suspense>
  );
}