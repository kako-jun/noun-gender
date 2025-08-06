'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalWords: number;
  totalTranslations: number;
  multilingualTerms: number;
  searchLanguages: number;
  languageStats: { language: string; count: number }[];
}

export function StatsHeader() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-wrap justify-center gap-3 text-sm text-stone-600 dark:text-stone-400">
        {/* "4,541 words" = ~90px */}
        <span className="bg-stone-200/60 dark:bg-stone-700/60 rounded-full animate-pulse px-3 py-1" style={{width: '90px', height: '28px'}}></span>
        {/* "30,362+ translations" = ~155px */}
        <span className="bg-stone-200/60 dark:bg-stone-700/60 rounded-full animate-pulse px-3 py-1" style={{width: '155px', height: '28px'}}></span>
        {/* "8 languages" = ~95px */}
        <span className="bg-stone-200/60 dark:bg-stone-700/60 rounded-full animate-pulse px-3 py-1" style={{width: '95px', height: '28px'}}></span>
        {/* "Multilingual search" = ~135px */}
        <span className="bg-stone-200/60 dark:bg-stone-700/60 rounded-full animate-pulse px-3 py-1" style={{width: '135px', height: '28px'}}></span>
      </div>
    );
  }

  const { totalWords, totalTranslations, multilingualTerms, languageStats } = stats;
  const languageCount = languageStats.length;

  return (
    <div className="flex flex-wrap justify-center gap-3 text-sm text-stone-600 dark:text-stone-400">
      <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
        {totalWords.toLocaleString()} words
      </span>
      <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
        {totalTranslations.toLocaleString()}+ translations
      </span>
      <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
        {languageCount} languages
      </span>
      <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
        Multilingual search
      </span>
    </div>
  );
}