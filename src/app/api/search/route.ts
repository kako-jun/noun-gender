import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import type { ApiResponse, SearchResult, LanguageCode } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const languagesParam = searchParams.get('languages');
    const limitParam = searchParams.get('limit');

    // Validate required parameters
    if (!query || query.trim().length === 0) {
      return NextResponse.json<ApiResponse<SearchResult[]>>({
        data: [],
        error: 'Search query is required'
      }, { status: 400 });
    }

    // Parse languages parameter
    const languages: LanguageCode[] = languagesParam 
      ? languagesParam.split(',').filter(lang => 
          ['ar', 'fr', 'de', 'hi', 'it', 'pt', 'ru', 'es'].includes(lang)
        ) as LanguageCode[]
      : [];

    // Parse limit parameter - allow unlimited results by default
    const limit = limitParam ? Math.min(parseInt(limitParam), 1000) : 1000;

    // Perform search
    const results = await dbManager.search(query.trim(), languages, limit);

    return NextResponse.json<ApiResponse<SearchResult[]>>({
      data: results,
      total: results.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json<ApiResponse<SearchResult[]>>({
      data: [],
      error: 'Internal server error'
    }, { status: 500 });
  }
}