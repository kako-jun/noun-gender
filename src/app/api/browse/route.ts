import { NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const language = searchParams.get('language') || 'all';
    const startsWith = searchParams.get('startsWith') || '';

    // limit+1件取得して、hasMoreを正確に判定
    const results = await dbManager.browseWords({
      limit: limit + 1,
      offset,
      language: language === 'all' ? undefined : language,
      startsWith
    });

    // 実際に返すデータは要求されたlimit件まで
    const actualResults = results.slice(0, limit);
    const hasMore = results.length > limit;

    return NextResponse.json({
      success: true,
      data: actualResults,
      pagination: {
        limit,
        offset,
        hasMore
      }
    });
  } catch (error) {
    console.error('Browse API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}