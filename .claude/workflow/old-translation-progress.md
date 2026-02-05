# 翻訳進捗管理 - 仕切り直し

## 現状分析（2025-02-05）

### データ完成度
| CSV | 総行数 | 完成率 | 状態 |
|-----|--------|--------|------|
| word_gender_translations.csv | 4,592 | 100% (8言語) | ✅ 全翻訳済み |
| word_meaning_translations.csv | 4,592 | 100% (10言語) | ✅ 全翻訳済み |
| word_examples.csv | 4,592 | 100% | ✅ 英語例文完備 |
| example_translations.csv | 45,920 | 100% (10言語) | ✅ 全翻訳済み |
| memory_tricks_creation.csv | 15,400 | 0.1% | ⏳ 未着手 |

### 🔴 品質問題（推定）

#### 既知の問題（tasks.mdより）
1. **品詞修正**: 形容詞として翻訳された名詞（推定500-1,000語）
2. **翻訳精度**: 明らかな誤訳の存在
3. **セミコロンルール**: 最初の意味のみ翻訳すべきところ全体を翻訳

#### 検証が必要な問題
- [ ] word_gender_translations.csv: セミコロンルール遵守率
- [ ] word_gender_translations.csv: 品詞の正確性（名詞 vs 形容詞/動詞）
- [ ] word_meaning_translations.csv: 同一言語内重複
- [ ] 全CSV: タイプミス・アクセント記号の誤り

## 仕切り直し戦略

### 🎯 Option 1: 全面やり直し（推奨）
**理由**: 品質基準が不明確なまま翻訳された可能性が高い

#### 実施手順
1. **バックアップ作成**
   ```bash
   mkdir -p data/backup_2025-02-05
   cp data/*.csv data/backup_2025-02-05/
   ```

2. **CSVの初期化（翻訳列を空にする）**
   ```python
   # word_gender_translations.csv の翻訳列を空にする
   import csv
   
   with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
       reader = csv.DictReader(f, delimiter='\t')
       fieldnames = reader.fieldnames
       rows = list(reader)
   
   # 翻訳列のみクリア（en, meaning_enは保持）
   for row in rows:
       for lang in ['fr', 'de', 'es', 'it', 'pt', 'ru', 'ar', 'hi']:
           row[f'{lang}_translation'] = ''
           row[f'{lang}_gender'] = ''
   
   with open('data/word_gender_translations.csv', 'w', encoding='utf-8', newline='') as f:
       writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
       writer.writeheader()
       writer.writerows(rows)
   ```

3. **Git Worktree並列翻訳**
   - 8言語 × 2CSV = 16ブランチ同時作業

#### 作業時間見積もり
- 各言語CSVあたり: 2-3時間（AIによる翻訳 + 品質チェック）
- 総作業時間: 32-48時間（16タスク × 2-3時間）
- **並列実行**: 16タスク同時 → 2-3時間で完了

---

### 🔍 Option 2: 段階的修正（時間がかかる）
**理由**: 既存翻訳の検証 + 修正作業が複雑

#### 実施手順
1. **Phase 1: 品質検証**（推定8時間）
   - 全言語の全行をレビューガイドラインで検証
   - 問題箇所をリストアップ

2. **Phase 2: 修正作業**（推定20-30時間）
   - 検出された問題を個別修正
   - 再検証サイクル

3. **Phase 3: 最終確認**（推定4時間）
   - 全データの最終品質チェック

#### 作業時間見積もり
- 総作業時間: 32-42時間
- **逐次実行**: 並列化困難 → 実時間32-42時間

---

## 🎯 推奨アプローチ: Option 1（全面やり直し）

### メリット
✅ 品質基準が統一される  
✅ 並列実行で短時間完了（2-3時間）  
✅ セミコロンルール・品詞ルールを完全遵守  
✅ 既存の品質問題をすべて解決

### デメリット
❌ 既存翻訳が無駄になる（ただし品質不明）

### 実行計画

#### ステップ1: バックアップ（5分）
```bash
mkdir -p data/backup_2025-02-05
cp data/word_gender_translations.csv data/backup_2025-02-05/
cp data/word_meaning_translations.csv data/backup_2025-02-05/
```

#### ステップ2: CSV初期化スクリプト作成（10分）
```bash
# scripts/reset_translations.py を作成
```

#### ステップ3: Git Worktree準備（10分）
```bash
# 16ブランチを作成
for lang in fr de es it pt ru ar hi; do
  git worktree add ../noun-gender-translate-gender-$lang -b translate-gender-$lang
  git worktree add ../noun-gender-translate-meaning-$lang -b translate-meaning-$lang
done
```

#### ステップ4: 並列翻訳実行（2-3時間）
```bash
# 16個のサブエージェントに同時投入
# 各エージェントはプロンプトに従って作業
```

#### ステップ5: マージと検証（30分）
```bash
# 全ブランチをmainにマージ
# 自動品質チェック実行
```

---

## 進捗トラッキング

### word_gender_translations.csv（8言語）
| 言語 | 進捗 | 担当ブランチ | 状態 | 完了日時 |
|------|------|--------------|------|----------|
| フランス語 (fr) | 0% | translate-gender-fr | ⏳ 待機 | - |
| ドイツ語 (de) | 0% | translate-gender-de | ⏳ 待機 | - |
| スペイン語 (es) | 0% | translate-gender-es | ⏳ 待機 | - |
| イタリア語 (it) | 0% | translate-gender-it | ⏳ 待機 | - |
| ポルトガル語 (pt) | 0% | translate-gender-pt | ⏳ 待機 | - |
| ロシア語 (ru) | 0% | translate-gender-ru | ⏳ 待機 | - |
| アラビア語 (ar) | 0% | translate-gender-ar | ⏳ 待機 | - |
| ヒンディー語 (hi) | 0% | translate-gender-hi | ⏳ 待機 | - |

### word_meaning_translations.csv（10言語）
| 言語 | 進捗 | 担当ブランチ | 状態 | 完了日時 |
|------|------|--------------|------|----------|
| 日本語 (ja) | 100% | - | ✅ 既存保持 | - |
| 中国語 (zh) | 100% | - | ✅ 既存保持 | - |
| フランス語 (fr) | 0% | translate-meaning-fr | ⏳ 待機 | - |
| ドイツ語 (de) | 0% | translate-meaning-de | ⏳ 待機 | - |
| スペイン語 (es) | 0% | translate-meaning-es | ⏳ 待機 | - |
| イタリア語 (it) | 0% | translate-meaning-it | ⏳ 待機 | - |
| ポルトガル語 (pt) | 0% | translate-meaning-pt | ⏳ 待機 | - |
| ロシア語 (ru) | 0% | translate-meaning-ru | ⏳ 待機 | - |
| アラビア語 (ar) | 0% | translate-meaning-ar | ⏳ 待機 | - |
| ヒンディー語 (hi) | 0% | translate-meaning-hi | ⏳ 待機 | - |

**注**: 日本語・中国語の meaning は既存品質が高いため保持する方針

---

## 次のアクション

### 今すぐ決定が必要
- [ ] Option 1（全面やり直し）vs Option 2（段階的修正）の選択
- [ ] 日本語・中国語の meaning 翻訳を保持するか再翻訳するか

### Option 1 を選択した場合の即時タスク
1. [ ] バックアップ作成
2. [ ] CSV初期化スクリプト作成・実行
3. [ ] Git Worktree セットアップ
4. [ ] 16個のサブエージェントプロンプト準備
5. [ ] 並列翻訳実行

---

**最終更新**: 2025-02-05  
**次回レビュー**: 翻訳完了後  
**担当**: Claude Code Assistant
