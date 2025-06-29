'use client';

import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onFocusSearch: () => void;
  onClearSearch: () => void;
  onToggleTheme?: () => void;
}

export function useKeyboardShortcuts({
  onFocusSearch,
  onClearSearch,
  onToggleTheme
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は処理しない
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' ||
                           activeElement?.contentEditable === 'true';

      // ESCキー: 検索クリア（入力フィールドでも有効）
      if (event.key === 'Escape') {
        onClearSearch();
        return;
      }

      // 以下のショートカットは入力フィールド以外で有効
      if (isInputFocused) return;

      // /キー または Ctrl+K: 検索フィールドにフォーカス
      if (event.key === '/' || (event.ctrlKey && event.key === 'k')) {
        event.preventDefault();
        onFocusSearch();
        return;
      }

      // Ctrl+Shift+T: テーマ切り替え
      if (event.ctrlKey && event.shiftKey && event.key === 'T' && onToggleTheme) {
        event.preventDefault();
        onToggleTheme();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFocusSearch, onClearSearch, onToggleTheme]);
}