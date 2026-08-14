"use client";

import React, { useState } from 'react';
import PlantCard from '@/components/PlantCard';
import { usePlants } from '@/hooks/usePlants';
import Hero from '@/components/Hero';
import Link from 'next/link';

const PlantSection = ({ title, plants, viewAllLink }: { title: string; plants: any[]; viewAllLink?: string }) => {
  const [visibleCount, setVisibleCount] = useState(12);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const canShowMore = visibleCount < plants.length;

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        {viewAllLink && (
          <Link 
            href={viewAllLink} 
            className="text-brand-green hover:text-emerald-600 font-semibold"
          >
            Alle anzeigen →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {plants.slice(0, visibleCount).map((plant, index) => (
          <PlantCard key={plant.id ?? `${plant.name}-${index}`} plant={plant} />
        ))}
      </div>
      {canShowMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleShowMore}
            className="bg-brand-green text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-600 transition-colors"
          >
            Mehr anzeigen
          </button>
        </div>
      )}
    </section>
  );
};

export default function Home() {
  const { plants, loading, error } = usePlants();

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
        {/* NUR ALLE PFLANZEN - nichts anderes */}
        <PlantSection 
          title="🌿 Alle Pflanzen" 
          plants={plants}
          viewAllLink="/all-plants"
        />
      </div>
    </>
  );
}