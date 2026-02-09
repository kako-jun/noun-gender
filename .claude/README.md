# プロジェクト概要

**作成日**: 2026-02-09  
**プロジェクト**: 名詞の性別学習アプリ - 多言語翻訳データベース

---

## 📂 プロジェクト構成

### データファイル
- `data/words.csv`: 英語マスター（4,592語）
- `data/meanings_first_only.txt`: 英語定義（セミコロン前のみ抽出版）
- `data/translations_*.csv`: 8言語翻訳ファイル（fr/de/es/it/pt/ru/ar/hi）

### 手順書（フェーズ別）
- `.claude/phase1-meaning-generation.md`: Phase 1手順（meaning_en生成）
- `.claude/phase2-example-generation.md`: Phase 2手順（example_en生成）
- `.claude/phase3-meaning-translation.md`: Phase 3手順（meaning_translation翻訳）

### 参考ドキュメント
- `.claude/csv-management.md`: CSVデータ管理
- `.claude/er-diagram.md`: データベース設計
- `.claude/DIRECTORY_STRUCTURE.md`: ディレクトリ構造

---

## 🎯 現在の状態

### Phase 1: 英語meaning_en生成 ✅
- **状態**: 完了（コミット`8125962`, 2026-02-05）
- **内容**: 全4,592語のmeaning_en生成
- **品質**: 最低20文字、名詞定義、循環参照なし
- **手順**: `.claude/phase1-meaning-generation.md`

### Phase 2: 英語example_en生成 ✅
- **状態**: 完了（コミット`caea427`, 2026-02-05）
- **内容**: 全4,592語のexample_en生成
- **品質**: 最低10単語、セミコロンルール遵守、名詞用法のみ
- **手順**: `.claude/phase2-example-generation.md`

### Phase 3: 多言語meaning_translation翻訳 ⏳
- **状態**: 準備完了（CSVソート済み、列クリア済み）
- **進捗**: 0 / 36,736行（8言語×4,592語）
- **手順**: `.claude/phase3-meaning-translation.md` ← **今ここ**

### Phase 4以降: 未着手 📋
- 例文翻訳の品質チェック
- 記憶術データ生成
- Cloudflare D1同期

---

## 🚀 次に何をすべきか

**次回セッション開始時**:
1. `.claude/phase3-meaning-translation.md`を開く
2. Phase 1のテスト（100語）から開始
3. 成功したらバッチ処理（500語×10バッチ×8言語）へ

---

## 📝 ファイル命名規則

### 手順書
- `phase{N}-{task-name}.md`: フェーズ別手順書
  - 例: `phase1-meaning-generation.md`
  - 例: `phase3-meaning-translation.md`

### スクリプト
- `scripts/apply_phase{N}_batch.py`: フェーズ別適用スクリプト
- `scripts/verify_phase{N}.py`: フェーズ別検証スクリプト

### 一時ファイル
- `/tmp/phase{N}_batch{M}.tsv`: バッチ処理の出力
  - 例: `/tmp/phase1_batch1.tsv`
  - 例: `/tmp/phase3_batch1_fr.tsv`

### データファイル
- `data/words.csv`: 英語マスター
- `data/translations_{lang}.csv`: 言語別翻訳
  - 例: `data/translations_fr.csv`

---

## 📋 過去の学び

### ❌ 動かなかった方法
- 4,592行×8言語を一度にSubagentで翻訳（トークン/時間制約）
- 複雑なプロンプトテンプレート（エージェントが混乱）
- 20エージェント並列実行（管理不能）

### ✅ 動く方法
- **小規模バッチ（100-500行）**
- **1言語ずつ順次処理**
- **毎回検証・コミット**
- **シンプルなプロンプト**

---

**最終更新**: 2026-02-09  
**最終コミット**: `f7dee03` - Sort CSVs and clear meaning_translation
