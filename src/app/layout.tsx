import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';
import { TranslationsProvider } from '@/contexts/TranslationsContext';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { LangAttributeUpdater } from '@/components/LangAttributeUpdater';

// モダンで技術的なセリフフォント（メイン）
const sourceSerif = Source_Serif_4({
  weight: ['400', '600', '700', '900'],
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: 'swap',
});

// IBM的なコンソール風セリフフォント
const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '500', '600', '700'],
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Noun Gender - Master noun genders across languages",
  description: "Learn and search noun genders in 8 languages with over 9,000 translations. Supports French, German, Spanish, Italian, Portuguese, Russian, Arabic, and Hindi.",
  keywords: ['noun gender', 'language learning', 'french', 'german', 'spanish', 'italian', 'portuguese', 'russian', 'arabic', 'hindi', 'grammar', 'vocabulary'],
  authors: [{ name: 'Noun Gender App' }],
  creator: 'Noun Gender App',
  publisher: 'Noun Gender App',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://noun-gender.com',
    title: 'Noun Gender - Master noun genders across languages',
    description: 'Learn and search noun genders in 8 languages with over 9,000 translations. Supports French, German, Spanish, Italian, Portuguese, Russian, Arabic, and Hindi.',
    siteName: 'Noun Gender',
    images: [
      {
        url: 'https://noun-gender.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Noun Gender - Language Learning App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noun Gender - Master noun genders across languages',
    description: 'Learn and search noun genders in 8 languages with over 9,000 translations.',
    images: ['https://noun-gender.com/og-image.png'],
    creator: '@noun_gender_app',
    site: '@noun_gender_app',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Education',
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Noun Gender",
      "description": "Learn and search noun genders in 8 languages with over 9,000 translations. Supports French, German, Spanish, Italian, Portuguese, Russian, Arabic, and Hindi.",
      "url": "https://noun-gender.com",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Noun Gender"
      },
      "inLanguage": ["en", "fr", "de", "es", "it", "pt", "ru", "ar", "hi", "ja", "ko"],
      "audience": {
        "@type": "Audience",
        "audienceType": "Language learners"
      },
      "keywords": "noun gender, language learning, multilingual, grammar, vocabulary, French, German, Spanish, Italian, Portuguese, Russian, Arabic, Hindi"
    })
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Nostalgic Counter Web Component */}
        <script src="https://nostalgic.llll-ll.com/components/visit.js" async />
        <script src="https://nostalgic.llll-ll.com/components/like.js" async />
      </head>
      <body
        className={`${sourceSerif.variable} ${ibmPlexSerif.variable} font-serif antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationsProvider>
            <VoiceProvider>
              <LangAttributeUpdater />
              {children}
            </VoiceProvider>
          </TranslationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
