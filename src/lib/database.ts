import Database from 'better-sqlite3';
import path from 'path';
import { z } from 'zod';
import type { SearchResult, LanguageCode } from '@/types';

// Zod schemas for database validation
const LetterStatsSchema = z.object({
  letter: z.string().min(1).max(1),
  count: z.number().int().min(0)
});

const LetterStatsDetailedSchema = z.object({
  next_letter: z.string().min(1).max(1),
  count: z.number().int().min(0)
});

const WordAtOffsetSchema = z.object({
  english: z.string().min(1)
});

const TranslationRowSchema = z.object({
  en: z.string().min(1),
  lang: z.string().min(2).max(2),
  translation: z.string().min(1),
  gender: z.enum(['m', 'f', 'n']).optional(),
  meaning_en: z.string().optional(),
  meaning_ja: z.string().optional(),
  meaning_zh: z.string().optional(),
  example_en: z.string().optional(),
  example_ja: z.string().optional(),
  example_zh: z.string().optional(),
  memory_trick_ja: z.string().optional(),
  memory_trick_en: z.string().optional(),
  memory_trick_zh: z.string().optional()
});

const MemoryTrickWithLangSchema = z.object({
  translation_lang: z.string().min(2).max(2),
  trick_text: z.string().min(1)
});

// Inferred types
type LetterStatsRow = z.infer<typeof LetterStatsSchema>;
type LetterStatsDetailedRow = z.infer<typeof LetterStatsDetailedSchema>;
type WordAtOffsetRow = z.infer<typeof WordAtOffsetSchema>;
type TranslationRow = z.infer<typeof TranslationRowSchema>;


class DatabaseManager {
  private db: Database.Database | null = null;

  private getDb(): Database.Database {
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
      if (row.translation && row.translation.trim() !== '' && row.gender && ['m', 'f', 'n'].includes(row.gender)) {
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
    
    const englishParams: (string | number)[] = [];
    
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
    
    const rawRows = db.prepare(translationsQuery).all(...translationParams);
    
    // Validate each row with zod
    const rows: TranslationRow[] = [];
    for (const rawRow of rawRows) {
      try {
        const validatedRow = TranslationRowSchema.parse(rawRow);
        rows.push(validatedRow);
      } catch (error) {
        console.warn('Invalid translation row data, skipping:', rawRow, error);
        // Skip invalid rows instead of failing the entire query
      }
    }
    
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
      if (row.translation && row.translation.trim() !== '' && row.gender && ['m', 'f', 'n'].includes(row.gender)) {
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
    
    const rawResult = db.prepare(sql).get(englishWord, targetLanguage, uiLanguage);
    if (!rawResult) return null;
    
    try {
      const validatedResult = z.object({ trick_text: z.string().min(1) }).parse(rawResult);
      return validatedResult.trick_text;
    } catch (error) {
      console.warn('Invalid memory trick data:', rawResult, error);
      return null;
    }
  }

  async getMemoryTricksForWord(englishWord: string, uiLanguage: string): Promise<Record<string, string>> {
    const db = this.getDb();
    
    const sql = `
      SELECT translation_lang, trick_text 
      FROM memory_tricks 
      WHERE en = ? AND ui_lang = ?
    `;
    
    const rawResults = db.prepare(sql).all(englishWord, uiLanguage);
    
    const tricks: Record<string, string> = {};
    for (const rawRow of rawResults) {
      try {
        const validatedRow = MemoryTrickWithLangSchema.parse(rawRow);
        tricks[validatedRow.translation_lang] = validatedRow.trick_text;
      } catch (error) {
        console.warn('Invalid memory trick row data, skipping:', rawRow, error);
      }
    }
    
    return tricks;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Public methods for API routes
  getLetterStats(): LetterStatsRow[] {
    const db = this.getDb();
    const rawResults = db.prepare(`
      SELECT 
        SUBSTR(english, 1, 1) as letter,
        COUNT(DISTINCT english) as count
      FROM all_words 
      WHERE english IS NOT NULL 
        AND LENGTH(english) > 0
        AND SUBSTR(english, 1, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(english, 1, 1)
      ORDER BY letter
    `).all();
    
    return z.array(LetterStatsSchema).parse(rawResults);
  }

  getLetterStatsDetailed(prefix: string): LetterStatsDetailedRow[] {
    const db = this.getDb();
    const rawResults = db.prepare(`
      SELECT 
        SUBSTR(english, ${prefix.length + 1}, 1) as next_letter,
        COUNT(DISTINCT english) as count
      FROM all_words 
      WHERE english IS NOT NULL 
        AND LENGTH(english) > ${prefix.length}
        AND english LIKE ? || '%'
        AND SUBSTR(english, ${prefix.length + 1}, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(english, ${prefix.length + 1}, 1)
      ORDER BY next_letter
    `).all(prefix);
    
    return z.array(LetterStatsDetailedSchema).parse(rawResults);
  }

  getWordAtOffset(prefix: string, offset: number): WordAtOffsetRow | undefined {
    const db = this.getDb();
    const rawResult = db.prepare(`
      SELECT english 
      FROM (
        SELECT DISTINCT english 
        FROM all_words 
        WHERE english IS NOT NULL 
          AND english LIKE ? || '%'
        ORDER BY english ASC
      )
      LIMIT 1 OFFSET ?
    `).get(prefix, offset);
    
    if (!rawResult) return undefined;
    return WordAtOffsetSchema.parse(rawResult);
  }

  getWordRange(prefix: string): { firstWord?: string; lastWord?: string; totalCount: number } {
    const db = this.getDb();
    
    const rawFirstWord = db.prepare(`
      SELECT english 
      FROM (
        SELECT DISTINCT english 
        FROM all_words 
        WHERE english IS NOT NULL 
          AND english LIKE ? || '%'
        ORDER BY english ASC
      )
      LIMIT 1
    `).get(prefix);
    
    const rawLastWord = db.prepare(`
      SELECT english 
      FROM (
        SELECT DISTINCT english 
        FROM all_words 
        WHERE english IS NOT NULL 
          AND english LIKE ? || '%'
        ORDER BY english DESC
      )
      LIMIT 1
    `).get(prefix);
    
    const rawCountResult = db.prepare(`
      SELECT COUNT(DISTINCT english) as total
      FROM all_words 
      WHERE english IS NOT NULL 
        AND english LIKE ? || '%'
    `).get(prefix);

    // Validate and extract results
    const firstWord = rawFirstWord ? WordAtOffsetSchema.parse(rawFirstWord) : undefined;
    const lastWord = rawLastWord ? WordAtOffsetSchema.parse(rawLastWord) : undefined;
    const countResult = rawCountResult ? z.object({ total: z.number().int().min(0) }).parse(rawCountResult) : undefined;

    return {
      firstWord: firstWord?.english,
      lastWord: lastWord?.english,
      totalCount: countResult?.total || 0
    };
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

export default dbManager;