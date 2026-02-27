import { readFileSync } from 'fs'
import pg from 'pg'

const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error('Usage: node scripts/run-sql.mjs <sql-file>')
  process.exit(1)
}

const sql = readFileSync(sqlFile, 'utf-8')
const ref = 'ydnwqptkrftonunyjzoc'
const password = 'paternoster@890'

// Try pooler with separate config (not connection string URL)
const attempts = [
  { label: 'Pooler us-east-1 session', host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432, user: `postgres.${ref}` },
  { label: 'Pooler us-east-1 transaction', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${ref}` },
  { label: 'Pooler sa-east-1 session', host: 'aws-0-sa-east-1.pooler.supabase.com', port: 5432, user: `postgres.${ref}` },
  { label: 'Pooler us-east-1 plain user', host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432, user: 'postgres' },
]

console.log(`Will execute ${sqlFile} (${sql.length} chars)\n`)

for (const attempt of attempts) {
  console.log(`Trying ${attempt.label} (${attempt.host}:${attempt.port})...`)
  const client = new pg.Client({
    host: attempt.host,
    port: attempt.port,
    database: 'postgres',
    user: attempt.user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })
  try {
    await client.connect()
    console.log(`Connected!`)
    await client.query(sql)
    console.log('SQL executed successfully!')
    await client.end()
    process.exit(0)
  } catch (err) {
    console.log(`  Failed: ${err.message}\n`)
    await client.end().catch(() => {})
  }
}

console.error('All attempts failed.')
process.exit(1)
