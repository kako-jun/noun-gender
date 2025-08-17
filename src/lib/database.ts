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
  gender: z.enum(['m', 'f', 'n']).nullable().optional(),
  meaning_en: z.string().nullable().optional(),
  meaning_ja: z.string().nullable().optional(),
  meaning_zh: z.string().nullable().optional(),
  meaning_fr: z.string().nullable().optional(),
  meaning_de: z.string().nullable().optional(),
  meaning_es: z.string().nullable().optional(),
  meaning_it: z.string().nullable().optional(),
  meaning_pt: z.string().nullable().optional(),
  meaning_ru: z.string().nullable().optional(),
  meaning_ar: z.string().nullable().optional(),
  meaning_hi: z.string().nullable().optional(),
  example_en: z.string().nullable().optional(),
  memory_trick_en: z.string().nullable().optional(),
  memory_trick_ja: z.string().nullable().optional(),
  memory_trick_zh: z.string().nullable().optional(),
  memory_trick_fr: z.string().nullable().optional(),
  memory_trick_de: z.string().nullable().optional(),
  memory_trick_es: z.string().nullable().optional(),
  memory_trick_it: z.string().nullable().optional(),
  memory_trick_pt: z.string().nullable().optional(),
  memory_trick_ru: z.string().nullable().optional(),
  memory_trick_ar: z.string().nullable().optional(),
  memory_trick_hi: z.string().nullable().optional()
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
             wm.meaning_en, wm.meaning_ja, wm.meaning_zh, wm.meaning_fr, wm.meaning_de, wm.meaning_es, wm.meaning_it, wm.meaning_pt, wm.meaning_ru, wm.meaning_ar, wm.meaning_hi,
             ex.example_en,
             mt_en.trick_text as memory_trick_en,
             mt_ja.trick_text as memory_trick_ja,
             mt_zh.trick_text as memory_trick_zh,
             mt_fr.trick_text as memory_trick_fr,
             mt_de.trick_text as memory_trick_de,
             mt_es.trick_text as memory_trick_es,
             mt_it.trick_text as memory_trick_it,
             mt_pt.trick_text as memory_trick_pt,
             mt_ru.trick_text as memory_trick_ru,
             mt_ar.trick_text as memory_trick_ar,
             mt_hi.trick_text as memory_trick_hi
      FROM v_all_translations vat
      LEFT JOIN word_meanings wm ON vat.en = wm.en
      LEFT JOIN examples ex ON vat.en = ex.en
      LEFT JOIN memory_tricks mt_en ON vat.en = mt_en.en AND vat.lang = mt_en.translation_lang AND mt_en.ui_lang = 'en'
      LEFT JOIN memory_tricks mt_ja ON vat.en = mt_ja.en AND vat.lang = mt_ja.translation_lang AND mt_ja.ui_lang = 'ja'
      LEFT JOIN memory_tricks mt_zh ON vat.en = mt_zh.en AND vat.lang = mt_zh.translation_lang AND mt_zh.ui_lang = 'zh'
      LEFT JOIN memory_tricks mt_fr ON vat.en = mt_fr.en AND vat.lang = mt_fr.translation_lang AND mt_fr.ui_lang = 'fr'
      LEFT JOIN memory_tricks mt_de ON vat.en = mt_de.en AND vat.lang = mt_de.translation_lang AND mt_de.ui_lang = 'de'
      LEFT JOIN memory_tricks mt_es ON vat.en = mt_es.en AND vat.lang = mt_es.translation_lang AND mt_es.ui_lang = 'es'
      LEFT JOIN memory_tricks mt_it ON vat.en = mt_it.en AND vat.lang = mt_it.translation_lang AND mt_it.ui_lang = 'it'
      LEFT JOIN memory_tricks mt_pt ON vat.en = mt_pt.en AND vat.lang = mt_pt.translation_lang AND mt_pt.ui_lang = 'pt'
      LEFT JOIN memory_tricks mt_ru ON vat.en = mt_ru.en AND vat.lang = mt_ru.translation_lang AND mt_ru.ui_lang = 'ru'
      LEFT JOIN memory_tricks mt_ar ON vat.en = mt_ar.en AND vat.lang = mt_ar.translation_lang AND mt_ar.ui_lang = 'ar'
      LEFT JOIN memory_tricks mt_hi ON vat.en = mt_hi.en AND vat.lang = mt_hi.translation_lang AND mt_hi.ui_lang = 'hi'
      WHERE (vat.lang IN (${langPlaceholders})) AND (
        vat.en LIKE ? 
        OR vat.translation LIKE ?
        OR EXISTS (
          SELECT 1 FROM v_multilingual_search ms 
          WHERE ms.search_term LIKE ? 
          AND ms.en = vat.en
          AND ms.lang IN (${langPlaceholders})
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
      ...langFilter, // Language filter for main query
      searchTerm, searchTerm, searchTerm, // Search terms
      ...langFilter, // Language filter for EXISTS subquery
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
      meaning_fr?: string;
      meaning_de?: string;
      meaning_es?: string;
      meaning_it?: string;
      meaning_pt?: string;
      meaning_ru?: string;
      meaning_ar?: string;
      meaning_hi?: string;
      example_en?: string;
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
            meanings: Object.fromEntries(
              Object.entries({
                en: row.meaning_en,
                ja: row.meaning_ja,
                zh: row.meaning_zh,
                fr: row.meaning_fr,
                de: row.meaning_de,
                es: row.meaning_es,
                it: row.meaning_it,
                pt: row.meaning_pt,
                ru: row.meaning_ru,
                ar: row.meaning_ar,
                hi: row.meaning_hi
              }).filter(([, value]) => value != null && value !== '') as [string, string][]
            )
          },
          translations: [],
          example: row.example_en ? {
            example_en: row.example_en,
            example_translations: {}
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
          memory_trick_en: row.memory_trick_en,
          memory_trick_ja: row.memory_trick_ja,
          memory_trick_zh: row.memory_trick_zh,
          memory_trick_fr: row.memory_trick_fr,
          memory_trick_de: row.memory_trick_de,
          memory_trick_es: row.memory_trick_es,
          memory_trick_it: row.memory_trick_it,
          memory_trick_pt: row.memory_trick_pt,
          memory_trick_ru: row.memory_trick_ru,
          memory_trick_ar: row.memory_trick_ar,
          memory_trick_hi: row.memory_trick_hi
        });
      }
    });

    // 例文翻訳を別途取得
    const wordsWithExamples = Array.from(grouped.values()).filter(word => word.example?.example_en);
    if (wordsWithExamples.length > 0) {
      const exampleTexts = wordsWithExamples.map(w => w.example!.example_en);
      const examplePlaceholders = exampleTexts.map(() => '?').join(',');
      
      const exampleTranslations = db.prepare(`
        SELECT example_en, lang, translation
        FROM example_translations
        WHERE example_en IN (${examplePlaceholders})
      `).all(...exampleTexts) as Array<{
        example_en: string;
        lang: string;
        translation: string;
      }>;
      
      // 例文翻訳をマッピング
      exampleTranslations.forEach(et => {
        wordsWithExamples.forEach(word => {
          if (word.example?.example_en === et.example_en) {
            word.example.example_translations![et.lang] = et.translation;
          }
        });
      });
    }

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
             wm.meaning_en, wm.meaning_ja, wm.meaning_zh, wm.meaning_fr, wm.meaning_de, wm.meaning_es, wm.meaning_it, wm.meaning_pt, wm.meaning_ru, wm.meaning_ar, wm.meaning_hi,
             ex.example_en,
             mt_en.trick_text as memory_trick_en,
             mt_ja.trick_text as memory_trick_ja,
             mt_zh.trick_text as memory_trick_zh,
             mt_fr.trick_text as memory_trick_fr,
             mt_de.trick_text as memory_trick_de,
             mt_es.trick_text as memory_trick_es,
             mt_it.trick_text as memory_trick_it,
             mt_pt.trick_text as memory_trick_pt,
             mt_ru.trick_text as memory_trick_ru,
             mt_ar.trick_text as memory_trick_ar,
             mt_hi.trick_text as memory_trick_hi
      FROM v_all_translations vat
      LEFT JOIN word_meanings wm ON vat.en = wm.en
      LEFT JOIN examples ex ON vat.en = ex.en
      LEFT JOIN memory_tricks mt_en ON vat.en = mt_en.en AND vat.lang = mt_en.translation_lang AND mt_en.ui_lang = 'en'
      LEFT JOIN memory_tricks mt_ja ON vat.en = mt_ja.en AND vat.lang = mt_ja.translation_lang AND mt_ja.ui_lang = 'ja'
      LEFT JOIN memory_tricks mt_zh ON vat.en = mt_zh.en AND vat.lang = mt_zh.translation_lang AND mt_zh.ui_lang = 'zh'
      LEFT JOIN memory_tricks mt_fr ON vat.en = mt_fr.en AND vat.lang = mt_fr.translation_lang AND mt_fr.ui_lang = 'fr'
      LEFT JOIN memory_tricks mt_de ON vat.en = mt_de.en AND vat.lang = mt_de.translation_lang AND mt_de.ui_lang = 'de'
      LEFT JOIN memory_tricks mt_es ON vat.en = mt_es.en AND vat.lang = mt_es.translation_lang AND mt_es.ui_lang = 'es'
      LEFT JOIN memory_tricks mt_it ON vat.en = mt_it.en AND vat.lang = mt_it.translation_lang AND mt_it.ui_lang = 'it'
      LEFT JOIN memory_tricks mt_pt ON vat.en = mt_pt.en AND vat.lang = mt_pt.translation_lang AND mt_pt.ui_lang = 'pt'
      LEFT JOIN memory_tricks mt_ru ON vat.en = mt_ru.en AND vat.lang = mt_ru.translation_lang AND mt_ru.ui_lang = 'ru'
      LEFT JOIN memory_tricks mt_ar ON vat.en = mt_ar.en AND vat.lang = mt_ar.translation_lang AND mt_ar.ui_lang = 'ar'
      LEFT JOIN memory_tricks mt_hi ON vat.en = mt_hi.en AND vat.lang = mt_hi.translation_lang AND mt_hi.ui_lang = 'hi'
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
          meanings: Object.fromEntries(
            Object.entries({
              en: row.meaning_en,
              ja: row.meaning_ja,
              zh: row.meaning_zh,
              fr: row.meaning_fr,
              de: row.meaning_de,
              es: row.meaning_es,
              it: row.meaning_it,
              pt: row.meaning_pt,
              ru: row.meaning_ru,
              ar: row.meaning_ar,
              hi: row.meaning_hi
            }).filter(([, value]) => value != null && value !== '') as [string, string][]
          ),
          translations: [],
          example: row.example_en ? {
            example_en: row.example_en,
            example_translations: {}
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
          memory_trick_en: row.memory_trick_en,
          memory_trick_ja: row.memory_trick_ja,
          memory_trick_zh: row.memory_trick_zh,
          memory_trick_fr: row.memory_trick_fr,
          memory_trick_de: row.memory_trick_de,
          memory_trick_es: row.memory_trick_es,
          memory_trick_it: row.memory_trick_it,
          memory_trick_pt: row.memory_trick_pt,
          memory_trick_ru: row.memory_trick_ru,
          memory_trick_ar: row.memory_trick_ar,
          memory_trick_hi: row.memory_trick_hi
        });
      }
    });
    
    // 例文翻訳を別途取得
    const finalResults = englishList.map(englishWord => grouped.get(englishWord)).filter(word => word && word.translations.length > 0);
    const wordsWithExamples = finalResults.filter(word => word.example?.example_en);
    
    if (wordsWithExamples.length > 0) {
      const exampleTexts = wordsWithExamples.map(w => w.example!.example_en);
      const examplePlaceholders = exampleTexts.map(() => '?').join(',');
      
      // 利用可能な全言語の例文翻訳を取得
      const exampleTranslations = db.prepare(`
        SELECT example_en, lang, translation
        FROM example_translations
        WHERE example_en IN (${examplePlaceholders})
      `).all(...exampleTexts) as Array<{
        example_en: string;
        lang: string;
        translation: string;
      }>;
      
      // 例文翻訳をマッピング
      exampleTranslations.forEach(et => {
        wordsWithExamples.forEach(word => {
          if (word.example?.example_en === et.example_en) {
            word.example.example_translations![et.lang] = et.translation;
          }
        });
      });
    }
    
    return finalResults;
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
        SUBSTR(LOWER(en), 1, 1) as letter,
        COUNT(DISTINCT en) as count
      FROM v_all_translations 
      WHERE translation IS NOT NULL AND translation != ''
        AND SUBSTR(LOWER(en), 1, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(LOWER(en), 1, 1)
      ORDER BY letter
    `).all();
    
    return z.array(LetterStatsSchema).parse(rawResults);
  }

  getLetterStatsDetailed(prefix: string): LetterStatsDetailedRow[] {
    const db = this.getDb();
    const rawResults = db.prepare(`
      SELECT 
        SUBSTR(LOWER(en), ${prefix.length + 1}, 1) as next_letter,
        COUNT(DISTINCT en) as count
      FROM v_all_translations 
      WHERE translation IS NOT NULL AND translation != ''
        AND LOWER(en) LIKE ? || '%'
        AND SUBSTR(LOWER(en), ${prefix.length + 1}, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(LOWER(en), ${prefix.length + 1}, 1)
      ORDER BY next_letter
    `).all(prefix.toLowerCase());
    
    return z.array(LetterStatsDetailedSchema).parse(rawResults);
  }

  getWordAtOffset(prefix: string, offset: number): WordAtOffsetRow | undefined {
    const db = this.getDb();
    const rawResult = db.prepare(`
      SELECT en as english 
      FROM (
        SELECT DISTINCT en 
        FROM v_all_translations 
        WHERE en IS NOT NULL 
          AND en LIKE ? || '%'
        ORDER BY en COLLATE NOCASE ASC
      )
      LIMIT 1 OFFSET ?
    `).get(prefix, offset);
    
    if (!rawResult) return undefined;
    return WordAtOffsetSchema.parse(rawResult);
  }

  getWordRange(prefix: string): { firstWord?: string; lastWord?: string; totalCount: number } {
    const db = this.getDb();
    
    const rawFirstWord = db.prepare(`
      SELECT en as english 
      FROM (
        SELECT DISTINCT en 
        FROM v_all_translations 
        WHERE en IS NOT NULL 
          AND en LIKE ? || '%'
        ORDER BY en COLLATE NOCASE ASC
      )
      LIMIT 1
    `).get(prefix);
    
    const rawLastWord = db.prepare(`
      SELECT en as english 
      FROM (
        SELECT DISTINCT en 
        FROM v_all_translations 
        WHERE en IS NOT NULL 
          AND en LIKE ? || '%'
        ORDER BY en COLLATE NOCASE DESC
      )
      LIMIT 1
    `).get(prefix);
    
    const rawCountResult = db.prepare(`
      SELECT COUNT(DISTINCT en) as total
      FROM v_all_translations 
      WHERE en IS NOT NULL 
        AND en LIKE ? || '%'
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

  // クイズ用のランダム問題取得
  getQuizQuestions(languages: string[], count: number): Array<{ english: string; translation: string; language: string; gender: string; }> {
    const db = this.getDb();
    
    // 言語フィルターのプレースホルダー
    const languageFilter = languages.map(() => '?').join(',');
    
    const quizData = db.prepare(`
      SELECT en as english, translation, lang as language, gender
      FROM v_all_translations 
      WHERE lang IN (${languageFilter})
        AND translation IS NOT NULL 
        AND translation != ''
        AND gender IN ('m', 'f', 'n')
      ORDER BY RANDOM()
      LIMIT ?
    `).all(...languages, count);

    return quizData as Array<{ english: string; translation: string; language: string; gender: string; }>;
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

export default dbManager;