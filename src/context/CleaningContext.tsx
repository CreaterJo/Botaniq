"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { usePlantCleaner } from '@/hooks/usePlantCleaner';

interface CleaningContextType {
  isCleaning: boolean;
  cleaningProgress: number;
  cleanedCount: number;
  totalCount: number;
  startCleaning: (plants: any[]) => Promise<void>;
  clearCache: () => void;
}

export const CleaningContext = createContext<CleaningContextType>({
  isCleaning: false,
  cleaningProgress: 0,
  cleanedCount: 0,
  totalCount: 0,
  startCleaning: async () => {},
  clearCache: () => {},
});

export const CleaningProvider = ({ children }: { children: ReactNode }) => {
  const [isCleaning, setIsCleaning] = React.useState(false);
  const [cleaningProgress, setCleaningProgress] = React.useState(0);
  const [cleanedCount, setCleanedCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);

  const { cleanAllPlants, clearCleaningCache } = usePlantCleaner();

  const startCleaning = async (plants: any[]) => {
    setIsCleaning(true);
    setCleaningProgress(0);
    setTotalCount(plants.length);
    setCleanedCount(0);

    try {
      const progressInterval = setInterval(() => {
        setCleaningProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 1;
        });
      }, 100);

      const result = await cleanAllPlants(plants);
      
      clearInterval(progressInterval);
      setCleaningProgress(100);
      setCleanedCount(result.cleanedCount);

      setTimeout(() => {
        setIsCleaning(false);
        setCleaningProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Fehler bei der KI-Bereinigung:', error);
      setIsCleaning(false);
      setCleaningProgress(0);
    }
  };

  const clearCache = () => {
    clearCleaningCache();
    setCleanedCount(0);
  };

  return (
    <CleaningContext.Provider value={{
      isCleaning,
      cleaningProgress,
      cleanedCount,
      totalCount,
      startCleaning,
      clearCache
    }}>
      {children}
    </CleaningContext.Provider>
  );
};

export const useCleaning = () => {
  const context = useContext(CleaningContext);
  if (context === undefined) {
    throw new Error('useCleaning must be used within a CleaningProvider');
  }
  return context;
};