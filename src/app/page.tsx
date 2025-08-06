'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBox, type SearchBoxRef } from '@/components/SearchBox';
import { SearchResults } from '@/components/SearchResults';
import { Footer } from '@/components/Footer';
import { StatsHeader } from '@/components/StatsHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Quiz } from '@/components/Quiz';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTranslations } from '@/hooks/useTranslations';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import type { SearchResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [browseResults, setBrowseResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [mode, setMode] = useState<'browse' | 'search'>('browse');
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchBoxRef = useRef<SearchBoxRef>(null);
  const { t, isLoading: translationsLoading } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 初期ブラウジングデータの読み込み
  const loadBrowseData = useCallback(async (offset: number = 0) => {
    if (offset === 0 && isLoading) return; // 初期読み込み時の重複防止
    if (offset > 0 && isLoadingMore) return; // 追加読み込み時の重複防止
    
    if (offset === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const response = await fetch(`/api/browse?limit=50&offset=${offset}`);
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
      if (offset === 0) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [isLoading, isLoadingMore]);

  // URLからの初期状態復元と初期読み込み
  useEffect(() => {
    const query = searchParams.get('q');
    const languages = searchParams.get('lang');
    
    if (query) {
      // URLにクエリがある場合は検索実行
      const langArray = languages ? languages.split(',').filter(Boolean) : [];
      setMode('search');
      handleSearch(query, langArray);
    } else if (browseResults.length === 0 && !isLoading) {
      // URLにクエリがない場合は通常のブラウズモード
      loadBrowseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('q'), searchParams.get('lang')]);

  // 無限スクロール（スロットリング付き）
  const handleScroll = useCallback(() => {
    if (isLoadingMore || !hasMore || mode !== 'browse') return;
    
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // スクロール位置が下から200px以内に来たら次のデータを読み込み
    if (scrollTop + windowHeight >= documentHeight - 200) {
      loadBrowseData(browseResults.length);
    }
  }, [isLoadingMore, hasMore, mode, browseResults.length, loadBrowseData]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100); // 100ms間隔でスロットリング
    };
    
    window.addEventListener('scroll', throttledScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  // URLを更新
  const updateURL = useCallback((query: string, languages: string[]) => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
      // 言語が選択されていない場合はlangパラメータを設定しない（全言語検索なし）
      if (languages.length > 0) {
        params.set('lang', languages.join(','));
      }
    }
    
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [router]);

  const handleSearch = async (query: string, languages: string[]) => {
    if (!query.trim()) {
      setSearchResults([]);
      setMode('browse');
      updateURL('', []);
      return;
    }

    // 言語が一つも選択されていない場合は検索しない
    if (languages.length === 0) {
      setSearchResults([]);
      setMode('search');
      updateURL(query, languages);
      return;
    }

    setMode('search');
    setIsLoading(true);
    
    // URLを更新
    updateURL(query, languages);
    
    try {
      const params = new URLSearchParams({
        q: query,
        languages: languages.join(','),
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
    <div className="min-h-screen flex flex-col bg-solarized-base3 dark:bg-solarized-base03 transition-colors">
      {/* Header */}
      <header className="bg-solarized-base2 dark:bg-solarized-base02 border-b border-solarized-base1 dark:border-solarized-base01 relative">
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
          initialQuery={searchParams.get('q') || ''}
          initialLanguages={searchParams.get('lang')?.split(',').filter(Boolean) || Object.keys(SUPPORTED_LANGUAGES)}
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
          mode={mode}
          searchQuery={mode === 'search' ? searchParams.get('q') || '' : ''}
        />
        
        {/* 無限スクロール用のローディングインジケーター */}
        {mode === 'browse' && isLoadingMore && (
          <div className="flex justify-center items-center py-8 space-x-1">
            <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}></div>
            <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}></div>
          </div>
        )}
      </main>

      {/* ゲームボタン */}
      <div className="container mx-auto px-4 pb-4">
        <div className="text-center">
          <Button
            onClick={() => setShowQuiz(true)}
            variant="primary"
            size="lg"
            className="shadow-lg hover:shadow-xl"
          >
            {t('quiz.startQuiz')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Quiz Modal */}
      {showQuiz && (
        <Quiz onClose={() => setShowQuiz(false)} />
      )}
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}