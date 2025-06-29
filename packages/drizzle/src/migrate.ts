import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL || ''

console.log('Using database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'))

const pool = new Pool({
	connectionString: DATABASE_URL,
	connectionTimeoutMillis: 5000,
})

//* connection test before migrations
async function testConnection() {
	try {
		const client = await pool.connect()
		console.log('Successfully connected to database')
		client.release()
		return true
	} catch (error) {
		console.error('Failed to connect to database:', error)
		return false
	}
}

async function main() {
	console.log('Testing database connection...')
	const connected = await testConnection()

	if (!connected) {
		console.error('Cannot proceed with migrations due to connection failure')
		process.exit(1)
	}

	console.log('Starting migrations...')
	const db = drizzle(pool)

	try {
		await migrate(db, { migrationsFolder: './drizzle' })
		console.log('Migrations complete!')
	} catch (error) {
		console.error('Migration failed:', error)
		throw error
	} finally {
		await pool.end()
	}
}

main().catch((err) => {
	console.error('Migration process failed:', err)
	process.exit(1)
})
