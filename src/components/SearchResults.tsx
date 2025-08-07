'use client';

import type { SearchResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { AudioButton } from './AudioButton';
import { CopyButton } from './CopyButton';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from './ui/Button';
import { getGenderStyle, getGenderSymbol } from '@/utils/genderStyles';
import { HighlightedText } from '@/utils/textHighlight';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  mode?: 'browse' | 'search';
  searchQuery?: string;
  searchError?: string | null;
}

export function SearchResults({ 
  results, 
  isLoading, 
  mode = 'search',
  searchQuery = '',
  searchError = null
}: SearchResultsProps) {
  const { t } = useTranslations();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 space-x-1">
        <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}></div>
        <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}></div>
      </div>
    );
  }

  if (results.length === 0) {
    // 初回ロード中かどうかをisLoadingで判定
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8 space-x-1">
          <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0s' }}></div>
          <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}></div>
          <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}></div>
        </div>
      );
    }
    
    // エラーメッセージがある場合
    if (searchError) {
      return (
        <div className="text-center py-8">
          <div className="bg-solarized-red/10 border border-solarized-red/30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-solarized-red dark:text-red-400 mb-2">
              {t('search.networkError')}
            </h3>
            <p className="text-solarized-base00 dark:text-solarized-base0">
              {searchError}
            </p>
          </div>
          <p className="text-sm text-solarized-base00 dark:text-solarized-base0">
            {t('search.networkErrorMessage')}
          </p>
        </div>
      );
    }
    
    return (
      <div className="text-center py-8 text-stone-500 dark:text-stone-400">
        <p className="whitespace-pre-line">{t('search.noResultsFound')}</p>
      </div>
    );
  }


  return (
    <div className="space-y-4">
      {mode === 'search' && (
        <p className="text-sm text-solarized-base00 dark:text-solarized-base0 animate-in fade-in duration-300">Found {results.length} results</p>
      )}
      
      {results.map((result, index) => (
        <div 
          key={index} 
          className="bg-solarized-base2 dark:bg-solarized-base02 rounded-lg shadow-lg border border-solarized-base1 dark:border-solarized-base01 p-6 transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-solarized-base01 dark:text-solarized-base1">
                {mode === 'search' && searchQuery ? (
                  <HighlightedText 
                    text={result.english || result.word?.word_en || ''} 
                    query={searchQuery}
                  />
                ) : (
                  result.english || result.word?.word_en
                )}
              </h3>
              <div className="transform transition-transform duration-200 hover:scale-110">
                <AudioButton 
                  text={result.english || result.word?.word_en || ''} 
                  language="en"
                />
              </div>
            </div>
            
            {/* サンプル: catの意味説明 */}
            {(result.english || result.word?.word_en) === 'cat' && (
              <div className="text-sm text-solarized-base00 dark:text-solarized-base0 mb-3">
                <span className="inline-block mr-4">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-solarized-base2 dark:bg-solarized-base02 text-solarized-base01 dark:text-solarized-base1 text-xs font-bold rounded-full mr-1 border border-solarized-base01 dark:border-solarized-base1">1</span> 動物・猫
                </span>
                <span className="inline-block">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-solarized-base2 dark:bg-solarized-base02 text-solarized-base01 dark:text-solarized-base1 text-xs font-bold rounded-full mr-1 border border-solarized-base01 dark:border-solarized-base1">2</span> 意地悪な人
                </span>
              </div>
            )}
          </div>
          
          <div className="grid gap-3">
            {result.translations.map((translation, tIndex) => (
              <div 
                key={tIndex} 
                className="relative bg-solarized-base3 dark:bg-solarized-base03 rounded-lg transition-all duration-200 overflow-hidden border border-solarized-base2 dark:border-solarized-base02 hover:scale-[1.01] hover:shadow-md"
              >
                {/* Gender background - spans full container */}
                <div className="absolute inset-0 opacity-40" style={getGenderStyle(translation.gender)}></div>
                
                {/* Gender symbol - large background text */}
                <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none select-none ${
                  translation.gender === 'n' ? 'right-3' : 'right-2'
                }`} style={translation.gender === 'n' ? { marginLeft: '-6px' } : {}}>
                  <span className={`text-white font-bold opacity-40 ${
                    translation.gender === 'n' ? 'text-4xl' : 'text-6xl'
                  }`} aria-hidden="true">
                    {getGenderSymbol(translation.gender)}
                  </span>
                </div>
                
                {/* Screen reader only gender info */}
                <span className="sr-only">
                  性別: {translation.gender === 'm' ? '男性' : translation.gender === 'f' ? '女性' : '中性'}
                </span>
                
                {/* Main content */}
                <div className="relative flex items-center justify-between p-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3 sm:space-x-6">
                      <span className="text-sm font-medium text-solarized-base00 dark:text-solarized-base0 w-20">
                        {SUPPORTED_LANGUAGES[translation.language as keyof typeof SUPPORTED_LANGUAGES]}
                      </span>
                      <span className="font-semibold text-lg text-solarized-base01 dark:text-solarized-base1">
                        {mode === 'search' && searchQuery ? (
                          <HighlightedText 
                            text={translation.translation} 
                            query={searchQuery}
                          />
                        ) : (
                          translation.translation
                        )}
                      </span>
                    </div>
                    
                    {/* サンプル: catの翻訳の番号表示 - 右端に配置 */}
                    {(result.english || result.word?.word_en) === 'cat' && (
                      <span className="mr-20">
                        {(() => {
                          // サンプル: 翻訳ごとの番号マッピング
                          const catMeanings: { [key: string]: string } = {
                            'chat': '1', 'Katze': '1', 'gato': '1', 'gatto': '1',
                            'chameau': '2', 'Typ': '2', 'tío': '2', 'tipo': '2'
                          };
                          const number = catMeanings[translation.translation] || '1';
                          return (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-solarized-base3 dark:bg-solarized-base03 text-solarized-base01 dark:text-solarized-base1 text-xs font-bold rounded-full border border-solarized-base01 dark:border-solarized-base1">
                              {number}
                            </span>
                          );
                        })()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mr-16">
                    <div className="w-8 flex justify-center transform transition-transform duration-200 hover:scale-110">
                      <AudioButton 
                        text={translation.translation} 
                        language={translation.language}
                      />
                    </div>
                    <div className="w-8 flex justify-center ml-3 transform transition-transform duration-200 hover:scale-110">
                      <CopyButton 
                        text={translation.translation}
                        label={translation.translation}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}