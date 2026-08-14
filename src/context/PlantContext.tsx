"use client";

import React, { createContext, ReactNode } from 'react';
import { usePlantData } from '@/hooks/usePlantData';
import type { Plant } from '@/components/PlantCard';

interface PlantContextType {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  cleaningProgress: number;
  enhancementProgress: number;
  allPlantsLoaded: boolean;
  refreshPlants: () => void;
}

export const PlantContext = createContext<PlantContextType>({
  plants: [],
  loading: true,
  error: null,
  cleaningProgress: 0,
  enhancementProgress: 0,
  allPlantsLoaded: false,
  refreshPlants: () => {},
});

export const PlantProvider = ({ children }: { children: ReactNode }) => {
  const plantData = usePlantData();

  return (
    <PlantContext.Provider value={plantData}>
      {children}
    </PlantContext.Provider>
  );
};