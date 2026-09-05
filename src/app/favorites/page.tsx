"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useSupabasePlants } from '@/hooks/useSupabasePlants';
import PlantCard from '@/components/PlantCard';
import Link from 'next/link';

const FavoritesPage: React.FC = () => {
  const { favorites, favoriteCount, loading: userLoading, username } = useUser();
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { getPlantById } = useSupabasePlants();

  useEffect(() => {
    if (favorites.length > 0) {
      loadFavoritePlants();
    } else {
      setLoading(false);
    }
  }, [favorites]);

  const loadFavoritePlants = async () => {
    setLoading(true);
    const loaded: any[] = [];

    for (const fav of favorites) {
      const plant = await getPlantById(fav.plant_id);
      if (plant) {
        loaded.push(plant);
      }
    }

    setPlants(loaded);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-brand-green hover:underline text-sm mb-4 inline-block">
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Meine Favoriten
        </h1>
        <p className="text-gray-600 mt-2">
          {username && <span className="font-medium">{username}</span>} hat {favoriteCount} Favoriten
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg h-80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && favorites.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Noch keine Favoriten
          </h2>
          <p className="text-gray-600 mb-6">
            Entdecke Pflanzen und speichere sie als Favorit!
          </p>
          <Link
            href="/"
            className="inline-block bg-brand-green text-white px-6 py-3 rounded-full font-medium hover:bg-brand-green-dark transition-colors"
          >
            Pflanzen entdecken
          </Link>
        </div>
      )}

      {/* Plants Grid */}
      {!loading && plants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
