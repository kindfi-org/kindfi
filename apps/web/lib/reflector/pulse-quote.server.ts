import 'server-only'

import { Asset } from '@stellar/stellar-sdk'
import {
	type ClientStellarNetworkId,
	STELLAR_MAINNET_PASSPHRASE,
	STELLAR_TESTNET_PASSPHRASE,
} from '../config/stellar-network.config'
import {
	getTrustlessWorkStellarRpcUrlForNetwork,
	type TrustlessWorkNetwork,
} from '../config/trustless-work.config'

/**
 * Reflector Pulse DEX feeds, confirmed live on 2026-11-23 from the config that powers
 * https://reflector.network/pulse:
 * - https://orchestrator.reflector.network/config (Pubnet DEX, `dataSource: "pubnet"`)
 * - https://orchestrator-testnet.reflector.network/config (Stellar Testnet DEX, `dataSource: "testnet"`)
 *
 * The testnet `CAVLP5...` feed is the *pubnet* DEX mirrored on testnet and is deliberately
 * not used here: KindFi's testnet XLM/USDC are testnet SACs.
 */
export const PULSE_DEX_FEEDS = {
	mainnet: {
		contractId: 'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M',
		networkPassphrase: STELLAR_MAINNET_PASSPHRASE,
		// USDC issuer confirmed by the live Pubnet DEX feed config above.
		usdcIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
		// Public account from the same live config; used only to simulate reads, never to sign.
		simulationPublicKey: 'GDLMOS3LF2CRRFCWDJ6TX3YIEYBBTZGAF3BSSEXOXFZWYHSCOHT6DRFX',
		trustlessWorkNetwork: 'mainnet',
	},
	testnet: {
		contractId: 'CA2NWEPNC6BD5KELGJDVWWTXUE7ASDKTNQNL6DN3TGBVWFEWSVVGMUAF',
		networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
		// USDC issuer confirmed by the live Stellar Testnet DEX feed config above.
		usdcIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
		// Public account from the same live config; used only to simulate reads, never to sign.
		simulationPublicKey: 'GC6S3CR2RQ4JSBZVOQTQ5EUAYJZAMZZ3JX5OOYFPP7C3ZPTCBYHSMJT6',
		trustlessWorkNetwork: 'development',
	},
} as const satisfies Record<
	ClientStellarNetworkId,
	{
		contractId: string
		networkPassphrase: string
		usdcIssuer: string
		simulationPublicKey: string
		trustlessWorkNetwork: TrustlessWorkNetwork
	}
>

/** Pulse resolution is ~300s; KindFi treats anything older than 15 minutes as stale. */
const STALE_AFTER_SECONDS = BigInt(15) * BigInt(60)
const MAX_SUPPORTED_DECIMALS = 18

export type PulseQuoteNetwork = ClientStellarNetworkId
export type PulseQuoteAsset = 'XLM' | 'USDC'

export type PulseStellarAsset = { tag: 'Stellar'; values: [string] }
export type PulsePriceData = { price: bigint; timestamp: bigint }

/** Minimal read-only surface of `@reflector/contract-client`'s `PulseClient`. */
export type PulseQuoteClient = {
	assets(): Promise<readonly unknown[]>
	base(): Promise<unknown>
	decimals(): Promise<number>
	lastPrice(asset: PulseStellarAsset): Promise<PulsePriceData | undefined>
}

export type PulseClientConfig = {
	network: PulseQuoteNetwork
	asset: PulseQuoteAsset
	rpcUrl: string
	contractId: string
	networkPassphrase: string
	publicKey: string
	xlmSac: string
	usdcSac: string
}

export type PulseQuoteSuccess = {
	price: number
	decimals: number
	timestamp: number
	source: 'reflector-pulse'
	feedContractId: string
}

export type PulseQuoteUnavailable = { status: 'missing' | 'stale' }

export type PulseQuoteResult = PulseQuoteSuccess | PulseQuoteUnavailable

export type ReadPulseQuoteDeps = {
	/** Test seam: supply a fake Pulse client so unit tests never touch the network. */
	clientFactory?: (config: PulseClientConfig) => PulseQuoteClient
	/** Test seam: return the latest ledger close time in seconds. */
	readLedgerTimeSeconds?: (rpcUrl: string) => Promise<bigint>
	/** Override the simulation source account (public key only; no secret is used). */
	publicKey?: string
}

const isStellarKey = (value: unknown, expected: string): boolean => {
	if (typeof value !== 'object' || value === null) return false

	const candidate = value as { tag?: unknown; values?: unknown }
	return (
		candidate.tag === 'Stellar' &&
		Array.isArray(candidate.values) &&
		candidate.values.length === 1 &&
		candidate.values[0] === expected
	)
}

/** Raw JSON-RPC read: `closeTime` is ledger time in seconds, not local wall-clock time. */
const fetchLedgerTimeSeconds = async (rpcUrl: string): Promise<bigint> => {
	const response = await fetch(rpcUrl, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestLedger' }),
	})
	if (!response.ok) throw new Error(`RPC getLatestLedger failed: ${response.status}`)

	const payload = (await response.json()) as { result?: { closeTime?: string | number } }
	const raw = payload.result?.closeTime
	const seconds = typeof raw === 'number' ? raw : Number(raw)
	if (!Number.isSafeInteger(seconds) || seconds <= 0) {
		throw new Error('RPC getLatestLedger returned an invalid closeTime')
	}

	return BigInt(seconds)
}

/** Checked scaling: price is an integer scaled by 10^decimals (live feeds use 14). */
const scalePrice = (rawPrice: bigint, decimals: number): number | null => {
	if (!Number.isSafeInteger(decimals) || decimals < 0 || decimals > MAX_SUPPORTED_DECIMALS) {
		return null
	}
	// A zero/negative scaled value is not a usable USD quote; fail closed instead of returning 0.
	if (rawPrice <= BigInt(0)) return null

	const scale = BigInt(10) ** BigInt(decimals)
	const whole = rawPrice / scale
	if (whole > BigInt(Number.MAX_SAFE_INTEGER)) return null

	const fraction = (rawPrice % scale).toString().padStart(decimals, '0')
	return Number(`${whole}${decimals > 0 ? `.${fraction}` : ''}`)
}

const createPulseClient = async (config: PulseClientConfig): Promise<PulseQuoteClient> => {
	const { PulseClient } = await import('@reflector/contract-client')

	return new PulseClient({
		publicKey: config.publicKey,
		rpcUrl: config.rpcUrl,
		contractId: config.contractId,
		networkPassphrase: config.networkPassphrase,
	})
}

/**
 * Reads the latest XLM or USDC quote from the network's Reflector Pulse DEX feed.
 * Missing, malformed, future-dated, or older-than-15-minutes quotes never produce a number.
 */
export async function readPulseQuote(
	{ network, asset }: { network: PulseQuoteNetwork; asset: PulseQuoteAsset },
	deps: ReadPulseQuoteDeps = {},
): Promise<PulseQuoteResult> {
	const feed = PULSE_DEX_FEEDS[network]
	if (!feed) return { status: 'missing' }

	try {
		const rpcUrl = getTrustlessWorkStellarRpcUrlForNetwork(feed.trustlessWorkNetwork)
		const xlmSac = Asset.native().contractId(feed.networkPassphrase)
		const usdcSac = new Asset('USDC', feed.usdcIssuer).contractId(feed.networkPassphrase)
		const expectedSac = asset === 'XLM' ? xlmSac : usdcSac

		const config: PulseClientConfig = {
			network,
			asset,
			rpcUrl,
			contractId: feed.contractId,
			networkPassphrase: feed.networkPassphrase,
			publicKey: deps.publicKey ?? feed.simulationPublicKey,
			xlmSac,
			usdcSac,
		}

		const client = deps.clientFactory ? deps.clientFactory(config) : await createPulseClient(config)
		const [listedAssets, baseAsset, decimals] = await Promise.all([
			client.assets(),
			client.base(),
			client.decimals(),
		])

		// Exact keys only: XLM is a quoted asset, USDC is this DEX feed's base asset.
		// No fuzzy matching, and no fallback to the pubnet-DEX-on-testnet feed.
		if (!listedAssets.some((candidate) => isStellarKey(candidate, xlmSac))) {
			return { status: 'missing' }
		}
		if (!isStellarKey(baseAsset, usdcSac)) return { status: 'missing' }

		const priceData = await client.lastPrice({ tag: 'Stellar', values: [expectedSac] })
		if (!priceData || priceData.price === undefined || priceData.timestamp === undefined) {
			return { status: 'missing' }
		}

		const ledgerTime = await (deps.readLedgerTimeSeconds ?? fetchLedgerTimeSeconds)(rpcUrl)
		const age = ledgerTime - BigInt(priceData.timestamp)
		if (age < BigInt(0) || age > STALE_AFTER_SECONDS) return { status: 'stale' }

		const price = scalePrice(priceData.price, decimals)
		const timestamp = Number(priceData.timestamp)
		if (price === null || !Number.isSafeInteger(timestamp)) return { status: 'missing' }

		return {
			price,
			decimals,
			timestamp,
			source: 'reflector-pulse',
			feedContractId: feed.contractId,
		}
	} catch {
		// Fail closed: an RPC/asset/decimals error must never become a zero price.
		return { status: 'missing' }
	}
}
