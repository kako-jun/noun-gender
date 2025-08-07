import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const uiLanguage = searchParams.get('ui') || 'en';
    
    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // 指定された単語の全記憶術を取得
    const tricks = await dbManager.getMemoryTricksForWord(word, uiLanguage);
    
    return NextResponse.json({ word, uiLanguage, tricks });
  } catch (error) {
    console.error('Memory tricks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory tricks' },
      { status: 500 }
    );
  }
}