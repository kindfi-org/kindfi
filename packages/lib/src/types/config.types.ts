import type * as z from 'zod'
import type {
	appRequirements,
	baseEnvSchema,
	transformEnv,
} from '~/packages/lib/src/config'

export type AppName = keyof typeof appRequirements

// Type for the validated environment input (before transformation)
export type ValidatedEnvInput = z.infer<typeof baseEnvSchema>

// Type for the validated environment variables
export type AppEnv = ReturnType<typeof transformEnv>

export interface AppEnvInterface {
	readonly auth: {
		readonly secret: string
		readonly url: string
		readonly token: {
			readonly expiration: number
			readonly update: number
		}
	}
	readonly database: {
		readonly url: string
		readonly anonKey: string
		readonly serviceRoleKey: string
	}
	readonly features: {
		readonly enableEscrowFeature: boolean
	}
	readonly vapid: {
		readonly email: string
		readonly privateKey: string
		readonly publicKey: string
	}
	readonly env: {
		readonly nodeEnv: string
		readonly appEnv: string
	}
	readonly stellar: {
		readonly networkUrl: string
		readonly networkPassphrase: string
		readonly factoryContractId: string
		readonly accountSecp256r1ContractWasm: string
		readonly rpcUrl: string
		readonly horizonUrl: string
	}
	readonly externalApis: {
		readonly trustlessWork: {
			readonly url: string
			readonly apiKey: string
		}
		readonly kyc: {
			readonly baseUrl: string
		}
	}
	readonly analytics: {
		readonly gaId: string
	}
	readonly deployment: {
		readonly vercelUrl: string
		readonly port: number
	}
	readonly kycServer: {
		readonly allowedOrigins: string
	}
	readonly indexer: {
		readonly chainId: string
		readonly endpoint: string
	}
	readonly passkey: {
		readonly redis: {
			readonly url: string
		}
		readonly rpId: string[]
		readonly rpName: string[]
		readonly expectedOrigin: string[]
		readonly challengeTtlSeconds: number
		readonly challengeTtlMs: number
	}
}
