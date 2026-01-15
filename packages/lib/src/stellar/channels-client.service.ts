import type { AppEnvInterface } from '../types'

// Dynamic import for Channels client to handle missing package gracefully
let ChannelsClientImpl: any
let ChannelsClientType: any
let ChannelsFuncAuthRequestType: any
let ChannelsTransactionResponseType: any

try {
	const channelsModule = require('@openzeppelin/relayer-plugin-channels')
	ChannelsClientImpl = channelsModule.ChannelsClient
	ChannelsClientType = channelsModule.ChannelsClient
	ChannelsFuncAuthRequestType = channelsModule.ChannelsFuncAuthRequest
	ChannelsTransactionResponseType = channelsModule.ChannelsTransactionResponse
} catch (error) {
	console.warn(
		'⚠️ @openzeppelin/relayer-plugin-channels not installed. Install it with: bun add "@openzeppelin/relayer-plugin-channels"',
	)
}

export type ChannelsFuncAuthRequest = {
	func: string
	auth: string[]
}

export type ChannelsTransactionResponse = {
	transactionId: string
	hash: string
	status: string
}

/**
 * Service for interacting with OpenZeppelin Channels service
 *
 * Channels is OpenZeppelin's managed infrastructure for submitting Stellar Soroban transactions
 * with automatic parallel processing and fee management.
 *
 * This is separate from Smart Account Kit's relayerUrl configuration.
 * Channels uses API keys for authentication (CHANNELS_API_KEY env var).
 *
 * Get your API key:
 * - Testnet: https://channels.openzeppelin.com/testnet/gen
 * - Mainnet: https://channels.openzeppelin.com/gen
 *
 * @see https://docs.openzeppelin.com/relayer/1.3.x/guides/stellar-channels-guide
 */
export class ChannelsClientService {
	private client: any
	private readonly baseUrl: string
	private readonly apiKey: string

	constructor(config: AppEnvInterface) {
		const isTestnet = config.stellar.networkPassphrase.includes('Test')
		this.baseUrl = isTestnet
			? 'https://channels.openzeppelin.com/testnet'
			: 'https://channels.openzeppelin.com'

		// Get API key from environment variable (server-side only)
		// Note: This should NOT be NEXT_PUBLIC_ as it's sensitive and server-only
		this.apiKey = process.env.CHANNELS_API_KEY || ''

		if (!this.apiKey) {
			console.warn(
				'⚠️ CHANNELS_API_KEY not set. Get your API key from:',
				this.baseUrl + '/gen',
				'\n   Channels service provides fee-sponsored transactions with automatic parallel processing.',
			)
		}

		// Initialize Channels client if package is available
		if (ChannelsClientImpl) {
			this.client = new ChannelsClientImpl({
				baseUrl: this.baseUrl,
				apiKey: this.apiKey,
			})
		} else {
			console.warn(
				'⚠️ Channels client not initialized. Install @openzeppelin/relayer-plugin-channels package.',
			)
		}
	}

	/**
	 * Submit a Soroban transaction using function + auth method
	 * This is the recommended method for standard contract calls
	 */
	async submitSorobanTransaction(
		request: ChannelsFuncAuthRequest,
	): Promise<ChannelsTransactionResponse> {
		if (!this.client) {
			throw new Error(
				'Channels client not initialized. Install @openzeppelin/relayer-plugin-channels and set CHANNELS_API_KEY environment variable.',
			)
		}

		if (!this.apiKey) {
			throw new Error(
				'CHANNELS_API_KEY not set. Get your API key from: ' +
					this.baseUrl +
					'/gen',
			)
		}

		try {
			const response = await this.client.submitSorobanTransaction(request)
			return response
		} catch (error) {
			console.error('❌ Channels transaction submission failed:', error)
			throw error
		}
	}

	/**
	 * Get the base URL for the Channels service
	 */
	getBaseUrl(): string {
		return this.baseUrl
	}
}
