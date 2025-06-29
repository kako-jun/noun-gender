'use client';

import { useState, useRef } from 'react';
import { SearchBox, type SearchBoxRef } from '@/components/SearchBox';
import { SearchResults } from '@/components/SearchResults';
import { Footer } from '@/components/Footer';
import { StatsHeader } from '@/components/StatsHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { Quiz } from '@/components/Quiz';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from 'next-themes';
import { Brain } from 'lucide-react';
import type { SearchResult } from '@/types';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const searchBoxRef = useRef<SearchBoxRef>(null);
  const { setTheme } = useTheme();

  const handleSearch = async (query: string, languages: string[]) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

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
    setTheme(theme => theme === 'dark' ? 'light' : 'dark');
  };

  useKeyboardShortcuts({
    onFocusSearch: handleFocusSearch,
    onClearSearch: handleClearSearch,
    onToggleTheme: handleToggleTheme
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-4">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2">Noun Gender</h1>
              <p className="text-xl text-blue-100 mb-2">Master noun genders across languages</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQuiz(true)}
                className="
                  p-2 rounded-lg transition-colors
                  bg-purple-500 hover:bg-purple-600
                  text-white
                "
                title="Start quiz"
              >
                <Brain className="w-5 h-5" />
              </button>
              <KeyboardShortcuts />
              <ThemeToggle />
            </div>
          </div>
          <div className="text-center">
            <StatsHeader />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <SearchBox ref={searchBoxRef} onSearch={handleSearch} isLoading={isLoading} />
        <SearchResults results={searchResults} isLoading={isLoading} />
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Quiz Modal */}
      {showQuiz && (
        <Quiz onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}