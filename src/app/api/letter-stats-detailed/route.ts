import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    
    // DatabaseManagerのgetDb()メソッドを使用してデータベースにアクセス
    const db = (dbManager as { getDb: () => any }).getDb();
    
    // 指定されたプレフィックスで始まる単語の、次の文字ごとの統計を取得
    const letterStats = await db.prepare(`
      SELECT 
        SUBSTR(english, ${prefix.length + 1}, 1) as next_letter,
        COUNT(DISTINCT english) as count
      FROM all_words 
      WHERE english IS NOT NULL 
        AND LENGTH(english) > ${prefix.length}
        AND english LIKE ? || '%'
        AND SUBSTR(english, ${prefix.length + 1}, 1) BETWEEN 'a' AND 'z'
      GROUP BY SUBSTR(english, ${prefix.length + 1}, 1)
      ORDER BY next_letter
    `).all(prefix);

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