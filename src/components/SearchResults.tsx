'use client';

import type { SearchResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No results found. Try searching for a word like "cat", "house", or "book".</p>
      </div>
    );
  }

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'm': return 'bg-blue-100 text-blue-800';
      case 'f': return 'bg-pink-100 text-pink-800';
      case 'n': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderSymbol = (gender: string) => {
    switch (gender) {
      case 'm': return '♂';
      case 'f': return '♀';
      case 'n': return '○';
      default: return '?';
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Found {results.length} results</p>
      
      {results.map((result, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{result.word.word_en}</h3>
          
          <div className="grid gap-3">
            {result.translations.map((translation, tIndex) => (
              <div key={tIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-16">
                    {SUPPORTED_LANGUAGES[translation.language as keyof typeof SUPPORTED_LANGUAGES]}
                  </span>
                  <span className="font-semibold text-lg">{translation.translation}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(translation.gender)}`}>
                    {getGenderSymbol(translation.gender)} {translation.gender.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}