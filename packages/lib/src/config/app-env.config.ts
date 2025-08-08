import { z } from 'zod'
import type { AppEnvInterface, AppName, ValidatedEnvInput } from '../types'

// Transform function with explicit type annotation
export function transformEnv(): AppEnvInterface {
	const data = process.env as ValidatedEnvInput
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
			port: data.SUPABASE_PORT || '54321',
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
				baseUrl: data.NEXT_PUBLIC_KYC_API_BASE_URL || 'http://localhost:3001',
			},
		},
		analytics: {
			gaId: data.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
		},
		deployment: {
			vercelUrl: data.VERCEL_URL || '',
			appUrl:
				data.NEXT_PUBLIC_APP_URL || data.APP_URL || 'http://localhost:3000',
			port: Number(data.PORT) || 3000,
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

// Create app-specific schema that validates the transformed config
function createAppConfigSchema<T extends keyof typeof appRequirements>(
	appName: T,
) {
	const requirements = appRequirements[appName]

	const baseSchema = z.object({
		auth: z.object({
			secret: z.string(),
			url: z.string(),
			token: z.object({
				expiration: z.number(),
				update: z.number(),
			}),
		}),
		database: z.object({
			url: z.string(),
			anonKey: z.string(),
			serviceRoleKey: z.string(),
			connectionString: z.string(),
			port: z.string(),
		}),
		features: z.object({
			enableEscrowFeature: z.boolean(),
		}),
		vapid: z.object({
			email: z.string(),
			privateKey: z.string(),
			publicKey: z.string(),
		}),
		env: z.object({
			nodeEnv: z.enum(['development', 'production', 'test']),
			appEnv: z.enum(['development', 'production', 'test']),
		}),
		stellar: z.object({
			networkUrl: z.string(),
			networkPassphrase: z.string(),
			factoryContractId: z.string(),
			accountSecp256r1ContractWasm: z.string(),
			rpcUrl: z.string(),
			horizonUrl: z.string(),
		}),
		externalApis: z.object({
			trustlessWork: z.object({
				url: z.string(),
				apiKey: z.string(),
			}),
			kyc: z.object({
				baseUrl: z.string(),
			}),
		}),
		analytics: z.object({
			gaId: z.string(),
		}),
		deployment: z.object({
			vercelUrl: z.string(),
			appUrl: z.string(),
			port: z.number(),
		}),
		kycServer: z.object({
			allowedOrigins: z.string(),
		}),
		indexer: z.object({
			chainId: z.string(),
			endpoint: z.string(),
		}),
		passkey: z.object({
			redis: z.object({
				url: z.string(),
			}),
			rpId: z.array(z.string()),
			rpName: z.array(z.string()),
			expectedOrigin: z.array(z.string()),
			challengeTtlSeconds: z.number(),
			challengeTtlMs: z.number(),
		}),
	})

	// Create validation rules based on app requirements
	const validationRules = createValidationRules(requirements)

	return baseSchema.superRefine((config, ctx) => {
		validateRequiredFields(config, validationRules, ctx)
	})
}

// Helper to create validation rules based on app requirements
function createValidationRules<T extends keyof typeof appRequirements>(
	requirements: (typeof appRequirements)[T],
) {
	const rules: Record<string, { path: string[]; isRequired: boolean }> = {}

	// Map environment variables to config paths
	const envToConfigMap: Record<string, string[]> = {
		NEXT_PUBLIC_SUPABASE_URL: ['database', 'url'],
		SUPABASE_URL: ['database', 'url'],
		NEXT_PUBLIC_SUPABASE_ANON_KEY: ['database', 'anonKey'],
		SUPABASE_ANON_KEY: ['database', 'anonKey'],
		SUPABASE_SERVICE_ROLE_KEY: ['database', 'serviceRoleKey'],
		SUPABASE_DB_URL: ['database', 'connectionString'],
		NEXT_PUBLIC_KYC_API_BASE_URL: ['externalApis', 'kyc', 'baseUrl'],
		NEXT_PUBLIC_APP_URL: ['deployment', 'appUrl'],
		APP_URL: ['deployment', 'appUrl'],
		NEXTAUTH_SECRET: ['auth', 'secret'],
		ALLOWED_ORIGINS: ['kycServer', 'allowedOrigins'],
		PORT: ['deployment', 'port'],
	}

	// Mark required fields
	for (const envVar of requirements.required) {
		const configPath = envToConfigMap[envVar]
		if (configPath) {
			rules[envVar] = { path: configPath, isRequired: true }
		}
	}

	return rules
}

// Validate required fields in the transformed config
function validateRequiredFields(
	config: AppEnvInterface,
	rules: Record<string, { path: string[]; isRequired: boolean }>,
	ctx: z.RefinementCtx,
) {
	for (const [envVar, rule] of Object.entries(rules)) {
		if (rule.isRequired) {
			const value = getNestedValue(config, rule.path)
			if (!value || value === '') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: rule.path,
					message: `Required environment variable ${envVar} is missing or empty`,
				})
			}
		}
	}
}

// Helper to get nested value from object
function getNestedValue<T = unknown>(
	obj: AppEnvInterface,
	path: string[],
): T | undefined {
	return path.reduce((current: unknown, key: string) => {
		if (current && typeof current === 'object' && key in current) {
			return (current as Record<string, unknown>)[key]
		}
		return undefined
	}, obj) as T | undefined
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

// Generic appEnvConfig function that validates transformed config
export function appEnvConfig<T extends keyof typeof appRequirements>(
	appName?: T,
): AppEnvInterface {
	try {
		const _app = appName || detectApp()
		// Transform the environment first
		const transformedConfig = transformEnv()

		// Validate the transformed config if app name is provided
		if (appName) {
			const schema = createAppConfigSchema(appName)
			const result = schema.safeParse(transformedConfig)

			if (!result.success) {
				console.error('❌ Config validation failed:', {
					errorCount: result.error.errors.length,
					errors: result.error.errors.map((err) => ({
						path: err.path.join('.'),
						message: err.message,
						code: err.code,
					})),
				})

				const missingVars = result.error.errors
					.map((err) => `  • ${err.path.join('.')}: ${err.message}`)
					.join('\n')
				throw new Error(
					`❌ Environment validation failed for ${String(appName)}:\n${missingVars}\n\nPlease check your .env file and ensure all required variables are set.`,
				)
			}
			// console.log(
			// 	`✅ Environment variables for ${String(appName)} validated successfully.`,
			// )
		}

		return transformedConfig
	} catch (error) {
		console.error('💥 Error in getEnv function:', {
			errorType: error?.constructor?.name,
			message: error instanceof Error ? error.message : 'Unknown error',
			appName,
		})
		throw error
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
	SUPABASE_PORT: z.string().optional(),
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
	NEXT_PUBLIC_APP_URL: z.string().optional(),
	APP_URL: z.string().optional(),
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
			'NEXT_PUBLIC_KYC_API_BASE_URL',
			'NEXT_PUBLIC_APP_URL',
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
			'REDIS_URL',
			'SUPABASE_DB_URL',
		] as const,
	},
	'kyc-server': {
		required: [
			'SUPABASE_URL',
			'SUPABASE_ANON_KEY',
			'SUPABASE_DB_URL',
			'APP_URL',
		] as const,
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
