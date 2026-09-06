/**
 * Botaniq Migration Script
 * Imports cached_plants.json into Supabase
 *
 * Usage:
 *   node src/lib/supabase/migrate-plants.js
 *
 * Requires:
 *   SUPABASE_SERVICE_ROLE_KEY in environment
 *   Schema already executed in Supabase Dashboard
 */
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  console.error('')
  console.error('   Get SUPABASE_SERVICE_ROLE_KEY from:')
  console.error('   https://supabase.com/dashboard/project/yagiqadbqdufpzapdrvc/settings/api')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const BATCH_SIZE = 500
const DATA_FILE = path.join(__dirname, '../../../public/data/cached_plants.json')

/**
 * Transform a single plant from cached format to DB format
 * Removes unused fields: duengplan, pflanzzeit, spezifikation, bilderQuellen
 */
function transformPlant(p) {
  return {
    id: String(p.id),
    name: p.name || '',
    deutscher_name: p.deutscherName || p.deutscher_name || '',
    familie: p.familie || '',
    kategorie: p.kategorie || null,
    unterkategorie: p.unterkategorie || null,
    herkunft: p.herkunft || 'Unbekannt',
    lichtbedarf: p.lichtbedarf || 'Sonne bis Halbschatten',
    standort: p.standort || 'Unbekannt',
    bluehzeit: p.bluehzeit || 'Unbekannt',
    wuchshoehe: p.wuchshoehe || 'Unbekannt',
    giessplan: p.giessplan || 'Regelmäßig gießen',
    pflegehinweise: p.pflegehinweise || 'Basierend auf botanischen Daten',
    pflegeaufwand: p.pflegeaufwand || 'Mittel',
    besonderheiten: p.besonderheiten || null,
  }
}

/**
 * Transform bilder array into plant_images rows
 */
function transformImages(plantId, bilder) {
  if (!Array.isArray(bilder) || bilder.length === 0) return []
  return bilder.slice(0, 2).map((url, idx) => ({
    plant_id: String(plantId),
    url: url,
    source: 'Storage',
    sort_order: idx,
  }))
}

async function migrate() {
  console.log('🌱 Botaniq Plant Migration')
  console.log('===========================')
  console.log(`Data file: ${DATA_FILE}`)
  console.log('')

  // Load data
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`)
    process.exit(1)
  }

  console.log('📖 Loading data...')
  const raw = fs.readFileSync(DATA_FILE, 'utf8')
  const { plants, count, timestamp } = JSON.parse(raw)

  console.log(`📊 Total plants in file: ${count}`)
  console.log(`📅 Cache timestamp: ${timestamp}`)
  console.log('')

  if (!Array.isArray(plants) || plants.length === 0) {
    console.error('❌ No plants array found in data file')
    process.exit(1)
  }

  // Check for existing data
  const { count: existingCount } = await supabase
    .from('plants')
    .select('id', { count: 'exact', head: true })

  console.log(`📊 Existing plants in DB: ${existingCount || 0}`)
  console.log('')

  if (existingCount > 0) {
    console.log('⚠️  Database already has data.')
    const shouldContinue = process.stdin.isTTY
      ? false
      : true
    if (!shouldContinue) {
      console.log('Please clear the database first or use a fresh Supabase project.')
      process.exit(0)
    }
    console.log('Continuing with INSERT ON CONFLICT...')
  }

  // Migrate in batches
  let inserted = 0
  let imagesInserted = 0
  let errors = 0
  const startTime = Date.now()

  for (let i = 0; i < plants.length; i += BATCH_SIZE) {
    const batch = plants.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(plants.length / BATCH_SIZE)

    // Transform plants
    const plantsBatch = batch.map(transformPlant)

    // Upsert plants
    const { error: plantsError } = await supabase
      .from('plants')
      .upsert(plantsBatch, { onConflict: 'id' })

    if (plantsError) {
      console.error(`❌ Batch ${batchNum}/${totalBatches} plants error: ${plantsError.message}`)
      errors++
    } else {
      inserted += plantsBatch.length
    }

    // Transform and insert images (first 2 per plant)
    const imagesBatch = []
    for (const p of batch) {
      imagesBatch.push(...transformImages(p.id, p.bilder))
    }

    if (imagesBatch.length > 0) {
      const { error: imagesError } = await supabase
        .from('plant_images')
        .upsert(imagesBatch, { onConflict: null }) // No unique constraint on plant_images

      if (imagesError) {
        console.error(`⚠️  Batch ${batchNum}/${totalBatches} images error: ${imagesError.message}`)
      } else {
        imagesInserted += imagesBatch.length
      }
    }

    // Progress
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const rate = (inserted / elapsed).toFixed(1)
    const progress = (((i + batch.length) / plants.length) * 100).toFixed(1)
    process.stdout.write(
      `\r  ${progress}% (${inserted.toLocaleString()}/${plants.length.toLocaleString()}) — ${rate} plants/sec — ${elapsed}s elapsed`
    )

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 50))
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('\n')
  console.log('===========================')
  console.log('✅ Migration Complete!')
  console.log(`   Plants inserted:  ${inserted.toLocaleString()}`)
  console.log(`   Images inserted:  ${imagesInserted.toLocaleString()}`)
  console.log(`   Errors:           ${errors}`)
  console.log(`   Time:             ${totalElapsed}s`)
  console.log(`   Rate:             ${(inserted / totalElapsed).toFixed(1)} plants/sec`)
  console.log('===========================')
  console.log('')
  console.log('Next steps:')
  console.log('1. Run: node src/lib/supabase/validate-setup.js')
  console.log('2. Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables')
  console.log('3. Deploy to Vercel')
}

migrate().catch(err => {
  console.error('💥 Migration failed:', err.message)
  process.exit(1)
})
