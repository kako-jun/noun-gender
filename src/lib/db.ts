// D1 Database access for Server Components
import { getRequestContext } from '@cloudflare/next-on-pages';

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
  const ctx = getRequestContext();
  return ctx.env.DB;
}

export async function getWord(word: string): Promise<WordData | null> {
  const db = getDB();

  const sql = `
    SELECT vat.en, vat.lang, vat.translation, vat.gender,
           wm.meaning_en, wm.meaning_ja, wm.meaning_zh, wm.meaning_fr, wm.meaning_de, wm.meaning_es, wm.meaning_it, wm.meaning_pt, wm.meaning_ru, wm.meaning_ar, wm.meaning_hi,
           ex.example_en,
           mt_en.trick_text as memory_trick_en,
           mt_ja.trick_text as memory_trick_ja,
           mt_zh.trick_text as memory_trick_zh,
           mt_fr.trick_text as memory_trick_fr,
           mt_de.trick_text as memory_trick_de,
           mt_es.trick_text as memory_trick_es,
           mt_it.trick_text as memory_trick_it,
           mt_pt.trick_text as memory_trick_pt,
           mt_ru.trick_text as memory_trick_ru,
           mt_ar.trick_text as memory_trick_ar,
           mt_hi.trick_text as memory_trick_hi
    FROM v_all_translations vat
    LEFT JOIN word_meanings wm ON vat.en = wm.en
    LEFT JOIN examples ex ON vat.en = ex.en
    LEFT JOIN memory_tricks mt_en ON vat.en = mt_en.en AND vat.lang = mt_en.translation_lang AND mt_en.ui_lang = 'en'
    LEFT JOIN memory_tricks mt_ja ON vat.en = mt_ja.en AND vat.lang = mt_ja.translation_lang AND mt_ja.ui_lang = 'ja'
    LEFT JOIN memory_tricks mt_zh ON vat.en = mt_zh.en AND vat.lang = mt_zh.translation_lang AND mt_zh.ui_lang = 'zh'
    LEFT JOIN memory_tricks mt_fr ON vat.en = mt_fr.en AND vat.lang = mt_fr.translation_lang AND mt_fr.ui_lang = 'fr'
    LEFT JOIN memory_tricks mt_de ON vat.en = mt_de.en AND vat.lang = mt_de.translation_lang AND mt_de.ui_lang = 'de'
    LEFT JOIN memory_tricks mt_es ON vat.en = mt_es.en AND vat.lang = mt_es.translation_lang AND mt_es.ui_lang = 'es'
    LEFT JOIN memory_tricks mt_it ON vat.en = mt_it.en AND vat.lang = mt_it.translation_lang AND mt_it.ui_lang = 'it'
    LEFT JOIN memory_tricks mt_pt ON vat.en = mt_pt.en AND vat.lang = mt_pt.translation_lang AND mt_pt.ui_lang = 'pt'
    LEFT JOIN memory_tricks mt_ru ON vat.en = mt_ru.en AND vat.lang = mt_ru.translation_lang AND mt_ru.ui_lang = 'ru'
    LEFT JOIN memory_tricks mt_ar ON vat.en = mt_ar.en AND vat.lang = mt_ar.translation_lang AND mt_ar.ui_lang = 'ar'
    LEFT JOIN memory_tricks mt_hi ON vat.en = mt_hi.en AND vat.lang = mt_hi.translation_lang AND mt_hi.ui_lang = 'hi'
    WHERE LOWER(vat.en) = LOWER(?)
      AND vat.translation IS NOT NULL AND vat.translation != ''
    ORDER BY vat.lang
  `;

  const { results } = await db.prepare(sql).bind(word).all();

  if (results.length === 0) {
    return null;
  }

  const firstRow = results[0] as Record<string, unknown>;

  const wordData: WordData = {
    english: firstRow.en as string,
    meaning_en: firstRow.meaning_en as string | undefined,
    meanings: Object.fromEntries(
      Object.entries({
        en: firstRow.meaning_en,
        ja: firstRow.meaning_ja,
        zh: firstRow.meaning_zh,
        fr: firstRow.meaning_fr,
        de: firstRow.meaning_de,
        es: firstRow.meaning_es,
        it: firstRow.meaning_it,
        pt: firstRow.meaning_pt,
        ru: firstRow.meaning_ru,
        ar: firstRow.meaning_ar,
        hi: firstRow.meaning_hi,
      }).filter(([, value]) => value != null && value !== '') as [string, string][]
    ),
    translations: [],
    example: firstRow.example_en
      ? { example_en: firstRow.example_en as string, example_translations: {} }
      : undefined,
  };

  for (const row of results as Record<string, unknown>[]) {
    if (row.translation && (row.translation as string).trim() !== '' && row.gender && ['m', 'f', 'n'].includes(row.gender as string)) {
      wordData.translations.push({
        id: 0,
        word_id: 0,
        language: row.lang as string,
        translation: row.translation as string,
        gender: row.gender as 'm' | 'f' | 'n',
        memory_trick_en: row.memory_trick_en as string | undefined,
        memory_trick_ja: row.memory_trick_ja as string | undefined,
        memory_trick_zh: row.memory_trick_zh as string | undefined,
        memory_trick_fr: row.memory_trick_fr as string | undefined,
        memory_trick_de: row.memory_trick_de as string | undefined,
        memory_trick_es: row.memory_trick_es as string | undefined,
        memory_trick_it: row.memory_trick_it as string | undefined,
        memory_trick_pt: row.memory_trick_pt as string | undefined,
        memory_trick_ru: row.memory_trick_ru as string | undefined,
        memory_trick_ar: row.memory_trick_ar as string | undefined,
        memory_trick_hi: row.memory_trick_hi as string | undefined,
      });
    }
  }

  // Get example translations if example exists
  if (wordData.example?.example_en) {
    const { results: exampleTranslations } = await db
      .prepare('SELECT lang, translation FROM example_translations WHERE example_en = ?')
      .bind(wordData.example.example_en)
      .all();

    for (const et of exampleTranslations as { lang: string; translation: string }[]) {
      wordData.example.example_translations![et.lang] = et.translation;
    }
  }

  return wordData.translations.length > 0 ? wordData : null;
}

export async function getAllWords(): Promise<string[]> {
  const db = getDB();

  const { results } = await db
    .prepare(
      `SELECT DISTINCT en FROM v_all_translations
       WHERE translation IS NOT NULL AND translation != ''
       ORDER BY LOWER(en)`
    )
    .all();

  return (results as { en: string }[]).map((row) => row.en);
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

  const [totalWords, totalTranslations, multilingualTerms, searchLanguages, languageStats] = await Promise.all([
    db.prepare('SELECT COUNT(DISTINCT en) as total FROM v_all_translations').first<{ total: number }>(),
    db.prepare('SELECT COUNT(*) as total FROM v_all_translations').first<{ total: number }>(),
    db.prepare('SELECT COUNT(*) as total FROM v_multilingual_search').first<{ total: number }>(),
    db.prepare('SELECT COUNT(DISTINCT lang) as total FROM v_multilingual_search').first<{ total: number }>(),
    db.prepare(
      `SELECT lang as language, COUNT(*) as count
       FROM v_all_translations
       GROUP BY lang
       ORDER BY count DESC`
    ).all(),
  ]);

  return {
    totalWords: totalWords?.total ?? 0,
    totalTranslations: totalTranslations?.total ?? 0,
    multilingualTerms: multilingualTerms?.total ?? 0,
    searchLanguages: searchLanguages?.total ?? 0,
    languageStats: languageStats.results as { language: string; count: number }[],
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

  const langPlaceholders = languages.map(() => '?').join(',');
  const searchTerm = `%${query}%`;
  const exactTerm = query;
  const startsWith = `${query}%`;

  const d1Sql = `
    SELECT DISTINCT vat.en, vat.translation, vat.lang, vat.gender,
           wm.meaning_en, wm.meaning_ja, wm.meaning_zh, wm.meaning_fr, wm.meaning_de, wm.meaning_es, wm.meaning_it, wm.meaning_pt, wm.meaning_ru, wm.meaning_ar, wm.meaning_hi,
           ex.example_en,
           mt_en.trick_text as memory_trick_en,
           mt_ja.trick_text as memory_trick_ja,
           mt_zh.trick_text as memory_trick_zh,
           mt_fr.trick_text as memory_trick_fr,
           mt_de.trick_text as memory_trick_de,
           mt_es.trick_text as memory_trick_es,
           mt_it.trick_text as memory_trick_it,
           mt_pt.trick_text as memory_trick_pt,
           mt_ru.trick_text as memory_trick_ru,
           mt_ar.trick_text as memory_trick_ar,
           mt_hi.trick_text as memory_trick_hi
    FROM v_all_translations vat
    LEFT JOIN word_meanings wm ON vat.en = wm.en
    LEFT JOIN examples ex ON vat.en = ex.en
    LEFT JOIN memory_tricks mt_en ON vat.en = mt_en.en AND vat.lang = mt_en.translation_lang AND mt_en.ui_lang = 'en'
    LEFT JOIN memory_tricks mt_ja ON vat.en = mt_ja.en AND vat.lang = mt_ja.translation_lang AND mt_ja.ui_lang = 'ja'
    LEFT JOIN memory_tricks mt_zh ON vat.en = mt_zh.en AND vat.lang = mt_zh.translation_lang AND mt_zh.ui_lang = 'zh'
    LEFT JOIN memory_tricks mt_fr ON vat.en = mt_fr.en AND vat.lang = mt_fr.translation_lang AND mt_fr.ui_lang = 'fr'
    LEFT JOIN memory_tricks mt_de ON vat.en = mt_de.en AND vat.lang = mt_de.translation_lang AND mt_de.ui_lang = 'de'
    LEFT JOIN memory_tricks mt_es ON vat.en = mt_es.en AND vat.lang = mt_es.translation_lang AND mt_es.ui_lang = 'es'
    LEFT JOIN memory_tricks mt_it ON vat.en = mt_it.en AND vat.lang = mt_it.translation_lang AND mt_it.ui_lang = 'it'
    LEFT JOIN memory_tricks mt_pt ON vat.en = mt_pt.en AND vat.lang = mt_pt.translation_lang AND mt_pt.ui_lang = 'pt'
    LEFT JOIN memory_tricks mt_ru ON vat.en = mt_ru.en AND vat.lang = mt_ru.translation_lang AND mt_ru.ui_lang = 'ru'
    LEFT JOIN memory_tricks mt_ar ON vat.en = mt_ar.en AND vat.lang = mt_ar.translation_lang AND mt_ar.ui_lang = 'ar'
    LEFT JOIN memory_tricks mt_hi ON vat.en = mt_hi.en AND vat.lang = mt_hi.translation_lang AND mt_hi.ui_lang = 'hi'
    WHERE (vat.lang IN (${langPlaceholders})) AND (
      vat.en LIKE ?
      OR vat.translation LIKE ?
      OR EXISTS (
        SELECT 1 FROM v_multilingual_search ms
        WHERE ms.search_term LIKE ?
        AND ms.en = vat.en
        AND ms.lang IN (${langPlaceholders})
      )
    )
    ORDER BY
      CASE
        WHEN vat.en = ? THEN 1
        WHEN vat.translation = ? THEN 2
        WHEN LENGTH(vat.en) <= 4 AND vat.en LIKE ? THEN 2.5
        WHEN vat.en LIKE ? THEN 3
        WHEN vat.translation LIKE ? THEN 4
        ELSE 5
      END,
      LENGTH(vat.en),
      vat.en
    LIMIT ?
  `;

  const d1Params = [
    ...languages,
    searchTerm, searchTerm, searchTerm,
    ...languages,
    exactTerm, exactTerm, searchTerm, startsWith, startsWith,
    limit,
  ];

  const { results } = await db.prepare(d1Sql).bind(...d1Params).all();

  // Group results by English word
  const grouped = new Map<string, SearchResult>();

  for (const row of results as Record<string, unknown>[]) {
    const englishWord = row.en as string;

    if (!grouped.has(englishWord)) {
      grouped.set(englishWord, {
        word: {
          id: 0,
          word_en: englishWord,
          meaning_en: row.meaning_en as string | undefined,
          meanings: Object.fromEntries(
            Object.entries({
              en: row.meaning_en,
              ja: row.meaning_ja,
              zh: row.meaning_zh,
              fr: row.meaning_fr,
              de: row.meaning_de,
              es: row.meaning_es,
              it: row.meaning_it,
              pt: row.meaning_pt,
              ru: row.meaning_ru,
              ar: row.meaning_ar,
              hi: row.meaning_hi,
            }).filter(([, value]) => value != null && value !== '') as [string, string][]
          ),
        },
        translations: [],
        example: row.example_en
          ? { example_en: row.example_en as string, example_translations: {} }
          : undefined,
      });
    }

    const result = grouped.get(englishWord)!;
    const translation = row.translation as string;
    const gender = row.gender as string;
    if (translation && translation.trim() !== '' && gender && ['m', 'f', 'n'].includes(gender)) {
      result.translations.push({
        id: 0,
        word_id: 0,
        language: row.lang as string,
        translation,
        gender: gender as 'm' | 'f' | 'n',
        memory_trick_en: row.memory_trick_en as string | undefined,
        memory_trick_ja: row.memory_trick_ja as string | undefined,
        memory_trick_zh: row.memory_trick_zh as string | undefined,
        memory_trick_fr: row.memory_trick_fr as string | undefined,
        memory_trick_de: row.memory_trick_de as string | undefined,
        memory_trick_es: row.memory_trick_es as string | undefined,
        memory_trick_it: row.memory_trick_it as string | undefined,
        memory_trick_pt: row.memory_trick_pt as string | undefined,
        memory_trick_ru: row.memory_trick_ru as string | undefined,
        memory_trick_ar: row.memory_trick_ar as string | undefined,
        memory_trick_hi: row.memory_trick_hi as string | undefined,
      });
    }
  }

  // Get example translations
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

  let englishWordsQuery = `
    SELECT DISTINCT en
    FROM v_all_translations
    WHERE translation IS NOT NULL AND translation != ''
  `;

  const englishParams: (string | number)[] = [];

  if (language) {
    englishWordsQuery += ` AND lang = ?`;
    englishParams.push(language);
  }

  if (startsWith) {
    englishWordsQuery += ` AND LOWER(en) LIKE ?`;
    englishParams.push(`${startsWith.toLowerCase()}%`);
  }

  englishWordsQuery += ` ORDER BY LOWER(en) LIMIT ? OFFSET ?`;
  englishParams.push(limit, offset);

  const { results: englishWords } = await db.prepare(englishWordsQuery).bind(...englishParams).all();

  if (englishWords.length === 0) {
    return [];
  }

  const englishList = (englishWords as { en: string }[]).map((row) => row.en);
  const placeholders = englishList.map(() => '?').join(',');

  let translationsQuery = `
    SELECT vat.en, vat.lang, vat.translation, vat.gender,
           wm.meaning_en, wm.meaning_ja, wm.meaning_zh, wm.meaning_fr, wm.meaning_de, wm.meaning_es, wm.meaning_it, wm.meaning_pt, wm.meaning_ru, wm.meaning_ar, wm.meaning_hi,
           ex.example_en,
           mt_en.trick_text as memory_trick_en,
           mt_ja.trick_text as memory_trick_ja,
           mt_zh.trick_text as memory_trick_zh,
           mt_fr.trick_text as memory_trick_fr,
           mt_de.trick_text as memory_trick_de,
           mt_es.trick_text as memory_trick_es,
           mt_it.trick_text as memory_trick_it,
           mt_pt.trick_text as memory_trick_pt,
           mt_ru.trick_text as memory_trick_ru,
           mt_ar.trick_text as memory_trick_ar,
           mt_hi.trick_text as memory_trick_hi
    FROM v_all_translations vat
    LEFT JOIN word_meanings wm ON vat.en = wm.en
    LEFT JOIN examples ex ON vat.en = ex.en
    LEFT JOIN memory_tricks mt_en ON vat.en = mt_en.en AND vat.lang = mt_en.translation_lang AND mt_en.ui_lang = 'en'
    LEFT JOIN memory_tricks mt_ja ON vat.en = mt_ja.en AND vat.lang = mt_ja.translation_lang AND mt_ja.ui_lang = 'ja'
    LEFT JOIN memory_tricks mt_zh ON vat.en = mt_zh.en AND vat.lang = mt_zh.translation_lang AND mt_zh.ui_lang = 'zh'
    LEFT JOIN memory_tricks mt_fr ON vat.en = mt_fr.en AND vat.lang = mt_fr.translation_lang AND mt_fr.ui_lang = 'fr'
    LEFT JOIN memory_tricks mt_de ON vat.en = mt_de.en AND vat.lang = mt_de.translation_lang AND mt_de.ui_lang = 'de'
    LEFT JOIN memory_tricks mt_es ON vat.en = mt_es.en AND vat.lang = mt_es.translation_lang AND mt_es.ui_lang = 'es'
    LEFT JOIN memory_tricks mt_it ON vat.en = mt_it.en AND vat.lang = mt_it.translation_lang AND mt_it.ui_lang = 'it'
    LEFT JOIN memory_tricks mt_pt ON vat.en = mt_pt.en AND vat.lang = mt_pt.translation_lang AND mt_pt.ui_lang = 'pt'
    LEFT JOIN memory_tricks mt_ru ON vat.en = mt_ru.en AND vat.lang = mt_ru.translation_lang AND mt_ru.ui_lang = 'ru'
    LEFT JOIN memory_tricks mt_ar ON vat.en = mt_ar.en AND vat.lang = mt_ar.translation_lang AND mt_ar.ui_lang = 'ar'
    LEFT JOIN memory_tricks mt_hi ON vat.en = mt_hi.en AND vat.lang = mt_hi.translation_lang AND mt_hi.ui_lang = 'hi'
    WHERE vat.en IN (${placeholders}) AND vat.translation IS NOT NULL AND vat.translation != ''
  `;

  const translationParams = [...englishList];

  if (language) {
    translationsQuery += ` AND vat.lang = ?`;
    translationParams.push(language);
  }

  translationsQuery += ` ORDER BY LOWER(vat.en), vat.lang`;

  const { results: rows } = await db.prepare(translationsQuery).bind(...translationParams).all();

  const grouped = new Map<string, BrowseResult>();

  for (const row of rows as Record<string, unknown>[]) {
    const en = row.en as string;
    if (!grouped.has(en)) {
      grouped.set(en, {
        english: en,
        meaning_en: row.meaning_en as string | undefined,
        meanings: Object.fromEntries(
          Object.entries({
            en: row.meaning_en,
            ja: row.meaning_ja,
            zh: row.meaning_zh,
            fr: row.meaning_fr,
            de: row.meaning_de,
            es: row.meaning_es,
            it: row.meaning_it,
            pt: row.meaning_pt,
            ru: row.meaning_ru,
            ar: row.meaning_ar,
            hi: row.meaning_hi,
          }).filter(([, value]) => value != null && value !== '') as [string, string][]
        ),
        translations: [],
        example: row.example_en
          ? { example_en: row.example_en as string, example_translations: {} }
          : undefined,
      });
    }

    const translation = row.translation as string;
    const gender = row.gender as string;
    if (translation && translation.trim() !== '' && gender && ['m', 'f', 'n'].includes(gender)) {
      grouped.get(en)!.translations.push({
        id: 0,
        word_id: 0,
        language: row.lang as string,
        translation,
        gender: gender as 'm' | 'f' | 'n',
        memory_trick_en: row.memory_trick_en as string | undefined,
        memory_trick_ja: row.memory_trick_ja as string | undefined,
        memory_trick_zh: row.memory_trick_zh as string | undefined,
        memory_trick_fr: row.memory_trick_fr as string | undefined,
        memory_trick_de: row.memory_trick_de as string | undefined,
        memory_trick_es: row.memory_trick_es as string | undefined,
        memory_trick_it: row.memory_trick_it as string | undefined,
        memory_trick_pt: row.memory_trick_pt as string | undefined,
        memory_trick_ru: row.memory_trick_ru as string | undefined,
        memory_trick_ar: row.memory_trick_ar as string | undefined,
        memory_trick_hi: row.memory_trick_hi as string | undefined,
      });
    }
  }

  const finalResults = englishList
    .map((en) => grouped.get(en))
    .filter((word): word is BrowseResult => word !== undefined && word.translations.length > 0);

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

  const { results } = await db
    .prepare(
      `SELECT
        SUBSTR(LOWER(en), 1, 1) as letter,
        COUNT(DISTINCT en) as count
      FROM v_all_translations
      WHERE translation IS NOT NULL AND translation != ''
        AND SUBSTR(LOWER(en), 1, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(LOWER(en), 1, 1)
      ORDER BY letter`
    )
    .all();

  return results as unknown as LetterStat[];
}

export async function getLetterStatsDetailed(prefix: string): Promise<{ next_letter: string; count: number }[]> {
  const db = getDB();
  const prefixLength = prefix.length + 1;

  const { results } = await db
    .prepare(
      `SELECT
        SUBSTR(LOWER(en), ${prefixLength}, 1) as next_letter,
        COUNT(DISTINCT en) as count
      FROM v_all_translations
      WHERE translation IS NOT NULL AND translation != ''
        AND LOWER(en) LIKE ? || '%'
        AND SUBSTR(LOWER(en), ${prefixLength}, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(LOWER(en), ${prefixLength}, 1)
      ORDER BY next_letter`
    )
    .bind(prefix.toLowerCase())
    .all();

  return results as unknown as { next_letter: string; count: number }[];
}

export async function getWordAtOffset(prefix: string, offset: number): Promise<string | null> {
  const db = getDB();

  const result = await db
    .prepare(
      `SELECT en as english
       FROM (
         SELECT DISTINCT en
         FROM v_all_translations
         WHERE en IS NOT NULL
           AND en LIKE ? || '%'
         ORDER BY en COLLATE NOCASE ASC
       )
       LIMIT 1 OFFSET ?`
    )
    .bind(prefix, offset)
    .first<{ english: string }>();

  return result?.english ?? null;
}

export async function getWordRange(prefix: string): Promise<{ firstWord?: string; lastWord?: string; totalCount: number }> {
  const db = getDB();

  const [firstWord, lastWord, countResult] = await Promise.all([
    db
      .prepare(
        `SELECT en as english
         FROM (
           SELECT DISTINCT en
           FROM v_all_translations
           WHERE en IS NOT NULL
             AND en LIKE ? || '%'
           ORDER BY en COLLATE NOCASE ASC
         )
         LIMIT 1`
      )
      .bind(prefix)
      .first<{ english: string }>(),
    db
      .prepare(
        `SELECT en as english
         FROM (
           SELECT DISTINCT en
           FROM v_all_translations
           WHERE en IS NOT NULL
             AND en LIKE ? || '%'
           ORDER BY en COLLATE NOCASE DESC
         )
         LIMIT 1`
      )
      .bind(prefix)
      .first<{ english: string }>(),
    db
      .prepare(
        `SELECT COUNT(DISTINCT en) as total
         FROM v_all_translations
         WHERE en IS NOT NULL
           AND en LIKE ? || '%'`
      )
      .bind(prefix)
      .first<{ total: number }>(),
  ]);

  return {
    firstWord: firstWord?.english,
    lastWord: lastWord?.english,
    totalCount: countResult?.total ?? 0,
  };
}

export async function getQuizQuestions(
  languages: string[],
  count: number
): Promise<{ english: string; translation: string; language: string; gender: string }[]> {
  const db = getDB();
  const languageFilter = languages.map(() => '?').join(',');

  const { results } = await db
    .prepare(
      `SELECT en as english, translation, lang as language, gender
       FROM v_all_translations
       WHERE lang IN (${languageFilter})
         AND translation IS NOT NULL
         AND translation != ''
         AND gender IN ('m', 'f', 'n')
       ORDER BY RANDOM()
       LIMIT ?`
    )
    .bind(...languages, count)
    .all();

  return results as { english: string; translation: string; language: string; gender: string }[];
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
