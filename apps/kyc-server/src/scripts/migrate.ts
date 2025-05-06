import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from '../libs/db'

async function main() {
  console.log('Running migrations...')
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

main() 