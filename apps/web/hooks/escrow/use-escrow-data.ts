'use client'

import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
} from '@trustless-work/escrow'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'

interface UseEscrowDataParams {
	escrowContractAddress: string
	escrowType?: EscrowType
}

export function useEscrowData({
	escrowContractAddress,
	escrowType,
}: UseEscrowDataParams) {
	const { getEscrowByContractIds } = useEscrow()
	const [escrowData, setEscrowData] =
		useState<GetEscrowsFromIndexerResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchEscrowData = useCallback(async () => {
		if (!escrowContractAddress) return

		try {
			setIsLoading(true)
			setError(null)

			const response = await getEscrowByContractIds({
				contractIds: [escrowContractAddress],
				validateOnChain: false,
			})

			// Log response for debugging
			console.log('Escrow data response:', response)
			console.log('Response is array:', Array.isArray(response))

			// Handle array response (API returns array of escrows)
			let escrowData: GetEscrowsFromIndexerResponse | null = null

			if (Array.isArray(response)) {
				// Take the first escrow from the array
				if (response.length === 0) {
					throw new Error('No escrow found for this contract ID')
				}
				escrowData = response[0] as GetEscrowsFromIndexerResponse
			} else if (response && typeof response === 'object') {
				// Handle single object response (fallback)
				escrowData = response as GetEscrowsFromIndexerResponse
			} else {
				throw new Error('Invalid response format from escrow API')
			}

			// Validate required fields
			if (!escrowData.engagementId) {
				throw new Error('Invalid response: missing engagementId')
			}

			// Convert Firebase timestamp format to Date if needed
			const processedEscrowData = {
				...escrowData,
				createdAt:
					escrowData.createdAt &&
					typeof escrowData.createdAt === 'object' &&
					'_seconds' in escrowData.createdAt
						? (new Date(
								(
									escrowData.createdAt as {
										_seconds: number
										_nanoseconds?: number
									}
								)._seconds * 1000,
							) as unknown as Date)
						: escrowData.createdAt,
				updatedAt:
					escrowData.updatedAt &&
					typeof escrowData.updatedAt === 'object' &&
					'_seconds' in escrowData.updatedAt
						? (new Date(
								(
									escrowData.updatedAt as {
										_seconds: number
										_nanoseconds?: number
									}
								)._seconds * 1000,
							) as unknown as Date)
						: escrowData.updatedAt,
			} as unknown as GetEscrowsFromIndexerResponse

			console.log('Processed escrow data:', processedEscrowData)
			setEscrowData(processedEscrowData)
		} catch (err) {
			console.error('Failed to fetch escrow data:', err)
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to load escrow data'
			setError(errorMessage)
			toast.error(errorMessage)
			setEscrowData(null)
		} finally {
			setIsLoading(false)
		}
	}, [escrowContractAddress, getEscrowByContractIds])

	useEffect(() => {
		fetchEscrowData()
	}, [fetchEscrowData])

	return {
		escrowData,
		isLoading,
		error,
		refetch: fetchEscrowData,
	}
}
