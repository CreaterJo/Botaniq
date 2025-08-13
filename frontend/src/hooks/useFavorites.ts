"use client";

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'botaniq_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on initial render
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

  // Persist favorites to localStorage whenever they change
  const updateFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  };

  const addFavorite = useCallback((plantName: string) => {
    updateFavorites([...favorites, plantName]);
  }, [favorites]);

  const removeFavorite = useCallback((plantName: string) => {
    updateFavorites(favorites.filter(name => name !== plantName));
  }, [favorites]);

  const isFavorite = useCallback((plantName:string): boolean => {
    return favorites.includes(plantName);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
