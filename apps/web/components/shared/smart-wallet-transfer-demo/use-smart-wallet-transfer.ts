'use client'

import { useStellarSorobanAccount } from '@packages/lib/hooks'
import { startAuthentication } from '@simplewebauthn/browser'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'

export interface TransferFormData {
	to: string
	amount: string
	asset: 'native' | string
}

export function useSmartWalletTransfer() {
	const { data: session } = useSession()
	const [formData, setFormData] = useState<TransferFormData>({
		to: '',
		amount: '',
		asset: 'native',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [isFunding, setIsFunding] = useState(false)
	const [isApproving, setIsApproving] = useState(false)
	const [balance, setBalance] = useState<string | null>(null)
	const [smartWalletAddress] = useState<string>(
		session?.device?.address || session?.user.device?.address || '',
	)

	const smartWalletActions = useStellarSorobanAccount(
		session?.user as unknown as Session | null,
	)

	const approveAccount = async () => {
		setIsApproving(true)

		try {
			if (!smartWalletAddress) {
				throw new Error('Smart wallet address not found')
			}

			toast.info('Approving account...', {
				description: 'Registering smart wallet in auth-controller',
			})

			const response = await fetch('/api/stellar/account/approve', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					accountAddress: smartWalletAddress,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.details || 'Failed to approve account')
			}

			const result = await response.json()

			toast.success('Account approved successfully!', {
				description: result.data?.message || 'Smart wallet is now active',
				duration: 5000,
			})
		} catch (error) {
			console.error('Error approving account:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to approve account',
			)
		} finally {
			setIsApproving(false)
		}
	}

	const fetchBalance = async () => {
		try {
			setIsLoading(true)
			const response = await fetch(
				`/api/stellar/balances/${smartWalletAddress}`,
			)

			if (!response.ok) {
				throw new Error('Failed to fetch balance')
			}

			const data = await response.json()
			setBalance(data.data.xlm.balance)
			toast.success(`Balance: ${data.data.xlm.balance} XLM`)
		} catch (error) {
			console.error('Error fetching balance:', error)
			toast.error('Failed to fetch balance')
		} finally {
			setIsLoading(false)
		}
	}

	const fundWallet = async (amount = '10') => {
		try {
			setIsFunding(true)

			const response = await fetch('/api/stellar/faucet', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					address: smartWalletAddress,
					amount,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.details || 'Failed to fund wallet')
			}

			const result = await response.json()

			toast.success(`Wallet funded successfully!`, {
				description: `Added ${result.data.amount} XLM to your wallet`,
				duration: 5000,
			})

			await new Promise((resolve) => setTimeout(resolve, 3000))
			await fetchBalance()
		} catch (error) {
			console.error('Error funding wallet:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to fund wallet',
			)
		} finally {
			setIsFunding(false)
		}
	}

	const prepareTransfer = async () => {
		try {
			setIsLoading(true)

			if (!formData.to || !formData.amount) {
				toast.error('Please fill in all fields')
				return
			}

			const amountInStroops = Math.floor(Number(formData.amount) * 10_000_000)

			const response = await fetch('/api/stellar/transfer/prepare', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: smartWalletAddress,
					to: formData.to,
					amount: amountInStroops,
					asset: formData.asset,
					sponsorFees: true,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.details || 'Failed to prepare transfer')
			}

			const { data } = await response.json()

			toast.success('Transaction prepared successfully!')
			console.log('Transaction prepared:', data)

			const authOptionsResponse = await fetch(
				`/api/passkey/generate-auth-options`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier: session?.user?.email,
						origin: window.location.origin,
						userId: session?.user?.id,
					}),
				},
			)

			if (!authOptionsResponse.ok) {
				throw new Error('Failed to generate authentication options')
			}

			const authOptions = await authOptionsResponse.json()

			const authResponse = await startAuthentication({
				optionsJSON: authOptions,
			})

			const verificationResp = await fetch(`/api/passkey/verify-auth`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identifier: session?.user?.email,
					authenticationResponse: authResponse,
					origin: window.location.origin,
					userId: session?.user?.id,
				}),
			})

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
			}

			const verificationJSON = (await verificationResp.json()) as {
				verified: boolean
				error?: string
			}

			if (!verificationJSON?.verified) {
				throw new InAppError(
					ErrorCode.AUTHENTICATOR_NOT_REGISTERED,
					'Authentication verification failed',
				)
			}

			toast.info('Verifying signature...', {
				description: 'Please wait while we process your transaction',
			})

			console.log('📝 WebAuthn response:', {
				id: authResponse.id,
				type: authResponse.type,
				rawId: authResponse.rawId,
				authResponse,
			})

			const submitResponse = await fetch('/api/stellar/transfer/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					transactionData: data,
					userDevice: session?.device || session?.user.device,
					verificationJSON,
					authResponse,
				}),
			})

			if (!submitResponse.ok) {
				const errorData = await submitResponse.json()
				throw new Error(errorData.details || 'Failed to submit transaction')
			}

			const submitResult = await submitResponse.json()

			toast.success('Transfer completed successfully!', {
				description: `Transaction hash: ${submitResult.hash}`,
				duration: 10000,
			})

			setFormData({ to: '', amount: '', asset: 'native' })

			await new Promise((resolve) => setTimeout(resolve, 3000))
			await fetchBalance()
		} catch (error) {
			console.error('Error preparing transfer:', error)

			if (error instanceof Error) {
				if (error.message.includes('NotAllowedError')) {
					toast.error('Authentication cancelled', {
						description:
							'You need to approve the transaction with your passkey',
					})
				} else if (error.message.includes('timeout')) {
					toast.error('Authentication timeout', {
						description: 'Please try again',
					})
				} else {
					toast.error(error.message)
				}
			} else {
				toast.error('Failed to prepare transfer')
			}
		} finally {
			setIsLoading(false)
		}
	}

	return {
		formData,
		setFormData,
		isLoading,
		isFunding,
		isApproving,
		balance,
		smartWalletAddress,
		smartWalletActions,
		approveAccount,
		fundWallet,
		fetchBalance,
		prepareTransfer,
	}
}
