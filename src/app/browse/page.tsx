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

function BrowseContent() {
  const [browseResults, setBrowseResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentBrowseLetter, setCurrentBrowseLetter] = useState<string | null>(null);
  const searchBoxRef = useRef<SearchBoxRef>(null);
  
  const { t, isLoading: translationsLoading } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ブラウジングデータの読み込み
  const loadBrowseData = useCallback(async (offset: number = 0, startsWith?: string) => {
    if (offset === 0 && isLoading) return;
    if (offset > 0 && isLoadingMore) return;
    
    if (offset === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      let url = `/api/browse?limit=50&offset=${offset}`;
      if (startsWith) {
        url += `&startsWith=${startsWith.toLowerCase()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (offset === 0) {
        setBrowseResults(data.data || []);
      } else {
        setBrowseResults(prev => [...prev, ...(data.data || [])]);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Browse data loading error:', error);
    } finally {
      if (offset === 0) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [isLoading, isLoadingMore]);

  // URLからの初期状態復元
  useEffect(() => {
    const letter = searchParams.get('letter');
    setCurrentBrowseLetter(letter || null);
    
    if ((!browseResults || browseResults.length === 0) && !isLoading) {
      loadBrowseData(0, letter || undefined);
    }
  }, [searchParams, loadBrowseData]);

  // 無限スクロール
  const handleScroll = useCallback(() => {
    if (isLoadingMore || !hasMore || !browseResults) return;
    
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 200) {
      loadBrowseData(browseResults.length, currentBrowseLetter || undefined);
    }
  }, [isLoadingMore, hasMore, browseResults, currentBrowseLetter, loadBrowseData]);

  useEffect(() => {
    const throttledHandleScroll = () => {
      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout((window as any).scrollTimeout);
    };
  }, [handleScroll]);

  const handleFocusSearch = () => {
    searchBoxRef.current?.focus();
  };

  const handleClearSearch = () => {
    searchBoxRef.current?.clear();
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
          onSearch={(query, selectedLanguages) => {
            const params = new URLSearchParams();
            if (query.trim()) params.set('q', query.trim());
            if (selectedLanguages.length > 0) {
              params.set('lang', selectedLanguages.join('-'));
            }
            router.push(`/search?${params.toString()}`);
          }}
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
          isLoading={isLoading}
          initialQuery=""
          initialLanguages={Object.keys(SUPPORTED_LANGUAGES)}
          currentMode="browse"
          initialLetter={searchParams.get('letter') || ''}
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
        
        {browseResults && browseResults.length > 0 && (
          <SearchResults 
            results={browseResults} 
            isLoading={isLoading} 
            mode="browse"
            searchQuery=""
            searchError={null}
          />
        )}
        
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8 space-x-1">
            <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}></div>
            <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}></div>
          </div>
        )}
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}