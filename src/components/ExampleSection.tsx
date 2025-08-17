'use client';

import type { ExampleSentence } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';
import { AudioButton } from './AudioButton';
import type { ReactElement } from 'react';

interface ExampleSectionProps {
  word: string;
  example?: ExampleSentence;
  currentLanguage?: string;  // 現在表示中の言語
}

export function ExampleSection({ word, example, currentLanguage }: ExampleSectionProps) {
  const { locale } = useTranslations();
  
  if (!example || !example.example_en) {
    return null;
  }

  // 現在の言語またはUI言語の翻訳を取得
  const translationLang = currentLanguage || locale;
  const translation = example.example_translations?.[translationLang];
  
  // Highlight the word in the example sentence
  const highlightWord = (text: string, word: string) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const parts = text.split(regex);
    const matches = text.match(regex) || [];
    
    return parts.reduce((acc: (string | ReactElement)[], part, index) => {
      if (index > 0) {
        acc.push(
          <span key={index} className="font-bold text-solarized-cyan dark:text-solarized-cyan">
            {matches[index - 1]}
          </span>
        );
      }
      if (part) {
        acc.push(part);
      }
      return acc;
    }, []);
  };
  
  return (
    <div className="mt-3 mb-4 p-3 bg-solarized-base3 dark:bg-solarized-base03 rounded-lg border border-solarized-base2 dark:border-solarized-base02">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-medium text-solarized-base01 dark:text-solarized-base1">
          {highlightWord(example.example_en, word)}
        </p>
        <div className="transform transition-transform duration-200 hover:scale-110">
          <AudioButton 
            text={example.example_en} 
            language="en"
            size="small"
          />
        </div>
      </div>
      {translation && (
        <p className="text-xs text-solarized-base00 dark:text-solarized-base0 opacity-70">
          {translation}
        </p>
      )}
    </div>
  );
}