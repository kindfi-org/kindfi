import { describe, expect, mock, test } from 'bun:test'
import { Asset, Networks } from '@stellar/stellar-sdk'
import type {
	PulseClientConfig,
	PulsePriceData,
	PulseQuoteNetwork,
	ReadPulseQuoteDeps,
} from '../lib/reflector/pulse-quote.server'

mock.module('server-only', () => ({}))

const { PULSE_DEX_FEEDS, readPulseQuote } = await import('../lib/reflector/pulse-quote.server')

const LEDGER_TIME = BigInt(1_795_443_162)
const KEYS = {
	mainnet: {
		xlm: Asset.native().contractId(Networks.PUBLIC),
		usdc: new Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN').contractId(
			Networks.PUBLIC,
		),
	},
	testnet: {
		xlm: Asset.native().contractId(Networks.TESTNET),
		usdc: new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5').contractId(
			Networks.TESTNET,
		),
	},
} as const

const stellar = (key: string) => ({ tag: 'Stellar', values: [key] }) as const

type FakeOptions = {
	assets?: unknown[]
	base?: unknown
	decimals?: number
	quote?: PulsePriceData | undefined
	ledgerTime?: bigint
}

const createFakeDeps = (network: PulseQuoteNetwork, options: FakeOptions = {}) => {
	const configs: PulseClientConfig[] = []
	const lastPriceAssets: unknown[] = []

	const deps: ReadPulseQuoteDeps = {
		clientFactory(config) {
			configs.push(config)
			return {
				assets: async () => options.assets ?? [stellar(KEYS[network].xlm)],
				base: async () => options.base ?? stellar(KEYS[network].usdc),
				decimals: async () => options.decimals ?? 14,
				lastPrice: async (asset) => {
					lastPriceAssets.push(asset)
					return options.quote
				},
			}
		},
		readLedgerTimeSeconds: async () => options.ledgerTime ?? LEDGER_TIME,
	}

	return { deps, configs, lastPriceAssets }
}

describe('readPulseQuote (fake Pulse client; no network)', () => {
	test('returns a fresh quote with the exact feed, source and asset key', async () => {
		const { deps, configs, lastPriceAssets } = createFakeDeps('testnet', {
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(60) },
		})

		const result = await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)

		expect(result).toEqual({
			price: 1,
			decimals: 14,
			timestamp: Number(LEDGER_TIME - BigInt(60)),
			source: 'reflector-pulse',
			feedContractId: PULSE_DEX_FEEDS.testnet.contractId,
		})
		expect(lastPriceAssets).toEqual([stellar(KEYS.testnet.xlm)])
		expect(configs[0]?.contractId).toBe(PULSE_DEX_FEEDS.testnet.contractId)
		expect(configs[0]?.networkPassphrase).toBe(Networks.TESTNET)
		expect(configs[0]?.rpcUrl).toBe('https://soroban-testnet.stellar.org')
		expect(configs[0]?.xlmSac).toBe(KEYS.testnet.xlm)
		expect(configs[0]?.usdcSac).toBe(KEYS.testnet.usdc)
	})

	test('scales 14 decimals correctly: 100000000000000 is 1, not 10_000_000', async () => {
		const { deps } = createFakeDeps('mainnet', {
			decimals: 14,
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(30) },
		})

		const result = await readPulseQuote({ network: 'mainnet', asset: 'USDC' }, deps)

		expect(result).not.toHaveProperty('status')
		expect('price' in result && result.price).toBe(1)
		expect('price' in result && result.price).not.toBe(10_000_000)
		expect('feedContractId' in result && result.feedContractId).toBe(
			PULSE_DEX_FEEDS.mainnet.contractId,
		)
	})

	test('uses the mainnet Pubnet DEX feed and mainnet shared network config', async () => {
		const { deps, configs, lastPriceAssets } = createFakeDeps('mainnet', {
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(30) },
		})

		await readPulseQuote({ network: 'mainnet', asset: 'XLM' }, deps)

		expect(configs[0]?.contractId).toBe(PULSE_DEX_FEEDS.mainnet.contractId)
		expect(configs[0]?.networkPassphrase).toBe(Networks.PUBLIC)
		expect(configs[0]?.rpcUrl).toBe('https://mainnet.sorobanrpc.com')
		expect(lastPriceAssets).toEqual([stellar(KEYS.mainnet.xlm)])
	})

	test('reads USDC through the feed base asset key, not an assets() fuzzy match', async () => {
		const { deps, lastPriceAssets } = createFakeDeps('testnet', {
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(30) },
		})

		const result = await readPulseQuote({ network: 'testnet', asset: 'USDC' }, deps)

		expect(lastPriceAssets).toEqual([stellar(KEYS.testnet.usdc)])
		expect(result).not.toHaveProperty('status')
	})

	test('rejects a quote older than 15 minutes', async () => {
		const { deps } = createFakeDeps('testnet', {
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(901) },
		})

		const result = await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)

		expect(result).toEqual({ status: 'stale' })
		expect(result).not.toHaveProperty('price')
	})

	test('accepts a quote exactly 15 minutes old', async () => {
		const { deps } = createFakeDeps('testnet', {
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(900) },
		})

		const result = await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)

		expect(result).not.toHaveProperty('status')
	})

	test('rejects a future-dated quote', async () => {
		const { deps } = createFakeDeps('testnet', {
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME + BigInt(60) },
		})

		expect(await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)).toEqual({
			status: 'stale',
		})
	})

	test('rejects undefined lastPrice without defaulting to zero', async () => {
		const { deps } = createFakeDeps('testnet', { quote: undefined })

		const result = await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)

		expect(result).toEqual({ status: 'missing' })
		expect(result).not.toHaveProperty('price')
	})

	test('rejects a zero price as missing', async () => {
		const { deps } = createFakeDeps('testnet', {
			quote: { price: BigInt(0), timestamp: LEDGER_TIME - BigInt(60) },
		})

		expect(await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)).toEqual({
			status: 'missing',
		})
	})

	test('fails when the expected XLM key is absent from assets()', async () => {
		const { deps, lastPriceAssets } = createFakeDeps('testnet', {
			assets: [stellar(KEYS.testnet.usdc)],
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(60) },
		})

		const result = await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)

		expect(result).toEqual({ status: 'missing' })
		expect(lastPriceAssets).toHaveLength(0)
	})

	test('fails when the expected USDC key is absent from base()', async () => {
		const { deps, lastPriceAssets } = createFakeDeps('testnet', {
			base: stellar('OTHER'),
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(60) },
		})

		const result = await readPulseQuote({ network: 'testnet', asset: 'USDC' }, deps)

		expect(result).toEqual({ status: 'missing' })
		expect(lastPriceAssets).toHaveLength(0)
	})

	test('reads decimals from the feed instead of assuming 7', async () => {
		const { deps } = createFakeDeps('testnet', {
			decimals: 7,
			quote: { price: BigInt(10_000_000), timestamp: LEDGER_TIME - BigInt(60) },
		})

		const result = await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)

		expect('decimals' in result && result.decimals).toBe(7)
		expect('price' in result && result.price).toBe(1)
	})

	test('fails closed on an out-of-range decimals value', async () => {
		const { deps } = createFakeDeps('testnet', {
			decimals: 19,
			quote: { price: BigInt(100_000_000_000_000), timestamp: LEDGER_TIME - BigInt(60) },
		})

		expect(await readPulseQuote({ network: 'testnet', asset: 'XLM' }, deps)).toEqual({
			status: 'missing',
		})
	})
})
