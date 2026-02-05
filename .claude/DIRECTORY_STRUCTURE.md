# .claude ディレクトリ構造

**最終更新**: 2025-02-05

---

## 📁 ディレクトリ構成

```
.claude/
├── MASTER_PLAN.md                      # ★ 6ステージの完全な計画（最重要）
├── README.md                           # プロジェクト全体の説明
├── csv-management.md                   # CSV管理手順
├── er-diagram.md                       # データベーススキーマ
│
├── additional-nouns.md                 # 将来追加する単語候補リスト (185KB)
├── capitalized_english_words.txt       # 大文字単語リスト
├── delete_candidates.md                # 削除候補単語
├── deleted-words.md                    # 削除済み単語
│
├── prompts/                            # プロンプトテンプレート
│   ├── TEMPLATE-stage1-meaning.md      # ★ Stage 1: meaning_en生成
│   ├── TEMPLATE-stage2-example.md      # ★ Stage 2: example_en生成
│   ├── TEMPLATE-stage3-gender.md       # ★ Stage 3: 性別翻訳（8言語）
│   └── TEMPLATE-stage4-meaning.md      # ★ Stage 4: 意味翻訳（10言語）
│
├── guides/                             # 品質レビューガイドライン
│   ├── gender_translations_review_guidelines.md
│   ├── meaning_translations_review_guidelines.md
│   ├── example_translations_review_guidelines.md
│   ├── example_review_guidelines.md
│   └── memory_tricks_review_guidelines.md
│
└── workflow/                           # 進捗管理システム
    ├── PROGRESS_SYSTEM.md              # ★ 進捗管理設計書
    └── progress/                       # 進捗ファイル（JSONL形式）
        ├── stage1.jsonl                # Stage 1進捗（4,592行）
        ├── stage2.jsonl                # Stage 2進捗
        ├── stage3-fr.jsonl             # Stage 3フランス語
        ├── stage3-de.jsonl             # Stage 3ドイツ語
        ├── stage3-es.jsonl             # Stage 3スペイン語
        ├── stage3-it.jsonl             # Stage 3イタリア語
        ├── stage3-pt.jsonl             # Stage 3ポルトガル語
        ├── stage3-ru.jsonl             # Stage 3ロシア語
        ├── stage3-ar.jsonl             # Stage 3アラビア語
        └── stage3-hi.jsonl             # Stage 3ヒンディー語
```

---

## 📋 主要ファイルの役割

### 最重要（★印）

| ファイル | 役割 | 読むタイミング |
|---------|------|--------------|
| **MASTER_PLAN.md** | 6ステージの完全な計画・設計原則 | 次回作業開始時に必ず読む |
| **PROGRESS_SYSTEM.md** | 進捗管理システムの設計書 | 進捗確認・再開時に参照 |
| **TEMPLATE-stage*.md** | 各ステージのプロンプト（4個） | サブエージェント起動時に使用 |

### プロンプトテンプレート（4個）

- **TEMPLATE-stage1-meaning.md**: 全4,592語の`meaning_en`をゼロから生成
- **TEMPLATE-stage2-example.md**: 全4,592語の`example_en`をゼロから生成
- **TEMPLATE-stage3-gender.md**: 性別付き翻訳（8言語、各4,592語）
- **TEMPLATE-stage4-meaning.md**: 意味説明翻訳（10言語、各4,592語）

### 進捗ファイル（JSONL形式）

各ファイルは1行1単語のJSONレコード：

```jsonl
{"en":"abbey","status":"completed","timestamp":"2025-02-05T10:23:45Z","meaning_en_length":78}
{"en":"abbreviation","status":"pending"}
```

**ステータス**:
- `pending`: 未処理
- `in_progress`: 処理中
- `completed`: 完了
- `failed`: 失敗

---

## 🚀 使い方

### 進捗確認
```bash
# 全ステージの進捗を表示
python scripts/progress_manager.py show

# 特定ステージの詳細
python scripts/progress_manager.py show stage1
python scripts/progress_manager.py show stage3 fr
```

### 次回作業開始時
1. **MASTER_PLAN.md を読む**
2. 進捗確認: `python scripts/progress_manager.py show`
3. 該当ステージのTEMPLATEを使ってサブエージェント起動

### 新しい単語を追加する場合
1. **additional-nouns.md** に追加候補を記録
2. Stage 1から全ステージを再実行（同じTEMPLATEを使用）

---

## 🗑️ 削除したファイル（2025-02-05）

以下のファイルは重複・不要のため削除済み：

- `PROGRESS.md`, `RESTART_PLAN.md` → MASTER_PLAN.mdに統合
- `REORGANIZATION_SUMMARY.md`, `LAUNCH_GUIDE.md` → 古い計画
- `prompts/stage3-*.md`, `prompts/stage4-*.md` (16個) → TEMPLATEから再生成可能
- `workflow/old-*.md` → 古いファイル
- `workflow/README.md` → PROGRESS_SYSTEM.mdに統合

---

**原則**: 
- ★印のファイルが最も重要
- TEMPLATEファイルは将来の単語追加にも対応
- 進捗ファイルでセッション跨ぎ可能
