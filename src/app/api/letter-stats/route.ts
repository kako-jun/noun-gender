import { NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET() {
  try {
    const letterStats = dbManager.getLetterStats();

    // a-zすべての文字を含む配列を作成（0件の文字も含む）
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const statsMap = Object.fromEntries(
      letterStats.map(stat => [stat.letter, stat.count])
    );
    
    const result = letters.map(letter => ({
      letter: letter,
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