import path from 'path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from '../libs/db'

async function main() {
	console.log('Running migrations...')

	try {
		await migrate(db, {
			migrationsFolder: path.join(__dirname, '../../../drizzle'),
		})
		console.log('Migrations completed successfully')
	} catch (error) {
		// Type the error for better type safety
		const err = error as Error
		console.error('Error running migrations:', err.message)
		process.exit(1)
	}
}

main()
