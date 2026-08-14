// components/PlantGrid.tsx
"use client";

import { useState, useEffect } from 'react';
import PlantCard from './PlantCard'; // ✅ Default Import
import type { Plant } from './PlantCard';

interface PlantGridProps {
  plants: Plant[];
}

export const PlantGrid = ({ plants }: PlantGridProps) => {
  const [visibleCount, setVisibleCount] = useState(30);

  const visiblePlants = plants.slice(0, visibleCount);
  const hasMore = visibleCount < plants.length;

  return (
    <div>
      {/* ✅ Lade-Info */}
      {hasMore && (
        <div className="text-center mb-6 p-4 bg-green-50 rounded-lg sticky top-0 z-10">
          <button
            onClick={() => setVisibleCount(prev => prev + 30)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            📥 30 weitere Pflanzen laden 
            ({plants.length - visibleCount} verbleibend)
          </button>
        </div>
      )}

      {/* ✅ Pflanzen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePlants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>

      {/* ✅ Button am Ende */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 30)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            📥 30 weitere Pflanzen laden
          </button>
        </div>
      )}
    </div>
  );
};