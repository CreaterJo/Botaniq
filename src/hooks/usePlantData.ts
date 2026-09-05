"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSupabasePlants } from './useSupabasePlants';
import { usePlantCleaner } from './usePlantCleaner';
import { useAuth } from './useAuth';
import { getLastSyncTimestamp } from '@/lib/apiSync';

export const usePlantData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [allPlantsLoaded, setAllPlantsLoaded] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [plants, setPlants] = useState<any[]>([]);

  const {
    plants: supabasePlants,
    loading: supabaseLoading,
    error: supabaseError,
    search,
    loadMore,
    getPlant,
    getImages,
    getLazyImages,
    categories,
    subcategories,
    reload
  } = useSupabasePlants();

  const { user } = useAuth();
  const { cleanAllPlants } = usePlantCleaner();

  useEffect(() => {
    if (supabaseLoading) {
      setLoading(true);
    } else if (supabaseError) {
      setError(supabaseError);
      setLoading(false);
    } else {
      setPlants(supabasePlants);
      setLoading(false);
      setAllPlantsLoaded(true);
    }
  }, [supabasePlants, supabaseLoading, supabaseError]);

  useEffect(() => {
    setLastSync(getLastSyncTimestamp());
  }, []);

  const refreshPlants = useCallback(() => {
    reload();
  }, [reload]);

  return {
    plants,
    loading,
    error,
    cleaningProgress,
    enhancementProgress,
    allPlantsLoaded,
    lastSync,
    refreshPlants,
    search,
    loadMore,
    getPlant,
    getImages,
    getLazyImages,
    categories,
    subcategories
  };
};
