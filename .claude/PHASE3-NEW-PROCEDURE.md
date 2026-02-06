# Phase 3 完全手順書 - 新CSV構造版

**作成日**: 2025-02-06  
**前提**: Phase 2完了（words.csv完成、meaning_en/example_en完備）

---

## 🎯 新CSV構造の概要

### ファイル構成

```
data/
├── words.csv              # 英語マスター（4,592語）
│   └── 列: en, meaning_en, example_en
│
├── translations_fr.csv    # フランス語（4,592行）
├── translations_de.csv    # ドイツ語（4,592行）
├── translations_es.csv    # スペイン語（4,592行）
├── translations_it.csv    # イタリア語（4,592行）
├── translations_pt.csv    # ポルトガル語（4,592行）
├── translations_ru.csv    # ロシア語（4,592行）
├── translations_ar.csv    # アラビア語（4,592行）
├── translations_hi.csv    # ヒンディー語（4,592行）
├── translations_ja.csv    # 日本語（4,592行）
└── translations_zh.csv    # 中国語（4,592行）
```

各翻訳ファイルの構造：
```csv
en	translation	gender	meaning_translation
abbey			
abbreviation			
ability			
...（4,592行）
```

### 新構造の利点

1. **行番号=単語番号**: 1行目=abbey, 1000行目=cotton（明確）
2. **並列処理安全**: ファイル分離により衝突なし
3. **エージェント混乱なし**: 1ファイル=1言語で単純
4. **バッチ処理容易**: "500-750行目"と指定可能

---

## 📋 Phase 3: 性別付き翻訳（8言語）

### 対象言語

Stage 3では**8言語のみ**（ja/zhは後回し）：
- fr (フランス語): m/f
- de (ドイツ語): m/f/n
- es (スペイン語): m/f
- it (イタリア語): m/f
- pt (ポルトガル語): m/f
- ru (ロシア語): m/f/n
- ar (アラビア語): m/f
- hi (ヒンディー語): m/f

### 作業方針

**1言語ずつ、複数エージェントで並列処理**

例: フランス語（4,592語）を20エージェントで処理
```
Agent 1:  行   1 -  250 (abbey～...)
Agent 2:  行 251 -  500
...
Agent 20: 行4501 - 4592（最終）
```

各エージェント完了後、**即座にコミット**。

---

## 🚀 実行手順

### 手順1: フランス語を完了

#### ステップ1.1: バッチ分割計画

```python
# 4,592語を20エージェントに分割（各230語）
batch_size = 230
batches = [
    (1, 230),
    (231, 460),
    (461, 690),
    ...
    (4371, 4592)
]
```

#### ステップ1.2: 20エージェント起動（並列）

**プロンプトテンプレート**（`.claude/workflow/TEMPLATE-stage3-batch.md`参照）：

```markdown
# フランス語翻訳 - Batch {N}/20 (行{START}-{END})

## タスク
`data/translations_fr.csv`の{START}～{END}行目（{COUNT}語）を翻訳。

## 手順
1. words.csvから該当行の単語と意味を読み込む
2. あなた自身が直接フランス語翻訳を生成
3. translations_fr.csvの該当行を更新

## Pythonコード
```python
import csv

# words.csvから対象単語を読み込む
words = []
with open('data/words.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for i, row in enumerate(reader, 1):
        if {START} <= i <= {END}:
            words.append({
                'en': row['en'],
                'meaning_en': row['meaning_en']
            })

print(f"対象単語: {len(words)}語")

# あなた（Claude）が直接翻訳を生成
translations = {}
for word in words:
    en = word['en']
    first_meaning = word['meaning_en'].split(';')[0].strip()
    
    # 全{COUNT}語の翻訳を生成
    if en == 'abbey':
        translations[en] = ('abbaye', 'f')
    elif en == 'ability':
        translations[en] = ('capacité', 'f')
    # ... 残り{COUNT-2}語
    
# translations_fr.csvを更新
all_rows = []
with open('data/translations_fr.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    all_rows = list(reader)

updated = 0
for i, row in enumerate(all_rows, 1):
    if {START} <= i <= {END}:
        en = row['en']
        if en in translations:
            row['translation'], row['gender'] = translations[en]
            updated += 1

with open('data/translations_fr.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(all_rows)

print(f"✅ FR[{START}:{END}] 完了: {updated}/{COUNT}")
```

## 重要ルール
- セミコロンルール: meaning_enの最初の意味のみ翻訳
- 名詞1語のみ: 冠詞なし
- 性別: m/f

## 完了報告
"✅ FR[{START}:{END}] 完了: {COUNT}/{COUNT}"
```

#### ステップ1.3: 各バッチ完了後、検証とコミット

```bash
# バッチ1完了後
python scripts/verify_translations.py fr 1 230
git add data/translations_fr.csv
git commit -m "feat(stage3-fr): complete batch 1/20 (rows 1-230)"

# バッチ2完了後
python scripts/verify_translations.py fr 231 460
git add data/translations_fr.csv
git commit -m "feat(stage3-fr): complete batch 2/20 (rows 231-460)"

# ... 20回繰り返し
```

#### ステップ1.4: フランス語完全完了

```bash
# 最終検証
python scripts/verify_translations.py fr 1 4592

# 最終コミット
git commit -m "feat(stage3-fr): complete all French translations (4592/4592)"
```

---

### 手順2～8: 残り7言語を同様に実行

**ドイツ語、スペイン語、イタリア語...と順次実行。**

各言語完了ごとに：
1. 20エージェント並列処理
2. バッチごとにコミット
3. 最終検証とコミット

---

## 🔧 サポートスクリプト

### verify_translations.py

```python
#!/usr/bin/env python3
"""
翻訳の完全性を検証
"""
import csv
import sys

def verify(lang, start, end):
    filename = f'data/translations_{lang}.csv'
    
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')
        
        missing = []
        for i, row in enumerate(reader, 1):
            if start <= i <= end:
                if not row['translation'].strip() or not row['gender'].strip():
                    missing.append(f"Line {i}: {row['en']}")
        
        if missing:
            print(f"❌ {lang.upper()}[{start}:{end}] 未完了: {len(missing)}語")
            for m in missing[:10]:
                print(f"  {m}")
            return False
        else:
            print(f"✅ {lang.upper()}[{start}:{end}] 完全完了: {end-start+1}語")
            return True

if __name__ == "__main__":
    lang = sys.argv[1]
    start = int(sys.argv[2])
    end = int(sys.argv[3])
    
    success = verify(lang, start, end)
    sys.exit(0 if success else 1)
```

---

## 📝 コミット規則

### バッチコミット
```
feat(stage3-{lang}): complete batch {N}/{TOTAL} (rows {START}-{END})

- Translated: {COUNT} words
- Gender assigned: m/f/n
- Semicolon rule: compliant
```

### 言語完了コミット
```
feat(stage3-{lang}): complete all {LANGUAGE} translations (4592/4592)

- All 4,592 words translated
- Grammatical gender assigned
- Quality verified
- Ready for Stage 4
```

---

## ✅ Phase 3完了条件

全8言語について：
- [ ] FR: 4592/4592 (100%)
- [ ] DE: 4592/4592 (100%)
- [ ] ES: 4592/4592 (100%)
- [ ] IT: 4592/4592 (100%)
- [ ] PT: 4592/4592 (100%)
- [ ] RU: 4592/4592 (100%)
- [ ] AR: 4592/4592 (100%)
- [ ] HI: 4592/4592 (100%)

---

## 🎯 次のフェーズ

Phase 3完了後 → **Phase 4: 意味説明翻訳（10言語）**

同じ構造・手順で`meaning_translation`列を埋める。

---

**この手順書により、二度と混乱せずにPhase 3を完了できる。**
