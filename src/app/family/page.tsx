"use client";

import React, { useMemo } from 'react';
import { usePlants } from '@/hooks/usePlants';
import Link from 'next/link';

const FamiliesPage = () => {
  const { plants, loading, error } = usePlants();

  const families = useMemo(() => {
    const familyMap: { [key: string]: number } = {};
    
    plants.forEach(plant => {
      if (plant.familie && plant.familie !== 'Unbekannt') {
        familyMap[plant.familie] = (familyMap[plant.familie] || 0) + 1;
      }
    });

    return Object.entries(familyMap)
      .sort((a, b) => b[1] - a[1])
      .map(([family, count]) => ({ family, count }));
  }, [plants]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-12">Lade Pflanzenfamilien...</div>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pflanzenfamilien</h1>
          <p className="text-lg text-gray-600">
            Entdecke {families.length} verschiedene Pflanzenfamilien
          </p>
        </div>

        {/* Familien Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {families.map(({ family, count }) => (
            <Link
              key={family}
              href={`/family/${family}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-brand-green"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{family}</h3>
              <p className="text-sm text-gray-600">{count} {count === 1 ? 'Pflanze' : 'Pflanzen'}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamiliesPage;