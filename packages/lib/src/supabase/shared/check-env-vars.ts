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
		'SUPABASE_URL',
		'SUPABASE_ANON_KEY',
		'SUPABASE_SERVICE_ROLE_KEY',
	]

	validateEnvVars(requiredEnvVars)
}

export function validatePasskeyEnvVars() {
	const requiredEnvVars = ['RP_ID', 'RP_NAME', 'EXPECTED_ORIGIN']

	const optionalEnvVars = [
		'REDIS_URL',
		'CHALLENGE_TTL_SECONDS',
		'NETWORK_PASSPHRASE',
		'FACTORY_CONTRACT_ID',
		'ACCOUNT_SECP256R1_CONTRACT_WASM',
		'RPC_URL',
		'HORIZON_URL',
	]

	validateEnvVars(requiredEnvVars)
	console.log('Core passkey environment variables validated.')
	console.log(`Optional passkey variables: ${optionalEnvVars.join(', ')}`)
}
