'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { Button } from './ui/Button';

interface SearchBoxProps {
  onSearch: (query: string, languages: string[]) => void;
  onBrowse: (letter?: string, languages?: string[], offset?: number) => void;
  onQuiz: () => void;
  onTabChange?: (tab: 'search' | 'browse' | 'quiz') => void;
  onSearchResultsClear?: () => void; // 検索結果のクリア専用
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
function debounce<T extends (...args: Parameters<T>) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export const SearchBox = forwardRef<SearchBoxRef, SearchBoxProps>(function SearchBox({ 
  onSearch,
  onBrowse,
  onQuiz,
  onTabChange,
  onSearchResultsClear,
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
  const [letterHierarchy, setLetterHierarchy] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [wordRange, setWordRange] = useState<{firstWord: string, lastWord: string, totalCount: number}>({
    firstWord: '',
    lastWord: '',
    totalCount: 0
  });
  const [previewWord, setPreviewWord] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // スライダープレビュー更新関数
  const updateSliderPreview = async (value: number) => {
    setSliderValue(value);
    
    // プレビュー単語を更新
    try {
      const prefix = letterHierarchy.join('');
      const response = await fetch(`/api/word-at-offset?prefix=${prefix}&offset=${value}`);
      const data = await response.json();
      if (data.success && data.data.word) {
        setPreviewWord(data.data.word);
      }
    } catch (error) {
      console.error('Failed to get preview word:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      setQuery('');
      if (onSearchResultsClear) {
        onSearchResultsClear();
      }
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
      // initialLetterから階層を復元
      if (initialLetter && initialLetter !== selectedLetter) {
        const lowerLetter = initialLetter.toLowerCase();
        setSelectedLetter(lowerLetter);
        // 単一文字の場合はトップレベル（階層なし）、複数文字の場合は階層あり
        if (lowerLetter.length === 1) {
          setLetterHierarchy([]); // トップレベル
        } else {
          // 複数文字の場合は、最後の文字以外を階層とする
          setLetterHierarchy(lowerLetter.slice(0, -1).split(''));
        }
      }
      setInitialized(true);
    }
  }, [initialQuery, initialLanguages, initialLetter, initialized, query, selectedLanguages, selectedLetter]);

  // currentModeが変わった時にactiveTabを同期
  useEffect(() => {
    setActiveTab(currentMode);
  }, [currentMode]);

  // URL更新のみのデバウンス（検索は親コンポーネントのuseEffectで実行）
  const debouncedUrlUpdate = useCallback(
    debounce((query: string, languages: string[]) => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (languages.length > 0) {
        params.set('lang', languages.join('-'));
      }
      window.history.replaceState(null, '', `/search?${params.toString()}`);
    }, 300),
    []
  );

  // URLからの初期検索は親コンポーネントに任せる（重複検索を防ぐ）
  // useEffect(() => {
  //   if (activeTab === 'search' && initialQuery && initialQuery === query && query.trim()) {
  //     onSearch(query, selectedLanguages);
  //   }
  // }, [activeTab, initialQuery, query, selectedLanguages, onSearch]);

  const handleClear = () => {
    setQuery('');
    if (onSearchResultsClear) {
      onSearchResultsClear();
    }
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
    // 同じタブをクリックした場合、状態をリセット
    if (activeTab === tab) {
      if (tab === 'search') {
        // 検索タブ: 検索ワードをクリア
        setQuery('');
        if (onSearchResultsClear) {
          onSearchResultsClear();
        }
      } else if (tab === 'browse') {
        // ブラウズタブ: 索引選択をクリア
        setSelectedLetter('');
        setLetterHierarchy([]);
        setSliderValue(0);
        setPreviewWord('');
        // 全文字の統計を再読み込み
        onBrowse(); // パラメータなしで呼び出し
      }
      return; // 同じタブの場合はURL変更しない
    }
    
    // 親コンポーネントにタブ変更を通知（URL変更を先に実行）
    if (onTabChange) {
      onTabChange(tab);
    }
    
    // タブ状態を更新
    setActiveTab(tab);
  };

  const handleLetterSelect = (letter: string) => {
    // 新しい階層に入る
    setLetterHierarchy([...letterHierarchy, letter]);
    setSliderValue(0); // スライダーをリセット
    
    // 完全な文字列を構築（例: ["S", "C"] → "SC"）
    const fullLetter = [...letterHierarchy, letter].join('');
    setSelectedLetter(fullLetter);
    onBrowse(fullLetter, selectedLanguages);
  };

  const handleGoBack = () => {
    if (letterHierarchy.length > 0) {
      const newHierarchy = letterHierarchy.slice(0, -1);
      setLetterHierarchy(newHierarchy);
      setSliderValue(0); // スライダーをリセット
      
      const fullLetter = newHierarchy.join('');
      setSelectedLetter(fullLetter || '');
      onBrowse(fullLetter || undefined, selectedLanguages);
    }
  };

  // アルファベット配列（内部は小文字）
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  // 現在の階層に応じた文字リストを取得
  const getCurrentLetters = () => {
    if (letterHierarchy.length === 0) {
      // 最上位: a-z
      return letters;
    } else {
      // 下位階層: 現在の文字 + a-z（例: sa, sb, sc...）
      return letters.map(l => letterHierarchy.join('') + l);
    }
  };

  // 文字別統計の読み込み
  useEffect(() => {
    const loadLetterStats = async () => {
      try {
        const prefix = letterHierarchy.join('');
        const url = prefix 
          ? `/api/letter-stats-detailed?prefix=${prefix}`
          : '/api/letter-stats';
          
        const response = await fetch(url);
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
  }, [activeTab, letterHierarchy]);

  // 単語範囲の読み込み
  useEffect(() => {
    const loadWordRange = async () => {
      try {
        const prefix = letterHierarchy.join('');
        const response = await fetch(`/api/word-range?prefix=${prefix}`);
        const data = await response.json();
        if (data.success) {
          setWordRange(data.data);
          setPreviewWord(data.data.firstWord); // 初期プレビューを最初の単語に
        }
      } catch (error) {
        console.error('Failed to load word range:', error);
      }
    };

    if (activeTab === 'browse' && letterHierarchy.length > 0) {
      loadWordRange();
    }
  }, [activeTab, letterHierarchy]);

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
                  onChange={(e) => {
                    const newQuery = e.target.value;
                    setQuery(newQuery);
                    
                    // 検索タブでのURL更新のみ（検索はURLの変更で自動実行される）
                    if (activeTab === 'search') {
                      if (newQuery.trim()) {
                        debouncedUrlUpdate(newQuery, selectedLanguages);
                      } else {
                        // 空の場合は即座にURL更新とクリア
                        window.history.replaceState(null, '', '/search');
                        if (onSearchResultsClear) {
                          onSearchResultsClear();
                        }
                      }
                    }
                  }}
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
                {letterHierarchy.length > 0 && (
                  <span className="ml-2 text-solarized-blue">
                    ({letterHierarchy.join('').toUpperCase()})
                  </span>
                )}
              </p>
              <div className="flex justify-center gap-1 max-w-4xl mx-auto">
                {/* 戻るボタン（常に表示、最上位では無効） */}
                <div className="w-12 h-12">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleGoBack}
                    disabled={letterHierarchy.length === 0}
                    className="w-12 h-12 p-0 text-lg !rounded-none border border-solarized-base1 dark:border-solarized-base01"
                  >
                    ←
                  </Button>
                </div>
                
                {/* 文字ボタングリッド */}
                <div className="flex flex-col items-center gap-1">
                  {/* 現在の階層に応じた文字を4行で表示 */}
                  {[0, 7, 14, 21].map((startIndex) => {
                    const endIndex = startIndex === 21 ? 26 : startIndex + 7;
                    const currentLetters = getCurrentLetters();
                    const rowLetters = currentLetters.slice(startIndex, endIndex);
                    
                    if (rowLetters.length === 0) return null;
                    
                    return (
                      <div key={startIndex} className="flex gap-0">
                        {rowLetters.map((letter, index) => {
                          const displayLetter = letterHierarchy.length > 0 
                            ? letter.slice(-1) // 最後の文字のみ表示
                            : letter;
                          const stat = letterStats.find(s => s.letter === letter);
                          const count = stat?.count || 0;
                          
                          return (
                            <Button
                              key={letter}
                              type="button"
                              variant={selectedLetter === letter ? 'selected' : 'secondary'}
                              size="sm"
                              onClick={() => handleLetterSelect(displayLetter)}
                              disabled={count === 0}
                              className={`w-12 h-12 p-0 text-xs !rounded-none flex flex-col items-center justify-center gap-0.5 border border-solarized-base1 dark:border-solarized-base01 ${
                                index === 0 ? '' : '-ml-px'
                              } ${count === 0 ? 'opacity-30' : 'cursor-pointer'}`}
                            >
                              <div className="font-bold text-sm">{displayLetter.toUpperCase()}</div>
                              <div className="text-[9px] opacity-60 leading-none">{count}</div>
                            </Button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* スライダー - 階層が選択されている場合のみ表示 */}
              {letterHierarchy.length > 0 && wordRange.totalCount > 0 && (
                <div className="mt-4 px-4">
                  <div className="bg-solarized-base3 dark:bg-solarized-base03 rounded-lg p-4 border border-solarized-base1 dark:border-solarized-base01">
                    <div className="flex items-center justify-between text-xs text-solarized-base00 dark:text-solarized-base0 mb-2">
                      <span>{wordRange.firstWord}</span>
                      <span className="font-medium text-solarized-blue">{previewWord}</span>
                      <span>{wordRange.lastWord}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max={wordRange.totalCount - 1}
                        value={sliderValue}
                        onChange={async (e) => {
                          const value = parseInt(e.target.value);
                          await updateSliderPreview(value);
                        }}
                        onInput={async (e) => {
                          const value = parseInt((e.target as HTMLInputElement).value);
                          await updateSliderPreview(value);
                        }}
                        onMouseUp={() => {
                          // スライダーを離したときに実際にジャンプ
                          const offset = sliderValue;
                          onBrowse(letterHierarchy.join(''), selectedLanguages, offset);
                        }}
                        onKeyUp={(e) => {
                          // キーボード操作後にジャンプ（左右キーの場合）
                          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            const offset = sliderValue;
                            onBrowse(letterHierarchy.join(''), selectedLanguages, offset);
                          }
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-solarized-base2 dark:bg-solarized-base02"
                        style={{
                          background: `linear-gradient(to right, #268bd2 0%, #268bd2 ${(sliderValue / (wordRange.totalCount - 1)) * 100}%, #93a1a1 ${(sliderValue / (wordRange.totalCount - 1)) * 100}%, #93a1a1 100%)`,
                          WebkitAppearance: 'none',
                        }}
                      />
                      <style jsx>{`
                        input[type="range"]::-webkit-slider-thumb {
                          -webkit-appearance: none;
                          appearance: none;
                          width: 16px;
                          height: 16px;
                          background: #268bd2;
                          border-radius: 50%;
                          cursor: pointer;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        input[type="range"]::-moz-range-thumb {
                          width: 16px;
                          height: 16px;
                          background: #268bd2;
                          border-radius: 50%;
                          cursor: pointer;
                          border: none;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        .dark input[type="range"] {
                          background: linear-gradient(to right, #268bd2 0%, #268bd2 ${(sliderValue / (wordRange.totalCount - 1)) * 100}%, #586e75 ${(sliderValue / (wordRange.totalCount - 1)) * 100}%, #586e75 100%) !important;
                        }
                      `}</style>
                    </div>
                    <div className="text-center text-xs text-solarized-base00 dark:text-solarized-base0 mt-2">
                      {sliderValue + 1} / {wordRange.totalCount}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
});