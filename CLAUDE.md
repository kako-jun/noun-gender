# Noun Gender Learning App - Project Navigation

## プロジェクト概要
名詞に性別のある言語（ドイツ語、フランス語、スペイン語など）の学習・検索用Webアプリケーション。
Next.js 15 (SSR + @opennextjs/cloudflare) + D1 + KV で実装された、4,592語の多言語翻訳・学習ツール。

## 📋 プロジェクト文書

- **[データパイプライン仕様（正本）](docs/data-pipeline.md)**: CSVスキーマ・二層言語モデル・コンテンツ規則・バッチ規律・D1同期手順
- **[システムアーキテクチャ](docs/architecture.md)**: 技術スタック・設計原則・パフォーマンス
- **[API仕様書](docs/api.md)**: エンドポイント・型定義・実装例
- **[UI設計仕様](docs/ui-spec.md)**: デザインシステム・コンポーネント・レスポンシブ

## 🏛️ アーキテクチャ概要

### 技術スタック
- **Frontend**: Next.js 15 (SSR) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Solarized Theme
- **API**: Next.js API Routes
- **Database**: Cloudflare D1 (SQLite互換・正規化スキーマ)
- **Cache**: Cloudflare Workers KV (TTL 1時間)
- **Deploy**: Cloudflare Workers (@opennextjs/cloudflare)

### データ概要
- **英語単語**: 4,592語（英語ピボット）
- **性別あり言語（8）**: fr, de, es, it, pt, ru, ar, hi — 訳語+文法性
- **表示専用言語（2）**: ja, zh — 意味翻訳のみ
- 詳細は [docs/data-pipeline.md](docs/data-pipeline.md)

## 🚀 開発ガイド

### 環境セットアップ
```bash
npm run dev    # 開発サーバー起動
npm test       # テスト実行
npm run build  # 本番ビルド
```

### 主要ディレクトリ
```
src/               # Next.js アプリ本体
data/              # CSVマスターデータ（単一の真実の源、全ファイルタブ区切り）
├── words.csv                  # 英語マスター（en, meaning_en, example_en）
├── translations_{lang}.csv    # 言語別翻訳（10言語）
├── example_translations.csv   # 例文翻訳（縦持ち）
└── memory_tricks_creation.csv # 記憶術作成ワークシート

scripts/           # 検証・D1同期スクリプト
├── validate.py      # 検証ゲート（コミット前に必ず実行）
├── sync_to_d1.py    # CSV→D1同期ロジック
├── d1_sync_all.sh   # 全削除→全挿入（日常使い）
├── d1_reset.sh      # スキーマ再作成→全挿入
└── d1_schema.sql    # D1スキーマ定義

docs/              # プロジェクト文書（data-pipeline.md が データ正本仕様）
```

### データ更新手順
```bash
# 1. CSVを編集したら必ず検証（PASS のみコミット可）
uv run python3 scripts/validate.py

# 2. D1に同期（全削除→全挿入）
./scripts/d1_sync_all.sh

# 事前確認のみ
uv run python3 scripts/sync_to_d1.py --dry-run
```

Python の実行は常に `uv run python3` を使う。

## デザインシステム

UIの生成・修正時は `DESIGN.md` に定義されたデザインシステムに従うこと。定義外の色・フォント・スペーシングを勝手に使わない。
