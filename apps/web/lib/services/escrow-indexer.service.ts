import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { logger } from '@/lib/logger'
import {
	getTrustlessWorkApiBaseUrl,
	getTrustlessWorkApiKey,
	getTrustlessWorkNetwork,
	getTrustlessWorkUpstreamApiBaseUrl,
} from '~/lib/config/trustless-work.config'
import {
	mapMultiReleaseV2EscrowToIndexer,
	mapSingleReleaseV2EscrowToIndexer,
} from '~/lib/utils/escrow/map-trustless-on-chain-escrow'
import type { EscrowApiVersion } from '~/lib/utils/escrow/resolve-escrow-api-version'

const INDEXER_NOT_FOUND_ERROR =
	'Trustless Work has not indexed this contract yet. Paste the deployment transaction hash and try again.'

export type EscrowIndexerFetchResult =
	| { ok: true; escrow: GetEscrowsFromIndexerResponse; apiVersion: EscrowApiVersion }
	| { ok: false; error: string }

const parseIndexerPayload = (payload: unknown): GetEscrowsFromIndexerResponse | null => {
	if (Array.isArray(payload)) {
		if (payload.length === 0) return null
		return payload[0] as GetEscrowsFromIndexerResponse
	}

	if (payload && typeof payload === 'object') {
		return payload as GetEscrowsFromIndexerResponse
	}

	return null
}

const buildIndexerUrl = (baseUrl: string, contractId: string, validateOnChain: boolean): string => {
	const url = new URL(`${baseUrl}/helper/get-escrow-by-contract-ids`)
	url.searchParams.append('contractIds[]', contractId)
	url.searchParams.append('validateOnChain', String(validateOnChain))
	return url.toString()
}

const fetchEscrowFromBaseUrl = async ({
	baseUrl,
	apiKey,
	contractId,
	validateOnChain,
}: {
	baseUrl: string
	apiKey: string
	contractId: string
	validateOnChain: boolean
}): Promise<EscrowIndexerFetchResult> => {
	const res = await fetch(buildIndexerUrl(baseUrl, contractId, validateOnChain), {
		headers: { 'x-api-key': apiKey },
		cache: 'no-store',
	})

	if (!res.ok) {
		const body = await res.text()
		logger.error('Trustless Work indexer API error:', res.status, body)
		return {
			ok: false,
			error:
				res.status === 401
					? 'Trustless Work API rejected the server API key'
					: `Trustless Work indexer request failed (${res.status})`,
		}
	}

	const escrow = parseIndexerPayload(await res.json())
	if (!escrow?.engagementId) {
		return { ok: false, error: INDEXER_NOT_FOUND_ERROR }
	}

	return { ok: true, escrow, apiVersion: 'v1' }
}

const fetchEscrowOnChainFromTrustlessWork = async ({
	apiKey,
	contractId,
}: {
	apiKey: string
	contractId: string
}): Promise<EscrowIndexerFetchResult> => {
	if (getTrustlessWorkNetwork() === 'mainnet') {
		return {
			ok: false,
			error:
				'Trustless Work v2 read routes are not on mainnet yet. Sync the deploy transaction hash to refresh the indexer.',
		}
	}

	const candidates = [
		{
			path: `escrow/single-release/v2/${contractId}`,
			map: mapSingleReleaseV2EscrowToIndexer,
		},
		{
			path: `escrow/multi-release/v2/${contractId}`,
			map: mapMultiReleaseV2EscrowToIndexer,
		},
	] as const

	for (const candidate of candidates) {
		const upstreamBase = getTrustlessWorkUpstreamApiBaseUrl(candidate.path)
		const res = await fetch(`${upstreamBase}/${candidate.path}`, {
			headers: { 'x-api-key': apiKey, Accept: 'application/json' },
			cache: 'no-store',
		})

		if (!res.ok) {
			continue
		}

		const payload = await res.json()
		if (!payload || typeof payload !== 'object' || !('engagementId' in payload)) {
			continue
		}

		try {
			const escrow = candidate.map(payload as never)
			if (escrow.engagementId) {
				return { ok: true, escrow, apiVersion: 'v2' }
			}
		} catch (error) {
			logger.warn('Failed to map on-chain Trustless Work escrow payload:', error)
		}
	}

	return {
		ok: false,
		error:
			'Could not read escrow state from Trustless Work. Confirm the contract ID is a deployed Trustless Work escrow on the active network.',
	}
}

export async function getEscrowByContractIdFromIndexer(
	contractId: string,
	options?: { validateOnChain?: boolean },
): Promise<EscrowIndexerFetchResult> {
	const apiKey = getTrustlessWorkApiKey()
	const baseUrl = getTrustlessWorkApiBaseUrl()
	const validateOnChain = options?.validateOnChain ?? true

	if (!contractId) {
		return { ok: false, error: 'Contract ID is required' }
	}

	if (!apiKey) {
		return { ok: false, error: 'Trustless Work API key is not configured on the server' }
	}

	try {
		const result = await fetchEscrowFromBaseUrl({
			baseUrl,
			apiKey,
			contractId,
			validateOnChain,
		})

		if (result.ok) {
			return result
		}

		if (validateOnChain) {
			const cachedResult = await fetchEscrowFromBaseUrl({
				baseUrl,
				apiKey,
				contractId,
				validateOnChain: false,
			})

			if (cachedResult.ok) {
				return cachedResult
			}
		}

		return await fetchEscrowOnChainFromTrustlessWork({
			apiKey,
			contractId,
		})
	} catch (error) {
		logger.error('Failed to fetch escrow from indexer:', error)
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'Failed to reach Trustless Work',
		}
	}
}

const parseIndexerUpdatePayload = (payload: unknown): GetEscrowsFromIndexerResponse | null => {
	if (!payload || typeof payload !== 'object') {
		return null
	}

	const record = payload as Record<string, unknown>
	const nested = record.escrow ?? record.data ?? payload
	return parseIndexerPayload(nested)
}

export async function ensureEscrowIndexedForContract(
	contractId: string,
	deployTxHash?: string,
): Promise<EscrowIndexerFetchResult> {
	const indexed = await getEscrowByContractIdFromIndexer(contractId, { validateOnChain: false })
	if (indexed.ok) {
		return indexed
	}

	if (!deployTxHash) {
		return {
			ok: false,
			error: INDEXER_NOT_FOUND_ERROR,
		}
	}

	const refreshed = await updateIndexerFromTxHash(deployTxHash)
	if (refreshed.ok) {
		return refreshed
	}

	return await getEscrowByContractIdFromIndexer(contractId, { validateOnChain: false })
}

export async function updateIndexerFromTxHash(txHash: string): Promise<EscrowIndexerFetchResult> {
	const apiKey = getTrustlessWorkApiKey()
	const baseUrl = getTrustlessWorkApiBaseUrl()

	if (!apiKey) {
		return { ok: false, error: 'Trustless Work API key is not configured on the server' }
	}

	const headers = {
		'x-api-key': apiKey,
		'Content-Type': 'application/json',
		Accept: 'application/json',
	}
	const body = JSON.stringify({ txHash })
	const paths = ['/indexer/update-from-txHash', '/indexer/update-from-txhash']

	try {
		let receivedEmptySuccess = false

		for (const path of paths) {
			for (const method of ['POST', 'PUT'] as const) {
				const res = await fetch(`${baseUrl}${path}`, {
					method,
					headers,
					body,
					cache: 'no-store',
				})

				if (!res.ok) {
					continue
				}

				const escrow = parseIndexerUpdatePayload(await res.json())
				if (escrow?.engagementId) {
					return { ok: true, escrow, apiVersion: 'v1' }
				}

				receivedEmptySuccess = true
			}
		}

		if (receivedEmptySuccess) {
			return { ok: false, error: INDEXER_NOT_FOUND_ERROR }
		}

		return {
			ok: false,
			error:
				'Could not refresh the Trustless Work indexer from this transaction hash. Confirm the hash is from the escrow deploy transaction.',
		}
	} catch (error) {
		logger.error('Failed to update Trustless Work indexer from tx hash:', error)
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'Failed to reach Trustless Work',
		}
	}
}
