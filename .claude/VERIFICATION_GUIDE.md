# データ検証ガイド

**作成日**: 2025-02-06  
**目的**: Phase 2とPhase 3のデータ品質を保証する

---

## Phase 2検証：英語定義の品質チェック

### 検証スクリプト

```bash
python3 scripts/verify_meaning_en_quality.py
```

### 何をチェックするか

このスクリプトは`data/words.csv`の`meaning_en`列をスキャンし、**動詞・形容詞・副詞の定義**が混入していないか検出します。

#### 検出パターン

| パターン | 説明 | 例 |
|---------|------|-----|
| **動詞** | "To + 動詞" で始まる | "To walk", "To encourage" |
| **動名詞** | 動詞的行為を示す | "Encouraging", "Promoting", "Causing" |
| **形容詞** | 性質を示す | "Relating to", "Involving", "Characteristic of" |
| **副詞** | 方向・様態を示す | "Out from a starting point", "Toward the west" |

#### 期待される結果

**✅ すべて名詞定義の場合**:
```
✅ すべての meaning_en が名詞定義です！
   総単語数: 4592
```

**❌ 問題がある場合**:
```
❌ 非名詞定義の単語: 34件

Line 1672: forth [ADVERB]
  → Out from a starting point and forward or into view

Line 1677: foster [GERUND]
  → Encouraging or promoting the development of something
```

### 問題があった場合の対処

1. **問題のある単語をリストアップ**
   - スクリプトが自動で表示します

2. **各単語を名詞定義に修正**
   ```python
   # 例: forth を修正
   # ❌ 旧: "Out from a starting point"（副詞）
   # ✅ 新: "Forward movement; onward progress"（名詞）
   ```

3. **`example_en`も修正**
   ```python
   # ❌ 旧: "The army marched forth into battle"（副詞用法）
   # ✅ 新: "The forth of the expedition required careful planning"（名詞用法）
   ```

4. **再度検証**
   ```bash
   python3 scripts/verify_meaning_en_quality.py
   ```

5. **✅が出るまで繰り返す**

---

## Phase 3検証：翻訳の完成度チェック

### 検証スクリプト

```bash
python3 scripts/verify_translations.py <lang_code> <start_row> <end_row>
```

### 使用例

#### フランス語全体を検証
```bash
python3 scripts/verify_translations.py fr 1 4592
```

**期待される結果**:
```
検証中: FR 行1～4592...
✅ FR[1:4592] 完全完了: 4592語
```

#### 特定バッチのみ検証（開発中）
```bash
# Batch 1（行1-230）のみ
python3 scripts/verify_translations.py fr 1 230
```

**結果例（未完了の場合）**:
```
検証中: FR 行1～230...
❌ FR[1:230] 未完了: 5語
   完了: 225/230 (97.8%)

未完了単語（最初の10語）:
  Line 10: ability
  Line 15: absence
  Line 20: abstract
  Line 50: advance
  Line 100: agency
```

### エラーの種類

#### 1. 未完了エラー（translation が空）
```
❌ FR[1:4592] 未完了: 464語
   完了: 4128/4592 (89.9%)
```
**対処**: 欠落している単語を翻訳して追加

#### 2. 性別エラー（gender が不正）
```
⚠️  FR[1:4592] 性別エラー: 49語
  Line 246: astronaut (gender='m/f')
  Line 721: chess (gender='m pl')
```
**対処**: 性別を `m` または `f` のみに統一

### 不正な性別値

フランス語では **`m` または `f` のみ許可**:

| 不正な値 | 正しい値 | 説明 |
|---------|---------|------|
| `m/f` | `m` または `f` | 男女同形は標準形を選ぶ |
| `m pl` | `m` | 複数形のみの名詞は単数形の性別 |
| `f pl` | `f` | 複数形のみの名詞は単数形の性別 |
| `n` | `m` または `f` | フランス語に中性はない |
| `(空欄)` | `m` または `f` | 必ず指定 |

---

## Phase 3開始前チェックリスト

Phase 3（翻訳）を開始する前に、以下を必ず実行：

### ✅ チェックリスト

1. **Phase 2検証**
   ```bash
   python3 scripts/verify_meaning_en_quality.py
   ```
   - [ ] ✅ すべての meaning_en が名詞定義
   - [ ] エラーがあれば Phase 2 に戻って修正

2. **`example_en`の目視確認**（サンプリング）
   ```bash
   # ランダムに10語を確認
   shuf -n 10 data/words.csv | cut -f1,3
   ```
   - [ ] 名詞用法の例文になっているか確認

3. **Gitコミット**
   ```bash
   git add data/words.csv
   git commit -m "fix(phase2): ensure all definitions are noun-only"
   ```
   - [ ] Phase 2の修正をコミット

4. **Phase 3開始**
   - [ ] `.claude/PHASE3-NEW-PROCEDURE.md` の手順に従う

---

## トラブルシューティング

### Q1: "python3: command not found"

**解決策**:
```bash
# Python 3がインストールされているか確認
python --version  # または python3 --version

# なければインストール
sudo apt install python3  # Ubuntu/Debian
brew install python3      # macOS
```

### Q2: "FileNotFoundError: data/words.csv"

**解決策**:
```bash
# プロジェクトルートにいるか確認
pwd  # 出力: /path/to/noun-gender

# プロジェクトルートに移動
cd /path/to/noun-gender
```

### Q3: 検証スクリプトが "0件の問題" と表示するが、明らかに問題がある

**原因**: 検出パターンが不完全

**解決策**: スクリプトを改善するか、手動で確認
```bash
# 動詞定義を手動検索
grep -P '\tTo ' data/words.csv

# 動名詞定義を手動検索
grep -P '\t(Encouraging|Promoting|Causing)' data/words.csv
```

---

## スクリプトのメンテナンス

### 検出パターンの追加

`scripts/verify_meaning_en_quality.py` のパターンリストを編集：

```python
VERB_PATTERNS = [
    'To ', 'to ',  # 既存
    'For ',       # 追加例: "For the purpose of"
]

GERUND_PATTERNS = [
    'Encouraging', 'Promoting', 'Causing',  # 既存
    'Allowing', 'Preventing',               # 追加
]
```

### 新しい言語の検証

`scripts/verify_translations.py` に言語を追加：

```python
VALID_GENDERS = {
    'fr': ['m', 'f'],
    'de': ['m', 'f', 'n'],
    'ru': ['m', 'f', 'n'],
    # 新しい言語を追加
    'ar': ['m', 'f'],
}
```

---

**最終更新**: 2025-02-06
