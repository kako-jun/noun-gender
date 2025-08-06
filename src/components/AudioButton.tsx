'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioButtonProps {
  text: string;
  language: string;
  className?: string;
}

// 言語コードをWeb Speech API用に変換
const getVoiceLang = (langCode: string): string => {
  const voiceMap: Record<string, string> = {
    'fr': 'fr-FR',
    'de': 'de-DE', 
    'es': 'es-ES',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'ru': 'ru-RU',
    'ar': 'ar-SA',
    'hi': 'hi-IN',
    'en': 'en-US'
  };
  return voiceMap[langCode] || 'en-US';
};

export function AudioButton({ text, language, className = '' }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const handleSpeak = () => {
    // Web Speech API サポートチェック
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      console.warn('Web Speech API is not supported');
      return;
    }

    // 既に再生中の場合は停止
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!text || text.trim() === '') {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceLang = getVoiceLang(language);
    
    // 音声設定
    utterance.lang = voiceLang;
    utterance.rate = 0.9; // 少しゆっくり
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // 利用可能な音声から最適なものを選択
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(voiceLang.split('-')[0])
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // イベントハンドラ
    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsSupported(false);
    };

    // 読み上げ開始
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null; // サポートされていない場合は非表示
  }

  return (
    <button
      onClick={handleSpeak}
      className={`
        inline-flex items-center justify-center
        w-8 h-8 rounded-full
        bg-blue-500 hover:bg-blue-600 
        text-white transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isPlaying ? '停止' : '読み上げ'}
      disabled={!text || text.trim() === ''}
    >
      {isPlaying ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}