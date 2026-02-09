# プロジェクト概要

**作成日**: 2026-02-09  
**プロジェクト**: 名詞の性別学習アプリ - 多言語翻訳データベース

---

## 📂 プロジェクト構成

### データファイル
- `data/words.csv`: 英語マスター（4,592語）
- `data/meanings_first_only.txt`: 英語定義（翻訳元）
- `data/translations_*.csv`: 8言語翻訳ファイル（fr/de/es/it/pt/ru/ar/hi）

### ドキュメント
- `.claude/CURRENT-PROCEDURE.md`: **現在の実行手順**（必読）
- `.claude/csv-management.md`: CSVデータ管理
- `.claude/er-diagram.md`: データベース設計
- `.claude/DIRECTORY_STRUCTURE.md`: ディレクトリ構造

---

## 🎯 現在の状態

### 完了済み ✅
- 全4,592語の英単語収集
- 8言語の単語翻訳（translation列）
- 8言語の文法性別（gender列）
- 全CSVのアルファベット順ソート
- 英語定義のセミコロン前抽出（meanings_first_only.txt）

### 作業中 ⏳
- **8言語の意味定義翻訳（meaning_translation列）**
  - 現状: 全言語で列4が空
  - 作業: meanings_first_only.txt（4,592行）を各言語に翻訳中

### 未着手 📋
- 例文翻訳（example_translations.csv）の品質チェック
- 記憶術データ（memory_tricks）の生成
- Cloudflare D1への同期

---

## 🚀 次に何をすべきか

**今すぐ読むべきファイル**:
- `.claude/CURRENT-PROCEDURE.md`

このファイルに、現在進行中のタスクの**実行可能な手順**が書かれています。

**次回セッション開始時**:
1. CURRENT-PROCEDURE.mdを開く
2. Phase 1のテスト（100語）から開始
3. 成功したらPhase 2のバッチ処理へ

---

## 📋 過去の失敗から学んだこと

### ❌ 動かなかった方法
- 4,592行×8言語を一度にSubagentで翻訳（トークン/時間制約で失敗）
- 複雑なプロンプトテンプレート（エージェントが混乱）
- 20エージェント並列実行（管理不能）

### ✅ 動く方法
- **小規模バッチ（100-500行）**
- **1言語ずつ順次処理**
- **毎回検証・コミット**
- **シンプルなプロンプト**

---

## 📞 困ったときは

CURRENT-PROCEDURE.mdに戻り、Phase 1のテストから再開してください。

---

**最終更新**: 2026-02-09  
**最終コミット**: `f7dee03` - Sort CSVs and clear meaning_translation
