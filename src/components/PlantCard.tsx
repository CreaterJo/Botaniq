import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ImageSource } from '@/lib/apiSync';

export interface Plant {
  name: string;
  deutscherName: string;
  familie: string;
  herkunft: string;
  lichtbedarf: string;
  pflegehinweise: string;
  standort: string;
  giessplan: string;
  duengplan: string;
  bluehzeit: string;
  wuchshoehe: string;
  besonderheiten: string;
  pflegeaufwand: string;
  bilder: string[];
  bilderQuellen?: ImageSource[];
  id?: string;
  kategorie?: string;
  unterkategorie?: string;
  pflanzzeit?: string;
  spezifikation?: string;
}

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop';
  
  const imageSrc = plant.bilder?.[0] || PLACEHOLDER_IMAGE;
  const [imgSrc, setImgSrc] = useState<string>(imageSrc);

  return (
    <Link href={`/plant/${encodeURIComponent(plant.name)}`} className="block group">
      {/* ✅ FESTE HÖHE für alle Karten */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-gray-100 h-full flex flex-col">
        
        {/* Bild Bereich - Feste Höhe */}
        <div className="relative h-48 flex-shrink-0">
          <Image
            src={imgSrc}
            alt={`Bild von ${plant.deutscherName}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300"
            onError={() => {
              setImgSrc(PLACEHOLDER_IMAGE);
            }}
          />
        </div>

        {/* Info Bereich - Flexibel aber konsistent */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Name */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-brand-green transition-colors mb-1">
            {plant.deutscherName}
          </h3>
          
          {/* Wissenschaftlicher Name */}
          <p className="text-sm text-gray-600 italic mb-2 line-clamp-1">
            {plant.name}
          </p>

          {/* Familie */}
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <span className="mr-1">🏷️</span>
            <span className="line-clamp-1">{plant.familie}</span>
          </div>

          {/* Details Grid - Feste Anzahl Zeilen */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {/* Lichtbedarf */}
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">☀️</span>
              <span className="text-gray-700 line-clamp-1">{plant.lichtbedarf}</span>
            </div>
            
            {/* Pflegeaufwand */}
            <div className="flex items-center space-x-1">
              <span className="text-green-500">💧</span>
              <span className="text-gray-700 line-clamp-1">{plant.pflegeaufwand}</span>
            </div>

            {/* Wuchshöhe - NUR anzeigen wenn nicht "Unbekannt" */}
            {plant.wuchshoehe && plant.wuchshoehe !== 'Unbekannt' && (
              <div className="flex items-center space-x-1">
                <span className="text-blue-500">📏</span>
                <span className="text-gray-700 line-clamp-1">{plant.wuchshoehe}</span>
              </div>
            )}

            {/* Blütezeit - NUR anzeigen wenn nicht "Unbekannt" */}
            {plant.bluehzeit && plant.bluehzeit !== 'Unbekannt' ? (
              <div className="flex items-center space-x-1">
                <span className="text-pink-500">🌸</span>
                <span className="text-gray-700 line-clamp-1">{plant.bluehzeit}</span>
              </div>
            ) : (
              /* Platzhalter um Layout konsistent zu halten */
              <div className="flex items-center space-x-1 opacity-0">
                <span>•</span>
                <span>•</span>
              </div>
            )}
          </div>

          {/* ✅ UNTERKATEGORIE LABEL ENTFERNT - nicht mehr anzeigen */}
          {/* {plant.unterkategorie && plant.unterkategorie !== 'Allgemein' && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <span className="inline-block bg-brand-green-light text-brand-green text-xs font-medium px-2 py-1 rounded-full">
                {plant.unterkategorie}
              </span>
            </div>
          )} */}
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;