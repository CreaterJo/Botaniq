"use client";

/**
 * API Sync - Zentrale Synchronisierungs-Logik
 *
 * Kombiniert GBIF und iNaturalist APIs für maximale Pflanzenanzahl und Bilder
 */

import { Plant } from '@/components/PlantCard';
import { GBIFClient, GBIFPlant, GBIFImage } from './apiClients/gbifClient';
import { iNaturalistClient, iNatPhoto } from './apiClients/inaturalistClient';

export interface ImageSource {
  url: string;
  quelle: 'GBIF' | 'iNaturalist' | 'PlantNet';
  lizenz?: string;
  autor?: string;
}

export interface SyncResult {
  newPlants: Plant[];
  updatedPlants: Plant[];
  newImagesCount: number;
  errors: string[];
  totalProcessed: number;
}

const SYNC_TIMESTAMP_KEY = 'botaniq_last_sync_timestamp';
const SYNC_VERSION_KEY = 'botaniq_sync_version';
const CURRENT_SYNC_VERSION = '2.0'; // Erhöhe bei Breaking Changes

/**
 * Hole den Zeitstempel des letzten Syncs
 */
export function getLastSyncTimestamp(): Date | null {
  if (typeof window === 'undefined') return null;

  const timestamp = localStorage.getItem(SYNC_TIMESTAMP_KEY);
  if (!timestamp) return null;

  return new Date(parseInt(timestamp));
}

/**
 * Setze den Zeitstempel des letzten Syncs
 */
export function setLastSyncTimestamp(date: Date = new Date()): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(SYNC_TIMESTAMP_KEY, date.getTime().toString());
  localStorage.setItem(SYNC_VERSION_KEY, CURRENT_SYNC_VERSION);
}

/**
 * Prüfe ob ein Sync nötig ist (älter als 24h)
 */
export function isSyncNeeded(): boolean {
  const lastSync = getLastSyncTimestamp();
  if (!lastSync) return true;

  const hoursSinceLastSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastSync >= 24;
}

/**
 * Hole Bilder für eine Pflanze von beiden APIs
 */
async function fetchPlantImages(
  scientificName: string,
  gbifKey: number
): Promise<ImageSource[]> {
  const images: ImageSource[] = [];

  try {
    // 1. GBIF Bilder holen (bis zu 20)
    console.log(`📸 Hole GBIF-Bilder für ${scientificName}...`);
    const gbifImages = await GBIFClient.getPlantImages(gbifKey, 20);

    images.push(...gbifImages.map((img: GBIFImage) => ({
      url: img.identifier,
      quelle: 'GBIF' as const,
      lizenz: img.license,
      autor: img.creator
    })));

    console.log(`✅ ${gbifImages.length} GBIF-Bilder gefunden`);

    // 2. iNaturalist Bilder holen (nur wenn < 10 GBIF Bilder)
    if (images.length < 10) {
      console.log(`📸 Hole zusätzliche iNaturalist-Bilder...`);
      const inatPhotos = await iNaturalistClient.getTaxonPhotos(scientificName, 10);

      images.push(...inatPhotos.map((photo: iNatPhoto) => ({
        url: photo.url,
        quelle: 'iNaturalist' as const,
        lizenz: photo.license,
        autor: photo.attribution
      })));

      console.log(`✅ ${inatPhotos.length} iNaturalist-Bilder gefunden`);
    }

    // Dedupliziere anhand URL
    const uniqueImages = Array.from(
      new Map(images.map(img => [img.url, img])).values()
    );

    return uniqueImages.slice(0, 30); // Max 30 Bilder
  } catch (error) {
    console.error(`❌ Fehler beim Laden der Bilder für ${scientificName}:`, error);
    return images;
  }
}

/**
 * Transformiere GBIF-Pflanze in unser Plant-Interface
 * Nutzt existierende Übersetzungs- und Kategorisierungs-Funktionen
 */
async function transformGBIFPlant(
  gbifPlant: GBIFPlant,
  imagesSources: ImageSource[],
  comprehensiveTranslate: (text: string) => Promise<string>,
  ruleBasedCategorization: (name: string, family: string) => string[]
): Promise<Plant> {

  const scientificName = gbifPlant.canonicalName || gbifPlant.scientificName;
  const family = gbifPlant.family || 'Unbekannte Familie';

  // Deutsche Übersetzung
  let germanName = await GBIFClient.getGermanName(gbifPlant.key);
  if (!germanName) {
    germanName = await iNaturalistClient.getGermanCommonName(scientificName);
  }
  if (!germanName) {
    germanName = await comprehensiveTranslate(scientificName);
  }

  // Kategorisierung
  const [kategorie, unterkategorie, spezifikation] = ruleBasedCategorization(
    germanName || scientificName,
    family
  );

  // Erstelle Plant-Objekt
  const plant: Plant = {
    id: `gbif-${gbifPlant.key}`,
    name: scientificName,
    deutscherName: germanName || scientificName,
    familie: await comprehensiveTranslate(family),
    herkunft: 'Unbekannt', // Wird später ergänzt
    lichtbedarf: 'Sonne bis Halbschatten',
    pflegehinweise: 'Basierend auf API-Daten',
    standort: 'Unbekannt',
    giessplan: 'Regelmäßig gießen',
    duengplan: 'Standard-Dünger',
    bluehzeit: 'Unbekannt',
    wuchshoehe: 'Unbekannt',
    besonderheiten: `Familie: ${family}`,
    pflegeaufwand: 'Mittel',
    pflanzzeit: 'Frühjahr',
    kategorie,
    unterkategorie,
    spezifikation,
    bilder: imagesSources.map(img => img.url),
    // Erweiterte Bild-Metadaten
    bilderQuellen: imagesSources
  };

  return plant;
}

/**
 * Hauptfunktion: Synchronisiere Pflanzendatenbank
 */
export async function syncPlantDatabase(
  existingPlants: Plant[],
  comprehensiveTranslate: (text: string) => Promise<string>,
  ruleBasedCategorization: (name: string, family: string) => string[],
  onProgress?: (progress: number, message: string) => void
): Promise<SyncResult> {

  const result: SyncResult = {
    newPlants: [],
    updatedPlants: [],
    newImagesCount: 0,
    errors: [],
    totalProcessed: 0
  };

  try {
    console.log('🚀 Starte Datenbank-Synchronisierung...');
    onProgress?.(5, 'Prüfe neue Pflanzen...');

    // Hole letzte Sync-Zeit
    const lastSync = getLastSyncTimestamp();
    const sinceDate = lastSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: letzter Monat

    console.log(`📅 Suche nach neuen Pflanzen seit ${sinceDate.toLocaleDateString()}`);

    // Hole neue Pflanzen von GBIF
    const latestPlants = await GBIFClient.getLatestPlants(sinceDate, 100);
    console.log(`📊 ${latestPlants.length} neue Einträge von GBIF gefunden`);

    onProgress?.(15, `${latestPlants.length} neue Einträge gefunden`);

    if (latestPlants.length === 0) {
      console.log('✅ Keine neuen Pflanzen verfügbar');
      setLastSyncTimestamp();
      return result;
    }

    // Erstelle Set von existierenden wissenschaftlichen Namen für schnelle Duplikat-Prüfung
    const existingNames = new Set(existingPlants.map(p => p.name.toLowerCase()));

    // Verarbeite neue Pflanzen
    const BATCH_SIZE = 10;
    let processed = 0;

    for (let i = 0; i < latestPlants.length; i += BATCH_SIZE) {
      const batch = latestPlants.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (occurrence) => {
        try {
          const scientificName = occurrence.scientificName;

          // Prüfe Duplikat
          if (existingNames.has(scientificName.toLowerCase())) {
            console.log(`⏭️ Überspringe Duplikat: ${scientificName}`);
            return null;
          }

          // Hole Details
          const details = await GBIFClient.searchByScientificName(scientificName);
          if (!details) {
            console.log(`⚠️ Keine Details für ${scientificName}`);
            return null;
          }

          // Hole Bilder
          const imageSources = await fetchPlantImages(scientificName, details.key);

          if (imageSources.length === 0) {
            console.log(`⚠️ Keine Bilder für ${scientificName} - überspringe`);
            return null;
          }

          // Transformiere zu Plant
          const plant = await transformGBIFPlant(
            details,
            imageSources,
            comprehensiveTranslate,
            ruleBasedCategorization
          );

          result.newImagesCount += imageSources.length;
          return plant;

        } catch (error) {
          console.error(`❌ Fehler bei ${occurrence.scientificName}:`, error);
          result.errors.push(`Fehler bei ${occurrence.scientificName}: ${error}`);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validPlants = batchResults.filter((p): p is Plant => p !== null);

      result.newPlants.push(...validPlants);
      processed += batch.length;
      result.totalProcessed = processed;

      // Fortschritt
      const progress = 15 + Math.round((processed / latestPlants.length) * 70);
      onProgress?.(progress, `${validPlants.length} neue Pflanzen verarbeitet (${processed}/${latestPlants.length})`);

      console.log(`✅ Batch ${i / BATCH_SIZE + 1}: ${validPlants.length} neue Pflanzen`);

      // Kleine Pause zwischen Batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Speichere Sync-Zeitstempel
    setLastSyncTimestamp();

    onProgress?.(100, `Sync abgeschlossen: ${result.newPlants.length} neue Pflanzen`);

    console.log('🎉 Synchronisierung abgeschlossen!');
    console.log(`📊 Statistik:
      - Neue Pflanzen: ${result.newPlants.length}
      - Neue Bilder: ${result.newImagesCount}
      - Fehler: ${result.errors.length}
    `);

    return result;

  } catch (error) {
    console.error('❌ Kritischer Fehler beim Sync:', error);
    result.errors.push(`Kritischer Fehler: ${error}`);
    throw error;
  }
}

/**
 * Merge neue Pflanzen mit existierenden (Deduplizierung)
 */
export function mergePlants(
  existingPlants: Plant[],
  newPlants: Plant[],
  updatedPlants: Plant[]
): Plant[] {

  const plantMap = new Map<string, Plant>();

  // Füge existierende Pflanzen hinzu
  existingPlants.forEach(plant => {
    const key = plant.name.toLowerCase();
    plantMap.set(key, plant);
  });

  // Update existierende Pflanzen
  updatedPlants.forEach(plant => {
    const key = plant.name.toLowerCase();
    plantMap.set(key, plant);
  });

  // Füge neue Pflanzen hinzu
  newPlants.forEach(plant => {
    const key = plant.name.toLowerCase();
    if (!plantMap.has(key)) {
      plantMap.set(key, plant);
    }
  });

  return Array.from(plantMap.values());
}

/**
 * Prüfe API-Verfügbarkeit
 */
export async function checkAPIHealth(): Promise<{
  gbif: boolean;
  inaturalist: boolean;
}> {
  const result = { gbif: false, inaturalist: false };

  try {
    const gbifTest = await GBIFClient.searchPlants('Rosa', 1);
    result.gbif = gbifTest.results.length > 0;
  } catch {
    result.gbif = false;
  }

  try {
    const inatTest = await iNaturalistClient.searchTaxon('Rosa');
    result.inaturalist = inatTest !== null;
  } catch {
    result.inaturalist = false;
  }

  return result;
}
