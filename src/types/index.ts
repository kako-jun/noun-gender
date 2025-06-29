// Translation data types
export interface Translation {
  id: number;
  word_id: number;
  language: string;
  translation: string;
  gender: 'm' | 'f' | 'n';
  frequency_in_lang?: number;
  example_native?: string;
  pronunciation?: string;
  usage_context?: string;
  gender_reason?: string;
}

export interface Word {
  id: number;
  word_en: string;
  search_terms?: string;
  frequency_score?: number;
  category?: string;
  example_en?: string;
}

export interface SearchResult {
  word: Word;
  translations: Translation[];
}

// API types
export interface SearchParams {
  q: string;
  languages?: string[];
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  error?: string;
}

// Language codes
export type LanguageCode = 'ar' | 'fr' | 'de' | 'hi' | 'it' | 'pt' | 'ru' | 'es';

export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  ar: 'Arabic',
  fr: 'French', 
  de: 'German',
  hi: 'Hindi',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  es: 'Spanish',
};