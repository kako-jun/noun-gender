'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-solarized-base3 dark:bg-solarized-base03 border border-solarized-base1 dark:border-solarized-base01 animate-pulse" />
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };


  return (
    <button
      onClick={cycleTheme}
      className="
        p-2 rounded-full transition-all duration-300 transform hover:scale-110
        bg-solarized-base3 hover:bg-solarized-base1 shadow-md hover:shadow-lg border border-solarized-base1
        dark:bg-solarized-base03 dark:hover:bg-solarized-base01 dark:border-solarized-base01
        text-solarized-base01 hover:text-solarized-base3 dark:text-solarized-base1 dark:hover:text-solarized-base03
      "
      title={t('theme.toggle')}
    >
      {getIcon()}
    </button>
  );
}