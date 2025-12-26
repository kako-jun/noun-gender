import { NextResponse } from 'next/server';
import { getLetterStats } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const letterStats = await getLetterStats();

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const statsMap = Object.fromEntries(letterStats.map((stat) => [stat.letter, stat.count]));

    const result = letters.map((letter) => ({
      letter,
      count: statsMap[letter] || 0,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Letter stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get letter statistics' }, { status: 500 });
  }
}
