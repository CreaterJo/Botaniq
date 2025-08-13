"use client"; // This is a client component because it uses hooks

import React, { useState, useMemo } from 'react';
import PlantCard, { Plant } from '@/components/PlantCard';
import { usePlants } from '@/hooks/usePlants';

// Helper to get the German month name from a month index (0-11)
const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  return monthNames[monthIndex];
};

export default function Home() {
  const { plants, loading, error } = usePlants();
  const [visibleCount, setVisibleCount] = useState(8); // Show 8 plants initially

  const seasonalPlants = useMemo(() => {
    if (!plants) return [];

    const currentMonthName = getMonthName(new Date().getMonth());

    return plants.filter(plant =>
      plant.bluehzeit && plant.bluehzeit.includes(currentMonthName)
    );
  }, [plants]);

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 8);
  };

  if (loading) {
    return <div className="text-center p-24">Lade Pflanzen...</div>;
  }

  if (error) {
    return <div className="text-center p-24 text-red-500">Fehler: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Pflanzen der Saison</h1>
        <p className="text-lg text-brand-gray mt-2">
          Entdecke, was gerade blüht und gedeiht.
        </p>
      </div>

      {seasonalPlants.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {seasonalPlants.slice(0, visibleCount).map(plant => (
              <PlantCard key={plant.name} plant={plant} />
            ))}
          </div>
          {visibleCount < seasonalPlants.length && (
            <div className="text-center mt-12">
              <button
                onClick={handleShowMore}
                className="bg-brand-green text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-600 transition-colors"
              >
                Mehr anzeigen
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-brand-gray p-12 border-2 border-dashed rounded-lg">
          <p>Für die aktuelle Saison wurden keine blühenden Pflanzen gefunden.</p>
          <p className="text-sm mt-2">Schau dir doch alle unsere Pflanzen an.</p>
           {/* This could later be a link to an "All Plants" page */}
        </div>
      )}
    </div>
  );
}
