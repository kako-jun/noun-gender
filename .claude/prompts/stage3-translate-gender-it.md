# Stage 3: フランス語性別翻訳タスク

## あなたの役割
あなたは**フランス語の専門翻訳者**です。`data/word_gender_translations.csv`の**フランス語列（fr_translation, fr_gender）のみ**を翻訳してください。

## 重要：上書きモード
- 既存の翻訳は**すべて上書き**してください
- 空欄だけでなく、**既に翻訳がある行も再翻訳**します
- たまたま同じ訳になってもOKです

## タスク概要
- **ファイル**: `data/word_gender_translations.csv`
- **総単語数**: 4,592語
- **担当列**: `fr_translation`, `fr_gender`
- **作業範囲**: **全行（1行目〜4,592行目）**

---

## 必須ルール（厳格に遵守）

### 1. セミコロンルール（最重要）
- `meaning_en`列にセミコロン（`;`）がある場合、**最初の意味のみ**を翻訳
- 例: "Supply; shares; inventory" → "Supply"のみ翻訳 → "approvisionnement"

### 2. 翻訳品質基準
✅ **必須**:
- 必ず**名詞**として翻訳（動詞・形容詞は禁止）
- フランス語で最も自然で正確な訳語
- 単数形の英単語 → 単数形で翻訳（複数形に変更禁止）
- タイプミス・アクセント記号（é, è, ê, ç等）の誤りゼロ

### 3. 性別記号の割り当て
フランス語の文法的性別を正確に記入：
- `m`: 男性名詞（le）
- `f`: 女性名詞（la）

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

### ステップ2: 全行を翻訳（上書きモード）
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
    
    # フランス語に翻訳（必ず名詞として）
    # TODO: ここで実際の翻訳を実行
    translation = "YOUR_TRANSLATION_HERE"  # 例: "abbaye"
    gender = "f"  # m または f
    
    # 上書き
    row['fr_translation'] = translation
    row['fr_gender'] = gender
    
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
# .claude/workflow/progress.txt に記録
echo "stage3-fr: 4592/4592 (100%)" > .claude/workflow/progress-stage3-fr.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage3-fr.txt
```

### ステップ4: データベースに同期
```bash
./scripts/d1_sync_all.sh
```

---

## 翻訳例

### 例1: セミコロンルール
```
en: "absence"
meaning_en: "Lack; not being present; missing; vacancy."
↓ 最初の意味のみ
first_meaning: "Lack"
↓ フランス語に翻訳
fr_translation: "manque"
fr_gender: "m"
```

### 例2: 単数形の維持
```
en: "abbey"
meaning_en: "A building or buildings occupied by a community of monks or nuns."
↓ 単数形で翻訳
fr_translation: "abbaye"  ← 単数形
fr_gender: "f"
```

### 例3: 名詞として翻訳
```
en: "abstract"
meaning_en: "Summary; concept; idea separated from concrete reality."
↓ 名詞として翻訳（形容詞ではない）
fr_translation: "résumé"  ← 名詞「要約」
fr_gender: "m"
```

---

## 成功基準

✅ 4,592行すべての`fr_translation`, `fr_gender`が記入されている  
✅ すべて名詞として翻訳されている  
✅ セミコロンルール100%遵守  
✅ 性別記号がすべて正しい（m/f）  
✅ タイプミス・アクセント記号の誤りゼロ

---

## 禁止事項

❌ 動詞・形容詞での翻訳  
❌ セミコロン後の意味を含める  
❌ 単数形→複数形への勝手な変更  
❌ 他の言語列（de, es, it等）を編集  
❌ 性別記号以外の値（n, 空白等）

---

## 進捗報告

作業完了後、以下を報告してください：

1. ✅ 翻訳完了: 4,592/4,592行
2. ✅ 品質チェック: エラー0件
3. ✅ データベース同期: 完了
4. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage3-fr.txt`

---

**言語**: フランス語 (French)  
**担当列**: fr_translation, fr_gender  
**品質基準**: セミコロンルール厳守、名詞のみ、性別正確  
**完了条件**: 全4,592行の上書き翻訳完了
