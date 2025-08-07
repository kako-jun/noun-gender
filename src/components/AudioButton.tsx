'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';

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
  const { preferFemaleVoice } = useVoice();
  const [hasSpoken, setHasSpoken] = useState(false); // 重複実行防止フラグ

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
      setHasSpoken(false);
      return;
    }

    // 重複実行防止
    if (hasSpoken) {
      return;
    }

    if (!text || text.trim() === '') {
      return;
    }

    try {
      setHasSpoken(true); // 重複実行防止フラグを設定
      
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
        const targetLang = voiceLang.split('-')[0].toLowerCase();
        
        
        // 言語に合致する音声を探す
        const matchingVoices = voices.filter(voice => 
          voice.lang.toLowerCase().startsWith(targetLang)
        );
        
        let preferredVoice = null;
        
        if (matchingVoices.length > 0) {
          // ブラウザ・OS別の推奨音声を定義
          const recommendedVoices = {
            // Microsoft Edge / Windows
            microsoft: {
              male: ['Microsoft Mark - English (United States)', 'Microsoft David - English (United States)', 'Microsoft Guy Online (Natural) - English (United States)'],
              female: ['Microsoft Zira - English (United States)', 'Microsoft Aria Online (Natural) - English (United States)', 'Microsoft Jenny Online (Natural) - English (United States)']
            },
            // Google Chrome
            google: {
              male: ['Google UK English Male', 'Google US English Male', 'Google Australian English Male'],
              female: ['Google UK English Female', 'Google US English Female', 'Google Australian English Female']
            },
            // Apple Safari / macOS
            apple: {
              male: ['Alex', 'Fred', 'Daniel'],
              female: ['Samantha', 'Victoria', 'Allison']
            },
            // Mozilla Firefox (eSpeak-NG engine)
            firefox: {
              male: ['English (Great Britain)', 'English (America)', 'English Male'],
              female: ['English (Great Britain)+f3', 'English (America)+f3', 'English Female']
            }
          };
          
          const targetVoices = preferFemaleVoice 
            ? [...recommendedVoices.microsoft.female, ...recommendedVoices.google.female, ...recommendedVoices.apple.female, ...recommendedVoices.firefox.female]
            : [...recommendedVoices.microsoft.male, ...recommendedVoices.google.male, ...recommendedVoices.apple.male, ...recommendedVoices.firefox.male];
          
          // 推奨音声から検索
          for (const targetVoice of targetVoices) {
            preferredVoice = matchingVoices.find(voice => 
              voice.name.includes(targetVoice) || voice.name === targetVoice
            );
            if (preferredVoice) {
              break;
            }
          }
          
          // 推奨音声が見つからない場合は最初の音声を使用
          if (!preferredVoice) {
            preferredVoice = matchingVoices[0];
          }
        }
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // イベントハンドラ
        utterance.onstart = () => {
          setIsPlaying(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setHasSpoken(false); // 完了後にフラグをリセット
        };

        utterance.onerror = (event) => {
          console.warn('Speech synthesis failed for:', text, 'in language:', voiceLang);
          setIsPlaying(false);
          setHasSpoken(false); // エラー後にフラグをリセット
          // エラーが発生してもボタンは表示したまま
        };

        // 読み上げ開始
        window.speechSynthesis.speak(utterance);
      };

      // 音声リストが既に読み込まれている場合
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // 音声リストの読み込み待機（現代ブラウザでは即座に利用可能）
        window.speechSynthesis.onvoiceschanged = () => {
          loadVoices();
          // イベントリスナーをクリアして重複実行を防止
          window.speechSynthesis.onvoiceschanged = null;
        };
        
        // 念のため100ms後にチェック（軽量フォールバック）
        setTimeout(() => {
          if (window.speechSynthesis.getVoices().length > 0) {
            loadVoices();
          }
        }, 100);
      }
    } catch (error) {
      console.warn('Speech synthesis initialization failed:', error);
      setIsPlaying(false);
      setHasSpoken(false); // エラー時にフラグをリセット
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