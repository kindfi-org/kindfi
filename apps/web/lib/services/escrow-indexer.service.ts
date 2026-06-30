import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { logger } from '@/lib/logger'
import { getTrustlessWorkApiConfig } from '~/lib/services/trustless-work-api.config'

export type EscrowIndexerFetchResult =
	| { ok: true; escrow: GetEscrowsFromIndexerResponse }
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
		return { ok: false, error: 'Escrow not found for this contract ID' }
	}

	return { ok: true, escrow }
}

export async function getEscrowByContractIdFromIndexer(
	contractId: string,
	options?: { validateOnChain?: boolean },
): Promise<EscrowIndexerFetchResult> {
	const { apiKey, baseUrl } = getTrustlessWorkApiConfig()
	const validateOnChain = options?.validateOnChain ?? true

	if (!contractId) {
		return { ok: false, error: 'Contract ID is required' }
	}

	if (!apiKey) {
		return { ok: false, error: 'Trustless Work API key is not configured on the server' }
	}

	try {
		return await fetchEscrowFromBaseUrl({
			baseUrl,
			apiKey,
			contractId,
			validateOnChain,
		})
	} catch (error) {
		logger.error('Failed to fetch escrow from indexer:', error)
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'Failed to reach Trustless Work',
		}
	}
}
