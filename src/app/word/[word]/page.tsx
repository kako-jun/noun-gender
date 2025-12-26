import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWord } from '@/lib/db';
import WordPageClient from './WordPageClient';

export const runtime = 'edge';

interface Props {
  params: Promise<{ word: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  const wordData = await getWord(decodedWord);

  if (!wordData) {
    return {
      title: 'Word Not Found - Noun Gender',
    };
  }

  const languages = wordData.translations.map((t) => t.language.toUpperCase()).join(', ');
  const description = wordData.meaning_en
    ? `${wordData.english}: ${wordData.meaning_en}. Gender info in ${languages}.`
    : `Find the gender of "${wordData.english}" in ${languages}.`;

  return {
    title: `${wordData.english} - Noun Gender`,
    description,
    keywords: [
      wordData.english,
      'noun gender',
      ...wordData.translations.map((t) => t.translation),
      ...wordData.translations.map((t) => `${t.language} gender`),
    ],
    openGraph: {
      title: `${wordData.english} - Noun Gender`,
      description,
      url: `https://noun-gender.llll-ll.com/word/${encodeURIComponent(wordData.english)}`,
    },
  };
}

export default async function WordPage({ params }: Props) {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  const wordData = await getWord(decodedWord);

  if (!wordData) {
    notFound();
  }

  return <WordPageClient wordData={wordData} />;
}
