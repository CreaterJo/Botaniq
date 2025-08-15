"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
	latinName: string;
	remoteImages?: string[];
	altBase: string;
	maxLocalImages?: number;
}

const PLACEHOLDER = 'https://via.placeholder.com/1200x800.png?text=Kein+Bild';

function normalizeLatinName(name: string): string {
	return name
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^A-Za-z0-9]/g, '')
		.toLowerCase();
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ latinName, remoteImages = [], altBase, maxLocalImages = 10 }) => {
	const normalized = useMemo(() => normalizeLatinName(latinName), [latinName]);

	const candidateLocalImages = useMemo(() => {
		const base = `/images/plants/${normalized}.jpg`;
		const numbered = Array.from({ length: maxLocalImages }, (_, idx) => `/images/plants/${normalized}_${idx + 1}.jpg`);
		return [base, ...numbered];
	}, [normalized, maxLocalImages]);

	const allCandidates = useMemo(() => {
		const seen = new Set<string>();
		const ordered: string[] = [];
		for (const src of [...remoteImages, ...candidateLocalImages]) {
			if (src && !seen.has(src)) {
				seen.add(src);
				ordered.push(src);
			}
		}
		return ordered;
	}, [candidateLocalImages, remoteImages]);

	const [validatedImages, setValidatedImages] = useState<string[]>([PLACEHOLDER]);
	const [isValidating, setIsValidating] = useState<boolean>(true);

	useEffect(() => {
		const validateImages = async () => {
			const valid: string[] = [];
			const promises = allCandidates.map(src => {
				return new Promise<void>(resolve => {
					const img = new window.Image();
					img.src = src;
					img.onload = () => {
						valid.push(src);
						resolve();
					};
					img.onerror = () => {
						resolve();
					};
				});
			});

			await Promise.all(promises);

			if (valid.length > 0) {
				setValidatedImages(valid);
			}
			setIsValidating(false);
		};

		validateImages();
	}, [allCandidates]);

	const [currentIndex, setCurrentIndex] = useState<number>(0);

	const goNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % validatedImages.length);
	}, [validatedImages.length]);

	const goPrev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + validatedImages.length) % validatedImages.length);
	}, [validatedImages.length]);

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') {
				goNext();
			} else if (e.key === 'ArrowLeft') {
				goPrev();
			}
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [goNext, goPrev]);

	const currentSrc = validatedImages[currentIndex] || PLACEHOLDER;

	if (isValidating) {
		return (
			<div className="w-full aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center">
				<p className="text-brand-gray">Bilder werden geladen...</p>
			</div>
		)
	}

	return (
		<div className="w-full">
			<div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
				<Image
					src={currentSrc}
					alt={`${altBase} (${currentIndex + 1}/${validatedImages.length})`}
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					style={{ objectFit: 'cover' }}
					unoptimized
				/>
				{validatedImages.length > 1 && (
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
			{validatedImages.length > 1 && (
				<div className="flex justify-center gap-2 mt-3">
					{validatedImages.map((_, idx) => (
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
