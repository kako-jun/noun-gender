'use client';

import { useState, useRef, useEffect } from 'react';
import { SearchBox, type SearchBoxRef } from '@/components/SearchBox';
import { SearchResults } from '@/components/SearchResults';
import { Footer } from '@/components/Footer';
import { StatsHeader } from '@/components/StatsHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Quiz } from '@/components/Quiz';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTranslations } from '@/hooks/useTranslations';
import { useTheme } from 'next-themes';
import type { SearchResult } from '@/types';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [browseResults, setBrowseResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [mode, setMode] = useState<'browse' | 'search'>('browse');
  const [hasMore, setHasMore] = useState(true);
  const searchBoxRef = useRef<SearchBoxRef>(null);
  const { t, isLoading: translationsLoading } = useTranslations();

  // 初期ブラウジングデータの読み込み
  const loadBrowseData = async (offset: number = 0) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/browse?limit=100&offset=${offset}`);
      const data = await response.json();
      
      if (data.success) {
        if (offset === 0) {
          setBrowseResults(data.data);
        } else {
          setBrowseResults(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Browse data load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初期読み込み
  useEffect(() => {
    loadBrowseData();
  }, []);

  const handleSearch = async (query: string, languages: string[]) => {
    if (!query.trim()) {
      setSearchResults([]);
      setMode('browse');
      return;
    }

    setMode('search');
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...(languages.length > 0 && { languages: languages.join(',') }),
        limit: '20'
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Search error:', data.error);
        setSearchResults([]);
      } else {
        setSearchResults(data.data || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusSearch = () => {
    searchBoxRef.current?.focus();
  };

  const handleClearSearch = () => {
    searchBoxRef.current?.clear();
    setSearchResults([]);
  };

  const handleToggleTheme = () => {
    // テーマ切り替えはThemeToggleコンポーネントで処理
  };

  useKeyboardShortcuts({
    onFocusSearch: handleFocusSearch,
    onClearSearch: handleClearSearch
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900 transition-colors">
      {/* Header */}
      <header className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 relative">
        {/* ボタン群を右上に配置 */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-stone-800 dark:text-stone-100">
              Noun Gender
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-300 mb-3">
              {translationsLoading ? 'Master noun genders across languages' : t('header.subtitle')}
            </p>
            <StatsHeader />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <SearchBox 
          ref={searchBoxRef} 
          onSearch={handleSearch} 
          isLoading={isLoading}
          translations={{
            placeholder: t('search.placeholder'),
            languagesOptional: t('search.languagesOptional'),
            searchButton: t('search.searchButton'),
            searching: t('search.searching')
          }}
        />
        <SearchResults 
          results={mode === 'search' ? searchResults : browseResults} 
          isLoading={isLoading} 
          showLoadMore={mode === 'browse' && hasMore && !isLoading}
          onLoadMore={() => loadBrowseData(browseResults.length)}
          mode={mode}
        />
      </main>

      {/* ゲームボタン */}
      <div className="container mx-auto px-4 pb-4">
        <div className="text-center">
          <button
            onClick={() => setShowQuiz(true)}
            className="
              px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105
              bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800
              shadow-lg hover:shadow-xl
              text-white font-bold text-lg
            "
          >
            ゲーム
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Quiz Modal */}
      {showQuiz && (
        <Quiz onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}