import { appEnvConfig } from '@packages/lib'
import { Horizon, Networks } from '@stellar/stellar-sdk'
import { useCallback, useEffect, useState } from 'react'

const appConfig = appEnvConfig('web')

interface FundingParams {
	escrowContract: string
	escrowId: string
	amount: number
	payerAddress: string
	signer: string
}

export const useEscrowFunding = ({
	escrowContract,
	escrowId,
	amount,
	payerAddress,
	signer,
}: FundingParams) => {
	const [status, setStatus] = useState<
		'idle' | 'pending' | 'success' | 'failed' | 'error'
	>('idle')
	const [transactionHash, setTransactionHash] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const sendPayment = useCallback(async () => {
		try {
			// Call the Next.js API to update the database
			const response = await fetch('/api/escrow/fund', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fundParams: {
						userId: payerAddress,
						escrowContract: escrowContract,
						amount: amount.toString(),
						transactionType: 'DEPOSIT',
					},
					metadata: {
						escrowId,
						payerAddress,
						createdAt: new Date().toISOString(),
					},
				}),
			})

			const data = await response.json()
			if (!response.ok)
				throw new Error(data.error || 'Failed to track funding transaction')
			setTransactionHash(data.txHash)
			setStatus('pending')
		} catch (error) {
			console.error('Failed to send funding transaction:', error)
			setError(
				error instanceof Error ? error.message : 'Unknown error occurred',
			)
			setStatus('error')
		}
	}, [escrowId, escrowContract, amount, payerAddress])

	const checkStatus = useCallback(async () => {
		if (transactionHash) {
			const response = await fetchTransactionStatus(transactionHash)
			if (response.successful) {
				setStatus('success')

				// Call webhook to notify funding success
				await fetch(`/api/escrow/fund/${transactionHash}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						escrowId,
						transactionHash: transactionHash,
						status: 'SUCCESSFUL',
					}),
				})
			} else {
				setStatus('failed')

				// Call webhook to notify funding failure
				await fetch(`/api/escrow/fund/${transactionHash}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						escrowId,
						transactionHash: transactionHash,
						status: 'FAILED',
					}),
				})
			}
		}
	}, [escrowId, transactionHash])

	useEffect(() => {
		const interval = setInterval(() => {
			checkStatus()
		}, 5000)

		return () => clearInterval(interval)
	}, [checkStatus])

	return { sendPayment, status, transactionHash, error }
}

export async function fetchTransactionStatus(hash: string) {
	const server = new Horizon.Server(appConfig.stellar.networkUrl)
	const response = await server.transactions().transaction(hash).call()
	return response
}
