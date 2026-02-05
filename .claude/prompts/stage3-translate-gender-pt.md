# Stage 3: ポルトガル語性別翻訳タスク

## あなたの役割
あなたは**ポルトガル語の専門翻訳者**です。`data/word_gender_translations.csv`の**pt列（pt_translation, pt_gender）のみ**を翻訳してください。

## 重要：上書きモード
- 既存の翻訳は**すべて上書き**してください
- 空欄だけでなく、**既に翻訳がある行も再翻訳**します
- たまたま同じ訳になってもOKです

## タスク概要
- **ファイル**: `data/word_gender_translations.csv`
- **総単語数**: 4,592語
- **担当列**: `pt_translation`, `pt_gender`
- **作業範囲**: **全行（1行目〜4,592行目）**

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
- ポルトガル語で最も自然で正確な訳語
- 単数形の英単語 → 単数形で翻訳（複数形に変更禁止）
- タイプミス・アクセント記号の誤りゼロ

**出力例**: "manque" (1語), "capacité" (1語), "修道院" (1語)

❌ **禁止**:
- 動詞や形容詞での翻訳
- 説明文ではなく、**単語1語**で翻訳すること
- 例: ❌ "不在であること" → ✅ "不在"

### 3. 性別記号の割り当て
ポルトガル語の文法的性別を正確に記入：
- m (男性名詞: o), f (女性名詞: a)

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
  
  ステップ3: "Lack"をポルトガル語の名詞に翻訳
    → pt_translation: "manque" (フランス語の場合)
    → pt_gender: "m"

正解:
  pt_translation: "manque"
  pt_gender: "m"

不正解（これらは絶対にダメ）:
  ❌ pt_translation: "manque et absence" (複数の意味を含めた)
  ❌ pt_translation: "absence" (2番目の意味を使った)
  ❌ pt_translation: "le fait de manquer" (説明文にした)
```

### 例2: 単数形の維持
```
入力:
  en: "abbey"
  meaning_en: "A building or buildings occupied by a community of monks or nuns."

処理:
  ステップ1: セミコロンがないので全体を見る
  ステップ2: "building"は単数形なので、翻訳も単数形
  ステップ3: ポルトガル語の名詞に翻訳

正解:
  pt_translation: "abbaye" (単数形)
  pt_gender: "f"

不正解:
  ❌ pt_translation: "abbayes" (複数形にした)
  ❌ pt_translation: "bâtiment monastique" (説明的にした)
```

### 例3: 名詞として翻訳
```
入力:
  en: "abstract"
  meaning_en: "Summary; concept; idea separated from concrete reality."

処理:
  ステップ1: 最初の意味 "Summary" を取得
  ステップ2: "Summary"をポルトガル語の**名詞**に翻訳
    → ❌ "abstrait" (形容詞)
    → ✅ "résumé" (名詞)

正解:
  pt_translation: "résumé" (名詞「要約」)
  pt_gender: "m"

不正解:
  ❌ pt_translation: "abstrait" (形容詞で翻訳した)
  ❌ pt_translation: "résumer" (動詞で翻訳した)
```

### 例4: セミコロンがない場合
```
入力:
  en: "ability"
  meaning_en: "Possession of the means or skill to do something."

処理:
  ステップ1: セミコロンがないので全体を見る
  ステップ2: "Possession of the means or skill"全体の意味を考える
  ステップ3: ポルトガル語の名詞1語に翻訳

正解:
  pt_translation: "capacité" (名詞1語)
  pt_gender: "f"

不正解:
  ❌ pt_translation: "possession de moyens" (説明的すぎる)
  ❌ pt_translation: "pouvoir" (動詞的な意味)
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

### ステップ2: 全4,592行を翻訳（上書きモード）
```python
import csv

# ファイルを読み込み
with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# 全行を翻訳（既存翻訳も上書き）
for i, row in enumerate(rows, start=1):
    en = row['en']
    meaning_en = row['meaning_en']
    
    # セミコロンルール: 最初の意味のみ抽出
    first_meaning = meaning_en.split(';')[0].strip()
    
    # ポルトガル語に翻訳（必ず名詞として）
    # 実際の翻訳処理を実行
    translation = translate_to_pt(en, first_meaning)
    gender = get_pt_gender(translation)
    
    # 上書き
    row['pt_translation'] = translation
    row['pt_gender'] = gender
    
    # 進捗表示（100行ごと）
    if i % 100 == 0:
        print(f"進捗: {i}/{len(rows)} ({i/len(rows)*100:.1f}%)")

# ファイルを上書き保存
with open('data/word_gender_translations.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ 翻訳完了: {len(rows)}行")
```

### ステップ3: 進捗を記録
```bash
mkdir -p .claude/workflow
echo "stage3-pt: 4592/4592 (100%)" > .claude/workflow/progress-stage3-pt.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage3-pt.txt
```

### ステップ4: 変更をコミット
```bash
git add data/word_gender_translations.csv .claude/workflow/progress-stage3-pt.txt
git commit -m "feat(stage3-pt): complete ポルトガル語 gender translations for all 4592 words"
```

---

## 品質チェックリスト

翻訳完了後、以下を必ず確認：

1. ✅ **セミコロンルール**: 100行ランダムサンプリングして、最初の意味のみ翻訳されているか確認
2. ✅ **品詞チェック**: すべて名詞か確認（動詞・形容詞がないか）
3. ✅ **長さチェック**: 3文字未満の異常に短い翻訳がないか
4. ✅ **性別チェック**: 性別記号が m (男性名詞: o), f (女性名詞: a) の範囲内か
5. ✅ **アクセント**: アクセント記号が正しいか

---

## 成功基準

✅ 4,592行すべての`pt_translation`, `pt_gender`が記入されている  
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
❌ 他の言語列を編集  
❌ 説明文・複数語での翻訳（必ず名詞1語）

---

## 完了報告

作業完了後、以下を報告してください：

1. ✅ 翻訳完了: 4,592/4,592行
2. ✅ 品質チェック: エラー0件
3. ✅ セミコロンルール違反: 0件
4. ✅ 3文字未満の翻訳: 0件
5. ✅ コミット完了
6. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage3-pt.txt`

---

**言語**: ポルトガル語  
**担当列**: pt_translation, pt_gender  
**品質基準**: セミコロンルール厳守、名詞のみ、性別正確  
**完了条件**: 全4,592行の上書き翻訳完了
