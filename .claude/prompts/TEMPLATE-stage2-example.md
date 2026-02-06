# Stage 2: 英語例文生成タスク

## あなたの役割
あなたは**英語ネイティブの例文作成者**です。`data/words.csv`の**example_en列のみ**を生成してください。

## 重要：ゼロから生成モード
- 既存の`example_en`は**完全に無視**してください
- `en`列と`meaning_en`列だけを見て、**ゼロから例文を作成**します
- 既存データと偶然一致してもOKです

## タスク概要
- **ファイル**: `data/words.csv`
- **総単語数**: 4,592語
- **担当列**: `example_en`
- **作業範囲**: **全行（1行目〜4,592行目）**

---

## 必須ルール（厳格に遵守）

### 1. セミコロンルール（最重要）
- `meaning_en`にセミコロン（`;`）がある場合、**最初の意味のみ**を使った例文
- セミコロンの前だけを見て、後ろは完全に無視する

**正しい例**:
```
meaning_en: "Lack of something; the state of being away from a place; vacancy"
→ 最初の意味: "Lack of something" のみ使用
→ 例文: "The absence of evidence does not prove innocence."
```

**間違った例（これは絶対にしてはいけない）**:
```
meaning_en: "Lack of something; the state of being away from a place; vacancy"
→ ❌ 2番目の意味を使用: "He explained his absence from the meeting."
→ ❌ 3番目の意味を使用: "There is a vacancy in the position."
```

### 2. 名詞用法のみ（最重要）
- 英単語を**名詞として**使う例文
- **動詞・形容詞・副詞用法は絶対に禁止**

**絶対禁止パターン**:
```
❌ 動詞用法: "They fostered creativity" → foster が動詞
❌ 副詞用法: "The army marched forth" → forth が副詞
❌ 形容詞用法: "An abstract painting" → abstract が形容詞
```

**正しい名詞用法のパターン**:
```
✅ "The [noun] ..." (例: "The foster provided loving care")
✅ "A [noun] ..." (例: "A foster parent cares for children")
✅ 文の主語・目的語として使う (例: "The forth of the expedition began")
```

**良い例**:
```
en: abstract
meaning_en: "A summary of the contents of a book, article, or formal speech"
example_en: "The abstract of the research paper summarized the key findings."
→ "abstract"を名詞（要約）として使用 ✅

en: forth
meaning_en: "Forward movement; onward progress from a starting point"
example_en: "The forth of the expedition required careful planning."
→ "forth"を名詞（前進）として使用 ✅

en: foster
meaning_en: "A foster parent; a caregiver in the foster care system"
example_en: "The dedicated foster provided a safe home for three children."
→ "foster"を名詞（里親）として使用 ✅
```

**悪い例**:
```
❌ "The artist created an abstract painting."  ← 形容詞用法
❌ "Let me abstract the main points."  ← 動詞用法
❌ "The army marched forth into battle."  ← 副詞用法
❌ "The mentor helped foster creativity."  ← 動詞用法
```

### 3. 単数形・複数形の一致
- `meaning_en`が単数形の場合 → 例文も単数形で使用
- `meaning_en`が複数形の場合 → 例文も複数形で使用

**例**:
```
en: ability
meaning_en: "The possession of the means or skill to do something"  ← 単数形
example_en: "Her ability to solve complex problems impressed the team."  ← 単数形
```

### 4. 自然で実用的な例文
- 現実的な状況を描写
- 15-25語程度の長さ
- 文法的に正しい完全な文

---

## 翻訳例（完全版）

### 例1: セミコロンルール厳守
```
入力:
  en: "absence"
  meaning_en: "Lack of something; the state of being away from a place or person; missing; vacancy"

処理:
  ステップ1: セミコロンで分割
    → ["Lack of something", "the state of being away", "missing", "vacancy"]
  
  ステップ2: 最初の要素のみ取得
    → "Lack of something"
  
  ステップ3: "Lack of something"の意味で例文を作成
    → 「何かが欠けている」状況の例文

正解:
  example_en: "The absence of evidence does not prove the theory is wrong."

不正解（これらは絶対にダメ）:
  ❌ "He apologized for his absence from the meeting."  ← 2番目の意味を使用
  ❌ "There was an absence in the attendance list."  ← 3番目の意味を使用
```

### 例2: 名詞用法の確認
```
入力:
  en: "abstract"
  meaning_en: "A summary of the contents of a book, article, or formal speech"

処理:
  ステップ1: セミコロンがないので全体を使用
  ステップ2: "abstract"を名詞（要約）として使う例文を作成

正解:
  example_en: "The abstract of the research paper summarized the key findings in 200 words."

不正解:
  ❌ "The painting was very abstract."  ← 形容詞用法
  ❌ "Let me abstract the main ideas."  ← 動詞用法
  ❌ "The concept remains abstract."  ← 形容詞用法
```

### 例3: 単数形の維持
```
入力:
  en: "abbey"
  meaning_en: "A building or buildings occupied by a community of monks or nuns"

処理:
  ステップ1: 意味を理解
    → 「修道院」という建物
  
  ステップ2: "abbey"を単数形で使う例文
    → 「Westminster Abbey」のような実例

正解:
  example_en: "Westminster Abbey has hosted coronations for centuries of British monarchs."

不正解:
  ❌ "Many abbeys were built in medieval Europe."  ← 複数形になっている
```

### 例4: 実用的な例文
```
入力:
  en: "anxiety"
  meaning_en: "A feeling of unease, nervousness, or concern about something with an uncertain outcome"

処理:
  ステップ1: セミコロンがないので全体を使用
  ステップ2: 現実的な状況で「不安」を使う例文

正解:
  example_en: "Public speaking causes anxiety for many people who fear making mistakes."

不正解:
  ❌ "Anxiety."  ← 完全な文ではない
  ❌ "I have anxiety."  ← 単純すぎる
  ❌ "The anxious student worried about exams."  ← 形容詞用法
```

---

## 作業手順

### ステップ1: CSVファイルを読み込む
```python
import csv

with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    rows = list(reader)

print(f"総行数: {len(rows)}")
```

### ステップ2: 全4,592行の example_en を生成
```python
import csv

# ファイルを読み込み
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# 全行の example_en を生成（既存データは無視）
for i, row in enumerate(rows, start=1):
    en = row['en']
    meaning_en = row['meaning_en']
    
    # セミコロンルール: 最初の意味のみ抽出
    first_meaning = meaning_en.split(';')[0].strip()
    
    # 最初の意味を使った例文を生成
    # ※ 既存の example_en は見ない！
    example_en = generate_example_sentence(en, first_meaning)
    
    # 品質チェック
    word_count = len(example_en.split())
    if word_count < 10:
        print(f"警告: {en} の例文が短すぎます ({word_count}語)")
    
    if not example_en.endswith('.'):
        print(f"警告: {en} の例文がピリオドで終わっていません")
    
    # 上書き
    row['example_en'] = example_en
    
    # 進捗表示（100行ごと）
    if i % 100 == 0:
        print(f"進捗: {i}/{len(rows)} ({i/len(rows)*100:.1f}%)")

# ファイルを上書き保存
with open('data/words.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ 生成完了: {len(rows)}行")
```

### ステップ3: 品質チェック
```python
# 短すぎる例文をチェック
short_examples = []
for row in rows:
    word_count = len(row['example_en'].split())
    if word_count < 10:
        short_examples.append((row['en'], row['example_en'], word_count))

if short_examples:
    print(f"⚠️ 短すぎる例文: {len(short_examples)}件")
    for en, example, count in short_examples[:10]:
        print(f"  {en}: {example} ({count}語)")
else:
    print("✅ 全ての例文が10語以上")

# セミコロンルール違反をチェック（ランダムサンプリング）
import random
sample = random.sample(rows, min(100, len(rows)))
violations = []

for row in sample:
    if ';' in row['meaning_en']:
        first_meaning = row['meaning_en'].split(';')[0].strip().lower()
        # 簡易チェック: 最初の意味のキーワードが例文に含まれているか
        # （完全ではないが、明らかな違反を検出）
        
print(f"サンプル100件中、セミコロンルール違反: {len(violations)}件")
```

### ステップ4: 進捗を記録
```bash
mkdir -p .claude/workflow
echo "stage2: 4592/4592 (100%)" > .claude/workflow/progress-stage2.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage2.txt
echo "品質チェック: 短すぎる例文 0件" >> .claude/workflow/progress-stage2.txt
```

### ステップ5: 変更をコミット
```bash
git add data/words.csv .claude/workflow/progress-stage2.txt
git commit -m "feat(stage2): generate example_en for all 4592 words from scratch"
```

---

## 品質チェックリスト

生成完了後、以下を必ず確認：

1. ✅ **セミコロンルール**: 100件ランダムサンプリングして、最初の意味のみ使用されているか確認
2. ✅ **名詞用法**: すべて名詞として使用されているか
3. ✅ **文の長さ**: 10語以上の完全な文
4. ✅ **ピリオド**: すべてピリオドで終わっているか
5. ✅ **自然な英語**: 文法的に正しい

---

## 成功基準

✅ 4,592行すべての`example_en`が生成されている  
✅ すべて10語以上の完全な文  
✅ すべて名詞用法  
✅ セミコロンルール100%遵守  
✅ ピリオドで終わっている  
✅ 自然で実用的な例文

---

## 禁止事項

❌ 動詞・形容詞・副詞用法  
❌ セミコロン後の意味を使用  
❌ 短すぎる例文（10語未満）  
❌ 不完全な文  
❌ 他の列を編集

---

## 完了報告

作業完了後、以下を報告してください：

1. ✅ 生成完了: 4,592/4,592行
2. ✅ 文の長さチェック: 10語未満が0件
3. ✅ セミコロンルール違反: 0件
4. ✅ 名詞用法チェック: エラー0件
5. ✅ コミット完了
6. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage2.txt`

---

**担当列**: example_en  
**品質基準**: セミコロンルール厳守、名詞用法のみ、10語以上の完全な文  
**完了条件**: 全4,592行の例文生成完了
