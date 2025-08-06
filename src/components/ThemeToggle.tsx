'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse" />
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

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'ライトテーマ → ダークテーマ';
      case 'dark':
        return 'ダークテーマ → システム設定';
      case 'system':
        return 'システム設定 → ライトテーマ';
      default:
        return 'テーマ切り替え';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="
        p-2 rounded-full transition-all duration-300 transform hover:scale-110
        bg-stone-200 hover:bg-stone-300 shadow-md hover:shadow-lg
        dark:bg-stone-700 dark:hover:bg-stone-600
        text-stone-700 dark:text-stone-200
      "
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
}