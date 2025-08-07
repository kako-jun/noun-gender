import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // DatabaseManagerのgetDb()メソッドを使用してデータベースにアクセス
    const db = (dbManager as any).getDb();
    
    // 指定されたプレフィックスで始まる単語のoffset番目を取得
    // DISTINCT を使用して重複を除き、英単語単位でカウントする
    const word = await db.prepare(`
      SELECT english 
      FROM (
        SELECT DISTINCT english 
        FROM all_words 
        WHERE english IS NOT NULL 
          AND UPPER(english) LIKE ? || '%'
        ORDER BY english ASC
      )
      LIMIT 1 OFFSET ?
    `).get(prefix.toUpperCase(), offset);

    return NextResponse.json({
      success: true,
      data: {
        word: word?.english || ''
      }
    });
  } catch (error) {
    console.error('Word at offset error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get word at offset' 
      },
      { status: 500 }
    );
  }
}