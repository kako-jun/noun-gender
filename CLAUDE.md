# Noun Gender Learning App - Project Navigation

## プロジェクト概要
名詞に性別のある言語（ドイツ語、フランス語、スペイン語など）の学習・検索用Webアプリケーション。
Next.js 15 (静的エクスポート) + Hono (Cloudflare Workers) + D1 で実装された、4,651語の多言語翻訳・学習ツール。

## 現在の状況（2025-12-08）
✅ **実装完了**: 基本機能・UI・データベース正規化・API完備
🔄 **作業中**: Cloudflare移行・D1データベース設定
🎯 **次期計画**: 本番デプロイ・パフォーマンス最適化

## 📋 プロジェクト文書

### 📊 プロジェクト管理
- **[作業進捗・タスク管理](.claude/tasks.md)**: 現在の作業状況・Phase別進捗・次ステップ
- **[データベース設計](.claude/er-diagram.md)**: 正規化スキーマ・ER図・テーブル構造
- **[CSV管理システム手順書](.claude/csv-management.md)**: 3つのCSVファイルによるデータ管理・更新手順

### 🏗️ 技術仕様
- **[システムアーキテクチャ](docs/architecture.md)**: 技術スタック・設計原則・パフォーマンス
- **[API仕様書](docs/api.md)**: 9エンドポイント・型定義・実装例
- **[UI設計仕様](docs/ui-spec.md)**: デザインシステム・コンポーネント・レスポンシブ

## 🎯 機能要件分類

### ✅ 実装済み機能
1. **検索機能**: インクリメンタル検索・多言語対応・あいまい検索
2. **閲覧機能**: A-Z索引・言語別フィルタリング・無限スクロール
3. **クイズ機能**: 8言語対応・性別当てゲーム・正解率表示
4. **UI/UX**: Solarizedテーマ・ダーク/ライトモード・レスポンシブ
5. **音声機能**: Web Speech API・多言語読み上げ
6. **学習支援**: 記憶術・暗記ヒント・例文表示
7. **設定管理**: UI言語11言語対応・LocalStorage保存
8. **API**: 9エンドポイント・完全仕様書・型安全

### 🔄 実装予定機能
1. **例文拡充**: 主要単語500-1000語に英語例文・各言語翻訳追加
2. **お気に入り**: ユーザー登録単語・検索履歴機能
3. **データ品質**: 残り733語の意味定義・翻訳精度改善
4. **パフォーマンス**: Core Web Vitals最適化・SEO対応

### 🚫 実装しない機能
1. **ユーザー認証**: LocalStorageで十分・複雑性回避
2. **ソーシャル機能**: シンプル学習ツールに集中
3. **課金システム**: 無料アプリとして提供
4. **複雑な統計**: 基本的な正解率表示のみ

## 🏛️ アーキテクチャ概要

### 技術スタック（実装済み）
- **Frontend**: Next.js 15 (Static Export) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Solarized Theme
- **API**: Hono (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite互換・正規化スキーマ)
- **Deploy**: Cloudflare Pages + Workers (GitHub連携自動デプロイ)

### データ概要
- **英語単語**: 4,651語
- **翻訳データ**: 30,361件 (8言語対応)
- **意味定義**: 3,918語 (84.2%完了)
- **検索インデックス**: 35,012件 (自動更新)

## 🚀 開発ガイド

### 環境セットアップ
```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# 本番ビルド  
npm run build
```

### 主要ディレクトリ
```
src/
├── app/           # Next.js App Router (静的エクスポート)
├── components/    # React コンポーネント
├── lib/           # ユーティリティ (api.ts等)
├── i18n/          # 多言語翻訳ファイル (ソース)
└── types/         # TypeScript 型定義

api/
├── src/
│   ├── index.ts   # Hono APIエントリーポイント
│   ├── db.ts      # D1データベースクエリ
│   └── types.ts   # API型定義
├── wrangler.toml  # Cloudflare Workers設定
└── package.json   # API依存関係

public/
└── messages/      # i18n静的JSONファイル

data/
└── noun_gender.db # SQLite データベース (D1マイグレーション用)

docs/              # プロジェクト文書
.claude/           # 開発文書・進捗管理
```

## 📧 連絡・質問

プロジェクトに関する質問・提案は [作業進捗管理](.claude/tasks.md) の「次回作業時の確認事項」を参照。

---

**最終更新**: 2025-12-08 - Cloudflare Pages + Workers アーキテクチャに移行