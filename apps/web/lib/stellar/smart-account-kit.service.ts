import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'

/**
 * Smart Account Kit Service
 *
 * Wrapper around OpenZeppelin Smart Account Kit SDK
 * Provides a clean interface for Smart Account operations
 *
 * Note: This requires 'smart-account-kit' package to be installed
 * Install with: bun add smart-account-kit
 */

// Dynamic import to handle missing package gracefully
// Types are dynamically imported and may not exist if package is not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SmartAccountKit: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let IndexedDBStorage: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MemoryStorage: any

// Lazy load the package - will be loaded when first needed
const loadSmartAccountKit = async () => {
	if (SmartAccountKit && IndexedDBStorage) {
		return { SmartAccountKit, IndexedDBStorage, MemoryStorage }
	}

	try {
		const kitModule = await import('smart-account-kit')
		SmartAccountKit = kitModule.SmartAccountKit
		IndexedDBStorage = kitModule.IndexedDBStorage
		MemoryStorage = kitModule.MemoryStorage
		return { SmartAccountKit, IndexedDBStorage, MemoryStorage }
	} catch {
		// Package not installed - this is expected until user installs it
		return null
	}
}

export interface SmartAccountKitConfig {
	rpcUrl: string
	networkPassphrase: string
	accountWasmHash: string
	webauthnVerifierAddress: string
	ed25519VerifierAddress?: string // Optional Ed25519 verifier
	nativeTokenContract?: string // Native XLM SAC contract address
	relayerUrl?: string // For custom relayer proxy (Channels uses CHANNELS_API_KEY separately)
	rpId?: string
	rpName?: string
	timeoutInSeconds?: number
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	storage?: any // StorageAdapter instance from smart-account-kit (dynamically imported)
}

export interface CreateWalletOptions {
	autoSubmit?: boolean
	autoFund?: boolean
	nativeTokenContract?: string
}

export interface CreateWalletResult {
	contractId: string
	credentialId: string
}

/**
 * Smart Account Kit Service
 * Provides methods for managing OpenZeppelin Smart Accounts
 */
export class SmartAccountKitService {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private kit: any // SmartAccountKit instance (dynamically imported)
	private config: SmartAccountKitConfig
	private isInitialized: boolean = false
	private initializationPromise: Promise<void> | null = null

	constructor(config?: Partial<SmartAccountKitConfig>) {
		const appConfig: AppEnvInterface = appEnvConfig('web')

		this.config = {
			rpcUrl: config?.rpcUrl || appConfig.stellar.rpcUrl,
			networkPassphrase:
				config?.networkPassphrase || appConfig.stellar.networkPassphrase,
			accountWasmHash:
				config?.accountWasmHash ||
				process.env.NEXT_PUBLIC_ACCOUNT_WASM_HASH ||
				process.env.ACCOUNT_WASM_HASH ||
				'',
			webauthnVerifierAddress:
				config?.webauthnVerifierAddress ||
				process.env.NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS ||
				process.env.WEBAUTHN_VERIFIER_ADDRESS ||
				'',
			ed25519VerifierAddress:
				config?.ed25519VerifierAddress ||
				process.env.NEXT_PUBLIC_ED25519_VERIFIER_ADDRESS ||
				process.env.ED25519_VERIFIER_ADDRESS,
			nativeTokenContract:
				config?.nativeTokenContract ||
				process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT ||
				process.env.NATIVE_TOKEN_CONTRACT,
			// Note: Channels service uses CHANNELS_API_KEY env var separately
			// relayerUrl is for custom relayer proxies, not Channels
			relayerUrl:
				config?.relayerUrl ||
				process.env.NEXT_PUBLIC_RELAYER_URL ||
				process.env.RELAYER_URL,
			rpId: config?.rpId || appConfig.passkey.rpId[0],
			rpName: config?.rpName || appConfig.passkey.rpName[0],
			timeoutInSeconds: config?.timeoutInSeconds || 30,
			storage: config?.storage, // Allow custom storage adapter
		}
	}

	/**
	 * Lazy initialization - loads the SDK package when first needed
	 */
	private async ensureInitialized(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		if (this.initializationPromise) {
			return this.initializationPromise
		}

		this.initializationPromise = (async () => {
			// Try to load the package
			const kitModule = await loadSmartAccountKit()
			if (!kitModule) {
				console.warn(
					'⚠️ smart-account-kit not installed. Install it with: bun add smart-account-kit',
				)
				return
			}

			if (
				!this.config.accountWasmHash ||
				!this.config.webauthnVerifierAddress
			) {
				console.error(
					'❌ Missing required configuration: accountWasmHash or webauthnVerifierAddress',
				)
				return
			}

			try {
				// Initialize Smart Account Kit according to latest SDK docs
				// Determine storage adapter based on environment
				// IndexedDBStorage is browser-only, use MemoryStorage for server-side
				const isServerSide = typeof window === 'undefined'
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				let storageAdapter: any // StorageAdapter (dynamically imported)
				let storageType = 'none'

				if (this.config.storage) {
					storageAdapter = this.config.storage
					storageType = 'custom'
				} else if (isServerSide) {
					// Server-side: use MemoryStorage (no persistence needed for one-time wallet creation)
					if (kitModule.MemoryStorage) {
						storageAdapter = new kitModule.MemoryStorage()
						storageType = 'MemoryStorage'
						console.log(
							'📦 Using MemoryStorage for server-side Smart Account Kit',
						)
					}
				} else {
					// Client-side: use IndexedDBStorage for persistence
					if (kitModule.IndexedDBStorage) {
						storageAdapter = new kitModule.IndexedDBStorage()
						storageType = 'IndexedDBStorage'
						console.log(
							'📦 Using IndexedDBStorage for client-side Smart Account Kit',
						)
					}
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const kitConfig: any = {
					// SmartAccountKit config (dynamically imported types)
					rpcUrl: this.config.rpcUrl,
					networkPassphrase: this.config.networkPassphrase,
					accountWasmHash: this.config.accountWasmHash,
					webauthnVerifierAddress: this.config.webauthnVerifierAddress,
					timeoutInSeconds: this.config.timeoutInSeconds,
					storage: storageAdapter,
				}

				// Add optional Ed25519 verifier if provided
				if (this.config.ed25519VerifierAddress) {
					kitConfig.ed25519VerifierAddress = this.config.ed25519VerifierAddress
				}

				// Add native token contract if provided (for funding/transfers)
				if (this.config.nativeTokenContract) {
					kitConfig.nativeTokenContract = this.config.nativeTokenContract
				}

				// Add relayer URL if provided (for custom relayer proxies)
				// Note: Channels service is separate and uses CHANNELS_API_KEY
				// Smart Account Kit SDK may integrate with Channels in the future
				if (this.config.relayerUrl) {
					kitConfig.relayerUrl = this.config.relayerUrl
				}

				// Add RP config if provided
				if (this.config.rpId) {
					kitConfig.rpId = this.config.rpId
				}
				if (this.config.rpName) {
					kitConfig.rpName = this.config.rpName
				}

				this.kit = new kitModule.SmartAccountKit(kitConfig)
				this.isInitialized = true

				console.log('✅ Smart Account Kit initialized', {
					rpcUrl: this.config.rpcUrl,
					networkPassphrase:
						this.config.networkPassphrase.substring(0, 20) + '...',
					hasAccountWasmHash: !!this.config.accountWasmHash,
					hasWebAuthnVerifier: !!this.config.webauthnVerifierAddress,
					hasEd25519Verifier: !!this.config.ed25519VerifierAddress,
					hasNativeTokenContract: !!this.config.nativeTokenContract,
					hasRelayerUrl: !!this.config.relayerUrl,
					storageType,
					isServerSide,
				})
			} catch (error) {
				console.error('❌ Failed to initialize Smart Account Kit:', error)
				throw error
			}
		})()

		return this.initializationPromise
	}

	/**
	 * Check if the service is properly initialized
	 * Note: This checks if initialization completed, but doesn't trigger it
	 */
	isReady(): boolean {
		return this.isInitialized && this.kit !== undefined
	}

	/**
	 * Ensure the service is initialized before use
	 */
	private async ensureReady(): Promise<void> {
		await this.ensureInitialized()
		if (!this.isReady()) {
			throw new Error(
				'Smart Account Kit not initialized. Check configuration and install smart-account-kit package.',
			)
		}
	}

	/**
	 * Create a new Smart Account wallet with WebAuthn passkey
	 */
	async createWallet(
		appName: string,
		userName: string,
		options?: CreateWalletOptions,
	): Promise<CreateWalletResult> {
		await this.ensureReady()

		try {
			console.log('📝 Creating wallet with Smart Account Kit:', {
				appName,
				userName,
				autoSubmit: options?.autoSubmit ?? true,
				hasKit: !!this.kit,
			})

			const result = await this.kit.createWallet(appName, userName, {
				autoSubmit: options?.autoSubmit ?? true,
				autoFund: options?.autoFund ?? false,
				nativeTokenContract:
					options?.nativeTokenContract || this.config.nativeTokenContract,
			})

			console.log('✅ Wallet creation result:', {
				contractId: result.contractId,
				credentialId: result.credentialId,
			})

			return {
				contractId: result.contractId,
				credentialId: result.credentialId,
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			const errorStack = error instanceof Error ? error.stack : undefined

			console.error('❌ Failed to create wallet:', {
				error: errorMessage,
				stack: errorStack,
				config: {
					hasAccountWasmHash: !!this.config.accountWasmHash,
					hasWebAuthnVerifier: !!this.config.webauthnVerifierAddress,
					rpcUrl: this.config.rpcUrl,
					networkPassphrase:
						this.config.networkPassphrase.substring(0, 20) + '...',
				},
			})
			throw error
		}
	}

	/**
	 * Connect to an existing wallet
	 */
	async connectWallet(options?: {
		prompt?: boolean
		fresh?: boolean
		credentialId?: string
		contractId?: string
	}): Promise<{ contractId: string; credentialId: string } | null> {
		await this.ensureReady()

		try {
			const result = await this.kit.connectWallet(options)
			if (!result) {
				return null
			}

			return {
				contractId: result.contractId || '',
				credentialId: result.credentialId || '',
			}
		} catch (error) {
			console.error('❌ Failed to connect wallet:', error)
			throw error
		}
	}

	/**
	 * Disconnect from wallet
	 */
	async disconnect(): Promise<void> {
		if (!this.isReady()) {
			return
		}

		try {
			await this.kit.disconnect()
		} catch (error) {
			console.error('❌ Failed to disconnect:', error)
		}
	}

	/**
	 * Sign and submit a transaction
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async signAndSubmit(transaction: any, options?: { skipRelayer?: boolean }) {
		await this.ensureReady()

		try {
			return await this.kit.signAndSubmit(transaction, options)
		} catch (error) {
			console.error('❌ Failed to sign and submit transaction:', error)
			throw error
		}
	}

	/**
	 * Transfer tokens
	 */
	async transfer(
		tokenContract: string,
		recipient: string,
		amount: string,
		options?: { skipRelayer?: boolean },
	) {
		await this.ensureReady()

		try {
			return await this.kit.transfer(tokenContract, recipient, amount, options)
		} catch (error) {
			console.error('❌ Failed to transfer tokens:', error)
			throw error
		}
	}

	/**
	 * Get the underlying kit instance (for advanced usage)
	 */
	async getKit() {
		await this.ensureReady()
		return this.kit
	}
}
