# 並列翻訳タスク - 実行ガイド

**作成日**: 2025-02-05  
**ステータス**: ✅ 準備完了

---

## ✅ 準備完了

### 1. プロンプト生成
- ✅ Stage 3プロンプト: 8ファイル
- ✅ Stage 4プロンプト: 8ファイル
- 📁 場所: `.claude/prompts/`

### 2. Git Worktree作成
- ✅ Stage 3ブランチ: 8個
- ✅ Stage 4ブランチ: 8個
- 📁 場所: `../noun-gender-stage*-*/`

---

## 🚀 サブエージェント起動方法

### Stage 3: 性別翻訳（8言語）

#### Agent 1: フランス語（stage3-fr）
```bash
cd ../noun-gender-stage3-fr
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-fr.md の内容を実行してください`

#### Agent 2: ドイツ語（stage3-de）
```bash
cd ../noun-gender-stage3-de
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-de.md の内容を実行してください`

#### Agent 3: スペイン語（stage3-es）
```bash
cd ../noun-gender-stage3-es
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-es.md の内容を実行してください`

#### Agent 4: イタリア語（stage3-it）
```bash
cd ../noun-gender-stage3-it
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-it.md の内容を実行してください`

#### Agent 5: ポルトガル語（stage3-pt）
```bash
cd ../noun-gender-stage3-pt
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-pt.md の内容を実行してください`

#### Agent 6: ロシア語（stage3-ru）
```bash
cd ../noun-gender-stage3-ru
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-ru.md の内容を実行してください`

#### Agent 7: アラビア語（stage3-ar）
```bash
cd ../noun-gender-stage3-ar
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-ar.md の内容を実行してください`

#### Agent 8: ヒンディー語（stage3-hi）
```bash
cd ../noun-gender-stage3-hi
```
**プロンプト**: `.claude/prompts/stage3-translate-gender-hi.md の内容を実行してください`

---

### Stage 4: 意味翻訳（8言語）

#### Agent 9: フランス語（stage4-fr）
```bash
cd ../noun-gender-stage4-fr
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-fr.md の内容を実行してください`

#### Agent 10: ドイツ語（stage4-de）
```bash
cd ../noun-gender-stage4-de
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-de.md の内容を実行してください`

#### Agent 11: スペイン語（stage4-es）
```bash
cd ../noun-gender-stage4-es
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-es.md の内容を実行してください`

#### Agent 12: イタリア語（stage4-it）
```bash
cd ../noun-gender-stage4-it
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-it.md の内容を実行してください`

#### Agent 13: ポルトガル語（stage4-pt）
```bash
cd ../noun-gender-stage4-pt
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-pt.md の内容を実行してください`

#### Agent 14: ロシア語（stage4-ru）
```bash
cd ../noun-gender-stage4-ru
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-ru.md の内容を実行してください`

#### Agent 15: アラビア語（stage4-ar）
```bash
cd ../noun-gender-stage4-ar
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-ar.md の内容を実行してください`

#### Agent 16: ヒンディー語（stage4-hi）
```bash
cd ../noun-gender-stage4-hi
```
**プロンプト**: `.claude/prompts/stage4-translate-meaning-hi.md の内容を実行してください`

---

## 📊 進捗追跡

各エージェントが完了後に作成するファイル：
```
.claude/workflow/progress-stage3-fr.txt
.claude/workflow/progress-stage3-de.txt
...
.claude/workflow/progress-stage4-hi.txt
```

全体進捗の確認：
```bash
cat .claude/workflow/progress-*.txt
```

---

## 🔄 完了後のマージ

### すべてのエージェントが完了したら

```bash
# mainブランチに戻る
cd /home/d131/repos/2025/noun-gender
git checkout main

# Stage 3のマージ（8ブランチ）
for lang in fr de es it pt ru ar hi; do
  echo "Merging stage3-$lang..."
  git merge stage3-$lang --no-edit
done

# Stage 4のマージ（8ブランチ）
for lang in fr de es it pt ru ar hi; do
  echo "Merging stage4-$lang..."
  git merge stage4-$lang --no-edit
done

# データベース同期
./scripts/d1_sync_all.sh

# Worktreeクリーンアップ（オプション）
for lang in fr de es it pt ru ar hi; do
  git worktree remove ../noun-gender-stage3-$lang
  git worktree remove ../noun-gender-stage4-$lang
done
```

---

## 📋 チェックリスト

### 実行前
- [x] プロンプト生成完了（16ファイル）
- [x] Git Worktree作成完了（16ブランチ）
- [ ] 各サブエージェント起動準備

### 実行中
- [ ] Agent 1-8: Stage 3翻訳実行中
- [ ] Agent 9-16: Stage 4翻訳実行中

### 実行後
- [ ] 全16エージェント完了確認
- [ ] 進捗ファイル確認（16ファイル）
- [ ] 全ブランチのマージ
- [ ] データベース同期
- [ ] 品質チェック実行

---

## 🎯 期待される結果

- **Stage 3**: 8言語 × 4,592単語 = 36,736セルの性別付き翻訳
- **Stage 4**: 8言語 × 4,592単語 = 36,736セルの意味翻訳
- **推定時間**: 2-3時間（並列実行）
- **品質**: セミコロンルール100%遵守、名詞のみ翻訳、性別正確

---

**次のステップ**: 16個のサブエージェントに上記のプロンプトを投げてください！
