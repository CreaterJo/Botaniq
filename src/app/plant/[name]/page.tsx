"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ImageCarousel from '@/components/ImageCarousel';
import { usePlants } from '@/hooks/usePlants';
import { useFavorites } from '@/hooks/useFavorites';
import Link from 'next/link';

const PlantDetailPage = () => {
  const { name } = useParams<{ name: string }>();
  const { plants, loading, error } = usePlants();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Decode the plant name from the URL
  const decodedName = decodeURIComponent(name);

  const plant = plants.find(p => p.name === decodedName);
  const isCurrentlyFavorite = plant ? isFavorite(plant.name) : false;

  const handleFavoriteToggle = () => {
    if (!plant) return;
    if (isCurrentlyFavorite) {
      removeFavorite(plant.name);
    } else {
      addFavorite(plant.name);
    }
  };


  if (loading) {
    return <div className="text-center p-24">Lade Pflanzendetails...</div>;
  }

  if (error) {
    return <div className="text-center p-24 text-red-500">Fehler: {error}</div>;
  }

  if (!plant) {
    return (
      <div className="text-center p-24">
        <h1 className="text-2xl font-bold">Pflanze nicht gefunden</h1>
        <p className="text-brand-gray mt-2">Die Pflanze &quot;{decodedName}&quot; konnte nicht in unserer Datenbank gefunden werden.</p>
        <Link href="/" className="mt-6 inline-block bg-brand-green text-white font-bold py-3 px-6 rounded-full hover:bg-emerald-600">
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Image Section */}
        <ImageCarousel latinName={plant.name} remoteImages={plant.bilder} altBase={`Bild von ${plant.deutscherName}`} />

        {/* Details Section */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">{plant.deutscherName}</h1>
              <p className="text-xl text-brand-gray italic mt-1">{plant.name}</p>
            </div>
            <button
              onClick={handleFavoriteToggle}
              className="p-2 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-100 transition-colors"
              aria-label={isCurrentlyFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isCurrentlyFavorite ? 'text-yellow-400' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>

          <div className="mt-6 prose prose-lg max-w-none">
            <p>{plant.besonderheiten}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-800">Lichtbedarf</h3>
              <p className="text-brand-gray">{plant.lichtbedarf}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-800">Pflegeaufwand</h3>
              <p className="text-brand-gray">{plant.pflegeaufwand}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-800">Standort</h3>
              <p className="text-brand-gray">{plant.standort}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-800">Blütezeit</h3>
              <p className="text-brand-gray">{plant.bluehzeit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Details Section */}
      <div className="mt-16 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Alle Details</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="border-t border-gray-200 pt-4">
            <dt className="font-medium text-gray-900">Familie</dt>
            <dd className="mt-1 text-brand-gray">{plant.familie}</dd>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <dt className="font-medium text-gray-900">Herkunft</dt>
            <dd className="mt-1 text-brand-gray">{plant.herkunft}</dd>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <dt className="font-medium text-gray-900">Wuchshöhe</dt>
            <dd className="mt-1 text-brand-gray">{plant.wuchshoehe}</dd>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <dt className="font-medium text-gray-900">Gießplan</dt>
            <dd className="mt-1 text-brand-gray">{plant.giessplan}</dd>
          </div>
          <div className="border-t border-gray-200 pt-4 col-span-full">
            <dt className="font-medium text-gray-900">Pflegehinweise</dt>
            <dd className="mt-1 text-brand-gray">{plant.pflegehinweise}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default PlantDetailPage;
