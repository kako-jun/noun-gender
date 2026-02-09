# Phase 1: 英語meaning_en生成手順

**目的**: 全単語に対して英語の意味定義（meaning_en）を生成する

---

## 📋 前提条件

- `data/words.csv`に英単語（en列）が存在すること
- meaning_en列が空、または再生成が必要

---

## 🎯 品質基準

### 必須要件
1. **最低20文字以上**の説明文
2. **名詞としての意味**を説明（動詞・形容詞は禁止）
3. 複数の意味がある場合は**セミコロン区切り**
4. 最も一般的な意味を最初に記載
5. **循環参照禁止**（定義文の中に単語自身を使わない）

### 良い例
```
abbey: A building or buildings occupied by a community of monks or nuns
anxiety: A feeling of unease, nervousness, or concern about something with an uncertain outcome
apartment: A self-contained residential unit occupying part of a building
```

### 悪い例
```
anxiety: Worry                    ❌ 同義語のみ（説明ではない）
apartment: Flat                   ❌ 同義語のみ
application: Use                  ❌ 短すぎる
abbey: A monastery or abbey       ❌ 循環参照（abbey自身を使用）
```

---

## 📊 実行手順

### ステップ1: バッチ分割

全単語を10バッチに分割（各バッチ約460語）

```bash
# 総単語数確認
total=$(awk 'END {print NR-1}' data/words.csv)
echo "Total words: $total"

# バッチサイズ計算
batch_size=$((total / 10))
echo "Batch size: ~$batch_size words"
```

### ステップ2: 各バッチでmeaning_en生成

**バッチ1の例（行1-460）**

プロンプト:
```
data/words.csvの行2-461（460語）のmeaning_enを生成してください。

入力: data/words.csv（en列のみ使用）
出力: /tmp/phase1_batch1.tsv（2列: en, meaning_en）

品質基準:
1. 最低20文字以上の説明文
2. 名詞としての意味を説明
3. 複数の意味がある場合はセミコロン区切り
4. 循環参照禁止（定義文に単語自身を使わない）

良い例:
- abbey: A building or buildings occupied by a community of monks or nuns
- anxiety: A feeling of unease, nervousness, or concern

悪い例:
- anxiety: Worry（短すぎ）
- abbey: A monastery or abbey（循環参照）

生成したら最初の5行と最後の5行を表示してください。
```

### ステップ3: 結果検証

```bash
# 行数確認
wc -l /tmp/phase1_batch1.tsv  # 460行であること

# サンプル確認
head -5 /tmp/phase1_batch1.tsv
tail -5 /tmp/phase1_batch1.tsv

# 長さ確認（最低20文字）
awk -F'\t' '{if(length($2)<20) print NR, $1, length($2), $2}' /tmp/phase1_batch1.tsv
```

### ステップ4: CSVに適用

```python
# scripts/apply_phase1_batch.py
import sys
import csv

batch_file = sys.argv[1]  # /tmp/phase1_batch1.tsv
start_line = int(sys.argv[2])  # 2 (skip header)
end_line = int(sys.argv[3])    # 461

# Load new meanings
meanings = {}
with open(batch_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        meanings[row['en']] = row['meaning_en']

print(f"Loaded {len(meanings)} meanings")

# Update words.csv
rows = []
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    for row in reader:
        if row['en'] in meanings:
            row['meaning_en'] = meanings[row['en']]
        rows.append(row)

with open('data/words.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print(f"✓ Applied {len(meanings)} meanings to words.csv")
```

```bash
python3 scripts/apply_phase1_batch.py /tmp/phase1_batch1.tsv 2 461

# 確認
awk -F'\t' 'NR>=2 && NR<=6 {print $1, "|", substr($2,1,50)"..."}' data/words.csv
```

### ステップ5: コミット

```bash
git add data/words.csv
git commit -m "feat(phase1): generate meaning_en batch 1/10 (rows 2-461, 460 words)"
```

### ステップ6: 残り9バッチを繰り返し

Batch 2: 行462-921  
Batch 3: 行922-1381  
...  
Batch 10: 行4133-4592

---

## 🔧 サポートスクリプト

### verify_phase1.py

```python
#!/usr/bin/env python3
"""Phase 1の完全性と品質を検証"""
import csv

with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    
    empty = 0
    too_short = 0
    circular = 0
    total = 0
    
    for row in reader:
        total += 1
        en = row['en']
        meaning = row['meaning_en']
        
        if not meaning.strip():
            empty += 1
        elif len(meaning) < 20:
            too_short += 1
            print(f"Short ({len(meaning)}): {en} -> {meaning}")
        elif en.lower() in meaning.lower():
            circular += 1
            print(f"Circular: {en} -> {meaning}")
    
    print(f"\n=== Phase 1 Verification ===")
    print(f"Total: {total}")
    print(f"Empty: {empty}")
    print(f"Too short (<20 chars): {too_short}")
    print(f"Circular references: {circular}")
    
    if empty == 0 and too_short == 0 and circular == 0:
        print("✅ Phase 1 完了")
    else:
        print(f"⏳ 残り問題: {empty + too_short + circular}")
```

---

## 📝 進捗管理

```bash
# 現在の完了状況
python3 scripts/verify_phase1.py

# 完了率
awk -F'\t' 'NR>1 && $2!="" {filled++} END {print "Phase 1:", filled "/" NR-1}' data/words.csv
```

---

## 次のフェーズ

Phase 1完了後 → **Phase 2: example_en生成**

---

**最終更新**: 2026-02-09
