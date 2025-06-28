import { appEnvConfig } from '@packages/lib/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const appConfig = appEnvConfig()

const initDatabase = async () => {
	const databaseUrl = appConfig.database.url
	const client = postgres(databaseUrl)
	return drizzle(client)
}

export const dbPromise = initDatabase()

export const getDb = async () => {
	return await dbPromise
}
