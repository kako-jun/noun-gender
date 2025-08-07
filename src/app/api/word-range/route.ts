import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    
    // DatabaseManagerのgetDb()メソッドを使用してデータベースにアクセス
    const db = (dbManager as any).getDb();
    
    // 指定されたプレフィックスで始まる最初と最後の単語を取得
    // DISTINCT を使用して重複を除く
    const firstWord = await db.prepare(`
      SELECT english 
      FROM (
        SELECT DISTINCT english 
        FROM all_words 
        WHERE english IS NOT NULL 
          AND UPPER(english) LIKE ? || '%'
        ORDER BY english ASC
      )
      LIMIT 1
    `).get(prefix.toUpperCase());
    
    const lastWord = await db.prepare(`
      SELECT english 
      FROM (
        SELECT DISTINCT english 
        FROM all_words 
        WHERE english IS NOT NULL 
          AND UPPER(english) LIKE ? || '%'
        ORDER BY english DESC
      )
      LIMIT 1
    `).get(prefix.toUpperCase());
    
    // 総数を取得
    const countResult = await db.prepare(`
      SELECT COUNT(DISTINCT english) as total
      FROM all_words 
      WHERE english IS NOT NULL 
        AND UPPER(english) LIKE ? || '%'
    `).get(prefix.toUpperCase());

    return NextResponse.json({
      success: true,
      data: {
        firstWord: firstWord?.english || '',
        lastWord: lastWord?.english || '',
        totalCount: countResult?.total || 0
      }
    });
  } catch (error) {
    console.error('Word range error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get word range' 
      },
      { status: 500 }
    );
  }
}