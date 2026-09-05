"use client";

import React from 'react';
import { FavoritePlant } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { usePlants } from '@/hooks/usePlants';

interface UserContextType {
  // User
  userId: string | null;
  username: string | null;
  loading: boolean;
  isOffline: boolean;

  // Favorites
  favorites: FavoritePlant[];
  favoriteCount: number;
  favoritesLoading: boolean;
  addFavorite: (plantName: string, plantId: string) => Promise<boolean>;
  removeFavorite: (plantName: string) => Promise<boolean>;
  toggleFavorite: (plantName: string, plantId: string) => Promise<boolean>;
  isFavorite: (plantName: string) => Promise<boolean>;
}

export const UserContext = React.createContext<UserContextType>({
  userId: null,
  username: null,
  loading: true,
  isOffline: false,
  favorites: [],
  favoriteCount: 0,
  favoritesLoading: true,
  addFavorite: async () => false,
  removeFavorite: async () => false,
  toggleFavorite: async () => false,
  isFavorite: async () => false
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: userLoading, isOffline } = useAuth();
  const {
    favorites,
    favoriteCount,
    loading: favoritesLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  } = useFavorites();

  return (
    <UserContext.Provider
      value={{
        userId: user?.id || null,
        username: user?.username || null,
        loading: userLoading,
        isOffline,
        favorites,
        favoriteCount,
        favoritesLoading,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export const useUser = () => React.useContext(UserContext);
