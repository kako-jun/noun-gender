import { NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const language = searchParams.get('language') || 'all';
    const startsWith = searchParams.get('startsWith') || '';

    const results = await dbManager.browseWords({
      limit,
      offset,
      language: language === 'all' ? undefined : language,
      startsWith
    });

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit // 簡易的な判定
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