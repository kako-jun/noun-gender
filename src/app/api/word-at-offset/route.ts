import { NextRequest, NextResponse } from 'next/server';
import { getWordAtOffset } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const offset = parseInt(searchParams.get('offset') || '0');

    const word = await getWordAtOffset(prefix, offset);

    return NextResponse.json({ success: true, data: { word: word || '' } });
  } catch (error) {
    console.error('Word at offset error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get word at offset' }, { status: 500 });
  }
}
