require('dotenv').config()
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

// SQL Schema
const schemaPath = path.join(__dirname, '../../supabase/migrations/20260902141500_botaniq_schema.sql')
const schemaSQL = fs.readFileSync(schemaPath, 'utf-8')

async function deploySchema() {
  console.log('=== Botaniq Supabase Schema Deployment ===\n')
  console.log('Da der Supabase JS Client kein DDL ausführen kann,')
  console.log('nutzen wir die Management API.\n')

  console.log('Schema SQL wird gelesen...')
  console.log(`Länge: ${schemaSQL.length} Zeichen\n`)

  console.log('Bitte führe das Schema manuell im SQL Editor aus:')
  console.log('https://supabase.com/dashboard/project/yagiqadbqdufpzapdrvc/sql/new\n')

  console.log('Alternativ, kopiere das SQL aus:')
  console.log(`${schemaPath}\n`)

  // Speichere SQL auch im src Ordner für einfachen Zugriff
  const outputPath = path.join(__dirname, 'schema-to-execute.sql')
  fs.writeFileSync(outputPath, schemaSQL)
  console.log(`SQL auch gespeichert unter: ${outputPath}`)
}

deploySchema()