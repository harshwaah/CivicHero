'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { GeminiProvider } from './geminiProvider';
import { CommunityIntelligenceAgent } from './communityIntelligenceAgent';
import { AdministratorCopilot } from './administratorCopilot';
import { CommunityIntegrityAgent } from './communityIntegrityAgent';

interface AIContextProps {
  gemini: typeof GeminiProvider;
  intelligence: typeof CommunityIntelligenceAgent;
  copilot: typeof AdministratorCopilot;
  integrity: typeof CommunityIntegrityAgent;
}

const AIContext = createContext<AIContextProps | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const value: AIContextProps = {
    gemini: GeminiProvider,
    intelligence: CommunityIntelligenceAgent,
    copilot: AdministratorCopilot,
    integrity: CommunityIntegrityAgent,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
