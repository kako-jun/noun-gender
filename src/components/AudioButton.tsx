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

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceLang = getVoiceLang(language);
      
      // 音声設定
      utterance.lang = voiceLang;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // 音声リストの取得（非同期の場合があるため待機）
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // 言語に合致する音声を探す
        const preferredVoice = voices.find(voice => 
          voice.lang.toLowerCase().startsWith(voiceLang.split('-')[0].toLowerCase())
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
          console.warn('Speech synthesis failed for:', text, 'in language:', voiceLang);
          setIsPlaying(false);
          // エラーが発生してもボタンは表示したまま
        };

        // 読み上げ開始
        window.speechSynthesis.speak(utterance);
      };

      // 音声リストが既に読み込まれている場合
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // 音声リストの読み込み待機
        window.speechSynthesis.onvoiceschanged = loadVoices;
        // フォールバック: 500ms後に実行
        setTimeout(loadVoices, 500);
      }
    } catch (error) {
      console.warn('Speech synthesis initialization failed:', error);
      setIsPlaying(false);
    }
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
        bg-solarized-orange hover:bg-solarized-yellow 
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