import { NextRequest, NextResponse } from 'next/server';
import { getMemoryTricksForWord } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const uiLanguage = searchParams.get('ui') || 'en';

    if (!word) {
      return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
    }

    const tricks = await getMemoryTricksForWord(word, uiLanguage);

    return NextResponse.json({ word, uiLanguage, tricks });
  } catch (error) {
    console.error('Memory tricks API error:', error);
    return NextResponse.json({ error: 'Failed to fetch memory tricks' }, { status: 500 });
  }
}
