const fs = require('fs')
const path = require('path')

// Load .env.local or .env manually if present
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../../../.env.local'),
    path.join(__dirname, '../../../.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
  ]
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (!process.env[key]) {
            process.env[key] = val
          }
        }
      }
    }
  }
}
loadEnv()

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yagiqadbqdufpzapdrvc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_Ka8Idhgn5TPkrIKt0rucvg_xL5xHXCJ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function validateSetup() {
  console.log('=== Botaniq Supabase Setup Validation ===\n')

  // 1. Check tables exist
  console.log('1. Checking tables...')
  const tables = ['plants', 'plant_images', 'user_profiles', 'favorites']

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`)
    } else {
      console.log(`   ✅ ${table}: exists`)
    }
  }

  // 2. Check indexes
  console.log('\n2. Checking indexes (via SQL)...')
  // We can't easily check indexes via client, need SQL
  console.log('   Run in SQL Editor:')
  console.log('   SELECT indexname FROM pg_indexes WHERE schemaname = \'public\';')

  // 3. Check RLS enabled
  console.log('\n3. Checking RLS (via SQL)...')
  console.log('   Run in SQL Editor:')
  console.log('   SELECT relname, relrowsecurity FROM pg_class WHERE relname IN (\'plants\', \'plant_images\', \'user_profiles\', \'favorites\');')

  // 4. Test insert/query
  console.log('\n4. Testing basic operations...')

  // Test plants
  const { data: plants } = await supabase
    .from('plants')
    .select('id, name, deutscher_name, familie')
    .limit(3)

  if (plants) {
    console.log('   ✅ Plants query works')
    console.log('   Sample:', plants)
  } else {
    console.log('   ❌ Plants query failed')
  }

  // Test plant_images
  const { data: images } = await supabase
    .from('plant_images')
    .select('*')
    .limit(1)

  if (images !== null) {
    console.log('   ✅ Plant images query works')
  } else {
    console.log('   ❌ Plant images query failed')
  }

  console.log('\n=== Validation Complete ===')
}

validateSetup()