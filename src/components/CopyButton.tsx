'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslations } from '@/contexts/TranslationsContext';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const { t } = useTranslations();
  const [copied, setCopied] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // スクロール時にポップアップを隠す
  useEffect(() => {
    const handleScroll = () => {
      if (showPopup) {
        setShowPopup(false);
        setCopied(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    if (showPopup) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showPopup]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      
      // ボタンの位置を取得してポップアップを表示
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowPopup(true);
        
        timeoutRef.current = setTimeout(() => {
          setShowPopup(false);
          setCopied(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleCopy}
        className={`
          inline-flex items-center justify-center
          w-8 h-8 rounded-full
          ${copied 
            ? 'bg-solarized-green hover:bg-solarized-green text-white scale-110' 
            : 'bg-solarized-base01 hover:bg-solarized-base00 dark:bg-solarized-base0 dark:hover:bg-solarized-base1 text-white'
          }
          transition-all duration-300
          ${copied ? 'cursor-default' : ''}
          disabled:opacity-50
          ${className}
        `}
        title={t('copy.copy')}
        disabled={!text || copied}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Portal for popup message */}
      {showPopup && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed pointer-events-none z-50"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-solarized-green text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            {t('copy.copied')}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}