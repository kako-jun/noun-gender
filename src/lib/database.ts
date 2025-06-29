import Database from 'better-sqlite3';
import path from 'path';
import type { SearchResult, LanguageCode } from '@/types';

class DatabaseManager {
  private db: Database.Database | null = null;

  private getDb() {
    if (!this.db) {
      const dbPath = path.join(process.cwd(), 'data', 'translation.db');
      this.db = new Database(dbPath, { readonly: true });
    }
    return this.db;
  }

  async search(query: string, languages: LanguageCode[] = [], limit: number = 20): Promise<SearchResult[]> {
    const db = this.getDb();
    
    // Build language filter
    const langFilter = languages.length > 0 ? languages : ['ar', 'fr', 'de', 'hi', 'it', 'pt', 'ru', 'es'];
    
    // Basic search query for existing database structure
    const sql = `
      SELECT * FROM view_translation 
      WHERE en LIKE ? 
         OR fr_search_keyword LIKE ?
         OR de_search_keyword LIKE ?
         OR es_search_keyword LIKE ?
         OR it_search_keyword LIKE ?
         OR pt_search_keyword LIKE ?
         OR ru_search_keyword LIKE ?
         OR ar_search_keyword LIKE ?
         OR hi_search_keyword LIKE ?
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const rows = db.prepare(sql).all(
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, 
      searchTerm, searchTerm, searchTerm, searchTerm, limit
    );

    // Convert to our result format
    return rows.map((row: any) => {
      const word = {
        id: 0, // Will be assigned later
        word_en: row.en,
      };

      const translations = [];
      
      // Add translations for requested languages
      for (const lang of langFilter) {
        const translation = row[`${lang}_translated_1`];
        const gender = row[`${lang}_gender_1`];
        
        if (translation && gender) {
          translations.push({
            id: 0,
            word_id: 0,
            language: lang,
            translation,
            gender: gender as 'm' | 'f' | 'n',
          });
        }
      }

      return { word, translations };
    });
  }

  async getStats() {
    const db = this.getDb();
    const result = db.prepare('SELECT COUNT(*) as total FROM view_translation').get() as { total: number };
    return { totalWords: result.total };
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