import { NextRequest, NextResponse } from 'next/server';
import { getWordRange } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';

    const result = await getWordRange(prefix);

    return NextResponse.json({
      success: true,
      data: {
        firstWord: result.firstWord || '',
        lastWord: result.lastWord || '',
        totalCount: result.totalCount,
      },
    });
  } catch (error) {
    console.error('Word range error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get word range' }, { status: 500 });
  }
}
