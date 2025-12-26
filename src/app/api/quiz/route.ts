import { NextRequest, NextResponse } from 'next/server';
import { getQuizQuestions } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const languages = searchParams.get('lang')?.split('-') || ['fr', 'de', 'es'];
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 20);

    const quizData = await getQuizQuestions(languages, count);

    const questions = quizData.map((row, index) => {
      const correctGender = row.gender;
      const incorrectGenders = ['m', 'f', 'n'].filter((g) => g !== correctGender);
      const options = [correctGender, ...incorrectGenders.slice(0, 2)].sort(() => Math.random() - 0.5);

      return {
        id: index + 1,
        english: row.english,
        translation: row.translation,
        language: row.language,
        correctGender,
        options,
        explanation: `${row.english} → ${row.translation} (${row.language})`,
      };
    });

    return NextResponse.json({ questions, total: questions.length });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
