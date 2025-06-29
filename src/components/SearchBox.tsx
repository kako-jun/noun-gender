'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';

interface SearchBoxProps {
  onSearch: (query: string, languages: string[]) => void;
  isLoading: boolean;
}

export function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a word..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Language Selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Languages (optional):</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguageToggle(code)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedLanguages.includes(code)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          {selectedLanguages.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">No languages selected = search all languages</p>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}