import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Define the shape of a single plant object for type safety
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
  id?: string;
  kategorie?: string;
  unterkategorie?: string;
  pflanzzeit?: string;
}

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  // Use a placeholder image if the plant has no images and fallback on error
  const placeholderUrl = 'https://via.placeholder.com/400x300.png?text=Kein+Bild';

  const normalizedLatinName = useMemo(() => {
    return plant.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toLowerCase();
  }, [plant.name]);

  const localImageSrc = `/images/plants/${normalizedLatinName}.jpg`;
  const remoteImageSrc = plant.bilder?.[0];
  const [imgSrc, setImgSrc] = useState<string>(localImageSrc || remoteImageSrc || placeholderUrl);

  return (
    <Link href={`/plant/${encodeURIComponent(plant.name)}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div className="relative h-48">
          <Image
            src={imgSrc}
            alt={`Bild von ${plant.deutscherName}`}
            fill
            sizes="(max-width: 1024px) 100vw, 25vw"
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
            unoptimized
            onError={() => {
              if (imgSrc === localImageSrc && remoteImageSrc) {
                setImgSrc(remoteImageSrc);
                return;
              }
              if (imgSrc !== placeholderUrl) {
                setImgSrc(placeholderUrl);
              }
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{plant.deutscherName}</h3>
          <p className="text-sm text-brand-gray italic">{plant.name}</p>
          <div className="mt-2">
            <span className="inline-block bg-brand-green-light text-brand-green text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
              {plant.lichtbedarf}
            </span>
            <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
              {plant.pflegeaufwand}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;
