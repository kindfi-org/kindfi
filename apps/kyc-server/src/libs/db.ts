import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { kycStatus } from '../schema/kyc'

const databaseUrl =
	process.env.DATABASE_URL ||
	'postgres://postgres:postgres@localhost:5432/kindfi'

const client = postgres(databaseUrl)

export const db = drizzle(client, {
	schema: {
		kycStatus,
	},
})

export type Database = typeof db
