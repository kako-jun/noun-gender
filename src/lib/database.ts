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
    
    // Build language filter
    const langFilter = languages.length > 0 ? languages : ['ar', 'fr', 'de', 'hi', 'it', 'pt', 'ru', 'es'];
    const langPlaceholders = langFilter.map(() => '?').join(',');
    
    // Enhanced search with multilingual support
    const sql = `
      SELECT DISTINCT aw.english, aw.translation, aw.language, aw.gender,
             aw.frequency, aw.example, aw.pronunciation, aw.usage_notes, aw.gender_explanation
      FROM all_words aw
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
        CASE WHEN aw.english = ? THEN 1
             WHEN aw.translation = ? THEN 2
             WHEN aw.english LIKE ? THEN 3
             WHEN aw.translation LIKE ? THEN 4
             ELSE 5 END,
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
      exactTerm, exactTerm, startsWith, startsWith, // Ranking terms
      limit
    ) as Array<{ english: string; translation: string; language: string; gender: string; frequency?: number; example?: string; pronunciation?: string; usage_notes?: string; gender_explanation?: string; }>;

    // Group results by English word
    const grouped = new Map<string, SearchResult>();
    
    rows.forEach((row) => {
      const englishWord = row.english;
      
      if (!grouped.has(englishWord)) {
        grouped.set(englishWord, {
          word: {
            id: 0,
            word_en: englishWord,
          },
          translations: []
        });
      }
      
      const result = grouped.get(englishWord)!;
      result.translations.push({
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
    });

    return Array.from(grouped.values());
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