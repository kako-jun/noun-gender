#!/usr/bin/env node

/**
 * Sync meaning definitions from words_fr to all other language tables
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'noun_gender.db');
const db = new Database(dbPath);

// Language tables to sync
const languages = ['de', 'es', 'it', 'pt', 'ru', 'ar', 'hi'];

console.log('Syncing meaning definitions across all language tables...');

const syncTransaction = db.transaction(() => {
  let totalUpdated = 0;

  languages.forEach(lang => {
    const tableName = `words_${lang}`;
    console.log(`\nSyncing ${tableName}...`);
    
    const updateQuery = db.prepare(`
      UPDATE ${tableName} 
      SET meaning_en = (SELECT meaning_en FROM words_fr WHERE words_fr.english = ${tableName}.english),
          meaning_ja = (SELECT meaning_ja FROM words_fr WHERE words_fr.english = ${tableName}.english),
          meaning_zh = (SELECT meaning_zh FROM words_fr WHERE words_fr.english = ${tableName}.english),
          stage_2_meanings = (SELECT stage_2_meanings FROM words_fr WHERE words_fr.english = ${tableName}.english)
      WHERE EXISTS (SELECT 1 FROM words_fr WHERE words_fr.english = ${tableName}.english AND words_fr.meaning_en IS NOT NULL)
    `);
    
    const result = updateQuery.run();
    console.log(`  Updated ${result.changes} rows in ${tableName}`);
    totalUpdated += result.changes;
  });
  
  return totalUpdated;
});

const totalUpdated = syncTransaction();
console.log(`\n=== Sync Complete ===`);
console.log(`Total rows updated across all tables: ${totalUpdated}`);

// Verify sync
console.log('\n=== Verification ===');
languages.forEach(lang => {
  const tableName = `words_${lang}`;
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName} WHERE meaning_en IS NOT NULL`).get();
  console.log(`${tableName}: ${count.count} words with meanings`);
});

db.close();
console.log('\nSync completed successfully!');