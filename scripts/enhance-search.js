#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 多言語検索機能拡張中...');

// 多言語検索データ（日本語、中国語、韓国語等）
const multilingualTerms = {
  'cat': {
    ja: ['猫', 'ねこ', 'ネコ'],
    zh: ['猫', '貓', '猫咪'],
    ko: ['고양이', '냐옹이'],
    ru: ['кот', 'кошка', 'котик'],
    ar: ['قط', 'قطة'],
    hi: ['बिल्ली', 'बिलाव']
  },
  'dog': {
    ja: ['犬', 'いぬ', 'イヌ', '犬'],
    zh: ['狗', '犬', '狗狗'],
    ko: ['개', '강아지', '멍멍이'],
    ru: ['собака', 'пёс', 'собачка'],
    ar: ['كلب', 'كلبة'],
    hi: ['कुत्ता', 'श्वान']
  },
  'house': {
    ja: ['家', 'いえ', 'イエ', '住宅', '家屋'],
    zh: ['房子', '房屋', '住宅', '家'],
    ko: ['집', '주택', '가옥'],
    ru: ['дом', 'домик', 'жилище'],
    ar: ['بيت', 'منزل', 'دار'],
    hi: ['घर', 'मकान', 'आवास']
  },
  'book': {
    ja: ['本', 'ほん', 'ホン', '書籍', '図書'],
    zh: ['书', '書', '书籍', '图书'],
    ko: ['책', '서적', '도서'],
    ru: ['книга', 'книжка'],
    ar: ['كتاب', 'مؤلف'],
    hi: ['किताब', 'पुस्तक', 'ग्रंथ']
  },
  'water': {
    ja: ['水', 'みず', 'ミズ'],
    zh: ['水', '水份'],
    ko: ['물', '수분'],
    ru: ['вода', 'водичка'],
    ar: ['ماء', 'مياه'],
    hi: ['पानी', 'जल']
  },
  'car': {
    ja: ['車', 'くるま', 'クルマ', '自動車'],
    zh: ['车', '車', '汽车', '轿车'],
    ko: ['차', '자동차', '승용차'],
    ru: ['машина', 'автомобиль', 'авто'],
    ar: ['سيارة', 'عربة'],
    hi: ['कार', 'गाड़ी', 'वाहन']
  }
};

function enhanceSearch() {
  const dbPath = path.join(__dirname, '../data/noun_gender.db');
  const db = new Database(dbPath);
  
  try {
    // 多言語検索テーブル作成
    db.exec(`
      CREATE TABLE IF NOT EXISTS multilingual_search (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        english_word TEXT NOT NULL,
        search_term TEXT NOT NULL,
        language_code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_multilingual_search_term ON multilingual_search(search_term);
      CREATE INDEX IF NOT EXISTS idx_multilingual_search_english ON multilingual_search(english_word);
      CREATE INDEX IF NOT EXISTS idx_multilingual_search_language ON multilingual_search(language_code);
    `);
    
    // 既存データを一度クリア
    db.prepare('DELETE FROM multilingual_search').run();
    
    const insertStmt = db.prepare('INSERT INTO multilingual_search (english_word, search_term, language_code) VALUES (?, ?, ?)');
    
    let totalInserted = 0;
    
    Object.entries(multilingualTerms).forEach(([englishWord, translations]) => {
      // 英語の検索語を追加
      insertStmt.run(englishWord, englishWord, 'en');
      insertStmt.run(englishWord, englishWord.toLowerCase(), 'en');
      totalInserted += 2;
      
      // 各言語の検索語を追加
      Object.entries(translations).forEach(([langCode, terms]) => {
        terms.forEach(term => {
          insertStmt.run(englishWord, term, langCode);
          totalInserted++;
        });
      });
    });
    
    console.log(`✅ 多言語検索語 ${totalInserted} 件を追加`);
    
    // 全文検索インデックス作成（SQLite FTS5）
    console.log('🚀 全文検索インデックス作成中...');
    
    try {
      db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
          english_word,
          translation,
          language,
          search_terms,
          content='all_words',
          content_rowid='rowid'
        );
      `);
      
      // FTSテーブルにデータを挿入
      db.exec(`
        INSERT INTO search_fts(english_word, translation, language, search_terms)
        SELECT english, translation, language, 
               english || ' ' || translation || ' ' || COALESCE(
                 (SELECT GROUP_CONCAT(search_term, ' ') 
                  FROM multilingual_search 
                  WHERE english_word = all_words.english), ''
               ) as search_terms
        FROM all_words;
      `);
      
      console.log('✅ 全文検索インデックス作成完了');
    } catch (ftsError) {
      console.log('⚠️  FTS5が利用できません。通常の検索を使用します。');
    }
    
    // 検索テスト
    console.log('\n🧪 検索テスト:');
    
    const testSearches = ['cat', '猫', 'ねこ', 'house', '家', 'book', '本'];
    
    testSearches.forEach(searchTerm => {
      const results = db.prepare(`
        SELECT DISTINCT aw.english, aw.translation, aw.language, aw.gender
        FROM all_words aw
        WHERE EXISTS (
          SELECT 1 FROM multilingual_search ms 
          WHERE ms.search_term LIKE ? 
          AND ms.english_word = aw.english
        )
        OR aw.english LIKE ?
        OR aw.translation LIKE ?
        LIMIT 3
      `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      
      console.log(`  "${searchTerm}": ${results.length}件`);
      results.forEach(r => {
        console.log(`    ${r.english} → ${r.translation} (${r.language}, ${r.gender})`);
      });
    });
    
  } catch (error) {
    console.error('❌ 検索拡張エラー:', error);
  } finally {
    db.close();
  }
}

enhanceSearch();