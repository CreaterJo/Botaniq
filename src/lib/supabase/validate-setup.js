require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

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