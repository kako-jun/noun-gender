'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      // Clipboard API を使用（HTTPS環境で利用可能）
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(text);
      } else {
        // フォールバック: 古いブラウザ対応
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後にリセット
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center justify-center
        w-8 h-8 rounded-full
        ${copied 
          ? 'bg-green-500 hover:bg-green-600 text-white' 
          : 'bg-solarized-base01 hover:bg-solarized-base00 dark:bg-solarized-base0 dark:hover:bg-solarized-base1 text-white'
        }
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={copied ? 'コピー完了!' : 'クリップボードにコピー'}
      disabled={!text}
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}