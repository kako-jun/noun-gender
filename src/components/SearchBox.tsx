'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { Button } from './ui/Button';

interface SearchBoxProps {
  onSearch: (query: string, languages: string[]) => void;
  onBrowse: (letter?: string, languages?: string[]) => void;
  onQuiz: () => void;
  onTabChange?: (tab: 'search' | 'browse' | 'quiz') => void;
  isLoading: boolean;
  initialQuery?: string;
  initialLanguages?: string[];
  currentMode?: 'search' | 'browse' | 'quiz';
  initialLetter?: string;
  translations?: {
    placeholder?: string;
    languagesOptional?: string;
    searchButton?: string;
    searching?: string;
    startQuiz?: string;
    tabs?: {
      search?: string;
      browse?: string;
      quiz?: string;
    };
    browse?: {
      index?: string;
    };
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
  onBrowse,
  onQuiz,
  onTabChange,
  isLoading, 
  initialQuery = '', 
  initialLanguages = Object.keys(SUPPORTED_LANGUAGES), 
  currentMode = 'search',
  initialLetter = '',
  translations 
}, ref) {
  const [activeTab, setActiveTab] = useState<'search' | 'browse' | 'quiz'>(currentMode);
  const [query, setQuery] = useState(initialQuery);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages);
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter);
  const [letterStats, setLetterStats] = useState<{letter: string, count: number}[]>([]);
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
    // 空クエリの場合は検索を実行しない（初期化時やクリア時の不要な検索を防ぐ）
    if (query.trim()) {
      debouncedSearch(query, selectedLanguages);
    } else {
      // 空クエリの場合は明示的に空文字列で検索を呼び出してブラウズモードに戻す
      onSearch('', selectedLanguages);
    }
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
      
      return newSelection;
    });
  };

  const handleTabChange = (tab: 'search' | 'browse' | 'quiz') => {
    setActiveTab(tab);
    
    // 親コンポーネントにタブ変更を通知
    if (onTabChange) {
      onTabChange(tab);
    }
    
    switch (tab) {
      case 'search':
        if (query.trim()) {
          onSearch(query, selectedLanguages);
        }
        break;
      case 'browse':
        onBrowse(selectedLetter || undefined, selectedLanguages);
        break;
      case 'quiz':
        // クイズタブ選択時は何もしない（開始ボタンを押したときのみ実行）
        break;
    }
  };

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter);
    onBrowse(letter, selectedLanguages);
  };

  // アルファベット配列
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // 文字別統計の読み込み
  useEffect(() => {
    const loadLetterStats = async () => {
      try {
        const response = await fetch('/api/letter-stats');
        const data = await response.json();
        if (data.success) {
          setLetterStats(data.data);
        }
      } catch (error) {
        console.error('Failed to load letter stats:', error);
      }
    };

    if (activeTab === 'browse') {
      loadLetterStats();
    }
  }, [activeTab]);

  return (
    <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl shadow-lg mb-8 transition-all duration-300 border border-stone-200 dark:border-stone-700 relative">
      {/* タブ */}
      <div className="flex rounded-t-2xl border-b border-stone-200 dark:border-stone-700">
        {[
          { key: 'search', label: translations?.tabs?.search || 'Search' },
          { key: 'browse', label: translations?.tabs?.browse || 'Browse' },
          { key: 'quiz', label: translations?.tabs?.quiz || 'Quiz' }
        ].map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as 'search' | 'browse' | 'quiz')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
              index === 0 ? 'rounded-tl-2xl' : ''
            } ${
              index === 2 ? 'rounded-tr-2xl' : ''
            } ${
              activeTab === tab.key
                ? 'bg-solarized-blue text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* コンテンツエリア */}
      <div className="p-6">
        {activeTab === 'search' && (
          <div className="space-y-4">
            {/* Search Input */}
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
                  spellCheck={false}
                  autoComplete="off"
                />
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
              <KeyboardShortcuts />
            </div>

            {/* Language Selection */}
            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 text-center">
                {translations?.languagesOptional || "Languages"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-md mx-auto">
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
        )}

        {activeTab === 'browse' && (
          <div className="space-y-4">
            {/* A-Z Letters */}
            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 text-center">
                {translations?.browse?.index || 'Index'}
              </p>
              <div className="flex flex-col items-center gap-1 max-w-4xl mx-auto">
                {/* A-G */}
                <div className="flex gap-0">
                  {letters.slice(0, 7).map((letter, index) => {
                    const stat = letterStats.find(s => s.letter === letter);
                    const count = stat?.count || 0;
                    const isLast = index === 6;
                    
                    return (
                      <Button
                        key={letter}
                        type="button"
                        variant={selectedLetter === letter ? 'selected' : 'secondary'}
                        size="sm"
                        onClick={() => handleLetterSelect(letter)}
                        className={`w-12 h-12 p-0 text-xs rounded-none flex flex-col items-center justify-center gap-0.5 border border-solarized-base1 dark:border-solarized-base01 ${
                          index === 0 ? '' : '-ml-px'
                        }`}
                      >
                        <div className="font-bold text-sm">{letter}</div>
                        <div className="text-[9px] opacity-60 leading-none">{count}</div>
                      </Button>
                    );
                  })}
                </div>
                
                {/* H-N */}
                <div className="flex gap-0">
                  {letters.slice(7, 14).map((letter, index) => {
                    const stat = letterStats.find(s => s.letter === letter);
                    const count = stat?.count || 0;
                    const isLast = index === 6;
                    
                    return (
                      <Button
                        key={letter}
                        type="button"
                        variant={selectedLetter === letter ? 'selected' : 'secondary'}
                        size="sm"
                        onClick={() => handleLetterSelect(letter)}
                        className={`w-12 h-12 p-0 text-xs rounded-none flex flex-col items-center justify-center gap-0.5 border border-solarized-base1 dark:border-solarized-base01 ${
                          index === 0 ? '' : '-ml-px'
                        }`}
                      >
                        <div className="font-bold text-sm">{letter}</div>
                        <div className="text-[9px] opacity-60 leading-none">{count}</div>
                      </Button>
                    );
                  })}
                </div>
                
                {/* O-U */}
                <div className="flex gap-0">
                  {letters.slice(14, 21).map((letter, index) => {
                    const stat = letterStats.find(s => s.letter === letter);
                    const count = stat?.count || 0;
                    const isLast = index === 6;
                    
                    return (
                      <Button
                        key={letter}
                        type="button"
                        variant={selectedLetter === letter ? 'selected' : 'secondary'}
                        size="sm"
                        onClick={() => handleLetterSelect(letter)}
                        className={`w-12 h-12 p-0 text-xs rounded-none flex flex-col items-center justify-center gap-0.5 border border-solarized-base1 dark:border-solarized-base01 ${
                          index === 0 ? '' : '-ml-px'
                        }`}
                      >
                        <div className="font-bold text-sm">{letter}</div>
                        <div className="text-[9px] opacity-60 leading-none">{count}</div>
                      </Button>
                    );
                  })}
                </div>
                
                {/* V-Z */}
                <div className="flex gap-0">
                  {letters.slice(21).map((letter, index) => {
                    const stat = letterStats.find(s => s.letter === letter);
                    const count = stat?.count || 0;
                    const isLast = index === 4; // V-Z has 5 letters (0-4)
                    
                    return (
                      <Button
                        key={letter}
                        type="button"
                        variant={selectedLetter === letter ? 'selected' : 'secondary'}
                        size="sm"
                        onClick={() => handleLetterSelect(letter)}
                        className={`w-12 h-12 p-0 text-xs rounded-none flex flex-col items-center justify-center gap-0.5 border border-solarized-base1 dark:border-solarized-base01 ${
                          index === 0 ? '' : '-ml-px'
                        }`}
                      >
                        <div className="font-bold text-sm">{letter}</div>
                        <div className="text-[9px] opacity-60 leading-none">{count}</div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={onQuiz}
                variant="primary"
                size="lg"
                className="shadow-lg hover:shadow-xl"
              >
                {translations?.startQuiz || 'Start Quiz'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});