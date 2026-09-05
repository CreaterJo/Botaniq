"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Plant } from '@/lib/supabase';
import {
  getPlants,
  searchPlants,
  getPlantByName,
  getPlantById,
  getPlantImages,
  getCategories,
  getSubcategories,
  getPlantsByCategory,
  loadLazyImages
} from '@/lib/supabase/queries';

interface UseSupabasePlantsOptions {
  limit?: number;
  initialCategory?: string;
  initialSubcategory?: string;
}

export const useSupabasePlants = (options: UseSupabasePlantsOptions = {}) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Initial load
  useEffect(() => {
    loadInitialPlants();
    loadCategories();
  }, []);

  const loadInitialPlants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { plants: loaded, total: count } = await getPlants(
        options.limit || 50,
        0,
        options.initialCategory,
        options.initialSubcategory
      );
      setPlants(loaded);
      setTotal(count);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Pflanzen');
    } finally {
      setLoading(false);
    }
  }, [options.limit, options.initialCategory, options.initialSubcategory]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const loadSubcategories = useCallback(async (category: string) => {
    try {
      const subs = await getSubcategories(category);
      setSubcategories(subs);
    } catch (err) {
      console.error('Failed to load subcategories:', err);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await searchPlants(query, 20);
      setPlants(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const currentCount = plants.length;
    setLoading(true);
    try {
      const { plants: more } = await getPlants(options.limit || 50, currentCount);
      setPlants(prev => [...prev, ...more]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [plants.length, options.limit]);

  const getPlant = useCallback(async (name: string) => {
    return await getPlantByName(name);
  }, []);

  const getPlantByIdUnsafe = useCallback(async (id: string) => {
    return await getPlantById(id);
  }, []);

  const getImages = useCallback(async (plantId: string) => {
    return await getPlantImages(plantId);
  }, []);

  const getLazyImages = useCallback(async (plantName: string, plantId: string) => {
    return await loadLazyImages(plantName, plantId);
  }, []);

  return {
    plants,
    loading,
    error,
    total,
    categories,
    subcategories,
    search,
    loadMore,
    getPlant,
    getPlantById: getPlantByIdUnsafe,
    getImages,
    getLazyImages,
    loadSubcategories,
    reload: loadInitialPlants
  };
};
