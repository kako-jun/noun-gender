# Stage 4: ポルトガル語意味翻訳タスク

## あなたの役割
あなたは**ポルトガル語の専門翻訳者**です。`data/word_meaning_translations.csv`の**meaning_pt列のみ**を翻訳してください。

## 重要：上書きモード
- 既存の翻訳は**すべて上書き**してください
- 空欄だけでなく、**既に翻訳がある行も再翻訳**します
- たまたま同じ訳になってもOKです

## タスク概要
- **ファイル**: `data/word_meaning_translations.csv`
- **総単語数**: 4,592語
- **担当列**: `meaning_pt`
- **作業範囲**: **全行（1行目〜4,592行目）**

---

## 必須ルール（厳格に遵守）

### 1. 翻訳対象
- `meaning_en`列の**全体**をポルトガル語に翻訳
- セミコロンの数は一致不要（適切な要約OK）

### 2. 翻訳品質基準
✅ **必須**:
- **名詞の意味**として翻訳（動詞・形容詞の意味は禁止）
- ポルトガル語で自然で正確な説明文
- 同一言語内での重複語を排除

### 3. 重複語の排除
❌ 悪い例:
```
meaning_pt: "能力; 能力; 技能"  ← 「能力」が2回
```

✅ 良い例:
```
meaning_pt: "能力; 技能"  ← 重複削除
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

### ステップ2: 全4,592行を翻訳（上書きモード）
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
    
    # meaning_enの全体をポルトガル語に翻訳
    translation = translate_meaning_to_pt(meaning_en)
    
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
    row['meaning_pt'] = translation
    
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
mkdir -p .claude/workflow
echo "stage4-pt: 4592/4592 (100%)" > .claude/workflow/progress-stage4-pt.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage4-pt.txt
```

### ステップ4: 変更をコミット
```bash
git add data/word_meaning_translations.csv .claude/workflow/progress-stage4-pt.txt
git commit -m "feat(stage4-pt): complete ポルトガル語 meaning translations for all 4592 words"
```

---

## 翻訳例

### 例1: 全体翻訳
```
en: "abbey"
meaning_en: "a building or buildings occupied by a community of monks or nuns"
↓ 全体をポルトガル語に
meaning_pt: [全体の翻訳]
```

### 例2: 適切な要約（セミコロン数は一致不要）
```
en: "absence"
meaning_en: "Lack; not being present; missing; vacancy."
↓ 4つ→2つに要約（OK）
meaning_pt: [要約された翻訳]
```

---

## 成功基準

✅ 4,592行すべての`meaning_pt`が記入されている  
✅ すべて名詞の意味として翻訳されている  
✅ 同一言語内に重複語がない  
✅ タイプミス・アクセント記号の誤りゼロ  
✅ 自然で正確なポルトガル語

---

## 禁止事項

❌ 動詞・形容詞の意味で翻訳  
❌ 同一言語内での重複語  
❌ 他の言語列を編集

---

## 完了報告

作業完了後、以下を報告してください：

1. ✅ 翻訳完了: 4,592/4,592行
2. ✅ 重複チェック: エラー0件
3. ✅ コミット完了
4. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage4-pt.txt`

---

**言語**: ポルトガル語  
**担当列**: meaning_pt  
**品質基準**: 名詞の意味、重複排除、自然な表現  
**完了条件**: 全4,592行の上書き翻訳完了
