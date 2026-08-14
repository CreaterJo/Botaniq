"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import PlantCard from '@/components/PlantCard';
import { usePlants } from '@/hooks/usePlants';
import Link from 'next/link';

const FamilyPage = () => {
  const { name } = useParams<{ name: string }>();
  const { plants, loading, error } = usePlants();
  const [visibleCount, setVisibleCount] = useState(12);

  const decodedName = decodeURIComponent(name as string);
  const familyPlants = plants.filter(p => p.familie === decodedName);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const canShowMore = visibleCount < familyPlants.length;

  if (loading) {
    return <div className="text-center p-24">Lade Pflanzen...</div>;
  }

  if (error) {
    return <div className="text-center p-24 text-red-500">Fehler: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/families" className="inline-flex items-center text-brand-green hover:text-emerald-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Alle Familien
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{decodedName}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Familie: {decodedName}</h1>
          <p className="text-lg text-gray-600">
            {familyPlants.length} {familyPlants.length === 1 ? 'Pflanze' : 'Pflanzen'} in dieser Familie
          </p>
        </div>

        {/* Pflanzen Grid */}
        {familyPlants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {familyPlants.slice(0, visibleCount).map((plant, index) => (
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
                  Weitere Pflanzen laden
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌿</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Keine Pflanzen in dieser Familie gefunden</h3>
            <Link 
              href="/families" 
              className="inline-block mt-4 bg-brand-green text-white font-bold py-2 px-6 rounded-full hover:bg-emerald-600 transition-colors"
            >
              Andere Familien entdecken
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyPage;