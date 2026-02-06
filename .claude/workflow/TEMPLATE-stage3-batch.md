# Stage 3 バッチ翻訳プロンプトテンプレート（新CSV構造版）

**作成日**: 2025-02-06  
**用途**: 言語分離CSV構造での並列バッチ処理

---

## 使用方法

このテンプレートを使って、各言語のバッチ翻訳プロンプトを生成する。

### 変数置換

| 変数 | 説明 | 例 |
|------|------|-----|
| `{LANGUAGE}` | 言語名（日本語） | フランス語 |
| `{LANGUAGE_NATIVE}` | 言語名（ネイティブ） | français |
| `{LANG_CODE}` | 言語コード | fr |
| `{GENDER_OPTIONS}` | 性別オプション | m (masculin) / f (féminin) |
| `{BATCH_NUM}` | バッチ番号 | 1 |
| `{TOTAL_BATCHES}` | 総バッチ数 | 20 |
| `{START_ROW}` | 開始行（1-based） | 1 |
| `{END_ROW}` | 終了行（1-based） | 230 |
| `{COUNT}` | 単語数 | 230 |
| `{SPECIFIC_REQUIREMENTS}` | 言語固有要件 | 冠詞なし1語のみ |

---

## テンプレート本体

```markdown
# {LANGUAGE}翻訳 - Batch {BATCH_NUM}/{TOTAL_BATCHES} (行{START_ROW}-{END_ROW})

あなたはClaude（AI）であり、専門的な{LANGUAGE_NATIVE}翻訳者です。
`data/translations_{LANG_CODE}.csv`の**{START_ROW}～{END_ROW}行目（{COUNT}語）**を翻訳してください。

## タスク概要
1. `data/words.csv`から{START_ROW}～{END_ROW}行目の単語と`meaning_en`を読み込む
2. 各単語について、**あなた自身が直接{LANGUAGE_NATIVE}翻訳を生成**
3. `data/translations_{LANG_CODE}.csv`の{START_ROW}～{END_ROW}行を更新

## 重要ルール

### 1. セミコロンルール（最重要）
- `meaning_en`に`;`がある場合、**最初の意味のみ**を翻訳
- セミコロンの後ろは完全に無視

### 2. 名詞1語のみ
- {SPECIFIC_REQUIREMENTS}
- 冠詞なし（例：フランス語なら "abbaye"、"le/la/l'/les" なし）
- 単数形を使用（複数形でない限り）

### 3. 性別
- {GENDER_OPTIONS}
- **必ず指定**（空欄は許可されない）

### 4. 名詞としての翻訳（追加）
- **`meaning_en`は必ず名詞の定義**になっています（Phase 2で保証済み）
- 動詞・形容詞・副詞の翻訳は不要
- 例：
  - ✅ forth → mouvement (m)  ← 名詞「前進」
  - ❌ forth → en avant  ← 副詞「前へ」
  - ✅ foster → parent d'accueil (m)  ← 名詞「里親」
  - ❌ foster → favoriser  ← 動詞「育成する」

## 実装方法

Pythonスクリプトで、**あなた自身が翻訳辞書を直接生成**してください：

```python
import csv

# Step 1: words.csvから対象行を読み込む
words = []
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for i, row in enumerate(reader, 1):
        if {START_ROW} <= i <= {END_ROW}:
            words.append({
                'en': row['en'],
                'meaning_en': row['meaning_en']
            })

print(f"対象単語: {{len(words)}}語")

# Step 2: あなた（Claude）が直接翻訳を生成
translations = {{}}

for word in words:
    en = word['en']
    first_meaning = word['meaning_en'].split(';')[0].strip()
    
    # {COUNT}語全ての翻訳を生成してください
    # 以下は例
    if en == 'abbey':
        translations[en] = ('abbaye', 'f')
    elif en == 'ability':
        translations[en] = ('capacité', 'f')
    # ... 残り{COUNT-2}語も生成
    
print(f"生成した翻訳: {{len(translations)}}語")

# Step 3: translations_{LANG_CODE}.csvの該当行を更新
all_rows = []
with open('data/translations_{LANG_CODE}.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    all_rows = list(reader)

updated = 0
for i, row in enumerate(all_rows, 1):
    if {START_ROW} <= i <= {END_ROW}:
        en = row['en']
        if en in translations:
            row['translation'], row['gender'] = translations[en]
            updated += 1

with open('data/translations_{LANG_CODE}.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(all_rows)

print(f"✅ {{updated}}語を更新しました")
print(f"✅ {LANG_CODE.upper()}[{START_ROW}:{END_ROW}] 完了: {{updated}}/{COUNT}")
```

## ❌ 絶対にやってはいけないこと

1. **Claude APIを呼び出す** → あなた自身が翻訳者
2. **他のファイルを触る** → translations_{LANG_CODE}.csvのみ更新
3. **範囲外の行を更新** → {START_ROW}～{END_ROW}のみ
4. **一部だけ翻訳** → {COUNT}語全て完成させる

## 完了報告

タスク完了時、以下のメッセージを返してください：
```
✅ {LANG_CODE.upper()}[{START_ROW}:{END_ROW}] 完了: {COUNT}/{COUNT}
- セミコロンルール: 100%遵守
- 名詞形式: {SPECIFIC_REQUIREMENTS}
- 性別記号: {GENDER_OPTIONS}完備
```

## 重要注意事項
- **API不要**: あなた自身がClaudeなので、直接翻訳してください
- **行番号厳守**: {START_ROW}～{END_ROW}のみ更新
- **{COUNT}語全て**: 1語も漏らさず完成させてください
```

---

## 言語別設定

### フランス語 (fr)
```python
LANGUAGE = "フランス語"
LANGUAGE_NATIVE = "français"
LANG_CODE = "fr"
GENDER_OPTIONS = "m (masculin) / f (féminin)"
SPECIFIC_REQUIREMENTS = "冠詞なし1語のみ"
```

### ドイツ語 (de)
```python
LANGUAGE = "ドイツ語"
LANGUAGE_NATIVE = "Deutsch"
LANG_CODE = "de"
GENDER_OPTIONS = "m (maskulin) / f (feminin) / n (neutrum)"
SPECIFIC_REQUIREMENTS = "大文字開始、冠詞なし1語のみ"
```

### スペイン語 (es)
```python
LANGUAGE = "スペイン語"
LANGUAGE_NATIVE = "español"
LANG_CODE = "es"
GENDER_OPTIONS = "m (masculino) / f (femenino)"
SPECIFIC_REQUIREMENTS = "冠詞なし1語のみ"
```

### イタリア語 (it)
```python
LANGUAGE = "イタリア語"
LANGUAGE_NATIVE = "italiano"
LANG_CODE = "it"
GENDER_OPTIONS = "m (maschile) / f (femminile)"
SPECIFIC_REQUIREMENTS = "冠詞なし1語のみ"
```

### ポルトガル語 (pt)
```python
LANGUAGE = "ポルトガル語"
LANGUAGE_NATIVE = "português"
LANG_CODE = "pt"
GENDER_OPTIONS = "m (masculino) / f (feminino)"
SPECIFIC_REQUIREMENTS = "冠詞なし1語のみ"
```

### ロシア語 (ru)
```python
LANGUAGE = "ロシア語"
LANGUAGE_NATIVE = "русский"
LANG_CODE = "ru"
GENDER_OPTIONS = "m (мужской) / f (женский) / n (средний)"
SPECIFIC_REQUIREMENTS = "キリル文字、名詞のみ"
```

### アラビア語 (ar)
```python
LANGUAGE = "アラビア語"
LANGUAGE_NATIVE = "العربية"
LANG_CODE = "ar"
GENDER_OPTIONS = "m (مذكّر) / f (مؤنّث)"
SPECIFIC_REQUIREMENTS = "アラビア文字、名詞のみ"
```

### ヒンディー語 (hi)
```python
LANGUAGE = "ヒンディー語"
LANGUAGE_NATIVE = "हिन्दी"
LANG_CODE = "hi"
GENDER_OPTIONS = "m (पुल्लिंग) / f (स्त्रीलिंग)"
SPECIFIC_REQUIREMENTS = "デーヴァナーガリー文字、名詞のみ"
```

---

## バッチ分割例（20エージェント、各230語）

```python
batches = [
    (1, 1, 230, 230),        # Batch 1
    (2, 231, 460, 230),      # Batch 2
    (3, 461, 690, 230),      # Batch 3
    ...
    (20, 4363, 4592, 230)    # Batch 20
]
```

---

**このテンプレートを使えば、エージェントが混乱せずに確実にバッチ翻訳を完了できる。**
