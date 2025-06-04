import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

// Type for the Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>

// Create typed Supabase client
export const createTypedSupabaseClient = (
	supabaseUrl: string,
	supabaseAnonKey: string,
	options?: Parameters<typeof createClient>[2],
): TypedSupabaseClient => {
	return createClient<Database>(supabaseUrl, supabaseAnonKey, options)
}

// Helper function to create client with environment variables
export const createKindFiSupabaseClient = (): TypedSupabaseClient => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables')
	}

	return createTypedSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Server-side client (requires service role key)
export const createKindFiSupabaseServerClient = (): TypedSupabaseClient => {
	const supabaseUrl = process.env.SUPABASE_URL
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!supabaseUrl || !supabaseServiceKey) {
		throw new Error('Missing Supabase server environment variables')
	}

	return createTypedSupabaseClient(supabaseUrl, supabaseServiceKey)
}
