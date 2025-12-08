// Environment bindings for Cloudflare Workers
export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  total?: number;
  success?: boolean;
}

export type LanguageCode = 'ar' | 'fr' | 'de' | 'hi' | 'it' | 'pt' | 'ru' | 'es';

export interface Translation {
  id: number;
  word_id: number;
  language: string;
  translation: string;
  gender: 'm' | 'f' | 'n';
  memory_trick_en?: string;
  memory_trick_ja?: string;
  memory_trick_zh?: string;
  memory_trick_fr?: string;
  memory_trick_de?: string;
  memory_trick_es?: string;
  memory_trick_it?: string;
  memory_trick_pt?: string;
  memory_trick_ru?: string;
  memory_trick_ar?: string;
  memory_trick_hi?: string;
}

export interface Word {
  id: number;
  word_en: string;
  meaning_en?: string;
  meanings?: Record<string, string>;
}

export interface Example {
  example_en: string;
  example_translations?: Record<string, string>;
}

export interface SearchResult {
  word: Word;
  translations: Translation[];
  example?: Example;
}

export interface BrowseResult {
  english: string;
  meaning_en?: string;
  meanings?: Record<string, string>;
  translations: Translation[];
  example?: Example;
}

export interface QuizQuestion {
  id: number;
  english: string;
  translation: string;
  language: string;
  correctGender: string;
  options: string[];
  explanation: string;
}

export interface LetterStat {
  letter: string;
  count: number;
}
