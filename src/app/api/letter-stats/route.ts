import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // DatabaseManagerのgetDb()メソッドを使用してデータベースにアクセス
    const db = (dbManager as any).getDb();
    
    // A-Z各文字の単語数をカウント
    const letterStats = await db.prepare(`
      SELECT 
        UPPER(SUBSTR(english, 1, 1)) as letter,
        COUNT(DISTINCT english) as count
      FROM all_words 
      WHERE english IS NOT NULL 
        AND LENGTH(english) > 0
        AND UPPER(SUBSTR(english, 1, 1)) BETWEEN 'A' AND 'Z'
      GROUP BY UPPER(SUBSTR(english, 1, 1))
      ORDER BY letter
    `).all();

    // A-Zすべての文字を含む配列を作成（0件の文字も含む）
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const statsMap = Object.fromEntries(
      letterStats.map(stat => [stat.letter, stat.count])
    );
    
    const result = letters.map(letter => ({
      letter,
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