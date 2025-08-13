import React from 'react';
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
}

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  // Use a placeholder image if the plant has no images
  const imageUrl = plant.bilder?.[0] || 'https://via.placeholder.com/400x300.png?text=Kein+Bild';

  return (
    <Link href={`/plant/${encodeURIComponent(plant.name)}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div className="relative h-48">
          <Image
            src={imageUrl}
            alt={`Bild von ${plant.deutscherName}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
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
