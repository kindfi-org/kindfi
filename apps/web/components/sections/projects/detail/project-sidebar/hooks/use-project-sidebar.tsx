'use client'

import { zodResolver } from '~/lib/form/zod-resolver'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import { useAuth } from '~/hooks/use-auth'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { logger } from '@/lib/logger'
import { buildFormSchema, type FormValues } from '../types'

export function useProjectSidebar(project: ProjectDetail) {
	const [isFollowing, setIsFollowing] = useState(false)
	const { getMultipleBalances, fundEscrow, sendTransaction } = useEscrow()
	const {
		address,
		walletName,
		isConnected,
		connect,
		disconnect,
		ensureTrustlessSigner,
		signTrustlessTransaction,
	} = useTrustlessSigner()
	const { user } = useAuth()

	const [onChainRaised, setOnChainRaised] = useState<number | null>(null)
	const [isFetchingBalance, setIsFetchingBalance] = useState(false)
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => setIsMounted(true), [])

	const { escrowData } = useEscrowData({
		escrowContractAddress: project.escrowContractAddress || '',
		escrowType: project.escrowType,
	})

	const effectiveEscrowType =
		escrowData?.type || project.escrowType || 'multi-release'

	const hasEscrow = Boolean(project.escrowContractAddress)

	const progressPercentage = useMemo(() => {
		const raised = onChainRaised ?? project.raised
		return Math.min(Math.round((raised / project.goal) * 100), 100)
	}, [onChainRaised, project.goal, project.raised])

	const formSchema = useMemo(
		() => buildFormSchema(project.minInvestment),
		[project.minInvestment],
	)

	const initialInvestmentAmount = hasEscrow ? project.minInvestment : ''

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onBlur',
		defaultValues: {
			investmentAmount: initialInvestmentAmount as FormValues['investmentAmount'],
		},
	})

	const handleToggleFollow = async () => {
		try {
                    // Send follow/unfollow request to backend (follow the project creator when available)
                    if (!project.kindlerId) {
                            toast.error('Unable to follow: project creator unknown')
                            return
                    }
                    const action = isFollowing ? 'unfollow' : 'follow'
                    const res = await fetch('/api/profile/follow', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ targetUserId: project.kindlerId, action }),
                    })
                    if (!res.ok) throw new Error('Follow request failed')
			logger.error(error)
			toast.error('Unable to update follow status', {
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const fetchEscrowBalance = useCallback(async () => {
		if (!project.escrowContractAddress) return
		try {
			setIsFetchingBalance(true)
			const balances = await getMultipleBalances(
				{ addresses: [project.escrowContractAddress] },
				effectiveEscrowType,
			)
			const first = balances?.[0]
			if (first) setOnChainRaised(first.balance)
		} catch (error) {
			logger.error('Failed to fetch escrow balance', error)
		} finally {
			setIsFetchingBalance(false)
		}
	}, [getMultipleBalances, project.escrowContractAddress, effectiveEscrowType])

	useEffect(() => {
		fetchEscrowBalance()
	}, [fetchEscrowBalance])

	const onSubmit = async (data: FormValues) => {
		if (!project.escrowContractAddress) {
			toast.error('Escrow is not configured for this project', {
				icon: <CircleAlert className="text-destructive" />,
			})
			return
		}

		try {
			const signer = await ensureTrustlessSigner()
			if (data.investmentAmount > 1_000_000) {
				toast.error('Amount too large', {
					description: 'Please enter an amount less than $1,000,000',
					icon: <CircleAlert className="text-destructive" />,
				})
				return
			}

			const fundResponse = await fundEscrow(
				{
					amount: data.investmentAmount,
					contractId: project.escrowContractAddress,
					signer,
				},
				effectiveEscrowType,
			)

			if (!fundResponse.unsignedTransaction) {
				throw new Error('No unsigned transaction returned')
			}

			const signedXdr = await signTrustlessTransaction(
				fundResponse.unsignedTransaction,
			)

			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			if (user?.id) {
				try {
					const txHash = 'txHash' in sendResult ? sendResult.txHash : undefined
					const response = await fetch('/api/contributions/create', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							projectId: project.id,
							contractId: project.escrowContractAddress,
							amount: data.investmentAmount,
							transactionHash: txHash,
						}),
					})

					if (!response.ok) {
						const errorData = await response.json()
						logger.error('Failed to create contribution:', errorData)
					}
				} catch (error) {
					logger.error('Error creating contribution record:', error)
				}
			}

			toast.success('Thank you for your support!', {
				description: `You've donated ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.investmentAmount)}`,
				icon: <CircleCheck className="text-primary" />,
			})

			fetchEscrowBalance()
		} catch (error) {
			logger.error('Fund escrow error:', error)

			let errorMessage = ''
			let apiErrorMessage = ''

			if (error instanceof Error) {
				errorMessage = error.message
			} else if (typeof error === 'object' && error !== null) {
				if ('response' in error && error.response) {
					const response = error.response as {
						data?: { message?: string; error?: string }
					}
					if (response.data?.message) {
						apiErrorMessage = response.data.message
					} else if (response.data?.error) {
						apiErrorMessage = response.data.error
					}
				}
				errorMessage = String(error)
			} else {
				errorMessage = String(error)
			}

			const combinedMessage = `${errorMessage} ${apiErrorMessage}`.toLowerCase()

			let userFriendlyMessage =
				"We couldn't process your donation. Please try again."

			if (
				combinedMessage.includes('storage, missingvalue') ||
				combinedMessage.includes('missingvalue') ||
				(combinedMessage.includes('balance') &&
					combinedMessage.includes('non-existing'))
			) {
				const tokenAddress = escrowData?.trustline?.address
				if (tokenAddress) {
					userFriendlyMessage = `Your wallet needs to establish a trustline for the token (${tokenAddress.slice(0, 8)}...) before donating. Please ensure your wallet has approved this token contract.`
				} else {
					userFriendlyMessage =
						'Your wallet needs to establish a trustline for the token before donating. Please ensure your wallet has approved the token contract.'
				}
			} else if (
				combinedMessage.includes('insufficient funds') ||
				combinedMessage.includes('sufficient funds')
			) {
				userFriendlyMessage =
					'Insufficient funds. Please ensure your wallet has enough token balance.'
			} else if (combinedMessage.includes('trustline')) {
				userFriendlyMessage =
					'Trustline required. Your wallet needs to establish a trustline for the token before donating.'
			} else if (apiErrorMessage) {
				userFriendlyMessage = apiErrorMessage
			}

			toast.error('Donation failed', {
				description: userFriendlyMessage,
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const handleShare = () => {
		if (navigator.share) {
			navigator
				.share({
					title: project.title,
					text: project.description ?? '',
					url: window.location.href,
				})
				.catch(() => {})
		} else {
			navigator.clipboard.writeText(window.location.href)
			toast('Link copied to clipboard ✅', {
				description: 'You can now share it with others',
			})
		}
	}

	return {
		form,
		hasEscrow,
		progressPercentage,
		onChainRaised,
		isFetchingBalance,
		isMounted,
		isFollowing,
		address,
		walletName,
		isConnected,
		connect,
		disconnect,
		onSubmit,
		handleToggleFollow,
		handleShare,
	}
}
