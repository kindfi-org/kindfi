import { z } from 'zod'

const envSchema = z.object({
	// VAPID Configuration
	VAPID_EMAIL: z.string().email('Invalid VAPID email format. Please provide a valid email address.'),
	VAPID_PRIVATE_KEY: z.string().min(1, 'VAPID private key is required. Please ensure it is set in your environment variables.'),
	NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1, 'VAPID public key is required. Please ensure it is set in your environment variables.'),

	// Supabase Configuration
	NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL format. Please provide a valid URL starting with https://.'),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required. Please ensure it is set in your environment variables.'),
})

export const getEnv = (): Env => {
	try {
		return envSchema.parse(process.env)
	} catch (error) {
		if (error instanceof z.ZodError) {
			const missingVars = error.errors
				.map(err => `  • ${err.path.join('.')}: ${err.message}`)
				.join('\n')
			throw new Error(`❌ Environment validation failed:\n${missingVars}\n\nPlease check your .env file and ensure all required variables are set.`)
		}
		throw error
	}
}

let _env: Env | null = null

export const env = (): Env => {
	if (!_env) {
		_env = getEnv()
	}
	return _env
}

// Type for the validated environment variables
export type Env = z.infer<typeof envSchema>
