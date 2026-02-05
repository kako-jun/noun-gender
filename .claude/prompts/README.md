# Noun Gender - 翻訳プロンプトインデックス

## 概要

このディレクトリには、サブエージェントに単語を各言語に翻訳させるためのプロンプトが含まれています。

## ワークフローステージ

各英単語（4,592語）は以下のステージを通過します：

| Stage | 成果物 | 並列数 | プロンプト |
|-------|--------|--------|-----------|
| Stage 1 | 英語意味定義 | 1 | - |
| Stage 2 | 英語例文 | 1 | - |
| Stage 3 | 性別付き翻訳 | 8言語 | `stage3-translate-gender-{LANG}.md` |
| Stage 4 | 意味説明翻訳 | 10言語 | `stage4-translate-meaning-{LANG}.md` |
| Stage 5 | 例文翻訳 | 10言語 | （未実装） |
| Stage 6 | 記憶術 | 24組合せ | （未実装） |

## Stage 3: 性別付き翻訳プロンプト（8言語）

| プロンプト | 言語 | CSV | 担当列 | 状態 |
|-----------|------|-----|--------|------|
| `stage3-translate-gender-fr.md` | フランス語 | word_gender_translations.csv | fr_translation, fr_gender | ⏳ 準備中 |
| `stage3-translate-gender-de.md` | ドイツ語 | word_gender_translations.csv | de_translation, de_gender | ⏳ 準備中 |
| `stage3-translate-gender-es.md` | スペイン語 | word_gender_translations.csv | es_translation, es_gender | ⏳ 準備中 |
| `stage3-translate-gender-it.md` | イタリア語 | word_gender_translations.csv | it_translation, it_gender | ⏳ 準備中 |
| `stage3-translate-gender-pt.md` | ポルトガル語 | word_gender_translations.csv | pt_translation, pt_gender | ⏳ 準備中 |
| `stage3-translate-gender-ru.md` | ロシア語 | word_gender_translations.csv | ru_translation, ru_gender | ⏳ 準備中 |
| `stage3-translate-gender-ar.md` | アラビア語 | word_gender_translations.csv | ar_translation, ar_gender | ⏳ 準備中 |
| `stage3-translate-gender-hi.md` | ヒンディー語 | word_gender_translations.csv | hi_translation, hi_gender | ⏳ 準備中 |

## Stage 4: 意味説明翻訳プロンプト（10言語）

| プロンプト | 言語 | CSV | 担当列 | 状態 |
|-----------|------|-----|--------|------|
| - | 日本語 | word_meaning_translations.csv | meaning_ja | ✅ 既存保持 |
| - | 中国語 | word_meaning_translations.csv | meaning_zh | ✅ 既存保持 |
| `stage4-translate-meaning-fr.md` | フランス語 | word_meaning_translations.csv | meaning_fr | ⏳ 準備中 |
| `stage4-translate-meaning-de.md` | ドイツ語 | word_meaning_translations.csv | meaning_de | ⏳ 準備中 |
| `stage4-translate-meaning-es.md` | スペイン語 | word_meaning_translations.csv | meaning_es | ⏳ 準備中 |
| `stage4-translate-meaning-it.md` | イタリア語 | word_meaning_translations.csv | meaning_it | ⏳ 準備中 |
| `stage4-translate-meaning-pt.md` | ポルトガル語 | word_meaning_translations.csv | meaning_pt | ⏳ 準備中 |
| `stage4-translate-meaning-ru.md` | ロシア語 | word_meaning_translations.csv | meaning_ru | ⏳ 準備中 |
| `stage4-translate-meaning-ar.md` | アラビア語 | word_meaning_translations.csv | meaning_ar | ⏳ 準備中 |
| `stage4-translate-meaning-hi.md` | ヒンディー語 | word_meaning_translations.csv | meaning_hi | ⏳ 準備中 |

## 使用方法

### Git Worktreeでの並列翻訳

#### 1. Worktree作成
```bash
# Stage 3用（8ブランチ）
for lang in fr de es it pt ru ar hi; do
  git worktree add ../noun-gender-stage3-$lang -b stage3-translate-gender-$lang
done

# Stage 4用（8ブランチ、ja/zhは除外）
for lang in fr de es it pt ru ar hi; do
  git worktree add ../noun-gender-stage4-$lang -b stage4-translate-meaning-$lang
done
```

#### 2. サブエージェントに投入
各Worktreeディレクトリで該当するプロンプトをサブエージェントに投げる：

```bash
# 例: フランス語の性別翻訳
cd ../noun-gender-stage3-fr
# サブエージェントに .claude/prompts/stage3-translate-gender-fr.md を投入
```

#### 3. 完了後のマージ
```bash
# mainブランチに戻る
cd noun-gender
git checkout main

# 各ブランチをマージ
for lang in fr de es it pt ru ar hi; do
  git merge stage3-translate-gender-$lang
  git merge stage4-translate-meaning-$lang
done

# Worktreeをクリーンアップ
for lang in fr de es it pt ru ar hi; do
  git worktree remove ../noun-gender-stage3-$lang
  git worktree remove ../noun-gender-stage4-$lang
done
```

## 品質チェック

翻訳完了後、以下のスクリプトで品質を確認：

```bash
# Stage 3の品質チェック（性別翻訳）
npm run check:gender-translations

# Stage 4の品質チェック（意味翻訳）
npm run check:meaning-translations

# 統合チェック
npm run check:all
```

## 品質基準

### Stage 3: 性別付き翻訳

✅ **良好な翻訳**:
- meaning_enの**最初の意味のみ**を翻訳
- 必ず**名詞**として翻訳
- 文法的性別が正確（m/f/n）
- タイプミス・アクセント記号の誤りゼロ

❌ **不良な翻訳**:
- セミコロン後の意味を含める
- 動詞・形容詞で翻訳
- 3文字未満の異常に短い翻訳
- 性別記号の誤り

### Stage 4: 意味説明翻訳

✅ **良好な翻訳**:
- meaning_enの**全体**を翻訳
- 名詞の意味として翻訳
- 同一言語内で重複語を排除
- 自然で正確な表現

❌ **不良な翻訳**:
- 動詞・形容詞の意味で翻訳
- 同一言語内での重複語（例: "能力; 能力; 容量"）
- 機械翻訳的な不自然な表現

## トラブルシューティング

### プロンプトが見つからない

すべてのプロンプトが準備されているわけではありません。以下のコマンドで生成してください：

```bash
# Stage 3のプロンプト生成
npm run generate:stage3-prompts

# Stage 4のプロンプト生成
npm run generate:stage4-prompts
```

### マージ競合が発生した

言語別分割なのでマージ競合は**発生しないはず**です。もし発生した場合：

1. 異なる言語のブランチが同じ列を編集していないか確認
2. CSV形式が壊れていないか確認（タブ区切り）
3. 手動でマージを完了し、品質チェックを実行

## 関連ドキュメント

- [進捗管理](../PROGRESS.md)
- [翻訳ガイドライン](../guides/translation-guide.md)
- [品質チェック方法](../guides/quality-check-guide.md)

---

**最終更新**: 2025-02-05  
**管理者**: Claude Code Assistant
