"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
\tlatinName: string;
\tremoteImages?: string[];
\taltBase: string;
\tmaxLocalImages?: number;
}

const PLACEHOLDER = 'https://via.placeholder.com/1200x800.png?text=Kein+Bild';

function normalizeLatinName(name: string): string {
\treturn name
\t\t.normalize('NFKD')
\t\t.replace(/[\u0300-\u036f]/g, '')
\t\t.replace(/[^A-Za-z0-9]/g, '')
\t\t.toLowerCase();
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ latinName, remoteImages = [], altBase, maxLocalImages = 10 }) => {
\tconst normalized = useMemo(() => normalizeLatinName(latinName), [latinName]);

\tconst candidateLocalImages = useMemo(() => {
\t\tconst base = `/images/plants/${normalized}.jpg`;
\t\tconst numbered = Array.from({ length: maxLocalImages }, (_, idx) => `/images/plants/${normalized}_${idx + 1}.jpg`);
\t\treturn [base, ...numbered];
\t}, [normalized, maxLocalImages]);

\t// Merge local candidates with any remote images while preserving order, and remove duplicates
\tconst allCandidates = useMemo(() => {
\t\tconst seen = new Set<string>();
\t\tconst ordered: string[] = [];
\t\tfor (const src of [...candidateLocalImages, ...remoteImages]) {
\t\t\tif (src && !seen.has(src)) {
\t\t\t\tseen.add(src);
\t\t\t\tordered.push(src);
\t\t\t}
\t\t}
\t\treturn ordered.length > 0 ? ordered : [PLACEHOLDER];
\t}, [candidateLocalImages, remoteImages]);

\tconst [currentIndex, setCurrentIndex] = useState<number>(0);
\tconst [currentSrc, setCurrentSrc] = useState<string>(allCandidates[0]);

\tuseEffect(() => {
\t\tsetCurrentIndex(0);
\t\tsetCurrentSrc(allCandidates[0]);
\t}, [allCandidates]);

\tconst goNext = () => setCurrentIndex((prev) => (prev + 1) % allCandidates.length);
\tconst goPrev = () => setCurrentIndex((prev) => (prev - 1 + allCandidates.length) % allCandidates.length);

\tuseEffect(() => {
\t\tsetCurrentSrc(allCandidates[currentIndex]);
\t}, [currentIndex, allCandidates]);

\t// Keyboard navigation
\tuseEffect(() => {
\t\tconst handleKey = (e: KeyboardEvent) => {
\t\t\tif (e.key === 'ArrowRight') goNext();
\t\t\tif (e.key === 'ArrowLeft') goPrev();
\t\t};
\t\twindow.addEventListener('keydown', handleKey);
\t\treturn () => window.removeEventListener('keydown', handleKey);
\t}, []);

\treturn (
\t\t<div className="w-full">
\t\t\t<div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
\t\t\t\t<Image
\t\t\t\t\tsrc={currentSrc}
\t\t\t\t\talt={`${altBase} (${currentIndex + 1}/${allCandidates.length})`}
\t\t\t\t\tfill
\t\t\t\t\tsizes="(max-width: 1024px) 100vw, 50vw"
\t\t\t\t\tstyle={{ objectFit: 'cover' }}
\t\t\t\t\tunoptimized
\t\t\t\t\tonError={() => {
\t\t\t\t\t\tsetCurrentSrc(PLACEHOLDER);
\t\t\t\t\t}}
\t\t\t\t/>
\t\t\t\t<button
\t\t\t\t\tonClick={goPrev}
\t\t\t\t\tclassName="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
\t\t\t\t\taria-label="Vorheriges Bild"
\t\t\t\t>
\t\t\t\t\t&#10094;
\t\t\t\t</button>
\t\t\t\t<button
\t\t\t\t\tonClick={goNext}
\t\t\t\t\tclassName="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
\t\t\t\t\taria-label="Nächstes Bild"
\t\t\t\t>
\t\t\t\t\t&#10095;
\t\t\t\t</button>
\t\t\t</div>
\t\t\t{/* Dots */}
\t\t\t<div className="flex justify-center gap-2 mt-3">
\t\t\t\t{allCandidates.map((_, idx) => (
\t\t\t\t\t<button
\t\t\t\t\t\tkey={idx}
\t\t\t\t\t\tonClick={() => setCurrentIndex(idx)}
\t\t\t\t\t\tclassName={`h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-brand-green' : 'bg-gray-300'}`}
\t\t\t\t\t\taria-label={`Gehe zu Bild ${idx + 1}`}
\t\t\t\t\t/>
\t\t\t\t))}
\t\t\t</div>
\t\t</div>
\t);
};

export default ImageCarousel;


