import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined')
}

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	},
)

const getDatabaseUrl = async (): Promise<string> => {
	const { data, error } = await supabase.rpc('get_database_url')
	if (error) throw error
	if (!data) throw new Error('Database URL not found')
	return data
}

const initDatabase = async () => {
	const databaseUrl = await getDatabaseUrl()
	const client = postgres(databaseUrl)
	return drizzle(client)
}

export const dbPromise = initDatabase()

export const getDb = async () => {
	return await dbPromise
}
