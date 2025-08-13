import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const word = dbManager.getWordAtOffset(prefix, offset);

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