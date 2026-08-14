"use client";
import { useState, useEffect, useCallback } from 'react';
import { Plant } from '@/components/PlantCard';
import { usePlantCleaner } from './usePlantCleaner';
import { PlantAIHelper } from '@/lib/plantAiHelper';
const ENHANCED_PLANTS_KEY = 'botaniq_ki_enhanced_plants';
const CACHE_VERSION = 'v4';
interface PlantCompletion {
  herkunft?: string;
  lichtbedarf?: string;
  standort?: string;
  giessplan?: string;
  duengplan?: string;
  bluehzeit?: string;
  wuchshoehe?: string;
  pflegeaufwand?: string;
  besonderheiten?: string;
  pflanzzeit?: string;
} 
export const usePlantData = () => {
const [plants, setPlants] = useState<Plant[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
const [cleaningProgress, setCleaningProgress] = useState<number>(0);
const [enhancementProgress, setEnhancementProgress] = useState<number>(0);
const [allPlantsLoaded, setAllPlantsLoaded] = useState<boolean>(false);
const { cleanAllPlants, getCachedCleanedData } = usePlantCleaner();

const exportToStaticCache = useCallback((plants: Plant[]): void => {
  if (plants.length === 0) return;
  
  console.log('📦 Exportiere VOLLSTÄNDIGEN Cache...');
  
  // ✅ PRÜFE: Exportiere nur wenn wirklich ALLE Pflanzen da sind
  if (plants.length <= 1000) {
    console.log('⚠️  Nur', plants.length, 'Pflanzen - überspringe Export');
    console.log('💡 Stelle sicher, dass loadFromStaticCache ALLE Pflanzen lädt');
    return;
  }
  
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  let currentChunk: Plant[] = [];
  let currentSize = 0;
  const chunks: Plant[][] = [];
  
  // Teile Pflanzen in Chunks auf basierend auf Dateigröße
  plants.forEach(plant => {
    const plantSize = JSON.stringify(plant).length;
    
    if (currentSize + plantSize > MAX_FILE_SIZE && currentChunk.length > 0) {
      chunks.push([...currentChunk]);
      currentChunk = [plant];
      currentSize = plantSize;
    } else {
      currentChunk.push(plant);
      currentSize += plantSize;
    }
  });
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  console.log(`📊 Aufgeteilt in ${chunks.length} Dateien (${plants.length} Pflanzen)`);
  
  // ✅ Exportiere jede Chunk als separate Datei
  chunks.forEach((chunk, index) => {
    const cacheData = {
      message: `Botaniq Cache - Teil ${index + 1}/${chunks.length} - ${chunk.length} Pflanzen - ${new Date().toISOString()}`,
      plants: chunk,
      version: CACHE_VERSION,
      timestamp: new Date().toISOString(),
      count: chunk.length,
      totalChunks: chunks.length,
      currentChunk: index + 1,
      totalPlants: plants.length // ✅ Gesamtzahl aller Pflanzen
    };
    
    const dataStr = JSON.stringify(cacheData, null, 2);
    const estimatedSizeMB = (new Blob([dataStr]).size / 1024 / 1024).toFixed(2);
    
    console.log(`📁 Chunk ${index + 1}: ${chunk.length} Pflanzen (~${estimatedSizeMB}MB)`);
    
    // Download-Link erstellen
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cached_plants_part_${index + 1}_of_${chunks.length}.json`;
    link.textContent = `📥 cached_plants_part_${index + 1}.json (${chunk.length} Pflanzen, ${estimatedSizeMB}MB)`;
    link.style.cssText = `
      position: fixed;
      top: ${20 + (index * 60)}px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 14px;
    `;
    
    document.body.appendChild(link);
    
    setTimeout(() => {
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);
    }, 2000 + (index * 1000));
  });
  
  // ✅ Zusätzlich: VOLLSTÄNDIGE Haupt-Datei exportieren
  const mainCacheData = {
    message: `Botaniq Cache - ${plants.length} Pflanzen - ${new Date().toISOString()}`,
    plants: plants, // ✅ ALLE Pflanzen
    version: CACHE_VERSION,
    timestamp: new Date().toISOString(),
    count: plants.length
  };
  
  const mainDataStr = JSON.stringify(mainCacheData, null, 2);
  const mainBlob = new Blob([mainDataStr], { type: 'application/json' });
  const mainUrl = URL.createObjectURL(mainBlob);
  const mainLink = document.createElement('a');
  mainLink.href = mainUrl;
  mainLink.download = 'cached_plants_COMPLETE.json';
  mainLink.textContent = `📥 cached_plants_COMPLETE.json (${plants.length} Pflanzen)`;
  mainLink.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(mainLink);
  
  setTimeout(() => {
    mainLink.click();
    setTimeout(() => {
      document.body.removeChild(mainLink);
      URL.revokeObjectURL(mainUrl);
    }, 1000);
  }, 1000);
  
  console.log('🎉 VOLLSTÄNDIGER Cache-Export abgeschlossen!');
  console.log(`📁 ${chunks.length + 1} Dateien mit ${plants.length} Pflanzen erstellt`);
  
}, []);

const loadFromStaticCache = useCallback(async (): Promise<Plant[] | null> => {
  console.log('📁 Lade statischen Cache mit Lazy Loading...');

  try {
    // STRATEGIE: Lade Teil 1 zuerst für schnellen Start, dann Rest im Hintergrund
    const part1Response = await fetch('/data/cached_plants_part_1.json');

    if (part1Response.ok) {
      const part1Data = await part1Response.json();
      const initialPlants = part1Data.plants || part1Data;

      if (Array.isArray(initialPlants) && initialPlants.length > 0) {
        console.log(`✅ ${initialPlants.length} Pflanzen aus Teil 1 geladen (schneller Start)`);

        // Lade restliche Teile im Hintergrund
        setTimeout(async () => {
          console.log('📦 Lade restliche Cache-Teile im Hintergrund...');
          const allPlants = [...initialPlants];

          for (let i = 2; i <= 5; i++) {
            try {
              const partResponse = await fetch(`/data/cached_plants_part_${i}.json`);
              if (partResponse.ok) {
                const partData = await partResponse.json();
                const plants = partData.plants || partData;
                if (Array.isArray(plants) && plants.length > 0) {
                  allPlants.push(...plants);
                  console.log(`✅ Teil ${i} geladen: +${plants.length} Pflanzen (Total: ${allPlants.length})`);
                  // Update State dynamisch
                  setPlants(prev => [...prev, ...plants]);
                }
              }
            } catch (err) {
              console.log(`⚠️ Teil ${i} konnte nicht geladen werden`);
            }
          }

          console.log(`🎉 Alle Cache-Teile geladen: ${allPlants.length} Pflanzen total`);
          // Cache für nächstes Mal
          cachePlants(allPlants);
        }, 100);

        return initialPlants;
      }
    }

    // FALLBACK: Versuche komplette Datei
    console.log('ℹ️ Teil-Dateien nicht gefunden, versuche cached_plants.json...');
    const response = await fetch('/data/cached_plants.json');
    if (response.ok) {
      const data = await response.json();
      const plantsArray = data.plants || data;

      if (Array.isArray(plantsArray) && plantsArray.length > 0) {
        console.log(`✅ ${plantsArray.length} Pflanzen aus cached_plants.json geladen`);
        return plantsArray;
      }
    }
  } catch (error) {
    console.log('ℹ️ Statische Cache-Dateien nicht verfügbar');
  }

  return null;
}, []);

const getCachedPlants = useCallback((): {plants: Plant[], version: string} | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(ENHANCED_PLANTS_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.version === CACHE_VERSION) {
          return data;
        } else {
          console.log('🔄 Cache-Version veraltet - lösche alten Cache');
          localStorage.removeItem(ENHANCED_PLANTS_KEY);
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

const cachePlants = useCallback((plants: Plant[]) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheData = {
        plants: plants,
        version: CACHE_VERSION,
        timestamp: new Date().toISOString(),
        count: plants.length
      };
      localStorage.setItem(ENHANCED_PLANTS_KEY, JSON.stringify(cacheData));
      console.log(`💾 ${plants.length} Pflanzen im localStorage gecached (${CACHE_VERSION})`);
    } catch (error) {
      console.log('❌ localStorage Cache fehlgeschlagen');
    }
  }, []);

const loadAllTreflePages = useCallback(async (): Promise<any[]> => {
  const allPlants: any[] = [];
  const totalPages = 21863;
  
  console.log('🚀 ULTRA-SPEED: Lade ALLE 21.863 Seiten mit maximaler Parallelisierung...');
  console.log('⏰ Geschätzte Zeit: 10-30 Minuten');

  const BATCH_SIZE = 1000; // Massive Parallelisierung
  let loadedCount = 0;

  try {
    for (let batchStart = 1; batchStart <= totalPages; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, totalPages);
      console.log(`📦 Lade Batch ${batchStart}-${batchEnd}...`);
      
      const batchPromises = [];
      
      // Erstelle alle Requests für diesen Batch
      for (let page = batchStart; page <= batchEnd; page++) {
        batchPromises.push(
          fetch(`/data/data/plants_page_${page}.json`)
            .then(response => response.ok ? response.json() : null)
            .catch(() => null)
        );
      }
      
      // Warte auf den gesamten Batch
      const batchResults = await Promise.all(batchPromises);
      
      // Verarbeite alle Ergebnisse parallel
      let plantsInBatch = 0;
      batchResults.forEach(pageData => {
        if (pageData) {
          const plantsData = extractPlantsData(pageData);
          if (plantsData && plantsData.length > 0) {
            allPlants.push(...plantsData);
            plantsInBatch += plantsData.length;
          }
        }
      });
      
      loadedCount += plantsInBatch;
      const progress = Math.round((batchStart / totalPages) * 100);
      
      console.log(`✅ Batch ${batchStart}-${batchEnd}: ${plantsInBatch} Pflanzen (Total: ${loadedCount}) - ${progress}%`);
      
      // UI-Fortschritt
      const cleaningProgress = 5 + Math.round((batchStart / totalPages) * 35);
      setCleaningProgress(cleaningProgress);
      
      // Sehr kurze Pause
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`🏁 VOLLSTÄNDIG: ${allPlants.length} Pflanzen geladen!`);
    return allPlants;
    
  } catch (error) {
    console.log('❌ Fehler:', error);
    return allPlants;
  }
}, []);

const extractPlantsData = (pageData: any): any[] => {
  if (pageData.data && Array.isArray(pageData.data)) return pageData.data;
  if (pageData.plants && Array.isArray(pageData.plants)) return pageData.plants;
  if (pageData.results && Array.isArray(pageData.results)) return pageData.results;
  if (Array.isArray(pageData)) return pageData;
  return [];
};

const comprehensiveTranslate = useCallback(async (text: string): Promise<string> => {
    if (!text || text === 'Unbekannt' || text === 'Unknown' || text.trim().length < 2) {
      return 'Unbekannt';
    }

    const cleanText = text
      .replace(/[^\w\säöüÄÖÜß\-(),.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 2) return 'Unbekannt';

    const translations: Record<string, string> = {
      'rosaceae': 'Rosengewächse',
      'asteraceae': 'Korbblütler', 
      'fabaceae': 'Hülsenfrüchtler',
      'lamiaceae': 'Lippenblütler',
      'poaceae': 'Süßgräser',
      'apiaceae': 'Doldenblütler',
      'orchidaceae': 'Orchideen',
      'brassicaceae': 'Kreuzblütler',
      'caryophyllaceae': 'Nelkengewächse',
      'ericaceae': 'Heidekrautgewächse',
      'fagaceae': 'Buchengewächse',
      'pinaceae': 'Kieferngewächse',
      'salicaceae': 'Weidengewächse',
      'scrophulariaceae': 'Braunwurzgewächse',
      'solonaceae': 'Nachtschattengewächse',
      'family': 'Familie',
      'genus': 'Gattung',
      'species': 'Art',
      'subspecies': 'Unterart',
      'variety': 'Sorte',
      'cultivar': 'Kulturform',
      'hybrid': 'Hybride',
      'tree': 'Baum',
      'shrub': 'Strauch',
      'bush': 'Busch',
      'herb': 'Kraut',
      'flower': 'Blume',
      'grass': 'Gras',
      'fern': 'Farn',
      'moss': 'Moos',
      'succulent': 'Sukkulente',
      'cactus': 'Kaktus',
      'vine': 'Kletterpflanze',
      'climber': 'Kletterpflanze',
      'perennial': 'Mehrjährig',
      'annual': 'Einjährig',
      'biennial': 'Zweijährig',
      'evergreen': 'Immergrün',
      'deciduous': 'Laubabwerfend',
      'red': 'Rot',
      'blue': 'Blau',
      'green': 'Grün',
      'yellow': 'Gelb',
      'white': 'Weiß',
      'black': 'Schwarz',
      'purple': 'Lila',
      'pink': 'Rosa',
      'orange': 'Orange',
      'brown': 'Braun',
      'gray': 'Grau',
      'large': 'Groß',
      'small': 'Klein',
      'medium': 'Mittel',
      'tall': 'Hoch',
      'short': 'Kurz',
      'wide': 'Breit',
      'narrow': 'Schmal',
      'round': 'Rund',
      'oval': 'Oval',
      'pointed': 'Spitz',
      'sun': 'Sonne',
      'shade': 'Schatten',
      'sunny': 'Sonnig',
      'shady': 'Schattig',
      'dry': 'Trocken',
      'wet': 'Feucht',
      'moist': 'Feucht',
      'soil': 'Boden',
      'sand': 'Sand',
      'clay': 'Lehm',
      'rock': 'Fels',
      'common': 'Gewöhnlich',
      'wild': 'Wild',
      'cultivated': 'Kultiviert',
      'native': 'Einheimisch',
      'exotic': 'Exotisch',
      'rare': 'Selten',
      'endangered': 'Gefährdet',
      'medicinal': 'Heilend',
      'aromatic': 'Aromatisch',
      'edible': 'Essbar',
      'poisonous': 'Giftig',
      'fragrant': 'Duftend',
      'thorny': 'Dornig',
      'smooth': 'Glatt',
      'hairy': 'Behaart',
      'alpine': 'Alpen',
      'mountain': 'Berg',
      'forest': 'Wald',
      'meadow': 'Wiese',
      'river': 'Fluss',
      'lake': 'See',
      'coastal': 'Küsten',
      'desert': 'Wüsten',
      'tropical': 'Tropisch',
      'temperate': 'Gemäßigt',
      'arctic': 'Arktisch',
      'oak': 'Eiche',
      'maple': 'Ahorn',
      'birch': 'Birke',
      'pine': 'Kiefer',
      'fir': 'Tanne',
      'spruce': 'Fichte',
      'willow': 'Weide',
      'poplar': 'Pappel',
      'linden': 'Linde',
      'chestnut': 'Kastanie',
      'walnut': 'Walnuss',
      'hazel': 'Hasel',
      'beech': 'Buche',
      'ash': 'Esche',
      'elm': 'Ulme',
      'alder': 'Erle',
      'hawthorn': 'Weißdorn',
      'rose': 'Rose',
      'lily': 'Lilie',
      'tulip': 'Tulpe',
      'daisy': 'Gänseblümchen',
      'dandelion': 'Löwenzahn',
      'clover': 'Klee',
      'thistle': 'Distel',
      'nettle': 'Brennessel',
      'mint': 'Minze',
      'thyme': 'Thymian',
      'sage': 'Salbei',
      'rosemary': 'Rosmarin',
      'lavender': 'Lavendel',
      'basil': 'Basilikum',
      'oregano': 'Oregano'
    };

    let translated = cleanText.toLowerCase();
    
    const sortedTranslations = Object.entries(translations)
      .sort(([a], [b]) => b.length - a.length);
    
    sortedTranslations.forEach(([en, de]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, de.toLowerCase());
    });

    let finalText = translated
      .split(' ')
      .map(word => {
        if (word.includes('×') || word.includes('-') || word.match(/^[a-z]+\.[a-z]+$/)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    finalText = finalText.replace(/\s+/g, ' ').trim();

    return finalText !== cleanText ? finalText : cleanText;
  }, []);

const ruleBasedCategorization = useCallback((plantName: string, family: string): string[] => {
    const name = (plantName || '').toLowerCase();
    const fam = (family || '').toLowerCase();

    let mainCategory = 'Sonstige Pflanzen';
    let subCategory = 'Allgemein';
    let specification = 'Verschiedene';

    if (name.includes('baum') || name.includes('tree') || fam.includes('tree') ||
        name.includes('eiche') || name.includes('birke') || name.includes('ahorn') ||
        name.includes('fichte') || name.includes('kiefer') || name.includes('tanne')) {
      mainCategory = 'Bäume';
      subCategory = name.includes('nadel') ? 'Nadelbäume' : 'Laubbäume';
      specification = getTreeSpecification(name);
    }
    else if (name.includes('strauch') || name.includes('shrub') || name.includes('busch') ||
             name.includes('hecke') || name.includes('rose') || name.includes('flieder')) {
      mainCategory = 'Sträucher';
      subCategory = getShrubSubcategory(name);
      specification = 'Verschiedene';
    }
    else if (name.includes('staude') || name.includes('perennial') || 
             name.includes('blume') || name.includes('flower') || name.includes('blüte')) {
      mainCategory = 'Stauden';
      subCategory = getPerennialSubcategory(name);
      specification = 'Verschiedene';
    }
    else if (name.includes('kraut') || name.includes('herb') || name.includes('gewürz') ||
             name.includes('basilikum') || name.includes('minze') || name.includes('thymian')) {
      mainCategory = 'Kräuter';
      subCategory = getHerbSubcategory(name);
      specification = 'Verschiedene';
    }
    else if (name.includes('zimmer') || name.includes('indoor') || name.includes('topf') ||
             fam.includes('araceae') || fam.includes('orchid')) {
      mainCategory = 'Zimmerpflanzen';
      subCategory = getIndoorSubcategory(name);
      specification = 'Verschiedene';
    }
    else if (name.includes('sukkulente') || name.includes('kaktus') || name.includes('aloë')) {
      mainCategory = 'Sukkulenten';
      subCategory = 'Dickblattgewächse';
      specification = 'Sukkulenten';
    }
    else if (name.includes('gras') || name.includes('grass') || fam.includes('poaceae')) {
      mainCategory = 'Gräser';
      subCategory = 'Ziergräser';
      specification = 'Verschiedene';
    }
    else if (name.includes('farn') || name.includes('fern')) {
      mainCategory = 'Farne';
      subCategory = 'Farnpflanzen';
      specification = 'Verschiedene';
    }

    return [mainCategory, subCategory, specification];
  }, []);

const getTreeSpecification = (name: string): string => {
    if (name.includes('eiche')) return 'Eichen';
    if (name.includes('birke')) return 'Birken';
    if (name.includes('ahorn')) return 'Ahorne';
    if (name.includes('fichte')) return 'Fichten';
    if (name.includes('kiefer')) return 'Kiefern';
    if (name.includes('tanne')) return 'Tannen';
    if (name.includes('obst')) return 'Obstbäume';
    if (name.includes('nuss')) return 'Nussbäume';
    if (name.includes('palme')) return 'Palmen';
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

const getPerennialSubcategory = (name: string): string => {
    if (name.includes('schatten')) return 'Schattenstauden';
    if (name.includes('sonne')) return 'Sonnenstauden';
    if (name.includes('blüte')) return 'Blühstauden';
    if (name.includes('stein')) return 'Steingartenstauden';
    return 'Gartenstauden';
  };

const getHerbSubcategory = (name: string): string => {
    if (name.includes('küche')) return 'Küchenkräuter';
    if (name.includes('heil')) return 'Heilkräuter';
    if (name.includes('tee')) return 'Tee-Kräuter';
    return 'Gewürzkräuter';
  };

const getIndoorSubcategory = (name: string): string => {
    if (name.includes('blatt')) return 'Blattschmuck';
    if (name.includes('blüte')) return 'Blühpflanzen';
    if (name.includes('sukkulente')) return 'Sukkulenten';
    if (name.includes('palme')) return 'Palmen';
    if (name.includes('farn')) return 'Farne';
    return 'Grünpflanzen';
  };

const enhancePlantsWithAI = useCallback(async (plants: Plant[]): Promise<Plant[]> => {
  console.log(`🚀 ULTRA-SCHNELLE KI-Verbesserung für ${plants.length} Pflanzen...`);
  
  // ✅ FILTER: Nur Pflanzen die wirklich KI benötigen
  const plantsToEnhance = plants.filter(plant => 
    plant.herkunft === 'Unbekannt' ||
    plant.wuchshoehe === 'Unbekannt' || 
    plant.bluehzeit === 'Unbekannt' ||
    plant.standort === 'Unbekannt' ||
    plant.besonderheiten.includes('Trefle API')
  );
  
  console.log(`📊 ${plantsToEnhance.length} Pflanzen benötigen KI-Verbesserung`);

  if (plantsToEnhance.length === 0) {
    return plants;
  }

  const enhancedPlants = [...plants];
  
  // ✅ MASSIV PARALLEL: 100 Pflanzen gleichzeitig!
  const BATCH_SIZE = 1000;
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`⚡ Verarbeite ${plantsToEnhance.length} Pflanzen in Batches von ${BATCH_SIZE}...`);
  
  for (let i = 0; i < plantsToEnhance.length; i += BATCH_SIZE) {
    const batch = plantsToEnhance.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(plantsToEnhance.length / BATCH_SIZE);
    
    console.log(`📦 Batch ${batchNumber}/${totalBatches}: ${batch.length} Pflanzen`);
    
    // ✅ MASSIV PARALLEL: Alle 100 Pflanzen gleichzeitig
    const batchPromises = batch.map(async (plant) => {
      const originalIndex = plants.findIndex(p => p.id === plant.id);
      if (originalIndex !== -1) {
        try {
          // ✅ KEINE Timeouts, volle Geschwindigkeit
          const aiData = await PlantAIHelper.getPlantCompletion(
            plant.deutscherName, 
            plant.name, 
            plant.familie
          );

          // ✅ SCHNELLE VERARBEITUNG
          enhancedPlants[originalIndex] = {
            ...plant,
            herkunft: plant.herkunft === 'Unbekannt' ? (aiData.herkunft || plant.herkunft) : plant.herkunft,
            wuchshoehe: plant.wuchshoehe === 'Unbekannt' ? (aiData.wuchshoehe || plant.wuchshoehe) : plant.wuchshoehe,
            bluehzeit: plant.bluehzeit === 'Unbekannt' ? (aiData.bluehzeit || plant.bluehzeit) : plant.bluehzeit,
            standort: plant.standort === 'Unbekannt' ? (aiData.standort || plant.standort) : plant.standort,
            besonderheiten: plant.besonderheiten.includes('Trefle API') ? (aiData.besonderheiten || plant.besonderheiten) : plant.besonderheiten,
          };
          
          successCount++;
          return true;
          
        } catch (error) {
          errorCount++;
          return false;
        }
      }
      return false;
    });
    
    // ✅ WARTE AUF COMPLETEN BATCH
    const results = await Promise.allSettled(batchPromises);
    processedCount += batch.length;
    
    // ✅ FORTSCHRITT
    const progress = Math.round((processedCount / plantsToEnhance.length) * 100);
    setEnhancementProgress(progress);
    
    console.log(`✅ Batch ${batchNumber} fertig: ${successCount} erfolgreich, ${errorCount} Fehler (${progress}%)`);
    
    // ✅ SEHR KURZE PAUSE (100ms) für Browser-Responsiveness
    if (batchNumber % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`🎉 VOLLSTÄNDIG: ${successCount} Pflanzen erfolgreich verbessert, ${errorCount} Fehler`);
  console.log(`📈 Erfolgsrate: ${Math.round((successCount / processedCount) * 100)}%`);
  
  return enhancedPlants;
}, []);

const createBasicPlant = useCallback(async (treflePlant: any): Promise<Plant> => {
  // ✅ VERBESSERT: Bessere Fallbacks für fehlende Daten
  const commonName = await comprehensiveTranslate(treflePlant.common_name || '');
  const family = await comprehensiveTranslate(treflePlant.family || 'Unbekannte Familie');
  const scientificName = treflePlant.scientific_name || treflePlant.name || 'Unbekannte Art';

  // ✅ INTELLIGENTERE DATEN-EXTRAKTION
  let wuchshoehe = 'Unbekannt';
  let herkunft = 'Unbekannt';
  let bluehzeit = 'Unbekannt';
  let standort = 'Unbekannt';
  let pflegehinweise = 'Basierend auf botanischen Daten';
  let lichtbedarf = 'Mittel';
  let giessplan = 'Regelmäßig gießen';
  let duengplan = 'Standard-Dünger';
  let pflegeaufwand = 'Mittel';
  let besonderheiten = `Familie: ${family}`;
  let pflanzzeit = 'Frühjahr';

  // 🔍 VERBESSERTE WUCHSHÖHE-ERKENNUNG
  const name = (commonName + ' ' + scientificName).toLowerCase();
  const sciName = scientificName.toLowerCase();
  const fam = family.toLowerCase();

  // ✅ ZUERST Trefle-Daten verwenden
  if (treflePlant.specifications?.average_height?.cm) {
    const height = treflePlant.specifications.average_height.cm;
    wuchshoehe = height > 100 ? `${(height/100).toFixed(1)} m` : `${height} cm`;
  } 
  else if (treflePlant.specifications?.maximum_height?.cm) {
    const height = treflePlant.specifications.maximum_height.cm;
    wuchshoehe = `bis ${height > 100 ? `${(height/100).toFixed(1)} m` : `${height} cm`}`;
  }
  else if (treflePlant.specifications?.average_height?.m) {
    wuchshoehe = `${treflePlant.specifications.average_height.m} m`;
  }
  // ✅ SONST INTELLIGENTE FALLBACKS
  else {
    // 🌳 BÄUME (erweiterte Liste)
    if (name.includes('baum') || name.includes('tree') || sciName.includes('quercus') || 
        sciName.includes('fagus') || sciName.includes('pinus') || sciName.includes('betula') ||
        sciName.includes('acer') || sciName.includes('fraxinus') || sciName.includes('tilia') ||
        sciName.includes('populus') || sciName.includes('salix') || sciName.includes('ulmus') ||
        sciName.includes('carpinus') || sciName.includes('sorbus') || sciName.includes('alnus')) {
      
      if (sciName.includes('quercus')) wuchshoehe = '20-30 m';
      else if (sciName.includes('fagus')) wuchshoehe = '25-35 m';
      else if (sciName.includes('pinus')) wuchshoehe = '15-25 m';
      else if (sciName.includes('betula')) wuchshoehe = '15-25 m';
      else if (sciName.includes('acer')) wuchshoehe = '10-15 m';
      else wuchshoehe = '15-25 m';
    }
    // 🌿 STRÄUCHER (erweiterte Liste)
    else if (name.includes('strauch') || name.includes('shrub') || name.includes('busch') ||
             sciName.includes('rosa') || sciName.includes('rhododendron') || sciName.includes('syringa') ||
             sciName.includes('hydrangea') || sciName.includes('buddleja') || sciName.includes('spiraea') ||
             sciName.includes('cotoneaster') || sciName.includes('berberis') || sciName.includes('viburnum')) {
      wuchshoehe = '1-3 m';
    }
    // 🌸 STAUDEN & BLUMEN
    else if (name.includes('staude') || name.includes('blume') || name.includes('flower') ||
             sciName.includes('tulipa') || sciName.includes('lilium') || sciName.includes('dianthus') ||
             sciName.includes('geranium') || sciName.includes('hosta') || sciName.includes('aster') ||
             sciName.includes('rudbeckia') || sciName.includes('echinacea') || sciName.includes('delphinium')) {
      wuchshoehe = '30-80 cm';
    }
    // 🪴 KRÄUTER
    else if (name.includes('kraut') || name.includes('herb') || sciName.includes('mentha') ||
             sciName.includes('thymus') || sciName.includes('ocimum') || sciName.includes('salvia') ||
             sciName.includes('origanum') || sciName.includes('petroselinum') || sciName.includes('coriandrum')) {
      wuchshoehe = '20-60 cm';
    }
    // 🌾 GRÄSER
    else if (name.includes('gras') || name.includes('grass') || fam.includes('poaceae')) {
      wuchshoehe = '40-120 cm';
    }
    // 🌵 SUKKULENTEN & KAKTEEN
    else if (name.includes('sukkulente') || name.includes('kaktus') || fam.includes('cactaceae') ||
             fam.includes('crassulaceae') || sciName.includes('sedum') || sciName.includes('sempervivum')) {
      wuchshoehe = '10-100 cm';
    }
    // 🍃 FARNE
    else if (name.includes('farn') || name.includes('fern') || fam.includes('dryopteridaceae') ||
             fam.includes('aspleniaceae') || sciName.includes('pteridium') || sciName.includes('polypodium')) {
      wuchshoehe = '30-150 cm';
    }
  }

  // 🌍 VERBESSERTE HERKUNFTS-ERKENNUNG
  if (treflePlant.distribution?.native && Array.isArray(treflePlant.distribution.native)) {
    herkunft = treflePlant.distribution.native.slice(0, 3).join(', ');
  } else if (treflePlant.origin && Array.isArray(treflePlant.origin)) {
    herkunft = treflePlant.origin.slice(0, 3).join(', ');
  }

  // 🌸 VERBESSERTE BLÜTEZEIT
  if (treflePlant.growth?.bloom_months && Array.isArray(treflePlant.growth.bloom_months)) {
    const monthTranslations: { [key: string]: string } = {
      'jan': 'Januar', 'feb': 'Februar', 'mar': 'März', 'apr': 'April',
      'may': 'Mai', 'jun': 'Juni', 'jul': 'Juli', 'aug': 'August',
      'sep': 'September', 'oct': 'Oktober', 'nov': 'November', 'dec': 'Dezember'
    };
    
    const months = treflePlant.growth.bloom_months
      .map((month: string) => monthTranslations[month.toLowerCase()] || month)
      .filter(Boolean);
    
    if (months.length > 0) {
      bluehzeit = months.join(', ');
    }
  }

  // 🏷️ KATEGORISIERUNG
  const categories = ruleBasedCategorization(commonName, family);
  const [mainCategory, subCategory, specification] = categories;

  return {
    name: scientificName,
    deutscherName: commonName !== 'Unbekannt' ? commonName : scientificName,
    familie: family,
    herkunft: herkunft,
    lichtbedarf: lichtbedarf,
    pflegehinweise: pflegehinweise,
    standort: standort,
    giessplan: giessplan,
    duengplan: duengplan,
    bluehzeit: bluehzeit,
    wuchshoehe: wuchshoehe,
    besonderheiten: besonderheiten,
    pflegeaufwand: pflegeaufwand,
    pflanzzeit: pflanzzeit,
    bilder: treflePlant.image_url ? [treflePlant.image_url] : [],
    id: treflePlant.id?.toString() || Math.random().toString(36).substr(2, 9),
    kategorie: mainCategory,
    unterkategorie: subCategory,
    spezifikation: specification
  };
}, [comprehensiveTranslate, ruleBasedCategorization]);


const refreshPlants = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ENHANCED_PLANTS_KEY);
    }
    window.location.reload();
  }, []);
  
useEffect(() => {
  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Lade Pflanzen aus Cache...');

      // 1. VERSUCHE: Statischen Cache zu laden
      const staticCache = await loadFromStaticCache();
      if (staticCache && staticCache.length > 0) {
        console.log(`✅ ${staticCache.length} Pflanzen aus Cache geladen`);
        setPlants(staticCache);
        setLoading(false);
        return;
      }

      // 2. FALLBACK: localStorage Cache
      const cachedEnhanced = getCachedPlants();
      if (cachedEnhanced && cachedEnhanced.plants.length > 0) {
        console.log(`💾 ${cachedEnhanced.plants.length} Pflanzen aus localStorage geladen`);
        setPlants(cachedEnhanced.plants);
        setLoading(false);
        return;
      }

      // 3. KEINE DATEN GEFUNDEN - STARTE AUTO-DOWNLOAD
      console.log('⚠️ Keine Cache-Dateien gefunden - starte automatischen Download...');
      setError('🔄 Pflanzen-Datenbank wird initialisiert... Dies kann beim ersten Start 10-30 Minuten dauern.');

      try {
        // Schritt 1: Lade alle plants_page_*.json Dateien
        console.log('📥 Lade alle Pflanzenseiten...');
        setCleaningProgress(5);
        const rawPlants = await loadAllTreflePages();

        if (rawPlants.length === 0) {
          setError('❌ Keine Pflanzendaten gefunden. Bitte überprüfen Sie die plants_page_*.json Dateien.');
          setPlants([]);
          setLoading(false);
          return;
        }

        console.log(`✅ ${rawPlants.length} rohe Pflanzen geladen`);
        setCleaningProgress(40);

        // Schritt 2: Bereinige und kategorisiere Daten
        console.log('🧹 Bereinige und kategorisiere Daten...');
        const cleaningResult = await cleanAllPlants(rawPlants);
        const cleanedPlants = cleaningResult.plants;
        setCleaningProgress(95);
        setEnhancementProgress(95);

        console.log(`🎉 ${cleanedPlants.length} Pflanzen erfolgreich verarbeitet`);

        // Schritt 3: Speichere in localStorage
        setPlants(cleanedPlants);
        cachePlants(cleanedPlants);

        // Schritt 5: Optional - Exportiere für zukünftige Nutzung
        console.log('💾 Daten wurden im localStorage gespeichert');
        setCleaningProgress(100);
        setEnhancementProgress(100);
        setAllPlantsLoaded(true);
        setError(null);

      } catch (downloadErr) {
        console.error('❌ Auto-Download fehlgeschlagen:', downloadErr);
        setError('❌ Fehler beim automatischen Download der Pflanzen-Datenbank. Bitte versuchen Sie es später erneut.');
        setPlants([]);
      }

    } catch (err) {
      console.log('❌ Fehler beim Laden:', err);
      setError('❌ Fehler beim Laden der Pflanzen-Datenbank');
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  fetchPlants();
}, [loadFromStaticCache, getCachedPlants, loadAllTreflePages, cleanAllPlants, comprehensiveTranslate, ruleBasedCategorization, cachePlants]);

return { 
    plants, 
    loading, 
    error, 
    cleaningProgress,
    enhancementProgress,
    allPlantsLoaded,
    refreshPlants 
  };
};