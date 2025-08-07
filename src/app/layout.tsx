import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';
import { TranslationsProvider } from '@/contexts/TranslationsContext';
import { VoiceProvider } from '@/contexts/VoiceContext';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              {children}
            </VoiceProvider>
          </TranslationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
