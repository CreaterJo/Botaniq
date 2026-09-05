"use client";

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';

interface FavoriteButtonProps {
  plantName: string;
  plantId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  plantName,
  plantId,
  size = 'md',
  showLabel = false
}) => {
  const { isFavorite, toggleFavorite, favoritesLoading } = useUser();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFav, setIsFav] = useState<boolean>(false);

  React.useEffect(() => {
    isFavorite(plantName).then(setIsFav);
  }, [plantName, isFavorite]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    await toggleFavorite(plantName, plantId);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={handleClick}
        disabled={favoritesLoading}
        className={`
          flex items-center justify-center rounded-full transition-all duration-300
          ${sizeClasses[size]}
          ${isFav
            ? 'bg-brand-green text-white shadow-md'
            : 'bg-white text-gray-400 hover:text-brand-green hover:bg-brand-green-light'
          }
          ${isAnimating ? 'animate-pulse scale-110' : ''}
          ${favoritesLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        aria-label={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        title={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      >
        <svg
          className={`w-5 h-5 ${size === 'sm' ? 'w-4 h-4' : ''} ${isFav ? 'fill-current' : ''}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          fill={isFav ? 'currentColor' : 'none'}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {showLabel && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {isFav ? 'Entfernen' : 'Merken'}
        </span>
      )}
    </div>
  );
};

export default FavoriteButton;