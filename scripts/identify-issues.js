#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 問題データの特定（修正はしません）...');

function identifyIssuesOnly() {
  const dbPath = path.join(__dirname, '../data/noun_gender.db');
  const db = new Database(dbPath, { readonly: true });
  
  try {
    console.log('\n📋 修正が必要な可能性のあるデータ:');
    
    // 1. 完全に空のデータ
    console.log('\n🚫 完全に空の翻訳データ:');
    const emptyData = db.prepare(`
      SELECT english, language, translation, gender
      FROM all_words 
      WHERE (translation IS NULL OR translation = '') 
         OR (gender IS NULL OR gender = '')
      ORDER BY english, language
      LIMIT 20
    `).all();
    
    emptyData.forEach(row => {
      console.log(`  ${row.english} (${row.language}): "${row.translation}" [${row.gender}]`);
    });
    
    if (emptyData.length > 0) {
      console.log(`  ... 他 ${emptyData.length > 20 ? 'さらに多数' : emptyData.length}件`);
    }
    
    // 2. 疑わしい翻訳（長すぎる、特殊文字など）
    console.log('\n❓ 疑わしい翻訳（要確認）:');
    const suspiciousTranslations = db.prepare(`
      SELECT english, language, translation, gender
      FROM all_words 
      WHERE LENGTH(translation) > 20 
         OR translation LIKE '%(%'
         OR translation LIKE '%[%'
         OR translation LIKE '%,%'
      ORDER BY LENGTH(translation) DESC
      LIMIT 10
    `).all();
    
    suspiciousTranslations.forEach(row => {
      console.log(`  ${row.english} → "${row.translation}" (${row.language}, ${row.gender})`);
    });
    
    // 3. 基本語彙の確認（人間がチェックしやすいよう）
    console.log('\n🧪 基本語彙チェック（人間による確認推奨）:');
    const basicWords = ['cat', 'dog', 'house', 'book', 'water', 'tree', 'sun', 'moon', 'man', 'woman'];
    
    basicWords.forEach(word => {
      const translations = db.prepare(`
        SELECT language, translation, gender
        FROM all_words 
        WHERE english = ?
        ORDER BY language
      `).all(word);
      
      console.log(`  ${word}:`);
      translations.forEach(t => {
        console.log(`    ${t.language}: ${t.translation} (${t.gender})`);
      });
    });
    
    // 4. 統計情報
    console.log('\n📊 問題の規模:');
    const issueStats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN translation IS NULL OR translation = '' THEN 1 END) as empty_translations,
        COUNT(CASE WHEN gender IS NULL OR gender = '' THEN 1 END) as empty_genders,
        COUNT(CASE WHEN LENGTH(translation) > 30 THEN 1 END) as very_long_translations,
        COUNT(*) as total
      FROM all_words
    `).get();
    
    console.log(`  空の翻訳: ${issueStats.empty_translations}/${issueStats.total}`);
    console.log(`  空の性別: ${issueStats.empty_genders}/${issueStats.total}`);
    console.log(`  異常に長い翻訳: ${issueStats.very_long_translations}/${issueStats.total}`);
    
    console.log('\n💡 推奨アクション:');
    console.log('  1. 基本語彙の翻訳を人間が確認');
    console.log('  2. 空データの原因調査');
    console.log('  3. 段階的な修正（一度に大量修正しない）');
    console.log('  4. 修正前にバックアップ作成');
    
  } catch (error) {
    console.error('❌ 特定中にエラーが発生:', error);
  } finally {
    db.close();
  }
}

identifyIssuesOnly();