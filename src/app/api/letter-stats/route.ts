import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET() {
  try {
    // DatabaseManagerのgetDb()メソッドを使用してデータベースにアクセス
    const db = (dbManager as { getDb: () => any }).getDb();
    
    // a-z各文字の単語数をカウント
    const letterStats = await db.prepare(`
      SELECT 
        SUBSTR(english, 1, 1) as letter,
        COUNT(DISTINCT english) as count
      FROM all_words 
      WHERE english IS NOT NULL 
        AND LENGTH(english) > 0
        AND SUBSTR(english, 1, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(english, 1, 1)
      ORDER BY letter
    `).all();

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