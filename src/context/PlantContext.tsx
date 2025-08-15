"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import type { Plant } from '@/components/PlantCard';

interface PlantContextType {
  plants: Plant[];
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
export const PlantContext = createContext<PlantContextType>({
  plants: [],
  loading: true,
  error: null,
});

// Create the provider component
export const PlantProvider = ({ children }: { children: ReactNode }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Plant[]>('/data/plant.json');
        // Ensure the response data is an array before setting it
        if (Array.isArray(response.data)) {
          // Keep original data intact; keys will be handled at render sites
          setPlants(response.data);
        } else {
          // Handle cases where data is not an array, though not expected
          throw new Error("Fetched data is not an array");
        }
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(`Failed to fetch plant data: ${err.message}`);
        } else {
          setError('An unexpected error occurred while fetching data.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []); // Empty dependency array means this runs once on mount

  const value = { plants, loading, error };

  return (
    <PlantContext.Provider value={value}>
      {children}
    </PlantContext.Provider>
  );
};
