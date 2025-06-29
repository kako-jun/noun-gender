#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 データ品質チェック開始...');

function checkDataQuality() {
  const dbPath = path.join(__dirname, '../data/noun_gender.db');
  const db = new Database(dbPath, { readonly: true });
  
  const issues = [];
  
  try {
    // 1. 基本統計
    console.log('\n📊 基本統計:');
    const stats = db.prepare(`
      SELECT language, 
             COUNT(*) as total,
             COUNT(CASE WHEN translation IS NULL OR translation = '' THEN 1 END) as missing_translation,
             COUNT(CASE WHEN gender IS NULL OR gender = '' THEN 1 END) as missing_gender
      FROM all_words 
      GROUP BY language 
      ORDER BY total DESC
    `).all();
    
    stats.forEach(stat => {
      console.log(`  ${stat.language}: ${stat.total}語 (翻訳欠損: ${stat.missing_translation}, 性別欠損: ${stat.missing_gender})`);
      if (stat.missing_translation > 0 || stat.missing_gender > 0) {
        issues.push(`${stat.language}言語で欠損データあり`);
      }
    });
    
    // 2. 性別の妥当性チェック
    console.log('\n🏷️ 性別データ検証:');
    const invalidGenders = db.prepare(`
      SELECT language, gender, COUNT(*) as count
      FROM all_words 
      WHERE gender NOT IN ('m', 'f', 'n', 'c')
      GROUP BY language, gender
    `).all();
    
    if (invalidGenders.length > 0) {
      console.log('  ❌ 無効な性別データ:');
      invalidGenders.forEach(ig => {
        console.log(`    ${ig.language}: "${ig.gender}" (${ig.count}件)`);
        issues.push(`${ig.language}で無効な性別: ${ig.gender}`);
      });
    } else {
      console.log('  ✅ 性別データは正常');
    }
    
    // 3. 重複チェック
    console.log('\n🔄 重複データ検証:');
    const duplicates = db.prepare(`
      SELECT english, language, COUNT(*) as count
      FROM all_words 
      GROUP BY english, language
      HAVING COUNT(*) > 1
    `).all();
    
    if (duplicates.length > 0) {
      console.log('  ❌ 重複データ発見:');
      duplicates.forEach(dup => {
        console.log(`    ${dup.english} (${dup.language}): ${dup.count}件`);
        issues.push(`重複: ${dup.english} in ${dup.language}`);
      });
    } else {
      console.log('  ✅ 重複データなし');
    }
    
    // 4. 翻訳の一貫性チェック（同じ英語に対する性別の一貫性）
    console.log('\n⚖️ 性別一貫性検証:');
    const genderInconsistencies = db.prepare(`
      WITH gender_analysis AS (
        SELECT english, 
               COUNT(DISTINCT gender) as gender_count,
               GROUP_CONCAT(DISTINCT language || ':' || gender) as gender_details
        FROM all_words 
        WHERE translation IS NOT NULL
        GROUP BY english
        HAVING COUNT(DISTINCT gender) > 1
      )
      SELECT * FROM gender_analysis
      LIMIT 10
    `).all();
    
    if (genderInconsistencies.length > 0) {
      console.log('  ⚠️ 言語間で性別が異なる単語（これは正常な場合もあります）:');
      genderInconsistencies.forEach(gi => {
        console.log(`    "${gi.english}": ${gi.gender_details}`);
      });
      console.log(`  計 ${genderInconsistencies.length} 単語で言語間性別差異あり`);
    }
    
    // 5. 頻度スコアの分布
    console.log('\n📈 頻度スコア分析:');
    const frequencyStats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN frequency = 0 OR frequency IS NULL THEN 1 END) as no_frequency,
        COUNT(CASE WHEN frequency > 0 AND frequency <= 1000 THEN 1 END) as low_freq,
        COUNT(CASE WHEN frequency > 1000 AND frequency <= 5000 THEN 1 END) as mid_freq,
        COUNT(CASE WHEN frequency > 5000 THEN 1 END) as high_freq,
        AVG(frequency) as avg_frequency
      FROM all_words
    `).get();
    
    console.log(`  頻度なし: ${frequencyStats.no_frequency}件`);
    console.log(`  低頻度(1-1000): ${frequencyStats.low_freq}件`);
    console.log(`  中頻度(1001-5000): ${frequencyStats.mid_freq}件`);
    console.log(`  高頻度(5000+): ${frequencyStats.high_freq}件`);
    console.log(`  平均頻度: ${Math.round(frequencyStats.avg_frequency || 0)}`);
    
    // 6. 例文・発音・解説の充実度
    console.log('\n📝 詳細データ充実度:');
    const detailStats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN example IS NOT NULL AND example != '' THEN 1 END) as has_example,
        COUNT(CASE WHEN pronunciation IS NOT NULL AND pronunciation != '' THEN 1 END) as has_pronunciation,
        COUNT(CASE WHEN usage_notes IS NOT NULL AND usage_notes != '' THEN 1 END) as has_usage,
        COUNT(CASE WHEN gender_explanation IS NOT NULL AND gender_explanation != '' THEN 1 END) as has_explanation,
        COUNT(*) as total
      FROM all_words
    `).get();
    
    const total = detailStats.total;
    console.log(`  例文あり: ${detailStats.has_example}/${total} (${Math.round(detailStats.has_example/total*100)}%)`);
    console.log(`  発音あり: ${detailStats.has_pronunciation}/${total} (${Math.round(detailStats.has_pronunciation/total*100)}%)`);
    console.log(`  使用法あり: ${detailStats.has_usage}/${total} (${Math.round(detailStats.has_usage/total*100)}%)`);
    console.log(`  性別解説あり: ${detailStats.has_explanation}/${total} (${Math.round(detailStats.has_explanation/total*100)}%)`);
    
    // 7. 言語学的妥当性のサンプルチェック
    console.log('\n🧪 言語学的妥当性サンプルチェック:');
    const samples = db.prepare(`
      SELECT english, language, translation, gender, pronunciation
      FROM all_words 
      WHERE english IN ('cat', 'dog', 'house', 'book', 'water', 'tree', 'sun', 'moon')
      ORDER BY english, language
    `).all();
    
    console.log('  基本語彙の確認:');
    samples.forEach(sample => {
      console.log(`    ${sample.english} → ${sample.translation} (${sample.language}, ${sample.gender}) [${sample.pronunciation || 'N/A'}]`);
    });
    
    // 8. 総合評価
    console.log('\n📋 品質チェック結果:');
    if (issues.length === 0) {
      console.log('  ✅ 深刻な問題は発見されませんでした');
    } else {
      console.log(`  ⚠️ ${issues.length}件の問題を発見:`);
      issues.forEach((issue, index) => {
        console.log(`    ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n💡 改善提案:');
    if (frequencyStats.no_frequency > 0) {
      console.log(`  - ${frequencyStats.no_frequency}件の語彙に頻度スコアを追加`);
    }
    if (detailStats.has_example / total < 0.5) {
      console.log(`  - 例文充実度を向上 (現在${Math.round(detailStats.has_example/total*100)}%)`);
    }
    if (detailStats.has_pronunciation / total < 0.5) {
      console.log(`  - 発音記号を追加 (現在${Math.round(detailStats.has_pronunciation/total*100)}%)`);
    }
    
    return issues;
    
  } catch (error) {
    console.error('❌ チェック中にエラーが発生:', error);
  } finally {
    db.close();
  }
}

checkDataQuality();