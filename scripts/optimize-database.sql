-- データベース最適化スクリプト
-- translation.db → noun_gender.db への構造最適化

-- 新しいテーブル構造：国際的で分かりやすい命名
-- words_* → 各言語の単語テーブル

-- 1. フランス語テーブル (words_fr)
CREATE TABLE IF NOT EXISTS words_fr (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,              -- 英語の基準語
  french TEXT NOT NULL,               -- フランス語翻訳
  gender TEXT NOT NULL,               -- 性別 (m/f/n)
  gender_2 TEXT,                      -- 第2の性別（複数形等）
  french_2 TEXT,                      -- 第2の翻訳
  gender_3 TEXT,                      -- 第3の性別
  french_3 TEXT,                      -- 第3の翻訳
  search_terms TEXT,                  -- 検索キーワード
  frequency INTEGER DEFAULT 0,        -- 使用頻度スコア
  example TEXT,                       -- 例文
  pronunciation TEXT,                 -- 発音記号
  usage_notes TEXT,                   -- 使い方の説明
  gender_explanation TEXT,            -- 性別の理由
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ドイツ語テーブル (words_de) 
CREATE TABLE IF NOT EXISTS words_de (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  german TEXT NOT NULL,
  gender TEXT NOT NULL,               -- der/die/das
  gender_2 TEXT,
  german_2 TEXT,
  gender_3 TEXT,
  german_3 TEXT,
  search_terms TEXT,
  frequency INTEGER DEFAULT 0,
  example TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  gender_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. スペイン語テーブル (words_es)
CREATE TABLE IF NOT EXISTS words_es (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  spanish TEXT NOT NULL,
  gender TEXT NOT NULL,               -- el/la
  gender_2 TEXT,
  spanish_2 TEXT,
  gender_3 TEXT,
  spanish_3 TEXT,
  search_terms TEXT,
  frequency INTEGER DEFAULT 0,
  example TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  gender_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. イタリア語テーブル (words_it)
CREATE TABLE IF NOT EXISTS words_it (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  italian TEXT NOT NULL,
  gender TEXT NOT NULL,               -- il/la
  gender_2 TEXT,
  italian_2 TEXT,
  gender_3 TEXT,
  italian_3 TEXT,
  search_terms TEXT,
  frequency INTEGER DEFAULT 0,
  example TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  gender_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. ポルトガル語テーブル (words_pt)
CREATE TABLE IF NOT EXISTS words_pt (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  portuguese TEXT NOT NULL,
  gender TEXT NOT NULL,               -- o/a
  gender_2 TEXT,
  portuguese_2 TEXT,
  gender_3 TEXT,
  portuguese_3 TEXT,
  search_terms TEXT,
  frequency INTEGER DEFAULT 0,
  example TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  gender_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. ロシア語テーブル (words_ru)
CREATE TABLE IF NOT EXISTS words_ru (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  russian TEXT NOT NULL,
  gender TEXT NOT NULL,               -- м/ж/ср
  gender_2 TEXT,
  russian_2 TEXT,
  gender_3 TEXT,
  russian_3 TEXT,
  search_terms TEXT,
  frequency INTEGER DEFAULT 0,
  example TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  gender_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. アラビア語テーブル (words_ar)
CREATE TABLE IF NOT EXISTS words_ar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  arabic TEXT NOT NULL,
  gender TEXT NOT NULL,               -- مذكر/مؤنث
  gender_2 TEXT,
  arabic_2 TEXT,
  gender_3 TEXT,
  arabic_3 TEXT,
  search_terms TEXT,
  frequency INTEGER DEFAULT 0,
  example TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  gender_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. ヒンディー語テーブル (words_hi)
CREATE TABLE IF NOT EXISTS words_hi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  hindi TEXT NOT NULL,
  gender TEXT NOT NULL,               -- पुल्लिंग/स्त्रीलिंग
  gender_2 TEXT,
  hindi_2 TEXT,
  gender_3 TEXT,
  hindi_3 TEXT,
  search_terms TEXT,
  frequency INTEGER DEFAULT 0,
  example TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  gender_explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成（検索最適化）
CREATE INDEX IF NOT EXISTS idx_words_fr_english ON words_fr(english);
CREATE INDEX IF NOT EXISTS idx_words_fr_french ON words_fr(french);
CREATE INDEX IF NOT EXISTS idx_words_fr_search ON words_fr(search_terms);

CREATE INDEX IF NOT EXISTS idx_words_de_english ON words_de(english);
CREATE INDEX IF NOT EXISTS idx_words_de_german ON words_de(german);
CREATE INDEX IF NOT EXISTS idx_words_de_search ON words_de(search_terms);

CREATE INDEX IF NOT EXISTS idx_words_es_english ON words_es(english);
CREATE INDEX IF NOT EXISTS idx_words_es_spanish ON words_es(spanish);
CREATE INDEX IF NOT EXISTS idx_words_es_search ON words_es(search_terms);

CREATE INDEX IF NOT EXISTS idx_words_it_english ON words_it(english);
CREATE INDEX IF NOT EXISTS idx_words_it_italian ON words_it(italian);
CREATE INDEX IF NOT EXISTS idx_words_it_search ON words_it(search_terms);

CREATE INDEX IF NOT EXISTS idx_words_pt_english ON words_pt(english);
CREATE INDEX IF NOT EXISTS idx_words_pt_portuguese ON words_pt(portuguese);
CREATE INDEX IF NOT EXISTS idx_words_pt_search ON words_pt(search_terms);

CREATE INDEX IF NOT EXISTS idx_words_ru_english ON words_ru(english);
CREATE INDEX IF NOT EXISTS idx_words_ru_russian ON words_ru(russian);
CREATE INDEX IF NOT EXISTS idx_words_ru_search ON words_ru(search_terms);

CREATE INDEX IF NOT EXISTS idx_words_ar_english ON words_ar(english);
CREATE INDEX IF NOT EXISTS idx_words_ar_arabic ON words_ar(arabic);
CREATE INDEX IF NOT EXISTS idx_words_ar_search ON words_ar(search_terms);

CREATE INDEX IF NOT EXISTS idx_words_hi_english ON words_hi(english);
CREATE INDEX IF NOT EXISTS idx_words_hi_hindi ON words_hi(hindi);
CREATE INDEX IF NOT EXISTS idx_words_hi_search ON words_hi(search_terms);

-- 統合ビュー作成（全言語横断検索用）
CREATE VIEW IF NOT EXISTS all_words AS
SELECT 
  'fr' as language, english, french as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_fr
UNION ALL
SELECT 
  'de' as language, english, german as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_de
UNION ALL
SELECT 
  'es' as language, english, spanish as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_es
UNION ALL
SELECT 
  'it' as language, english, italian as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_it
UNION ALL
SELECT 
  'pt' as language, english, portuguese as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_pt
UNION ALL
SELECT 
  'ru' as language, english, russian as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_ru
UNION ALL
SELECT 
  'ar' as language, english, arabic as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_ar
UNION ALL
SELECT 
  'hi' as language, english, hindi as translation, gender, frequency, example, pronunciation, usage_notes, gender_explanation
FROM words_hi;