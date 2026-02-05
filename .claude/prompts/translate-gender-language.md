# 性別付き翻訳タスク: {LANGUAGE}

## あなたの役割
あなたは**{LANGUAGE_NATIVE}言語の専門翻訳者**です。`data/word_gender_translations.csv`の**{LANGUAGE}列のみ**を完璧に翻訳してください。

## ファイル構造
- **ファイル**: `data/word_gender_translations.csv`
- **形式**: TSV（タブ区切り）
- **編集対象列**: `{LANGUAGE}_translation`, `{LANGUAGE}_gender`
- **総行数**: 4,593行（ヘッダー除く）

## 必須ルール（厳格に遵守）

### 1. 翻訳対象の特定
- `en`列: 英単語（**必ず単数形の名詞**）
- `meaning_en`列: 英語での意味説明
- **セミコロン（;）がある場合**: 最初の意味**のみ**を翻訳
  - 例: "Supply; shares; inventory" → "Supply"のみ翻訳

### 2. 翻訳品質基準
✅ **必須条件**:
- 必ず**名詞**として翻訳（動詞・形容詞は禁止）
- {LANGUAGE_NATIVE}で最も自然で正確な訳語
- 単数形の英単語 → 単数形で翻訳（複数形に変更禁止）
- タイプミス・アクセント記号の誤りゼロ

✅ **品質方針**:
- 宗教的・政治的に中立
- 暗い話題を避ける（単語自体が該当する場合を除く）
- 辞書的に正確な訳語

### 3. 性別記号の割り当て
**{LANGUAGE}の文法的性別**を正確に記入：

{GENDER_RULES}

### 4. 作業手順

#### ステップ1: CSVファイルを読み込む
```bash
# ファイル全体を確認
head -20 data/word_gender_translations.csv
wc -l data/word_gender_translations.csv
```

#### ステップ2: 空欄行を特定
```python
import csv

with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    empty_rows = []
    for i, row in enumerate(reader, start=2):  # ヘッダー行を除く
        if not row['{LANGUAGE}_translation'].strip():
            empty_rows.append((i, row['en'], row['meaning_en']))
    
print(f"空欄行数: {len(empty_rows)}")
# 最初の10件を表示
for line_no, en, meaning in empty_rows[:10]:
    print(f"行{line_no}: {en} - {meaning}")
```

#### ステップ3: 翻訳を実行（全行を直接編集）
**⚠️ 重要**: CSVファイルを直接編集してください。

```python
import csv

# ファイルを読み込み
with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# {LANGUAGE}列のみを翻訳
for row in rows:
    en = row['en']
    meaning_en = row['meaning_en']
    
    # 空欄の場合のみ翻訳
    if not row['{LANGUAGE}_translation'].strip():
        # ステップ1: meaning_enからセミコロン前の意味を抽出
        first_meaning = meaning_en.split(';')[0].strip()
        
        # ステップ2: {LANGUAGE_NATIVE}に翻訳（必ず名詞として）
        # TODO: ここで実際の翻訳を実行
        translation = "YOUR_TRANSLATION_HERE"
        gender = "YOUR_GENDER_HERE"  # {GENDER_OPTIONS}
        
        row['{LANGUAGE}_translation'] = translation
        row['{LANGUAGE}_gender'] = gender

# ファイルを上書き保存
with open('data/word_gender_translations.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print("翻訳完了！")
```

#### ステップ4: 品質チェック
```python
# 翻訳済み行数を確認
filled = sum(1 for row in rows if row['{LANGUAGE}_translation'].strip())
print(f"{LANGUAGE}翻訳完了: {filled}/4592行")

# 性別記号の妥当性チェック
valid_genders = {GENDER_SET}
invalid = [row['en'] for row in rows 
           if row['{LANGUAGE}_gender'] not in valid_genders 
           and row['{LANGUAGE}_translation'].strip()]
if invalid:
    print(f"⚠️ 無効な性別記号: {invalid}")
```

#### ステップ5: データベースに同期
```bash
# Cloudflare D1に反映
./scripts/d1_sync_all.sh
```

## 成功基準
✅ 4,592行すべての{LANGUAGE}列が埋まっている  
✅ すべて名詞として翻訳されている  
✅ 性別記号がすべて正しい（{GENDER_OPTIONS}）  
✅ タイプミス・文字化けゼロ  
✅ セミコロンルール完全遵守

## 禁止事項
❌ 動詞・形容詞での翻訳  
❌ 単数形→複数形への勝手な変更  
❌ セミコロン後の意味を含める  
❌ 他の言語列（fr, de, es等）を編集  
❌ 新しいファイルを作成（必ず既存ファイルを上書き）

## 完了報告
作業完了後、以下を報告してください：
1. 翻訳完了行数（X/4592）
2. 品質チェック結果（エラー件数）
3. データベース同期結果

---
**言語**: {LANGUAGE} ({LANGUAGE_NATIVE})  
**担当列**: {LANGUAGE}_translation, {LANGUAGE}_gender  
**品質基準**: 辞書的正確性、文法的性別の完全遵守
