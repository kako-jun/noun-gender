# Stage 4: アラビア語意味翻訳タスク

## ⚠️ Stage 3 との違い（重要）

| 項目 | Stage 3 (word_gender_translations) | Stage 4 (word_meaning_translations) |
|------|-----------------------------------|-------------------------------------|
| **翻訳対象** | 最初の意味のみ | meaning_en全体 |
| **出力形式** | 名詞**1語** | **意味の説明**（単語+補足OK） |
| **セミコロン** | 最初の意味のみ抽出 | 全体翻訳（要約OK） |
| **例** | "manque" | "manque; absence de quelque chose" |

**重要な原則**:
- 英語の `meaning_en` は単語そのものを使えないため、長い説明文になっている
- 他言語では、**その言語にピッタリの単語があればそれを使うべき**
- 単語だけでもOK、単語+補足説明でもOK

**具体例**:
```
en: "abbey"
meaning_en: "a building occupied by monks or nuns" (長い説明)
→ meaning_ja: "修道院" または "修道院; 僧院が使用する建物" (どちらもOK)
→ meaning_fr: "abbaye" または "abbaye; bâtiment monastique" (どちらもOK)
```

---

## あなたの役割
あなたは**アラビア語の専門翻訳者**です。`data/word_meaning_translations.csv`の**meaning_ar列のみ**を翻訳してください。

## 重要：上書きモード
- 既存の翻訳は**すべて上書き**してください
- 空欄だけでなく、**既に翻訳がある行も再翻訳**します
- たまたま同じ訳になってもOKです

## タスク概要
- **ファイル**: `data/word_meaning_translations.csv`
- **総単語数**: 4,592語
- **担当列**: `meaning_ar`
- **作業範囲**: **全行（1行目〜4,592行目）**

---

## 必須ルール（厳格に遵守）

### 1. 翻訳対象
- `meaning_en`列の**全体**をアラビア語に翻訳
- セミコロンの数は一致不要（適切な要約OK）

### 2. 翻訳品質基準
✅ **必須**:
- **アラビア語にピッタリの単語があればそれを使う**
- 単語だけでもOK、単語+補足説明でもOK
- **名詞としての意味**を説明（動詞・形容詞の意味は禁止）
- アラビア語で自然で正確な表現
- 同一言語内での重複語を排除

**重要**: 
- 英語の `meaning_en` は長い説明文だが、これは英語が単語そのものを使えないため
- アラビア語では、**適切な単語があればそれを使うべき**
- 例: "修道院" > "僧院が使用する建物"（長い説明より単語を優先）

### 3. 重複語の排除
❌ 悪い例:
```
meaning_ar: "能力; 能力; 技能"  ← 「能力」が2回
```

✅ 良い例:
```
meaning_ar: "能力; 技能"  ← 重複削除
```

---

## 作業手順

### ステップ1: CSVファイルを読み込む
```python
import csv

with open('data/word_meaning_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    rows = list(reader)

print(f"総行数: {len(rows)}")
```

### ステップ2: 全4,592行を翻訳（上書きモード）
```python
import csv

# ファイルを読み込み
with open('data/word_meaning_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# 全行を翻訳（既存翻訳も上書き）
for i, row in enumerate(rows, start=1):
    en = row['en']
    meaning_en = row['meaning_en']
    
    # meaning_enの全体をアラビア語に翻訳
    translation = translate_meaning_to_ar(meaning_en)
    
    # 重複チェック
    if ';' in translation:
        parts = [p.strip() for p in translation.split(';')]
        # 重複削除
        unique_parts = []
        seen = set()
        for p in parts:
            if p.lower() not in seen:
                unique_parts.append(p)
                seen.add(p.lower())
        translation = '; '.join(unique_parts)
    
    # 上書き
    row['meaning_ar'] = translation
    
    # 進捗表示（100行ごと）
    if i % 100 == 0:
        print(f"進捗: {i}/{len(rows)} ({i/len(rows)*100:.1f}%)")

# ファイルを上書き保存
with open('data/word_meaning_translations.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ 翻訳完了: {len(rows)}行")
```

### ステップ3: 進捗を記録
```bash
mkdir -p .claude/workflow
echo "stage4-ar: 4592/4592 (100%)" > .claude/workflow/progress-stage4-ar.txt
echo "完了日時: $(date)" >> .claude/workflow/progress-stage4-ar.txt
```

### ステップ4: 変更をコミット
```bash
git add data/word_meaning_translations.csv .claude/workflow/progress-stage4-ar.txt
git commit -m "feat(stage4-ar): complete アラビア語 meaning translations for all 4592 words"
```

---

## 翻訳例（完全版）

### 例1: ピッタリの単語がある場合
```
入力:
  en: "abbey"
  meaning_en: "A building or buildings occupied by a community of monks or nuns."

処理:
  ステップ1: 英語は単語そのものを使えないため長い説明
  ステップ2: アラビア語に「修道院」のような適切な単語があるか確認
  ステップ3: あれば**その単語を使う**（補足説明は任意）

正解（日本語の例）:
  meaning_ja: "修道院"  ← シンプルに単語のみ（最も自然）
  または
  meaning_ja: "修道院; 僧院や尼僧院が使用する建物"  ← 補足付き（これもOK）

正解（フランス語の例）:
  meaning_fr: "abbaye"  ← シンプルに単語のみ
  または
  meaning_fr: "abbaye; bâtiment monastique"  ← 補足付き

不正解:
  ❌ meaning_ja: "僧院や尼僧院が使用する建物"  ← 「修道院」という単語を使わない（不自然）
  ❌ meaning_ja: "建てる" (動詞の意味にした)
```

### 例2: セミコロン付き（全体翻訳・適切な要約OK）
```
入力:
  en: "absence"
  meaning_en: "Lack; not being present; missing; vacancy."

処理:
  ステップ1: 4つの意味すべてを理解
    → "Lack" (欠如)
    → "not being present" (存在しないこと)
    → "missing" (不在)
    → "vacancy" (空席)
  
  ステップ2: アラビア語で最も自然な表現を選ぶ
    → ピッタリの単語があればそれを使う
    → 補足説明を追加してもOK

正解（日本語の例）:
  meaning_ja: "不在"  ← シンプルに単語のみ
  または
  meaning_ja: "不在; 欠如; 空席"  ← 複数の意味（これもOK）

正解（フランス語の例）:
  meaning_fr: "absence"  ← シンプルに単語のみ
  または
  meaning_fr: "absence; manque de quelque chose"  ← 補足付き

不正解:
  ❌ meaning_ja: "不在する" (動詞の意味)
  ❌ meaning_ja: "欠如; 欠如; 空席" (重複がある)
```

### 例3: ピッタリの単語がない場合
```
入力:
  en: "ability"
  meaning_en: "Capacity; capability; skill; ability to do something."

処理:
  ステップ1: 4つの意味を見る
    → "Capacity" (能力)
    → "capability" (能力)  ← "Capacity"と同じ
    → "skill" (技能)
    → "ability to do something" (何かをする能力)  ← "Capacity"と同じ
  
  ステップ2: 重複を削除
    → "Capacity" (能力)
    → "skill" (技能)
  
  ステップ3: アラビア語で表現
    → 「能力」「技能」という単語がある → 使う

正解（日本語の例）:
  meaning_ja: "能力; 技能"  ← シンプルに単語

正解（フランス語の例）:
  meaning_fr: "capacité; compétence"  ← シンプルに単語

不正解:
  ❌ meaning_ja: "能力; 能力; 技能" (重複がある)
  ❌ meaning_ja: "何かをする能力や技能の保有" (不自然に長い説明)
```

### 例4: 長い説明が必要な場合
```
入力:
  en: "abstract"
  meaning_en: "A summary of the contents of a book, article, or formal speech."

処理:
  ステップ1: 英語の説明文全体を理解
    → 「本、記事、または正式な演説の内容の要約」
  
  ステップ2: アラビア語に適切な単語があるか確認
    → 「要約」「抄録」「アブストラクト」など
  
  ステップ3: 最も自然な表現を選ぶ
    → 単語だけでOK、または補足説明を追加

正解（日本語の例）:
  meaning_ja: "要約"  ← シンプルに単語のみ（最も自然）
  または
  meaning_ja: "要約; 論文や演説の内容をまとめたもの"  ← 補足付き

正解（フランス語の例）:
  meaning_fr: "résumé"  ← シンプルに単語のみ
  または
  meaning_fr: "résumé; synthèse d'un texte"  ← 補足付き

不正解:
  ❌ meaning_ja: "抽象的な" (形容詞の意味)
  ❌ meaning_ja: "要約する" (動詞の意味)
```

---

## 成功基準

✅ 4,592行すべての`meaning_ar`が記入されている  
✅ **アラビア語に適切な単語があればそれを使っている**  
✅ すべて名詞の意味として翻訳されている（動詞・形容詞は禁止）  
✅ 同一言語内に重複語がない  
✅ タイプミス・アクセント記号の誤りゼロ  
✅ 自然で正確なアラビア語（英語の長い説明を無理に模倣していない）

---

## 禁止事項

❌ ピッタリの単語があるのに長い説明文にする（例: "修道院" があるのに "僧院が使用する建物" とだけ書く）  
❌ 動詞・形容詞の意味で翻訳  
❌ 同一言語内での重複語  
❌ 他の言語列を編集

---

## 完了報告

作業完了後、以下を報告してください：

1. ✅ 翻訳完了: 4,592/4,592行
2. ✅ 自然な表現チェック: 適切な単語を使用（英語の長い説明を無理に模倣していない）
3. ✅ 重複チェック: エラー0件
4. ✅ コミット完了
5. ✅ 進捗ファイル更新: `.claude/workflow/progress-stage4-ar.txt`

---

**言語**: アラビア語  
**担当列**: meaning_ar  
**品質基準**: 自然なアラビア語表現、名詞の意味、重複排除  
**完了条件**: 全4,592行の上書き翻訳完了
