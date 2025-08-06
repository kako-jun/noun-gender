'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // スクロール位置が300px以上になったら表示
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full
        bg-solarized-orange hover:bg-solarized-yellow
        text-white shadow-lg hover:shadow-xl
        transition-all duration-300 transform hover:scale-110
        flex items-center justify-center
      "
      title="ページトップへ戻る"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}