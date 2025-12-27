-- Noun Gender D1 Schema
-- 外部キー制約なし（D1インポート用）

-- Drop existing tables (reverse order of dependencies)
DROP TABLE IF EXISTS example_translations;
DROP TABLE IF EXISTS examples;
DROP TABLE IF EXISTS word_meanings;
DROP TABLE IF EXISTS memory_tricks;
DROP TABLE IF EXISTS words_fr;
DROP TABLE IF EXISTS words_de;
DROP TABLE IF EXISTS words_es;
DROP TABLE IF EXISTS words_it;
DROP TABLE IF EXISTS words_pt;
DROP TABLE IF EXISTS words_ru;
DROP TABLE IF EXISTS words_ar;
DROP TABLE IF EXISTS words_hi;
DROP TABLE IF EXISTS words_en;
DROP TABLE IF EXISTS gender_markers;

-- Master tables
CREATE TABLE IF NOT EXISTS words_en (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS gender_markers (
  code TEXT PRIMARY KEY NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT
);

-- Word meanings (multilingual definitions)
CREATE TABLE IF NOT EXISTS word_meanings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT UNIQUE NOT NULL,
  meaning_en TEXT,
  meaning_ja TEXT,
  meaning_zh TEXT,
  meaning_fr TEXT,
  meaning_de TEXT,
  meaning_es TEXT,
  meaning_it TEXT,
  meaning_pt TEXT,
  meaning_ru TEXT,
  meaning_ar TEXT,
  meaning_hi TEXT
);

-- Examples
CREATE TABLE IF NOT EXISTS examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT NOT NULL UNIQUE,
  example_en TEXT NOT NULL
);

-- Example translations
CREATE TABLE IF NOT EXISTS example_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  example_en TEXT NOT NULL,
  lang TEXT NOT NULL,
  translation TEXT NOT NULL,
  UNIQUE(example_en, lang)
);

-- Memory tricks
CREATE TABLE IF NOT EXISTS memory_tricks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT NOT NULL,
  translation_lang TEXT NOT NULL,
  ui_lang TEXT NOT NULL,
  trick_text TEXT NOT NULL,
  UNIQUE(en, translation_lang, ui_lang)
);

-- Language tables (8 languages with gender)
CREATE TABLE IF NOT EXISTS words_fr (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

CREATE TABLE IF NOT EXISTS words_de (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

CREATE TABLE IF NOT EXISTS words_es (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

CREATE TABLE IF NOT EXISTS words_it (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

CREATE TABLE IF NOT EXISTS words_pt (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

CREATE TABLE IF NOT EXISTS words_ru (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

CREATE TABLE IF NOT EXISTS words_ar (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

CREATE TABLE IF NOT EXISTS words_hi (
  id INTEGER PRIMARY KEY,
  en TEXT UNIQUE,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_words_en_en ON words_en(en);
CREATE INDEX IF NOT EXISTS idx_words_fr_en ON words_fr(en);
CREATE INDEX IF NOT EXISTS idx_words_de_en ON words_de(en);
CREATE INDEX IF NOT EXISTS idx_words_es_en ON words_es(en);
CREATE INDEX IF NOT EXISTS idx_words_it_en ON words_it(en);
CREATE INDEX IF NOT EXISTS idx_words_pt_en ON words_pt(en);
CREATE INDEX IF NOT EXISTS idx_words_ru_en ON words_ru(en);
CREATE INDEX IF NOT EXISTS idx_words_ar_en ON words_ar(en);
CREATE INDEX IF NOT EXISTS idx_words_hi_en ON words_hi(en);
CREATE INDEX IF NOT EXISTS idx_word_meanings_en ON word_meanings(en);
CREATE INDEX IF NOT EXISTS idx_examples_en ON examples(en);
CREATE INDEX IF NOT EXISTS idx_example_translations_example ON example_translations(example_en);
CREATE INDEX IF NOT EXISTS idx_memory_tricks_en ON memory_tricks(en);
