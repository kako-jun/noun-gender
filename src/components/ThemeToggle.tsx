'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
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
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'system':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
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
        p-2 rounded-lg transition-colors
        bg-gray-200 hover:bg-gray-300
        dark:bg-gray-700 dark:hover:bg-gray-600
        text-gray-800 dark:text-gray-200
      "
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
}