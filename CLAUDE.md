# Noun Gender Learning App

## プロジェクト概要
名詞に性別のある言語（ドイツ語、フランス語、スペイン語など）の学習・検索用Webアプリケーション。

## 背景・課題
- 名詞の性別を覚えるのが困難
- 同じ単語でも言語によって男性・女性・中性が異なる
- 効率的な学習・検索ツールが必要

## 現状
- Vue 2で作られた旧版が存在
- 最新技術でのリメイクを計画

## 目標
- 旧版を最新技術でリメイク
- 学習・検索機能を提供
- 使いやすいWebアプリケーションの構築

## 旧版システム分析

### サーバー側（/home/kako-jun/repos/gender_nouns_server）
- **技術スタック**: Node.js + Express + SQLite3
- **API仕様**: 
  - エンドポイント: `/api/translate`
  - 検索方式: 完全一致（exact）/ 部分一致（partial）
  - 対応言語: アラビア語、フランス語、ドイツ語、ヒンディー語、イタリア語、ポルトガル語、ロシア語、スペイン語
  - 英語から他言語への翻訳と性別情報を返す
- **Docker対応**: Dockerfile、docker-compose.yml完備

### フロントエンド側（/home/kako-jun/repos/gender_nouns_gui）
- **技術スタック**: Vue 2 + Buefy + Sass + Axios
- **主要機能**:
  - 検索機能（Search）: キーワード検索、言語選択、一致方式選択
  - 全テーブル閲覧（All Tables）: A-Z索引による全単語表示
  - About ページ
- **レスポンシブ対応**: モバイル・タブレット対応

### データベース構造

#### 現行構造（旧版）
- **形式**: SQLite
- **構成**: 言語別テーブル（translation_ar, translation_fr, translation_de, etc.）
- **フィールド**: 
  - `en`: 英語の単語
  - `translated_1-3`: 翻訳語（最大3つ）
  - `gender_1-3`: 性別（m/f/n）
  - `search_keyword`: 検索用キーワード
- **ビュー**: `view_translation`で全言語を統合
- **データ数**: 4,541語

#### 拡張データ構造（事前計算版）
```sql
-- 基本単語テーブル（事前に全データ格納）
CREATE TABLE words (
  id INTEGER PRIMARY KEY,
  word_en TEXT UNIQUE,        -- cat
  search_terms TEXT,          -- 検索用語（正規化済み、JSON配列）
  frequency_score INTEGER,    -- 使用頻度（1-10000、事前計算済み）
  category TEXT,              -- 意味カテゴリ（animal, object等、事前分類）
  example_en TEXT            -- 英語例文（事前生成）
);

-- 翻訳テーブル（全組み合わせ事前計算）
CREATE TABLE translations (
  id INTEGER PRIMARY KEY,
  word_id INTEGER REFERENCES words(id),
  language TEXT,             -- fr, de, es等
  translation TEXT,          -- chat, Katze, gato
  gender TEXT,              -- m, f, n
  frequency_in_lang INTEGER, -- その言語での頻度（事前計算）
  example_native TEXT,      -- ネイティブ例文（事前生成）
  pronunciation TEXT,       -- 発音記号（事前付与）
  usage_context TEXT,       -- 文脈別使い分け解説
  gender_reason TEXT        -- 性別決定の歴史的・語学的理由
);

-- 検索インデックス（全パターン事前計算）
CREATE TABLE search_index (
  id INTEGER PRIMARY KEY,
  search_term TEXT,         -- 正規化済み検索語
  word_id INTEGER REFERENCES words(id),
  match_type TEXT,          -- exact, prefix, fuzzy
  score INTEGER             -- 検索スコア（事前計算）
);

-- クイズデータ（事前生成）
CREATE TABLE quiz_questions (
  id INTEGER PRIMARY KEY,
  word_id INTEGER REFERENCES words(id),
  language TEXT,
  correct_gender TEXT,
  wrong_options TEXT,       -- JSON配列
  difficulty TEXT,          -- easy, medium, hard（事前分類）
  explanation TEXT          -- 解説（事前生成）
);
```

#### 事前計算データ生成
1. **使用頻度**: 言語コーパスベースで1-10000スコア
2. **例文**: 各単語に適切な例文を事前生成
3. **検索インデックス**: 全検索パターンを事前構築
4. **クイズ**: 全問題を事前生成・難易度分類
5. **発音**: IPA発音記号を事前付与
6. **文脈解説**: 使い分け方・ニュアンスの違いを説明
7. **性別理由**: 語源・歴史・語学的根拠を解説

**例: "chat"（猫）の拡張データ**
```json
{
  "word_en": "cat",
  "translations": {
    "fr": {
      "translation": "chat",
      "gender": "m",
      "example": "Le chat dort sur le canapé.",
      "usage_context": "一般的な猫。雌猫は'chatte'だが、種全体を指すときは男性形'chat'を使用。",
      "gender_reason": "ラテン語'cattus'（男性名詞）から派生。動物名詞は多くが男性形で総称を表す。"
    },
    "de": {
      "translation": "Katze",
      "gender": "f",
      "example": "Die Katze schläft auf dem Sofa.",
      "usage_context": "一般的な猫。雄猫は'Kater'で区別。家庭的・親しみやすいニュアンス。",
      "gender_reason": "古高ドイツ語'kazza'（女性名詞）が起源。小動物には女性形が多い傾向。"
    }
  }
}
```

## 技術スタック（検討中）

### 従来の分離型アーキテクチャ
- フロントエンド: Vue 3 + TypeScript + Vite
- UI: Tailwind CSS または Vuetify
- バックエンド: Express + TypeScript または FastAPI
- データベース: 既存SQLiteファイルを活用

### モダン統合アーキテクチャ（推奨）
現在の技術なら、フロント・バックエンドを単一リポジトリで統合可能：

#### 選択肢1: Next.js (React)
- **技術**: Next.js 15 + TypeScript + Tailwind CSS
- **API**: App Router + Route Handlers
- **データ**: SQLite + Prisma または better-sqlite3
- **デプロイ**: Vercel / Netlify / Docker

#### 選択肢2: Nuxt.js (Vue)
- **技術**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **API**: Nitro Server API
- **データ**: SQLite + Drizzle ORM
- **デプロイ**: Nuxt Cloud / Vercel / Docker

#### 選択肢3: SvelteKit
- **技術**: SvelteKit + TypeScript + Tailwind CSS
- **API**: Server-side API routes
- **データ**: SQLite + Drizzle ORM
- **デプロイ**: Vercel / Netlify / Docker

#### 選択肢4: Astro (高速・軽量)
- **技術**: Astro + Vue/React components + TypeScript
- **データ**: ビルド時にSQLite→JSON変換でクライアント検索
- **デプロイ**: 静的サイトとして超高速配信

### 推奨構成: Next.js + SQLite SSR

**Next.js** を選択する理由：
- React生態系の豊富さ
- SQLiteとの完璧なSSR対応
- App Routerでモダンな開発体験
- Vercel等での簡単デプロイ

#### SQLite SSRの実装
```typescript
// app/api/search/route.ts - API Routes
import Database from 'better-sqlite3'

export async function GET(request: Request) {
  const db = new Database('assets/translation.db', { readonly: true })
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  const stmt = db.prepare(`
    SELECT * FROM view_translation 
    WHERE en LIKE ? OR fr_search_keyword LIKE ?
  `)
  const results = stmt.all(`%${query}%`, `%${query}%`)
  
  return Response.json(results)
}

// app/search/page.tsx - SSR Page
import { searchWords } from '@/lib/database'

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string }
}) {
  const results = searchParams.q 
    ? await searchWords(searchParams.q)
    : []

  return (
    <div>
      <SearchForm />
      <SearchResults results={results} />
    </div>
  )
}
```

#### 技術構成詳細
- **フレームワーク**: Next.js 15 + App Router
- **言語**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **国際化**: next-intl (多言語UI対応)
- **テーマ**: ダーク/ライトモード対応
- **レスポンシブ**: モバイルファースト設計
- **画面遷移**: URLルーティング + SPA的UX
- **データベース**: better-sqlite3 + 型安全ヘルパー
- **状態管理**: Zustand
- **デプロイ**: GCE + Docker + GitHub Actions

#### UI要件・設計方針
1. **Bulma風ポップなデザイン**
   - **Mantine**: Bulmaに最も近いReactライブラリ
   - カラフルで丸みのあるコンポーネント
   - ボタン、カード、タブなどBulma的見た目

2. **ダーク/ライトテーマ**
   - next-themes でシステム連動
   - 手動切り替えボタン
   - CSS変数でテーマ管理

3. **URLルーティング + SPA的UX**
   ```typescript
   // Next.js App Routerでの実装例
   // app/page.tsx - メインページ（全機能統合）
   'use client'
   
   import { useSearchParams, useRouter } from 'next/navigation'
   import { useEffect, useState } from 'react'
   
   export default function HomePage() {
     const searchParams = useSearchParams()
     const router = useRouter()
     
     // URLから状態を復元
     const currentTab = searchParams.get('tab') || 'search'
     const query = searchParams.get('q') || ''
     const language = searchParams.get('lang') || 'all'
     const alphabet = searchParams.get('alpha') || ''
   
     const updateURL = (params: Record<string, string>) => {
       const newParams = new URLSearchParams(searchParams)
       Object.entries(params).forEach(([key, value]) => {
         if (value) newParams.set(key, value)
         else newParams.delete(key)
       })
       router.replace(`/?${newParams.toString()}`, { scroll: false })
     }
   
     return (
       <div>
         <TabNavigation 
           activeTab={currentTab} 
           onTabChange={(tab) => updateURL({ tab })} 
         />
         {currentTab === 'search' && 
           <SearchView 
             initialQuery={query}
             onSearch={(q) => updateURL({ tab: 'search', q })}
           />
         }
         {currentTab === 'browse' && 
           <BrowseView 
             language={language}
             alphabet={alphabet}
             onFilter={(lang, alpha) => updateURL({ tab: 'browse', lang, alpha })}
           />
         }
       </div>
     )
   }
   ```

   **URL例:**
   - `/` - ホーム
   - `/?tab=search&q=cat` - "cat"検索結果
   - `/?tab=browse&lang=fr&alpha=a` - フランス語A単語一覧
   - `/?tab=search&q=dog&exact=true&fr=true&de=true` - 詳細検索

4. **多言語UI対応（i18n）**
   ```typescript
   // next-intlでの実装例
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
   
   **対応言語:**
   - 🇯🇵 日本語 (ja)
   - 🇺🇸 English (en) 
   - 🇸🇦 العربية (ar) - アラビア語
   - 🇫🇷 Français (fr) - フランス語  
   - 🇩🇪 Deutsch (de) - ドイツ語
   - 🇮🇳 हिन्दी (hi) - ヒンディー語
   - 🇮🇹 Italiano (it) - イタリア語
   - 🇵🇹 Português (pt) - ポルトガル語
   - 🇷🇺 Русский (ru) - ロシア語
   - 🇪🇸 Español (es) - スペイン語
   - 🇨🇳 中文 (zh) - 中国語

5. **モバイルファースト設計**
   ```typescript
   // Tailwind CSSでのレスポンシブ例
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
   
   **ブレークポイント戦略:**
   - **モバイル** (< 640px): 単列レイアウト、大きなタッチターゲット
   - **タブレット** (640px+): 2列グリッド、中間サイズ
   - **デスクトップ** (768px+): 3列グリッド、サイドバー追加
   - **大画面** (1024px+): 最大幅制限、中央寄せ

6. **ローカルストレージ設定保存**
   ```typescript
   // 設定の永続化
   const useSettings = () => {
     const [theme, setTheme] = useLocalStorage('theme', 'system')
     const [language, setLanguage] = useLocalStorage('ui-language', 'en')
     const [favorites, setFavorites] = useLocalStorage('favorites', [])
     
     return { theme, setTheme, language, setLanguage, favorites, setFavorites }
   }
   ```

7. **API エンドポイント（開発者向け）**
   ```typescript
   // app/api/translate/route.ts
   GET /api/translate?q=cat&languages=fr,de,es&exact=true
   
   // app/api/random/route.ts  
   GET /api/random?languages=fr&count=10
   
   // app/api/browse/route.ts
   GET /api/browse?language=fr&startsWith=a&limit=50
   ```

8. **UX向上機能**
   - **インクリメンタル検索**: 入力中にリアルタイム検索
   - **音声読み上げ**: Web Speech API でネイティブ発音
   - **クリップボードコピー**: 単語・翻訳・全情報のワンクリックコピー
   - **キーボードショートカット**: `/` で検索、`Esc` でクリア

#### UI技術選定
- **Tailwind CSS**: 長期安泰、圧倒的シェア、フレームワーク非依存
- **shadcn/ui**: Tailwind + Radix UI、モダンスタンダード、コピペ可能
- **Bulma風デザイン**: Tailwindで再現（角丸、カラフル、グラデーション）

## 機能要件（簡素化版）

### コア機能
1. **検索機能**
   - インクリメンタル検索（表記ゆらぎ対応）
   - あいまい検索（typo耐性、ひらがな・カタカナ・漢字統一）
   - 言語選択（複数選択可）
   - 検索結果表示（単語・翻訳・性別・例文・文脈・理由）

2. **閲覧機能**
   - A-Z索引による全単語表示
   - 言語別フィルタリング

3. **シンプルクイズ**
   - 名詞の性別当てゲーム（der/die/das等）
   - 正解率表示（LocalStorageのみ）

### 基本UX機能
4. **音声・コピー**
   - ネイティブ発音読み上げ（Web Speech API + 発音記号表示）
   - 単語・翻訳・全情報のクリップボードコピー
   - キーボードショートカット（`/`で検索、`Esc`でクリア）

5. **設定**
   - ダーク/ライトテーマ（LocalStorage保存）
   - UI言語設定（11言語対応）
   - お気に入り単語（LocalStorage保存）

### 開発者向けAPI
6. **APIエンドポイント（シンプル版）**
   ```typescript
   // 単語検索（表記ゆらぎ対応済み）
   GET /api/search?q=cat&languages=fr,de&limit=20
   
   // A-Z辞書ブラウジング
   GET /api/browse?language=fr&letter=a&page=1
   
   // クイズ用ランダム取得
   GET /api/quiz?languages=de&count=10
   
   // 統計情報
   GET /api/stats
   ```

## 人気獲得戦略（アイデア）

### 差別化ポイント（簡素化版）
1. **シンプルクイズ**
   - 名詞性別当てゲーム
   - 正解率のみ表示（永続化なし）

2. **高品質データ**
   - 使用頻度による重要度表示
   - 適切な例文（事前生成）
   - 文脈別使い分け解説
   - 性別決定理由の説明
   - 表記ゆらぎ完全対応（猫・ねこ・ネコ統一検索）
   - ネイティブ発音（合成音声 + IPA発音記号）

3. **実用的機能**
   - 高速検索（事前インデックス + 表記ゆらぎ対応）
   - ネイティブ音声読み上げ（多言語対応）
   - キーボードショートカット
   - クリップボード機能
   - 開発者向けAPI

### マーケティング戦略
- **SEO対策**: 「ドイツ語 名詞 性別」等のキーワード最適化
- **YouTube**: 語学学習チャンネルとのコラボ
- **Reddit**: r/languagelearning での宣伝
- **Duolingo連携**: 補完ツールとしてのポジショニング

## デプロイ・インフラ設計

### ドメイン・ホスティング
- **メインサイト**: noun-gender.llll-ll.com
- **親サイト**: llll-ll.com（紹介・リンク元）
- **ホーム リンク**: フッター左端にホームアイコン → llll-ll.com
- **インフラ**: Google Cloud Engine (GCE)
- **CI/CD**: GitHub Actions（push → 自動デプロイ）

### データベース検討
**SQLite継続 vs PostgreSQL移行:**

#### SQLite継続の場合
- ✅ **既存データ活用**: 4,541語をそのまま移行
- ✅ **シンプル**: ファイルベース、バックアップ簡単
- ✅ **高速**: 読み取り専用なら十分高速
- ❌ **スケーラビリティ**: 将来的な制限

#### PostgreSQL移行の場合  
- ✅ **スケーラビリティ**: 大規模データ対応
- ✅ **全文検索**: 表記ゆらぎ検索が高性能
- ✅ **JSON対応**: 検索インデックス等に便利
- ❌ **インフラ複雑化**: GCE上でDB管理必要

**推奨**: **SQLite継続**
- 読み取り専用の辞書なら十分
- 事前計算データで高速化
- シンプルな運用

### データ移行計画
```sql
-- 既存テーブルに新カラム追加
ALTER TABLE translation_fr ADD COLUMN usage_context TEXT;
ALTER TABLE translation_fr ADD COLUMN gender_reason TEXT;
ALTER TABLE translation_fr ADD COLUMN pronunciation TEXT;
ALTER TABLE translation_fr ADD COLUMN frequency_score INTEGER;

-- 新テーブル追加
CREATE TABLE search_index (...);
CREATE TABLE quiz_questions (...);
```

## 実装戦略

### 段階的移行計画

**Phase 1: 基盤構築 (進行中)**
1. ✅ 設計完了・段取り作成
2. ⏳ Next.js + TypeScript + Tailwind CSS セットアップ
3. ⏳ 依存パッケージインストール (better-sqlite3, shadcn/ui等)
4. ⏳ 設定ファイル構成 (tailwind.config, next.config等)
5. ⏳ 既存SQLiteファイルをコピー・データ読み取りテスト
6. ⏳ 基本検索API実装 (/api/search)
7. ⏳ シンプル検索UI実装 (検索ボックス、結果表示)
8. ⏳ 基本機能テスト・動作確認

**Phase 2: データ拡張**  
- 4,541語に高品質データ追加（LLMフル活用）
  - 使用頻度スコア（言語コーパス分析）
  - 適切な例文（各言語ネイティブレベル）
  - 文脈別使い分け解説
  - 性別決定の語源・歴史的理由
  - IPA発音記号
- 表記ゆらぎ検索インデックス構築

**Phase 3: 高度機能**
- 音声読み上げ・クリップボード機能
- クイズ機能・ダークテーマ
- 多言語UI（11言語）
- API公開

### LLM実力発揮ポイント
- **語学専門知識**: 各言語の文法・語源・歴史
- **文化的コンテキスト**: ネイティブレベルの使い分け
- **言語学的分析**: 性別決定パターンの解明
- **品質管理**: 一貫性のあるデータ生成

### 詳細段取り

**Phase 1: 基盤構築**
```bash
# 1. プロジェクトセットアップ
npx create-next-app@latest noun-gender --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd noun-gender

# 2. 依存パッケージインストール
npm install better-sqlite3 @types/better-sqlite3
npm install lucide-react class-variance-authority clsx tailwind-merge
npx shadcn-ui@latest init

# 3. ディレクトリ構成
mkdir -p src/lib src/components src/types data
cp /path/to/old/translation.db ./data/

# 4. 設定ファイル
# - next.config.js: SQLiteファイル処理設定
# - src/lib/database.ts: DB接続・クエリヘルパー
# - src/types/index.ts: TypeScript型定義

# 5. 基本API実装
# - src/app/api/search/route.ts
# - クエリパラメータ: q, languages, limit

# 6. 基本UI実装
# - src/app/page.tsx: メインページ
# - src/components/SearchBox.tsx: 検索入力
# - src/components/SearchResults.tsx: 結果表示
# - src/components/LanguageSelector.tsx: 言語選択

# 7. テスト・動作確認
npm run dev
# テストケース: "cat", "dog", "house" 等で検索確認
```

**Phase 2: データ拡張**
```bash
# 1. データベース拡張
# - 新カラム追加 (usage_context, gender_reason, etc.)
# - 4,541語データ生成スクリプト作成

# 2. 高品質データ生成
# - LLMで例文・解説・理由生成
# - 言語別頻度スコア算出
# - IPA発音記号付与

# 3. 検索インデックス構築
# - 表記ゆらぎパターン生成
# - あいまい検索対応
```

**Phase 3: 高度機能**
```bash
# 1. UI改善
# - ダークテーマ実装
# - 音声読み上げ機能
# - クリップボードコピー

# 2. 多言語UI
# - next-intl設定
# - 11言語翻訳ファイル作成

# 3. API公開・最適化
```

### 進捗記録
- 2025-06-29 17:00: Phase 1 開始、詳細段取り作成完了
- 2025-06-29 18:10: ✅ **Phase 1 完全完了！** 基盤構築・基本検索機能実装
- 2025-06-29 18:10: 🚀 **Phase 2 開始！** LLM実力発揮でデータ品質向上へ
- 2025-06-29 18:20: ✅ **LLM実力発揮成功！** サンプル語彙の高品質データ生成完了
  - データベーススキーマ拡張
  - cat/book/house等のサンプルで語源・例文・文脈・発音生成
  - ネイティブレベルの解説品質を実現
- 2025-08-06: ✅ **Phase 3 完全実装完了！** 高度機能・UI改善・品質向上
  - Solarizedテーマ完全実装（ダーク/ライト切り替え）
  - 音声読み上げ機能（Web Speech API）
  - クリップボードコピー機能
  - クイズシステム（全8言語対応）
  - 無限スクロール（英語単語ベースのページング）
  - スクロールトップボタン
  - 多言語UI（React Context による即座切り替え）
  - 統一Buttonコンポーネント（一貫したカラーパレット）
  - データ品質フィルタリング（無効な翻訳データ除外）

## 設計・実装ログ
- 2025-06-29: 旧版システム分析完了
- 2025-06-29: モダン統合アーキテクチャ案を策定
- 2025-06-29: Next.js + SQLite SSR構成に決定
- 2025-06-29: UI要件決定（Tailwind CSS、ダーク/ライトテーマ、URLルーティング+SPA的UX）
- 2025-06-29: 多言語UI対応（11言語）とモバイルファースト設計を追加
- 2025-06-29: UX向上機能とAPI機能、人気獲得戦略を策定
- 2025-06-29: API再設計とデータ構造拡張（複数意味、表記ゆらぎ、品質向上）
- 2025-06-29: 機能を簡素化、事前計算データ中心の設計に変更
- 2025-06-29: 文脈解説と性別決定理由の説明機能を追加
- 2025-06-29: インフラ・デプロイ設計完了（GCE + GitHub Actions + SQLite継続）
- 2025-06-29: 段階的実装戦略策定、LLM実力発揮でデータ品質向上へ
- 2025-06-29: **Phase 1 開始** - 詳細段取り作成、進捗記録開始

## 将来のデータ品質改善TODO

### データベース品質課題
1. **✅ 無効データ除外（完了）**
   - 空文字列翻訳の除外
   - 不正な性別値（`?`等）の除外
   - 有効翻訳が0件の単語の除外
   - 検索・ブラウズ両モードで一貫適用

2. **1位翻訳の精度問題（将来改善）**
   - `tree (de)`: `Schuhspanner` (靴べら) ← 完全に間違い
   - `house (fr)`: `famille` (家族) ← 意味が違う  
   - `sun (fr)`: `lumière` (光) ← 間接的すぎる
   - `moon (de)`: `Satellit` (衛星) ← 一般的でない

3. **原因分析**
   - 英語1単語 → 各言語3つの翻訳（1位〜3位）
   - 1位に不適切な翻訳が混入している場合あり
   - 現在のアプリは1位翻訳のみ使用

4. **修正方針（将来）**
   - 削除ではなく順位変更で対応
   - 問題のある1位を3位に移動
   - 基本語彙500語の人間による確認
   - 段階的品質改善

5. **拡張計画**
   - 現在: 4,541語 → 目標: 10,000語
   - カテゴリ別追加: 日常生活、ビジネス、自然
   - LLM活用した高品質翻訳生成

### 技術改善TODO
1. **✅ データ品質フィルタリング（完了）**
   - 無効翻訳データの除外実装
   - 性別値検証（m/f/n のみ許可）
   - 空翻訳配列を持つ単語の除外

2. **✅ UI/UX改善（完了）**
   - 無限スクロール（英語単語ベース）
   - スクロールトップボタン
   - 統一カラーパレット（Solarized）
   - 音声読み上げ・コピー機能

3. **将来の技術改善**
   - `translation.db` → `noun_gender.db` 移行完了後の旧ファイル削除検討
   - 多言語翻訳活用（現在は1位翻訳のみ、将来的に2位・3位も活用）
   - 品質チェックスクリプト開発
   - 人間による確認支援ツール構築