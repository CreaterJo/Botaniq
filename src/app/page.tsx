"use client";

import React, { useState, useMemo } from 'react';
import PlantCard, { Plant } from '@/components/PlantCard';
import { usePlants } from '@/hooks/usePlants';
import Hero from '@/components/Hero';

const getSeason = (monthIndex: number): string => {
  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const seasonMap: { [key: string]: string[] } = {
    Frühling: ["März", "April", "Mai"],
    Sommer: ["Juni", "Juli", "August"],
    Herbst: ["September", "Oktober", "November"],
    Winter: ["Dezember", "Januar", "Februar"],
  };
  const currentMonth = monthNames[monthIndex];
  for (const season in seasonMap) {
    if (seasonMap[season].includes(currentMonth)) return season;
  }
  return "Frühling"; // Default
};

const PlantSection = ({ title, plants }: { title: string; plants: Plant[] }) => {
  const [visibleCount, setVisibleCount] = useState(4);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const canShowMore = visibleCount < plants.length;

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {plants.slice(0, visibleCount).map((plant, index) => (
          <PlantCard key={plant.id ?? `${plant.name}-${index}`} plant={plant} />
        ))}
      </div>
      <div className="text-center mt-12">
        <button
          onClick={handleShowMore}
          disabled={!canShowMore}
          className={`font-bold py-3 px-8 rounded-full transition-colors ${
            canShowMore
              ? 'bg-brand-green text-white hover:bg-emerald-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Mehr anzeigen
        </button>
      </div>
    </section>
  );
};


export default function Home() {
  const { plants, loading, error } = usePlants();

  const { plantNowPlants, seasonalPlants, allPlants } = useMemo(() => {
    const all: Plant[] = Array.isArray(plants) ? plants : [];

    const currentSeason = getSeason(new Date().getMonth());

    const plantNow = all.filter((p) => p.pflanzzeit?.includes(currentSeason));
    const seasonal = all.filter((p) => p.bluehzeit?.includes(currentSeason));

    // Ensure each section shows items; fallback to a slice of all plants if empty
    const fallback = (arr: Plant[]) => (arr.length > 0 ? arr : all.slice(0, 8));

    return {
      plantNowPlants: fallback(plantNow),
      seasonalPlants: fallback(seasonal),
      allPlants: all,
    };
  }, [plants]);

  if (loading) {
    return <div className="text-center p-24">Lade Pflanzen...</div>;
  }

  if (error) {
    return <div className="text-center p-24 text-red-500">Fehler: {error}</div>;
  }

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PlantSection title="Jetzt pflanzen" plants={plantNowPlants} />
        <PlantSection title="Blüht in dieser Saison" plants={seasonalPlants} />
        <PlantSection title="Alle Pflanzen entdecken" plants={allPlants} />
      </div>
    </>
  );
}
