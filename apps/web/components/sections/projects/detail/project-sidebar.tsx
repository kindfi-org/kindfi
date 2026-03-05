'use client'

import { zodResolver } from '~/lib/form/zod-resolver'
import { motion, useReducedMotion } from 'framer-motion'
import {
	Building2,
	CircleAlert,
	CircleCheck,
	ExternalLink,
	Heart,
	Loader2,
	Share,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import { useAuth } from '~/hooks/use-auth'
import { progressBarAnimation } from '~/lib/constants/animations'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { cn } from '~/lib/utils'
import { getContrastTextColor } from '~/lib/utils/color-utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

interface ProjectSidebarProps {
	project: ProjectDetail
}

const buildFormSchema = (minInvestment: number) =>
	z.object({
		investmentAmount: z.coerce
			.number({ error: 'Investment amount must be a valid number' })
			.positive('Investment amount must be greater than zero')
			.min(minInvestment, `Minimum investment is $${minInvestment}`),
	})

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>

export function ProjectSidebar({ project }: ProjectSidebarProps) {
	const reducedMotion = useReducedMotion()
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
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => setIsMounted(true), [])

	// Fetch escrow data to get the correct escrow type
	const { escrowData } = useEscrowData({
		escrowContractAddress: project.escrowContractAddress || '',
		escrowType: project.escrowType,
	})

	// Determine the correct escrow type - prefer from API, fallback to project prop, then default
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

	// When !hasEscrow, use empty string so the placeholder "Donations coming soon" is visible
	// (placeholders only show when the input value is empty)
	const initialInvestmentAmount = hasEscrow ? project.minInvestment : ''

	// Set up react-hook-form with zod validation
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: 'onBlur',
		defaultValues: {
			investmentAmount: initialInvestmentAmount as FormValues['investmentAmount'],
		},
	})

	const handleToggleFollow = async () => {
		try {
			// TODO: Send follow/unfollow request to backend
			setIsFollowing(!isFollowing)
		} catch (error) {
			console.error(error)
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
			console.error('Failed to fetch escrow balance', error)
		} finally {
			setIsFetchingBalance(false)
		}
	}, [getMultipleBalances, project.escrowContractAddress, effectiveEscrowType])

	useEffect(() => {
		fetchEscrowBalance()
	}, [fetchEscrowBalance])

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (!project.escrowContractAddress) {
			toast.error('Escrow is not configured for this project', {
				icon: <CircleAlert className="text-destructive" />,
			})
			return
		}

		try {
			// 1) Ensure wallet is connected before creating the unsigned tx
			if (!isConnected) {
				await connect()
			}
			if (!address) throw new Error('Wallet address missing')

			// Validate amount is reasonable (prevent accidental large amounts)
			if (data.investmentAmount > 1_000_000) {
				toast.error('Amount too large', {
					description: 'Please enter an amount less than $1,000,000',
					icon: <CircleAlert className="text-destructive" />,
				})
				return
			}

			// 2) Prepare fund escrow request -> returns unsigned XDR
			// Trustless Work expects amount in dollars (not stroops) - it handles conversion internally
			// Note: The user's wallet must have a trustline/approval for the token before funding
			// The escrow contract will check the user's balance, which requires the trustline to exist
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

			// 3) Sign with wallet kit
			const signedXdr = await signTransaction(fundResponse.unsignedTransaction)

			// 4) Submit signed XDR
			const sendResult = await sendTransaction(signedXdr)
			if (sendResult?.status !== 'SUCCESS') {
				throw new Error('Transaction failed')
			}

			// 5) Create contribution record in database
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
						// Don't throw - donation succeeded on-chain, just log the error
					}
				} catch (error) {
					console.error('Error creating contribution record:', error)
					// Don't throw - donation succeeded on-chain
				}
			}

			toast.success('Thank you for your support!', {
				description: `You've donated ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.investmentAmount)}`,
				icon: <CircleCheck className="text-primary" />,
			})

			// 6) Refresh balance
			fetchEscrowBalance()
		} catch (error) {
			console.error('Fund escrow error:', error)

			// Extract error message from various error formats
			let errorMessage = ''
			let apiErrorMessage = ''

			if (error instanceof Error) {
				errorMessage = error.message
			} else if (typeof error === 'object' && error !== null) {
				// Check for axios error response
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

			// Combine error messages for checking
			const combinedMessage = `${errorMessage} ${apiErrorMessage}`.toLowerCase()

			let userFriendlyMessage =
				"We couldn't process your donation. Please try again."

			// Check for missing trustline/balance errors
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
				// Use API error message if available
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
				.catch((error) => console.log('Error sharing', error))
		} else {
			navigator.clipboard.writeText(window.location.href)
			toast('Link copied to clipboard ✅', {
				description: 'You can now share it with others',
			})
		}
	}

	return (
		<motion.div
			className="overflow-hidden sticky top-16 bg-white rounded-xl shadow-md"
			initial={reducedMotion ? false : { opacity: 0, y: 20 }}
			animate={reducedMotion ? false : { opacity: 1, y: 0 }}
			transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
		>
			<div className="p-6">
				<div className="flex items-center gap-2 mb-2">
					<h2 className="text-xl font-bold">Support This Project</h2>
					{hasEscrow ? (
						<Badge
							variant="secondary"
							className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0"
							aria-label="This project accepts donations"
						>
							Accepting donations
						</Badge>
					) : (
						<Badge
							variant="secondary"
							className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0"
							aria-label="Donations coming soon"
						>
							Donations coming soon
						</Badge>
					)}
				</div>
				<p className="mb-4 text-muted-foreground">
					{hasEscrow
						? 'Your contribution matters. Join the change.'
						: 'This project is still setting up secure escrow. Donations will be available soon.'}
				</p>

				<div
					className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2"
					role="progressbar"
					aria-valuenow={progressPercentage}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={`${progressPercentage}% funded`}
				>
					<motion.div
						className="h-full rounded-full gradient-progress"
						custom={progressPercentage}
						variants={progressBarAnimation}
						initial="initial"
						animate="animate"
					/>
				</div>

				<div className="flex justify-between mb-3 text-sm text-gray-500 tabular-nums">
					<span>
						{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(onChainRaised ?? project.raised)} raised
						{isFetchingBalance ? ' (Updating…)' : ''}
					</span>
					<span>{progressPercentage}%</span>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mb-6">
						<FormField
							control={form.control}
							name="investmentAmount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Donation Amount (USD)</FormLabel>
									<div className="relative">
										<div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
											<span className="text-muted-foreground">$</span>
										</div>
										<FormControl>
											<Input
												type="text"
												inputMode="decimal"
												placeholder={
													hasEscrow
														? `Min. $${project.minInvestment}…`
														: 'Donations coming soon'
												}
												className="pl-6 bg-white border-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
												aria-label="Donation amount in USD"
												autoComplete="off"
												{...field}
												disabled={!hasEscrow}
											/>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="mt-4 w-full text-white gradient-btn"
							size="lg"
							disabled={
								!hasEscrow ||
								!form.formState.isValid ||
								form.formState.isSubmitting
							}
							aria-busy={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
									Supporting…
								</>
							) : (
								'Support Now'
							)}
						</Button>
					</form>
				</Form>

				{hasEscrow && (
					<div className="p-3 my-4 text-sm text-amber-900 bg-amber-50 rounded-md border border-amber-300">
						Donating without logging in means you will miss out on features like
						reputation, contributor NFTs, and future perks. If that&apos;s fine,
						you can still donate anonymously.
					</div>
				)}

				{!hasEscrow && (
					<div className="p-3 my-4 text-sm text-amber-900 bg-amber-50 rounded-md border border-amber-300">
						<p className="font-medium mb-1">Donations not yet available</p>
						<p className="text-amber-800">
							This project is still setting up its secure escrow contract.
							Check back soon to support this cause.
						</p>
					</div>
				)}

				{project.escrowContractAddress && (
					<div className="p-3 my-4 text-sm bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1">
								<p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
									Escrow Contract
								</p>
								<p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
									All funds are secured in an on-chain escrow contract. You can
									audit the contract on Stellar Explorer.
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								asChild
								className="h-auto p-2 flex-shrink-0"
							>
								<Link
									href={getStellarExplorerUrl(project.escrowContractAddress)}
									target="_blank"
									rel="noopener noreferrer"
									title="View escrow contract on Stellar Explorer"
								>
									<ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</Link>
							</Button>
						</div>
					</div>
				)}

				<div className="flex gap-4">
					<Button
						variant="outline"
						className="flex gap-2 justify-center items-center w-full bg-white gradient-border-btn"
						onClick={handleToggleFollow}
						aria-label={isFollowing ? 'Unfollow project' : 'Follow project'}
					>
						<Heart
							className={`h-4 w-4 ${isFollowing ? 'text-red-500 fill-red-500' : ''}`}
							aria-hidden
						/>
						{isFollowing ? 'Following' : 'Follow'}
					</Button>

					<Button
						variant="outline"
						className="flex gap-2 justify-center items-center w-full bg-white gradient-border-btn"
						onClick={handleShare}
						aria-label="Share project"
					>
						<Share className="w-4 h-4" aria-hidden />
						Share
					</Button>
				</div>
				{/* Wallet status & controls - deferred until mount to avoid hydration mismatch */}
				<div className="p-3 mt-4 text-sm bg-white rounded-md border border-gray-200">
					<div className="flex justify-between items-center mb-2">
						<span className="font-medium">Donor details</span>
						{isMounted ? (
							<span className={isConnected ? 'text-green-600' : 'text-red-600'}>
								{isConnected ? 'Connected' : 'Not connected'}
							</span>
						) : (
							<span className="text-muted-foreground">Checking…</span>
						)}
					</div>
					{isMounted ? (
						isConnected ? (
							<div className="text-gray-700 break-all">
								<p className="mb-1">{walletName || 'Wallet'}</p>
								<p className="text-xs">{address}</p>
								<Button
									variant="outline"
									size="sm"
									className="mt-3"
									onClick={disconnect}
								>
									Disconnect wallet
								</Button>
							</div>
						) : (
							<Button variant="outline" size="sm" onClick={connect}>
								Connect wallet
							</Button>
						)
					) : (
						<div className="h-9 rounded border border-gray-200 bg-gray-50 animate-pulse" />
					)}
				</div>
			</div>

			{project.foundation && (
				<div className="p-6 bg-purple-50/50 border-t border-gray-200">
					<h3 className="mb-2 font-medium">Foundation</h3>
					<Link
						href={`/foundations/${project.foundation.slug}`}
						className="flex items-center gap-3 p-3 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
					>
						<div className="p-2 rounded-lg bg-purple-100 shrink-0">
							<Building2
								className="h-5 w-5 text-purple-600"
								aria-hidden="true"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<p className="font-semibold text-purple-900 truncate">
								{project.foundation.name}
							</p>
							<p className="text-xs text-muted-foreground">View foundation</p>
						</div>
						<ExternalLink
							className="h-4 w-4 text-purple-600 shrink-0"
							aria-hidden="true"
						/>
					</Link>
				</div>
			)}

			<div className="p-6 bg-gray-50 border-t border-gray-200">
				<h3 className="mb-2 font-medium">Project Tags</h3>
				<div className="flex flex-wrap gap-2">
					{project.tags.map((tag) => {
						const bg = tag.color || '#ccc' // fallback
						const textColor = getContrastTextColor(bg)

						return (
							<Badge
								key={tag.id}
								className={cn('uppercase', textColor)}
								style={{ backgroundColor: bg }}
							>
								{tag.name}
							</Badge>
						)
					})}
				</div>
			</div>
		</motion.div>
	)
}
