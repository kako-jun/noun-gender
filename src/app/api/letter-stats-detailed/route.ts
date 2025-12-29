import { NextRequest, NextResponse } from 'next/server';
import { getLetterStatsDetailed } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';

    const letterStats = await getLetterStatsDetailed(prefix);

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const statsMap = Object.fromEntries(letterStats.map((stat) => [stat.next_letter, stat.count]));

    const result = letters.map((letter) => ({
      letter: prefix + letter,
      count: statsMap[letter] || 0,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Letter stats detailed error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get letter statistics' }, { status: 500 });
  }
}
