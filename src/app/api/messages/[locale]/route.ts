import { NextResponse } from 'next/server';
import { locales } from '@/i18n/config';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    
    // 有効な言語コードかチェック
    if (!locales.includes(locale as typeof locales[number])) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    // 翻訳ファイルを読み込み
    const messagesPath = path.join(process.cwd(), 'src', 'i18n', 'messages', `${locale}.json`);
    
    if (!fs.existsSync(messagesPath)) {
      return NextResponse.json({ error: 'Translation file not found' }, { status: 404 });
    }

    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    
    return NextResponse.json(messages, {
      headers: {
        'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
      }
    });

  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}