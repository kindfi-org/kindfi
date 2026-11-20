import { describe, expect, mock, test } from 'bun:test'
import type { PulseQuoteClient } from '../lib/stellar/reflector-pulse.server'

mock.module('server-only', () => ({}))
mock.module('@reflector/contract-client', () => ({
	PulseClient: class FakePulseClient {},
}))

const { REFLECTOR_MAX_QUOTE_AGE_SECONDS, REFLECTOR_PULSE_FEEDS, readPulseQuote, scaleOraclePrice } =
	await import('../lib/stellar/reflector-pulse.server')

const NOW_SECONDS = 1_795_194_000

describe('Reflector Pulse client (readPulseQuote)', () => {
	test('uses Mainnet Pubnet DEX for mainnet and Stellar Testnet DEX for testnet', () => {
		expect(REFLECTOR_PULSE_FEEDS.mainnet.contractId).toBe(
			'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M',
		)
		expect(REFLECTOR_PULSE_FEEDS.testnet.contractId).toBe(
			'CA2NWEPNC6BD5KELGJDVWWTXUE7ASDKTNQNL6DN3TGBVWFEWSVVGMUAF',
		)
		// Never point testnet at the pubnet-DEX-on-testnet feed for testnet SAC assets
		expect(REFLECTOR_PULSE_FEEDS.testnet.contractId).not.toBe(
			'CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP',
		)
	})

	test('scales 14-decimal prices with checked math so 100000000000000 becomes 1 and not 10_000_000', () => {
		const scaled = scaleOraclePrice(100_000_000_000_000n, 14)
		expect(scaled).toBe(1)
		expect(scaled).not.toBe(10_000_000)

		expect(scaleOraclePrice(12_782_496_280_771n, 14)).toBeCloseTo(0.12782496280771, 12)
	})

	test('returns a fresh quote for XLM with 14 decimals on mainnet', async () => {
		const fakeClient: PulseQuoteClient = {
			async assets() {
				return [{ tag: 'Stellar', values: [REFLECTOR_PULSE_FEEDS.mainnet.assets.XLM] }]
			},
			async base() {
				return { tag: 'Stellar', values: [REFLECTOR_PULSE_FEEDS.mainnet.assets.USDC] }
			},
			async decimals() {
				return 14
			},
			async lastPrice() {
				return {
					price: 100_000_000_000_000n,
					timestamp: BigInt(NOW_SECONDS - 120),
				}
			},
		}

		const result = await readPulseQuote({
			network: 'mainnet',
			asset: 'XLM',
			client: fakeClient,
			nowSeconds: NOW_SECONDS,
		})

		expect(result).toEqual({
			price: 1,
			decimals: 14,
			timestamp: NOW_SECONDS - 120,
			source: 'reflector-pulse',
			feedContractId: REFLECTOR_PULSE_FEEDS.mainnet.contractId,
		})
	})

	test('returns a fresh quote for USDC when USDC is the feed base asset on testnet', async () => {
		const fakeClient: PulseQuoteClient = {
			async assets() {
				return [{ tag: 'Stellar', values: [REFLECTOR_PULSE_FEEDS.testnet.assets.XLM] }]
			},
			async base() {
				return { tag: 'Stellar', values: [REFLECTOR_PULSE_FEEDS.testnet.assets.USDC] }
			},
			async decimals() {
				return 14
			},
			async lastPrice() {
				return {
					price: 100_000_000_000_000n,
					timestamp: BigInt(NOW_SECONDS - REFLECTOR_MAX_QUOTE_AGE_SECONDS),
				}
			},
		}

		const result = await readPulseQuote({
			network: 'testnet',
			asset: 'USDC',
			client: fakeClient,
			nowSeconds: NOW_SECONDS,
		})

		expect(result).toEqual({
			price: 1,
			decimals: 14,
			timestamp: NOW_SECONDS - REFLECTOR_MAX_QUOTE_AGE_SECONDS,
			source: 'reflector-pulse',
			feedContractId: REFLECTOR_PULSE_FEEDS.testnet.contractId,
		})
	})

	test('rejects stale quotes older than 15 minutes without returning a number', async () => {
		const fakeClient: PulseQuoteClient = {
			async assets() {
				return [{ tag: 'Stellar', values: [REFLECTOR_PULSE_FEEDS.testnet.assets.XLM] }]
			},
			async decimals() {
				return 14
			},
			async lastPrice() {
				return {
					price: 71_535_248_509_132n,
					timestamp: BigInt(NOW_SECONDS - REFLECTOR_MAX_QUOTE_AGE_SECONDS - 1),
				}
			},
		}

		const result = await readPulseQuote({
			network: 'testnet',
			asset: 'XLM',
			client: fakeClient,
			nowSeconds: NOW_SECONDS,
		})

		expect(result).toEqual({ status: 'stale' })
		expect('price' in result).toBe(false)
	})

	test('returns missing when lastPrice returns undefined and never defaults to zero', async () => {
		const fakeClient: PulseQuoteClient = {
			async assets() {
				return [{ tag: 'Stellar', values: [REFLECTOR_PULSE_FEEDS.mainnet.assets.XLM] }]
			},
			async decimals() {
				return 14
			},
			async lastPrice() {
				return undefined
			},
		}

		const result = await readPulseQuote({
			network: 'mainnet',
			asset: 'XLM',
			client: fakeClient,
			nowSeconds: NOW_SECONDS,
		})

		expect(result).toEqual({ status: 'missing' })
		expect('price' in result).toBe(false)
	})

	test('fails explicitly without fuzzy-matching when expected asset key is not listed by the feed', async () => {
		const fakeClient: PulseQuoteClient = {
			async assets() {
				return [{ tag: 'Other', values: ['XLM'] }]
			},
			async base() {
				return { tag: 'Other', values: ['USD'] }
			},
			async decimals() {
				return 14
			},
			async lastPrice() {
				return {
					price: 100_000_000_000_000n,
					timestamp: BigInt(NOW_SECONDS - 60),
				}
			},
		}

		await expect(
			readPulseQuote({
				network: 'testnet',
				asset: 'XLM',
				client: fakeClient,
				nowSeconds: NOW_SECONDS,
			}),
		).rejects.toThrow(/does not list expected XLM asset key/)
	})
})
