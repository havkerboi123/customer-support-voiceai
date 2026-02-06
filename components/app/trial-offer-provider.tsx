'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

interface TrialOfferContextType {
  showPostTrialOffer: boolean;
  setShowPostTrialOffer: (show: boolean) => void;
}

const TrialOfferContext = createContext<TrialOfferContextType | undefined>(undefined);

export function TrialOfferProvider({ children }: { children: ReactNode }) {
  const [showPostTrialOffer, setShowPostTrialOffer] = useState(false);

  return (
    <TrialOfferContext.Provider value={{ showPostTrialOffer, setShowPostTrialOffer }}>
      {children}
    </TrialOfferContext.Provider>
  );
}

export function useTrialOffer() {
  const context = useContext(TrialOfferContext);
  if (context === undefined) {
    throw new Error('useTrialOffer must be used within TrialOfferProvider');
  }
  return context;
}
