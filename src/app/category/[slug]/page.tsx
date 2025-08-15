"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import PlantCard from '@/components/PlantCard';
import { usePlants } from '@/hooks/usePlants';
import Link from 'next/link';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { plants, loading, error } = usePlants();

  const decodedSlug = decodeURIComponent(slug);

  const filteredPlants = plants.filter(p => p.unterkategorie === decodedSlug || p.kategorie === decodedSlug);

  if (loading) {
    return <div className="text-center p-24">Lade Pflanzen...</div>;
  }

  if (error) {
    return <div className="text-center p-24 text-red-500">Fehler: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <Link href="/" className="text-brand-green hover:underline">
          &larr; Zurück zur Startseite
        </Link>
        <h1 className="text-4xl font-bold text-gray-800 mt-4">
          Kategorie: {decodedSlug}
        </h1>
      </div>

      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredPlants.map((plant, index) => (
            <PlantCard key={plant.id ?? `${plant.name}-${index}`} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="text-center text-brand-gray p-12 border-2 border-dashed rounded-lg">
          <p>In der Kategorie "{decodedSlug}" wurden keine Pflanzen gefunden.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
