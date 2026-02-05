# Stage 3: {LANGUAGE_NATIVE}性別翻訳タスク

## あなたの役割
あなたは**{LANGUAGE_NATIVE}の専門翻訳者**です。`data/translations.csv`の**{LANGUAGE}行（translation, gender）のみ**を翻訳してください。

## 重要：上書きモード
- 既存の翻訳は**すべて上書き**してください
- 空欄だけでなく、**既に翻訳がある行も再翻訳**します
- たまたま同じ訳になってもOKです

## タスク概要
- **ファイル**: `data/translations.csv`
- **総単語数**: 4,592語
- **対象行**: `lang='{LANGUAGE}'`の行のみ（4,592行）
- **担当列**: `translation`, `gender`
- **作業範囲**: **{LANGUAGE}言語の全4,592行**

---

## 必須ルール（厳格に遵守）

### 1. セミコロンルール（最重要）
- `meaning_en`列にセミコロン（`;`）がある場合、**最初の意味のみ**を翻訳
- セミコロンの前だけを見て、後ろは完全に無視する

**正しい例**:
```
meaning_en: "Lack; not being present; missing; vacancy."
→ 最初の意味: "Lack" のみ
→ "not being present", "missing", "vacancy" は無視
```

**間違った例（これは絶対にしてはいけない）**:
```
meaning_en: "Lack; not being present; missing; vacancy."
→ ❌ "Lack and absence and missing" のように複数の意味を含めて翻訳
→ ❌ 全体を見て総合的な翻訳をする
```

### 2. 翻訳品質基準
✅ **必須**:
- 必ず**名詞**として翻訳（動詞・形容詞は禁止）
- **名詞1語**で翻訳（説明文・複数語は禁止）
- {LANGUAGE_NATIVE}で最も自然で正確な訳語
- 単数形の英単語 → 単数形で翻訳（複数形に変更禁止）
- タイプミス・アクセント記号の誤りゼロ

**出力例**: "manque" (1語), "capacité" (1語), "修道院" (1語)

❌ **禁止**:
- 動詞や形容詞での翻訳
- 説明文ではなく、**単語1語**で翻訳すること
- 例: ❌ "不在であること" → ✅ "不在"

### 3. 性別記号の割り当て
{LANGUAGE_NATIVE}の文法的性別を正確に記入：
- {GENDER_OPTIONS}

---

## 翻訳例（完全版）

### 例1: セミコロンルール厳守
```
入力:
  en: "absence"
  meaning_en: "Lack; not being present; missing; vacancy."

処理:
  ステップ1: セミコロンで分割
    → ["Lack", "not being present", "missing", "vacancy."]
  
  ステップ2: 最初の要素のみ取得
    → "Lack"
  
  ステップ3: "Lack"を{LANGUAGE_NATIVE}の名詞に翻訳
    → {LANGUAGE}_translation: "manque" (フランス語の場合)
    → {LANGUAGE}_gender: "m"

正解:
  {LANGUAGE}_translation: "manque"
  {LANGUAGE}_gender: "m"

不正解（これらは絶対にダメ）:
  ❌ {LANGUAGE}_translation: "manque et absence" (複数の意味を含めた)
  ❌ {LANGUAGE}_translation: "absence" (2番目の意味を使った)
  ❌ {LANGUAGE}_translation: "le fait de manquer" (説明文にした)
```

### 例2: 単数形の維持
```
入力:
  en: "abbey"
  meaning_en: "A building or buildings occupied by a community of monks or nuns."

処理:
  ステップ1: セミコロンがないので全体を見る
  ステップ2: "building"は単数形なので、翻訳も単数形
  ステップ3: {LANGUAGE_NATIVE}の名詞に翻訳

正解:
  {LANGUAGE}_translation: "abbaye" (単数形)
  {LANGUAGE}_gender: "f"

不正解:
  ❌ {LANGUAGE}_translation: "abbayes" (複数形にした)
  ❌ {LANGUAGE}_translation: "bâtiment monastique" (説明的にした)
```

### 例3: 名詞として翻訳
```
入力:
  en: "abstract"
  meaning_en: "Summary; concept; idea separated from concrete reality."

処理:
  ステップ1: 最初の意味 "Summary" を取得
  ステップ2: "Summary"を{LANGUAGE_NATIVE}の**名詞**に翻訳
    → ❌ "abstrait" (形容詞)
    → ✅ "résumé" (名詞)

正解:
  {LANGUAGE}_translation: "résumé" (名詞「要約」)
  {LANGUAGE}_gender: "m"

不正解:
  ❌ {LANGUAGE}_translation: "abstrait" (形容詞で翻訳した)
  ❌ {LANGUAGE}_translation: "résumer" (動詞で翻訳した)
```

### 例4: セミコロンがない場合
```
入力:
  en: "ability"
  meaning_en: "Possession of the means or skill to do something."

処理:
  ステップ1: セミコロンがないので全体を見る
  ステップ2: "Possession of the means or skill"全体の意味を考える
  ステップ3: {LANGUAGE_NATIVE}の名詞1語に翻訳

正解:
  {LANGUAGE}_translation: "capacité" (名詞1語)
  {LANGUAGE}_gender: "f"

不正解:
  ❌ {LANGUAGE}_translation: "possession de moyens" (説明的すぎる)
  ❌ {LANGUAGE}_translation: "pouvoir" (動詞的な意味)
```

---

## 作業手順

### ステップ1: CSVファイルを読み込む
```python
import csv

# words.csvから meaning_en を読み込み
words_data = {}
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        words_data[row['en']] = row['meaning_en']

# translations.csvから{LANGUAGE}の行を読み込み
with open('data/translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    rows = [row for row in reader if row['lang'] == '{LANGUAGE}']

print(f"{LANGUAGE}の行数: {len(rows)}")
```

### ステップ2: 全4,592行を翻訳（上書きモード）
```python
import csv

# words.csvを読み込み（meaning_en用）
words_data = {}
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        words_data[row['en']] = row['meaning_en']

# translations.csvを全部読み込み
all_rows = []
with open('data/translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    all_rows = list(reader)

# {LANGUAGE}の行のみ翻訳
translated_count = 0
for row in all_rows:
    if row['lang'] != '{LANGUAGE}':
        continue
    
    en = row['en']
    meaning_en = words_data.get(en, '')
    
    # セミコロンルール: 最初の意味のみ抽出
    first_meaning = meaning_en.split(';')[0].strip()
    
    # {LANGUAGE_NATIVE}に翻訳（必ず名詞として）
    translation = translate_to_{LANGUAGE}(en, first_meaning)
    gender = get_{LANGUAGE}_gender(translation)
    
    # 上書き
    row['translation'] = translation
    row['gender'] = gender
    translated_count += 1
    
    # 進捗表示（100行ごと）
    if translated_count % 100 == 0:
        print(f"進捗: {translated_count}/4592 ({translated_count/4592*100:.1f}%)")

# ファイルを上書き保存
with open('data/translations.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(all_rows)

print(f"✅ 翻訳完了: {translated_count}行")
```

### ステップ3: 進捗を記録
```bash
mkdir -p .claude/workflow
echo "stage3-{LANGUAGE}: 4592/4592 (100%)" > .claude/workflow/progress-stage3-{LANGUAGE}.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage3-{LANGUAGE}.txt
```

### ステップ4: 変更をコミット
```bash
git add data/translations.csv .claude/workflow/progress-stage3-{LANGUAGE}.txt
git commit -m "feat(stage3-{LANGUAGE}): complete {LANGUAGE_NATIVE} gender translations for all 4592 words"
```

---

## 品質チェックリスト

翻訳完了後、以下を必ず確認：

1. ✅ **セミコロンルール**: 100行ランダムサンプリングして、最初の意味のみ翻訳されているか確認
2. ✅ **品詞チェック**: すべて名詞か確認（動詞・形容詞がないか）
3. ✅ **長さチェック**: 3文字未満の異常に短い翻訳がないか
4. ✅ **性別チェック**: 性別記号が {GENDER_OPTIONS} の範囲内か
5. ✅ **アクセント**: アクセント記号が正しいか

---

## 成功基準

✅ {LANGUAGE}言語の4,592行すべての`translation`, `gender`が記入されている  
✅ すべて名詞として翻訳されている  
✅ セミコロンルール100%遵守  
✅ 性別記号がすべて正しい  
✅ タイプミス・アクセント記号の誤りゼロ  
✅ 3文字未満の翻訳がゼロ

---

## 禁止事項

❌ 動詞・形容詞での翻訳  
❌ セミコロン後の意味を含める  
❌ 単数形→複数形への勝手な変更  
❌ 他の言語行を編集  
❌ 説明文・複数語での翻訳（必ず名詞1語）

---

## 完了報告

作業完了後、以下を報告してください：

1. ✅ 翻訳完了: 4,592/4,592行
2. ✅ 品質チェック: エラー0件
3. ✅ セミコロンルール違反: 0件
4. ✅ 3文字未満の翻訳: 0件
5. ✅ コミット完了
6. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage3-{LANGUAGE}.txt`

---

**言語**: {LANGUAGE_NATIVE}  
**担当列**: translation, gender  
**品質基準**: セミコロンルール厳守、名詞のみ、性別正確  
**完了条件**: {LANGUAGE}言語の全4,592行の上書き翻訳完了
