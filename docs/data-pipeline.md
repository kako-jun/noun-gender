# データパイプライン仕様（正本）

noun-gender の全データは `data/` のCSVが唯一の真実の源（Single Source of Truth）。
本書がスキーマ・言語モデル・作成規律・D1同期手順の正本である。

**注意: 全CSVは拡張子 .csv だがタブ区切り（TSV）である。**

## ファイルスキーマ

### data/words.csv — 英語マスター

| 列 | 内容 |
|---|---|
| en | 英単語（ピボットキー。全ファイル共通） |
| meaning_en | 英語の意味定義 |
| example_en | 英語の例文 |

- 4,592語 + ヘッダー1行
- `en` のアルファベット順（大文字小文字無視、英数字以外の記号は無視して比較）
- 英語がピボット＝すべての翻訳の原文

### data/translations_{lang}.csv — 言語別翻訳（10ファイル）

lang = fr, de, es, it, pt, ru, ar, hi, ja, zh

| 列 | 内容 |
|---|---|
| en | 英単語（words.csv と同一の行集合・同一順序） |
| translation | 対象言語での訳語（性別あり8言語のみ） |
| gender | 文法性（性別あり8言語のみ） |
| meaning_translation | meaning_en の翻訳（全10言語） |

### data/example_translations.csv — 例文翻訳（縦持ち）

| 列 | 内容 |
|---|---|
| en | 英単語 |
| lang | 言語コード（10言語） |
| example_translation | example_en の翻訳 |

- 全 (en × 10言語) の組がちょうど1行ずつ存在する（10 × 4,592 = 45,920行）。未翻訳は空欄

### data/memory_tricks_creation.csv — 記憶術作成ワークシート

列: `en, meaning_en, target_lang, translation, gender, ui_lang, trick_text_en, trick_text_translated, status`

`status=ready` の行だけが D1 の memory_tricks テーブルに同期される。

## 二層言語モデル

| 層 | 言語 | 持つデータ |
|---|---|---|
| 性別あり言語（8） | fr, de, es, it, pt, ru, ar, hi | translation + gender + meaning_translation |
| 表示専用言語（2） | ja, zh | meaning_translation のみ。**translation と gender は常に空** |

意味翻訳・例文翻訳は10言語すべて、訳語と文法性は8言語のみ。

### gender の値

- 全8言語: `m` / `f`
- de, ru のみ追加で: `n`（中性）、`pl`（複数形のみの名詞 = plurale tantum。例: de "Kosten", ru "ворота"）

## コンテンツ規則

1. **meaning_en は複数語義を `; ` で区切ってよい。ただし名詞の語義を必ず左端に置く**
2. **example_en と全言語の meaning_translation / example_translation は左端（名詞）の語義だけから作る**
3. 翻訳は英語からの忠実・直訳寄り。meaning_en のセミコロン構造は翻訳でも保持する
4. 循環定義の禁止: meaning_en に見出し語そのものを含めない
5. meaning_en は20文字以上

## パイプライン工程（順序）

1. スケルトン追加 — words.csv と全10 translations ファイルに en 行を挿入（順序維持）
2. meaning_en 生成
3. example_en 生成
4. meaning_translation 翻訳 ×10言語
5. translation + gender 付与 ×8言語
6. example_translation 翻訳 ×10言語

## バッチ規律

- **1工程あたり100語以下のバッチ**で進める（大量一括はやらない）
- **コミット前に必ず検証ゲートを通す**:
  ```bash
  uv run python3 scripts/validate.py
  ```
  exit 0（PASS）のみコミット可。FAILは構造破壊、WARNは品質・未充填の情報
- **列の全消去→再充填はしない**。修正はインプレースで行単位に移行する
- Python の実行は常に `uv run python3`

## D1 同期手順

1. `uv run python3 scripts/validate.py` が PASS であることを確認
2. 全削除→全挿入の同期を実行:
   ```bash
   ./scripts/d1_sync_all.sh
   ```
   （内部で `sync_to_d1.py` を呼ぶ。DB名 noun-gender-db、`wrangler d1 execute --remote --file` を500行ずつバッチ実行）
3. 事前確認だけしたい場合: `uv run python3 scripts/sync_to_d1.py --dry-run`
4. スキーマ変更時のみ `./scripts/d1_reset.sh`（scripts/d1_schema.sql を再適用）

### CSV → D1 テーブル対応

| CSV | D1テーブル |
|---|---|
| words.csv (en) | words_en |
| words.csv (example_en) | examples |
| translations_{8言語}.csv | words_{lang} |
| words.csv + 全10 meaning_translation | word_meanings（11言語列） |
| example_translations.csv | example_translations（キーは example_en 本文） |
| memory_tricks_creation.csv (status=ready) | memory_tricks |
