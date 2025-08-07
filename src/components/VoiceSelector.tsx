'use client';

import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useTranslations } from '@/hooks/useTranslations';

interface VoiceSelectorProps {
  onVoiceGenderChange: (isFemale: boolean) => void;
}

export function VoiceSelector({ onVoiceGenderChange }: VoiceSelectorProps) {
  const { preferFemaleVoice, setPreferFemaleVoice } = useVoice();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslations();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-2 rounded-full transition-all duration-300 transform hover:scale-110
          bg-solarized-base3 hover:bg-solarized-base1 shadow-md hover:shadow-lg border border-solarized-base1
          dark:bg-solarized-base03 dark:hover:bg-solarized-base01 dark:border-solarized-base01
          text-solarized-base01 hover:text-solarized-base3 dark:text-solarized-base1 dark:hover:text-solarized-base03
        "
        title={t('audio.selectVoiceGender')}
      >
        <Volume2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 min-w-40">
            <div className="py-1">
              <button
                onClick={() => {
                  setPreferFemaleVoice(false);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${!preferFemaleVoice ? 'bg-solarized-blue text-white' : ''}
                `}
              >
                <span className="text-lg">♂</span>
                <span className={`text-sm ${!preferFemaleVoice ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{t('audio.maleVoice')}</span>
                {!preferFemaleVoice && (
                  <span className="ml-auto text-white text-xs">✓</span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setPreferFemaleVoice(true);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${preferFemaleVoice ? 'bg-solarized-blue text-white' : ''}
                `}
              >
                <span className="text-lg">♀</span>
                <span className={`text-sm ${preferFemaleVoice ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{t('audio.femaleVoice')}</span>
                {preferFemaleVoice && (
                  <span className="ml-auto text-white text-xs">✓</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}