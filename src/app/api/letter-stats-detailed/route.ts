import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    
    const letterStats = dbManager.getLetterStatsDetailed(prefix);

    // a-zすべての文字を含む配列を作成（0件の文字も含む）
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const statsMap = Object.fromEntries(
      letterStats.map(stat => [stat.next_letter, stat.count])
    );
    
    const result = letters.map(letter => ({
      letter: prefix + letter,
      count: statsMap[letter] || 0
    }));

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Letter stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get letter statistics' 
      },
      { status: 500 }
    );
  }
}