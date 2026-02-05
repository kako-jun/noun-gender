# Stage 4: フランス語意味翻訳タスク

## あなたの役割
あなたは**フランス語の専門翻訳者**です。`data/word_meaning_translations.csv`の**meaning_fr列のみ**を翻訳してください。

## 重要：上書きモード
- 既存の翻訳は**すべて上書き**してください
- 空欄だけでなく、**既に翻訳がある行も再翻訳**します
- たまたま同じ訳になってもOKです

## タスク概要
- **ファイル**: `data/word_meaning_translations.csv`
- **総単語数**: 4,592語
- **担当列**: `meaning_fr`
- **作業範囲**: **全行（1行目〜4,592行目）**

---

## 必須ルール（厳格に遵守）

### 1. 翻訳対象
- `meaning_en`列の**全体**をフランス語に翻訳
- セミコロンの数は一致不要（適切な要約OK）

### 2. 翻訳品質基準
✅ **必須**:
- **名詞の意味**として翻訳（動詞・形容詞の意味は禁止）
- フランス語で自然で正確な説明文
- 同一言語内での重複語を排除

### 3. 重複語の排除
❌ 悪い例:
```
meaning_fr: "capacité; capacité; compétence"  ← "capacité"が2回
```

✅ 良い例:
```
meaning_fr: "capacité; compétence"  ← 重複削除
```

---

## 作業手順

### ステップ1: CSVファイルを読み込む
```python
import csv

with open('data/word_meaning_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    rows = list(reader)

print(f"総行数: {len(rows)}")
```

### ステップ2: 全行を翻訳（上書きモード）
```python
import csv

# ファイルを読み込み
with open('data/word_meaning_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# 全行を翻訳（既存翻訳も上書き）
for i, row in enumerate(rows, start=1):
    en = row['en']
    meaning_en = row['meaning_en']
    
    # meaning_enの全体をフランス語に翻訳
    # TODO: ここで実際の翻訳を実行
    translation = "YOUR_TRANSLATION_HERE"
    
    # 重複チェック
    if ';' in translation:
        parts = [p.strip() for p in translation.split(';')]
        # 重複削除
        unique_parts = []
        seen = set()
        for p in parts:
            if p.lower() not in seen:
                unique_parts.append(p)
                seen.add(p.lower())
        translation = '; '.join(unique_parts)
    
    # 上書き
    row['meaning_fr'] = translation
    
    # 進捗表示（100行ごと）
    if i % 100 == 0:
        print(f"進捗: {i}/{len(rows)} ({i/len(rows)*100:.1f}%)")

# ファイルを上書き保存
with open('data/word_meaning_translations.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ 翻訳完了: {len(rows)}行")
```

### ステップ3: 進捗を記録
```bash
echo "stage4-fr: 4592/4592 (100%)" > .claude/workflow/progress-stage4-fr.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage4-fr.txt
```

### ステップ4: データベースに同期
```bash
./scripts/d1_sync_all.sh
```

---

## 翻訳例

### 例1: 全体翻訳
```
en: "abbey"
meaning_en: "a building or buildings occupied by a community of monks or nuns"
↓ 全体をフランス語に
meaning_fr: "bâtiment occupé par une communauté de moines ou de religieuses"
```

### 例2: 適切な要約（セミコロン数は一致不要）
```
en: "absence"
meaning_en: "Lack; not being present; missing; vacancy."
↓ 4つ→2つに要約（OK）
meaning_fr: "manque; fait de ne pas être présent"
```

### 例3: 重複削除
```
en: "ability"
meaning_en: "Possession of the means or skill to do something."
↓ 翻訳後に重複チェック
meaning_fr (重複あり): "capacité; capacité; compétence"
↓ 重複削除
meaning_fr (最終): "capacité; compétence"
```

---

## 成功基準

✅ 4,592行すべての`meaning_fr`が記入されている  
✅ すべて名詞の意味として翻訳されている  
✅ 同一言語内に重複語がない  
✅ タイプミス・アクセント記号の誤りゼロ  
✅ 自然で正確なフランス語

---

## 禁止事項

❌ 動詞・形容詞の意味で翻訳  
❌ 同一言語内での重複語  
❌ 他の言語列（meaning_ja, meaning_de等）を編集

---

## 進捗報告

作業完了後、以下を報告してください：

1. ✅ 翻訳完了: 4,592/4,592行
2. ✅ 重複チェック: エラー0件
3. ✅ データベース同期: 完了
4. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage4-fr.txt`

---

**言語**: フランス語 (French)  
**担当列**: meaning_fr  
**品質基準**: 名詞の意味、重複排除、自然な表現  
**完了条件**: 全4,592行の上書き翻訳完了
