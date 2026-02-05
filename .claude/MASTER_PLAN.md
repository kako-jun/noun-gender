# 翻訳プロジェクト マスタープラン

**作成日**: 2025-02-05  
**方針**: 将来の単語追加に対応できる、ゼロから全単語生成可能なプロンプト

---

## 🎯 設計原則

### 1. 完全な再現性
- 各ステージは前ステージの出力のみに依存
- 既存データを「修正」ではなく「生成」
- 将来1000語追加しても同じプロンプトで対応可能

### 2. 明確な入力・出力
- 各ステージの入力列を明示
- 各ステージの出力列を明示
- 依存関係を明確化

### 3. 品質基準の具体化
- 良い例・悪い例を豊富に提示
- 定量的な基準（文字数、セミコロン数など）
- チェックリスト形式

---

## 📊 6ステージの完全な定義

### **Stage 1: 英語意味定義生成**

#### 入力
- `en`列のみ（英単語）

#### 出力
- `meaning_en`列（名詞としての意味説明）

#### タスク
**全4,592語**の`meaning_en`を**ゼロから生成**する。既存データは無視。

#### 品質基準
✅ **必須**:
- **最低20文字以上**の説明文
- **名詞としての意味**を説明（動詞・形容詞は禁止）
- 複数の意味がある場合は**セミコロン区切り**
- 最も一般的な意味を最初に記載

✅ **良い例**:
```
abbey: A building or buildings occupied by a community of monks or nuns
anxiety: A feeling of unease, nervousness, or concern about something with an uncertain outcome
apartment: A self-contained residential unit occupying part of a building
```

❌ **悪い例**:
```
anxiety: Worry  ← 同義語のみ（説明ではない）
apartment: Flat  ← 同義語のみ
application: Use  ← 短すぎる
```

---

### **Stage 2: 英語例文生成**

#### 入力
- `en`列（英単語）
- `meaning_en`列（意味説明）

#### 出力
- `example_en`列（例文）

#### タスク
**全4,592語**の`example_en`を**ゼロから生成**する。

#### 品質基準
✅ **必須**:
- `meaning_en`の**最初の意味のみ**を使った例文
- **名詞用法のみ**（動詞・形容詞用法は禁止）
- 自然で実用的な文章
- 単語は単数形で使用（meaning_enが単数形の場合）

✅ **良い例**:
```
en: abbey
meaning_en: A building or buildings occupied by a community of monks or nuns
example_en: Westminster Abbey has hosted coronations for centuries of British monarchs.
→ "abbey"を名詞として使用
```

❌ **悪い例**:
```
example_en: The monks abbreviated their prayers.
→ 動詞用法になっている
```

---

### **Stage 3: 性別付き翻訳（8言語）**

#### 入力
- `en`列（英単語）
- `meaning_en`列（意味説明）

#### 出力
- `{LANGUAGE}_translation`列（翻訳）
- `{LANGUAGE}_gender`列（性別記号）

#### タスク
**全4,592語**の翻訳と性別を**ゼロから生成**する。

#### セミコロンルール（最重要）
`meaning_en`にセミコロン（`;`）がある場合、**最初の意味のみ**を翻訳。

#### 品質基準
✅ **必須**:
- **名詞1語**で翻訳（説明文・複数語は禁止）
- {LANGUAGE_NATIVE}で最も自然で正確な訳語
- 単数形の英単語 → 単数形で翻訳
- 文法的性別を正確に記入（m/f/n）

---

### **Stage 4: 意味説明翻訳（10言語）**

#### 入力
- `en`列（英単語）
- `meaning_en`列（意味説明）

#### 出力
- `meaning_{LANGUAGE}`列（意味の翻訳）

#### タスク
**全4,592語**の意味説明を**ゼロから翻訳**する。

#### 重要な原則
- 英語の`meaning_en`は単語そのものを使えないため長い説明文
- 他言語では、**その言語にピッタリの単語があればそれを使うべき**
- 単語だけでもOK、単語+補足説明でもOK

#### 品質基準
✅ **必須**:
- {LANGUAGE_NATIVE}に適切な単語があればそれを使う
- 名詞としての意味を説明（動詞・形容詞は禁止）
- 同一言語内での重複語を排除
- 自然で正確な{LANGUAGE_NATIVE}（英語の長い説明を無理に模倣しない）

✅ **良い例**:
```
en: abbey
meaning_en: A building or buildings occupied by a community of monks or nuns
→ meaning_ja: "修道院" または "修道院; 僧院が使用する建物"
→ meaning_fr: "abbaye" または "abbaye; bâtiment monastique"
```

---

### **Stage 5: 例文翻訳（10言語）**

#### 入力
- `en`列（英単語）
- `example_en`列（英語例文）
- `{LANGUAGE}_translation`列（単語翻訳）
- `{LANGUAGE}_gender`列（性別）

#### 出力
- `example_{LANGUAGE}`列（例文翻訳）

#### タスク
**全4,592語**の例文を**ゼロから翻訳**する。

#### 品質基準
✅ **必須**:
- 自然で流暢な翻訳
- 名詞の性別を正しく反映
- 文化的に適切な表現

---

### **Stage 6: 記憶術生成（24組合せ）**

#### 入力
- `en`列（英単語）
- `{LANGUAGE}_translation`列（翻訳）
- `{LANGUAGE}_gender`列（性別）

#### 出力
- `memory_trick_{UI_LANG}`列（記憶術説明）

#### タスク
**全4,592語 × 8言語 × 3UI言語 = 110,208個**の記憶術を生成。

---

## 🚀 実行計画

### フェーズ1: Stage 1-2（英語データ生成）
```
Stage 1: 全4,592語のmeaning_enを生成
  ↓
Stage 2: 全4,592語のexample_enを生成
```

**所要時間**: 2-4時間（Claude APIで全単語処理）

### フェーズ2: Stage 3-6（多言語翻訳）
```
Stage 3: 8言語並列（全4,592語 × 8言語）
  ↓
Stage 4: 10言語並列（全4,592語 × 10言語）
  ↓
Stage 5: 10言語並列（全4,592語 × 10言語）
  ↓
Stage 6: 24組合せ並列（全4,592語 × 24組合せ）
```

**所要時間**: 各ステージ 2-4時間

---

## 📋 プロンプト作成タスク

### 今すぐ作成するプロンプト
1. ✅ **TEMPLATE-stage1-meaning.md**: meaning_en生成（全単語対応）
2. ✅ **TEMPLATE-stage2-example.md**: example_en生成（全単語対応）
3. ✅ **TEMPLATE-stage3-gender.md**: 既に作成済み（修正不要）
4. ✅ **TEMPLATE-stage4-meaning.md**: 既に作成済み（修正不要）
5. ⏳ **TEMPLATE-stage5-example.md**: 例文翻訳（未作成）
6. ⏳ **TEMPLATE-stage6-memory.md**: 記憶術生成（未作成）

---

## 🎯 次のアクション

### 即座に実行
1. **Stage 1プロンプト作成**: TEMPLATE-stage1-meaning.md
2. **Stage 2プロンプト作成**: TEMPLATE-stage2-example.md
3. **サブエージェント起動**: Stage 1実行（全4,592語）

### 次回セッション
1. Stage 2実行
2. Stage 3-6順次実行

---

**次回作業開始時**: このファイルを読んで、Stage 1/2プロンプト作成から開始
