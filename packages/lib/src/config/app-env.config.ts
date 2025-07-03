import { z } from 'zod'
import type {
	AppEnvInterface,
	AppName,
	ValidatedEnvInput,
} from '~/packages/lib/src/types/config.types'

// App-specific cached instances
let _webEnv: AppEnvInterface | null = null
let _kycServerEnv: AppEnvInterface | null = null
let _genericEnv: AppEnvInterface | null = null

// Next.js runtime environment injection
function getNextjsRuntimeEnv(): Record<string, string | undefined> {
	// Check if we're in a Next.js environment
	if (typeof window !== 'undefined') {
		// Client-side: only NEXT_PUBLIC_ prefixed variables are available
		const clientEnv: Record<string, string | undefined> = {}

		// Filter only NEXT_PUBLIC_ variables from process.env
		if (typeof process !== 'undefined' && process.env) {
			for (const [key, value] of Object.entries(process.env)) {
				if (key.startsWith('NEXT_PUBLIC_')) {
					clientEnv[key] = value
				}
			}
		}

		return clientEnv
	}

	// Server-side: all variables are available
	return process.env
}

// Enhanced environment reading with Next.js support
function readEnvironmentVariables(): Record<string, string | undefined> {
	const env = getNextjsRuntimeEnv()

	// Merge with process.env as fallback (server-side or Node.js context)
	if (typeof process !== 'undefined' && process.env) {
		return { ...process.env, ...env }
	}

	return env
}

// Function to create app-specific schema
function createAppSchema<T extends AppName>(appName: T) {
	const requirements = appRequirements[appName]
	const schemaShape: z.ZodRawShape = { ...baseEnvSchema.shape }

	// Make required fields non-optional
	for (const field of requirements.required) {
		const fieldSchema = baseEnvSchema.shape[field]
		if (fieldSchema) {
			// Create a new required version of the schema
			const unwrapped = fieldSchema.isOptional()
				? fieldSchema.unwrap()
				: fieldSchema
			schemaShape[field] = unwrapped
		}
	}

	return z.object(schemaShape)
}

// App detection helper
function detectApp(): AppName | undefined {
	// Check package.json name or process.cwd() to determine app
	if (typeof process !== 'undefined') {
		try {
			const packagePath = process.cwd() || process.env.PWD || ''
			if (packagePath.includes('/apps/web')) return 'web'
			if (packagePath.includes('/apps/kyc-server')) return 'kyc-server'
		} catch {
			// Fallback to process.env.APP_NAME if available
			return process.env.APP_NAME as AppName
		}
	}
	return (process.env.APP_NAME as 'web' | 'kyc-server') || undefined
}

// Generic getEnv function
export function getEnv<T extends AppName>(appName?: T): AppEnvInterface {
	try {
		const schema = appName ? createAppSchema(appName) : baseEnvSchema
		const envVars = readEnvironmentVariables()

		console.log('🔍 Environment Variables Read:', {
			appName,
			envVarsKeys: Object.keys(envVars),
			hasRequiredVars: appName
				? appRequirements[appName].required.map((key) => ({
						key,
						exists: !!envVars[key],
						value: envVars[key]
							? `${envVars[key]?.substring(0, 10)}...`
							: 'undefined',
					}))
				: 'generic',
		})

		console.log('🏗️ Schema Info:', {
			schemaKeys: Object.keys(schema.shape),
			requiredFields: appName ? appRequirements[appName].required : 'none',
		})

		// Perform a safe parse first to get detailed error information
		const result = schema.safeParse(envVars)

		if (!result.success) {
			console.error('❌ Schema validation failed:', {
				errorCount: result.error.errors.length,
				errors: result.error.errors.map((err) => ({
					path: err.path.join('.'),
					message: err.message,
					code: err.code,
					received: err.code === 'invalid_type' ? err.received : undefined,
					expected: err.code === 'invalid_type' ? err.expected : undefined,
				})),
			})
			throw result.error
		}

		console.log('✅ Schema validation successful, transforming environment...')
		const parsed = result.data

		return transformEnv(parsed)
	} catch (error) {
		console.error('💥 Error in getEnv function:', {
			errorType: error?.constructor?.name,
			message: error instanceof Error ? error.message : 'Unknown error',
			appName,
		})

		if (error instanceof z.ZodError) {
			const missingVars = error.errors
				.map((err) => `  • ${err.path.join('.')}: ${err.message}`)
				.join('\n')
			throw new Error(
				`❌ Environment validation failed for ${appName || 'generic'}:\n${missingVars}\n\nPlease check your .env file and ensure all required variables are set.`,
			)
		}
		throw error
	}
}

// Transform function with explicit type annotation
export function transformEnv(data: ValidatedEnvInput): AppEnvInterface {
	console.log('🔄 Transforming environment variables:', {
		dataKeys: Object.keys(data),
		sampleData: {
			nodeEnv: data.NODE_ENV,
			hasSupabaseUrl: !!data.NEXT_PUBLIC_SUPABASE_URL || !!data.SUPABASE_URL,
			hasSupabaseKey:
				!!data.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!data.SUPABASE_ANON_KEY,
		},
	})

	return {
		auth: {
			secret: data.NEXTAUTH_SECRET || 'super-secret',
			url: data.NEXTAUTH_URL || '',
			token: {
				expiration: data.JWT_TOKEN_EXPIRATION || 60 * 60 * 24 * 30, // Default to 30 days
				update: data.NEXT_PUBLIC_JWT_TOKEN_UPDATE || 60 * 60 * 24, // Default to 24 hours
			},
		},
		database: {
			url: data.NEXT_PUBLIC_SUPABASE_URL || data.SUPABASE_URL || '',
			anonKey:
				data.NEXT_PUBLIC_SUPABASE_ANON_KEY || data.SUPABASE_ANON_KEY || '',
			serviceRoleKey: data.SUPABASE_SERVICE_ROLE_KEY || '',
			connectionString: data.SUPABASE_DB_URL || '',
		},
		features: {
			enableEscrowFeature:
				data.NODE_ENV === 'development' ||
				data.NEXT_PUBLIC_ENABLE_ESCROW_FEATURE === 'true',
		},
		vapid: {
			email: data.VAPID_EMAIL || '',
			privateKey: data.VAPID_PRIVATE_KEY || '',
			publicKey: data.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
		},
		env: {
			nodeEnv: data.NODE_ENV || 'development',
			appEnv: data.NEXT_PUBLIC_APP_ENV || 'development',
		},
		stellar: {
			networkUrl:
				data.STELLAR_NETWORK_URL || 'https://horizon-testnet.stellar.org',
			networkPassphrase:
				data.NETWORK_PASSPHRASE || 'Test SDF Future Network ; October 2022',
			factoryContractId:
				data.FACTORY_CONTRACT_ID ||
				'CCZWIOWKT4WGJQHWZFF7ARCQJFVWRXPOKG4WGY6DOZ72OHZEMKXAEGRO',
			accountSecp256r1ContractWasm:
				data.ACCOUNT_SECP256R1_CONTRACT_WASM ||
				'23d8e1fbdb0bb903815feb7d07b675db98b5376feedab056aab61910d41e80c1',
			rpcUrl: data.RPC_URL || 'https://rpc-futurenet.stellar.org',
			horizonUrl: data.HORIZON_URL || 'https://horizon-futurenet.stellar.org',
		},
		externalApis: {
			trustlessWork: {
				url: data.TRUSTLESS_WORK_API_URL || '',
				apiKey: data.TRUSTLESS_WORK_API_KEY || '',
			},
			kyc: {
				baseUrl: data.NEXT_PUBLIC_KYC_API_BASE_URL || '',
			},
		},
		analytics: {
			gaId: data.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
		},
		deployment: {
			vercelUrl: data.VERCEL_URL || '',
			port: data.PORT || 3000,
		},
		kycServer: {
			allowedOrigins: data.ALLOWED_ORIGINS || '',
		},
		indexer: {
			chainId: data.CHAIN_ID || '',
			endpoint: data.ENDPOINT || '',
		},
		passkey: {
			redis: {
				url: data.REDIS_URL || '',
			},
			rpId: data.RP_ID || ['localhost'],
			rpName: data.RP_NAME || ['App'],
			expectedOrigin: data.EXPECTED_ORIGIN || ['http://localhost:3000'],
			challengeTtlSeconds: data.CHALLENGE_TTL_SECONDS || 60,
			challengeTtlMs: (data.CHALLENGE_TTL_SECONDS || 60) * 1000,
		},
	} as const
}

// ? Main export function with app detection
/**
 * Get the environment configuration for a specific app.
 * This function auto-detects the app based on the current working directory or uses the provided app name.
 * It returns the environment configuration for the detected app, ensuring that all required environment variables
 * are validated and transformed into a consistent format.
 *
 * @param appName Optional app name to override auto-detection.
 * If not provided, the function will attempt to detect the app based on the current working directory
 * @returns The environment configuration for the detected app.
 * @throws {Error} If the environment validation fails or if required variables are missing.
 * @example
 *
 * import { appEnvConfig } from '@packages/lib/config'
 * const config = appEnvConfig('web') // Explicitly specify 'web' app
 * // or
 * const config = appEnvConfig() // Auto-detects the app based on current working directory
 * // Use the config object to access environment variables
 * console.log(config.auth.secret) // Access the auth secret
 */
export function appEnvConfig(appName?: AppName): AppEnvInterface {
	// Auto-detect app if not provided
	const detectedApp = appName || detectApp()

	switch (detectedApp) {
		case 'web':
			if (!_webEnv) {
				_webEnv = getEnv('web')
			}
			return _webEnv
		case 'kyc-server':
			if (!_kycServerEnv) {
				_kycServerEnv = getEnv('kyc-server')
			}
			return _kycServerEnv
		default:
			if (!_genericEnv) {
				_genericEnv = getEnv()
			}
			return _genericEnv
	}
}

// Base environment schema with all possible variables (all optional by default)
export const baseEnvSchema = z.object({
	// VAPID Configuration
	VAPID_EMAIL: z.string().email('Invalid VAPID email format').optional(),
	VAPID_PRIVATE_KEY: z.string().optional(),
	NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),

	// Auth Configuration
	NEXTAUTH_SECRET: z.string().optional(),
	NEXTAUTH_URL: z
		.string()
		.url('Invalid NextAuth URL format')
		.optional()
		.or(z.literal('')),
	JWT_TOKEN_EXPIRATION: z
		.string()
		.regex(/^\d+$/, 'JWT token expiration must be a valid number')
		.transform(Number)
		.optional(),
	NEXT_PUBLIC_JWT_TOKEN_UPDATE: z
		.string()
		.regex(/^\d+$/, 'JWT token update must be a valid number')
		.transform(Number)
		.optional(),

	// Database Configuration (both variants)
	NEXT_PUBLIC_SUPABASE_URL: z
		.string()
		.url('Invalid Supabase URL format')
		.optional(),
	SUPABASE_URL: z.string().url('Invalid Supabase URL format').optional(),
	SUPABASE_DB_URL: z.string().url('Invalid Supabase DB URL format').optional(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
	SUPABASE_ANON_KEY: z.string().optional(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

	// Features Configuration
	NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
	NEXT_PUBLIC_APP_ENV: z.enum(['development', 'production', 'test']).optional(),
	NEXT_PUBLIC_ENABLE_ESCROW_FEATURE: z.enum(['true', 'false']).optional(),

	// Stellar Configuration
	STELLAR_NETWORK_URL: z
		.string()
		.url('Invalid Stellar Network URL format')
		.optional(),
	NETWORK_PASSPHRASE: z.string().optional(),
	FACTORY_CONTRACT_ID: z.string().optional(),
	ACCOUNT_SECP256R1_CONTRACT_WASM: z.string().optional(),
	RPC_URL: z.string().url('Invalid RPC URL format').optional(),
	HORIZON_URL: z.string().url('Invalid Horizon URL format').optional(),

	// External APIs
	TRUSTLESS_WORK_API_URL: z
		.string()
		.url('Invalid Trustless Work API URL format')
		.optional(),
	TRUSTLESS_WORK_API_KEY: z.string().optional(),
	NEXT_PUBLIC_KYC_API_BASE_URL: z
		.string()
		.url('Invalid KYC API base URL format')
		.optional(),

	// Analytics
	NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

	// Deployment
	VERCEL_URL: z.string().optional(),
	PORT: z
		.string()
		.regex(/^\d+$/, 'Port must be a valid number')
		.transform(Number)
		.optional(),

	// KYC Server
	ALLOWED_ORIGINS: z.string().optional(),

	// Indexer
	CHAIN_ID: z.string().optional(),
	ENDPOINT: z.string().optional(),

	// Passkey Configuration
	REDIS_URL: z.string().optional(),
	RP_ID: z
		.string()
		.transform((val) => {
			if (!val) return ['localhost']
			try {
				return JSON.parse(val) as string[]
			} catch {
				throw new Error('Invalid RP_ID format. Expected a JSON array string.')
			}
		})
		.optional(),
	RP_NAME: z
		.string()
		.transform((val) => {
			if (!val) return ['App']
			try {
				return JSON.parse(val) as string[]
			} catch {
				throw new Error('Invalid RP_NAME format. Expected a JSON array string.')
			}
		})
		.optional(),
	EXPECTED_ORIGIN: z
		.string()
		.transform((val) => {
			if (!val) return ['http://localhost:3000']
			try {
				return JSON.parse(val) as string[]
			} catch {
				throw new Error(
					'Invalid EXPECTED_ORIGIN format. Expected a JSON array string.',
				)
			}
		})
		.optional(),
	CHALLENGE_TTL_SECONDS: z.coerce.number().optional(),
})

// App-specific requirement configurations
export const appRequirements = {
	web: {
		required: [
			'NEXT_PUBLIC_SUPABASE_URL',
			'NEXT_PUBLIC_SUPABASE_ANON_KEY',
			'NEXTAUTH_SECRET',
		] as const,
		optional: [
			'VAPID_EMAIL',
			'VAPID_PRIVATE_KEY',
			'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
			'SUPABASE_SERVICE_ROLE_KEY',
			'TRUSTLESS_WORK_API_URL',
			'TRUSTLESS_WORK_API_KEY',
			'NEXT_PUBLIC_GA_MEASUREMENT_ID',
			'RP_ID',
			'RP_NAME',
			'EXPECTED_ORIGIN',
			'CHALLENGE_TTL_SECONDS',
			'SUPABASE_DB_URL',
		] as const,
	},
	'kyc-server': {
		required: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_DB_URL'] as const,
		optional: [
			'RP_ID',
			'RP_NAME',
			'EXPECTED_ORIGIN',
			'REDIS_URL',
			'CHALLENGE_TTL_SECONDS',
			'ALLOWED_ORIGINS',
			'PORT',
		] as const,
	},
} as const
