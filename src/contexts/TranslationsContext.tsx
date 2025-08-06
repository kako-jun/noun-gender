'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Locale } from '@/i18n/config';

// 翻訳データの型定義
type Messages = Record<string, unknown>;

interface TranslationsContextType {
  locale: Locale;
  messages: Messages;
  isLoading: boolean;
  changeLanguage: (newLocale: Locale) => Promise<void>;
  t: (key: string, values?: Record<string, unknown>) => string;
}

const TranslationsContext = createContext<TranslationsContextType | null>(null);

export function TranslationsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialLocale = async () => {
      try {
        const savedLocale = localStorage.getItem('preferred-locale') as Locale;
        const targetLocale = savedLocale || detectBrowserLocale() || 'en';
        
        const response = await fetch(`/api/messages/${targetLocale}`);
        if (response.ok) {
          const loadedMessages = await response.json();
          setMessages(loadedMessages);
          setLocale(targetLocale);
        } else {
          const enResponse = await fetch('/api/messages/en');
          const enMessages = await enResponse.json();
          setMessages(enMessages);
          setLocale('en');
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        setMessages({});
        setLocale('en');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialLocale();
  }, []);

  const detectBrowserLocale = (): Locale | null => {
    const validLocales: Locale[] = ['en', 'ja', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'ar', 'hi', 'zh'];
    const browserLang = navigator.language.split('-')[0] as Locale;
    return validLocales.includes(browserLang) ? browserLang : null;
  };

  const changeLanguage = async (newLocale: Locale) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${newLocale}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const newMessages = await response.json();
        setMessages(newMessages);
        setLocale(newLocale);
        localStorage.setItem('preferred-locale', newLocale);
        console.log('Language changed to:', newLocale);
      } else {
        console.error('Failed to load language:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Network error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 翻訳関数
  const t = (key: string, values?: Record<string, unknown>): string => {
    const keys = key.split('.');
    let result: unknown = messages;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        result = undefined;
        break;
      }
    }
    
    if (typeof result !== 'string') {
      return key; // キーが見つからない場合はキー自体を返す
    }
    
    // プレースホルダーを置換
    if (values) {
      return result.replace(/\{(\w+)\}/g, (match: string, placeholder: string) => {
        return values[placeholder]?.toString() || match;
      });
    }
    
    return result;
  };

  return (
    <TranslationsContext.Provider value={{
      locale,
      messages,
      isLoading,
      changeLanguage,
      t
    }}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
}