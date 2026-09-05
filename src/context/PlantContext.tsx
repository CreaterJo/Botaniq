"use client";

import React, { createContext, ReactNode } from 'react';
import { usePlantData } from '@/hooks/usePlantData';
import { useUser } from '@/context/UserContext';
import type { Plant } from '@/components/PlantCard';

export interface PlantContextType {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  cleaningProgress: number;
  enhancementProgress: number;
  allPlantsLoaded: boolean;
  lastSync: Date | null;
  refreshPlants: () => void;
  userId: string | null;
  username: string | null;
  isFavorite: (plantName: string) => Promise<boolean>;
  toggleFavorite: (plantName: string, plantId: string) => Promise<boolean>;
}

export const PlantContext = createContext<PlantContextType>({
  plants: [],
  loading: true,
  error: null,
  cleaningProgress: 0,
  enhancementProgress: 0,
  allPlantsLoaded: false,
  lastSync: null,
  refreshPlants: () => {},
  userId: null,
  username: null,
  isFavorite: async () => false,
  toggleFavorite: async () => false,
});

export const PlantProvider = ({ children }: { children: ReactNode }) => {
  const plantData = usePlantData();
  const { userId, username, isFavorite, toggleFavorite } = useUser();

  return (
    <PlantContext.Provider value={{
      ...plantData,
      userId,
      username,
      isFavorite,
      toggleFavorite
    }}>
      {children}
    </PlantContext.Provider>
  );
};