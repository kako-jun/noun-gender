// D1 Database access for Server Components
import { getCloudflareContext } from '@opennextjs/cloudflare';

export type LanguageCode = 'ar' | 'fr' | 'de' | 'hi' | 'it' | 'pt' | 'ru' | 'es';

export interface Translation {
  id: number;
  word_id: number;
  language: string;
  translation: string;
  gender: 'm' | 'f' | 'n';
  memory_trick_en?: string;
  memory_trick_ja?: string;
  memory_trick_zh?: string;
  memory_trick_fr?: string;
  memory_trick_de?: string;
  memory_trick_es?: string;
  memory_trick_it?: string;
  memory_trick_pt?: string;
  memory_trick_ru?: string;
  memory_trick_ar?: string;
  memory_trick_hi?: string;
}

export interface WordData {
  english: string;
  meaning_en?: string;
  meanings?: Record<string, string>;
  translations: Translation[];
  example?: {
    example_en: string;
    example_translations?: Record<string, string>;
  };
}

function getDB(): D1Database {
  const { env } = getCloudflareContext();
  return env.DB;
}

// 言語コードのリスト
const ALL_LANGUAGES = ['ar', 'fr', 'de', 'hi', 'it', 'pt', 'ru', 'es'] as const;

// 翻訳があるすべての英単語を取得
async function getAllEnglishWordsWithTranslations(db: D1Database): Promise<string[]> {
  const wordSet = new Set<string>();

  for (const lang of ALL_LANGUAGES) {
    const { results } = await db
      .prepare(
        `SELECT DISTINCT we.en
         FROM words_en we
         JOIN words_${lang} t ON we.en = t.en
         WHERE t.translation IS NOT NULL AND t.translation != ''`
      )
      .all();
    for (const row of results as { en: string }[]) {
      wordSet.add(row.en);
    }
  }

  return Array.from(wordSet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

export async function getWord(word: string): Promise<WordData | null> {
  const db = getDB();

  // 1. 単語の意味を取得
  const meaning = await db
    .prepare(
      `SELECT wm.*, ex.example_en
       FROM word_meanings wm
       LEFT JOIN examples ex ON wm.en = ex.en
       WHERE LOWER(wm.en) = LOWER(?)`
    )
    .bind(word)
    .first<Record<string, unknown>>();

  // 単語が存在しない場合はwords_enも確認
  let englishWord = word;
  if (!meaning) {
    const wordEn = await db
      .prepare('SELECT en FROM words_en WHERE LOWER(en) = LOWER(?)')
      .bind(word)
      .first<{ en: string }>();
    if (!wordEn) return null;
    englishWord = wordEn.en;
  } else {
    englishWord = meaning.en as string;
  }

  // 2. 各言語テーブルから翻訳を取得
  const translations: Translation[] = [];
  for (const lang of ALL_LANGUAGES) {
    const result = await db
      .prepare(
        `SELECT t.translation, t.gender
         FROM words_${lang} t
         WHERE LOWER(t.en) = LOWER(?)
           AND t.translation IS NOT NULL AND t.translation != ''`
      )
      .bind(englishWord)
      .first<{ translation: string; gender: string }>();

    if (result && result.translation && ['m', 'f', 'n'].includes(result.gender)) {
      // memory tricksを取得
      const { results: tricks } = await db
        .prepare(
          `SELECT ui_lang, trick_text FROM memory_tricks
           WHERE en = ? AND translation_lang = ?`
        )
        .bind(englishWord, lang)
        .all();

      const trickMap: Record<string, string> = {};
      for (const t of tricks as { ui_lang: string; trick_text: string }[]) {
        trickMap[`memory_trick_${t.ui_lang}`] = t.trick_text;
      }

      translations.push({
        id: 0,
        word_id: 0,
        language: lang,
        translation: result.translation,
        gender: result.gender as 'm' | 'f' | 'n',
        memory_trick_en: trickMap.memory_trick_en,
        memory_trick_ja: trickMap.memory_trick_ja,
        memory_trick_zh: trickMap.memory_trick_zh,
        memory_trick_fr: trickMap.memory_trick_fr,
        memory_trick_de: trickMap.memory_trick_de,
        memory_trick_es: trickMap.memory_trick_es,
        memory_trick_it: trickMap.memory_trick_it,
        memory_trick_pt: trickMap.memory_trick_pt,
        memory_trick_ru: trickMap.memory_trick_ru,
        memory_trick_ar: trickMap.memory_trick_ar,
        memory_trick_hi: trickMap.memory_trick_hi,
      });
    }
  }

  if (translations.length === 0) return null;

  // 3. WordDataを構築
  const wordData: WordData = {
    english: englishWord,
    meaning_en: meaning?.meaning_en as string | undefined,
    meanings: meaning
      ? Object.fromEntries(
          Object.entries({
            en: meaning.meaning_en,
            ja: meaning.meaning_ja,
            zh: meaning.meaning_zh,
            fr: meaning.meaning_fr,
            de: meaning.meaning_de,
            es: meaning.meaning_es,
            it: meaning.meaning_it,
            pt: meaning.meaning_pt,
            ru: meaning.meaning_ru,
            ar: meaning.meaning_ar,
            hi: meaning.meaning_hi,
          }).filter(([, value]) => value != null && value !== '') as [string, string][]
        )
      : {},
    translations,
    example: meaning?.example_en
      ? { example_en: meaning.example_en as string, example_translations: {} }
      : undefined,
  };

  // 4. 例文翻訳を取得
  if (wordData.example?.example_en) {
    const { results: exampleTranslations } = await db
      .prepare('SELECT lang, translation FROM example_translations WHERE example_en = ?')
      .bind(wordData.example.example_en)
      .all();

    for (const et of exampleTranslations as { lang: string; translation: string }[]) {
      wordData.example.example_translations![et.lang] = et.translation;
    }
  }

  return wordData;
}

export async function getAllWords(): Promise<string[]> {
  const db = getDB();
  return getAllEnglishWordsWithTranslations(db);
}

export interface SearchResult {
  word: {
    id: number;
    word_en: string;
    meaning_en?: string;
    meanings?: Record<string, string>;
  };
  translations: Translation[];
  example?: {
    example_en: string;
    example_translations?: Record<string, string>;
  };
}

export interface BrowseResult {
  english: string;
  meaning_en?: string;
  meanings?: Record<string, string>;
  translations: Translation[];
  example?: {
    example_en: string;
    example_translations?: Record<string, string>;
  };
}

export interface LetterStat {
  letter: string;
  count: number;
}

export async function getStats(): Promise<{
  totalWords: number;
  totalTranslations: number;
  multilingualTerms: number;
  searchLanguages: number;
  languageStats: { language: string; count: number }[];
}> {
  const db = getDB();

  // 各言語テーブルから統計を個別に取得
  const languageStats: { language: string; count: number }[] = [];
  const wordSets: Set<string>[] = [];
  let totalTranslations = 0;

  for (const lang of ALL_LANGUAGES) {
    const result = await db
      .prepare(
        `SELECT COUNT(*) as count FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''`
      )
      .first<{ count: number }>();
    const count = result?.count ?? 0;
    if (count > 0) {
      languageStats.push({ language: lang, count });
    }
    totalTranslations += count;

    // ユニークな英単語を収集
    const { results } = await db
      .prepare(
        `SELECT DISTINCT en FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''`
      )
      .all();
    const wordSet = new Set((results as { en: string }[]).map((r) => r.en));
    wordSets.push(wordSet);
  }

  // 全言語でユニークな英単語数
  const allWords = new Set<string>();
  for (const wordSet of wordSets) {
    for (const word of wordSet) {
      allWords.add(word);
    }
  }

  // 検索用語数 = 翻訳数 + 英単語数
  const englishWordsCount = await db
    .prepare('SELECT COUNT(*) as count FROM words_en')
    .first<{ count: number }>();
  const multilingualTerms = totalTranslations + (englishWordsCount?.count ?? 0);

  // 言語別統計をカウント降順でソート
  languageStats.sort((a, b) => b.count - a.count);

  return {
    totalWords: allWords.size,
    totalTranslations,
    multilingualTerms,
    searchLanguages: languageStats.length + 1, // +1 for English
    languageStats,
  };
}

export async function search(
  query: string,
  languages: LanguageCode[],
  limit: number
): Promise<SearchResult[]> {
  const db = getDB();

  if (languages.length === 0) {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;
  const exactTerm = query.toLowerCase();

  // 1. 検索条件に一致する英単語と翻訳を各言語テーブルから収集
  interface RawMatch {
    en: string;
    lang: string;
    translation: string;
    gender: string;
    matchType: number; // 1=exact en, 2=exact translation, 3=starts with en, 4=starts with translation, 5=contains
  }
  const rawMatches: RawMatch[] = [];

  // 英単語での検索（全テーブル共通のwords_enから）
  const { results: enMatches } = await db
    .prepare(
      `SELECT en FROM words_en WHERE LOWER(en) LIKE ?`
    )
    .bind(searchTerm)
    .all();
  const matchedEnWords = new Set((enMatches as { en: string }[]).map((r) => r.en));

  // 各言語テーブルから翻訳を取得
  for (const lang of languages) {
    // 翻訳での検索
    const { results: translationMatches } = await db
      .prepare(
        `SELECT en, translation, gender FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''
         AND (LOWER(translation) LIKE ? OR en IN (SELECT en FROM words_en WHERE LOWER(en) LIKE ?))`
      )
      .bind(searchTerm, searchTerm)
      .all();

    for (const row of translationMatches as { en: string; translation: string; gender: string }[]) {
      let matchType = 5;
      const enLower = row.en.toLowerCase();
      const transLower = row.translation.toLowerCase();

      if (enLower === exactTerm) matchType = 1;
      else if (transLower === exactTerm) matchType = 2;
      else if (enLower.length <= 4 && enLower.startsWith(exactTerm)) matchType = 2.5;
      else if (enLower.startsWith(exactTerm)) matchType = 3;
      else if (transLower.startsWith(exactTerm)) matchType = 4;

      rawMatches.push({
        en: row.en,
        lang,
        translation: row.translation,
        gender: row.gender,
        matchType,
      });
      matchedEnWords.add(row.en);
    }
  }

  // 2. ユニークな英単語を取得してソート
  const uniqueWords = Array.from(matchedEnWords);
  // matchTypeの最小値でソート（優先度が高いものが先）
  const wordPriority = new Map<string, number>();
  for (const match of rawMatches) {
    const current = wordPriority.get(match.en) ?? 999;
    if (match.matchType < current) {
      wordPriority.set(match.en, match.matchType);
    }
  }
  uniqueWords.sort((a, b) => {
    const pa = wordPriority.get(a) ?? 999;
    const pb = wordPriority.get(b) ?? 999;
    if (pa !== pb) return pa - pb;
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  });

  // limitを適用
  const limitedWords = uniqueWords.slice(0, limit);

  if (limitedWords.length === 0) {
    return [];
  }

  // 3. 選ばれた単語の詳細情報を取得
  const placeholders = limitedWords.map(() => '?').join(',');

  // 意味と例文を取得
  const { results: meaningRows } = await db
    .prepare(
      `SELECT wm.*, ex.example_en
       FROM word_meanings wm
       LEFT JOIN examples ex ON wm.en = ex.en
       WHERE wm.en IN (${placeholders})`
    )
    .bind(...limitedWords)
    .all();

  const meaningMap = new Map<string, Record<string, unknown>>();
  for (const row of meaningRows as Record<string, unknown>[]) {
    meaningMap.set(row.en as string, row);
  }

  // 4. 結果を構築
  const grouped = new Map<string, SearchResult>();

  for (const word of limitedWords) {
    const meaning = meaningMap.get(word);
    grouped.set(word, {
      word: {
        id: 0,
        word_en: word,
        meaning_en: meaning?.meaning_en as string | undefined,
        meanings: meaning
          ? Object.fromEntries(
              Object.entries({
                en: meaning.meaning_en,
                ja: meaning.meaning_ja,
                zh: meaning.meaning_zh,
                fr: meaning.meaning_fr,
                de: meaning.meaning_de,
                es: meaning.meaning_es,
                it: meaning.meaning_it,
                pt: meaning.meaning_pt,
                ru: meaning.meaning_ru,
                ar: meaning.meaning_ar,
                hi: meaning.meaning_hi,
              }).filter(([, value]) => value != null && value !== '') as [string, string][]
            )
          : {},
      },
      translations: [],
      example: meaning?.example_en
        ? { example_en: meaning.example_en as string, example_translations: {} }
        : undefined,
    });
  }

  // 5. 各言語の翻訳を取得（バッチ処理）
  const allTranslations: { en: string; lang: string; translation: string; gender: string }[] = [];

  for (const lang of languages) {
    const { results: transRows } = await db
      .prepare(
        `SELECT t.en, t.translation, t.gender
         FROM words_${lang} t
         WHERE t.en IN (${placeholders})
         AND t.translation IS NOT NULL AND t.translation != ''`
      )
      .bind(...limitedWords)
      .all();

    for (const row of transRows as { en: string; translation: string; gender: string }[]) {
      if (row.translation && ['m', 'f', 'n'].includes(row.gender)) {
        allTranslations.push({ en: row.en, lang, translation: row.translation, gender: row.gender });
      }
    }
  }

  // 5.5. memory tricksを一括取得（N+1問題を解消）
  const { results: allTricks } = await db
    .prepare(
      `SELECT en, translation_lang, ui_lang, trick_text FROM memory_tricks
       WHERE en IN (${placeholders})`
    )
    .bind(...limitedWords)
    .all();

  const tricksMap = new Map<string, Record<string, string>>();
  for (const t of allTricks as { en: string; translation_lang: string; ui_lang: string; trick_text: string }[]) {
    const key = `${t.en}:${t.translation_lang}`;
    if (!tricksMap.has(key)) {
      tricksMap.set(key, {});
    }
    tricksMap.get(key)![`memory_trick_${t.ui_lang}`] = t.trick_text;
  }

  // 5.6. 翻訳データを結果に追加
  for (const trans of allTranslations) {
    const result = grouped.get(trans.en);
    if (result) {
      const trickMap = tricksMap.get(`${trans.en}:${trans.lang}`) || {};
      result.translations.push({
        id: 0,
        word_id: 0,
        language: trans.lang,
        translation: trans.translation,
        gender: trans.gender as 'm' | 'f' | 'n',
        memory_trick_en: trickMap.memory_trick_en,
        memory_trick_ja: trickMap.memory_trick_ja,
        memory_trick_zh: trickMap.memory_trick_zh,
        memory_trick_fr: trickMap.memory_trick_fr,
        memory_trick_de: trickMap.memory_trick_de,
        memory_trick_es: trickMap.memory_trick_es,
        memory_trick_it: trickMap.memory_trick_it,
        memory_trick_pt: trickMap.memory_trick_pt,
        memory_trick_ru: trickMap.memory_trick_ru,
        memory_trick_ar: trickMap.memory_trick_ar,
        memory_trick_hi: trickMap.memory_trick_hi,
      });
    }
  }

  // 6. 例文翻訳を取得
  const wordsWithExamples = Array.from(grouped.values()).filter((w) => w.example?.example_en);
  if (wordsWithExamples.length > 0) {
    const exampleTexts = wordsWithExamples.map((w) => w.example!.example_en);
    const examplePlaceholders = exampleTexts.map(() => '?').join(',');

    const { results: exampleTranslations } = await db
      .prepare(`SELECT example_en, lang, translation FROM example_translations WHERE example_en IN (${examplePlaceholders})`)
      .bind(...exampleTexts)
      .all();

    for (const et of exampleTranslations as { example_en: string; lang: string; translation: string }[]) {
      for (const word of wordsWithExamples) {
        if (word.example?.example_en === et.example_en) {
          word.example.example_translations![et.lang] = et.translation;
        }
      }
    }
  }

  return Array.from(grouped.values()).filter((word) => word.translations.length > 0);
}

export async function browseWords(options: {
  limit?: number;
  offset?: number;
  language?: string;
  startsWith?: string;
} = {}): Promise<BrowseResult[]> {
  const db = getDB();
  const { limit = 50, offset = 0, language, startsWith } = options;
  const targetLangs = language ? [language] : ALL_LANGUAGES;

  // 1. words_enから直接ページネーション（高速化）
  let wordQuery = `SELECT en FROM words_en`;
  const params: (string | number)[] = [];

  if (startsWith) {
    wordQuery += ` WHERE LOWER(en) LIKE ?`;
    params.push(`${startsWith.toLowerCase()}%`);
  }

  wordQuery += ` ORDER BY LOWER(en) LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const { results: wordRows } = await db.prepare(wordQuery).bind(...params).all();
  const englishList = (wordRows as { en: string }[]).map((r) => r.en);

  if (englishList.length === 0) {
    return [];
  }

  const placeholders = englishList.map(() => '?').join(',');

  // 3. 意味・翻訳・memory tricksを一括取得（db.batch使用）
  const batchQueries = [
    // 意味と例文
    db.prepare(
      `SELECT wm.*, ex.example_en
       FROM word_meanings wm
       LEFT JOIN examples ex ON wm.en = ex.en
       WHERE wm.en IN (${placeholders})`
    ).bind(...englishList),
    // memory tricks
    db.prepare(
      `SELECT en, translation_lang, ui_lang, trick_text FROM memory_tricks
       WHERE en IN (${placeholders})`
    ).bind(...englishList),
    // 各言語の翻訳
    ...targetLangs.map((lang) =>
      db.prepare(
        `SELECT '${lang}' as lang, t.en, t.translation, t.gender
         FROM words_${lang} t
         WHERE t.en IN (${placeholders})
         AND t.translation IS NOT NULL AND t.translation != ''`
      ).bind(...englishList)
    ),
  ];

  const batchResults = await db.batch(batchQueries);

  // 4. 結果を解析
  const meaningRows = batchResults[0].results as Record<string, unknown>[];
  const trickRows = batchResults[1].results as { en: string; translation_lang: string; ui_lang: string; trick_text: string }[];

  const meaningMap = new Map<string, Record<string, unknown>>();
  for (const row of meaningRows) {
    meaningMap.set(row.en as string, row);
  }

  const tricksMap = new Map<string, Record<string, string>>();
  for (const t of trickRows) {
    const key = `${t.en}:${t.translation_lang}`;
    if (!tricksMap.has(key)) {
      tricksMap.set(key, {});
    }
    tricksMap.get(key)![`memory_trick_${t.ui_lang}`] = t.trick_text;
  }

  // 5. 結果を構築
  const grouped = new Map<string, BrowseResult>();

  for (const word of englishList) {
    const meaning = meaningMap.get(word);
    grouped.set(word, {
      english: word,
      meaning_en: meaning?.meaning_en as string | undefined,
      meanings: meaning
        ? Object.fromEntries(
            Object.entries({
              en: meaning.meaning_en,
              ja: meaning.meaning_ja,
              zh: meaning.meaning_zh,
              fr: meaning.meaning_fr,
              de: meaning.meaning_de,
              es: meaning.meaning_es,
              it: meaning.meaning_it,
              pt: meaning.meaning_pt,
              ru: meaning.meaning_ru,
              ar: meaning.meaning_ar,
              hi: meaning.meaning_hi,
            }).filter(([, value]) => value != null && value !== '') as [string, string][]
          )
        : {},
      translations: [],
      example: meaning?.example_en
        ? { example_en: meaning.example_en as string, example_translations: {} }
        : undefined,
    });
  }

  // 6. 翻訳データを結果に追加
  for (let i = 0; i < targetLangs.length; i++) {
    const transRows = batchResults[2 + i].results as { lang: string; en: string; translation: string; gender: string }[];
    for (const row of transRows) {
      const result = grouped.get(row.en);
      if (result && row.translation && ['m', 'f', 'n'].includes(row.gender)) {
        const trickMap = tricksMap.get(`${row.en}:${row.lang}`) || {};
        result.translations.push({
          id: 0,
          word_id: 0,
          language: row.lang,
          translation: row.translation,
          gender: row.gender as 'm' | 'f' | 'n',
          memory_trick_en: trickMap.memory_trick_en,
          memory_trick_ja: trickMap.memory_trick_ja,
          memory_trick_zh: trickMap.memory_trick_zh,
          memory_trick_fr: trickMap.memory_trick_fr,
          memory_trick_de: trickMap.memory_trick_de,
          memory_trick_es: trickMap.memory_trick_es,
          memory_trick_it: trickMap.memory_trick_it,
          memory_trick_pt: trickMap.memory_trick_pt,
          memory_trick_ru: trickMap.memory_trick_ru,
          memory_trick_ar: trickMap.memory_trick_ar,
          memory_trick_hi: trickMap.memory_trick_hi,
        });
      }
    }
  }

  // 8. 結果をフィルタリング
  const finalResults = englishList
    .map((en) => grouped.get(en))
    .filter((word): word is BrowseResult => word !== undefined && word.translations.length > 0);

  // 9. 例文翻訳を取得
  const wordsWithExamples = finalResults.filter((word) => word.example?.example_en);

  if (wordsWithExamples.length > 0) {
    const exampleTexts = wordsWithExamples.map((w) => w.example!.example_en);
    const examplePlaceholders = exampleTexts.map(() => '?').join(',');

    const { results: exampleTranslations } = await db
      .prepare(`SELECT example_en, lang, translation FROM example_translations WHERE example_en IN (${examplePlaceholders})`)
      .bind(...exampleTexts)
      .all();

    for (const et of exampleTranslations as { example_en: string; lang: string; translation: string }[]) {
      for (const word of wordsWithExamples) {
        if (word.example?.example_en === et.example_en) {
          word.example.example_translations![et.lang] = et.translation;
        }
      }
    }
  }

  return finalResults;
}

export async function getLetterStats(): Promise<LetterStat[]> {
  const db = getDB();

  // 各言語テーブルから翻訳がある英単語を収集
  const wordSet = new Set<string>();

  for (const lang of ALL_LANGUAGES) {
    const { results } = await db
      .prepare(
        `SELECT DISTINCT en FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''`
      )
      .all();
    for (const row of results as { en: string }[]) {
      wordSet.add(row.en);
    }
  }

  // アルファベットごとにカウント
  const letterCounts = new Map<string, number>();
  for (const word of wordSet) {
    const letter = word.charAt(0).toLowerCase();
    if (letter >= 'a' && letter <= 'z') {
      letterCounts.set(letter, (letterCounts.get(letter) ?? 0) + 1);
    }
  }

  // ソートして返却
  return Array.from(letterCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([letter, count]) => ({ letter, count }));
}

export async function getLetterStatsDetailed(prefix: string): Promise<{ next_letter: string; count: number }[]> {
  const db = getDB();
  const prefixLower = prefix.toLowerCase();
  const prefixLength = prefix.length;

  // 各言語テーブルから翻訳がある英単語を収集
  const wordSet = new Set<string>();

  for (const lang of ALL_LANGUAGES) {
    const { results } = await db
      .prepare(
        `SELECT DISTINCT en FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''
         AND LOWER(en) LIKE ?`
      )
      .bind(`${prefixLower}%`)
      .all();
    for (const row of results as { en: string }[]) {
      wordSet.add(row.en);
    }
  }

  // 次の文字ごとにカウント
  const letterCounts = new Map<string, number>();
  for (const word of wordSet) {
    if (word.length > prefixLength) {
      const nextLetter = word.charAt(prefixLength).toLowerCase();
      if (nextLetter >= 'a' && nextLetter <= 'z') {
        letterCounts.set(nextLetter, (letterCounts.get(nextLetter) ?? 0) + 1);
      }
    }
  }

  // ソートして返却
  return Array.from(letterCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([next_letter, count]) => ({ next_letter, count }));
}

export async function getWordAtOffset(prefix: string, offset: number): Promise<string | null> {
  const db = getDB();

  // 各言語テーブルから翻訳がある英単語を収集
  const wordSet = new Set<string>();

  for (const lang of ALL_LANGUAGES) {
    const { results } = await db
      .prepare(
        `SELECT DISTINCT en FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''
         AND en LIKE ?`
      )
      .bind(`${prefix}%`)
      .all();
    for (const row of results as { en: string }[]) {
      wordSet.add(row.en);
    }
  }

  // ソートしてoffset番目を返却
  const sortedWords = Array.from(wordSet).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  return sortedWords[offset] ?? null;
}

export async function getWordRange(prefix: string): Promise<{ firstWord?: string; lastWord?: string; totalCount: number }> {
  const db = getDB();

  // 各言語テーブルから翻訳がある英単語を収集
  const wordSet = new Set<string>();

  for (const lang of ALL_LANGUAGES) {
    const { results } = await db
      .prepare(
        `SELECT DISTINCT en FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''
         AND en LIKE ?`
      )
      .bind(`${prefix}%`)
      .all();
    for (const row of results as { en: string }[]) {
      wordSet.add(row.en);
    }
  }

  // ソートして最初と最後を取得
  const sortedWords = Array.from(wordSet).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  return {
    firstWord: sortedWords[0],
    lastWord: sortedWords[sortedWords.length - 1],
    totalCount: sortedWords.length,
  };
}

export async function getQuizQuestions(
  languages: string[],
  count: number
): Promise<{ english: string; translation: string; language: string; gender: string }[]> {
  const db = getDB();

  // 各言語テーブルから候補を収集
  const allCandidates: { english: string; translation: string; language: string; gender: string }[] = [];

  for (const lang of languages) {
    if (!ALL_LANGUAGES.includes(lang as (typeof ALL_LANGUAGES)[number])) continue;

    const { results } = await db
      .prepare(
        `SELECT en as english, translation, gender
         FROM words_${lang}
         WHERE translation IS NOT NULL AND translation != ''
         AND gender IN ('m', 'f', 'n')`
      )
      .all();

    for (const row of results as { english: string; translation: string; gender: string }[]) {
      allCandidates.push({
        english: row.english,
        translation: row.translation,
        language: lang,
        gender: row.gender,
      });
    }
  }

  // シャッフルしてcount個を返却
  for (let i = allCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCandidates[i], allCandidates[j]] = [allCandidates[j], allCandidates[i]];
  }

  return allCandidates.slice(0, count);
}

export async function getMemoryTricksForWord(
  word: string,
  uiLanguage: string
): Promise<Record<string, string>> {
  const db = getDB();

  const { results } = await db
    .prepare(
      `SELECT translation_lang, trick_text
       FROM memory_tricks
       WHERE en = ? AND ui_lang = ?`
    )
    .bind(word, uiLanguage)
    .all();

  const tricks: Record<string, string> = {};
  for (const row of results as { translation_lang: string; trick_text: string }[]) {
    tricks[row.translation_lang] = row.trick_text;
  }
  return tricks;
}
