'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VoiceContextType {
  preferFemaleVoice: boolean;
  setPreferFemaleVoice: (prefer: boolean) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [preferFemaleVoice, setPreferFemaleVoice] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voice-gender-preference');
      return saved === 'female';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voice-gender-preference', preferFemaleVoice ? 'female' : 'male');
    }
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