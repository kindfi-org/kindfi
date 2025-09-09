import type * as z from 'zod'
import type { appRequirements, baseEnvSchema, transformEnv } from '../config'

export type AppName = keyof typeof appRequirements

/** Type for the validated environment input (before transformation) */
export type ValidatedEnvInput = z.infer<typeof baseEnvSchema>

/** Type for the validated environment variables */
export type AppEnv = ReturnType<typeof transformEnv>

export interface AppEnvInterface {
	/** Authentication configuration including secrets and token settings */
	auth: {
		secret: string
		url: string
		token: {
			expiration: number
			update: number
		}
	}
	/** Database connection and authentication settings */
	database: {
		url: string
		connectionString: string
		anonKey: string
		serviceRoleKey: string
		port: string
	}
	features: {
		enableEscrowFeature: boolean
	}
	vapid: {
		email: string
		privateKey: string
		publicKey: string
	}
	resend: {
		apiKey: string
	}
	env: {
		nodeEnv: string
		appEnv: string
	}
	/** Stellar blockchain network configuration */
	stellar: {
		networkUrl: string
		networkPassphrase: string
		factoryContractId: string
		accountSecp256r1ContractWasm: string
		rpcUrl: string
		horizonUrl: string
	}
	externalApis: {
		trustlessWork: {
			url: string
			apiKey: string
		}
		kyc: {
			baseUrl: string
		}
	}
	analytics: {
		gaId: string
	}
	deployment: {
		appUrl: string
		vercelUrl: string
		port: number
	}
	kycServer: {
		allowedOrigins: string
	}
	indexer: {
		chainId: string
		endpoint: string
	}
	/** Passkey authentication configuration */
	passkey: {
		redis: {
			url: string
		}
		rpId: string[]
		rpName: string[]
		expectedOrigin: string[]
		challengeTtlSeconds: number
		challengeTtlMs: number
	}
}
