import type { Metadata } from 'next';
import QuizPageContent from './QuizPageContent';

export const metadata: Metadata = {
  title: 'Quiz - Noun Gender | Test your knowledge of noun genders',
  description: 'Test your knowledge of noun genders across 8 languages with our interactive quiz. Practice French, German, Spanish, Italian, Portuguese, Russian, Arabic, and Hindi.',
  keywords: ['noun gender quiz', 'language quiz', 'grammar test', 'multilingual quiz', 'gender quiz'],
  openGraph: {
    title: 'Quiz - Noun Gender | Test your knowledge of noun genders',
    description: 'Test your knowledge of noun genders across 8 languages with our interactive quiz.',
    url: 'https://noun-gender.com/quiz',
  },
  twitter: {
    title: 'Quiz - Noun Gender | Test your knowledge of noun genders',
    description: 'Test your knowledge of noun genders across 8 languages with our interactive quiz.',
  },
};

export default function QuizPage() {
  return <QuizPageContent />;
}