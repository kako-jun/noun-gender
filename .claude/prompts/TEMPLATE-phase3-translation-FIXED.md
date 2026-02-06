# Phase 3: {LANGUAGE_NAME}翻訳タスク（修正版）

## あなたの役割
あなたは**{LANGUAGE_NAME}の専門翻訳者**です。`data/translations_{LANG_CODE}.csv`の全4,592単語を翻訳してください。

---

## 重要：今回のミスの原因と対策

### ❌ 前回の失敗
- `meaning_en`と`example_en`を読まずに翻訳した
- セミコロンルールを無視した
- 名詞以外（動詞・形容詞・副詞）で翻訳した
- 行を勝手に削除・追加した

### ✅ 今回の厳守事項
1. **必ず`data/words.csv`から`meaning_en`と`example_en`を読む**
2. **セミコロン(;)より前の最初の意味のみ翻訳**
3. **必ず名詞として翻訳（動詞・形容詞・副詞は絶対禁止）**
4. **全4,592行を維持（削除・追加は絶対禁止）**

---

## タスク概要

### 入力ファイル
1. **`data/words.csv`**: 英語単語のソース情報
   - `en`: 英語単語
   - `meaning_en`: 英語での意味定義
   - `example_en`: 使用例文

2. **`data/translations_{LANG_CODE}.csv`**: 翻訳対象ファイル
   - `en`: 英語単語（既に入力済み）
   - `translation`: {LANGUAGE_NAME}翻訳（空欄→埋める）
   - `gender`: 文法的性別（空欄→埋める）
   - `meaning_translation`: 意味の{LANGUAGE_NAME}訳（空欄→埋める）

### 目標
- **行数**: 4,593行（ヘッダー + 4,592単語）を維持
- **翻訳数**: 4,592語すべて
- **品質**: セミコロンルール100%遵守、名詞のみ

---

## 翻訳ルール（厳格に遵守）

### ルール1: セミコロンルール（最重要）
`meaning_en`にセミコロン(`;`)がある場合、**セミコロンより前の最初の意味のみ**を翻訳する。

**例1: foster**
```
words.csv:
  en: foster
  meaning_en: "A foster parent; a caregiver in the foster care system"
  example_en: "The dedicated foster provided a safe and loving home..."

処理:
  1. meaning_enをセミコロンで分割: ["A foster parent", " a caregiver in the foster care system"]
  2. 最初の要素のみ取得: "A foster parent"
  3. これを{LANGUAGE_NAME}の名詞に翻訳

正解（フランス語の場合）:
  translation: "parent d'accueil"
  gender: "m"
  meaning_translation: "Un parent d'accueil dans le système de placement familial"

不正解（前回のミス）:
  ❌ translation: "encouragement"（fostering「育成」の意味で翻訳してしまった）
  ❌ translation: "fomento"（動詞的な意味で翻訳してしまった）
```

**例2: forth**
```
words.csv:
  en: forth
  meaning_en: "Forward movement; onward progress from a starting point"
  example_en: "The forth of the expedition into uncharted territory..."

処理:
  1. セミコロンで分割: ["Forward movement", " onward progress from a starting point"]
  2. 最初のみ: "Forward movement"
  3. これを名詞として翻訳

正解（スペイン語の場合）:
  translation: "avance"
  gender: "m"
  meaning_translation: "Movimiento hacia adelante"

不正解（前回のミス）:
  ❌ translation: "adelante"（副詞「forward」で翻訳してしまった）
```

**例3: evil**
```
words.csv:
  en: evil
  meaning_en: "Profound immorality and wickedness, especially when regarded as a supernatural force"
  example_en: "The ancient legend warned of evil forces threatening..."

処理:
  1. セミコロンなし→全体を見る
  2. "Profound immorality and wickedness"の名詞形を翻訳

正解（スペイン語の場合）:
  translation: "maldad"
  gender: "f"
  meaning_translation: "Inmoralidad y maldad profunda"

不正解（前回のミス）:
  ❌ translation: "mal"（形容詞的で曖昧）
  ✅ でも"mal"も名詞として使えるので許容される場合もある
```

### ルール2: 必ず名詞として翻訳

`example_en`を読んで、英語でどのように**名詞**として使われているか確認する。

**チェック項目**:
- ✅ 名詞として使える単語か？
- ❌ 動詞になっていないか？
- ❌ 形容詞になっていないか？
- ❌ 副詞になっていないか？

### ルール3: 冠詞なし

{LANGUAGE_NAME}の冠詞（le/la/un/una/der/die/das等）は**絶対に付けない**。

```
✅ 正解: "abbaye", "capacité", "修道院"
❌ 不正解: "la abbaye", "une capacité", "その修道院"
```

### ルール4: 性別の正確性

{LANGUAGE_NAME}の文法的性別を正確に記入：
- {GENDER_RULE}

### ルール5: 行数の厳守

**絶対に削除・追加してはいけない**。必ず4,593行（ヘッダー+4,592単語）を維持。

---

## 作業手順

### ステップ1: 両ファイルを読み込む

```python
import csv

# words.csvを読み込み（meaning_en, example_en用）
words_dict = {}
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        words_dict[row['en']] = {
            'meaning_en': row['meaning_en'],
            'example_en': row['example_en']
        }

# translations_{LANG_CODE}.csvを読み込み
with open('data/translations_{LANG_CODE}.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    translations = list(reader)

print(f"words.csv: {len(words_dict)}語")
print(f"translations_{LANG_CODE}.csv: {len(translations)}行")
```

### ステップ2: 各行を翻訳

```python
for i, row in enumerate(translations):
    en_word = row['en']
    
    # words.csvから情報取得
    word_info = words_dict.get(en_word)
    if not word_info:
        print(f"警告: {en_word} がwords.csvに見つかりません")
        continue
    
    meaning_en = word_info['meaning_en']
    example_en = word_info['example_en']
    
    # セミコロンルール: 最初の意味のみ抽出
    first_meaning = meaning_en.split(';')[0].strip()
    
    # 翻訳実行（必ず名詞として）
    # 1. first_meaningを{LANGUAGE_NAME}に翻訳
    # 2. example_enを参考にして名詞として使われているか確認
    # 3. {LANGUAGE_NAME}の名詞形を取得
    translation = translate_as_noun(en_word, first_meaning, example_en)
    gender = get_gender(translation)
    meaning_translation = translate_meaning(first_meaning)
    
    # CSVに書き込み
    row['translation'] = translation
    row['gender'] = gender
    row['meaning_translation'] = meaning_translation
    
    # 進捗表示
    if (i + 1) % 100 == 0:
        print(f"進捗: {i+1}/4592 ({(i+1)/4592*100:.1f}%)")
```

### ステップ3: ファイルを上書き保存

```python
# 必ず4,593行（ヘッダー+4,592単語）を維持
with open('data/translations_{LANG_CODE}.csv', 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['en', 'translation', 'gender', 'meaning_translation']
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(translations)

print(f"✅ 翻訳完了: {len(translations)}行")
```

### ステップ4: 検証

```python
# 行数チェック
assert len(translations) == 4592, f"行数エラー: {len(translations)} != 4592"

# 空欄チェック
empty_count = 0
for row in translations:
    if not row['translation'] or not row['gender'] or not row['meaning_translation']:
        empty_count += 1
        print(f"空欄: {row['en']}")

print(f"空欄数: {empty_count}/4592")
```

---

## 品質チェックリスト

翻訳完了後、必ず確認：

1. ✅ **行数**: 4,593行（ヘッダー+4,592単語）を維持
2. ✅ **セミコロンルール**: 100語ランダムサンプリングして確認
3. ✅ **名詞チェック**: すべて名詞か確認（動詞・形容詞・副詞がないか）
4. ✅ **冠詞チェック**: 冠詞が付いていないか
5. ✅ **性別チェック**: 性別記号が正しいか
6. ✅ **空欄チェック**: translation/gender/meaning_translationに空欄がないか

---

## 成功基準

✅ 4,592語すべて翻訳完了  
✅ セミコロンルール100%遵守  
✅ すべて名詞として翻訳  
✅ 行数4,593行を維持  
✅ 冠詞なし  
✅ 性別記号正確  
✅ 空欄ゼロ

---

## 禁止事項

❌ meaning_enとexample_enを読まずに翻訳  
❌ セミコロン後の意味を含める  
❌ 動詞・形容詞・副詞で翻訳  
❌ 行の削除・追加  
❌ 冠詞を付ける  
❌ 複数語での翻訳（1語の名詞で翻訳すること）

---

## 完了報告フォーマット

```
✅ Phase 3 - {LANGUAGE_NAME}翻訳完了

【統計】
- 翻訳語数: 4,592/4,592
- 行数: 4,593行（ヘッダー+4,592単語）
- 空欄: 0件

【品質チェック】
- セミコロンルール違反: 0件
- 非名詞翻訳: 0件
- 冠詞付き翻訳: 0件
- 性別記号エラー: 0件

【サンプル確認】
- foster: {translation} ({gender}) - {meaning_translation}
- forth: {translation} ({gender}) - {meaning_translation}
- evil: {translation} ({gender}) - {meaning_translation}
```

---

**言語**: {LANGUAGE_NAME}  
**ファイル**: `data/translations_{LANG_CODE}.csv`  
**品質基準**: セミコロンルール厳守、名詞のみ、行数維持  
**完了条件**: 全4,592語の翻訳完了、品質チェック合格
