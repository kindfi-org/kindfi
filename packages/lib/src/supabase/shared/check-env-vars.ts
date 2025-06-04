export function validateEnvVars(requiredEnvVars: string[]) {
	// biome-ignore lint/complexity/noForEach: <explanation>
	requiredEnvVars.forEach((envVar) => {
		if (!process.env[envVar]) {
			throw new Error(`Missing required environment variable: ${envVar}`)
		}
	})

	console.log('All required environment variables are present.')
}

export function validateSupabaseEnvVars() {
	const requiredEnvVars = [
		// 'SUPABASE_URL', // removed for web app
		// 'SUPABASE_ANON_KEY', // removed for web app
		'SUPABASE_SERVICE_ROLE_KEY',
		'NEXT_PUBLIC_SUPABASE_URL',
		'NEXT_PUBLIC_SUPABASE_ANON_KEY',
	]

	validateEnvVars(requiredEnvVars)
}
