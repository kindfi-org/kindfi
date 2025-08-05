export function validateEnvVars(requiredEnvVars: string[]) {
	requiredEnvVars.forEach((envVar) => {
		if (!process.env[envVar]) {
			throw new Error(`Missing required environment variable: ${envVar}`)
		}
	})

	console.log('All required environment variables are present.')
}

export function validateSupabaseEnvVars() {
	const requiredEnvVars = [
		'SUPABASE_URL',
		'SUPABASE_ANON_KEY',
		'SUPABASE_SERVICE_ROLE_KEY',
	]

	validateEnvVars(requiredEnvVars)
}
