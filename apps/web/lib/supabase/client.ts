import { createBrowserClient } from '@supabase/ssr'
import { createClient as createMockClient } from '@services/supabase/mock'

export const createClient = () => {
	// Use mock client in development if no credentials
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
		console.warn('Using mock Supabase client as no credentials provided')
		return createMockClient()
	}

	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	)
}
