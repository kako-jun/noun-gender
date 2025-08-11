-- 性別マーカー マスターテーブルの作成
-- m, f, n の3つの値のみを許可する

-- 1. 性別マスターテーブルを作成
CREATE TABLE IF NOT EXISTS "gender_markers" (
  code TEXT PRIMARY KEY NOT NULL CHECK(code IN ('m', 'f', 'n')),
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT
);

-- 2. マスターデータを挿入
INSERT OR REPLACE INTO gender_markers (code, name_en, name_ja, description) VALUES
('m', 'Masculine', '男性', 'Masculine gender marker'),
('f', 'Feminine', '女性', 'Feminine gender marker'),
('n', 'Neuter', '中性', 'Neuter gender marker');

-- 3. 一時的にFOREIGN KEYを無効にする（スキーマ変更のため）
PRAGMA foreign_keys = OFF;

-- 4. 各言語テーブルのバックアップとスキーマ変更
-- French (words_fr)
CREATE TABLE words_fr_new AS SELECT * FROM words_fr;
DROP TABLE words_fr;
CREATE TABLE "words_fr" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_fr SELECT * FROM words_fr_new;
DROP TABLE words_fr_new;
CREATE INDEX idx_words_fr_en ON words_fr(en);
CREATE INDEX idx_words_fr_gender ON words_fr(gender);

-- German (words_de)  
CREATE TABLE words_de_new AS SELECT * FROM words_de;
DROP TABLE words_de;
CREATE TABLE "words_de" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_de SELECT * FROM words_de_new;
DROP TABLE words_de_new;
CREATE INDEX idx_words_de_en ON words_de(en);
CREATE INDEX idx_words_de_gender ON words_de(gender);

-- Spanish (words_es)
CREATE TABLE words_es_new AS SELECT * FROM words_es;
DROP TABLE words_es;
CREATE TABLE "words_es" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_es SELECT * FROM words_es_new;
DROP TABLE words_es_new;
CREATE INDEX idx_words_es_en ON words_es(en);
CREATE INDEX idx_words_es_gender ON words_es(gender);

-- Italian (words_it)
CREATE TABLE words_it_new AS SELECT * FROM words_it;
DROP TABLE words_it;
CREATE TABLE "words_it" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_it SELECT * FROM words_it_new;
DROP TABLE words_it_new;
CREATE INDEX idx_words_it_en ON words_it(en);
CREATE INDEX idx_words_it_gender ON words_it(gender);

-- Portuguese (words_pt)
CREATE TABLE words_pt_new AS SELECT * FROM words_pt;
DROP TABLE words_pt;
CREATE TABLE "words_pt" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_pt SELECT * FROM words_pt_new;
DROP TABLE words_pt_new;
CREATE INDEX idx_words_pt_en ON words_pt(en);
CREATE INDEX idx_words_pt_gender ON words_pt(gender);

-- Russian (words_ru)
CREATE TABLE words_ru_new AS SELECT * FROM words_ru;
DROP TABLE words_ru;
CREATE TABLE "words_ru" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_ru SELECT * FROM words_ru_new;
DROP TABLE words_ru_new;
CREATE INDEX idx_words_ru_en ON words_ru(en);
CREATE INDEX idx_words_ru_gender ON words_ru(gender);

-- Arabic (words_ar)
CREATE TABLE words_ar_new AS SELECT * FROM words_ar;
DROP TABLE words_ar;
CREATE TABLE "words_ar" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_ar SELECT * FROM words_ar_new;
DROP TABLE words_ar_new;
CREATE INDEX idx_words_ar_en ON words_ar(en);
CREATE INDEX idx_words_ar_gender ON words_ar(gender);

-- Hindi (words_hi)
CREATE TABLE words_hi_new AS SELECT * FROM words_hi;
DROP TABLE words_hi;
CREATE TABLE "words_hi" (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (gender) REFERENCES gender_markers(code) ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO words_hi SELECT * FROM words_hi_new;
DROP TABLE words_hi_new;
CREATE INDEX idx_words_hi_en ON words_hi(en);
CREATE INDEX idx_words_hi_gender ON words_hi(gender);

-- 5. FOREIGN KEYを再有効化
PRAGMA foreign_keys = ON;

-- 6. 検証クエリ
SELECT 'Gender markers created:' as status;
SELECT * FROM gender_markers;

SELECT 'Testing gender validation:' as status;
-- これは成功するはず
-- INSERT INTO words_fr (en, translation, gender) VALUES ('test', 'test', 'm');

-- これは失敗するはず（不正な性別マーカー）
-- INSERT INTO words_fr (en, translation, gender) VALUES ('test2', 'test2', 'invalid');