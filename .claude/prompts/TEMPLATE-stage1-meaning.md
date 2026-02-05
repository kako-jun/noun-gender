# Stage 1: 英語意味定義生成タスク

## あなたの役割
あなたは**英語ネイティブの辞書編集者**です。`data/word_gender_translations.csv`の**meaning_en列のみ**を生成してください。

## 重要：ゼロから生成モード
- 既存の`meaning_en`は**完全に無視**してください
- `en`列（英単語）だけを見て、**ゼロから意味説明を作成**します
- 既存データと偶然一致してもOKです

## タスク概要
- **ファイル**: `data/word_gender_translations.csv`
- **総単語数**: 4,592語
- **担当列**: `meaning_en`
- **作業範囲**: **全行（1行目〜4,592行目）**

---

## 必須ルール（厳格に遵守）

### 1. 名詞としての意味のみ
- 英単語の**名詞用法のみ**を説明
- 動詞・形容詞・副詞の意味は書かない

**例**:
```
✅ abstract (名詞): "A summary of the contents of a book, article, or formal speech"
❌ abstract (形容詞): "Existing in thought or as an idea but not concrete"
```

### 2. 説明文の形式
- **最低20文字以上**の説明文
- **同義語のみ**は禁止（必ず説明文にする）
- 最も一般的な意味を最初に記載

**良い例**:
```
anxiety: A feeling of unease, nervousness, or concern about something with an uncertain outcome
apartment: A self-contained residential unit occupying part of a building
ability: The possession of the means or skill to do something
```

**悪い例（これは絶対にダメ）**:
```
❌ anxiety: Worry  ← 同義語のみ（説明ではない）
❌ apartment: Flat  ← 同義語のみ
❌ application: Use  ← 短すぎる
❌ art: Art  ← 同じ単語（意味不明）
```

### 3. 複数の意味がある場合
- セミコロン（`;`）で区切る
- 最も一般的な意味を最初に記載
- 各意味は独立した説明文にする

**例**:
```
absence: Lack of something; the state of being away from a place or person; missing; vacancy
abstract: A summary of contents; a concept or idea not associated with a physical object
```

---

## 翻訳例（完全版）

### 例1: 建物・場所
```
入力:
  en: abbey

処理:
  ステップ1: "abbey"の名詞としての意味を考える
    → 「修道院」という建物
  
  ステップ2: 英語で説明文を書く（"abbey"という単語は使わない）
    → 「修道士や修道女の共同体が使う建物」

正解:
  meaning_en: "A building or buildings occupied by a community of monks or nuns"

不正解:
  ❌ "Abbey"  ← 同じ単語
  ❌ "Monastery"  ← 同義語のみ
  ❌ "Building"  ← 抽象的すぎる
```

### 例2: 抽象概念（複数の意味）
```
入力:
  en: anxiety

処理:
  ステップ1: "anxiety"の名詞としての主要な意味
    → 「不安」という感情
  
  ステップ2: 詳細に説明
    → 「何か不確実なことに対する不安や心配の感情」

正解:
  meaning_en: "A feeling of unease, nervousness, or concern about something with an uncertain outcome"

不正解:
  ❌ "Worry"  ← 同義語のみ（説明ではない）
  ❌ "A bad feeling"  ← 抽象的すぎる
  ❌ "Being anxious"  ← 形容詞から派生（循環的）
```

### 例3: 日常物
```
入力:
  en: apartment

処理:
  ステップ1: "apartment"の名詞としての意味
    → アメリカ英語で「集合住宅の一室」
  
  ステップ2: 詳細に説明
    → 「建物の一部を占める独立した居住ユニット」

正解:
  meaning_en: "A self-contained residential unit occupying part of a building"

不正解:
  ❌ "Flat"  ← 同義語のみ（イギリス英語）
  ❌ "Home"  ← 抽象的すぎる
  ❌ "Room"  ← 不正確
```

### 例4: 複数の意味（セミコロン使用）
```
入力:
  en: abstract

処理:
  ステップ1: "abstract"の名詞用法は2つ
    → 1. 「要約」（論文などの）
    → 2. 「抽象概念」
  
  ステップ2: 最も一般的な意味を最初に
    → 「要約」の方が一般的

正解:
  meaning_en: "A summary of the contents of a book, article, or formal speech; a concept or idea not associated with a specific instance"

不正解:
  ❌ "Summary"  ← 同義語のみ
  ❌ "Abstract thing"  ← 循環的
  ❌ "Not concrete"  ← 形容詞の意味
```

---

## 作業手順

### ステップ1: CSVファイルを読み込む
```python
import csv

with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    rows = list(reader)

print(f"総行数: {len(rows)}")
```

### ステップ2: 全4,592行の meaning_en を生成
```python
import csv

# ファイルを読み込み
with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# 全行の meaning_en を生成（既存データは無視）
for i, row in enumerate(rows, start=1):
    en = row['en']
    
    # 英単語の名詞としての意味を生成
    # ※ 既存の meaning_en は見ない！
    meaning_en = generate_noun_definition(en)
    
    # 品質チェック
    if len(meaning_en) < 20:
        print(f"警告: {en} の定義が短すぎます ({len(meaning_en)}文字)")
    
    if en.lower() in meaning_en.lower():
        print(f"警告: {en} の定義に単語自身が含まれています")
    
    # 上書き
    row['meaning_en'] = meaning_en
    
    # 進捗表示（100行ごと）
    if i % 100 == 0:
        print(f"進捗: {i}/{len(rows)} ({i/len(rows)*100:.1f}%)")

# ファイルを上書き保存
with open('data/word_gender_translations.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ 生成完了: {len(rows)}行")
```

### ステップ3: 品質チェック
```python
# 短すぎる定義をチェック
short_defs = []
for row in rows:
    if len(row['meaning_en']) < 20:
        short_defs.append((row['en'], row['meaning_en'], len(row['meaning_en'])))

if short_defs:
    print(f"⚠️ 短すぎる定義: {len(short_defs)}件")
    for en, meaning, length in short_defs[:10]:
        print(f"  {en}: {meaning} ({length}文字)")
else:
    print("✅ 全ての定義が20文字以上")

# 同義語のみの定義をチェック（簡易判定）
single_word_defs = []
for row in rows:
    meaning = row['meaning_en'].strip()
    if ' ' not in meaning and ';' not in meaning:
        single_word_defs.append((row['en'], meaning))

if single_word_defs:
    print(f"⚠️ 単語1語のみ: {len(single_word_defs)}件")
    for en, meaning in single_word_defs[:10]:
        print(f"  {en}: {meaning}")
else:
    print("✅ 全ての定義が説明文形式")
```

### ステップ4: 進捗を記録
```bash
mkdir -p .claude/workflow
echo "stage1: 4592/4592 (100%)" > .claude/workflow/progress-stage1.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage1.txt
echo "品質チェック: 短すぎる定義 0件、単語のみ 0件" >> .claude/workflow/progress-stage1.txt
```

### ステップ5: 変更をコミット
```bash
git add data/word_gender_translations.csv .claude/workflow/progress-stage1.txt
git commit -m "feat(stage1): generate meaning_en for all 4592 words from scratch"
```

---

## 品質チェックリスト

生成完了後、以下を必ず確認：

1. ✅ **文字数**: 全4,592語が20文字以上
2. ✅ **説明文形式**: 単語1語だけの定義が0件
3. ✅ **名詞用法**: 動詞・形容詞の意味が含まれていない
4. ✅ **循環参照なし**: 定義に単語自身が含まれていない（例: "art: Art"）
5. ✅ **自然な英語**: 文法的に正しい説明文

---

## 成功基準

✅ 4,592行すべての`meaning_en`が生成されている  
✅ すべて20文字以上の説明文  
✅ すべて名詞の意味として説明されている  
✅ 同義語のみの定義が0件  
✅ 循環参照が0件  
✅ 自然で正確な英語

---

## 禁止事項

❌ 動詞・形容詞の意味で説明  
❌ 同義語のみ（例: "Worry", "Flat"）  
❌ 短すぎる定義（20文字未満）  
❌ 循環参照（例: "abbey: An abbey"）  
❌ 他の列を編集

---

## 完了報告

作業完了後、以下を報告してください：

1. ✅ 生成完了: 4,592/4,592行
2. ✅ 文字数チェック: 20文字未満が0件
3. ✅ 単語のみチェック: 0件
4. ✅ 循環参照チェック: 0件
5. ✅ コミット完了
6. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage1.txt`

---

**担当列**: meaning_en  
**品質基準**: 20文字以上、説明文形式、名詞の意味のみ  
**完了条件**: 全4,592行の意味定義生成完了
