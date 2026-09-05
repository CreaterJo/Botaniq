"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite as checkIsFavorite
} from '@/lib/supabase/queries';

const FAVORITES_KEY = 'botaniq_favorites';

export interface FavoritePlant {
  plant_id: string;
  plant_name: string;
}

export const useFavorites = () => {
  const { user, loading: userLoading } = useAuth();
  const isAuthenticated = !!user;
  const [favorites, setFavorites] = useState<FavoritePlant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    } else if (!userLoading) {
      // Offline mode - load from localStorage
      loadFromLocalStorage();
    }
  }, [isAuthenticated, user, userLoading]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load favorites from localStorage:', err);
    }
  };

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const favs = await getUserFavorites(user.id);
      setFavorites(favs.map(f => ({
        plant_id: f.plant_id,
        plant_name: f.plant_name || f.plant_id
      })));

      // Sync to localStorage for offline
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favs.map(f => ({ plant_id: f.plant_id, plant_name: f.plant_name })))
      );
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Favoriten');
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addFavorite = useCallback(async (plantId: string, plantName: string): Promise<boolean> => {
    if (!user) {
      // Offline: save to localStorage
      const newFav: FavoritePlant = { plant_id: plantId, plant_name: plantName };
      const updated = [...favorites, newFav];
      setFavorites(updated);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return true;
    }

    try {
      const success = await addToFavorites(user.id, plantId, plantName);
      if (success) {
        setFavorites(prev => [...prev, { plant_id: plantId, plant_name: plantName }]);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [user, favorites]);

  const removeFavorite = useCallback(async (plantId: string): Promise<boolean> => {
    if (!user) {
      // Offline: remove from localStorage
      const updated = favorites.filter(f => f.plant_id !== plantId);
      setFavorites(updated);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return true;
    }

    try {
      const success = await removeFromFavorites(user.id, plantId);
      if (success) {
        setFavorites(prev => prev.filter(f => f.plant_id !== plantId));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [user, favorites]);

  const toggleFavorite = useCallback(async (plantId: string, plantName: string): Promise<boolean> => {
    const alreadyFav = favorites.some(f => f.plant_id === plantId);
    if (alreadyFav) {
      return removeFavorite(plantId);
    }
    return addFavorite(plantId, plantName);
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback(async (plantId: string): Promise<boolean> => {
    if (!user) {
      return favorites.some(f => f.plant_id === plantId);
    }
    return checkIsFavorite(user.id, plantId);
  }, [user, favorites]);

  const favoriteCount = favorites.length;

  return {
    favorites,
    loading,
    error,
    favoriteCount,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  };
};
