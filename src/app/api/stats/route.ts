import { NextResponse } from 'next/server';
import dbManager from '@/lib/database';

export async function GET() {
  try {
    const stats = await dbManager.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}