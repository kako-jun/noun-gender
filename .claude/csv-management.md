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
2. **データベース整合性確認**: `v_statistics`ビューで検証
3. 品質確認・エラー修正

#### データベース整合性確認手順
CSV同期後は必ず以下のコマンドでデータ整合性を確認してください：

```bash
# SQLiteでデータベースに接続
sqlite3 data/noun_gender.db

# 統計情報ビューで全テーブルのレコード数を確認
SELECT * FROM v_statistics ORDER BY table_name;
```

**期待される結果例:**
```
example_translations|45920  ← example_translations.csv (45,921行 - ヘッダー)
examples|4595              ← word_examples.csv (4,593行 + 2行の重複例文)
memory_tricks|122          ← memory_tricks_creation.csv から生成
v_multilingual_search|41328 ← 検索インデックス（自動計算）
word_meanings|4593         ← word_meaning_translations.csv (4,593行)
words_ar|4592              ← word_gender_translations.csv (4,592行、空行除外)
words_de|4592              ← 同上
words_en|4592              ← 同上
words_es|4592              ← 同上
words_fr|4592              ← 同上
words_hi|4592              ← 同上
words_it|4592              ← 同上
words_pt|4592              ← 同上
words_ru|4592              ← 同上
```

**チェックポイント:**
- CSVファイル行数（`wc -l data/*.csv`）とDBレコード数の一致確認
- 各言語テーブル（words_xx）のレコード数が同じか確認
- 差異がある場合は同期エラーの可能性があるため再実行

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

**⚠️ 重要: 実際の形式**:
```
words_en	example_en	lang	translation
abbey	Westminster Abbey has hosted coronations for centuries of British monarchs.	de	Westminster Abbey hat jahrhundertelang Krönungen britischer Monarchen ausgerichtet.
abbey	Westminster Abbey has hosted coronations for centuries of British monarchs.	fr	L'abbaye de Westminster a accueilli les couronnements des monarques britanniques pendant des siècles.
```

**列構成**:
- `words_en`: 英単語（参照用）
- `example_en`: 英語例文（examples.example_enから取得）
- `lang`: 言語コード（de, fr, es, it, pt, ru, ar, hi, ja, zh）
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

### ⚠️ 最重要ルール
**絶対に行を追加・削除しない。既存の空欄のみを埋める。**

### 翻訳作業の進め方
1. **CSVファイルを直接編集**
   - `/data/example_translations.csv`をそのまま編集
   - 空の`translation`列（4列目）のみを埋める
   - 新しいファイルは作成しない
   - バックアップも作成しない

2. **作業手順**:
   ```
   1. example_translations.csvの空欄を特定
   2. 該当行のtranslation列に翻訳を直接記入
   3. 定期的にファイルを保存
   4. 同期スクリプト実行
   ```

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
python scripts/sync_csv_to_db.py
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

---

## 記憶術管理 (memory_tricks.csv)

### 5. memory_tricks.csv
**目的**: 名詞性別の記憶術・助記法管理（多言語UI対応）
**場所**: `/data/memory_tricks.csv`
**形式**: TSV（タブ区切り）

```
en	translation_lang	ui_lang	trick_text
cat	fr	ja	フランス語では「シャッ」という鋭い鳴き声が男性的に聞こえることから男性名詞とされています。
cat	fr	en	In French, the sharp "chat" sound is perceived as masculine, making it a masculine noun.
cat	fr	zh	在法语中，"chat"的尖锐发音听起来很男性化，因此是阳性名词。
cat	de	ja	ドイツ語では家庭的で母性的な動物として捉えられ、子猫を育てる姿から女性名詞とされています。
```

**列構成**:
- `en`: 英単語（words_en.enへのFK制約）
- `translation_lang`: 対象言語（fr, de, es, it, pt, ru, ar, hi）
- `ui_lang`: UI言語（ja, en, zh）
- `trick_text`: 記憶術テキスト（その性別になる理由・覚え方）

### データベース制約
- **PRIMARY KEY**: `id` (AUTOINCREMENT)
- **UNIQUE制約**: `(en, translation_lang, ui_lang)` - 同じ組み合わせの重複防止
- **FOREIGN KEY**: `en` → `words_en(en)` CASCADE制約
- **INDEX**: `en`列にインデックス

### 記憶術CSV初期化
```python
import sqlite3

conn = sqlite3.connect('data/noun_gender.db')
cursor = conn.cursor()

# 性別がある全言語の全単語を取得
cursor.execute('''
    SELECT DISTINCT en, lang as translation_lang
    FROM v_all_translations 
    WHERE gender IN ('m', 'f', 'n')
    ORDER BY en, translation_lang
''')
all_combinations = cursor.fetchall()

# UI言語リスト
ui_languages = ['ja', 'en', 'zh']

with open('data/memory_tricks.csv', 'w', encoding='utf-8') as f:
    # ヘッダー
    f.write('en\ttranslation_lang\tui_lang\ttrick_text\n')
    
    # 各単語×各対象言語×各UI言語の組み合わせを作成（記憶術は空）
    for en, translation_lang in all_combinations:
        for ui_lang in ui_languages:
            f.write(f'{en}\t{translation_lang}\t{ui_lang}\t\n')

conn.close()
```

## 記憶術作成手順

### 記憶術の品質基準
1. **説明内容**:
   - なぜその性別になるのかの論理的説明
   - 文化的・言語学的背景
   - 覚えやすい関連付け・語呂合わせ

2. **文体・品質**:
   - UI言語に応じた自然な表現
   - 100-200文字程度の適切な長さ
   - 教育的でわかりやすい内容
   - 文化的に適切・中立的

3. **技術的要件**:
   - 各UI言語での正確な文法
   - 専門用語の適切な使用
   - 一貫した説明スタイル

### 記憶術作成作業手順

#### 1. 段階的実施
```
Phase 1: 基本語彙から開始（A語から順次）
Phase 2: フランス語・ドイツ語を優先（データ充実度高）
Phase 3: その他言語（es, it, pt, ru, ar, hi）展開
Phase 4: 全UI言語対応（ja → en → zh順）
```

#### 2. 作業プロセス
```
1. 対象単語・言語の選定
2. 言語学的調査（語源・文法的性別の理由）
3. 記憶術テキスト作成（UI言語別）
4. 品質レビュー・文体チェック
5. CSVファイルへの記入
6. データベース同期
```

#### 3. 記憶術の種類・アプローチ
- **語源ベース**: ラテン語・古フランス語からの由来
- **音韻ベース**: 語尾音と性別の関連性
- **文化ベース**: その言語圏での文化的認識
- **連想ベース**: 覚えやすい関連付け・イメージ
- **文法ベース**: 語尾変化パターンの説明

### データベース同期（記憶術）

**推奨方法（スクリプト使用）:**
```bash
python scripts/sync_memory_tricks.py
```

**手動実装（参考用）:**
```python
import sqlite3, csv

conn = sqlite3.connect('data/noun_gender.db')
cursor = conn.cursor()

with open('data/memory_tricks.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)  # ヘッダースキップ
    
    for row in reader:
        if len(row) == 4 and row[3].strip():  # trick_textが空でない
            cursor.execute('''
                INSERT OR REPLACE INTO memory_tricks 
                (en, translation_lang, ui_lang, trick_text)
                VALUES (?, ?, ?, ?)
            ''', row)

conn.commit()
conn.close()
```

## 記憶術進捗管理

### 現在の状況
- **既存データ**: 18件（cat, dogなど基本語彙のfr/de記憶術）
- **対象範囲**: 全4,592語 × 8言語 = 36,736組み合わせ
- **UI言語**: 3言語（ja, en, zh）
- **総必要記憶術数**: 110,208件（理論上最大）

### 推奨作業順序
1. **Phase 1**: A語のフランス語・ドイツ語記憶術（日本語UI）
2. **Phase 2**: A語の記憶術を英語・中国語UIに展開
3. **Phase 3**: A語の他言語（es, it, pt, ru, ar, hi）記憶術
4. **Phase 4**: B語以降の段階的展開

### 品質管理・レビュー
- 記憶術専用レビューガイドライン: `.claude/memory_tricks_review_guidelines.md`
- 言語学的正確性チェック
- 文化的適切性確認
- UI言語別の文体統一性確認

## 更新されたスクリプト一覧

### 個別同期スクリプト
- `python scripts/sync_meaning_translations.py` - 意味翻訳同期
- `python scripts/sync_examples.py` - 例文同期
- `python scripts/sync_gender_translations.py` - 性別翻訳同期
- `python scripts/sync_csv_to_db.py` - 例文翻訳同期
- `python scripts/sync_memory_tricks_from_csv.py` - **記憶術同期**（新規）

### 一括処理スクリプト
- `python scripts/sync_all.py` - 全CSV一括同期（5つのCSV: 意味翻訳、例文、性別翻訳、例文翻訳、記憶術）

---

## 記憶術作成ワークフロー (memory_tricks_creation.csv)

### 6. memory_tricks_creation.csv
**目的**: 記憶術作成・翻訳ワークフロー管理（作業効率化）
**場所**: `/data/memory_tricks_creation.csv`
**形式**: TSV（タブ区切り）

```
en	meaning_en	target_lang	translation	gender	ui_lang	trick_text_en	trick_text_translated	status
abbey	A building occupied by monks or nuns	fr	abbaye	f	en	In French, abbey is feminine because it represents a nurturing, maternal community space.		draft
abbey	A building occupied by monks or nuns	fr	abbaye	f	ja			empty
abbey	A building occupied by monks or nuns	fr	abbaye	f	zh			empty
```

**列構成**:
- `en`: 英単語（words_en.enへのFK制約対象）
- `meaning_en`: 英語の意味（参照用・記憶術作成のヒント）
- `target_lang`: 対象言語（fr, de, es, it, pt, ru, ar, hi）
- `translation`: その言語での翻訳
- `gender`: **重要**: その言語での性別（m/f/n）※記憶術内容の正確性確保
- `ui_lang`: 表示言語（en, ja, zh, fr, de, es, it, pt, ru, ar, hi）
- `trick_text_en`: 英語で作成した記憶術（作成者記入）
- `trick_text_translated`: 翻訳された記憶術（翻訳作業で記入）
- `status`: 作業状況（empty/draft/ready/completed）

### 記憶術作成ワークフロー

#### Phase 1: 英語記憶術作成（簡潔版）
```
1. target_lang='fr', ui_lang='en'の行を選択
2. gender列を確認（重要：正しい性別の記憶術を作成）
3. trick_text_en列に英語記憶術を記入
   - 冗長な前置き不要："In French, X is feminine because..."
   - 理由に集中："Represents nurturing, maternal sanctuary..."
   - 50-100文字程度で簡潔に
4. status列を'draft'に変更
```

#### Phase 2: 多言語翻訳（簡潔版）
```
1. 同じen+target_langの他のui_lang行を処理
2. trick_text_enを各言語に翻訳してtrick_text_translated列に記入
   - 冗長な前置き削除：「〜語では〜名詞です。なぜなら、」不要
   - 理由のみ翻訳：「〜を表すため」「〜によるため」で終わる
   - 各言語で50-100文字程度
3. 翻訳完了後status列を'ready'に変更
```

#### Phase 3: データベース反映
```python
# 専用同期スクリプト作成予定
python scripts/sync_memory_tricks_from_csv.py
```

### 記憶術作成ガイドライン

#### 重要原則：簡潔性重視
✅ **理由に集中**: 「〜語では〜は〜名詞です。なぜなら、」などの冗長な前置きは不要  
✅ **核心のみ**: 性別の根拠となる理由のみを簡潔に記述  
✅ **記憶効率**: 覚えやすさを最優先、説明は最小限に

#### 品質基準
1. **性別根拠明確化**: なぜその性別なのかの論理的説明（理由のみ）
2. **簡潔性**: 50-100文字程度の短い説明（従来の100-200文字から短縮）
3. **文化的中立性**: 宗教・政治的偏見を避ける
4. **記憶効果**: 覚えやすい関連付け・語呂合わせ

#### 記憶術の書き方
**❌ 悪い例（冗長）**:
```
フランス語では「abbaye」は女性名詞です。なぜなら、心の避難所を求める魂たちに世話と保護を提供する精神的な母と父がいる、育み深い母性的聖域を表すからです。
```

**✅ 良い例（簡潔）**:
```
精神的な母と父が世話と保護を提供する、育み深い母性的聖域を表すため。
```

#### 記憶術の種類と簡潔な表現例
- **語源ベース**: 「ラテン語の〜（男性形）から派生したため」
- **音韻ベース**: 「語尾-ungは抽象概念で女性性と結びつくため」
- **文化ベース**: 「力強さ・活力の象徴として男性的属性と結びつくため」
- **連想ベース**: 「〜のイメージが〜性的特徴と関連するため」

### データ統計（2025-08-17現在）
- **対象単語**: 175語（A語基本語彙、8文字以下）
- **総組み合わせ**: 15,400件（175語 × 8言語 × 11UI言語）
- **作業状況**: 全てempty（記憶術作成待ち）

**最終更新**: 2025-08-17 - 記憶術簡潔性重視ガイドライン更新
**作成者**: Claude Code Assistant