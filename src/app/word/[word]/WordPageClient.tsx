'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { VoiceSelector } from '@/components/VoiceSelector';
import { AudioButton } from '@/components/AudioButton';
import { CopyButton } from '@/components/CopyButton';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useTranslations } from '@/hooks/useTranslations';
import { getGenderStyle } from '@/utils/genderStyles';
import { SUPPORTED_LANGUAGES } from '@/types';
import type { WordData } from '@/lib/db';
import { Info, ArrowLeft } from 'lucide-react';

interface Props {
  wordData: WordData;
}

export default function WordPageClient({ wordData }: Props) {
  const router = useRouter();
  const { t, locale, isLoading: translationsLoading } = useTranslations();

  const getMeaning = () => {
    if (wordData.meanings) {
      return wordData.meanings[locale] || wordData.meanings['en'] || wordData.meaning_en;
    }
    return wordData.meaning_en;
  };

  const getMemoryTrick = (translation: (typeof wordData.translations)[0]): string | null => {
    switch (locale) {
      case 'ja':
        return translation.memory_trick_ja || null;
      case 'zh':
        return translation.memory_trick_zh || null;
      case 'fr':
        return translation.memory_trick_fr || null;
      case 'de':
        return translation.memory_trick_de || null;
      case 'es':
        return translation.memory_trick_es || null;
      case 'it':
        return translation.memory_trick_it || null;
      case 'pt':
        return translation.memory_trick_pt || null;
      case 'ru':
        return translation.memory_trick_ru || null;
      case 'ar':
        return translation.memory_trick_ar || null;
      case 'hi':
        return translation.memory_trick_hi || null;
      default:
        return translation.memory_trick_en || translation.memory_trick_ja || null;
    }
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
            <p className="text-lg text-stone-600 dark:text-stone-300 mb-3">
              {translationsLoading ? 'Master noun genders across languages' : t('header.subtitle')}
              <span className="mx-2 text-stone-500 dark:text-stone-400">|</span>
              <a
                href="/about"
                className="inline-flex items-center space-x-1 text-sm text-stone-500 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Info className="w-3 h-3" />
                <span>About</span>
              </a>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-solarized-base00 dark:text-solarized-base0 hover:text-solarized-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{translationsLoading ? 'Back' : t('common.back') || 'Back'}</span>
        </button>

        {/* Word Header */}
        <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-solarized-base01 dark:text-solarized-base1 mb-2">
            {wordData.english}
          </h2>
          {getMeaning() && (
            <p className="text-lg text-solarized-base00 dark:text-solarized-base0">{getMeaning()}</p>
          )}
        </div>

        {/* Translations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-solarized-base01 dark:text-solarized-base1 mb-4">
            {translationsLoading ? 'Translations' : t('word.translations') || 'Translations'}
          </h3>

          {wordData.translations.map((translation, index) => {
            const memoryTrick = getMemoryTrick(translation);

            return (
              <div
                key={`${translation.language}-${index}`}
                className="relative bg-solarized-base3 dark:bg-solarized-base03 rounded-lg overflow-hidden border border-solarized-base2 dark:border-solarized-base02"
              >
                {/* Gender background */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={getGenderStyle(translation.gender)}
                ></div>

                {/* Gender symbol */}
                <div className="absolute top-1/2 transform -translate-y-1/2 right-0 pointer-events-none select-none">
                  <Image
                    src={`/images/gender-${translation.gender}-white.webp`}
                    alt={`${translation.gender === 'm' ? 'Male' : translation.gender === 'f' ? 'Female' : 'Neuter'} gender symbol`}
                    width={80}
                    height={80}
                    className="opacity-40"
                  />
                </div>

                {/* Content */}
                <div className="relative p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-solarized-base00 dark:text-solarized-base0 w-20">
                        {SUPPORTED_LANGUAGES[translation.language as keyof typeof SUPPORTED_LANGUAGES]}
                      </span>
                      <span className="font-semibold text-xl text-solarized-base01 dark:text-solarized-base1">
                        {translation.translation}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mr-16">
                      <AudioButton
                        text={translation.translation}
                        language={translation.language}
                        size="normal"
                      />
                      <CopyButton text={translation.translation} />
                    </div>
                  </div>

                  {/* Memory trick */}
                  {memoryTrick && (
                    <div className="mt-3 pt-3 border-t border-solarized-base1/20 dark:border-solarized-base01/20">
                      <p className="text-sm text-solarized-base00 dark:text-solarized-base0 italic">
                        💡 {memoryTrick}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Example */}
        {wordData.example && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-solarized-base01 dark:text-solarized-base1 mb-4">
              {translationsLoading ? 'Example' : t('word.example') || 'Example'}
            </h3>
            <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-lg p-4">
              <p className="text-solarized-base01 dark:text-solarized-base1 font-medium mb-2">
                {wordData.example.example_en}
              </p>
              {wordData.example.example_translations &&
                Object.entries(wordData.example.example_translations).length > 0 && (
                  <div className="space-y-1 text-sm text-solarized-base00 dark:text-solarized-base0">
                    {Object.entries(wordData.example.example_translations).map(([lang, text]) => (
                      <p key={lang}>
                        <span className="font-medium">{lang.toUpperCase()}:</span> {text}
                      </p>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Navigation to search/browse */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/search')}
            className="px-6 py-2 bg-solarized-blue text-white rounded-lg hover:bg-solarized-blue/80 transition-colors"
          >
            {translationsLoading ? 'Search' : t('tabs.search') || 'Search'}
          </button>
          <button
            onClick={() => router.push('/browse')}
            className="px-6 py-2 bg-solarized-base1 text-solarized-base3 dark:bg-solarized-base01 dark:text-solarized-base03 rounded-lg hover:opacity-80 transition-colors"
          >
            {translationsLoading ? 'Browse A-Z' : t('tabs.browse') || 'Browse A-Z'}
          </button>
        </div>
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
