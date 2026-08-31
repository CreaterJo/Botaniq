"use client";

/**
 * iNaturalist API Client
 *
 * 96+ Millionen Pflanzenbilder mit Community-Verifizierung
 * API Dokumentation: https://api.inaturalist.org/v1/docs/
 */

const INATURALIST_BASE_URL = 'https://api.inaturalist.org/v1';

// Rate limiting: 100 requests/minute
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 100;

async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Entferne alte Timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  // Warte wenn Limit erreicht
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestTimestamp = requestTimestamps[0];
    const waitTime = 60000 - (now - oldestTimestamp) + 100; // +100ms Buffer
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return throttledFetch(url); // Retry
  }

  requestTimestamps.push(now);
  return fetch(url);
}

export interface iNatTaxon {
  id: number;
  name: string;
  rank: string;
  iconic_taxon_name?: string;
  preferred_common_name?: string;
  default_photo?: {
    url: string;
    attribution: string;
    license_code?: string;
  };
  taxon_photos?: Array<{
    photo: {
      id: number;
      url: string;
      attribution: string;
      license_code?: string;
    };
  }>;
}

export interface iNatObservation {
  id: number;
  taxon?: {
    id: number;
    name: string;
    preferred_common_name?: string;
  };
  photos?: Array<{
    id: number;
    url: string;
    attribution: string;
    license_code?: string;
  }>;
  location?: string;
  created_at: string;
  observed_on: string;
  quality_grade: string;
}

export interface iNatPhoto {
  url: string;
  attribution: string;
  license?: string;
  id: number;
}

/**
 * Suche Taxon (Pflanzenart) nach wissenschaftlichem Namen
 */
export async function searchTaxon(scientificName: string): Promise<iNatTaxon | null> {
  try {
    const url = `${INATURALIST_BASE_URL}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&iconic_taxa=Plantae&per_page=1`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`iNaturalist API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error('iNaturalist searchTaxon error:', error);
    return null;
  }
}

/**
 * Hole Research-Grade Beobachtungen für eine Pflanzenart
 * quality_grade=research bedeutet von Community verifiziert
 */
export async function searchObservations(
  taxonId: number,
  limit: number = 50
): Promise<iNatObservation[]> {
  try {
    const url = `${INATURALIST_BASE_URL}/observations?taxon_id=${taxonId}&quality_grade=research&order=desc&order_by=created_at&per_page=${limit}&photos=true`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`iNaturalist API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('iNaturalist searchObservations error:', error);
    return [];
  }
}

/**
 * Hole alle Fotos für ein Taxon (Pflanzenart)
 * Nutzt die taxon_photos Endpoint für kuratierte Bilder
 */
export async function getTaxonPhotos(
  scientificName: string,
  limit: number = 50
): Promise<iNatPhoto[]> {
  try {
    // 1. Finde Taxon ID
    const taxon = await searchTaxon(scientificName);
    if (!taxon) {
      console.log(`iNaturalist: Taxon nicht gefunden für "${scientificName}"`);
      return [];
    }

    // 2. Hole Fotos über Observations
    const observations = await searchObservations(taxon.id, limit);

    const photos: iNatPhoto[] = [];

    // Extrahiere Fotos aus Beobachtungen
    for (const obs of observations) {
      if (obs.photos && obs.photos.length > 0) {
        for (const photo of obs.photos) {
          // Nutze Medium-Größe für bessere Qualität
          const mediumUrl = photo.url.replace('square', 'medium');

          photos.push({
            id: photo.id,
            url: mediumUrl,
            attribution: photo.attribution,
            license: photo.license_code
          });

          if (photos.length >= limit) break;
        }
      }
      if (photos.length >= limit) break;
    }

    // Dedupliziere
    const uniquePhotos = Array.from(
      new Map(photos.map(p => [p.id, p])).values()
    );

    return uniquePhotos.slice(0, limit);
  } catch (error) {
    console.error('iNaturalist getTaxonPhotos error:', error);
    return [];
  }
}

/**
 * Hole Fotos einer spezifischen Beobachtung
 */
export async function getObservationPhotos(observationId: number): Promise<iNatPhoto[]> {
  try {
    const url = `${INATURALIST_BASE_URL}/observations/${observationId}`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`iNaturalist API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const observation = data.results[0];

      if (observation.photos && observation.photos.length > 0) {
        return observation.photos.map((photo: any) => ({
          id: photo.id,
          url: photo.url.replace('square', 'medium'),
          attribution: photo.attribution,
          license: photo.license_code
        }));
      }
    }

    return [];
  } catch (error) {
    console.error('iNaturalist getObservationPhotos error:', error);
    return [];
  }
}

/**
 * Hole deutsche Pflanzennamen aus iNaturalist
 */
export async function getGermanCommonName(scientificName: string): Promise<string | null> {
  try {
    const url = `${INATURALIST_BASE_URL}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&iconic_taxa=Plantae&locale=de&per_page=1`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const taxon = data.results[0];
      return taxon.preferred_common_name || null;
    }

    return null;
  } catch (error) {
    console.error('iNaturalist getGermanCommonName error:', error);
    return null;
  }
}

/**
 * Hole viele Fotos für mehrere Pflanzen gleichzeitig (Batch)
 * Optimiert für Performance
 */
export async function batchGetTaxonPhotos(
  scientificNames: string[],
  photosPerPlant: number = 20
): Promise<Map<string, iNatPhoto[]>> {
  const result = new Map<string, iNatPhoto[]>();

  // Batch requests in Gruppen von 10
  const BATCH_SIZE = 10;

  for (let i = 0; i < scientificNames.length; i += BATCH_SIZE) {
    const batch = scientificNames.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async name => {
      const photos = await getTaxonPhotos(name, photosPerPlant);
      return { name, photos };
    });

    const results = await Promise.all(promises);

    results.forEach(({ name, photos }) => {
      result.set(name, photos);
    });

    // Kleine Pause zwischen Batches
    if (i + BATCH_SIZE < scientificNames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return result;
}

export const iNaturalistClient = {
  searchTaxon,
  searchObservations,
  getTaxonPhotos,
  getObservationPhotos,
  getGermanCommonName,
  batchGetTaxonPhotos
};
