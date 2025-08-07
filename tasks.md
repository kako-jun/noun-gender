# Noun Gender Learning App - 作業進捗管理

## プロジェクト概要
名詞の性別がある言語（ドイツ語、フランス語、スペイン語等）の学習・検索用Webアプリケーション。  
Next.js + TypeScript + SQLite構成で実装済み。現在はデータ品質向上フェーズ。

## 現在の作業状況

### Phase 1: 基盤構築 ✅ 完了
- Next.js + TypeScript + Tailwind CSS セットアップ完了
- SQLite データベース接続・基本検索API実装完了
- UI実装（検索、ブラウズ、クイズ機能）完了

### Phase 2: データ品質向上 🔄 進行中
#### 修正管理システム構築 ✅ 完了
- データベーススキーマ拡張（correction tracking columns）
- 基本語彙の翻訳・性別修正（仏独西伊葡露）完了
- 無効データフィルタリング実装完了

#### 意味定義生成 🔄 **現在作業中**
**目標**: 全4,541英語単語に意味定義を追加（meaning_en, meaning_ja, meaning_zh）

**進捗状況**:
- ✅ 完了: 1,517語 / 4,541語 (33.4%)
- 🔄 残り: 3,024語

**バッチ処理履歴**:
1. **Batch 1-6** (188語): ability～bean等 - 2025-06-29～2025-08-06完了
2. **Batch 7-36** (1,329語): beard～conundrum等 - 2025-08-07完了 ← 最新

**大規模バッチ処理実績**:
- 効率的なバッチスクリプトにより、1日で1,329語を処理完了
- 残り約61バッチで完了見込み

**効率化戦略**:
- 10語バッチ → **50語バッチに変更**（効率化実現）
- Node.jsスクリプト活用（better-sqlite3 + transaction）
- 残り約87バッチで完了見込み

#### 次回作業で実行すべきスクリプト

**次のバッチ（Batch 7）の単語リスト取得**:
```sql
SELECT english FROM words_fr 
WHERE meaning_en IS NULL OR meaning_en = '' 
ORDER BY english 
LIMIT 50 OFFSET 188;
```

**Batch 7用スクリプト作成コマンド**:
```bash
# 1. 次の50語を取得
sqlite3 data/noun_gender.db "SELECT english FROM words_fr WHERE meaning_en IS NULL OR meaning_en = '' ORDER BY english LIMIT 50 OFFSET 188"

# 2. scripts/generate-meanings-batch-7-large.js を作成
# （Batch 6のテンプレートをコピーして単語リストを更新）

# 3. 実行
node scripts/generate-meanings-batch-7-large.js
```

**進捗確認**:
```sql
SELECT COUNT(*) as completed FROM words_fr WHERE meaning_en IS NOT NULL AND meaning_en != '';
SELECT COUNT(*) as remaining FROM words_fr WHERE meaning_en IS NULL OR meaning_en = '';
```

### Phase 2.5: 例文機能設計 🆕 計画中

#### 例文表示機能の設計案

**1. データベース拡張案**
```sql
-- 英語基本の例文テーブル（新規作成）
CREATE TABLE example_sentences (
  id INTEGER PRIMARY KEY,
  english_word TEXT UNIQUE REFERENCES words(english),
  example_en TEXT NOT NULL,     -- 英語基本例文
  example_ja TEXT,              -- 日本語訳
  example_zh TEXT,              -- 中国語訳
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 各言語テーブルには翻訳例文のみ追加
ALTER TABLE words_fr ADD COLUMN example_native TEXT;  -- フランス語例文（英語例文の翻訳）
ALTER TABLE words_de ADD COLUMN example_native TEXT;  -- ドイツ語例文（英語例文の翻訳）
-- 他の言語も同様
```

**2. UI設計案**
- **配置**: 各単語カードの意味定義の下、翻訳カードの上に例文セクション追加
- **表示レイアウト**: 
  ```
  [単語カード]
  ├── 英単語 + 音声ボタン
  ├── 意味定義（日本語/中国語/英語）
  ├── 【例文セクション】← ここに追加（常時表示）
  │   ├── 英語例文（太字で単語をハイライト）
  │   └── UI言語での翻訳（日本語/中国語）- 薄い文字色
  └── [各言語の翻訳カード] × 8言語
      └── （各翻訳カード内に）ネイティブ例文を小さく表示
  ```
- **常時表示**: 折りたたみなし、すべての例文を最初から表示
- **視覚的階層**: 英語例文は通常サイズ、翻訳は少し小さく薄い色で表示
- **各言語カードの例文**: 性別に応じた冠詞を色分けハイライト

**3. 実装優先順位**
1. **Phase 1**: 基本語彙500語に例文追加（高頻度・重要単語）
2. **Phase 2**: 中頻度単語1000語に例文追加
3. **Phase 3**: 残りの単語に段階的に追加

**4. 例文生成ガイドライン**
- **英語基本主義**: 英語例文を基本とし、各言語はその翻訳
- **簡潔性**: 10単語以内の短い文
- **実用性**: 日常会話で使える自然な文
- **性別強調**: 冠詞・形容詞で性別を明確に示す
- **文法的特徴**: 各言語の格変化・冠詞使用を含む
- **文化的中立性**: 特定文化に偏らない普遍的な内容

**5. 技術的実装案**
```typescript
// コンポーネント拡張
interface WordExample {
  example_en: string;
  example_native: string;
  example_ja: string;
  example_zh: string;
}

// 例文表示コンポーネント
const ExampleSection: React.FC<{word: string, examples: WordExample, locale: string}> = ({word, examples, locale}) => {
  const uiTranslation = locale === 'ja' ? examples.example_ja : 
                       locale === 'zh' ? examples.example_zh :
                       null;
  
  return (
    <div className="mt-3 mb-4 p-3 bg-solarized-base3 dark:bg-solarized-base03 rounded-lg">
      <p className="text-sm font-medium text-solarized-base01 dark:text-solarized-base1">
        {highlightWord(examples.example_en, word)}
      </p>
      {uiTranslation && (
        <p className="text-xs text-solarized-base00 dark:text-solarized-base0 opacity-70 mt-1">
          {uiTranslation}
        </p>
      )}
    </div>
  );
};
```

### Phase 3: 空翻訳補完 ⏳ 待機中
**前提条件**: Phase 2完了後に実行（意味確定後に翻訳作成）

**作業内容**:
- アラビア語: 1,491件の空翻訳補完
- ヒンディー語: 480件の空翻訳補完  
- その他言語の空翻訳補完

## 技術仕様

### データベース構造
- **ファイル**: `data/noun_gender.db`
- **テーブル**: words_fr, words_de, words_es, words_it, words_ru, words_ar, words_hi
- **統合ビュー**: all_words (全言語テーブルの統合)

### 修正管理フィールド
```sql
-- 各言語テーブルに追加済み
data_source TEXT DEFAULT 'original'     -- データソース管理
verified_at DATETIME                     -- 検証日時  
confidence_score INTEGER DEFAULT 0      -- 信頼度スコア
stage_1_basic BOOLEAN DEFAULT 0         -- Stage 1完了フラグ
stage_2_meanings BOOLEAN DEFAULT 0      -- Stage 2完了フラグ
meaning_en TEXT                          -- 英語意味定義
meaning_ja TEXT                          -- 日本語意味定義  
meaning_zh TEXT                          -- 中国語意味定義
```

## 再開時のチェックリスト

### 1. 現在の進捗確認
```bash
# 意味定義完了数を確認
sqlite3 data/noun_gender.db "SELECT COUNT(*) FROM words_fr WHERE stage_2_meanings = 1"

# 残り作業数を確認  
sqlite3 data/noun_gender.db "SELECT COUNT(*) FROM words_fr WHERE meaning_en IS NULL OR meaning_en = ''"
```

### 2. 次のバッチの準備
```bash
# 次の50語を確認
sqlite3 data/noun_gender.db "SELECT english FROM words_fr WHERE meaning_en IS NULL OR meaning_en = '' ORDER BY english LIMIT 50 OFFSET [現在の完了数]"
```

### 3. スクリプト実行
- `scripts/generate-meanings-batch-[N]-large.js` を作成・実行
- 進捗をこのファイルに記録

## 完了予定
- **意味定義生成**: 50語/バッチ × 90バッチ ≈ 90回実行
- **全体完了見込み**: Phase 2完了後、Phase 3へ移行
- **最終目標**: データ品質100%、全機能完備の公開版リリース

---
最終更新: 2025-08-07 - Batch 36完了、1,517語/4,541語 (33.4%)、例文機能設計追加