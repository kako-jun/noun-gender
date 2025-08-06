'use client';

import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onFocusSearch: () => void;
  onClearSearch: () => void;
}

export function useKeyboardShortcuts({
  onFocusSearch,
  onClearSearch
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は処理しない
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' ||
                           (activeElement as HTMLElement)?.contentEditable === 'true';

      // ESCキー: 検索クリア（入力フィールドでも有効）
      if (event.key === 'Escape') {
        onClearSearch();
        return;
      }

      // 以下のショートカットは入力フィールド以外で有効
      if (isInputFocused) return;

      // /キー: 検索フィールドにフォーカス
      if (event.key === '/') {
        event.preventDefault();
        onFocusSearch();
        return;
      }

    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFocusSearch, onClearSearch]);
}