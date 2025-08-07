import Database from 'better-sqlite3';
import path from 'path';
import type { SearchResult, LanguageCode } from '@/types';

class DatabaseManager {
  private db: Database.Database | null = null;

  private getDb() {
    if (!this.db) {
      const dbPath = path.join(process.cwd(), 'data', 'noun_gender.db');
      this.db = new Database(dbPath, { readonly: true });
    }
    return this.db;
  }

  async search(query: string, languages: LanguageCode[] = [], limit: number = 20): Promise<SearchResult[]> {
    const db = this.getDb();
    
    // Build language filter - empty array means no results (not all languages)
    if (languages.length === 0) {
      return [];
    }
    
    const langFilter = languages;
    const langPlaceholders = langFilter.map(() => '?').join(',');
    
    // Enhanced search with multilingual support and examples
    const sql = `
      SELECT DISTINCT aw.english, aw.translation, aw.language, aw.gender,
             aw.frequency, aw.example, aw.pronunciation, aw.usage_notes, aw.gender_explanation,
             aw.meaning_en, aw.meaning_ja, aw.meaning_zh,
             ee.example_en,
             et_ja.example_translation as example_ja,
             et_zh.example_translation as example_zh,
             et_native.example_translation as example_native
      FROM all_words aw
      LEFT JOIN english_examples ee ON aw.english = ee.english_word
      LEFT JOIN example_translations et_ja ON aw.english = et_ja.english_word AND et_ja.language = 'ja'
      LEFT JOIN example_translations et_zh ON aw.english = et_zh.english_word AND et_zh.language = 'zh'
      LEFT JOIN example_translations et_native ON aw.english = et_native.english_word AND et_native.language = aw.language
      WHERE (aw.language IN (${langPlaceholders})) AND (
        aw.english LIKE ? 
        OR aw.translation LIKE ?
        OR EXISTS (
          SELECT 1 FROM multilingual_search ms 
          WHERE ms.search_term LIKE ? 
          AND ms.english_word = aw.english
        )
      )
      ORDER BY 
        CASE 
          -- 完全一致は最優先
          WHEN aw.english = ? THEN 1
          WHEN aw.translation = ? THEN 2
          -- 短い単語の部分一致を前方一致より優先
          WHEN LENGTH(aw.english) <= 4 AND aw.english LIKE ? THEN 2.5
          -- 前方一致
          WHEN aw.english LIKE ? THEN 3
          WHEN aw.translation LIKE ? THEN 4
          -- その他の部分一致
          ELSE 5 
        END,
        -- 短い単語ほど関連性が高い
        LENGTH(aw.english),
        aw.frequency DESC,
        aw.english
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const exactTerm = query;
    const startsWith = `${query}%`;
    
    const rows = db.prepare(sql).all(
      ...langFilter, // Language filter
      searchTerm, searchTerm, searchTerm, // Search terms
      exactTerm, exactTerm, searchTerm, startsWith, startsWith, // Ranking terms (updated order)
      limit
    ) as Array<{ 
      english: string; 
      translation: string; 
      language: string; 
      gender: string; 
      frequency?: number; 
      example?: string; 
      pronunciation?: string; 
      usage_notes?: string; 
      gender_explanation?: string;
      meaning_en?: string;
      meaning_ja?: string;
      meaning_zh?: string;
      example_en?: string;
      example_ja?: string;
      example_zh?: string;
      example_native?: string;
    }>;


    // Group results by English word
    const grouped = new Map<string, SearchResult>();
    
    rows.forEach((row) => {
      const englishWord = row.english;
      
      if (!grouped.has(englishWord)) {
        grouped.set(englishWord, {
          word: {
            id: 0,
            word_en: englishWord,
            meaning_en: row.meaning_en,
            meaning_ja: row.meaning_ja,
            meaning_zh: row.meaning_zh
          },
          translations: [],
          example: row.example_en ? {
            example_en: row.example_en,
            example_ja: row.example_ja,
            example_zh: row.example_zh
          } : undefined
        });
      }
      
      const result = grouped.get(englishWord)!;
      // 有効な翻訳データのみ追加
      if (row.translation && row.translation.trim() !== '' && ['m', 'f', 'n'].includes(row.gender)) {
        result.translations.push({
          id: 0,
          word_id: 0,
          language: row.language,
          translation: row.translation,
          gender: row.gender as 'm' | 'f' | 'n',
          frequency: row.frequency,
          example: row.example,
          example_native: row.example_native,
          pronunciation: row.pronunciation,
          usage_notes: row.usage_notes,
          gender_explanation: row.gender_explanation
        });
      }
    });

    return Array.from(grouped.values()).filter(word => word.translations.length > 0);
  }

  async getStats() {
    const db = this.getDb();
    const totalWords = db.prepare('SELECT COUNT(DISTINCT english) as total FROM all_words').get() as { total: number };
    const totalTranslations = db.prepare('SELECT COUNT(*) as total FROM all_words').get() as { total: number };
    const multilingualTerms = db.prepare('SELECT COUNT(*) as total FROM multilingual_search').get() as { total: number };
    const searchLanguages = db.prepare('SELECT COUNT(DISTINCT language_code) as total FROM multilingual_search').get() as { total: number };
    const languageStats = db.prepare(`
      SELECT language, COUNT(*) as count 
      FROM all_words 
      GROUP BY language 
      ORDER BY count DESC
    `).all() as { language: string; count: number }[];
    
    return { 
      totalWords: totalWords.total,
      totalTranslations: totalTranslations.total,
      multilingualTerms: multilingualTerms.total,
      searchLanguages: searchLanguages.total,
      languageStats
    };
  }

  async browseWords(options: {
    limit?: number;
    offset?: number;
    language?: string;
    startsWith?: string;
  } = {}) {
    const db = this.getDb();
    const { limit = 50, offset = 0, language, startsWith } = options;
    
    // First, get distinct English words with pagination
    let englishWordsQuery = `
      SELECT DISTINCT english
      FROM all_words 
      WHERE translation IS NOT NULL AND translation != ''
    `;
    
    const englishParams: any[] = [];
    
    if (language) {
      englishWordsQuery += ` AND language = ?`;
      englishParams.push(language);
    }
    
    if (startsWith) {
      englishWordsQuery += ` AND LOWER(english) LIKE ?`;
      englishParams.push(`${startsWith.toLowerCase()}%`);
    }
    
    englishWordsQuery += ` ORDER BY LOWER(english) LIMIT ? OFFSET ?`;
    englishParams.push(limit, offset);
    
    const englishWords = db.prepare(englishWordsQuery).all(...englishParams) as { english: string }[];
    
    if (englishWords.length === 0) {
      return [];
    }
    
    // Then get all translations for these English words
    const englishList = englishWords.map(row => row.english);
    const placeholders = englishList.map(() => '?').join(',');
    
    let translationsQuery = `
      SELECT english, language, translation, gender, frequency, example, 
             pronunciation, usage_notes, gender_explanation,
             meaning_en, meaning_ja, meaning_zh,
             example_en, example_ja, example_zh
      FROM all_words 
      WHERE english IN (${placeholders}) AND translation IS NOT NULL AND translation != ''
    `;
    
    const translationParams = [...englishList];
    
    if (language) {
      translationsQuery += ` AND language = ?`;
      translationParams.push(language);
    }
    
    translationsQuery += ` ORDER BY LOWER(english), language`;
    
    const rows = db.prepare(translationsQuery).all(...translationParams) as any[];
    
    // Group by English word
    const grouped = new Map();
    
    rows.forEach(row => {
      if (!grouped.has(row.english)) {
        grouped.set(row.english, {
          english: row.english,
          meaning_en: row.meaning_en,
          meaning_ja: row.meaning_ja,
          meaning_zh: row.meaning_zh,
          translations: [],
          example: row.example_en ? {
            example_en: row.example_en,
            example_ja: row.example_ja,
            example_zh: row.example_zh
          } : undefined
        });
      }
      
      // 有効な翻訳データのみ追加
      if (row.translation && row.translation.trim() !== '' && ['m', 'f', 'n'].includes(row.gender)) {
        grouped.get(row.english).translations.push({
          id: 0,
          word_id: 0,
          language: row.language,
          translation: row.translation,
          gender: row.gender as 'm' | 'f' | 'n',
          frequency: row.frequency,
          example: row.example,
          pronunciation: row.pronunciation,
          usage_notes: row.usage_notes,
          gender_explanation: row.gender_explanation
        });
      }
    });
    
    // Maintain the order of English words from the first query and filter out words with no valid translations
    return englishList.map(englishWord => grouped.get(englishWord)).filter(word => word && word.translations.length > 0);
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

export default dbManager;