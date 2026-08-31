"use client";

/**
 * GBIF (Global Biodiversity Information Facility) API Client
 *
 * Enthält bereits Pl@ntNet-Daten (2.6M+ Beobachtungen)
 * Dataset ID: 7a3679ef-5582-4aaa-81f0-8c2545cafc81
 *
 * API Dokumentation: https://www.gbif.org/developer/summary
 */

const GBIF_BASE_URL = 'https://api.gbif.org/v1';
const PLANTNET_DATASET_KEY = '7a3679ef-5582-4aaa-81f0-8c2545cafc81';

// Rate limiting: ~10 requests/second (höflich bleiben)
const requestQueue: Promise<any>[] = [];
const MAX_CONCURRENT_REQUESTS = 10;

async function throttledFetch(url: string): Promise<Response> {
  // Warte wenn zu viele parallele Requests
  while (requestQueue.length >= MAX_CONCURRENT_REQUESTS) {
    await Promise.race(requestQueue);
  }

  const promise = fetch(url)
    .then(response => {
      // Entferne aus Queue
      const index = requestQueue.indexOf(promise);
      if (index > -1) requestQueue.splice(index, 1);
      return response;
    })
    .catch(error => {
      // Entferne aus Queue auch bei Fehler
      const index = requestQueue.indexOf(promise);
      if (index > -1) requestQueue.splice(index, 1);
      throw error;
    });

  requestQueue.push(promise);
  return promise;
}

export interface GBIFPlant {
  key: number;
  scientificName: string;
  canonicalName: string;
  genus?: string;
  family?: string;
  order?: string;
  class?: string;
  kingdom?: string;
  taxonomicStatus?: string;
  rank?: string;
  vernacularNames?: Array<{
    vernacularName: string;
    language: string;
  }>;
}

export interface GBIFOccurrence {
  key: number;
  scientificName: string;
  family?: string;
  genus?: string;
  taxonKey: number;
  decimalLatitude?: number;
  decimalLongitude?: number;
  country?: string;
  eventDate?: string;
  media?: Array<{
    identifier: string;
    type: string;
    format: string;
    license?: string;
    creator?: string;
    created?: string;
  }>;
}

export interface GBIFImage {
  identifier: string;
  type: string;
  format: string;
  license?: string;
  creator?: string;
  created?: string;
}

export interface PlantSearchResult {
  results: GBIFPlant[];
  count: number;
  offset: number;
  limit: number;
  endOfRecords: boolean;
}

/**
 * Suche nach Pflanzen in der GBIF-Datenbank
 * Filtert automatisch auf Pl@ntNet-Dataset
 */
export async function searchPlants(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<PlantSearchResult> {
  try {
    const url = `${GBIF_BASE_URL}/species/search?q=${encodeURIComponent(query)}&datasetKey=${PLANTNET_DATASET_KEY}&limit=${limit}&offset=${offset}`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`GBIF API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GBIF searchPlants error:', error);
    throw error;
  }
}

/**
 * Hole Details zu einer spezifischen Pflanze
 */
export async function getPlantDetails(usageKey: number): Promise<GBIFPlant | null> {
  try {
    const url = `${GBIF_BASE_URL}/species/${usageKey}`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GBIF API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GBIF getPlantDetails error:', error);
    return null;
  }
}

/**
 * Hole alle verfügbaren Bilder für eine Pflanze
 * Nutzt die Occurrence API mit mediaType=StillImage
 */
export async function getPlantImages(
  taxonKey: number,
  limit: number = 200
): Promise<GBIFImage[]> {
  try {
    const url = `${GBIF_BASE_URL}/occurrence/search?taxonKey=${taxonKey}&mediaType=StillImage&limit=${limit}`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`GBIF API error: ${response.status}`);
    }

    const data = await response.json();
    const images: GBIFImage[] = [];

    // Extrahiere Bilder aus allen Occurrences
    if (data.results && Array.isArray(data.results)) {
      for (const occurrence of data.results) {
        if (occurrence.media && Array.isArray(occurrence.media)) {
          for (const media of occurrence.media) {
            if (media.type === 'StillImage' && media.identifier) {
              images.push({
                identifier: media.identifier,
                type: media.type,
                format: media.format || 'image/jpeg',
                license: media.license,
                creator: media.creator,
                created: media.created
              });
            }
          }
        }
      }
    }

    // Dedupliziere Bilder (gleiche URL)
    const uniqueImages = Array.from(
      new Map(images.map(img => [img.identifier, img])).values()
    );

    return uniqueImages.slice(0, limit);
  } catch (error) {
    console.error('GBIF getPlantImages error:', error);
    return [];
  }
}

/**
 * Hole neue Pflanzen seit einem bestimmten Datum
 * Nutzt lastInterpreted Filter
 */
export async function getLatestPlants(
  since: Date,
  limit: number = 500
): Promise<GBIFOccurrence[]> {
  try {
    // Format: YYYY-MM-DD
    const sinceStr = since.toISOString().split('T')[0];

    const url = `${GBIF_BASE_URL}/occurrence/search?datasetKey=${PLANTNET_DATASET_KEY}&lastInterpreted=${sinceStr},*&hasCoordinate=true&hasGeospatialIssue=false&limit=${limit}`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`GBIF API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('GBIF getLatestPlants error:', error);
    return [];
  }
}

/**
 * Hole deutsche Pflanzennamen (Vernacular Names)
 */
export async function getGermanName(usageKey: number): Promise<string | null> {
  try {
    const url = `${GBIF_BASE_URL}/species/${usageKey}/vernacularNames?language=deu`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].vernacularName;
    }

    return null;
  } catch (error) {
    console.error('GBIF getGermanName error:', error);
    return null;
  }
}

/**
 * Suche Pflanzen nach wissenschaftlichem Namen
 * Für deduplizierung und exakte Suche
 */
export async function searchByScientificName(
  scientificName: string
): Promise<GBIFPlant | null> {
  try {
    const url = `${GBIF_BASE_URL}/species/match?name=${encodeURIComponent(scientificName)}&kingdom=Plantae`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Prüfe ob Match erfolgreich war
    if (data.matchType === 'EXACT' || data.matchType === 'FUZZY') {
      return data;
    }

    return null;
  } catch (error) {
    console.error('GBIF searchByScientificName error:', error);
    return null;
  }
}

export const GBIFClient = {
  searchPlants,
  getPlantDetails,
  getPlantImages,
  getLatestPlants,
  getGermanName,
  searchByScientificName
};
