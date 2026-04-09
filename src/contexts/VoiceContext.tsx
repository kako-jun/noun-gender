'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/storage';

interface VoiceContextType {
  preferFemaleVoice: boolean;
  setPreferFemaleVoice: (prefer: boolean) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [preferFemaleVoice, setPreferFemaleVoice] = useState(() => {
    return storage.read().voiceGender === 'female';
  });

  useEffect(() => {
    storage.write({ voiceGender: preferFemaleVoice ? 'female' : 'male' });
  }, [preferFemaleVoice]);

  return (
    <VoiceContext.Provider value={{
      preferFemaleVoice,
      setPreferFemaleVoice
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}