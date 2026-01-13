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
let SmartAccountKit: any
let IndexedDBStorage: any

// Lazy load the package - will be loaded when first needed
const loadSmartAccountKit = async () => {
	if (SmartAccountKit && IndexedDBStorage) {
		return { SmartAccountKit, IndexedDBStorage }
	}

	try {
		const kitModule = await import('smart-account-kit')
		SmartAccountKit = kitModule.SmartAccountKit
		IndexedDBStorage = kitModule.IndexedDBStorage
		return { SmartAccountKit, IndexedDBStorage }
	} catch (error) {
		// Package not installed - this is expected until user installs it
		return null
	}
}

export interface SmartAccountKitConfig {
	rpcUrl: string
	networkPassphrase: string
	accountWasmHash: string
	webauthnVerifierAddress: string
	relayerUrl?: string
	relayerApiKey?: string
	rpId?: string
	rpName?: string
	timeoutInSeconds?: number
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
	private kit: any
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
			relayerUrl:
				config?.relayerUrl ||
				process.env.NEXT_PUBLIC_RELAYER_URL ||
				process.env.RELAYER_URL,
			relayerApiKey:
				config?.relayerApiKey ||
				process.env.NEXT_PUBLIC_RELAYER_API_KEY ||
				process.env.RELAYER_API_KEY,
			rpId: config?.rpId || appConfig.passkey.rpId[0],
			rpName: config?.rpName || appConfig.passkey.rpName[0],
			timeoutInSeconds: config?.timeoutInSeconds || 30,
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
				// Initialize Smart Account Kit
				const kitConfig: any = {
					rpcUrl: this.config.rpcUrl,
					networkPassphrase: this.config.networkPassphrase,
					accountWasmHash: this.config.accountWasmHash,
					webauthnVerifierAddress: this.config.webauthnVerifierAddress,
					timeoutInSeconds: this.config.timeoutInSeconds,
					storage: kitModule.IndexedDBStorage
						? new kitModule.IndexedDBStorage()
						: undefined,
				}

				// Add relayer config if provided
				if (this.config.relayerUrl) {
					kitConfig.relayer = {
						url: this.config.relayerUrl,
						apiKey: this.config.relayerApiKey,
					}
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

				console.log('✅ Smart Account Kit initialized')
			} catch (error) {
				console.error('❌ Failed to initialize Smart Account Kit:', error)
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
			const result = await this.kit.createWallet(appName, userName, {
				autoSubmit: options?.autoSubmit ?? true,
				autoFund: options?.autoFund ?? false,
				nativeTokenContract: options?.nativeTokenContract,
			})

			return {
				contractId: result.contractId,
				credentialId: result.credentialId,
			}
		} catch (error) {
			console.error('❌ Failed to create wallet:', error)
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
