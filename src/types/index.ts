// Translation data types
export interface Translation {
  id: number;
  word_id: number;
  language: string;
  translation: string;
  gender: 'm' | 'f' | 'n';
  frequency?: number;
  example?: string;
  example_native?: string;
  pronunciation?: string;
  usage_notes?: string;
  gender_explanation?: string;
  memory_trick_ja?: string;
  memory_trick_en?: string;
  memory_trick_zh?: string;
}

export interface Word {
  id: number;
  word_en: string;
  search_terms?: string;
  frequency_score?: number;
  category?: string;
  example_en?: string;
  meaning_en?: string;
  meaning_ja?: string;
  meaning_zh?: string;
}

export interface ExampleSentence {
  example_en: string;
  example_ja?: string;
  example_zh?: string;
}

export interface SearchResult {
  word?: Word;  // 既存の検索結果用
  english?: string;  // 新しいブラウズ結果用
  meaning_en?: string;  // Browse result meanings
  meaning_ja?: string;
  meaning_zh?: string;
  translations: Translation[];
  example?: ExampleSentence;  // 例文データ
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