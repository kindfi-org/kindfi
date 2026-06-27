'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { useAuth } from '~/hooks/use-auth'
import { zodResolver } from '~/lib/form/zod-resolver'
import { getProjectPageUrl } from '~/lib/seo/project-metadata'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { resolveEscrowType } from '~/lib/utils/escrow/resolve-escrow-type'
import { buildFormSchema, type FormValues } from '../types'

export function useProjectSidebar(project: ProjectDetail, projectSlug: string) {
	const [isFollowing, setIsFollowing] = useState(false)
	const { getMultipleBalances, fundEscrow, sendTransaction, getEscrowByContractIds } = useEscrow()
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

	const { escrowData, isLoading: isEscrowDataLoading } = useEscrowData({
		escrowContractAddress: project.escrowContractAddress || '',
		escrowType: project.escrowType,
	})

	const hasEscrow = Boolean(project.escrowContractAddress)

	const effectiveEscrowType = resolveEscrowType({
		indexerEscrow: escrowData,
		projectEscrowType: project.escrowType,
	})

	const isDonationReady = Boolean(hasEscrow && effectiveEscrowType && !isEscrowDataLoading)

	const effectiveRaised = onChainRaised ?? project.raised

	const progressPercentage = useMemo(() => {
		return Math.min(Math.round((effectiveRaised / project.goal) * 100), 100)
	}, [effectiveRaised, project.goal])

	const isGoalReached = useMemo(
		() => hasEscrow && project.goal > 0 && effectiveRaised >= project.goal,
		[hasEscrow, project.goal, effectiveRaised],
	)

	const formSchema = useMemo(() => buildFormSchema(project.minInvestment), [project.minInvestment])

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onBlur',
		defaultValues: {
			investmentAmount: hasEscrow && project.minInvestment > 0 ? project.minInvestment : 0,
		},
	})

	useEffect(() => {
		if (!user?.id || !project.kindlerId) {
			setIsFollowing(false)
			return
		}

		let cancelled = false

		const loadFollowStatus = async () => {
			try {
				const res = await fetch(
					`/api/profile/follow?targetUserId=${encodeURIComponent(project.kindlerId as string)}`,
				)
				if (!res.ok) return

				const data = (await res.json()) as { isFollowing?: boolean }
				if (!cancelled) {
					setIsFollowing(Boolean(data.isFollowing))
				}
			} catch (error) {
				logger.error('Failed to load follow status', error)
			}
		}

		void loadFollowStatus()

		return () => {
			cancelled = true
		}
	}, [user?.id, project.kindlerId])

	const handleToggleFollow = async () => {
		try {
			if (!user?.id) {
				toast.error('Sign in to follow this project', {
					icon: <CircleAlert className="text-destructive" />,
				})
				return
			}

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

			if (!res.ok) {
				const payload = (await res.json().catch(() => null)) as { error?: string } | null
				throw new Error(payload?.error || 'Follow request failed')
			}

			const payload = (await res.json()) as { isFollowing?: boolean }
			setIsFollowing(typeof payload.isFollowing === 'boolean' ? payload.isFollowing : !isFollowing)
		} catch (error) {
			logger.error(error)
			toast.error(error instanceof Error ? error.message : 'Unable to update follow status', {
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const fetchEscrowBalance = useCallback(async () => {
		if (!project.escrowContractAddress || !effectiveEscrowType) return
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

	const resolveEscrowTypeForFunding = useCallback(async (): Promise<EscrowType> => {
		const knownType = resolveEscrowType({
			indexerEscrow: escrowData,
			projectEscrowType: project.escrowType,
		})
		if (knownType) return knownType

		if (!project.escrowContractAddress) {
			throw new Error('Escrow is not configured for this project')
		}

		const response = await getEscrowByContractIds({
			contractIds: [project.escrowContractAddress],
			validateOnChain: false,
		})
		const indexerEscrow = Array.isArray(response) ? response[0] : response
		if (indexerEscrow?.type) return indexerEscrow.type

		throw new Error('Unable to determine escrow configuration')
	}, [escrowData, getEscrowByContractIds, project.escrowContractAddress, project.escrowType])

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

		if (isGoalReached) {
			toast.error('Funding goal reached', {
				description:
					'This project has met its fundraising goal and is no longer accepting donations.',
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

			const escrowType = await resolveEscrowTypeForFunding()

			if (escrowType === 'multi-release') {
				toast.error('Donations unavailable for this escrow', {
					description:
						'This project uses a multi-release escrow, which cannot accept partial donations. The project owner should recreate the escrow as single-release for crowdfunding.',
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
				escrowType,
			)

			if (!fundResponse.unsignedTransaction) {
				throw new Error('No unsigned transaction returned')
			}

			const signedXdr = await signTrustlessTransaction(fundResponse.unsignedTransaction)

			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			const txHash =
				sendResult && 'txHash' in sendResult && typeof sendResult.txHash === 'string'
					? sendResult.txHash
					: undefined
			const formattedAmount = new Intl.NumberFormat(undefined, {
				style: 'currency',
				currency: 'USD',
				maximumFractionDigits: 0,
			}).format(data.investmentAmount)

			let contributionSynced = !user?.id

			if (user?.id) {
				try {
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

					if (response.ok) {
						contributionSynced = true
					} else {
						const errorData = await response.json().catch(() => null)
						logger.error('Failed to create contribution:', errorData)
					}
				} catch (error) {
					logger.error('Error creating contribution record:', error)
				}
			}

			if (contributionSynced) {
				toast.success('Thank you for your support!', {
					description: `You've donated ${formattedAmount}`,
					icon: <CircleCheck className="text-primary" />,
				})
			} else {
				const txHint = txHash ? `Transaction: ${txHash.slice(0, 8)}…${txHash.slice(-8)}. ` : ''
				toast.warning('Payment sent — sync pending', {
					description: `${txHint}Your on-chain donation succeeded, but project totals may not update yet. Refresh this page in a few minutes or contact support with your transaction hash if it is still missing.`,
					duration: 15_000,
				})
			}

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

			let userFriendlyMessage = "We couldn't process your donation. Please try again."

			if (
				combinedMessage.includes('storage, missingvalue') ||
				combinedMessage.includes('missingvalue') ||
				(combinedMessage.includes('balance') && combinedMessage.includes('non-existing'))
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
			} else if (combinedMessage.includes("reading 'approved'")) {
				userFriendlyMessage =
					'Escrow configuration mismatch. This project may be using the wrong escrow type for donations. Please contact the project owner or try again after refreshing the page.'
			} else if (apiErrorMessage) {
				userFriendlyMessage = apiErrorMessage
			}

			toast.error('Donation failed', {
				description: userFriendlyMessage,
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const shareUrl = useMemo(
		() => getProjectPageUrl(project.slug, projectSlug),
		[project.slug, projectSlug],
	)

	return {
		form,
		hasEscrow,
		isGoalReached,
		isDonationReady,
		isEscrowDataLoading,
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
		shareUrl,
	}
}
