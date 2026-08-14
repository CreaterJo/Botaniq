"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  plant: any; // Die komplette Pflanze mit bilder array
  altBase: string;
}

const PLACEHOLDER = 'https://via.placeholder.com/1200x800.png?text=Kein+Bild';

const ImageCarousel: React.FC<ImageCarouselProps> = ({ plant, altBase }) => {
  // VERWENDE DIREKT DIE BILDER AUS DER PLANT.DATEN
  const images = plant.bilder && plant.bilder.length > 0 ? plant.bilder : [PLACEHOLDER];
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSrc, setCurrentSrc] = useState<string>(images[0]);

  useEffect(() => {
    setCurrentSrc(images[currentIndex]);
  }, [currentIndex, images]);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={currentSrc}
          alt={`${altBase} (${currentIndex + 1}/${images.length})`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          onError={() => {
            setCurrentSrc(PLACEHOLDER);
          }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
              aria-label="Vorheriges Bild"
            >
              &#10094;
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
              aria-label="Nächstes Bild"
            >
              &#10095;
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_img: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-brand-green' : 'bg-gray-300'}`}
              aria-label={`Gehe zu Bild ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;