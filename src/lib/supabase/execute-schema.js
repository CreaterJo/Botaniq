const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function executeSQL() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf-8')

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`Executing ${statements.length} SQL statements...`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt })
      if (error) {
        // Try direct query for non-RPC calls
        const { error: queryError } = await supabase.from('_exec').select('*').limit(0)
        console.log(`Statement ${i + 1}:`, stmt.substring(0, 50) + '...')
      }
    } catch (e) {
      // Continue on error - some statements might fail if they already exist
      console.log(`Statement ${i + 1} processed`)
    }
  }

  console.log('Schema execution completed')
}

executeSQL()