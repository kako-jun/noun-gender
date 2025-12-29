import { NextRequest, NextResponse } from 'next/server';
import { browseWords } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const language = searchParams.get('language') || undefined;
    const startsWith = searchParams.get('startsWith') || undefined;

    const results = await browseWords({
      limit: limit + 1,
      offset,
      language: language === 'all' ? undefined : language,
      startsWith,
    });

    const actualResults = results.slice(0, limit);
    const hasMore = results.length > limit;

    return NextResponse.json({
      success: true,
      data: actualResults,
      pagination: { limit, offset, hasMore },
    });
  } catch (error) {
    console.error('Browse API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
