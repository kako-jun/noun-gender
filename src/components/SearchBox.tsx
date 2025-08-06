'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { Button } from './ui/Button';

interface SearchBoxProps {
  onSearch: (query: string, languages: string[]) => void;
  isLoading: boolean;
  initialQuery?: string;
  initialLanguages?: string[];
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

// デバウンス関数
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export const SearchBox = forwardRef<SearchBoxRef, SearchBoxProps>(function SearchBox({ 
  onSearch, 
  isLoading, 
  initialQuery = '', 
  initialLanguages = Object.keys(SUPPORTED_LANGUAGES), 
  translations 
}, ref) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      setQuery('');
      onSearch('', selectedLanguages);
    }
  }));

  // 初期値の更新（初回のみ）
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      if (initialQuery !== query) {
        setQuery(initialQuery);
      }
      if (JSON.stringify(initialLanguages) !== JSON.stringify(selectedLanguages)) {
        setSelectedLanguages(initialLanguages);
      }
      setInitialized(true);
    }
  }, [initialQuery, initialLanguages, initialized]);

  // デバウンス用のインクリメンタルサーチ
  const debouncedSearch = useCallback(
    debounce((query: string, languages: string[]) => {
      onSearch(query, languages);
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(query, selectedLanguages);
  }, [query, selectedLanguages]);

  const handleClear = () => {
    setQuery('');
    onSearch('', selectedLanguages);
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      const newSelection = prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language];
      
      // 何も選択されていない場合は空配列のまま（全言語検索はしない）
      return newSelection;
    });
  };

  return (
    <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 border border-stone-200 dark:border-stone-700 relative">
      <div className="space-y-4">
        {/* Search Input with Keyboard Shortcuts */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 dark:text-stone-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translations?.placeholder || "Search words..."}
              className="w-full pl-10 pr-10 py-3 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-400 bg-white dark:bg-stone-900 transition-all duration-200"
              disabled={false}
              spellCheck={false}
              autoComplete="off"
            />
            {/* クリアボタン */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* キーボードショートカットボタンを検索ボックスの右に配置 */}
          <KeyboardShortcuts />
        </div>

        {/* Language Selection */}
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 text-center -mt-1">
            {translations?.languagesOptional || "Languages"}
          </p>
          <div className="grid grid-cols-4 gap-2 mt-3 max-w-md mx-auto">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <Button
                key={code}
                type="button"
                variant={selectedLanguages.includes(code) ? 'selected' : 'secondary'}
                size="sm"
                onClick={() => handleLanguageToggle(code)}
                className="rounded-full shadow-sm text-xs px-2 py-1"
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});