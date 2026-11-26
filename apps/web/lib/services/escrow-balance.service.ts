import type { EscrowType } from '@trustless-work/escrow'
import { logger } from '@/lib/logger'
import {
	getTrustlessWorkApiBaseUrl,
	getTrustlessWorkApiKey,
	getTrustlessWorkNetwork,
	getTrustlessWorkUpstreamApiBaseUrl,
} from '~/lib/config/trustless-work.config'
import { getEscrowByContractIdFromIndexer } from '~/lib/services/escrow-indexer.service'
import {
	buildReadEscrowApiPath,
	type EscrowApiVersion,
} from '~/lib/utils/escrow/resolve-escrow-api-version'

interface EscrowBalanceItem {
	address: string
	balance: number
}

const readBalanceFromV2EscrowPayload = (payload: unknown): number | null => {
	if (!payload || typeof payload !== 'object') return null
	const balance = (payload as { balance?: unknown }).balance
	return typeof balance === 'number' && Number.isFinite(balance) ? balance : null
}

const fetchV2EscrowBalance = async (
	contractAddress: string,
	apiKey: string,
): Promise<number | null> => {
	if (getTrustlessWorkNetwork() === 'mainnet') {
		return null
	}

	const candidates: Array<{ escrowType: EscrowType; apiVersion: EscrowApiVersion }> = [
		{ escrowType: 'multi-release', apiVersion: 'v2' },
		{ escrowType: 'single-release', apiVersion: 'v2' },
	]

	for (const candidate of candidates) {
		const path = buildReadEscrowApiPath(candidate.escrowType, candidate.apiVersion, contractAddress)
		const upstreamBase = getTrustlessWorkUpstreamApiBaseUrl(path)
		try {
			const res = await fetch(`${upstreamBase}/${path}`, {
				headers: { 'x-api-key': apiKey, Accept: 'application/json' },
				cache: 'no-store',
			})

			if (!res.ok) continue

			const balance = readBalanceFromV2EscrowPayload(await res.json())
			if (balance !== null) return balance
		} catch (error) {
			logger.warn('Failed to read v2 escrow balance:', error)
		}
	}

	return null
}

export async function getEscrowBalance(contractAddress: string): Promise<number | null> {
	if (!contractAddress) {
		return null
	}

	const apiKey = getTrustlessWorkApiKey()
	if (!apiKey) {
		return null
	}

	const baseUrl = getTrustlessWorkApiBaseUrl()

	try {
		const url = new URL(`${baseUrl}/helper/get-multiple-escrow-balance`)
		url.searchParams.append('addresses[]', contractAddress)

		const res = await fetch(url.toString(), {
			headers: { 'x-api-key': apiKey },
			cache: 'no-store',
		})

		if (res.ok) {
			const items: EscrowBalanceItem[] = await res.json()
			const indexedBalance = items.find((item) => item.address === contractAddress)?.balance
			if (indexedBalance !== undefined && indexedBalance !== null) {
				return indexedBalance
			}
		} else {
			const body = await res.text()
			logger.error('Trustless Work balance API error:', res.status, body)
		}
	} catch (error) {
		logger.error('Failed to fetch escrow balance from indexer helper:', error)
	}

	const indexerResult = await getEscrowByContractIdFromIndexer(contractAddress, {
		validateOnChain: true,
	})

	if (indexerResult.ok) {
		const indexedBalance = readBalanceFromV2EscrowPayload(indexerResult.escrow)
		if (indexedBalance !== null) return indexedBalance
	}

	return await fetchV2EscrowBalance(contractAddress, apiKey)
}
