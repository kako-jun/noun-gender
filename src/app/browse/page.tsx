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

function BrowseContent() {
  const [browseResults, setBrowseResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentBrowseLetter, setCurrentBrowseLetter] = useState<string | null>(null);
  const searchBoxRef = useRef<SearchBoxRef>(null);
  const isLoadingMoreRef = useRef(false);
  const currentRequestId = useRef(0);
  
  const { t, isLoading: translationsLoading } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // isLoadingMoreの同期
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  // ブラウジングデータの読み込み
  const loadBrowseData = useCallback(async (offset: number = 0, startsWith?: string, append: boolean = false) => {
    // 無限スクロール時のみ重複読み込みチェック
    if (append && isLoadingMoreRef.current) return;
    
    // 新しいリクエストIDを生成（新規読み込みの場合のみ）
    if (!append) {
      currentRequestId.current += 1;
    }
    const requestId = currentRequestId.current;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      let url = `/api/browse?limit=50&offset=${offset}`;
      if (startsWith) {
        url += `&startsWith=${startsWith.toLowerCase()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      // 古いリクエストの結果は無視（新規読み込みの場合のみ）
      if (!append && requestId !== currentRequestId.current) {
        return;
      }
      
      if (append) {
        setBrowseResults(prev => [...prev, ...(data.data || [])]);
      } else {
        setBrowseResults(data.data || []);
      }
      
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      // 古いリクエストのエラーは無視（新規読み込みの場合のみ）
      if (!append && requestId !== currentRequestId.current) {
        return;
      }
      console.error('Browse data loading error:', error);
    } finally {
      // 古いリクエストの場合はローディング状態を変更しない（新規読み込みの場合のみ）
      if (!append || requestId === currentRequestId.current) {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    }
  }, []);

  // URLからの初期状態復元とデータ再読み込み
  useEffect(() => {
    const letter = searchParams.get('letter');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    setCurrentBrowseLetter(letter || null);
    
    // URL変更時は常にデータを新規読み込み（append=false）
    loadBrowseData(offset, letter || undefined, false);
  }, [searchParams, loadBrowseData]);

  // 無限スクロール
  const handleScroll = useCallback(() => {
    if (isLoadingMoreRef.current || !hasMore || !browseResults || browseResults.length === 0) return;
    
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 200) {
      const currentOffset = parseInt(searchParams.get('offset') || '0');
      const nextOffset = currentOffset + browseResults.length;
      
      // 無限スクロール時は直接データ追加読み込み（URL変更なし）
      loadBrowseData(nextOffset, currentBrowseLetter || undefined, true);
    }
  }, [hasMore, browseResults, currentBrowseLetter, searchParams, loadBrowseData]);

  useEffect(() => {
    const throttledHandleScroll = () => {
      clearTimeout((window as unknown as { scrollTimeout?: NodeJS.Timeout }).scrollTimeout);
      (window as unknown as { scrollTimeout?: NodeJS.Timeout }).scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout((window as unknown as { scrollTimeout?: NodeJS.Timeout }).scrollTimeout);
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
            // タブ変更時にブラウズ結果を即座にクリアし、進行中のリクエストをキャンセル
            setBrowseResults([]);
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
            setBrowseResults([]);
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