# 名詞性別学習API仕様書

## 概要

名詞性別学習APIは、8言語にわたる性別付き名詞の検索、ブラウズ、クイズ機能を提供するエンドポイント群です。すべてのエンドポイントはJSON形式でレスポンスを返し、多言語クエリに対応しています。

**ベースURL:** `http://localhost:3000/api` (開発環境)

**対応言語:** アラビア語(ar)、フランス語(fr)、ドイツ語(de)、ヒンディー語(hi)、イタリア語(it)、ポルトガル語(pt)、ロシア語(ru)、スペイン語(es)

## 認証

認証は不要です。すべてのエンドポイントは公開アクセス可能です。

## 共通レスポンス形式

```typescript
interface ApiResponse<T> {
  data: T;
  total?: number;
  error?: string;
}
```

## データ型定義

### Translation オブジェクト
```typescript
interface Translation {
  id: number;
  word_id: number;
  language: string;           // 言語コード (ar, fr, de, etc.)
  translation: string;        // 翻訳された単語
  gender: 'm' | 'f' | 'n';   // 性別: 男性、女性、中性
  memory_trick_ja?: string;   // 日本語の暗記術
  memory_trick_en?: string;   // 英語の暗記術  
  memory_trick_zh?: string;   // 中国語の暗記術
}
```

### 検索結果オブジェクト
```typescript
interface SearchResult {
  word: {
    id: number;
    word_en: string;          // 英語単語
    meaning_en?: string;      // 英語の意味
    meaning_ja?: string;      // 日本語の意味
    meaning_zh?: string;      // 中国語の意味
  };
  translations: Translation[];
  example?: {
    example_en: string;       // 英語の例文
    example_ja?: string;      // 日本語翻訳
    example_zh?: string;      // 中国語翻訳
  };
}
```

## エンドポイント

### 1. 単語検索

あいまい検索対応で複数言語にわたって単語を検索します。

**エンドポイント:** `GET /api/search`

**パラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|------|----------|-------------|
| `q` | string | はい | 検索クエリ (英語または対象言語) |
| `languages` | string | いいえ | ハイフン区切りの言語コード (例: "fr-de-es") |
| `limit` | number | いいえ | 最大結果数 (デフォルト: 1000, 最大: 1000) |

**リクエスト例:**
```bash
GET /api/search?q=cat&languages=fr-de-es&limit=10
```

**レスポンス例:**
```json
{
  "data": [
    {
      "word": {
        "id": 0,
        "word_en": "cat",
        "meaning_en": "feline; pet; animal; kitten",
        "meaning_ja": "猫；ペット；動物；子猫",
        "meaning_zh": "猫；猫咪；cat"
      },
      "translations": [
        {
          "id": 0,
          "word_id": 0,
          "language": "fr",
          "translation": "chatte",
          "gender": "f",
          "memory_trick_ja": "フランス語では「シャッ」という鋭い鳴き声が男性的に聞こえることから男性名詞とされています。"
        },
        {
          "id": 0,
          "word_id": 0,
          "language": "de",
          "translation": "Katze",
          "gender": "f"
        }
      ],
      "example": {
        "example_en": "The cat is sleeping on the sofa.",
        "example_ja": "猫がソファーで寝ています。",
        "example_zh": "猫在沙发上睡觉。"
      }
    }
  ],
  "total": 1
}
```

**エラーレスポンス:**
- `400 Bad Request`: クエリパラメータが不正または不足
- `500 Internal Server Error`: データベースまたはサーバーエラー

---

### 2. 単語ブラウズ

ページング対応でアルファベット順に単語をブラウズします。

**エンドポイント:** `GET /api/browse`

**パラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|------|----------|-------------|
| `limit` | number | いいえ | ページあたりの単語数 (デフォルト: 100) |
| `offset` | number | いいえ | 開始位置 (デフォルト: 0) |
| `language` | string | いいえ | 言語コードまたは"all"でフィルター (デフォルト: "all") |
| `startsWith` | string | いいえ | 指定の文字で始まる単語をフィルター |

**リクエスト例:**
```bash
GET /api/browse?limit=50&offset=0&language=fr&startsWith=a
```

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "english": "abbey",
      "meaning_en": "religious building",
      "meaning_ja": "修道院",
      "meaning_zh": "修道院",
      "translations": [
        {
          "id": 0,
          "word_id": 0,
          "language": "fr",
          "translation": "abbaye",
          "gender": "f"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3. データベース統計

データベース統計と言語別分布を取得します。

**エンドポイント:** `GET /api/stats`

**パラメータ:** なし

**リクエスト例:**
```bash
GET /api/stats
```

**レスポンス例:**
```json
{
  "totalWords": 4541,
  "totalTranslations": 30361,
  "multilingualTerms": 35012,
  "searchLanguages": 8,
  "languageStats": [
    { "language": "fr", "count": 4449 },
    { "language": "de", "count": 4433 },
    { "language": "it", "count": 4408 },
    { "language": "es", "count": 4408 },
    { "language": "ru", "count": 4325 },
    { "language": "hi", "count": 4061 },
    { "language": "ar", "count": 3050 },
    { "language": "pt", "count": 1227 }
  ]
}
```

---

### 4. クイズ生成

性別学習用のランダムクイズ問題を生成します。

**エンドポイント:** `GET /api/quiz`

**パラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|------|----------|-------------|
| `languages` | string | いいえ | ハイフン区切りの言語コード (デフォルト: "fr-de-es") |
| `count` | number | いいえ | 問題数 (デフォルト: 10, 最大: 20) |

**リクエスト例:**
```bash
GET /api/quiz?languages=fr-de&count=5
```

**レスポンス例:**
```json
{
  "questions": [
    {
      "id": 1,
      "english": "house",
      "translation": "maison",
      "language": "fr",
      "correctGender": "f",
      "options": ["f", "m", "n"],
      "explanation": "house → maison (fr)"
    }
  ],
  "total": 1
}
```

---

### 5. 暗記術取得

特定の単語の性別ルールを覚えるための暗記術を取得します。

**エンドポイント:** `GET /api/memory-tricks`

**パラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|------|----------|-------------|
| `word` | string | はい | 暗記術を取得したい英語単語 |
| `ui` | string | いいえ | 暗記術の表示言語 (デフォルト: "en") |

**リクエスト例:**
```bash
GET /api/memory-tricks?word=cat&ui=ja
```

**レスポンス例:**
```json
{
  "word": "cat",
  "uiLanguage": "ja",
  "tricks": {
    "fr": "フランス語では「シャッ」という鋭い鳴き声が男性的に聞こえることから男性名詞とされています。"
  }
}
```

---

## 追加エンドポイント

高度な機能のためのヘルパーエンドポイントも用意されています:

- `GET /api/word-at-offset` - 指定位置の単語を取得
- `GET /api/word-range` - 指定範囲の単語を取得
- `GET /api/letter-stats` - 文字別統計
- `GET /api/letter-stats-detailed` - 詳細な文字別統計

## 検索機能

### あいまい検索
検索APIは以下をサポートしています:
- **完全一致**: 直接単語マッチが最優先
- **前方一致**: クエリで始まる単語
- **部分一致**: 部分文字列マッチ
- **多言語検索**: 対応するすべての言語での検索
- **タイポ許容**: よくあるミススペルのあいまい検索

### 検索優先度
結果は以下の順序でランク付けされます:
1. 完全一致 (英語または翻訳)
2. 短単語部分一致 (4文字以下)
3. 前方一致
4. その他の部分一致
5. 単語の長さ (短い単語が優先)

## パフォーマンス

- すべてのエンドポイントはデータベースインデックスで最適化
- 検索はリアルタイム更新される自動多言語インデックスを使用
- ブラウズエンドポイントは効率的なページングをサポート
- クイズ生成は多様な問題のためのランダムサンプリングを使用
- 暗記術は単語-言語組み合わせごとにキャッシュ

## エラーハンドリング

すべてのエンドポイントは一貫したエラーレスポンス形式に従います:

```json
{
  "error": "エラーの説明",
  "data": []
}
```

共通HTTPステータスコード:
- `200 OK`: 成功したリクエスト
- `400 Bad Request`: 不正なパラメータ
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーまたはデータベースエラー

## レート制限

現在レート制限は実装されていません。本番環境でのデプロイ時は、使用パターンに応じて適切なレート制限の実装を検討してください。

## データベーススキーマ

APIは以下の正規化されたSQLiteデータベースによってサポートされています:
- **8つの言語テーブル** 翻訳用
- **参照整合性** 外部キー制約付き
- **自動検索インデックス** 動的ビューによる
- **多言語サポート** 定義と例文用
- **暗記術システム** 学習支援用

詳細なデータベーススキーマは [ER図](../.claude/er-diagram.md) を参照してください。