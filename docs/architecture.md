# Noun Gender Learning App - アーキテクチャ設計書

## システム概要

名詞の性別がある言語（ドイツ語、フランス語、スペイン語等）の学習・検索用Webアプリケーション。
モダンなフルスタック構成で実装し、高品質なデータと直感的なユーザー体験を提供します。

## 技術スタック

### フロントエンド
- **Framework**: Next.js 15 (SSR + @opennextjs/cloudflare)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Internationalization**: 静的JSONファイル (11言語対応)
- **Theme**: next-themes (ダーク/ライト切り替え)
- **State Management**: React Context

### バックエンド
- **API**: Next.js API Routes
- **Database**: Cloudflare D1 (SQLite互換)
- **Cache**: Cloudflare Workers KV (TTL 1時間)
- **ORM**: Native SQL (型安全ヘルパー付き)

### デプロイメント
- **全体**: Cloudflare Workers (@opennextjs/cloudflare)
- **Database**: Cloudflare D1
- **Cache**: Cloudflare Workers KV
- **CI/CD**: `npm run deploy` (手動デプロイ)
- **Domain**: noun-gender.llll-ll.com

## データベース設計

### 正規化スキーマ (2025-08-08)

```sql
-- 英語単語マスター
CREATE TABLE words_en (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT UNIQUE NOT NULL
);

-- 多言語意味定義
CREATE TABLE word_meanings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT UNIQUE NOT NULL,
  meaning_en TEXT,
  meaning_ja TEXT,
  meaning_zh TEXT,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE
);

-- 英語例文
CREATE TABLE examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT NOT NULL UNIQUE,
  example_en TEXT NOT NULL
);

-- 例文翻訳
CREATE TABLE example_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  example_en TEXT NOT NULL,
  lang TEXT NOT NULL,
  translation TEXT NOT NULL,
  UNIQUE(example_en, lang),
  FOREIGN KEY (example_en) REFERENCES examples(example_en) ON DELETE CASCADE
);

-- 暗記術
CREATE TABLE memory_tricks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT NOT NULL,
  translation_lang TEXT NOT NULL,
  ui_lang TEXT NOT NULL,
  trick_text TEXT NOT NULL,
  UNIQUE(en, translation_lang, ui_lang),
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE
);

-- 各言語翻訳テーブル (8言語)
CREATE TABLE words_[LANG] (
  id INTEGER PRIMARY KEY,
  en TEXT,
  translation TEXT,
  gender TEXT,
  verified_at NUMERIC,
  confidence_score INTEGER,
  FOREIGN KEY (en) REFERENCES words_en(en) ON DELETE CASCADE
);
```

### ビュー設計

```sql
-- 全言語統合ビュー
CREATE VIEW v_all_translations AS
SELECT we.en, wm.meaning_en, wm.meaning_ja, wm.meaning_zh,
       'fr' as lang, fr.translation, fr.gender, fr.verified_at, fr.confidence_score
FROM words_en we
LEFT JOIN word_meanings wm ON we.en = wm.en
LEFT JOIN words_fr fr ON we.en = fr.en
WHERE fr.translation IS NOT NULL
UNION ALL
-- 他の言語も同様...

-- 動的検索インデックス (自動メンテナンス)
CREATE VIEW v_multilingual_search AS
SELECT ROW_NUMBER() OVER (ORDER BY en, lang) as id,
       LOWER(translation) as search_term,
       en, lang, translation, 'exact' as match_type,
       CURRENT_TIMESTAMP as created_at
FROM v_all_translations
UNION ALL
SELECT ROW_NUMBER() OVER (ORDER BY en) + 100000 as id,
       LOWER(en) as search_term,
       en, 'en' as lang, en as translation, 'english' as match_type,
       CURRENT_TIMESTAMP as created_at
FROM words_en;
```

## API設計

### RESTful エンドポイント

| エンドポイント | メソッド | 機能 |
|---------------|---------|------|
| `/api/search` | GET | 多言語検索 |
| `/api/browse` | GET | A-Z辞書ブラウズ |
| `/api/quiz` | GET | クイズ問題生成 |
| `/api/stats` | GET | データベース統計 |
| `/api/memory-tricks` | GET | 暗記術取得 |

### 検索アルゴリズム

**優先順位付けロジック:**
1. 完全一致 (English/Translation)
2. 短単語の部分一致 (≤4文字)
3. 前方一致 (Prefix)
4. その他の部分一致
5. 単語長 (短い方が優先)

## UI/UXアーキテクチャ

### デザインシステム

**テーマ設計:**
- **Color Palette**: Solarized (ダーク/ライト対応)
- **Typography**: システムフォント + 多言語対応
- **Spacing**: Tailwindの8px基準システム
- **Breakpoints**: モバイルファースト (sm:640px, md:768px, lg:1024px)

**コンポーネント設計:**
```typescript
// 統一ボタンコンポーネント
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline'
  size: 'sm' | 'md' | 'lg'
  theme: 'light' | 'dark'
}

// 検索結果カード
interface SearchResultCard {
  word: Word
  translations: Translation[]
  example?: ExampleSentence
}
```

### ページ構成

```
/                    # ホーム (検索/ブラウズ/クイズ統合)
├── ?tab=search     # 検索タブ
├── ?tab=browse     # A-Z辞書ブラウズ
└── ?tab=quiz       # クイズタブ

/quiz               # 専用クイズページ
```

### 状態管理戦略

**URL State Management:**
```typescript
// URLパラメータによる状態管理
const searchParams = {
  tab: 'search' | 'browse' | 'quiz',
  q: string,              // 検索クエリ
  languages: string[],    // 選択言語
  letter: string,         // A-Z辞書の文字フィルタ
  limit: number          // 結果件数制限
}
```

**LocalStorage:**
```typescript
// ユーザー設定の永続化
interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  uiLanguage: string
  favorites: string[]
  recentSearches: string[]
}
```

## 国際化戦略

### 対応言語 (11言語)

| Code | Language | Native Name |
|------|----------|-------------|
| ja | Japanese | 日本語 |
| en | English | English |
| ar | Arabic | العربية |
| fr | French | Français |
| de | German | Deutsch |
| hi | Hindi | हिन्दी |
| it | Italian | Italiano |
| pt | Portuguese | Português |
| ru | Russian | Русский |
| es | Spanish | Español |
| zh | Chinese | 中文 |

### i18n実装

```typescript
// next-intl設定
import { useTranslations } from 'next-intl'

export default function SearchView() {
  const t = useTranslations('search')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <input placeholder={t('placeholder')} />
      <button>{t('searchButton')}</button>
    </div>
  )
}
```

## パフォーマンス最適化

### データベース最適化
- **戦略的インデックス**: `en`, `lang`, `gender`カラム + COLLATE NOCASE
- **外部キー制約**: 完全なデータ整合性保証
- **クエリ最適化**: JOINの効率化とN+1問題回避
- **バッチクエリ**: `db.batch()`による並列実行

### KVキャッシュ
- **対象**: browseWords API（ページネーション結果）
- **TTL**: 1時間
- **キー形式**: `browse:{limit}:{offset}:{language}:{startsWith}`
- **効果**: レスポンス時間 ~7秒 → ~0.5秒

### フロントエンド最適化
- **Code Splitting**: 動的インポートによる遅延ローディング
- **Image Optimization**: Next.js標準の画像最適化
- **Bundle Analysis**: webpack-bundle-analyzerによる分析

### レスポンシブ設計

```typescript
// Tailwind CSSレスポンシブ例
<div className="
  w-full px-4 py-2          // モバイル基準
  sm:px-6 sm:py-3          // タブレット (640px+)
  md:px-8 md:py-4          // デスクトップ (768px+)
  lg:max-w-4xl lg:mx-auto  // 大画面 (1024px+)
">
  <div className="
    grid grid-cols-1        // モバイル: 1列
    md:grid-cols-2          // デスクトップ: 2列
    lg:grid-cols-3          // 大画面: 3列
    gap-4
  ">
```

## セキュリティ設計

### データベースセキュリティ
- **SQLインジェクション対策**: パラメータ化クエリ徹底 (D1 Prepared Statements)
- **外部キー制約**: データ整合性保証
- **エッジ実行**: Cloudflare D1によるセキュアなデータアクセス

### Webアプリケーションセキュリティ
- **XSS対策**: React標準のエスケープ処理
- **CSRF対策**: Next.js標準のCSRFプロテクション
- **Content Security Policy**: 適切なCSPヘッダー設定
- **HTTPS強制**: 本番環境での暗号化通信

## 運用・監視

### CI/CD パイプライン

Cloudflare Pages のGitHub連携による自動デプロイ:

1. **mainブランチへのpush** → 自動ビルド・デプロイ
2. **プレビューデプロイ**: PRごとにプレビューURL生成
3. **ロールバック**: Cloudflare Dashboardから即座に可能

### 監視・分析
- **Performance Monitoring**: Cloudflare Analytics + Core Web Vitals
- **Error Tracking**: Cloudflare Workers Logs
- **Usage Analytics**: Cloudflare Web Analytics (プライバシー配慮)
- **Database Monitoring**: D1 Analytics

## 拡張性設計

### 機能拡張ポイント
1. **新言語追加**: テーブル追加のみで対応可能
2. **機能追加**: API駆動設計によるスケーラビリティ
3. **データ拡張**: 正規化スキーマによる柔軟性
4. **UI拡張**: コンポーネントベース設計

### スケーラビリティ対応
- **水平スケーリング**: ステートレス設計
- **キャッシュ戦略**: Cloudflare Workers KV導入済み
- **CDN対応**: Cloudflare Assetsによる静的アセット配信
- **API Rate Limiting**: 将来的な制限実装準備

---

## 設計原則

1. **Single Responsibility**: 各コンポーネントは単一責任
2. **DRY (Don't Repeat Yourself)**: コード重複排除
3. **KISS (Keep It Simple, Stupid)**: シンプルな設計
4. **Progressive Enhancement**: 段階的機能向上
5. **Mobile First**: モバイル優先設計
6. **Accessibility**: アクセシビリティ配慮