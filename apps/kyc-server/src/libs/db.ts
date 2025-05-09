import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { kycStatus } from '../schema/kyc'

// Fail fast when DATABASE_URL is missing outside of development
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'development') {
	throw new Error('DATABASE_URL must be defined in production')
}

const databaseUrl =
	process.env.DATABASE_URL ??
	'postgres://postgres:postgres@localhost:5432/kindfi'

const client = postgres(databaseUrl)

export const db = drizzle(client, {
	schema: {
		kycStatus,
	},
})

export type Database = typeof db
