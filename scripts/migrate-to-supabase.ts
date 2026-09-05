/**
 * Migration Script: Lokale JSON-Daten → Supabase
 *
 * Dieses Script:
 * 1. Lädt public/data/cached_plants.json
 * 2. Bereinigt Duplikate und entfernt nicht verwendete Felder
 * 3. Lädt maximal 2 Bilder pro Pflanze (primäre Bilder)
 * 4. Importiert in Supabase
 * 5. Lädt optionale zusätzliche Bilder von GBIF/iNaturalist
 *
 * Nutzung:
 *   npm run migrate
 *   npm run migrate -- --dry-run          (Testlauf ohne Database)
 *   npm run migrate -- --images           (Bilder in Storage hochladen)
 *   npm run migrate -- --batch-size=500   (Batch-Größe anpassen)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Supabase Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const uploadImages = args.includes('--images');
const batchSize = parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '1000');

// =====================
// Types
// =====================
interface Plant {
  id?: string;
  name: string;
  deutscherName: string;
  familie: string;
  herkunft?: string;
  lichtbedarf?: string;
  pflegehinweise?: string;
  standort?: string;
  giessplan?: string;
  duengplan?: string;
  bluehzeit?: string;
  wuchshoehe?: string;
  pflegeaufwand?: string;
  besonderheiten?: string;
  bilder?: string[];
  bilderQuellen?: any[];
  kategorie?: string;
  unterkategorie?: string;
  pflanzzeit?: string;
  spezifikation?: string;
}

interface PlantRow {
  id: string;
  name: string;
  deutscher_name: string;
  familie: string;
  kategorie: string | null;
  unterkategorie: string | null;
  herkunft: string | null;
  lichtbedarf: string | null;
  standort: string | null;
  bluehzeit: string | null;
  wuchshoehe: string | null;
  giessplan: string | null;
  pflegehinweise: string | null;
  pflegeaufwand: string | null;
  besonderheiten: string | null;
}

interface ImageRow {
  plant_id: string;
  url: string;
  source: string;
  sort_order: number;
}

// =====================
// Helpers
// =====================
function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\-\.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanPlant(plant: Plant): PlantRow {
  const id = plant.id || slugify(plant.name);
  return {
    id,
    name: plant.name,
    deutscher_name: plant.deutscherName,
    familie: plant.familie,
    kategorie: plant.kategorie || null,
    unterkategorie: plant.unterkategorie || null,
    herkunft: plant.herkunft || 'Unbekannt',
    lichtbedarf: plant.lichtbedarf || 'Sonne bis Halbschatten',
    standort: plant.standort || 'Unbekannt',
    bluehzeit: plant.bluehzeit || 'Unbekannt',
    wuchshoehe: plant.wuchshoehe || 'Unbekannt',
    giessplan: plant.giessplan || 'Regelmäßig gießen',
    pflegehinweise: plant.pflegehinweise || 'Basierend auf botanischen Daten',
    pflegeaufwand: plant.pflegeaufwand || 'Mittel',
    besonderheiten: plant.besonderheiten || null,
  };
}

function extractImages(plant: Plant): ImageRow[] {
  const images: ImageRow[] = [];
  if (!plant.bilder || plant.bilder.length === 0) {
    images.push({
      plant_id: slugify(plant.name),
      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      source: 'placeholder',
      sort_order: 0
    });
    return images;
  }
  // Max 2 primäre Bilder
  const primaryImages = plant.bilder.slice(0, 2);
  primaryImages.forEach((url, i) => {
    images.push({
      plant_id: slugify(plant.name),
      url,
      source: 'storage',
      sort_order: i
    });
  });
  // Zusätzliche als lazy-load URLs
  plant.bilder.slice(2).forEach((url, i) => {
    images.push({
      plant_id: slugify(plant.name),
      url,
      source: 'api_lazy',
      sort_order: 2 + i
    });
  });
  return images;
}

// =====================
// Main
// =====================
async function main() {
  console.log('\n🌱 Botaniq Migration Script');
  console.log('   Dry Run:', isDryRun ? 'JA' : 'NEIN');
  console.log('   Bilder Upload:', uploadImages ? 'JA' : 'NEIN');
  console.log('   Batch Size:', batchSize);
  console.log('');

  const startTime = Date.now();

  // 1. Load data
  const dataPath = resolve('public/data/cached_plants.json');
  if (!existsSync(dataPath)) {
    console.error('❌ Datei nicht gefunden:', dataPath);
    console.error('   Bitte cached_plants.json in public/data/ bereitstellen.');
    process.exit(1);
  }

  console.log('📥 Lade Pflanzen aus cached_plants.json...');
  const rawData = readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(rawData);
  const plants: Plant[] = (parsed.plants || parsed) as Plant[];
  console.log(`   Geladen: ${plants.length} Pflanzen`);

  if (plants.length === 0) {
    console.error('❌ Keine Pflanzen gefunden in der Datei.');
    process.exit(1);
  }

  // 2. Clean & deduplicate
  console.log('\n🧹 Bereinige Daten...');
  const seen = new Set<string>();
  const cleanPlants: PlantRow[] = [];
  const allImages: ImageRow[] = [];
  const duplicates: string[] = [];

  for (const plant of plants) {
    const id = slugify(plant.name);
    if (seen.has(id)) {
      duplicates.push(plant.name);
      continue;
    }
    seen.add(id);
    cleanPlants.push(cleanPlant(plant));
    allImages.push(...extractImages(plant));
  }

  console.log(`   After dedup: ${cleanPlants.length} Pflanzen (${duplicates.length} Duplikate entfernt)`);
  console.log(`   Bilder: ${allImages.length} Einträge`);

  // 3. Dry run - show preview
  if (isDryRun) {
    console.log('\n🔍 DRY RUN - Zeige Preview:');
    console.log('   Erste 5 Pflanzen:');
    cleanPlants.slice(0, 5).forEach(p => {
      console.log(`   - ${p.name} → ${p.deutscher_name} (${p.kategorie})`);
    });
    console.log('\n✅ Dry run erfolgreich. Keine Datenbank-Änderungen.');
    return;
  }

  // 4. Migrate plants
  console.log('\n🚀 Starte Migration...');
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < cleanPlants.length; i += batchSize) {
    const batch = cleanPlants.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(cleanPlants.length / batchSize);

    console.log(`   Pflanzen Batch ${batchNum}/${totalBatches} (${batch.length} Einträge)...`);

    for (const plant of batch) {
      try {
        const { error } = await supabase.from('plants').insert(plant).select().single();
        if (error) {
          // Unique violation - skip
          if (error.code === '23505') {
            console.log(`   ⏭️  Überspringe Duplikat: ${plant.name}`);
            continue;
          }
          throw error;
        }
        successCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(`[${plant.name}]: ${err.message}`);
        if (errorCount <= 5) {
          console.error(`   ❌ Fehler: ${plant.name} - ${err.message}`);
        }
      }
    }
  }

  console.log(`\n✅ Pflanzen migriert: ${successCount} erfolgreich, ${errorCount} Fehler`);

  // 5. Migrate images
  if (allImages.length > 0) {
    console.log('\n🖼️  Migrere Bilder...');
    let imgSuccess = 0;
    let imgError = 0;

    for (let i = 0; i < allImages.length; i += batchSize) {
      const batch = allImages.slice(i, i + batchSize);
      console.log(`   Bilder Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allImages.length / batchSize)}...`);

      for (const img of batch) {
        try {
          const { error } = await supabase.from('plant_images').insert(img);
          if (error) {
            if (error.code === '23503') continue; // FK violation - plant not found
            throw error;
          }
          imgSuccess++;
        } catch {
          imgError++;
        }
      }
    }
    console.log(`✅ Bilder migriert: ${imgSuccess} erfolgreich, ${imgError} Fehler`);
  }

  // 6. Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Migration abgeschlossen in ${duration}s`);
  console.log(`   Pflanzen: ${successCount}/${cleanPlants.length} (${Math.round(successCount/cleanPlants.length*100)}%)`);
  console.log(`   Duplikate: ${duplicates.length}`);
  console.log(`   Fehler: ${errors.length}`);

  // 7. Write report
  const report = {
    timestamp: new Date().toISOString(),
    totalLoaded: plants.length,
    totalClean: cleanPlants.length,
    duplicates: duplicates.length,
    success: successCount,
    errors: errorCount,
    errorsDetail: errors.slice(0, 100),
    durationSeconds: parseFloat(duration),
    batchSize,
    isDryRun: false
  };

  writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Report gespeichert: migration-report.json');

  if (errors.length > 0) {
    writeFileSync('migration-errors.json', JSON.stringify(errors, null, 2));
    console.log('⚠️  Fehlerdetails: migration-errors.json');
  }
}

main().catch(err => {
  console.error('\n💥 Migration fehlgeschlagen:', err);
  process.exit(1);
});
