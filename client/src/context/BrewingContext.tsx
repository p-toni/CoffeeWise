import { createContext, useContext, useState } from 'react';

interface BrewingContextType {
  brewingId: string | null;
  setBrewingId: (id: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const BrewingContext = createContext<BrewingContextType | undefined>(undefined);

export function BrewingProvider({ children }: { children: React.ReactNode }) {
  const [brewingId, setBrewingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <BrewingContext.Provider
      value={{
        brewingId,
        setBrewingId,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </BrewingContext.Provider>
  );
}

export function useBrewing() {
  const context = useContext(BrewingContext);
  if (context === undefined) {
    throw new Error('useBrewing must be used within a BrewingProvider');
  }
  return context;
}
