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
    // Static fallback while loading
    return (
      <div className="flex flex-wrap justify-center gap-3 text-sm text-stone-600 dark:text-stone-400">
        <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
          4,541 words
        </span>
        <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
          9,860+ translations
        </span>
        <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
          8 languages
        </span>
        <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
          Multilingual search
        </span>
      </div>
    );
  }

  const { totalWords, totalTranslations, multilingualTerms, searchLanguages, languageStats } = stats;
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
        {searchLanguages} search languages
      </span>
      <span className="bg-stone-200/60 dark:bg-stone-700/60 px-3 py-1 rounded-full">
        {multilingualTerms}+ search terms
      </span>
    </div>
  );
}