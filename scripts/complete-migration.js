#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🚀 残りの言語データを移行中...');

const oldDbPath = path.join(__dirname, '../data/translation.db');
const newDbPath = path.join(__dirname, '../data/noun_gender.db');

const oldDb = new Database(oldDbPath, { readonly: true });
const newDb = new Database(newDbPath);

try {
  const migrateLanguage = (oldTable, newTable, translationColumn) => {
    // テーブルが空かチェック
    const existingCount = newDb.prepare(`SELECT COUNT(*) as count FROM ${newTable}`).get();
    if (existingCount.count > 0) {
      console.log(`⏭️  ${newTable}: 既にデータがあります (${existingCount.count}件)`);
      return existingCount.count;
    }
    
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
  
  // 残りの言語データを移行
  migrateLanguage('translation_ar', 'words_ar', 'arabic');
  migrateLanguage('translation_hi', 'words_hi', 'hindi');
  migrateLanguage('translation_ru', 'words_ru', 'russian');
  migrateLanguage('translation_pt', 'words_pt', 'portuguese'); // 不完全な場合は再移行
  
  // 統計表示
  const stats = newDb.prepare(`
    SELECT language, COUNT(*) as count 
    FROM all_words 
    WHERE translation IS NOT NULL AND translation != ''
    GROUP BY language 
    ORDER BY count DESC
  `).all();
  
  console.log('\n📈 言語別データ数:');
  stats.forEach(stat => {
    console.log(`  ${stat.language}: ${stat.count}件`);
  });
  
  const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
  console.log(`\n🎉 合計: ${totalCount}件のデータが利用可能です`);
  
} catch (error) {
  console.error('❌ 移行エラー:', error);
} finally {
  oldDb.close();
  newDb.close();
}