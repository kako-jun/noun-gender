# `word_gender_translations.csv` のレビューと修正案 (A-F)

`word_gender_translations.csv`のAからFの範囲について、翻訳と性別のレビューを行いました。以下に、修正が必要な点と修正案を記載します。

---

### 1. 性別の誤り

いくつかの単語で、指定された性別が正しくありませんでした。

- **Row 83: `agreement`**
  - **Language:** Hindi
  - **Original:** `समझौता`, `f`
  - **Issue:** `समझौता` (samjhauta) は男性名詞です。
  - **Suggestion:** `समझौता`, `m`

- **Row 93: `airport`**
  - **Language:** Hindi
  - **Original:** `हवाई अड्डा`, `f`
  - **Issue:** `अड्डा` (adda) は男性名詞です。
  - **Suggestion:** `हवाई अड्डा`, `m`

- **Row 115: `allowance`**
  - **Language:** Hindi
  - **Original:** `भत्ता`, `f`
  - **Issue:** `भत्ता` (bhatta) は男性名詞です。
  - **Suggestion:** `भत्ता`, `m`

- **Row 249: `arm`**
  - **Language:** Hindi
  - **Original:** `बाहु`, `f`
  - **Issue:** `बाहु` (bahu) は通常男性名詞として扱われます。女性形の `बाँह` (bānh) の方がより一般的です。
  - **Suggestion:** `बाँह`, `f` に変更するか、`बाहु`, `m` に修正。

- **Row 468: `bee`**
  - **Language:** Italian
  - **Original:** `ape`, `f`
  - **Issue:** `ape`は女性名詞ですが、単数形は `l'ape` となり、複数形が `le api` です。翻訳自体は正しいです。
  - **Suggestion:** 修正不要ですが、参考情報として記載します。

- **Row 1337: `cuddle`**
  - **Language:** Hindi
  - **Original:** `गले`, `f`
  - **Issue:** `गले` (gale) は「喉」や「抱擁」の文脈で使われますが、名詞「cuddle」の直接の翻訳としては不自然です。`आलिंगन` (ālingan) がより適切で、これは男性名詞です。
  - **Suggestion:** `आलिंगन`, `m`

### 2. 翻訳・タイプミスの誤り

翻訳の単語自体にタイプミスや不適切な選択が見られました。

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

- **Row 151: `anatomy`**
  - **Language:** Hindi
  - **Original:** `आनातॉमी`
  - **Issue:** 英語の音訳ですが、より一般的なヒンディー語は `शरीर रचना विज्ञान` (sharīr rachanā vigyān) で、これは男性名詞です。
  - **Suggestion:** `शरीर रचना विज्ञान`, `m`

- **Row 211: `applicant`**
  - **Language:** French
  - **Original:** `canditat`
  - **Issue:** タイプミスです。
  - **Suggestion:** `candidat`

- **Row 214: `apprehension`**
  - **Language:** Spanish
  - **Original:** `aprensiva`
  - **Issue:** `aprensiva` は形容詞です。名詞は `aprensión` です。
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

- **Row 544: `build` (physique)
  - **Language:** French, Spanish, Portuguese
  - **Original:** `corporature` (fr), `complexin` (es), `compleichao` (pt)
  - **Issue:** 翻訳が不適切またはタイプミスです。
  - **Suggestion:** `carrure` (fr), `complexión` (es), `compleição` (pt)

- **Row 861: `climax`**
  - **Language:** French, Italian
  - **Original:** `climateax`
  - **Issue:** 完全に無関係な単語です。
  - **Suggestion:** `climax` (両言語とも同じ単語です)

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
  - **Suggestion:** `Beschäftigung`

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
  - **Issue:** フランス語は名詞ではなく形容詞句です。ドイツ語は `immergrün` という形容詞のタイプミスです。
  - **Suggestion:** `plante à feuilles persistantes` (fr, f), `Immergrün` (de, n)

- **Row 1284: `force`**
  - **Language:** Hindi
  - **Original:** `लाल`, `m`
  - **Issue:** `लाल` (lāl) は「赤」を意味します。
  - **Suggestion:** `बल` (bal), `m`
