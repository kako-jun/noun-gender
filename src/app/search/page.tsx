import type { Metadata } from 'next';
import SearchPageContent from './SearchPageContent';

export const metadata: Metadata = {
  title: 'Search - Noun Gender | Find noun genders in 8 languages',
  description: 'Search and find noun genders across 8 languages including French, German, Spanish, Italian, Portuguese, Russian, Arabic, and Hindi with over 4,600 words.',
  keywords: ['noun gender search', 'multilingual dictionary', 'language learning', 'grammar search'],
  openGraph: {
    title: 'Search - Noun Gender | Find noun genders in 8 languages',
    description: 'Search and find noun genders across 8 languages with over 4,600 words.',
    url: 'https://noun-gender.com/search',
  },
  twitter: {
    title: 'Search - Noun Gender | Find noun genders in 8 languages',
    description: 'Search and find noun genders across 8 languages with over 4,600 words.',
  },
};

export default function SearchPage() {
  return <SearchPageContent />;
}

