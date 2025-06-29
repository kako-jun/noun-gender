#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 元データの翻訳パターン調査...');

function checkOriginalData() {
  const dbPath = path.join(__dirname, '../data/translation.db');
  const db = new Database(dbPath, { readonly: true });
  
  try {
    // 基本語彙の3つの翻訳を確認
    const basicWords = ['cat', 'dog', 'house', 'book', 'water', 'tree', 'sun', 'moon', 'man', 'woman'];
    
    console.log('\n📚 基本語彙の翻訳パターン分析:');
    
    basicWords.forEach(word => {
      console.log(`\n${word}:`);
      
      // フランス語
      const frData = db.prepare(`
        SELECT translated_1, gender_1, translated_2, gender_2, translated_3, gender_3
        FROM translation_fr WHERE en = ?
      `).get(word);
      
      if (frData) {
        console.log(`  FR: 1位=${frData.translated_1}(${frData.gender_1}) 2位=${frData.translated_2 || 'N/A'}(${frData.gender_2 || 'N/A'}) 3位=${frData.translated_3 || 'N/A'}(${frData.gender_3 || 'N/A'})`);
      }
      
      // ドイツ語
      const deData = db.prepare(`
        SELECT translated_1, gender_1, translated_2, gender_2, translated_3, gender_3
        FROM translation_de WHERE en = ?
      `).get(word);
      
      if (deData) {
        console.log(`  DE: 1位=${deData.translated_1}(${deData.gender_1}) 2位=${deData.translated_2 || 'N/A'}(${deData.gender_2 || 'N/A'}) 3位=${deData.translated_3 || 'N/A'}(${deData.gender_3 || 'N/A'})`);
      }
      
      // スペイン語
      const esData = db.prepare(`
        SELECT translated_1, gender_1, translated_2, gender_2, translated_3, gender_3
        FROM translation_es WHERE en = ?
      `).get(word);
      
      if (esData) {
        console.log(`  ES: 1位=${esData.translated_1}(${esData.gender_1}) 2位=${esData.translated_2 || 'N/A'}(${esData.gender_2 || 'N/A'}) 3位=${esData.translated_3 || 'N/A'}(${esData.gender_3 || 'N/A'})`);
      }
    });
    
    // 統計: 2位・3位の充実度
    console.log('\n📊 翻訳の充実度統計:');
    
    const languages = ['fr', 'de', 'es'];
    languages.forEach(lang => {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN translated_1 IS NOT NULL AND translated_1 != '' THEN 1 END) as has_1st,
          COUNT(CASE WHEN translated_2 IS NOT NULL AND translated_2 != '' THEN 1 END) as has_2nd,
          COUNT(CASE WHEN translated_3 IS NOT NULL AND translated_3 != '' THEN 1 END) as has_3rd
        FROM translation_${lang}
      `).get();
      
      console.log(`  ${lang.toUpperCase()}: 1位=${stats.has_1st}/${stats.total} (${Math.round(stats.has_1st/stats.total*100)}%) 2位=${stats.has_2nd}/${stats.total} (${Math.round(stats.has_2nd/stats.total*100)}%) 3位=${stats.has_3rd}/${stats.total} (${Math.round(stats.has_3rd/stats.total*100)}%)`);
    });
    
    // 明らかに間違っている1位翻訳をチェック
    console.log('\n❌ 疑問のある1位翻訳:');
    
    const suspiciousFirst = [
      { en: 'tree', lang: 'de', expected: 'Baum' },
      { en: 'house', lang: 'fr', expected: 'maison' },
      { en: 'sun', lang: 'fr', expected: 'soleil' },
      { en: 'moon', lang: 'de', expected: 'Mond' }
    ];
    
    suspiciousFirst.forEach(item => {
      const data = db.prepare(`
        SELECT translated_1, translated_2, translated_3
        FROM translation_${item.lang} WHERE en = ?
      `).get(item.en);
      
      if (data) {
        const hasExpected = [data.translated_1, data.translated_2, data.translated_3].includes(item.expected);
        console.log(`  ${item.en} (${item.lang}): 1位=${data.translated_1} ${hasExpected ? '✅' : '❌'} (期待値: ${item.expected})`);
        if (hasExpected) {
          const position = data.translated_1 === item.expected ? '1位' :
                          data.translated_2 === item.expected ? '2位' : '3位';
          console.log(`    → 正しい翻訳は${position}にあります`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ 調査中にエラーが発生:', error);
  } finally {
    db.close();
  }
}

checkOriginalData();