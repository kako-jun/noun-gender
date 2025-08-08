# Noun Gender - 名詞性別学習アプリ

名詞に性別のある言語（フランス語、ドイツ語、スペイン語など）の学習・検索用Webアプリケーション。
4,651語の多言語データベースで、効率的な語学学習をサポートします。

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3.4-003B57?logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)

## 🌟 主な機能

- **🔍 多言語検索**: 8言語対応のインクリメンタル検索
- **📚 A-Z辞書ブラウズ**: アルファベット索引による単語閲覧
- **🎯 性別クイズ**: インタラクティブな学習ゲーム
- **🎵 音声読み上げ**: Web Speech APIによるネイティブ発音
- **💡 暗記術**: 性別を覚えるためのヒント機能
- **🌙 テーマ切り替え**: Solarizedダーク/ライトモード
- **🌍 多言語UI**: 11言語対応のユーザーインターフェース

## 🗣️ 対応言語

```mermaid
graph LR
    EN[English] --> FR[Français]
    EN --> DE[Deutsch]
    EN --> ES[Español]
    EN --> IT[Italiano]
    EN --> PT[Português]
    EN --> RU[Русский]
    EN --> AR[العربية]
    EN --> HI[हिन्दी]
```

**翻訳データ**: 30,361件 | **意味定義**: 3,918語 (84%完了)

## 🏗️ アーキテクチャ

```mermaid
graph TB
    subgraph "Frontend"
        UI[Next.js 15 + TypeScript]
        COMP[shadcn/ui + Tailwind CSS]
        I18N[next-intl]
    end
    
    subgraph "Backend"
        API[App Router API]
        DB[SQLite Database]
        SEARCH[検索エンジン]
    end
    
    subgraph "データ"
        WORDS[4,651 英語単語]
        TRANS[8言語翻訳]
        MEANING[意味定義]
        TRICKS[暗記術]
    end
    
    UI --> API
    API --> DB
    DB --> WORDS
    DB --> TRANS
    DB --> MEANING
    DB --> TRICKS
```

## 🚀 クイックスタート

### 必要環境
- Node.js 18+
- npm または yarn

### インストール・起動

```bash
# リポジトリクローン
git clone <repository-url>
cd noun-gender

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザでアクセス
# http://localhost:3000
```

### ビルド・デプロイ

```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# 型チェック
npm run typecheck
```

## 📱 使用方法

### 基本操作

```mermaid
flowchart TD
    START([アプリ起動]) --> SEARCH[🔍 検索タブ]
    START --> BROWSE[📚 ブラウズタブ]
    START --> QUIZ[🎯 クイズタブ]
    
    SEARCH --> INPUT[単語入力]
    INPUT --> RESULTS[検索結果表示]
    RESULTS --> AUDIO[🎵 音声再生]
    RESULTS --> COPY[📋 コピー]
    RESULTS --> TRICK[💡 暗記術表示]
    
    BROWSE --> LETTER[A-Z文字選択]
    LETTER --> LIST[単語リスト表示]
    LIST --> INFINITE[無限スクロール]
    
    QUIZ --> GEN[問題生成]
    GEN --> ANSWER[回答選択]
    ANSWER --> FEEDBACK[正解・解説表示]
```

### キーボードショートカット

| キー | 機能 |
|-----|------|
| `/` | 検索フィールドにフォーカス |
| `Esc` | 検索クリア |
| `Enter` | 検索実行・回答送信 |

## 🗄️ データベース

正規化されたSQLiteデータベース構造：

```mermaid
erDiagram
    words_en ||--o{ word_meanings : has
    words_en ||--o{ words_fr : translates_to
    words_en ||--o{ words_de : translates_to
    words_en ||--o{ words_es : translates_to
    words_en ||--o{ memory_tricks : has
    examples ||--o{ example_translations : translates_to
    
    words_en {
        int id PK
        string en UK
    }
    
    word_meanings {
        int id PK
        string en FK
        string meaning_en
        string meaning_ja
        string meaning_zh
    }
    
    words_fr {
        int id PK
        string en FK
        string translation
        string gender
    }
```

## 📊 開発状況

現在の進捗状況（2025-08-08時点）:

- ✅ **基盤構築完了**: Next.js + SQLite + API
- ✅ **UI実装完了**: 検索・ブラウズ・クイズ機能
- ✅ **データベース正規化完了**: FK制約・自動インデックス
- 🔄 **意味定義補完中**: 84% (3,918/4,651語) 
- 🎯 **次期計画**: 例文機能拡充・品質改善

## 📄 ドキュメント

- **[プロジェクト概要](CLAUDE.md)**: 全体ナビゲーション
- **[API仕様書](docs/api.md)**: エンドポイント詳細
- **[システム設計](docs/architecture.md)**: 技術アーキテクチャ
- **[UI設計](docs/ui-spec.md)**: デザインシステム
- **[作業進捗](.claude/tasks.md)**: 開発ステータス

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. フォーク
2. フィーチャーブランチ作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエスト作成

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**作者**: kako-jun  
**開発**: Next.js 15 + TypeScript + SQLite  
**最終更新**: 2025-08-08