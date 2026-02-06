# Phase 3: アラビア語翻訳タスク（修正版）

## あなたの役割
あなたは**アラビア語の専門翻訳者**です。`data/translations_ar.csv`の全4,592単語を翻訳してください。

---

## 重要：今回のミスの原因と対策

### ❌ 前回の失敗
- `meaning_en`と`example_en`を読まずに翻訳した
- セミコロンルールを無視した
- 名詞以外（動詞・形容詞・副詞）で翻訳した
- 行を勝手に削除・追加した

### ✅ 今回の厳守事項
1. **必ず`data/words.csv`から`meaning_en`と`example_en`を読む**
2. **セミコロン(;)より前の最初の意味のみ翻訳**
3. **必ず名詞として翻訳（動詞・形容詞・副詞は絶対禁止）**
4. **全4,592行を維持（削除・追加は絶対禁止）**

---

## タスク概要

### 入力ファイル
1. **`data/words.csv`**: 英語単語のソース情報
   - `en`: 英語単語
   - `meaning_en`: 英語での意味定義
   - `example_en`: 使用例文

2. **`data/translations_ar.csv`**: 翻訳対象ファイル
   - `en`: 英語単語（既に入力済み）
   - `translation`: アラビア語翻訳（空欄→埋める）
   - `gender`: 文法的性別（空欄→埋める）
   - `meaning_translation`: 意味のアラビア語訳（空欄→埋める）

### 目標
- **行数**: 4,593行（ヘッダー + 4,592単語）を維持
- **翻訳数**: 4,592語すべて
- **品質**: セミコロンルール100%遵守、名詞のみ

---

## 翻訳ルール（厳格に遵守）

### ルール1: セミコロンルール（最重要）
`meaning_en`にセミコロン(`;`)がある場合、**セミコロンより前の最初の意味のみ**を翻訳する。

**例1: foster**
```
words.csv:
  en: foster
  meaning_en: "A foster parent; a caregiver in the foster care system"
  example_en: "The dedicated foster provided a safe and loving home..."

処理:
  1. meaning_enをセミコロンで分割: ["A foster parent", " a caregiver in the foster care system"]
  2. 最初の要素のみ取得: "A foster parent"
  3. これをアラビア語の名詞に翻訳

正解（フランス語の場合）:
  translation: "parent d'accueil"
  gender: "m"
  meaning_translation: "Un parent d'accueil dans le système de placement familial"

不正解（前回のミス）:
  ❌ translation: "encouragement"（fostering「育成」の意味で翻訳してしまった）
  ❌ translation: "fomento"（動詞的な意味で翻訳してしまった）
```

**例2: forth**
```
words.csv:
  en: forth
  meaning_en: "Forward movement; onward progress from a starting point"
  example_en: "The forth of the expedition into uncharted territory..."

処理:
  1. セミコロンで分割: ["Forward movement", " onward progress from a starting point"]
  2. 最初のみ: "Forward movement"
  3. これを名詞として翻訳

正解（スペイン語の場合）:
  translation: "avance"
  gender: "m"
  meaning_translation: "Movimiento hacia adelante"

不正解（前回のミス）:
  ❌ translation: "adelante"（副詞「forward」で翻訳してしまった）
```

**例3: evil**
```
words.csv:
  en: evil
  meaning_en: "Profound immorality and wickedness, especially when regarded as a supernatural force"
  example_en: "The ancient legend warned of evil forces threatening..."

処理:
  1. セミコロンなし→全体を見る
  2. "Profound immorality and wickedness"の名詞形を翻訳

正解（スペイン語の場合）:
  translation: "maldad"
  gender: "f"
  meaning_translation: "Inmoralidad y maldad profunda"

不正解（前回のミス）:
  ❌ translation: "mal"（形容詞的で曖昧）
  ✅ でも"mal"も名詞として使えるので許容される場合もある
```

### ルール2: 必ず名詞として翻訳

`example_en`を読んで、英語でどのように**名詞**として使われているか確認する。

**チェック項目**:
- ✅ 名詞として使える単語か？
- ❌ 動詞になっていないか？
- ❌ 形容詞になっていないか？
- ❌ 副詞になっていないか？

### ルール3: 冠詞なし

アラビア語の冠詞（le/la/un/una/der/die/das等）は**絶対に付けない**。

```
✅ 正解: "abbaye", "capacité", "修道院"
❌ 不正解: "la abbaye", "une capacité", "その修道院"
```

### ルール4: 性別の正確性

アラビア語の文法的性別を正確に記入：
- m (مذكر), f (مؤنث)

### ルール5: 行数の厳守

**絶対に削除・追加してはいけない**。必ず4,593行（ヘッダー+4,592単語）を維持。

---

## 作業手順

**重要**: APIは使用禁止。あなた（Claude）自身が直接翻訳してください。

### ステップ1: ファイルを読んで理解する

1. `data/words.csv`を読んで、全4,592語の`meaning_en`と`example_en`を把握する
2. `data/translations_ar.csv`を読んで、現在の状態を確認する

### ステップ2: 200語ずつ翻訳する

**バッチサイズ**: 200語ずつ（コンテキスト圧縮を防ぐため）

各バッチで：
1. words.csvから該当200語の情報を読む
2. 各単語について：
   - `meaning_en`をセミコロンで分割し、最初の意味のみ取得
   - `example_en`で名詞としての用法を確認
   - アラビア語の名詞形に翻訳
   - 文法的性別を判定
   - 意味のアラビア語訳を作成
3. `data/translations_ar.csv`の該当200行を直接編集（Editツール使用）
4. 次の200語へ進む

### ステップ3: 各バッチ完了後に確認

- 編集した200行が正しく更新されているか確認
- 行数が変わっていないか確認（4,593行を維持）
- 空欄がないか確認

### ステップ4: 全バッチ完了後に検証

- 全4,592語が翻訳されているか確認
- 行数が4,593行（ヘッダー+4,592単語）であることを確認
- ランダムに100語サンプリングしてセミコロンルール遵守を確認

---

## 品質チェックリスト

翻訳完了後、必ず確認：

1. ✅ **行数**: 4,593行（ヘッダー+4,592単語）を維持
2. ✅ **セミコロンルール**: 100語ランダムサンプリングして確認
3. ✅ **名詞チェック**: すべて名詞か確認（動詞・形容詞・副詞がないか）
4. ✅ **冠詞チェック**: 冠詞が付いていないか
5. ✅ **性別チェック**: 性別記号が正しいか
6. ✅ **空欄チェック**: translation/gender/meaning_translationに空欄がないか

---

## 成功基準

✅ 4,592語すべて翻訳完了  
✅ セミコロンルール100%遵守  
✅ すべて名詞として翻訳  
✅ 行数4,593行を維持  
✅ 冠詞なし  
✅ 性別記号正確  
✅ 空欄ゼロ

---

## 禁止事項

❌ meaning_enとexample_enを読まずに翻訳  
❌ セミコロン後の意味を含める  
❌ 動詞・形容詞・副詞で翻訳  
❌ 行の削除・追加  
❌ 冠詞を付ける  
❌ 複数語での翻訳（1語の名詞で翻訳すること）

---

## 完了報告フォーマット

```
✅ Phase 3 - アラビア語翻訳完了

【統計】
- 翻訳語数: 4,592/4,592
- 行数: 4,593行（ヘッダー+4,592単語）
- 空欄: 0件

【品質チェック】
- セミコロンルール違反: 0件
- 非名詞翻訳: 0件
- 冠詞付き翻訳: 0件
- 性別記号エラー: 0件

【サンプル確認】
- foster: {translation} ({gender}) - {meaning_translation}
- forth: {translation} ({gender}) - {meaning_translation}
- evil: {translation} ({gender}) - {meaning_translation}
```

---

**言語**: アラビア語  
**ファイル**: `data/translations_ar.csv`  
**品質基準**: セミコロンルール厳守、名詞のみ、行数維持  
**完了条件**: 全4,592語の翻訳完了、品質チェック合格
