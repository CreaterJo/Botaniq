"use client";

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'botaniq_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
    }
  }, []);

  const updateFavorites = useCallback((newFavorites: string[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  }, []);

  const addFavorite = useCallback((plantName: string) => {
    updateFavorites([...favorites, plantName]);
  }, [favorites, updateFavorites]);

  const removeFavorite = useCallback((plantName: string) => {
    updateFavorites(favorites.filter(name => name !== plantName));
  }, [favorites, updateFavorites]);

  const isFavorite = useCallback((plantName: string): boolean => {
    return favorites.includes(plantName);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
