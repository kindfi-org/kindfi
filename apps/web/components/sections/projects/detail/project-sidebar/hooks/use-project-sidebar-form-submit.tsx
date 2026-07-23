'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { useAuth } from '~/hooks/use-auth'
import { zodResolver } from '~/lib/form/zod-resolver'
import { trackOnboardingPath } from '~/lib/pollar/analytics'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { submitTrustlessEscrowXdr } from '~/lib/utils/escrow/trustless-submit'
import { buildFormSchema, type FormValues } from '../types'

interface UseProjectSidebarFormSubmitParams {
	project: ProjectDetail
	isGoalReached: boolean
	escrowData: { trustline?: { address?: string } } | null | undefined
	fetchEscrowBalance: () => Promise<void>
	resolveEscrowTypeForFunding: () => Promise<EscrowType>
}

export function useProjectSidebarFormSubmit({
	project,
	isGoalReached,
	escrowData,
	fetchEscrowBalance,
	resolveEscrowTypeForFunding,
}: UseProjectSidebarFormSubmitParams) {
	const { fundEscrow, sendTransaction } = useEscrow()
	const { ensureTrustlessSigner, signAndSubmitTrustlessTransaction, isPollarSigner } =
		useTrustlessSigner()
	const { user } = useAuth()

	const hasEscrow = Boolean(project.escrowContractAddress)

	const formSchema = useMemo(() => buildFormSchema(project.minInvestment), [project.minInvestment])

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onBlur',
		defaultValues: {
			investmentAmount: hasEscrow && project.minInvestment > 0 ? project.minInvestment : 0,
		},
	})

	const onSubmit = async (data: FormValues) => {
		if (!user?.id) {
			toast.error('Sign in to donate', {
				description: 'Create an account or sign in to support this project.',
				icon: <CircleAlert className="text-destructive" />,
			})
			return
		}

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

			const sendResult = await submitTrustlessEscrowXdr(
				fundResponse.unsignedTransaction,
				signAndSubmitTrustlessTransaction,
				sendTransaction,
			)

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
							walletAddress: signer ?? undefined,
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
				trackOnboardingPath(isPollarSigner ? 'pollar' : 'legacy_passkey', 'donation_completed')
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
			} else if (
				(combinedMessage.includes('main net') && combinedMessage.includes('test net')) ||
				combinedMessage.includes('network mismatch')
			) {
				userFriendlyMessage =
					'Your wallet and KindFi are on different Stellar networks. In Freighter, open Settings → Network, select Main Net, disconnect and reconnect your wallet here, then try again.'
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

	return { form, onSubmit }
}
