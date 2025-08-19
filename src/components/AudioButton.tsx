'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useTranslations } from '@/hooks/useTranslations';

interface AudioButtonProps {
  text: string;
  language: string;
  className?: string;
  size?: 'normal' | 'small';
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

export function AudioButton({ text, language, className = '', size = 'normal' }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { preferFemaleVoice } = useVoice();
  const { t } = useTranslations();

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

    // 重複実行防止を緩和 - モバイル対応
    if (isPlaying) {
      return;
    }

    try {
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceLang = getVoiceLang(language);
      
      // 音声設定
      utterance.lang = voiceLang;
      utterance.rate = 0.85;
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
          // 言語・ブラウザ別の推奨音声を定義
          const getRecommendedVoices = (lang: string) => {
            const voiceMap: { [key: string]: { microsoft?: { male?: string[]; female?: string[] }; google?: { male?: string[]; female?: string[] }; apple?: { male?: string[]; female?: string[] }; firefox?: { male?: string[]; female?: string[] } } } = {
              // English
              'en': {
                microsoft: {
                  male: ['Microsoft Mark - English (United States)', 'Microsoft David - English (United States)', 'Microsoft Guy Online (Natural) - English (United States)'],
                  female: ['Microsoft Zira - English (United States)', 'Microsoft Aria Online (Natural) - English (United States)', 'Microsoft Jenny Online (Natural) - English (United States)']
                },
                google: {
                  male: ['Google UK English Male', 'Google US English Male', 'Google Australian English Male'],
                  female: ['Google UK English Female', 'Google US English Female', 'Google Australian English Female']
                },
                apple: {
                  male: ['Alex', 'Fred', 'Daniel'],
                  female: ['Samantha', 'Victoria', 'Allison']
                },
                firefox: {
                  male: ['English (Great Britain)', 'English (America)', 'English Male'],
                  female: ['English (Great Britain)+f3', 'English (America)+f3', 'English Female']
                }
              },
              // French
              'fr': {
                microsoft: {
                  male: ['Microsoft Paul - French (France)', 'Microsoft Claude Online (Natural) - French (France)', 'Microsoft Henri Online (Natural) - French (France)'],
                  female: ['Microsoft Hortense - French (France)', 'Microsoft Brigitte Online (Natural) - French (France)', 'Microsoft Jacqueline Online (Natural) - French (France)']
                },
                google: {
                  male: ['Google français Male', 'Google French Male'],
                  female: ['Google français Female', 'Google French Female']
                },
                apple: {
                  male: ['Thomas', 'Olivier'],
                  female: ['Amélie', 'Audrey']
                },
                firefox: {
                  male: ['French (France)', 'Français'],
                  female: ['French (France)+f3', 'Français+f3']
                }
              },
              // German
              'de': {
                microsoft: {
                  male: ['Microsoft Stefan - German (Germany)', 'Microsoft Conrad Online (Natural) - German (Germany)', 'Microsoft Klaus Online (Natural) - German (Germany)'],
                  female: ['Microsoft Hedda - German (Germany)', 'Microsoft Katja Online (Natural) - German (Germany)', 'Microsoft Ingrid Online (Natural) - German (Germany)']
                },
                google: {
                  male: ['Google Deutsch Male', 'Google German Male'],
                  female: ['Google Deutsch Female', 'Google German Female']
                },
                apple: {
                  male: ['Yannick', 'Viktor'],
                  female: ['Anna', 'Petra']
                },
                firefox: {
                  male: ['German (Germany)', 'Deutsch'],
                  female: ['German (Germany)+f3', 'Deutsch+f3']
                }
              },
              // Spanish
              'es': {
                microsoft: {
                  male: ['Microsoft Pablo - Spanish (Spain)', 'Microsoft Alvaro Online (Natural) - Spanish (Spain)', 'Microsoft Jorge Online (Natural) - Spanish (Mexico)'],
                  female: ['Microsoft Helena - Spanish (Spain)', 'Microsoft Elvira Online (Natural) - Spanish (Spain)', 'Microsoft Dalia Online (Natural) - Spanish (Mexico)']
                },
                google: {
                  male: ['Google español Male', 'Google Spanish Male'],
                  female: ['Google español Female', 'Google Spanish Female']
                },
                apple: {
                  male: ['Diego', 'Juan'],
                  female: ['Monica', 'Paulina']
                },
                firefox: {
                  male: ['Spanish (Spain)', 'Español'],
                  female: ['Spanish (Spain)+f3', 'Español+f3']
                }
              },
              // Italian
              'it': {
                microsoft: {
                  male: ['Microsoft Cosimo - Italian (Italy)', 'Microsoft Diego Online (Natural) - Italian (Italy)', 'Microsoft Giuseppe Online (Natural) - Italian (Italy)'],
                  female: ['Microsoft Elsa - Italian (Italy)', 'Microsoft Isabella Online (Natural) - Italian (Italy)', 'Microsoft Fiamma Online (Natural) - Italian (Italy)']
                },
                google: {
                  male: ['Google italiano Male', 'Google Italian Male'],
                  female: ['Google italiano Female', 'Google Italian Female']
                },
                apple: {
                  male: ['Luca', 'Paolo'],
                  female: ['Alice', 'Federica']
                },
                firefox: {
                  male: ['Italian (Italy)', 'Italiano'],
                  female: ['Italian (Italy)+f3', 'Italiano+f3']
                }
              },
              // Portuguese
              'pt': {
                microsoft: {
                  male: ['Microsoft Helio - Portuguese (Brazil)', 'Microsoft Daniel Online (Natural) - Portuguese (Brazil)', 'Microsoft Antonio Online (Natural) - Portuguese (Portugal)'],
                  female: ['Microsoft Maria - Portuguese (Brazil)', 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)', 'Microsoft Fernanda Online (Natural) - Portuguese (Portugal)']
                },
                google: {
                  male: ['Google português Male', 'Google Portuguese Male'],
                  female: ['Google português Female', 'Google Portuguese Female']
                },
                apple: {
                  male: ['Joaquim', 'Rafael'],
                  female: ['Joana', 'Luciana']
                },
                firefox: {
                  male: ['Portuguese (Brazil)', 'Português'],
                  female: ['Portuguese (Brazil)+f3', 'Português+f3']
                }
              },
              // Russian
              'ru': {
                microsoft: {
                  male: ['Microsoft Pavel - Russian (Russia)', 'Microsoft Dmitry Online (Natural) - Russian (Russia)'],
                  female: ['Microsoft Irina - Russian (Russia)', 'Microsoft Svetlana Online (Natural) - Russian (Russia)']
                },
                google: {
                  male: ['Google русский Male', 'Google Russian Male'],
                  female: ['Google русский Female', 'Google Russian Female']
                },
                apple: {
                  male: ['Yuri', 'Maxim'],
                  female: ['Katarina', 'Milena']
                },
                firefox: {
                  male: ['Russian (Russia)', 'Русский'],
                  female: ['Russian (Russia)+f3', 'Русский+f3']
                }
              },
              // Arabic
              'ar': {
                microsoft: {
                  male: ['Microsoft Naayf - Arabic (Saudi Arabia)', 'Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)'],
                  female: ['Microsoft Hoda - Arabic (Egypt)', 'Microsoft Zariyah Online (Natural) - Arabic (Saudi Arabia)']
                },
                google: {
                  male: ['Google العربية Male', 'Google Arabic Male'],
                  female: ['Google العربية Female', 'Google Arabic Female']
                },
                apple: {
                  male: ['Majed', 'Maged'],
                  female: ['Tarik', 'Laith'] // Note: Arabic voice names may vary
                },
                firefox: {
                  male: ['Arabic (Saudi Arabia)', 'العربية'],
                  female: ['Arabic (Saudi Arabia)+f3', 'العربية+f3']
                }
              },
              // Hindi
              'hi': {
                microsoft: {
                  male: ['Microsoft Prabhat - Hindi (India)', 'Microsoft Madhur Online (Natural) - Hindi (India)'],
                  female: ['Microsoft Kalpana - Hindi (India)', 'Microsoft Swara Online (Natural) - Hindi (India)']
                },
                google: {
                  male: ['Google हिन्दी Male', 'Google Hindi Male'],
                  female: ['Google हिन्दी Female', 'Google Hindi Female']
                },
                apple: {
                  male: ['Ravi', 'Sangeeta'], // Note: Hindi voice names may vary
                  female: ['Lekha', 'Veena']
                },
                firefox: {
                  male: ['Hindi (India)', 'हिन्दी'],
                  female: ['Hindi (India)+f3', 'हिन्दी+f3']
                }
              }
            };
            
            return voiceMap[lang] || voiceMap['en']; // フォールバック: 英語
          };

          const recommendedVoices = getRecommendedVoices(targetLang);
          
          const targetVoices = preferFemaleVoice 
            ? [...(recommendedVoices.microsoft?.female || []), ...(recommendedVoices.google?.female || []), ...(recommendedVoices.apple?.female || []), ...(recommendedVoices.firefox?.female || [])]
            : [...(recommendedVoices.microsoft?.male || []), ...(recommendedVoices.google?.male || []), ...(recommendedVoices.apple?.male || []), ...(recommendedVoices.firefox?.male || [])];
          
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
        };

        utterance.onerror = (event) => {
          console.warn('Speech synthesis failed for:', text, 'in language:', voiceLang, 'Error:', event.error);
          setIsPlaying(false);
        };

        // 読み上げ開始
        window.speechSynthesis.speak(utterance);
      };

      // 音声リストが既に読み込まれている場合
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // 音声リストの読み込み待機（現代ブラウザでは即座に利用可能）
        let voicesLoaded = false;
        
        const handleVoicesChanged = () => {
          if (voicesLoaded) return; // 重複実行防止
          voicesLoaded = true;
          loadVoices();
          window.speechSynthesis.onvoiceschanged = null;
        };
        
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        
        // 念のため200ms後にチェック（フォールバック）- ただし重複チェック
        setTimeout(() => {
          if (!voicesLoaded && window.speechSynthesis.getVoices().length > 0) {
            voicesLoaded = true;
            window.speechSynthesis.onvoiceschanged = null;
            loadVoices();
          }
        }, 200);
      }
    } catch (error) {
      console.warn('Speech synthesis initialization failed:', error);
      setIsPlaying(false);
    }
  };

  if (!isSupported) {
    return null; // サポートされていない場合は非表示
  }

  const sizeClasses = size === 'small' 
    ? 'w-6 h-6' 
    : 'w-8 h-8';
  
  const iconClasses = size === 'small' 
    ? 'w-3 h-3' 
    : 'w-4 h-4';

  return (
    <button
      onClick={handleSpeak}
      onTouchStart={(e) => {
        // タッチデバイス用: タッチ開始時にプリベント
        e.preventDefault();
      }}
      onTouchEnd={(e) => {
        // タッチデバイス用: タッチ終了時に実行
        e.preventDefault();
        handleSpeak();
      }}
      className={`
        inline-flex items-center justify-center
        ${sizeClasses} rounded-full
        bg-solarized-orange hover:bg-solarized-yellow 
        text-white transition-colors
        disabled:opacity-50
        touch-manipulation
        ${className}
      `}
      title={isPlaying ? t('audio.stop') : t('audio.play')}
      disabled={!text || text.trim() === ''}
    >
      {isPlaying ? (
        <VolumeX className={iconClasses} />
      ) : (
        <Volume2 className={iconClasses} />
      )}
    </button>
  );
}