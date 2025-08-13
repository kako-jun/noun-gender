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
    
    // Search using v_all_translations view
    const sql = `
      SELECT DISTINCT vat.en, vat.translation, vat.lang, vat.gender,
             vat.meaning_en, vat.meaning_ja, vat.meaning_zh,
             ex.example_en,
             et_ja.translation as example_ja,
             et_zh.translation as example_zh,
             et_native.translation as example_native,
             mt_ja.trick_text as memory_trick_ja,
             mt_en.trick_text as memory_trick_en,
             mt_zh.trick_text as memory_trick_zh
      FROM v_all_translations vat
      LEFT JOIN examples ex ON vat.en = ex.en
      LEFT JOIN example_translations et_ja ON ex.example_en = et_ja.example_en AND et_ja.lang = 'ja'
      LEFT JOIN example_translations et_zh ON ex.example_en = et_zh.example_en AND et_zh.lang = 'zh'
      LEFT JOIN example_translations et_native ON ex.example_en = et_native.example_en AND et_native.lang = vat.lang
      LEFT JOIN memory_tricks mt_ja ON vat.en = mt_ja.en AND vat.lang = mt_ja.translation_lang AND mt_ja.ui_lang = 'ja'
      LEFT JOIN memory_tricks mt_en ON vat.en = mt_en.en AND vat.lang = mt_en.translation_lang AND mt_en.ui_lang = 'en'
      LEFT JOIN memory_tricks mt_zh ON vat.en = mt_zh.en AND vat.lang = mt_zh.translation_lang AND mt_zh.ui_lang = 'zh'
      WHERE (vat.lang IN (${langPlaceholders})) AND (
        vat.en LIKE ? 
        OR vat.translation LIKE ?
        OR EXISTS (
          SELECT 1 FROM v_multilingual_search ms 
          WHERE ms.search_term LIKE ? 
          AND ms.en = vat.en
        )
      )
      ORDER BY 
        CASE 
          -- 完全一致は最優先
          WHEN vat.en = ? THEN 1
          WHEN vat.translation = ? THEN 2
          -- 短い単語の部分一致を前方一致より優先
          WHEN LENGTH(vat.en) <= 4 AND vat.en LIKE ? THEN 2.5
          -- 前方一致
          WHEN vat.en LIKE ? THEN 3
          WHEN vat.translation LIKE ? THEN 4
          -- その他の部分一致
          ELSE 5 
        END,
        -- 短い単語ほど関連性が高い
        LENGTH(vat.en),
        vat.en
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const exactTerm = query;
    const startsWith = `${query}%`;
    
    const rows = db.prepare(sql).all(
      ...langFilter, // Language filter
      searchTerm, searchTerm, searchTerm, // Search terms
      exactTerm, exactTerm, searchTerm, startsWith, startsWith, // Ranking terms
      limit
    ) as Array<{ 
      en: string; 
      translation: string; 
      lang: string; 
      gender: string; 
      meaning_en?: string;
      meaning_ja?: string;
      meaning_zh?: string;
      example_en?: string;
      example_ja?: string;
      example_zh?: string;
      example_native?: string;
      memory_trick_ja?: string;
      memory_trick_en?: string;
      memory_trick_zh?: string;
    }>;

    // Group results by English word
    const grouped = new Map<string, SearchResult>();
    
    rows.forEach((row) => {
      const englishWord = row.en;
      
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
          language: row.lang,
          translation: row.translation,
          gender: row.gender as 'm' | 'f' | 'n',
          memory_trick_ja: row.memory_trick_ja,
          memory_trick_en: row.memory_trick_en,
          memory_trick_zh: row.memory_trick_zh
        });
      }
    });

    return Array.from(grouped.values()).filter(word => word.translations.length > 0);
  }

  async getStats() {
    const db = this.getDb();
    const totalWords = db.prepare('SELECT COUNT(DISTINCT en) as total FROM v_all_translations').get() as { total: number };
    const totalTranslations = db.prepare('SELECT COUNT(*) as total FROM v_all_translations').get() as { total: number };
    const multilingualTerms = db.prepare('SELECT COUNT(*) as total FROM v_multilingual_search').get() as { total: number };
    const searchLanguages = db.prepare('SELECT COUNT(DISTINCT lang) as total FROM v_multilingual_search').get() as { total: number };
    const languageStats = db.prepare(`
      SELECT lang as language, COUNT(*) as count 
      FROM v_all_translations 
      GROUP BY lang 
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
      SELECT DISTINCT en
      FROM v_all_translations 
      WHERE translation IS NOT NULL AND translation != ''
    `;
    
    const englishParams: string[] = [];
    
    if (language) {
      englishWordsQuery += ` AND lang = ?`;
      englishParams.push(language);
    }
    
    if (startsWith) {
      englishWordsQuery += ` AND LOWER(en) LIKE ?`;
      englishParams.push(`${startsWith.toLowerCase()}%`);
    }
    
    englishWordsQuery += ` ORDER BY LOWER(en) LIMIT ? OFFSET ?`;
    englishParams.push(limit, offset);
    
    const englishWords = db.prepare(englishWordsQuery).all(...englishParams) as { en: string }[];
    
    if (englishWords.length === 0) {
      return [];
    }
    
    // Then get all translations for these English words
    const englishList = englishWords.map(row => row.en);
    const placeholders = englishList.map(() => '?').join(',');
    
    let translationsQuery = `
      SELECT vat.en, vat.lang, vat.translation, vat.gender,
             vat.meaning_en, vat.meaning_ja, vat.meaning_zh,
             ex.example_en,
             et_ja.translation as example_ja,
             et_zh.translation as example_zh,
             mt_ja.trick_text as memory_trick_ja,
             mt_en.trick_text as memory_trick_en,
             mt_zh.trick_text as memory_trick_zh
      FROM v_all_translations vat
      LEFT JOIN examples ex ON vat.en = ex.en
      LEFT JOIN example_translations et_ja ON ex.example_en = et_ja.example_en AND et_ja.lang = 'ja'
      LEFT JOIN example_translations et_zh ON ex.example_en = et_zh.example_en AND et_zh.lang = 'zh'
      LEFT JOIN memory_tricks mt_ja ON vat.en = mt_ja.en AND vat.lang = mt_ja.translation_lang AND mt_ja.ui_lang = 'ja'
      LEFT JOIN memory_tricks mt_en ON vat.en = mt_en.en AND vat.lang = mt_en.translation_lang AND mt_en.ui_lang = 'en'
      LEFT JOIN memory_tricks mt_zh ON vat.en = mt_zh.en AND vat.lang = mt_zh.translation_lang AND mt_zh.ui_lang = 'zh'
      WHERE vat.en IN (${placeholders}) AND vat.translation IS NOT NULL AND vat.translation != ''
    `;
    
    const translationParams = [...englishList];
    
    if (language) {
      translationsQuery += ` AND vat.lang = ?`;
      translationParams.push(language);
    }
    
    translationsQuery += ` ORDER BY LOWER(vat.en), vat.lang`;
    
    const rows = db.prepare(translationsQuery).all(...translationParams) as Array<{ en: string; lang: string; translation: string; gender?: string; meaning?: string; examples?: string }>;
    
    // Group by English word
    const grouped = new Map();
    
    rows.forEach(row => {
      if (!grouped.has(row.en)) {
        grouped.set(row.en, {
          english: row.en,
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
        grouped.get(row.en).translations.push({
          id: 0,
          word_id: 0,
          language: row.lang,
          translation: row.translation,
          gender: row.gender as 'm' | 'f' | 'n',
          memory_trick_ja: row.memory_trick_ja,
          memory_trick_en: row.memory_trick_en,
          memory_trick_zh: row.memory_trick_zh
        });
      }
    });
    
    // Maintain the order of English words from the first query and filter out words with no valid translations
    return englishList.map(englishWord => grouped.get(englishWord)).filter(word => word && word.translations.length > 0);
  }

  async getMemoryTrick(englishWord: string, targetLanguage: string, uiLanguage: string): Promise<string | null> {
    const db = this.getDb();
    
    const sql = `
      SELECT trick_text 
      FROM memory_tricks 
      WHERE en = ? AND translation_lang = ? AND ui_lang = ?
    `;
    
    const result = db.prepare(sql).get(englishWord, targetLanguage, uiLanguage) as { trick_text: string } | undefined;
    return result?.trick_text || null;
  }

  async getMemoryTricksForWord(englishWord: string, uiLanguage: string): Promise<Record<string, string>> {
    const db = this.getDb();
    
    const sql = `
      SELECT translation_lang, trick_text 
      FROM memory_tricks 
      WHERE en = ? AND ui_lang = ?
    `;
    
    const results = db.prepare(sql).all(englishWord, uiLanguage) as { translation_lang: string; trick_text: string }[];
    
    const tricks: Record<string, string> = {};
    results.forEach(row => {
      tricks[row.translation_lang] = row.trick_text;
    });
    
    return tricks;
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