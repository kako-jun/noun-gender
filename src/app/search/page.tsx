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

function SearchContent() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchBoxRef = useRef<SearchBoxRef>(null);
  
  const { t, isLoading: translationsLoading } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 検索実行
  const handleSearch = useCallback(async (query: string, selectedLanguages: string[]) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      if (selectedLanguages.length > 0) {
        params.set('lang', selectedLanguages.join('-'));
      }
      
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      setSearchResults(data.data || []);
      
      // URLも更新
      const urlParams = new URLSearchParams();
      urlParams.set('q', query.trim());
      if (selectedLanguages.length > 0) {
        urlParams.set('lang', selectedLanguages.join('-'));
      }
      router.replace(`/search?${urlParams.toString()}`);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // URLからの初期検索実行
  useEffect(() => {
    const query = searchParams.get('q');
    const languages = searchParams.get('lang');
    
    if (query && query.trim()) {
      const langArray = languages ? languages.split('-').filter(Boolean) : Object.keys(SUPPORTED_LANGUAGES);
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
        
        {(searchResults && searchResults.length > 0 || searchParams.get('q')?.trim()) && (
          <SearchResults 
            results={searchResults} 
            isLoading={isLoading} 
            mode="search"
            searchQuery={searchParams.get('q') || ''}
            searchError={searchError}
          />
        )}
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}