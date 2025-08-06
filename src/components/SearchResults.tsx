'use client';

import type { SearchResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { AudioButton } from './AudioButton';
import { CopyButton } from './CopyButton';
import { useTranslations } from '@/hooks/useTranslations';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  mode?: 'browse' | 'search';
}

export function SearchResults({ 
  results, 
  isLoading, 
  showLoadMore = false, 
  onLoadMore, 
  mode = 'search' 
}: SearchResultsProps) {
  const { t } = useTranslations();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (results.length === 0) {
    if (mode === 'browse') {
      return (
        <div className="text-center py-8 text-stone-500 dark:text-stone-400">
          <p>Loading dictionary entries...</p>
        </div>
      );
    }
    return (
      <div className="text-center py-8 text-stone-500 dark:text-stone-400">
        <p className="whitespace-pre-line">{t('search.noResultsFound')}</p>
      </div>
    );
  }

  const getGenderStyle = (gender: string) => {
    switch (gender) {
      case 'm': return 'bg-gradient-to-r from-transparent via-transparent to-blue-500 dark:to-blue-600';
      case 'f': return 'bg-gradient-to-r from-transparent via-transparent to-pink-500 dark:to-pink-600';
      case 'n': return 'bg-gradient-to-r from-transparent via-transparent to-gray-500 dark:to-gray-600';
      default: return 'bg-gradient-to-r from-transparent via-transparent to-gray-500 dark:to-gray-600';
    }
  };

  const getGenderSymbol = (gender: string) => {
    switch (gender) {
      case 'm': return '♂';
      case 'f': return '♀';
      case 'n': return '⚲';
      default: return '?';
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">Found {results.length} results</p>
      
      {results.map((result, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {result.english || result.word?.word_en}
          </h3>
          
          <div className="grid gap-3">
            {result.translations.map((translation, tIndex) => (
              <div key={tIndex} className="relative bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors overflow-hidden">
                {/* Gender background - spans full container */}
                <div className={`absolute inset-0 ${getGenderStyle(translation.gender)} opacity-30`}></div>
                
                {/* Gender symbol - large background text */}
                <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none select-none ${
                  translation.gender === 'n' ? 'right-5 -translate-x-px' : 'right-2'
                }`}>
                  <span className="text-white text-6xl font-bold opacity-40" aria-hidden="true">
                    {getGenderSymbol(translation.gender)}
                  </span>
                </div>
                
                {/* Screen reader only gender info */}
                <span className="sr-only">
                  性別: {translation.gender === 'm' ? '男性' : translation.gender === 'f' ? '女性' : '中性'}
                </span>
                
                {/* Main content */}
                <div className="relative flex items-center justify-between p-3">
                  <div className="flex items-center space-x-6">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">
                      {SUPPORTED_LANGUAGES[translation.language as keyof typeof SUPPORTED_LANGUAGES]}
                    </span>
                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">{translation.translation}</span>
                  </div>
                  
                  <div className="flex items-center mr-16">
                    <div className="w-8 flex justify-center">
                      <AudioButton 
                        text={translation.translation} 
                        language={translation.language}
                      />
                    </div>
                    <div className="w-8 flex justify-center ml-3">
                      <CopyButton 
                        text={translation.translation}
                        label={translation.translation}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Load More Button for Browse Mode */}
      {showLoadMore && onLoadMore && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'もっと見る'}
          </button>
        </div>
      )}
    </div>
  );
}