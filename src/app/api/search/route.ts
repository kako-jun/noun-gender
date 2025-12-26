import { NextRequest, NextResponse } from 'next/server';
import { search, type LanguageCode } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const languagesParam = searchParams.get('lang');
    const limitParam = searchParams.get('limit');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ data: [], error: 'Search query is required' }, { status: 400 });
    }

    const validLanguages = ['ar', 'fr', 'de', 'hi', 'it', 'pt', 'ru', 'es'];
    const languages: LanguageCode[] = languagesParam
      ? (languagesParam.split('-').filter((lang) => validLanguages.includes(lang)) as LanguageCode[])
      : [];

    const limit = limitParam ? Math.min(parseInt(limitParam), 1000) : 1000;

    const results = await search(query.trim(), languages, limit);

    return NextResponse.json({ data: results, total: results.length });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ data: [], error: 'Internal server error' }, { status: 500 });
  }
}
