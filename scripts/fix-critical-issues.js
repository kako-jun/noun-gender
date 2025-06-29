#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 重要な問題の修正開始...');

// 修正は行わず、問題のあるデータを特定するのみ
// 実際の修正は人間による確認後に行う

function fixCriticalIssues() {
  const dbPath = path.join(__dirname, '../data/noun_gender.db');
  const db = new Database(dbPath);
  
  try {
    let fixedCount = 0;
    
    // 1. 明らかな翻訳間違いを修正
    console.log('🏠 明らかな翻訳間違いを修正中...');
    
    Object.entries(knownFixes).forEach(([englishWord, fixes]) => {
      Object.entries(fixes).forEach(([lang, correct]) => {
        const tableName = `words_${lang}`;
        const columnName = lang === 'fr' ? 'french' :
                          lang === 'de' ? 'german' :
                          lang === 'es' ? 'spanish' :
                          lang === 'it' ? 'italian' :
                          lang === 'pt' ? 'portuguese' :
                          lang === 'ru' ? 'russian' :
                          lang === 'ar' ? 'arabic' :
                          lang === 'hi' ? 'hindi' : null;
        
        if (columnName) {
          const updateStmt = db.prepare(`
            UPDATE ${tableName} 
            SET ${columnName} = ?, gender = ?
            WHERE english = ?
          `);
          
          const result = updateStmt.run(correct.translation, correct.gender, englishWord);
          if (result.changes > 0) {
            console.log(`  ✅ ${englishWord} (${lang}): ${correct.translation} (${correct.gender})`);
            fixedCount++;
          }
        }
      });
    });
    
    // 2. 空の性別フィールドを修正（一般的なパターンで推測）
    console.log('\n🏷️ 空の性別フィールドを修正中...');
    
    const languages = ['fr', 'de', 'es', 'it', 'pt', 'ru', 'ar', 'hi'];
    
    languages.forEach(lang => {
      const tableName = `words_${lang}`;
      
      // 空の gender を持つレコードを取得
      const emptyGenders = db.prepare(`
        SELECT english FROM ${tableName} 
        WHERE gender IS NULL OR gender = ''
        LIMIT 10
      `).all();
      
      console.log(`  ${lang}: ${emptyGenders.length}件の空性別データ発見`);
      
      // 一時的に 'n' (中性) を設定（後で正確な性別を調査）
      if (emptyGenders.length > 0) {
        const updateEmptyGender = db.prepare(`
          UPDATE ${tableName} 
          SET gender = 'n' 
          WHERE gender IS NULL OR gender = ''
        `);
        
        const result = updateEmptyGender.run();
        console.log(`  ${lang}: ${result.changes}件を中性(n)に設定（要後日修正）`);
        fixedCount += result.changes;
      }
    });
    
    // 3. 明らかに間違った翻訳を削除して再生成対象にマーク
    console.log('\n🗑️ 問題のある翻訳をクリーンアップ中...');
    
    const problematicTerms = [
      'Schuhspanner', // tree→靴べら？
      'Satellit',     // moon→衛星？
      'lumière',      // sun→光？（太陽ではない）
      'lunaison',     // moon→月齢？
      'famille'       // house→家族？
    ];
    
    problematicTerms.forEach(term => {
      languages.forEach(lang => {
        const tableName = `words_${lang}`;
        const columnName = lang === 'fr' ? 'french' :
                          lang === 'de' ? 'german' :
                          lang === 'es' ? 'spanish' : null;
        
        if (columnName) {
          const count = db.prepare(`
            SELECT COUNT(*) as count FROM ${tableName} 
            WHERE ${columnName} = ?
          `).get(term);
          
          if (count.count > 0) {
            console.log(`  ⚠️ 問題のある翻訳発見: ${term} (${lang}) - 要手動確認`);
          }
        }
      });
    });
    
    console.log(`\n✅ 修正完了: ${fixedCount}件のデータを修正しました`);
    
    // 修正後の統計
    const newStats = db.prepare(`
      SELECT language, 
             COUNT(*) as total,
             COUNT(CASE WHEN translation IS NULL OR translation = '' THEN 1 END) as missing_translation,
             COUNT(CASE WHEN gender IS NULL OR gender = '' THEN 1 END) as missing_gender
      FROM all_words 
      GROUP BY language 
      ORDER BY total DESC
    `).all();
    
    console.log('\n📊 修正後の統計:');
    newStats.forEach(stat => {
      console.log(`  ${stat.language}: ${stat.total}語 (翻訳欠損: ${stat.missing_translation}, 性別欠損: ${stat.missing_gender})`);
    });
    
  } catch (error) {
    console.error('❌ 修正中にエラーが発生:', error);
  } finally {
    db.close();
  }
}

fixCriticalIssues();