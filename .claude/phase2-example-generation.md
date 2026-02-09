# Phase 2: 英語example_en生成手順

**目的**: 全単語に対して英語の例文（example_en）を生成する

---

## 📋 前提条件

- Phase 1完了（meaning_en列が全て埋まっている）
- example_en列が空、または再生成が必要

---

## 🎯 品質基準

### 必須要件
1. **最低10単語以上**の完全な文章
2. **meaning_enの最初の意味のみ**を使った例文（セミコロンルール）
3. **名詞用法のみ**（動詞・形容詞用法は禁止）
4. 自然で実用的な文章
5. 単語は単数形で使用（meaning_enが単数形の場合）

### セミコロンルール（最重要）

meaning_enにセミコロン（`;`）がある場合、**最初の意味のみ**を使う。

**例**:
```
en: application
meaning_en: A formal request for something; the action of putting something into operation
example_en: The scholarship application required three letters of recommendation.
            ↑ "A formal request"の意味のみ使用
```

### 良い例
```
abbey: Westminster Abbey has hosted coronations for centuries of British monarchs.
→ "abbey"を名詞として使用、具体的で自然

anxiety: Her anxiety about the exam kept her awake all night.
→ "anxiety"を名詞として使用、実用的
```

### 悪い例
```
abbreviate: The monks abbreviated their prayers.
→ ❌ 動詞用法になっている（名詞用法を使うべき）

app: I use this app daily.
→ ❌ 短すぎる（最低10単語）
```

---

## 📊 実行手順

### ステップ1: バッチ分割

Phase 1と同様、10バッチに分割（各バッチ約460語）

### ステップ2: 各バッチでexample_en生成

**バッチ1の例（行1-460）**

プロンプト:
```
data/words.csvの行2-461（460語）のexample_enを生成してください。

入力: data/words.csv（en列とmeaning_en列を使用）
出力: /tmp/phase2_batch1.tsv（2列: en, example_en）

品質基準:
1. 最低10単語以上の完全な文章
2. meaning_enにセミコロンがある場合、最初の意味のみを使用
3. 名詞用法のみ（動詞・形容詞用法は禁止）
4. 単語は単数形で使用

セミコロンルールの例:
- application の meaning_en: "A formal request for something; the action of putting something into operation"
- → 例文は "A formal request" の意味のみ使用
- 例文: "The scholarship application required three letters of recommendation."

良い例:
- abbey: Westminster Abbey has hosted coronations for centuries of British monarchs.
- anxiety: Her anxiety about the exam kept her awake all night.

悪い例:
- abbreviate: The monks abbreviated their prayers.（動詞用法）
- app: I use this app daily.（短すぎる）

生成したら最初の5行と最後の5行を表示してください。
```

### ステップ3: 結果検証

```bash
# 行数確認
wc -l /tmp/phase2_batch1.tsv  # 460行

# サンプル確認
head -5 /tmp/phase2_batch1.tsv
tail -5 /tmp/phase2_batch1.tsv

# 単語数確認（最低10単語）
awk -F'\t' '{
  count=split($2, words, " ")
  if(count<10) print NR, $1, count"語:", $2
}' /tmp/phase2_batch1.tsv

# セミコロンルール確認（例文にセミコロンが入っていないこと）
awk -F'\t' '$2 ~ /;/ {print NR, $1, $2}' /tmp/phase2_batch1.tsv
```

### ステップ4: CSVに適用

```python
# scripts/apply_phase2_batch.py
import sys
import csv

batch_file = sys.argv[1]
start_line = int(sys.argv[2])
end_line = int(sys.argv[3])

# Load new examples
examples = {}
with open(batch_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        examples[row['en']] = row['example_en']

print(f"Loaded {len(examples)} examples")

# Update words.csv
rows = []
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    for row in reader:
        if row['en'] in examples:
            row['example_en'] = examples[row['en']]
        rows.append(row)

with open('data/words.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print(f"✓ Applied {len(examples)} examples to words.csv")
```

```bash
python3 scripts/apply_phase2_batch.py /tmp/phase2_batch1.tsv 2 461

# 確認
awk -F'\t' 'NR>=2 && NR<=6 {print $1, "|", substr($3,1,60)"..."}' data/words.csv
```

### ステップ5: コミット

```bash
git add data/words.csv
git commit -m "feat(phase2): generate example_en batch 1/10 (rows 2-461, 460 words)"
```

### ステップ6: 残り9バッチを繰り返し

---

## 🔧 サポートスクリプト

### verify_phase2.py

```python
#!/usr/bin/env python3
"""Phase 2の完全性と品質を検証"""
import csv

with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    
    empty = 0
    too_short = 0
    semicolon_violation = 0
    total = 0
    word_counts = []
    
    for row in reader:
        total += 1
        example = row['example_en']
        
        if not example.strip():
            empty += 1
        else:
            word_count = len(example.split())
            word_counts.append(word_count)
            
            if word_count < 10:
                too_short += 1
                print(f"Short ({word_count}語): {row['en']} -> {example}")
            
            # セミコロンルール違反（例文にセミコロン）
            if ';' in example:
                semicolon_violation += 1
                print(f"Semicolon: {row['en']} -> {example}")
    
    avg_words = sum(word_counts) / len(word_counts) if word_counts else 0
    
    print(f"\n=== Phase 2 Verification ===")
    print(f"Total: {total}")
    print(f"Empty: {empty}")
    print(f"Too short (<10 words): {too_short}")
    print(f"Semicolon violations: {semicolon_violation}")
    print(f"Average words: {avg_words:.1f}")
    
    if empty == 0 and too_short == 0 and semicolon_violation == 0:
        print("✅ Phase 2 完了")
    else:
        print(f"⏳ 残り問題: {empty + too_short + semicolon_violation}")
```

---

## 📝 進捗管理

```bash
# 現在の完了状況
python3 scripts/verify_phase2.py

# 完了率
awk -F'\t' 'NR>1 && $3!="" {filled++} END {print "Phase 2:", filled "/" NR-1}' data/words.csv
```

---

## 次のフェーズ

Phase 2完了後 → **Phase 3: 多言語翻訳（meaning_translation）**

---

**最終更新**: 2026-02-09
