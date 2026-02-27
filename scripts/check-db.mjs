import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Parse .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'nexia' } }
)

const r = await client.from('time_agents').select('id', { count: 'exact', head: true })
console.log('time_agents:', r.count !== null ? `exists (${r.count} rows)` : 'NOT FOUND', r.error?.message || '')
