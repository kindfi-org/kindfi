import 'server-only'

import { type Asset, type PriceData, PulseClient } from '@reflector/contract-client'
import {
	type ClientStellarNetworkId,
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '~/lib/config/stellar-network.config'
import { TRUSTLESS_WORK_STELLAR_RPC_URLS } from '~/lib/config/trustless-work.config'
import {
	MAINNET_USDC_TRUSTLINE_ADDRESS,
	TESTNET_USDC_TRUSTLINE_ADDRESS,
} from '~/lib/constants/escrow'

export type ReflectorQuotedAsset = 'XLM' | 'USDC'

export type ReflectorPulseFeedConfig = {
	readonly contractId: string
	readonly rpcUrl: string
	readonly networkPassphrase: string
	readonly simulationPublicKey: string
	readonly assets: Record<ReflectorQuotedAsset, string>
}

/**
 * Verified Reflector Pulse DEX feed contract IDs and SAC asset contract keys.
 *
 * Confirmed live on 2026-11-20 against:
 * - Mainnet Pubnet DEX: https://orchestrator.reflector.network/config
 *   and https://reflector.network/oracles/public/CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M
 * - Testnet Stellar Testnet DEX: https://orchestrator-testnet.reflector.network/config
 *   and https://reflector.network/oracles/testnet/CA2NWEPNC6BD5KELGJDVWWTXUE7ASDKTNQNL6DN3TGBVWFEWSVVGMUAF
 */
export const REFLECTOR_PULSE_FEEDS: Record<ClientStellarNetworkId, ReflectorPulseFeedConfig> = {
	mainnet: {
		contractId: 'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M',
		rpcUrl: TRUSTLESS_WORK_STELLAR_RPC_URLS.mainnet,
		networkPassphrase: STELLAR_MAINNET_PASSPHRASE,
		simulationPublicKey: MAINNET_USDC_TRUSTLINE_ADDRESS,
		assets: {
			XLM: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
			USDC: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
		},
	},
	testnet: {
		contractId: 'CA2NWEPNC6BD5KELGJDVWWTXUE7ASDKTNQNL6DN3TGBVWFEWSVVGMUAF',
		rpcUrl: TRUSTLESS_WORK_STELLAR_RPC_URLS.development,
		networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
		simulationPublicKey: TESTNET_USDC_TRUSTLINE_ADDRESS,
		assets: {
			XLM: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
			USDC: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
		},
	},
}

/** Maximum acceptable quote age for display quotes (15 minutes). */
export const REFLECTOR_MAX_QUOTE_AGE_SECONDS = 15 * 60

export type PulseQuoteClient = {
	assets(): Promise<Asset[]>
	base?(): Promise<Asset>
	decimals(): Promise<number>
	lastPrice(asset: Asset): Promise<PriceData | null | undefined>
}

export type PulseQuoteSuccess = {
	readonly price: number
	readonly decimals: number
	readonly timestamp: number
	readonly source: 'reflector-pulse'
	readonly feedContractId: string
}

export type PulseQuoteUnavailable = {
	readonly status: 'missing' | 'stale'
}

export type PulseQuoteResult = PulseQuoteSuccess | PulseQuoteUnavailable

export type ReadPulseQuoteParams = {
	network: ClientStellarNetworkId
	asset: ReflectorQuotedAsset
	/** Optional injected client for unit tests (avoids live network calls). */
	client?: PulseQuoteClient
	/** Reference timestamp in Unix seconds (defaults to current ledger/wall time). */
	nowSeconds?: number
	/** Maximum acceptable quote age in seconds (defaults to 900s = 15 minutes). */
	maxAgeSeconds?: number
	/** Optional override for the Soroban RPC URL. */
	rpcUrl?: string
	/** Optional override for the funded simulation account public key. */
	publicKey?: string
}

/**
 * Scales an integer oracle price by `10^decimals` using checked BigInt arithmetic
 * before converting to a finite JS number.
 */
export function scaleOraclePrice(rawPrice: bigint, decimals: number): number {
	if (!Number.isInteger(decimals) || decimals < 0 || decimals > 30) {
		throw new RangeError(`Invalid Reflector oracle decimals: ${decimals}`)
	}
	if (rawPrice <= 0n) {
		throw new RangeError(`Reflector oracle price must be positive, received: ${rawPrice}`)
	}

	const scale = 10n ** BigInt(decimals)
	const whole = rawPrice / scale
	const remainder = rawPrice % scale

	if (whole > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new RangeError(`Scaled Reflector oracle price exceeds safe integer range: ${whole}`)
	}

	const fractionalStr =
		decimals === 0 ? '' : `.${remainder.toString().padStart(decimals, '0').replace(/0+$/, '')}`
	const numeric = Number(`${whole.toString()}${fractionalStr === '.' ? '' : fractionalStr}`)

	if (!Number.isFinite(numeric) || numeric <= 0) {
		throw new RangeError(`Scaled Reflector oracle price is not a valid positive number: ${numeric}`)
	}

	return numeric
}

function isExactStellarAssetMatch(candidate: Asset | undefined, contractId: string): boolean {
	return (
		candidate !== undefined &&
		candidate.tag === 'Stellar' &&
		Array.isArray(candidate.values) &&
		candidate.values[0] === contractId
	)
}

function createPulseClient(
	feed: ReflectorPulseFeedConfig,
	overrides?: { rpcUrl?: string; publicKey?: string },
): PulseQuoteClient {
	return new PulseClient({
		rpcUrl: overrides?.rpcUrl ?? feed.rpcUrl,
		contractId: feed.contractId,
		publicKey: overrides?.publicKey ?? feed.simulationPublicKey,
		networkPassphrase: feed.networkPassphrase,
	})
}

/**
 * Reads a live USD-denominated quote for XLM or USDC from the network-appropriate
 * Reflector Pulse DEX feed, rejecting unlisted assets, missing prices, and stale quotes.
 */
export async function readPulseQuote(params: ReadPulseQuoteParams): Promise<PulseQuoteResult> {
	const feed = REFLECTOR_PULSE_FEEDS[params.network]
	const expectedAssetId = feed.assets[params.asset]
	const maxAgeSeconds = params.maxAgeSeconds ?? REFLECTOR_MAX_QUOTE_AGE_SECONDS

	const client =
		params.client ??
		createPulseClient(feed, {
			rpcUrl: params.rpcUrl,
			publicKey: params.publicKey,
		})

	const [listedAssets, baseAsset, decimals] = await Promise.all([
		client.assets(),
		client.base ? client.base() : Promise.resolve(undefined),
		client.decimals(),
	])

	const inQuotedAssets = listedAssets.some((entry) =>
		isExactStellarAssetMatch(entry, expectedAssetId),
	)
	const matchesBaseAsset = isExactStellarAssetMatch(baseAsset, expectedAssetId)

	if (!inQuotedAssets && !matchesBaseAsset) {
		throw new Error(
			`Reflector Pulse feed ${feed.contractId} (${params.network}) does not list expected ${params.asset} asset key ${expectedAssetId}.`,
		)
	}

	const stellarAsset: Asset = { tag: 'Stellar', values: [expectedAssetId] }
	const priceData = await client.lastPrice(stellarAsset)

	if (!priceData) {
		return { status: 'missing' }
	}

	const quoteTimestampSeconds = Number(priceData.timestamp)
	const referenceSeconds = params.nowSeconds ?? Math.floor(Date.now() / 1000)

	if (
		!Number.isFinite(quoteTimestampSeconds) ||
		quoteTimestampSeconds <= 0 ||
		referenceSeconds - quoteTimestampSeconds > maxAgeSeconds
	) {
		return { status: 'stale' }
	}

	const scaledPrice = scaleOraclePrice(priceData.price, decimals)

	return {
		price: scaledPrice,
		decimals,
		timestamp: quoteTimestampSeconds,
		source: 'reflector-pulse',
		feedContractId: feed.contractId,
	}
}
