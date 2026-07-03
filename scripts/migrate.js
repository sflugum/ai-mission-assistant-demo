import dotenv from 'dotenv'
dotenv.config({ path: './backend/.env' })
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNeonPool } from '../backend/src/config/neon.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, '../backend/src/db/migrations')

async function runMigrations() {
  const pool = getNeonPool()
  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_history (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    const { rows } = await client.query('SELECT name FROM migrations_history')
    const appliedMigrations = new Set(rows.map(r => r.name))

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort() 

    let migrationsRan = 0

    for (const file of files) {
      if (!appliedMigrations.has(file)) {
        console.log(`Applying migration: ${file}`)
        const filePath = path.join(migrationsDir, file)
        const sql = fs.readFileSync(filePath, 'utf8')

        await client.query('BEGIN')
        await client.query(sql)
        await client.query('INSERT INTO migrations_history (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        
        console.log(`✅ Successfully applied ${file}`)
        migrationsRan++
      }
    }

    if (migrationsRan === 0) {
      console.log('✅ Database is already up to date.')
    }
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration failed:', err)
  } finally {
    client.release()
    await pool.end() 
  }
}

runMigrations()