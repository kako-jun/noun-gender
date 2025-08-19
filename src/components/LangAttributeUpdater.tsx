'use client';

import { useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

export function LangAttributeUpdater() {
  const { locale } = useTranslations();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}