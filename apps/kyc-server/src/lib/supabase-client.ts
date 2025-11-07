import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { createClient } from '@supabase/supabase-js'

const appConfig: AppEnvInterface = appEnvConfig('kyc-server')

// Create Supabase client with kyc-server specific config
export const supabaseServiceRole = createClient(
	appConfig.database.url,
	appConfig.database.serviceRoleKey,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	},
)

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
	return !!(appConfig.database.url && appConfig.database.serviceRoleKey)
}
