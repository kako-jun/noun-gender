# `word_gender_translations.csv` レビュー Part 1 (A-F) [最終修正版]

【最終確定ルール】に基づき、`word_gender_translations.csv`のAからFの範囲をレビューしました。

1.  **品詞の確認:** 対象単語が名詞以外で使われていないか確認。
2.  **名詞用法の修正提案:** 名詞以外で使われている場合、`meaning_en`を参照し、名詞の例文に修正する案を第一に提示。
3.  **単数形の徹底:** 対象単語は必ず単数形。
4.  **その他の名詞:** 文中の他の名詞は複数形でも可。
5.  **品質の担保:** 例文は全体として自然で文法的に正しい。

---

### 指摘事項

#### カテゴリ1: 性別の誤り

- **Row 83: `agreement`**
  - **Language:** Hindi
  - **Original:** `समझौता`, `f`
  - **Issue:** `समझौता` (samjhautā) は男性名詞です。
  - **Suggestion:** `समझौता`, `m`

- **Row 93: `airport`**
  - **Language:** Hindi
  - **Original:** `हवाई अड्डा`, `f`
  - **Issue:** `अड्डा` (aḍḍā) は男性名詞です。
  - **Suggestion:** `हवाई अड्डा`, `m`

- **Row 115: `allowance`**
  - **Language:** Hindi
  - **Original:** `भत्ता`, `f`
  - **Issue:** `भत्ता` (bhattā) は男性名詞です。
  - **Suggestion:** `भत्ता`, `m`

- **Row 249: `arm`**
  - **Language:** Hindi
  - **Original:** `बाहु`, `m`
  - **Issue:** `बाहु` (bāhu) は男性名詞ですが、腕を指すより一般的な単語は `बाँह` (bānh) で、こちらは女性名詞です。
  - **Suggestion:** より一般的な `बाँह`, `f` への変更を推奨します。

#### カテゴリ2: 翻訳・タイプミスの誤り

- **Row 91: `airhead`**
  - **Language:** French
  - **Original:** `écervele`
  - **Issue:** タイプミスです。
  - **Suggestion:** `écervelé`

- **Row 149: `analogy`**
  - **Language:** Spanish
  - **Original:** `analoíga`
  - **Issue:** タイプミスです。
  - **Suggestion:** `analogía`

- **Row 211: `applicant`**
  - **Language:** French
  - **Original:** `canditat`
  - **Issue:** タイプミスです。
  - **Suggestion:** `candidat`

- **Row 214: `apprehension`**
  - **Language:** Spanish
  - **Original:** `aprensiva`
  - **Issue:** `aprensiva` は形容詞です。名詞は `aprensión` (f) です。
  - **Suggestion:** `aprensión`
  - **Language:** Italian
  - **Original:** `ppreensione`
  - **Issue:** タイプミスです。
  - **Suggestion:** `apprensione`

- **Row 217: `approval`**
  - **Language:** Spanish
  - **Original:** `aporobación`
  - **Issue:** タイプミスです。
  - **Suggestion:** `aprobación`

- **Row 538: `brutality`**
  - **Language:** Spanish, Italian, Portuguese
  - **Original:** `brutaliodad` (es), `brutalià` (it), `brutacidad` (pt)
  - **Issue:** 各言語でタイプミスがあります。
  - **Suggestion:** `brutalidad` (es), `brutalità` (it), `brutalidade` (pt)

- **Row 544: `build` (physique)**
  - **Language:** French, Spanish, Portuguese
  - **Original:** `corporature` (fr), `complexin` (es), `compleichao` (pt)
  - **Issue:** 翻訳が不適切またはタイプミスです。
  - **Suggestion:** `carrure` (fr, f), `complexión` (es, f), `compleição` (pt, f)

- **Row 861: `climax`**
  - **Language:** French, Italian
  - **Original:** `climateax`
  - **Issue:** 完全に無関係な単語です。
  - **Suggestion:** `climax` (両言語とも男性名詞 `m`)

- **Row 862: `climb`**
  - **Language:** French
  - **Original:** `monteé`
  - **Issue:** タイプミスです。
  - **Suggestion:** `montée`

- **Row 923: `commercial`**
  - **Language:** French
  - **Original:** `publicé`
  - **Issue:** タイプミスです。
  - **Suggestion:** `publicité`

- **Row 1049: `corruption`**
  - **Language:** Hindi
  - **Original:** `निष्टण`
  - **Issue:** 意味をなさない単語です。
  - **Suggestion:** `भ्रष्टाचार` (bhrashtāchār), `m`

- **Row 1057: `cottage`**
  - **Language:** French
  - **Original:** `chaumiere`
  - **Issue:** タイプミスです。
  - **Suggestion:** `chaumière`

- **Row 1148: `dynasty`**
  - **Language:** Spanish
  - **Original:** `dicastía`
  - **Issue:** タイプミスです。
  - **Suggestion:** `dinastía`

- **Row 1161: `electricity`**
  - **Language:** Spanish
  - **Original:** `electicidad`
  - **Issue:** タイプミスです。
  - **Suggestion:** `electricidad`

- **Row 1171: `employment`**
  - **Language:** German
  - **Original:** `Beschestrategytigung`
  - **Issue:** 意味をなさない単語です。
  - **Suggestion:** `Beschäftigung`, `f`

- **Row 1175: `enforcement`**
  - **Language:** Portuguese
  - **Original:** `aprivção`
  - **Issue:** タイプミスです。
  - **Suggestion:** `aplicação`

- **Row 1181: `entity`**
  - **Language:** Hindi
  - **Original:** `किया`, `f`
  - **Issue:** `किया` (kiyā) は動詞「する」の過去形です。名詞としては `अस्तित्व` (astitva) が適切です。
  - **Suggestion:** `अस्तित्व`, `m`

- **Row 1191: `eruption`**
  - **Language:** Spanish
  - **Original:** `rupción`
  - **Issue:** タイプミスです。
  - **Suggestion:** `erupción`

- **Row 1200: `evergreen`**
  - **Language:** French, German
  - **Original:** `à feuilles persistantes` (fr), `immergrn` (de)
  - **Issue:** フランス語は形容詞句、ドイツ語は形容詞のタイプミスです。
  - **Suggestion:** `conifère` (fr, m), `Immergrün` (de, n)

- **Row 1284: `force`**
  - **Language:** Hindi
  - **Original:** `लाल`, `m`
  - **Issue:** `लाल` (lāl) は「赤」を意味します。
  - **Suggestion:** `बल` (bal), `m`

---

以上がパート1のレビュー結果です。
