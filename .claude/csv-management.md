# CSV管理システム手順書

## 概要
名詞の性別学習アプリにおける3つのCSVファイルによるデータ管理システムの完全な手順書。

## CSVファイル構成

### 1. word_meaning_translations.csv
**目的**: 英単語の多言語翻訳管理（11言語対応）
**場所**: `/data/word_meaning_translations.csv`
**形式**: TSV（タブ区切り）

```
en	meaning_en	meaning_ja	meaning_zh	meaning_fr	meaning_de	meaning_es	meaning_it	meaning_pt	meaning_ru	meaning_ar	meaning_hi
abbey	A building or buildings occupied by a community of monks or nuns.	修道院; 修道士や修道女の共同体が住む建物。	修道院; 僧侣或尼姑社区居住的建筑物。	Abbaye; bâtiment occupé par une communauté de moines ou de nonnes.	...
```

**列構成**:
- `en`: 英単語
- `meaning_en`: 英語での意味（名詞としての主要意味）
- `meaning_ja`～`meaning_hi`: 11言語での意味翻訳

### 2. word_examples.csv
**目的**: 英単語の例文管理
**場所**: `/data/word_examples.csv`
**形式**: TSV（タブ区切り）

```
en	meaning_en	example_en
abbey	A building or buildings occupied by a community of monks or nuns.	The old abbey on the hill has been a peaceful retreat for centuries.
abbreviation	A shortened form of a word or phrase.	The abbreviation 'Dr.' stands for Doctor in medical titles.
```

**列構成**:
- `en`: 英単語
- `meaning_en`: 英語での意味（参照用）
- `example_en`: 英語例文（名詞用法のみ）

### 3. word_gender_translations.csv
**目的**: 性別言語の翻訳・性別管理（8言語対応）
**場所**: `/data/word_gender_translations.csv`
**形式**: TSV（タブ区切り）

```
en	meaning_en	fr_translation	fr_gender	de_translation	de_gender	es_translation	es_gender	it_translation	it_gender	pt_translation	pt_gender	ru_translation	ru_gender	ar_translation	ar_gender	hi_translation	hi_gender
abbey	A building or buildings occupied by a community of monks or nuns.	abbaye	f	Abtei	f	abadía	f	abbazia	f	abadia	f	аббатство	n	دير	m	मठ	m
```

**列構成**:
- `en`: 英単語
- `meaning_en`: 英語での意味（参照用）
- 各言語ペア: `{言語}_translation`, `{言語}_gender`

## CSV作成・初期化手順

### 共通ルール
1. **形式**: TSVファイル（タブ区切り）- カンマを含む翻訳文への対応
2. **文字encoding**: UTF-8
3. **行順序**: words_en.id順（英単語のID順）固定
4. **行数**: 4659行（全英単語分）

### 初期化スクリプト例

#### 1. word_meaning_translations.csv 作成
```python
import sqlite3

conn = sqlite3.connect('data/noun_gender.db')
cursor = conn.cursor()

# words_enから全単語をid順に取得
cursor.execute('SELECT en FROM words_en ORDER BY id')
all_words = cursor.fetchall()

# word_meaningsから意味を取得
cursor.execute('SELECT en, meaning_en FROM word_meanings')
meanings_dict = dict(cursor.fetchall())

with open('data/word_meaning_translations.csv', 'w', encoding='utf-8') as f:
    # ヘッダー
    f.write('en\tmeaning_en\tmeaning_ja\tmeaning_zh\tmeaning_fr\tmeaning_de\tmeaning_es\tmeaning_it\tmeaning_pt\tmeaning_ru\tmeaning_ar\tmeaning_hi\n')
    
    # データ行（翻訳列は空で開始）
    for (en,) in all_words:
        meaning_en = meanings_dict.get(en, '')
        f.write(f'{en}\t{meaning_en}\t\t\t\t\t\t\t\t\t\t\n')

conn.close()
```

#### 2. word_examples.csv 作成
```python
# 同様にwords_en順で作成、example_en列は空
f.write('en\tmeaning_en\texample_en\n')
f.write(f'{en}\t{meaning_en}\t\n')
```

#### 3. word_gender_translations.csv 作成
```python
# 性別言語8言語分の列を作成
header = 'en\tmeaning_en\tfr_translation\tfr_gender\tde_translation\tde_gender\tes_translation\tes_gender\tit_translation\tit_gender\tpt_translation\tpt_gender\tru_translation\tru_gender\tar_translation\tar_gender\thi_translation\thi_gender\n'
f.write(header)
f.write(f'{en}\t{meaning_en}\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n')
```

## データ追加ルール

### 翻訳・例文品質基準
1. **meaning_enの解釈**: 英語の意味説明文**全体**を翻訳（セミコロン含め全文を翻訳）
2. **品詞制限**: 必ず名詞としての使用法のみ（動詞・形容詞禁止）
3. **文章品質**: 
   - 自然で適切な長さ
   - 宗教・政治的に中立
   - 暗い話題を避ける（単語自体が該当する場合は除く）

### 性別記号ルール
- **フランス語/スペイン語/イタリア語/ポルトガル語**: `m` (masculine), `f` (feminine)
- **ドイツ語**: `m` (der), `f` (die), `n` (das)
- **ロシア語**: `m`, `f`, `n`
- **アラビア語/ヒンディー語**: `m`, `f`

### 翻訳例
```
meaning_en: "A building or buildings occupied by a community of monks or nuns."
→ 説明文全体を翻訳
→ abbey → abbaye (f), Abtei (f), abadía (f)...

meaning_en: "Lack; not being present; missing; vacancy."
→ 説明文全体を翻訳「欠如; 存在しないこと; 不在; 空席」
→ absence → absence (f), Abwesenheit (f), ausencia (f)...
```

## データベース更新手順

**⚠️ 重要: 以下の手順では必ず専用スクリプトを使用してください**

### 1. word_meaning_translations → word_meanings テーブル

**推奨方法（スクリプト使用）:**
```bash
python scripts/sync_meaning_translations.py
```

**手動実装（参考用）:**
```python
import sqlite3, csv

conn = sqlite3.connect('data/noun_gender.db')
cursor = conn.cursor()

with open('data/word_meaning_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)  # ヘッダースキップ
    
    for row in reader:
        if len(row) == 12 and any(row[2:]):  # 翻訳が1つ以上ある
            cursor.execute('''
                INSERT OR REPLACE INTO word_meanings 
                (en, meaning_en, meaning_ja, meaning_zh, meaning_fr, meaning_de, 
                 meaning_es, meaning_it, meaning_pt, meaning_ru, meaning_ar, meaning_hi)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', row)

conn.commit()
conn.close()
```

### 2. word_examples → examples テーブル

**推奨方法（スクリプト使用）:**
```bash
python scripts/sync_examples.py
```

**手動実装（参考用）:**
```python
with open('data/word_examples.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)
    
    for row in reader:
        if len(row) >= 3 and row[2].strip():  # example_enが空でない
            cursor.execute('''
                INSERT OR REPLACE INTO examples (en, example_en)
                VALUES (?, ?)
            ''', (row[0], row[2]))
```

### 3. word_gender_translations → words_fr等 テーブル

**推奨方法（スクリプト使用）:**
```bash
python scripts/sync_gender_translations.py
```

**一括同期（全CSVを順次処理）:**
```bash
python scripts/sync_all.py
```

**手動実装（参考用）:**
```python
languages = {
    'fr': 2,  'de': 4,  'es': 6,  'it': 8,
    'pt': 10, 'ru': 12, 'ar': 14, 'hi': 16
}

with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)
    
    for row in reader:
        en = row[0]
        for lang_code, translation_col in languages.items():
            if len(row) > translation_col + 1:
                translation = row[translation_col]
                gender = row[translation_col + 1]
                
                if translation.strip() and gender.strip():
                    cursor.execute(f'''
                        INSERT OR REPLACE INTO words_{lang_code}
                        (en, translation, gender, verified_at, confidence_score)
                        VALUES (?, ?, ?, datetime('now'), 100)
                    ''', (en, translation, gender))
```

## 汎用スクリプト一覧

プロジェクトルートから実行してください：

### 個別同期スクリプト
- `python scripts/sync_meaning_translations.py` - 意味翻訳同期
- `python scripts/sync_examples.py` - 例文同期
- `python scripts/sync_gender_translations.py` - 性別翻訳同期

### 一括処理スクリプト
- `python scripts/sync_all.py` - 全CSV一括同期（推奨）

### スクリプト特徴
- エラーハンドリング完備
- 進捗表示・統計情報出力
- INSERT OR REPLACE による重複自動解決
- 列数チェック・品質検証

## 段階的作業手順

### Phase 1: CSV基盤整備
1. 3つのCSVファイルを初期化（全行作成、翻訳列空）
2. `meaning_en`列をword_meaningsテーブルから取得して埋める

### Phase 2: データ追加（アルファベット順）
1. **A語完了**: 312語すべて翻訳・例文・性別完了
2. **B語以降**: 順次追加予定

### Phase 3: データベース同期
1. **必須**: `python scripts/sync_all.py` で一括同期実行
2. 品質確認・エラー修正

## 意味翻訳作業手順 (word_meaning_translations.csv)

### 作業の進め方
1. **アルファベット順で段階的に実施**
   - A語から順番に翻訳を埋めていく
   - 作業範囲を明確にして品質を保つ

2. **翻訳作業の手順**
   ```
   1. CSVファイルを開く
   2. 対象範囲の英単語を確認
   3. meaning_enの最初の意味を基準に各言語へ翻訳
   4. 名詞としての適切な翻訳を記入
   5. 定期的に保存・バックアップ
   ```

3. **品質管理**
   - セミコロンルール厳守（最初の意味のみ翻訳）
   - 名詞用法の確保
   - 言語間の意味統一性確保

4. **データベース反映**
   ```bash
   python scripts/sync_meaning_translations.py
   ```

### 翻訳基準
- **基準**: `meaning_en`の最初の意味（セミコロン前）
- **品詞**: 必ず名詞として翻訳
- **品質**: 自然で正確な表現
- **統一性**: 全言語で同じ意味概念を表現

## トラブルシューティング

### 列数不整合エラー
**原因**: 翻訳文内のカンマがCSV区切り文字と認識
**解決**: TSV形式採用により解決済

### 重複データ
**解決**: `INSERT OR REPLACE`により自動解決

### 文字化け
**確認事項**: UTF-8エンコーディング使用確認

## 現在の進捗状況

### 完了済み
- ✅ CSV管理システム構築完了
- ✅ A語312語: 翻訳・例文・性別すべて完了
- ✅ データベース同期完了

### 次回作業
- B語以降の段階的追加
- 品質改善・検証作業

---

## 例文翻訳管理 (example_translations.csv)

### 4. example_translations.csv
**目的**: 英語例文の多言語翻訳管理（10言語対応）
**場所**: `/data/example_translations.csv`
**形式**: TSV（タブ区切り）

```
example_en	lang	translation
The old abbey on the hill has been a peaceful retreat for centuries.	de	Die alte Abtei auf dem Hügel war jahrhundertelang ein friedlicher Rückzugsort.
The old abbey on the hill has been a peaceful retreat for centuries.	fr	La vieille abbaye sur la colline est un refuge paisible depuis des siècles.
The old abbey on the hill has been a peaceful retreat for centuries.	es	La antigua abadía en la colina ha sido un refugio pacífico durante siglos.
```

**列構成**:
- `example_en`: 英語例文（examples.example_enから取得）
- `lang`: 言語コード（fr, de, es, it, pt, ru, ar, hi, ja, zh）
- `translation`: その言語での例文翻訳

### 例文翻訳CSV初期化
```python
import sqlite3

conn = sqlite3.connect('data/noun_gender.db')
cursor = conn.cursor()

# 既存の英語例文を全て取得
cursor.execute('SELECT example_en FROM examples ORDER BY en')
all_examples = [row[0] for row in cursor.fetchall()]

# 対象言語リスト
target_languages = ['fr', 'de', 'es', 'it', 'pt', 'ru', 'ar', 'hi', 'ja', 'zh']

with open('data/example_translations.csv', 'w', encoding='utf-8') as f:
    # ヘッダー
    f.write('example_en\tlang\ttranslation\n')
    
    # 各例文×各言語の組み合わせを作成（翻訳列は空）
    for example_en in all_examples:
        for lang in target_languages:
            f.write(f'{example_en}\t{lang}\t\n')

conn.close()
```

## 例文翻訳作業手順

### 翻訳作業の進め方
1. **段階的実施**
   - A語の例文から開始
   - 1言語ずつ完了させる（例：全例文のドイツ語翻訳→フランス語翻訳）
   - または1例文ずつ全言語翻訳する

2. **翻訳品質基準**
   - 自然で流暢な翻訳
   - 元の意味・ニュアンスを正確に保持
   - 対象言語として自然な表現
   - 例文中の名詞の性別を正しく反映

3. **例文翻訳ルール**
   - 英語例文の構造・意味を正確に翻訳
   - 文体は元の例文に合わせる（フォーマル/カジュアル）
   - 文化的文脈を適切に調整
   - 単語の性別・格変化を正確に反映

### データベース同期（例文翻訳）

**推奨方法（スクリプト使用）:**
```bash
python scripts/sync_example_translations.py
```

**手動実装（参考用）:**
```python
import sqlite3, csv

conn = sqlite3.connect('data/noun_gender.db')
cursor = conn.cursor()

with open('data/example_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)  # ヘッダースキップ
    
    for row in reader:
        if len(row) == 3 and row[2].strip():  # 翻訳が空でない
            cursor.execute('''
                INSERT OR REPLACE INTO example_translations 
                (example_en, lang, translation)
                VALUES (?, ?, ?)
            ''', row)

conn.commit()
conn.close()
```

## 更新されたスクリプト一覧

### 個別同期スクリプト
- `python scripts/sync_meaning_translations.py` - 意味翻訳同期
- `python scripts/sync_examples.py` - 例文同期
- `python scripts/sync_gender_translations.py` - 性別翻訳同期
- `python scripts/sync_example_translations.py` - **例文翻訳同期**（新規）

### 一括処理スクリプト
- `python scripts/sync_all.py` - 全CSV一括同期（例文翻訳含む）

## 例文翻訳進捗管理

### 推奨作業順序
1. **Phase 1**: A語の例文翻訳（約300例文）
   - ドイツ語翻訳完了
   - フランス語翻訳完了
   - その他言語順次実施

2. **Phase 2**: B語以降の例文翻訳
   - アルファベット順で段階的実施

### 品質管理・レビュー
- 専用レビューガイドライン: `.claude/example_translations_review_guidelines.md`
- 翻訳品質チェックリスト
- 言語別ネイティブチェック（可能な場合）

**最終更新**: 2025-08-17 - 例文翻訳管理システム追加
**作成者**: Claude Code Assistant