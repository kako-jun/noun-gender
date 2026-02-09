# 翻訳プロジェクト - 実行可能な手順書

**最終更新**: 2026-02-09  
**現状**: Phase 1/2完了、Phase 3作業中（meaning_translation列の翻訳）

---

## ✅ 完了済みフェーズ

### Phase 1: 英語meaning_en生成（完了）
- コミット: `8125962` (2026-02-05)
- 内容: 全4,592語のmeaning_enを生成
- 品質基準: 最低20文字、名詞定義、循環参照なし
- 状態: **100%完了** ✅

### Phase 2: 英語example_en生成（完了）
- コミット: `caea427` (2026-02-05)
- 内容: 全4,592語のexample_enを生成
- 品質基準: 最低10単語、セミコロンルール遵守、名詞用法のみ
- 状態: **100%完了** ✅

**Phase 1/2は完了しているため、再実行不要です。**

---

## 📊 現在のデータ状況（Phase 3）

### ファイル構成
```
data/
├── words.csv                      # 英語マスター（4,592語、アルファベット順）
├── meanings_first_only.txt        # 英語定義（セミコロン前のみ、4,592行）
├── translations_fr.csv            # フランス語（4,592行、ソート済）
├── translations_de.csv            # ドイツ語（4,592行、ソート済）
├── translations_es.csv            # スペイン語（4,592行、ソート済）
├── translations_it.csv            # イタリア語（4,592行、ソート済）
├── translations_pt.csv            # ポルトガル語（4,592行、ソート済）
├── translations_ru.csv            # ロシア語（4,592行、ソート済）
├── translations_ar.csv            # アラビア語（4,592行、ソート済）
└── translations_hi.csv            # ヒンディー語（4,592行、ソート済）
```

### 各翻訳ファイルの状態
```csv
en	translation	gender	meaning_translation
abbey	abbaye	f	（空）
abbreviation	abréviation	f	（空）
```

- **列1 (en)**: 英単語（アルファベット順）
- **列2 (translation)**: 翻訳済み ✅
- **列3 (gender)**: 性別済み ✅
- **列4 (meaning_translation)**: **空（これから埋める）**

---

## 🎯 残りタスク: meaning_translation列の翻訳

### 目標
`data/meanings_first_only.txt`（4,592行の英語定義）を8言語に翻訳し、各CSVの列4に埋める。

### 制約
- ❌ **使えない方法**: 大規模Subagent並列実行（4,592行×8言語は非現実的）
- ✅ **使える方法**: バッチ分割 + 人間の確認 + 段階的適用

---

## 📋 実行手順

### Phase 1: 小規模バッチでテスト（100語）

#### ステップ1.1: テスト用データ作成
```bash
# 最初の100行を抽出
head -100 data/meanings_first_only.txt > /tmp/test_meanings.txt

# 最初の100語の英単語リストを取得
awk -F'\t' 'NR>1 && NR<=101 {print $1}' data/words.csv > /tmp/test_words.txt
```

#### ステップ1.2: 1言語（フランス語）でテスト翻訳

**プロンプト**:
```
以下の100行の英語定義文を、フランス語に翻訳してください。

入力ファイル: /tmp/test_meanings.txt

ルール:
1. 行番号1から100まで、順番に翻訳
2. 各行は名詞の定義文
3. 英語の構造と意味を忠実に翻訳
4. 出力: プレーンテキスト、100行、ヘッダーなし

出力ファイル: /tmp/test_meanings_fr.txt

完了したら最初の5行と最後の5行を表示してください。
```

#### ステップ1.3: 結果検証
```bash
# 行数確認
wc -l /tmp/test_meanings_fr.txt  # 100行であること

# サンプル確認
head -3 /tmp/test_meanings.txt
head -3 /tmp/test_meanings_fr.txt

# 品質確認（目視）
paste /tmp/test_meanings.txt /tmp/test_meanings_fr.txt | head -10
```

#### ステップ1.4: CSVに適用
```python
# /tmp/apply_test.py
import csv

# Load translations
with open('/tmp/test_meanings_fr.txt', 'r', encoding='utf-8') as f:
    translations = [line.strip() for line in f]

# Update CSV
rows = []
with open('data/translations_fr.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    rows = list(reader)

# Apply to first 100 data rows (skip header)
for i in range(100):
    rows[i+1][3] = translations[i]  # Column 4 (index 3)

# Write back
with open('data/translations_fr.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, delimiter='\t')
    writer.writerows(rows)

print("✓ Applied 100 translations to translations_fr.csv")
```

```bash
python3 /tmp/apply_test.py

# 確認
awk -F'\t' 'NR<=5 {print $1, "|", substr($4,1,50)"..."}' data/translations_fr.csv
```

#### ステップ1.5: テスト成功なら次へ

---

### Phase 2: 全言語バッチ翻訳（500語ずつ）

#### バッチ分割計画
```
Batch 1:  行    1 -  500
Batch 2:  行  501 - 1000
Batch 3:  行 1001 - 1500
Batch 4:  行 1501 - 2000
Batch 5:  行 2001 - 2500
Batch 6:  行 2501 - 3000
Batch 7:  行 3001 - 3500
Batch 8:  行 3501 - 4000
Batch 9:  行 4001 - 4500
Batch 10: 行 4501 - 4592
```

#### 各バッチの実行手順

**例: Batch 1（行1-500）**

1. **抽出**
```bash
sed -n '1,500p' data/meanings_first_only.txt > /tmp/batch1.txt
```

2. **翻訳**（1言語ずつ順次実行）

**フランス語**:
```
/tmp/batch1.txtの500行をフランス語に翻訳してください。

ルール:
- 各行は名詞の定義文
- 英語の意味と構造を忠実に翻訳
- 出力: /tmp/batch1_fr.txt（500行、ヘッダーなし）

完了したら最初の3行と最後の3行を表示。
```

3. **検証**
```bash
wc -l /tmp/batch1_fr.txt  # 500行確認
head -3 /tmp/batch1_fr.txt
tail -3 /tmp/batch1_fr.txt
```

4. **適用**
```python
# /tmp/apply_batch.py
import sys
import csv

lang = sys.argv[1]       # 例: 'fr'
batch_file = sys.argv[2] # 例: '/tmp/batch1_fr.txt'
start_line = int(sys.argv[3])  # 例: 1
end_line = int(sys.argv[4])    # 例: 500

# Load translations
with open(batch_file, 'r', encoding='utf-8') as f:
    translations = [line.strip() for line in f]

# Update CSV
csv_file = f'data/translations_{lang}.csv'
rows = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    rows = list(reader)

# Apply
for i, translation in enumerate(translations):
    row_idx = start_line + i  # +1 for header offset
    rows[row_idx][3] = translation

with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, delimiter='\t')
    writer.writerows(rows)

print(f"✓ Applied {len(translations)} translations to {csv_file}")
```

```bash
python3 /tmp/apply_batch.py fr /tmp/batch1_fr.txt 1 500
```

5. **コミット**
```bash
git add data/translations_fr.csv
git commit -m "feat(translations): add French meanings batch 1 (rows 1-500)"
```

6. **次の言語へ**（ドイツ語、スペイン語...）

---

### Phase 3: 全バッチ完了まで繰り返し

各バッチ×8言語 = 80回の翻訳作業

**進捗管理**:
```bash
# 現在の完了状況を確認
for lang in fr de es it pt ru ar hi; do
  filled=$(awk -F'\t' 'NR>1 && $4!=""' data/translations_${lang}.csv | wc -l)
  echo "$lang: $filled / 4592"
done
```

---

## 🔧 サポートスクリプト

### verify_meanings.py
```python
#!/usr/bin/env python3
"""意味翻訳の完全性を検証"""
import sys
import csv

lang = sys.argv[1]
filename = f'data/translations_{lang}.csv'

with open(filename, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    
    empty = 0
    filled = 0
    for row in reader:
        if row['meaning_translation'].strip():
            filled += 1
        else:
            empty += 1
    
    total = empty + filled
    print(f"{lang.upper()}: {filled}/{total} ({filled*100//total}%)")
    
    if empty == 0:
        print("✅ 完了")
    else:
        print(f"⏳ 残り{empty}行")
```

---

## 📝 重要な原則

1. **一度に大量を処理しない**: 500行ずつ、1言語ずつ
2. **毎回検証する**: 行数、サンプル確認、目視チェック
3. **毎回コミットする**: バッチごとに確実にコミット
4. **失敗したら小分けにする**: 500行が多すぎたら250行に
5. **進捗を追跡する**: 完了した言語・バッチを記録

---

## 次回セッション開始時

1. このファイルを読む
2. `python3 verify_meanings.py fr`で現状確認
3. 未完了のバッチから再開

---

**この手順なら確実に完了できる。急がず、着実に。**
