'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import { useAuth } from '~/hooks/use-auth'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { parseDonationError } from './parse-donation-error'

export function useProjectSidebar(project: ProjectDetail) {
	const [isFollowing, setIsFollowing] = useState(false)
	const { getMultipleBalances, fundEscrow, sendTransaction } = useEscrow()
	const {
		address,
		walletName,
		isConnected,
		connect,
		disconnect,
		signTransaction,
	} = useWallet()
	const { user } = useAuth()

	const [onChainRaised, setOnChainRaised] = useState<number | null>(null)
	const [isFetchingBalance, setIsFetchingBalance] = useState(false)

	const { escrowData } = useEscrowData({
		escrowContractAddress: project.escrowContractAddress || '',
		escrowType: project.escrowType,
	})

	const effectiveEscrowType =
		escrowData?.type || project.escrowType || 'multi-release'

	const progressPercentage = useMemo(() => {
		const raised = onChainRaised ?? project.raised
		return Math.min(Math.round((raised / project.goal) * 100), 100)
	}, [onChainRaised, project.goal, project.raised])

	const formSchema = z.object({
		investmentAmount: z
			.number({
				required_error: 'Investment amount is required',
				invalid_type_error: 'Investment amount must be a number',
			})
			.min(
				project.minInvestment,
				`Minimum investment is $${project.minInvestment}`,
			),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {
			investmentAmount: project.minInvestment,
		},
	})

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
			console.error('Failed to fetch escrow balance', error)
		} finally {
			setIsFetchingBalance(false)
		}
	}, [getMultipleBalances, project.escrowContractAddress, effectiveEscrowType])

	useEffect(() => {
		fetchEscrowBalance()
	}, [fetchEscrowBalance])

	const handleToggleFollow = async () => {
		try {
			setIsFollowing(!isFollowing)
		} catch (error) {
			console.error(error)
			toast.error('Unable to update follow status', {
				icon: <CircleAlert className="text-destructive" />,
			})
		}
	}

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (!project.escrowContractAddress) {
			toast.error('Escrow is not configured for this project', {
				icon: <CircleAlert className="text-destructive" />,
			})
			return
		}

		try {
			if (!isConnected) {
				await connect()
			}
			if (!address) throw new Error('Wallet address missing')

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
					signer: address,
				},
				effectiveEscrowType,
			)

			if (!fundResponse.unsignedTransaction) {
				throw new Error('No unsigned transaction returned')
			}

			const signedXdr = await signTransaction(fundResponse.unsignedTransaction)
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
						console.error('Failed to create contribution:', errorData)
					}
				} catch (error) {
					console.error('Error creating contribution record:', error)
				}
			}

			toast.success('Thank you for your support!', {
				description: `You've donated $${data.investmentAmount.toLocaleString()}`,
				icon: <CircleCheck className="text-primary" />,
			})

			fetchEscrowBalance()
		} catch (error) {
			console.error('Fund escrow error:', error)
			const userFriendlyMessage = parseDonationError(
				error,
				escrowData?.trustline?.address,
			)
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
				.catch((error) => console.log('Error sharing', error))
		} else {
			navigator.clipboard.writeText(window.location.href)
			toast('Link copied to clipboard ✅', {
				description: 'You can now share it with others',
			})
		}
	}

	return {
		form,
		onSubmit,
		progressPercentage,
		onChainRaised,
		isFetchingBalance,
		isFollowing,
		handleToggleFollow,
		handleShare,
		address,
		walletName,
		isConnected,
		connect,
		disconnect,
		project,
	}
}
