'use client';

import type { SearchResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { AudioButton } from './AudioButton';
import { CopyButton } from './CopyButton';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from './ui/Button';
import { getGenderStyle, getGenderSymbol } from '@/utils/genderStyles';
import { HighlightedText } from '@/utils/textHighlight';
import { ExampleSection } from './ExampleSection';
import { useState } from 'react';

// 性別記憶術データ（多言語対応）
const MEMORY_TRICKS: Record<string, Record<string, string>> = {
  'cat-fr': {
    ja: 'フランス語では「シャッ」という鋭い鳴き声が男性的に聞こえることから男性名詞とされています。',
    en: 'In French, the sharp "chat" sound is perceived as masculine, making it a masculine noun.',
    zh: '在法语中，"chat"的尖锐发音听起来很男性化，因此是阳性名词。'
  },
  'cat-de': {
    ja: 'ドイツ語では家庭的で母性的な動物として捉えられ、子猫を育てる姿から女性名詞とされています。',
    en: 'In German, cats are seen as domestic, maternal animals, making them feminine due to their nurturing nature.',
    zh: '在德语中，猫被视为家庭化、母性的动物，因其养育幼崽的特性而成为阴性名词。'
  },
  'dog-fr': {
    ja: 'フランス語では忠実で力強い番犬のイメージから男性名詞とされています。',
    en: 'In French, dogs are associated with loyalty and strength as guard dogs, making them masculine.',
    zh: '在法语中，狗与忠诚和强壮的看门狗形象相关联，因此是阳性名词。'
  },
  'dog-de': {
    ja: '古高ドイツ語時代から男性的な狩猟動物として扱われてきた歴史があります。',
    en: 'Dogs have been treated as masculine hunting animals since Old High German times.',
    zh: '自古高地德语时代起，狗就被视为男性化的狩猎动物。'
  },
  'house-fr': {
    ja: 'フランス語では家族の住む場所、母なる場所として女性名詞で表現されます。',
    en: 'In French, houses are seen as family homes, motherly places, expressed as feminine nouns.',
    zh: '在法语中，房屋被视为家庭居住的地方、母性的场所，因此是阴性名词。'
  },
  'house-de': {
    ja: 'ドイツ語では建物という物体・構造物として中性的に扱われています。',
    en: 'In German, houses are treated neutrally as objects and structures.',
    zh: '在德语中，房屋作为物体和结构被中性地对待。'
  }
};

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  mode?: 'browse' | 'search';
  searchQuery?: string;
  searchError?: string | null;
}

// 個別カードコンポーネントで状態を分離
function TranslationCard({ 
  translation, 
  index, 
  tIndex, 
  result, 
  mode, 
  searchQuery 
}: {
  translation: any;
  index: number;
  tIndex: number;
  result: any;
  mode: string;
  searchQuery: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { locale } = useTranslations();
  
  const toggleCard = () => {
    setIsExpanded(!isExpanded);
  };

  const getMemoryTrick = (word: string, language: string, gender: string, locale: string): string | null => {
    const key = `${word}-${language}`;
    const tricks = MEMORY_TRICKS[key];
    
    // 該当する記憶術データがある場合
    if (tricks && tricks[locale]) {
      return tricks[locale];
    }
    
    // 他の言語の場合は英語にフォールバック
    if (tricks && tricks['en']) {
      return tricks['en'];
    }
    
    // どうしても表示する必要がある場合のみデフォルトメッセージ
    const genderText = {
      ja: gender === 'm' ? '男性' : gender === 'f' ? '女性' : '中性',
      en: gender === 'm' ? 'masculine' : gender === 'f' ? 'feminine' : 'neuter',
      zh: gender === 'm' ? '阳性' : gender === 'f' ? '阴性' : '中性',
      ar: gender === 'm' ? 'مذكر' : gender === 'f' ? 'مؤنث' : 'محايد',
      fr: gender === 'm' ? 'masculin' : gender === 'f' ? 'féminin' : 'neutre',
      de: gender === 'm' ? 'maskulin' : gender === 'f' ? 'feminin' : 'neutrum',
      es: gender === 'm' ? 'masculino' : gender === 'f' ? 'femenino' : 'neutro',
      it: gender === 'm' ? 'maschile' : gender === 'f' ? 'femminile' : 'neutro',
      pt: gender === 'm' ? 'masculino' : gender === 'f' ? 'feminino' : 'neutro',
      ru: gender === 'm' ? 'мужской' : gender === 'f' ? 'женский' : 'средний',
      hi: gender === 'm' ? 'पुल्लिंग' : gender === 'f' ? 'स्त्रीलिंग' : 'नपुंसकलिंग'
    };
    
    const defaultMessages = {
      ja: `${language}語では${genderText.ja}名詞として分類されています。`,
      en: `In ${language}, this is classified as a ${genderText.en} noun.`,
      zh: `在${language === 'fr' ? '法语' : language === 'de' ? '德语' : language === 'es' ? '西班牙语' : language}中，这是${genderText.zh}名词。`
      // 他の8言語は後で追加
    };
    
    return defaultMessages[locale as keyof typeof defaultMessages] || null;
  };

  // 記憶術テキストを事前計算（展開時の遅延を回避）
  const memoryTrick = getMemoryTrick(
    result.english || result.word?.word_en || '', 
    translation.language, 
    translation.gender,
    locale
  );

  return (
    <div 
      className={`relative bg-solarized-base3 dark:bg-solarized-base03 rounded-lg transition-all duration-200 overflow-hidden border border-solarized-base2 dark:border-solarized-base02 hover:scale-[1.01] hover:shadow-md ${
        memoryTrick ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={memoryTrick ? toggleCard : undefined}
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
      <div className="relative p-3">
        <div className="flex items-center justify-between w-full mb-1">
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
          
          <div 
            className="flex items-center mr-16"
            onClick={(e) => e.stopPropagation()}
          >
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
      
      {/* 展開部分 - 常に存在、CSSのみでアニメーション */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {memoryTrick && (
          <div className="relative bg-solarized-base2/70 dark:bg-solarized-base02/70 border-t border-solarized-base1 dark:border-solarized-base01 px-3 py-3">
            <div className="text-sm text-solarized-base00 dark:text-solarized-base0">
              <div className="flex items-start gap-2">
                <span className="text-solarized-blue dark:text-blue-400">💭</span>
                <span>
                  {memoryTrick}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchResults({ 
  results, 
  isLoading, 
  mode = 'search',
  searchQuery = '',
  searchError = null
}: SearchResultsProps) {
  const { t, locale } = useTranslations();

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
        <p className="text-sm text-solarized-base00 dark:text-solarized-base0 animate-in fade-in duration-300">{t('search.resultsFound', { count: results.length })}</p>
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
            
            {/* 意味の表示 */}
            {(() => {
              // Check for meanings in both word object and result object (for browse mode)
              const meaning = locale === 'ja' ? (result.word?.meaning_ja || result.meaning_ja) : 
                             locale === 'zh' ? (result.word?.meaning_zh || result.meaning_zh) : 
                             (result.word?.meaning_en || result.meaning_en);
              
              if (meaning) {
                // セミコロンで意味を分割（複数意味対応）- 半角・全角両対応
                const meanings = meaning.split(/[;；]/).map(m => m.trim()).filter(m => m.length > 0);
                
                return (
                  <div className="text-sm text-solarized-base00 dark:text-solarized-base0 mb-3">
                    {meanings.map((meaningText, index) => (
                      <span key={index} className="inline-block mr-4 mb-1">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-solarized-base01 dark:text-solarized-base1 text-xs font-bold rounded-full mr-1 border border-solarized-base01 dark:border-solarized-base1">
                          {index + 1}
                        </span>
                        {meaningText}
                      </span>
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            {/* 例文セクション */}
            <ExampleSection 
              word={result.english || result.word?.word_en || ''} 
              example={result.example}
            />
          </div>
          
          <div className="grid gap-3">
            {result.translations.map((translation, tIndex) => (
              <TranslationCard
                key={tIndex}
                translation={translation}
                index={index}
                tIndex={tIndex}
                result={result}
                mode={mode}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}