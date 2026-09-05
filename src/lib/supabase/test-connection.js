require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

console.log('URL configured:', !!supabaseUrl)
console.log('Key configured:', !!supabaseAnonKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')

  try {
    // Test query
    const { data, error } = await supabase
      .from('plants')
      .select('id, name, deutscher_name')
      .limit(1)

    if (error) {
      console.log('Response:', error.message)
      console.log('\nTabellen existieren noch nicht - das ist erwartet.')
      console.log('Bitte führe schema.sql im Supabase SQL Editor aus.')
      return false
    }

    console.log('Connection successful!')
    console.log('Sample data:', data)
    return true
  } catch (e) {
    console.error('Connection failed:', e.message)
    return false
  }
}

testConnection()