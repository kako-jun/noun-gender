'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';
import { KeyboardShortcuts } from './KeyboardShortcuts';

interface SearchBoxProps {
  onSearch: (query: string, languages: string[]) => void;
  isLoading: boolean;
  translations?: {
    placeholder?: string;
    languagesOptional?: string;
    searchButton?: string;
    searching?: string;
  };
}

export interface SearchBoxRef {
  focus: () => void;
  clear: () => void;
}

export const SearchBox = forwardRef<SearchBoxRef, SearchBoxProps>(function SearchBox({ onSearch, isLoading, translations }, ref) {
  const [query, setQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(Object.keys(SUPPORTED_LANGUAGES));
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => setQuery('')
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedLanguages);
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  return (
    <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 border border-stone-200 dark:border-stone-700 relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 dark:text-stone-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translations?.placeholder || "Search for a word... (Press '/' to focus)"}
            className="w-full pl-10 pr-4 py-3 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-400 bg-white dark:bg-stone-900 transition-all duration-200"
            disabled={isLoading}
          />
          {/* キーボードショートカットボタンを入力欄の右下に配置 */}
          <div className="absolute top-full right-0 mt-3">
            <KeyboardShortcuts />
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 text-center">
            {translations?.languagesOptional || "Languages:"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguageToggle(code)}
                className={`px-3 py-2 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                  selectedLanguages.includes(code)
                    ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-md dark:bg-amber-700 dark:hover:bg-amber-800'
                    : 'bg-stone-200 text-stone-800 hover:bg-stone-300 dark:bg-stone-600 dark:text-stone-100 dark:hover:bg-stone-500 shadow-sm'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:transform-none"
        >
          {isLoading ? (translations?.searching || 'Searching...') : (translations?.searchButton || 'Search')}
        </button>
      </form>
    </div>
  );
});