"use client";

import React, { useMemo, useState } from 'react';
import PlantCard from '@/components/PlantCard';
import { usePlants } from '@/hooks/usePlants';
import Link from 'next/link';

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Frühling';
  if (month >= 5 && month <= 7) return 'Sommer';
  if (month >= 8 && month <= 10) return 'Herbst';
  return 'Winter';
};

const BloomingPlantsPage = () => {
  const { plants, loading, error } = usePlants();
  const [visibleCount, setVisibleCount] = useState(12);

  const bloomingPlants = useMemo(() => {
    const currentSeason = getCurrentSeason();
    const currentMonth = new Date().toLocaleString('de-DE', { month: 'long' });
    
    return plants.filter(plant => 
      plant.bluehzeit?.includes(currentMonth) || 
      plant.bluehzeit?.includes(currentSeason) ||
      (plant.bluehzeit && plant.bluehzeit !== 'Unbekannt')
    );
  }, [plants]);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const canShowMore = visibleCount < bloomingPlants.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-12">Lade blühende Pflanzen...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-12 text-red-500">Fehler: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-brand-green hover:text-emerald-600 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Startseite
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Aktuell blühende Pflanzen</h1>
          <p className="text-lg text-gray-600">
            {bloomingPlants.length} Pflanzen blühen in dieser Saison
          </p>
        </div>

        {/* Pflanzen Grid */}
        {bloomingPlants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {bloomingPlants.slice(0, visibleCount).map((plant, index) => (
                <PlantCard key={plant.id ?? `${plant.name}-${index}`} plant={plant} />
              ))}
            </div>

            {/* Load More Button */}
            {canShowMore && (
              <div className="text-center">
                <button
                  onClick={handleShowMore}
                  className="bg-brand-green text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-600 transition-colors"
                >
                  Weitere blühende Pflanzen laden
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌼</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Keine blühenden Pflanzen gefunden</h3>
            <p className="text-gray-500">Entdecke stattdessen unsere gesamte Pflanzensammlung.</p>
            <Link 
              href="/all-plants" 
              className="inline-block mt-4 bg-brand-green text-white font-bold py-2 px-6 rounded-full hover:bg-emerald-600 transition-colors"
            >
              Alle Pflanzen anzeigen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloomingPlantsPage;