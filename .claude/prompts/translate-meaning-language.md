# 意味翻訳タスク: {LANGUAGE}

## あなたの役割
あなたは**{LANGUAGE_NATIVE}言語の専門翻訳者**です。`data/word_meaning_translations.csv`の**meaning_{LANGUAGE}列のみ**を完璧に翻訳してください。

## ファイル構造
- **ファイル**: `data/word_meaning_translations.csv`
- **形式**: TSV（タブ区切り）
- **編集対象列**: `meaning_{LANGUAGE}`
- **総行数**: 4,593行（ヘッダー除く）

## 必須ルール（厳格に遵守）

### 1. 翻訳対象の特定
- `en`列: 英単語（単数形の名詞）
- `meaning_en`列: 英語での意味説明文（辞書的定義）
- **翻訳対象**: meaning_en列の**全体**を{LANGUAGE_NATIVE}に翻訳

### 2. 翻訳品質基準
✅ **必須条件**:
- **名詞の意味**として翻訳（動詞・形容詞の意味は禁止）
- {LANGUAGE_NATIVE}で自然で正確な説明文
- セミコロンの数は一致不要（適切な要約OK）
- 同一言語内での重複語を排除

✅ **品質方針**:
- 宗教的・政治的に中立
- 暗い話題を避ける（単語自体が該当する場合を除く）
- 辞書的に正確で簡潔な説明

### 3. セミコロン処理の柔軟性
**⚠️ 重要**: 英語と翻訳でセミコロン数が異なってもOK

**良い例**:
```
meaning_en: "Lack; not being present; missing; vacancy."
meaning_ja: "欠如; 不在"  ← 4つ→2つに要約（許容）
```

**悪い例（重複）**:
```
meaning_ja: "能力; 能力; 容量; 技能"  ← 同じ「能力」が2回（修正必須）
→ 修正後: "能力; 容量; 技能"
```

### 4. 作業手順

#### ステップ1: CSVファイルを読み込む
```bash
# ファイル全体を確認
head -20 data/word_meaning_translations.csv
wc -l data/word_meaning_translations.csv
```

#### ステップ2: 空欄行を特定
```python
import csv

with open('data/word_meaning_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    empty_rows = []
    for i, row in enumerate(reader, start=2):
        if not row['meaning_{LANGUAGE}'].strip():
            empty_rows.append((i, row['en'], row['meaning_en']))
    
print(f"空欄行数: {len(empty_rows)}")
for line_no, en, meaning in empty_rows[:10]:
    print(f"行{line_no}: {en} - {meaning}")
```

#### ステップ3: 翻訳を実行（全行を直接編集）
**⚠️ 重要**: CSVファイルを直接編集してください。

```python
import csv

# ファイルを読み込み
with open('data/word_meaning_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# meaning_{LANGUAGE}列のみを翻訳
for row in rows:
    en = row['en']
    meaning_en = row['meaning_en']
    
    # 空欄の場合のみ翻訳
    if not row['meaning_{LANGUAGE}'].strip():
        # TODO: meaning_enの全体を{LANGUAGE_NATIVE}に翻訳
        translation = "YOUR_TRANSLATION_HERE"
        
        row['meaning_{LANGUAGE}'] = translation

# ファイルを上書き保存
with open('data/word_meaning_translations.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print("翻訳完了！")
```

#### ステップ4: 品質チェック
```python
# 翻訳済み行数を確認
filled = sum(1 for row in rows if row['meaning_{LANGUAGE}'].strip())
print(f"meaning_{LANGUAGE}翻訳完了: {filled}/4592行")

# 重複チェック（セミコロン区切り内）
for row in rows:
    translation = row['meaning_{LANGUAGE}']
    if ';' in translation:
        parts = [p.strip() for p in translation.split(';')]
        if len(parts) != len(set(parts)):
            print(f"⚠️ 重複: {row['en']} - {translation}")
```

#### ステップ5: データベースに同期
```bash
# Cloudflare D1に反映
./scripts/d1_sync_all.sh
```

## 翻訳例（参考）

### 例1: 適切な要約
```
en: "absence"
meaning_en: "Lack; not being present; missing; vacancy."
meaning_ja: "欠如; 不在"  ← 簡潔に要約（OK）
```

### 例2: 全体翻訳
```
en: "abbey"
meaning_en: "a building or buildings occupied by a community of monks or nuns"
meaning_ja: "修道院; 僧院や尼僧院が使用する建物"  ← 全体を翻訳（OK）
```

### 例3: 重複排除
```
❌ 悪い例:
meaning_ja: "能力; 能力; 容量; 技能"

✅ 良い例:
meaning_ja: "能力; 容量; 技能"
```

## 成功基準
✅ 4,592行すべてのmeaning_{LANGUAGE}列が埋まっている  
✅ すべて名詞の意味として翻訳されている  
✅ 同一言語内に重複語がない  
✅ タイプミス・文字化けゼロ  
✅ 自然で正確な{LANGUAGE_NATIVE}

## 禁止事項
❌ 動詞・形容詞の意味で翻訳  
❌ 同一言語内での重複語  
❌ 他の言語列（meaning_ja, meaning_fr等）を編集  
❌ 新しいファイルを作成（必ず既存ファイルを上書き）

## 完了報告
作業完了後、以下を報告してください：
1. 翻訳完了行数（X/4592）
2. 品質チェック結果（重複エラー件数）
3. データベース同期結果

---
**言語**: {LANGUAGE} ({LANGUAGE_NATIVE})  
**担当列**: meaning_{LANGUAGE}  
**品質基準**: 名詞の意味、重複排除、自然な表現
