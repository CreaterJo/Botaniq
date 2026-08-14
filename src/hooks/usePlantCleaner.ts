"use client";

import { useCallback } from 'react';

const CLEANING_CACHE_KEY = 'botaniq_cleaned_plants';

interface CleaningResult {
  plants: any[];
  families: string[];
  categories: CategoryTree;
  cleanedCount: number;
}

export interface CategoryTree {
  [mainCategory: string]: {
    [subCategory: string]: string[];
  };
}

export const usePlantCleaner = () => {
  const cleanAllPlants = useCallback(async (plants: any[]): Promise<CleaningResult> => {
    console.log(`🧹 Starte KI-Kategorisierung für ${plants.length} Pflanzen...`);

    const cleanedPlants = [];
    const familySet = new Set<string>();
    const categoryTree: CategoryTree = {};

    for (let i = 0; i < plants.length; i++) {
      const plant = plants[i];
      
      try {
        // Erweiterte Kategorisierung
        const name = (plant.deutscherName || plant.name || '').toLowerCase();
        const family = (plant.familie || '').toLowerCase();
        
        let mainCategory = 'Sonstige Pflanzen';
        let subCategory = 'Allgemein';
        let specification = 'Verschiedene';

        // Bäume
        if (name.includes('baum') || name.includes('tree') || family.includes('tree') ||
            name.includes('eiche') || name.includes('birke') || name.includes('ahorn') ||
            name.includes('fichte') || name.includes('kiefer') || name.includes('tanne') ||
            name.includes('pappel') || name.includes('weide') || name.includes('esche')) {
          mainCategory = 'Bäume';
          subCategory = (name.includes('nadel') || name.includes('fichte') || name.includes('kiefer') || 
                        name.includes('tanne') || name.includes('zypresse')) ? 'Nadelbäume' : 'Laubbäume';
          specification = getTreeSpecification(name);
        }
        // Sträucher
        else if (name.includes('strauch') || name.includes('shrub') || name.includes('busch') ||
                 name.includes('hecke') || name.includes('rose') || name.includes('flieder') ||
                 name.includes('hortensie') || name.includes('jasmin') || name.includes('forsythie')) {
          mainCategory = 'Sträucher';
          subCategory = getShrubSubcategory(name);
          specification = getShrubSpecification(name);
        }
        // Stauden & Blumen
        else if (name.includes('staude') || name.includes('perennial') || 
                 name.includes('blume') || name.includes('flower') || name.includes('blüte') ||
                 name.includes('lilie') || name.includes('tulpe') || name.includes('narzisse')) {
          mainCategory = 'Stauden';
          subCategory = getPerennialSubcategory(name);
          specification = getPerennialSpecification(name);
        }
        // Kräuter
        else if (name.includes('kraut') || name.includes('herb') || name.includes('gewürz') ||
                 name.includes('basilikum') || name.includes('minze') || name.includes('thymian') ||
                 name.includes('rosmarin') || name.includes('salbei') || name.includes('petersilie')) {
          mainCategory = 'Kräuter';
          subCategory = getHerbSubcategory(name);
          specification = getHerbSpecification(name);
        }
        // Zimmerpflanzen
        else if (name.includes('zimmer') || name.includes('indoor') || name.includes('topf') ||
                 name.includes('ficus') || name.includes('monstera') || name.includes('efeu') ||
                 family.includes('araceae') || family.includes('orchid')) {
          mainCategory = 'Zimmerpflanzen';
          subCategory = getIndoorSubcategory(name);
          specification = getIndoorSpecification(name);
        }
        // Sukkulenten
        else if (name.includes('sukkulente') || name.includes('kaktus') || name.includes('aloë') ||
                 name.includes('agave') || name.includes('hauswurz')) {
          mainCategory = 'Sukkulenten';
          subCategory = 'Dickblattgewächse';
          specification = 'Sukkulenten';
        }
        // Gräser
        else if (name.includes('gras') || name.includes('grass') || family.includes('poaceae')) {
          mainCategory = 'Gräser';
          subCategory = 'Ziergräser';
          specification = 'Verschiedene';
        }
        // Kletterpflanzen
        else if (name.includes('kletter') || name.includes('rank') || name.includes('schling') ||
                 name.includes('clematis') || name.includes('geißblatt') || name.includes('wein')) {
          mainCategory = 'Kletterpflanzen';
          subCategory = 'Rankpflanzen';
          specification = 'Kletterpflanzen';
        }

        // Baue Kategorie-Baum auf
        if (!categoryTree[mainCategory]) {
          categoryTree[mainCategory] = {};
        }
        if (!categoryTree[mainCategory][subCategory]) {
          categoryTree[mainCategory][subCategory] = [];
        }
        if (!categoryTree[mainCategory][subCategory].includes(specification)) {
          categoryTree[mainCategory][subCategory].push(specification);
        }

        const cleanedPlant = {
          ...plant,
          kategorie: mainCategory,
          unterkategorie: subCategory,
          spezifikation: specification
        };

        cleanedPlants.push(cleanedPlant);

        if (plant.familie && plant.familie !== 'Unbekannt') {
          familySet.add(plant.familie);
        }

        // Fortschritt alle 100 Pflanzen
        if (i % 100 === 0) {
          console.log(`📝 Verarbeitet: ${i + 1}/${plants.length} Pflanzen`);
        }

      } catch (error) {
        console.error(`Fehler bei Pflanze ${i}:`, error);
        cleanedPlants.push(plant);
      }
    }

    // Sortiere Kategorien
    const sortedCategoryTree: CategoryTree = {};
    Object.keys(categoryTree).sort().forEach(mainCat => {
      sortedCategoryTree[mainCat] = {};
      Object.keys(categoryTree[mainCat]).sort().forEach(subCat => {
        sortedCategoryTree[mainCat][subCat] = categoryTree[mainCat][subCat].sort();
      });
    });

    const result: CleaningResult = {
      plants: cleanedPlants,
      families: Array.from(familySet).sort(),
      categories: sortedCategoryTree,
      cleanedCount: cleanedPlants.length
    };

    // Cache optimiert
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CLEANING_CACHE_KEY, JSON.stringify(result));
        console.log(`💾 ${cleanedPlants.length} bereinigte Pflanzen gecached`);
      } catch (error) {
        console.log('❌ Caching übersprungen (Quota) - verwende IndexedDB für große Datenmengen');
      }
    }

    console.log('🎉 KI-Kategorisierung abgeschlossen!', sortedCategoryTree);
    return result;
  }, []);

  // Hilfsfunktionen
  const getTreeSpecification = (name: string): string => {
    if (name.includes('eiche')) return 'Eichen';
    if (name.includes('birke')) return 'Birken';
    if (name.includes('ahorn')) return 'Ahorne';
    if (name.includes('fichte')) return 'Fichten';
    if (name.includes('kiefer')) return 'Kiefern';
    if (name.includes('tanne')) return 'Tannen';
    if (name.includes('obst')) return 'Obstbäume';
    if (name.includes('nuss')) return 'Nussbäume';
    if (name.includes('zier')) return 'Zierbäume';
    return 'Laubbäume';
  };

  const getShrubSubcategory = (name: string): string => {
    if (name.includes('rose')) return 'Rosen';
    if (name.includes('beere')) return 'Beerensträucher';
    if (name.includes('zier')) return 'Ziersträucher';
    if (name.includes('hecke')) return 'Heckenpflanzen';
    if (name.includes('immergrün')) return 'Immergrüne Sträucher';
    return 'Blütensträucher';
  };

  const getShrubSpecification = (name: string): string => {
    if (name.includes('kletter')) return 'Klettersträucher';
    if (name.includes('bodendecker')) return 'Bodendecker';
    return 'Verschiedene Sträucher';
  };

  const getPerennialSubcategory = (name: string): string => {
    if (name.includes('schatten')) return 'Schattenstauden';
    if (name.includes('sonne')) return 'Sonnenstauden';
    if (name.includes('blüte')) return 'Blühstauden';
    if (name.includes('stein')) return 'Steingartenstauden';
    return 'Gartenstauden';
  };

  const getPerennialSpecification = (name: string): string => {
    if (name.includes('frühling')) return 'Frühlingsblüher';
    if (name.includes('sommer')) return 'Sommerblüher';
    if (name.includes('herbst')) return 'Herbstblüher';
    return 'Mehrjährige Stauden';
  };

  const getHerbSubcategory = (name: string): string => {
    if (name.includes('küche')) return 'Küchenkräuter';
    if (name.includes('heil')) return 'Heilkräuter';
    if (name.includes('tee')) return 'Tee-Kräuter';
    return 'Gewürzkräuter';
  };

  const getHerbSpecification = (name: string): string => {
    if (name.includes('einjährig')) return 'Einjährige Kräuter';
    if (name.includes('mehrjährig')) return 'Mehrjährige Kräuter';
    return 'Kräuterpflanzen';
  };

  const getIndoorSubcategory = (name: string): string => {
    if (name.includes('blatt')) return 'Blattschmuck';
    if (name.includes('blüte')) return 'Blühpflanzen';
    if (name.includes('sukkulente')) return 'Sukkulenten';
    if (name.includes('palme')) return 'Palmen';
    return 'Grünpflanzen';
  };

  const getIndoorSpecification = (name: string): string => {
    if (name.includes('schatten')) return 'Schattenverträglich';
    if (name.includes('sonne')) return 'Sonnige Standorte';
    return 'Zimmerpflanzen';
  };

  const getCachedCleanedData = useCallback((): CleaningResult | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(CLEANING_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        console.log('📁 Geladene Kategorien:', Object.keys(data.categories).length);
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const getCachedCategoryTree = useCallback((): CategoryTree | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(CLEANING_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        return data.categories || null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const clearCleaningCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CLEANING_CACHE_KEY);
  }, []);

  return {
    cleanAllPlants,
    getCachedCleanedData,
    getCachedCategoryTree,
    clearCleaningCache
  };
};