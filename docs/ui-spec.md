# Noun Gender Learning App - UI仕様書

## 画面設計概要

名詞性別学習アプリケーションのユーザーインターフェース仕様書。
Solarizedテーマによる美しいデザインと、直感的なユーザー体験を提供します。

## デザインシステム

### カラーパレット (Solarized)

**ライトテーマ:**
```css
--solarized-base03: #002b36   /* 背景 (濃い) */
--solarized-base02: #073642   /* 背景ハイライト */
--solarized-base01: #586e75   /* コメント・セカンダリ */
--solarized-base00: #657b83   /* ボディテキスト */
--solarized-base0:  #839496   /* ボディテキスト */
--solarized-base1:  #93a1a1   /* コメント・セカンダリ */
--solarized-base2:  #eee8d5   /* 背景ハイライト */
--solarized-base3:  #fdf6e3   /* 背景 (明るい) */

--solarized-yellow: #b58900   /* アクセント */
--solarized-orange: #cb4b16   /* アクセント */
--solarized-red:    #dc322f   /* エラー・警告 */
--solarized-magenta:#d33682   /* アクセント */
--solarized-violet: #6c71c4   /* アクセント */
--solarized-blue:   #268bd2   /* プライマリ */
--solarized-cyan:   #2aa198   /* アクセント */
--solarized-green:  #859900   /* 成功 */
```

### タイポグラフィ

**フォントスタック:**
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", 
             sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

**サイズスケール:**
- `text-xs`: 12px (小さな注釈)
- `text-sm`: 14px (セカンダリテキスト)
- `text-base`: 16px (ベーステキスト)
- `text-lg`: 18px (小見出し)
- `text-xl`: 20px (見出し)
- `text-2xl`: 24px (大見出し)

### スペーシング

**8px基準のスケール:**
- `p-2`: 8px
- `p-3`: 12px
- `p-4`: 16px
- `p-6`: 24px
- `p-8`: 32px

## 画面構成

### メインページ (`/`)

**レイアウト構造:**
```
┌─────────────────────────────────────┐
│ Header                              │
│ ┌─────────────────────────────────┐ │
│ │ Language Switcher | Theme Toggle│ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Tab Navigation                      │
│ [Search] [Browse] [Quiz]            │
├─────────────────────────────────────┤
│ Content Area                        │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │ Tab-specific Content            │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Footer                              │
│ Home Link | Statistics             │
└─────────────────────────────────────┘
```

### 検索タブ (`/?tab=search`)

**コンポーネント構成:**

1. **SearchBox**
   - 検索入力フィールド
   - 言語選択チェックボックス (8言語)
   - リアルタイム検索 (デバウンス: 300ms)
   - キーボードショートカット (`/` で検索、`Esc` でクリア)

```typescript
interface SearchBoxProps {
  query: string
  onQueryChange: (query: string) => void
  selectedLanguages: LanguageCode[]
  onLanguageChange: (languages: LanguageCode[]) => void
}
```

2. **SearchResults**
   - 単語カード形式表示
   - 英語単語 + 音声ボタン
   - 意味定義 (日本語/中国語/英語)
   - 各言語の翻訳カード (性別・暗記術付き)
   - 例文表示 (利用可能な場合)

**単語カードデザイン:**
```
┌─────────────────────────────────────┐
│ 🔊 cat (English)             [Copy] │
├─────────────────────────────────────┤
│ Meaning: feline; pet; animal        │
│ 意味: 猫；ペット；動物；子猫         │
├─────────────────────────────────────┤
│ Example: The cat is sleeping.       │
│ 例文: 猫が寝ています。               │
├─────────────────────────────────────┤
│ ┌─ French ──────┐ ┌─ German ──────┐ │
│ │ chatte (f) 🔊 │ │ Katze (f) 🔊  │ │
│ │ [Copy] [💡]   │ │ [Copy] [💡]   │ │
│ └───────────────┘ └───────────────┘ │
│ ┌─ Spanish ─────┐ ┌─ Italian ─────┐ │
│ │ gato (m) 🔊   │ │ gatto (m) 🔊  │ │
│ │ [Copy] [💡]   │ │ [Copy] [💡]   │ │
│ └───────────────┘ └───────────────┘ │
└─────────────────────────────────────┘
```

### ブラウズタブ (`/?tab=browse`)

**A-Z索引デザイン:**

1. **文字選択グリッド**
   ```
   A(142) B(89)  C(203) D(156) E(78)  F(134) G(95)
   H(112) I(89)  J(23)  K(34)  L(98)  M(167) N(67)
   O(45)  P(189) Q(12)  R(134) S(234) T(98)  U(23)
   V(34)  W(67)  X(3)   Y(12)  Z(5)
   ```

2. **フィルター状態表示**
   ```
   Showing words starting with 'C' (203 words)
   [Clear Filter]
   ```

3. **単語リスト**
   - 無限スクロール対応
   - 英語単語アルファベット順
   - 簡潔な翻訳情報表示

### クイズタブ (`/?tab=quiz`)

**クイズインターフェース:**

1. **問題表示**
   ```
   ┌─────────────────────────────────────┐
   │ Question 3 / 10                     │
   ├─────────────────────────────────────┤
   │                                     │
   │     What is the gender of:          │
   │                                     │
   │        chatte (French)              │
   │                                     │
   │    ┌─────┐ ┌─────┐ ┌─────┐        │
   │    │  m  │ │  f  │ │  n  │        │
   │    └─────┘ └─────┘ └─────┘        │
   │                                     │
   │         [Submit Answer]             │
   └─────────────────────────────────────┘
   ```

2. **結果表示**
   - 正解/不正解のフィードバック
   - 正解率表示
   - 解説 (暗記術があれば表示)

## コンポーネント仕様

### ボタンコンポーネント

**統一ボタンデザイン:**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
}
```

**スタイル仕様:**
```css
/* Primary Button */
.btn-primary {
  @apply bg-solarized-blue hover:bg-blue-600 text-white;
  @apply px-4 py-2 rounded-md font-medium;
  @apply transition-colors duration-200;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-solarized-base2 hover:bg-solarized-base1 text-solarized-base01;
  @apply dark:bg-solarized-base02 dark:hover:bg-solarized-base01 dark:text-solarized-base1;
}
```

### カードコンポーネント

**単語カードデザイン:**
```css
.word-card {
  @apply bg-white dark:bg-solarized-base02;
  @apply border border-solarized-base2 dark:border-solarized-base01;
  @apply rounded-lg shadow-sm hover:shadow-md;
  @apply transition-shadow duration-200;
}
```

### 音声ボタン

**AudioButtonデザイン:**
```typescript
interface AudioButtonProps {
  text: string
  language?: string
  size?: 'sm' | 'md'
}
```

```css
.audio-button {
  @apply inline-flex items-center justify-center;
  @apply w-8 h-8 rounded-full;
  @apply bg-solarized-green hover:bg-green-600;
  @apply text-white transition-colors duration-200;
}
```

## レスポンシブデザイン

### ブレークポイント戦略

**モバイル (< 640px):**
- 単列レイアウト
- タッチフレンドリーなボタンサイズ (44px以上)
- スワイプ対応検討

**タブレット (640px - 768px):**
- 2列グリッド
- 中間サイズのコンポーネント

**デスクトップ (768px+):**
- 3列グリッド
- サイドバー追加可能
- キーボードショートカット強化

### レスポンシブ実装例

```typescript
// 検索結果グリッド
<div className="
  grid grid-cols-1          // モバイル: 1列
  md:grid-cols-2            // タブレット: 2列
  lg:grid-cols-3            // デスクトップ: 3列
  gap-4 md:gap-6            // 可変ギャップ
">

// A-Z文字ボタン
<div className="
  grid grid-cols-7          // 7列固定
  sm:grid-cols-7            // タブレット: 7列
  gap-1 sm:gap-2            // 可変ギャップ
">
  <button className="
    h-10 w-10               // モバイル: 40px
    sm:h-12 sm:w-12         // タブレット: 48px
    text-sm sm:text-base    // 可変フォントサイズ
  ">
```

## アニメーション・トランジション

### トランジション仕様

**共通アニメーション:**
```css
/* ページ遷移 */
.page-transition {
  @apply transition-all duration-300 ease-in-out;
}

/* カードホバー */
.card-hover {
  @apply transition-shadow duration-200;
}

/* ボタンホバー */
.button-hover {
  @apply transition-colors duration-200;
}

/* テーマ切り替え */
.theme-transition {
  @apply transition-colors duration-300;
}
```

### ローディング状態

**スケルトンローダー:**
```typescript
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-solarized-base2 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-solarized-base2 rounded w-1/2 mb-4"></div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-16 bg-solarized-base2 rounded"></div>
      <div className="h-16 bg-solarized-base2 rounded"></div>
    </div>
  </div>
)
```

## アクセシビリティ

### キーボードナビゲーション

- **Tab順序**: 論理的な順序
- **フォーカス表示**: 明確なフォーカスリング
- **ショートカット**:
  - `/`: 検索フィールドにフォーカス
  - `Escape`: 検索クリア・モーダル閉じる
  - `Enter`: 検索実行・ボタン押下

### スクリーンリーダー対応

```typescript
// 適切なARIAラベル
<button
  aria-label={`Play pronunciation for ${word}`}
  aria-pressed={isPlaying}
>

// セマンティックHTML
<main role="main">
  <section aria-labelledby="search-heading">
    <h2 id="search-heading">Word Search</h2>
  </section>
</main>
```

### カラーアクセシビリティ

- **コントラスト比**: WCAG AA準拠 (4.5:1以上)
- **色盲対応**: 色だけに依存しない情報表示
- **フォーカス表示**: 高コントラストフォーカスリング

## パフォーマンス考慮事項

### 最適化手法

1. **画像最適化**
   - Next.js Image コンポーネント使用
   - WebP形式対応
   - レスポンシブ画像

2. **コード分割**
   - 動的インポート活用
   - ページ別バンドル分割

3. **レンダリング最適化**
   - React.memo使用
   - useCallback/useMemo適用
   - 仮想スクロール (長いリスト)

### Core Web Vitals 目標

- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ミリ秒
- **CLS (Cumulative Layout Shift)**: < 0.1

---

## 実装ガイドライン

1. **コンポーネント命名**: PascalCase
2. **CSS変数**: Solarizedカラーパレット使用
3. **レスポンシブ**: モバイルファースト
4. **アニメーション**: 控えめで機能的
5. **アクセシビリティ**: WCAG AA準拠