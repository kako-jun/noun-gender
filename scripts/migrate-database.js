#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🚀 データベース最適化・移行開始...');

// 既存データベースから新データベースへの移行
function migrateDatabase() {
  const oldDbPath = path.join(__dirname, '../data/translation.db');
  const newDbPath = path.join(__dirname, '../data/noun_gender.db');
  
  // 既存DBを開く
  const oldDb = new Database(oldDbPath, { readonly: true });
  
  // 新DBを作成
  if (fs.existsSync(newDbPath)) {
    fs.unlinkSync(newDbPath);
    console.log('📁 既存の noun_gender.db を削除');
  }
  
  const newDb = new Database(newDbPath);
  
  try {
    // 新しいテーブル構造を作成
    console.log('🏗️  新しいテーブル構造を作成中...');
    
    // フランス語テーブル
    newDb.exec(`
      CREATE TABLE words_fr (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        english TEXT NOT NULL,
        french TEXT NOT NULL,
        gender TEXT NOT NULL,
        french_2 TEXT,
        gender_2 TEXT,
        french_3 TEXT,
        gender_3 TEXT,
        search_terms TEXT,
        frequency INTEGER DEFAULT 0,
        example TEXT,
        pronunciation TEXT,
        usage_notes TEXT,
        gender_explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_words_fr_english ON words_fr(english);
      CREATE INDEX idx_words_fr_french ON words_fr(french);
      CREATE INDEX idx_words_fr_search ON words_fr(search_terms);
    `);
    
    // ドイツ語テーブル
    newDb.exec(`
      CREATE TABLE words_de (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        english TEXT NOT NULL,
        german TEXT NOT NULL,
        gender TEXT NOT NULL,
        german_2 TEXT,
        gender_2 TEXT,
        german_3 TEXT,
        gender_3 TEXT,
        search_terms TEXT,
        frequency INTEGER DEFAULT 0,
        example TEXT,
        pronunciation TEXT,
        usage_notes TEXT,
        gender_explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_words_de_english ON words_de(english);
      CREATE INDEX idx_words_de_german ON words_de(german);
      CREATE INDEX idx_words_de_search ON words_de(search_terms);
    `);
    
    // スペイン語テーブル
    newDb.exec(`
      CREATE TABLE words_es (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        english TEXT NOT NULL,
        spanish TEXT NOT NULL,
        gender TEXT NOT NULL,
        spanish_2 TEXT,
        gender_2 TEXT,
        spanish_3 TEXT,
        gender_3 TEXT,
        search_terms TEXT,
        frequency INTEGER DEFAULT 0,
        example TEXT,
        pronunciation TEXT,
        usage_notes TEXT,
        gender_explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_words_es_english ON words_es(english);
      CREATE INDEX idx_words_es_spanish ON words_es(spanish);
      CREATE INDEX idx_words_es_search ON words_es(search_terms);
    `);
    
    // 他の言語テーブルも同様に作成
    const languages = [
      { code: 'it', name: 'italian' },
      { code: 'pt', name: 'portuguese' },
      { code: 'ru', name: 'russian' },
      { code: 'ar', name: 'arabic' },
      { code: 'hi', name: 'hindi' }
    ];
    
    languages.forEach(lang => {
      newDb.exec(`
        CREATE TABLE words_${lang.code} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          english TEXT NOT NULL,
          ${lang.name} TEXT NOT NULL,
          gender TEXT NOT NULL,
          ${lang.name}_2 TEXT,
          gender_2 TEXT,
          ${lang.name}_3 TEXT,
          gender_3 TEXT,
          search_terms TEXT,
          frequency INTEGER DEFAULT 0,
          example TEXT,
          pronunciation TEXT,
          usage_notes TEXT,
          gender_explanation TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_words_${lang.code}_english ON words_${lang.code}(english);
        CREATE INDEX idx_words_${lang.code}_${lang.name} ON words_${lang.code}(${lang.name});
        CREATE INDEX idx_words_${lang.code}_search ON words_${lang.code}(search_terms);
      `);
    });
    
    // データ移行
    console.log('📋 データ移行中...');
    
    const migrateLanguage = (oldTable, newTable, translationColumn) => {
      const oldData = oldDb.prepare(`SELECT * FROM ${oldTable}`).all();
      
      const insertStmt = newDb.prepare(`
        INSERT INTO ${newTable} (
          english, ${translationColumn}, gender, 
          ${translationColumn}_2, gender_2, 
          ${translationColumn}_3, gender_3,
          search_terms, frequency, example, pronunciation, usage_notes, gender_explanation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let count = 0;
      oldData.forEach(row => {
        insertStmt.run(
          row.en,
          row.translated_1,
          row.gender_1,
          row.translated_2,
          row.gender_2,
          row.translated_3,
          row.gender_3,
          row.search_keyword,
          row.frequency_score || 0,
          row.example_native_1,
          row.pronunciation_1,
          row.usage_context_1,
          row.gender_reason_1
        );
        count++;
      });
      
      console.log(`✅ ${newTable}: ${count}件のデータを移行`);
      return count;
    };
    
    let totalMigrated = 0;
    totalMigrated += migrateLanguage('translation_fr', 'words_fr', 'french');
    totalMigrated += migrateLanguage('translation_de', 'words_de', 'german');
    totalMigrated += migrateLanguage('translation_es', 'words_es', 'spanish');
    totalMigrated += migrateLanguage('translation_it', 'words_it', 'italian');
    totalMigrated += migrateLanguage('translation_pt', 'words_pt', 'portuguese');
    totalMigrated += migrateLanguage('translation_ru', 'words_ru', 'russian');
    totalMigrated += migrateLanguage('translation_ar', 'words_ar', 'arabic');
    totalMigrated += migrateLanguage('translation_hi', 'words_hi', 'hindi');
    
    // 統合ビュー作成
    console.log('🔍 統合検索ビューを作成中...');
    newDb.exec(`
      CREATE VIEW all_words AS
      SELECT 'fr' as language, english, french as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_fr
      UNION ALL
      SELECT 'de' as language, english, german as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_de
      UNION ALL
      SELECT 'es' as language, english, spanish as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_es
      UNION ALL
      SELECT 'it' as language, english, italian as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_it
      UNION ALL
      SELECT 'pt' as language, english, portuguese as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_pt
      UNION ALL
      SELECT 'ru' as language, english, russian as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_ru
      UNION ALL
      SELECT 'ar' as language, english, arabic as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_ar
      UNION ALL
      SELECT 'hi' as language, english, hindi as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation FROM words_hi;
    `);
    
    console.log(`🎉 データベース移行完了！合計 ${totalMigrated} 件のデータを移行しました`);
    console.log(`📊 新データベース: ${newDbPath}`);
    
    // 統計表示
    const stats = newDb.prepare(`
      SELECT language, COUNT(*) as count 
      FROM all_words 
      GROUP BY language 
      ORDER BY count DESC
    `).all();
    
    console.log('\n📈 言語別データ数:');
    stats.forEach(stat => {
      console.log(`  ${stat.language}: ${stat.count}件`);
    });
    
  } catch (error) {
    console.error('❌ 移行エラー:', error);
  } finally {
    oldDb.close();
    newDb.close();
  }
}

// 実行
migrateDatabase();