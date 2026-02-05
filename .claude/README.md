# .claude ディレクトリ構造

## 概要

プロジェクト管理・翻訳プロンプト・品質ガイドラインを格納。

## ディレクトリ構造

```
.claude/
├── PROGRESS.md                    # 📊 メイン進捗管理ファイル
├── prompts/                       # 🤖 サブエージェント用プロンプト
│   ├── README.md                  # プロンプトインデックス
│   ├── stage3-translate-gender-*.md   # Stage 3: 性別翻訳（8言語）
│   └── stage4-translate-meaning-*.md  # Stage 4: 意味翻訳（10言語）
├── guides/                        # 📖 品質ガイドライン
│   ├── translation-guide.md       # 翻訳全般のガイド
│   ├── quality-check-guide.md     # 品質チェック方法
│   ├── gender_translations_review_guidelines.md
│   ├── meaning_translations_review_guidelines.md
│   └── example_translations_review_guidelines.md
└── workflow/                      # 🔄 ワークフロー管理
    ├── README.md                  # ワークフロー追跡システム説明
    ├── progress-report.json       # 自動生成進捗レポート
    ├── summary.md                 # 可視化サマリー
    └── old-*.md                   # 旧ファイル（参照用）
```

## 主要ファイル説明

### 📊 PROGRESS.md
- **用途**: プロジェクト全体の進捗管理
- **更新頻度**: 各ステージ完了時
- **内容**: 
  - 6ステージの進捗率
  - 言語別の完成状況
  - 品質問題の記録

### 🤖 prompts/
- **用途**: サブエージェントへの指示書
- **特徴**: 自己完結型プロンプト（外部参照不要）
- **命名規則**: `stageX-translate-{type}-{lang}.md`

### 📖 guides/
- **用途**: 人間・AIのための品質ガイドライン
- **特徴**: 詳細なルールと例
- **対象**: レビュー作業時に参照

### 🔄 workflow/
- **用途**: 単語レベルの進捗追跡
- **自動生成**: スクリプトで最新状態を生成
- **粒度**: 各単語がどのステージにいるか

## ファイル使用フロー

### 翻訳作業時
1. `.claude/PROGRESS.md`で現在のステージを確認
2. `.claude/prompts/README.md`で担当プロンプトを特定
3. 該当プロンプトをサブエージェントに投入
4. 完了後、`.claude/PROGRESS.md`を更新

### 品質チェック時
1. `.claude/guides/`の該当ガイドラインを参照
2. スクリプトで自動チェック実行
3. `.claude/PROGRESS.md`に問題を記録

### 進捗確認時
1. `.claude/PROGRESS.md`で全体像を把握
2. `.claude/workflow/summary.md`で詳細確認
3. 必要に応じて`progress-report.json`を解析

## 更新履歴

| 日付 | 変更内容 |
|------|---------|
| 2025-02-05 | 初版作成、osaka-kenpo構造を参考に整理 |

---

**管理者**: Claude Code Assistant
