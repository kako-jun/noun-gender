import type { Metadata } from 'next';
import AboutPageContent from './AboutPageContent';

export const metadata: Metadata = {
  title: 'About - Noun Gender | Learn about our multilingual learning tool',
  description: 'Learn about Noun Gender, a free multilingual tool for mastering noun genders across 8 languages. Features over 4,600 words with translations, quiz, and voice support.',
  keywords: ['about noun gender', 'multilingual learning', 'language education', 'open source'],
  openGraph: {
    title: 'About - Noun Gender | Learn about our multilingual learning tool',
    description: 'Learn about Noun Gender, a free multilingual tool for mastering noun genders across 8 languages.',
    url: 'https://noun-gender.com/about',
  },
  twitter: {
    title: 'About - Noun Gender | Learn about our multilingual learning tool',
    description: 'Learn about Noun Gender, a free multilingual tool for mastering noun genders across 8 languages.',
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}