'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBox, type SearchBoxRef } from '@/components/SearchBox';
import { SearchResults } from '@/components/SearchResults';
import { Footer } from '@/components/Footer';
import { StatsHeader } from '@/components/StatsHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { VoiceSelector } from '@/components/VoiceSelector';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTranslations } from '@/hooks/useTranslations';
import type { SearchResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { Info } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

function SearchContent() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchBoxRef = useRef<SearchBoxRef>(null);
  const currentRequestId = useRef(0);
  
  const { t, isLoading: translationsLoading } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 検索実行
  const handleSearch = useCallback(async (query: string, selectedLanguages: string[]) => {
    if (!query.trim()) return;
    
    // 新しいリクエストIDを生成
    currentRequestId.current += 1;
    const requestId = currentRequestId.current;
    
    setIsLoading(true);
    setSearchError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      if (selectedLanguages.length > 0) {
        params.set('lang', selectedLanguages.join('-'));
      }
      
      const response = await fetch(getApiUrl(`/api/search?${params.toString()}`));
      const data = await response.json();
      
      // 古いリクエストの結果は無視
      if (requestId !== currentRequestId.current) {
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      setSearchResults(data.data || []);
      
    } catch (error) {
      // 古いリクエストのエラーは無視
      if (requestId !== currentRequestId.current) {
        return;
      }
      
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      // 古いリクエストの場合はローディング状態を変更しない
      if (requestId === currentRequestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // URLからの初期検索実行
  useEffect(() => {
    const query = searchParams.get('q');
    
    if (query && query.trim()) {
      const langArray = searchParams.get('lang')?.split('-').filter(Boolean) || [];
      handleSearch(query, langArray);
    }
  }, [searchParams, handleSearch]);

  const handleFocusSearch = () => {
    searchBoxRef.current?.focus();
  };

  const handleClearSearch = () => {
    searchBoxRef.current?.clear();
    setSearchResults([]);
    setSearchError(null);
    router.push('/search');
  };

  useKeyboardShortcuts({
    onFocusSearch: handleFocusSearch,
    onClearSearch: handleClearSearch
  });

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
              {!translationsLoading && (
                <span className="mx-2 text-stone-500 dark:text-stone-400">|</span>
              )}
              <a 
                href="/about" 
                className="inline-flex items-center space-x-1 text-sm text-stone-500 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Info className="w-3 h-3" />
                <span>About</span>
              </a>
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
          onBrowse={(letter) => {
            if (letter) {
              router.push(`/browse?letter=${letter.toLowerCase()}`);
            } else {
              router.push('/browse');
            }
          }}
          onQuiz={() => {
            router.push('/quiz');
          }}
          onTabChange={(tab) => {
            // タブ変更時に検索結果を即座にクリアし、進行中のリクエストをキャンセル
            setSearchResults([]);
            setSearchError(null);
            currentRequestId.current += 1; // 古いリクエストをキャンセル
            
            if (tab === 'search') {
              router.push('/search');
            } else if (tab === 'browse') {
              router.push('/browse');
            } else if (tab === 'quiz') {
              router.push('/quiz');
            }
          }}
          onSearchResultsClear={() => {
            setSearchResults([]);
            setSearchError(null);
          }}
          isLoading={isLoading}
          initialQuery={searchParams.get('q') || ''}
          initialLanguages={searchParams.get('lang')?.split('-').filter(Boolean) || Object.keys(SUPPORTED_LANGUAGES)}
          currentMode="search"
          initialLetter=""
          translations={translationsLoading ? undefined : {
            placeholder: t('search.placeholder'),
            languagesOptional: t('search.languagesOptional'),
            searchButton: t('search.searchButton'),
            searching: t('search.searching'),
            tabs: {
              search: t('tabs.search'),
              browse: t('tabs.browse'),
              quiz: t('tabs.quiz')
            },
            browse: {
              index: t('browse.index')
            }
          }}
        />
        
        <SearchResults 
          results={searchResults} 
          isLoading={isLoading} 
          mode="search"
          searchQuery={searchParams.get('q') || ''}
          searchError={searchError}
        />
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default function SearchPageContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}