import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, LanguageCode } from './types';
import * as db from './db';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
);

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'noun-gender-api' }));

// Search API
app.get('/api/search', async (c) => {
  try {
    const query = c.req.query('q');
    const languagesParam = c.req.query('lang');
    const limitParam = c.req.query('limit');

    if (!query || query.trim().length === 0) {
      return c.json({ data: [], error: 'Search query is required' }, 400);
    }

    const languages: LanguageCode[] = languagesParam
      ? (languagesParam.split('-').filter((lang) =>
          ['ar', 'fr', 'de', 'hi', 'it', 'pt', 'ru', 'es'].includes(lang)
        ) as LanguageCode[])
      : [];

    const limit = limitParam ? Math.min(parseInt(limitParam), 1000) : 1000;

    const results = await db.search(c.env.DB, query.trim(), languages, limit);

    return c.json({ data: results, total: results.length });
  } catch (error) {
    console.error('Search API error:', error);
    return c.json({ data: [], error: 'Internal server error' }, 500);
  }
});

// Browse API
app.get('/api/browse', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    const language = c.req.query('language') || 'all';
    const startsWith = c.req.query('startsWith') || '';

    const results = await db.browseWords(c.env.DB, {
      limit: limit + 1,
      offset,
      language: language === 'all' ? undefined : language,
      startsWith,
    });

    const actualResults = results.slice(0, limit);
    const hasMore = results.length > limit;

    return c.json({
      success: true,
      data: actualResults,
      pagination: { limit, offset, hasMore },
    });
  } catch (error) {
    console.error('Browse API error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Stats API
app.get('/api/stats', async (c) => {
  try {
    const stats = await db.getStats(c.env.DB);
    return c.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Letter stats API
app.get('/api/letter-stats', async (c) => {
  try {
    const letterStats = await db.getLetterStats(c.env.DB);

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const statsMap = Object.fromEntries(letterStats.map((stat) => [stat.letter, stat.count]));

    const result = letters.map((letter) => ({
      letter,
      count: statsMap[letter] || 0,
    }));

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Letter stats error:', error);
    return c.json({ success: false, error: 'Failed to get letter statistics' }, 500);
  }
});

// Letter stats detailed API
app.get('/api/letter-stats-detailed', async (c) => {
  try {
    const prefix = c.req.query('prefix') || '';
    const letterStats = await db.getLetterStatsDetailed(c.env.DB, prefix);

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const statsMap = Object.fromEntries(letterStats.map((stat) => [stat.next_letter, stat.count]));

    const result = letters.map((letter) => ({
      letter: prefix + letter,
      count: statsMap[letter] || 0,
    }));

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Letter stats error:', error);
    return c.json({ success: false, error: 'Failed to get letter statistics' }, 500);
  }
});

// Word at offset API
app.get('/api/word-at-offset', async (c) => {
  try {
    const prefix = c.req.query('prefix') || '';
    const offset = parseInt(c.req.query('offset') || '0');

    const word = await db.getWordAtOffset(c.env.DB, prefix, offset);

    return c.json({ success: true, data: { word: word || '' } });
  } catch (error) {
    console.error('Word at offset error:', error);
    return c.json({ success: false, error: 'Failed to get word at offset' }, 500);
  }
});

// Word range API
app.get('/api/word-range', async (c) => {
  try {
    const prefix = c.req.query('prefix') || '';
    const result = await db.getWordRange(c.env.DB, prefix);

    return c.json({
      success: true,
      data: {
        firstWord: result.firstWord || '',
        lastWord: result.lastWord || '',
        totalCount: result.totalCount,
      },
    });
  } catch (error) {
    console.error('Word range error:', error);
    return c.json({ success: false, error: 'Failed to get word range' }, 500);
  }
});

// Quiz API
app.get('/api/quiz', async (c) => {
  try {
    const languages = c.req.query('lang')?.split('-') || ['fr', 'de', 'es'];
    const count = Math.min(parseInt(c.req.query('count') || '10'), 20);

    const quizData = await db.getQuizQuestions(c.env.DB, languages, count);

    const questions = quizData.map((row, index) => {
      const correctGender = row.gender;
      const incorrectGenders = ['m', 'f', 'n'].filter((g) => g !== correctGender);

      const options = [correctGender, ...incorrectGenders.slice(0, 2)].sort(() => Math.random() - 0.5);

      return {
        id: index + 1,
        english: row.english,
        translation: row.translation,
        language: row.language,
        correctGender,
        options,
        explanation: `${row.english} → ${row.translation} (${row.language})`,
      };
    });

    return c.json({ questions, total: questions.length });
  } catch (error) {
    console.error('Quiz API error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Memory tricks API
app.get('/api/memory-tricks', async (c) => {
  try {
    const word = c.req.query('word');
    const uiLanguage = c.req.query('ui') || 'en';

    if (!word) {
      return c.json({ error: 'Word parameter is required' }, 400);
    }

    const tricks = await db.getMemoryTricksForWord(c.env.DB, word, uiLanguage);

    return c.json({ word, uiLanguage, tricks });
  } catch (error) {
    console.error('Memory tricks API error:', error);
    return c.json({ error: 'Failed to fetch memory tricks' }, 500);
  }
});

export default app;
