'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Heart, Share } from 'lucide-react'
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
import { progressBarAnimation } from '~/lib/constants/animations'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import type { EscrowType } from '@trustless-work/escrow'
import { cn } from '~/lib/utils'
import { getContrastTextColor } from '~/lib/utils/color-utils'

interface ProjectSidebarProps {
	project: ProjectDetail
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
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

	const [onChainRaised, setOnChainRaised] = useState<number | null>(null)
	const [isFetchingBalance, setIsFetchingBalance] = useState(false)

	const progressPercentage = useMemo(() => {
		const raised = onChainRaised ?? project.raised
		return Math.min(Math.round((raised / project.goal) * 100), 100)
	}, [onChainRaised, project.goal, project.raised])

	// Define the form schema with zod
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

	// Set up react-hook-form with zod validation
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		mode: 'onChange',
		defaultValues: {
			investmentAmount: project.minInvestment,
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
			const signer =
				address || 'GCRYH6M5YLTGZTCAALJPIJGQZY4Z6XFFUVTINCELQG4OGLADUBTAE3OU'
			const balances = await getMultipleBalances(
				{ signer, addresses: [project.escrowContractAddress] },
				(project.escrowType as EscrowType) || 'single-release',
			)
			const first = balances?.[0]
			if (first) setOnChainRaised(first.balance)
		} catch (error) {
			console.error('Failed to fetch escrow balance', error)
		} finally {
			setIsFetchingBalance(false)
		}
	}, [
		address,
		getMultipleBalances,
		project.escrowContractAddress,
		project.escrowType,
	])

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

			// 2) Prepare fund escrow request -> returns unsigned XDR
			const fundResponse = await fundEscrow(
				{
					amount: data.investmentAmount,
					contractId: project.escrowContractAddress,
					signer: address,
				},
				(project.escrowType as EscrowType) || 'single-release',
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

			toast.success('Thank you for your support!', {
				description: `You've donated $${data.investmentAmount.toLocaleString()}`,
				icon: <CircleCheck className="text-primary" />,
			})

			// 5) Refresh balance
			fetchEscrowBalance()
		} catch (error) {
			console.error(error)
			toast.error('Something went wrong', {
				description: "We couldn't process your donation. Please try again.",
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
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className="p-6">
				<h2 className="mb-2 text-xl font-bold">Support This Project</h2>
				<p className="mb-4 text-muted-foreground">
					Your contribution matters. Join the change.
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

				<div className="flex justify-between mb-3 text-sm text-gray-500">
					<span>
						${(onChainRaised ?? project.raised).toLocaleString()} raised
						{isFetchingBalance ? ' (updating...)' : ''}
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
												type="number"
												placeholder={`Min. $${project.minInvestment}`}
												className="pl-6 bg-white border-green-600"
												{...field}
												onChange={(e) => {
													const value =
														e.target.value === ''
															? undefined
															: Number(e.target.value)
													field.onChange(value)
												}}
												value={field.value ?? ''}
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
							disabled={!form.formState.isValid}
						>
							Support Now
						</Button>
					</form>
				</Form>

				<div className="p-3 my-4 text-sm text-amber-900 bg-amber-50 rounded-md border border-amber-300">
					Donating without logging in means you will miss out on features like
					reputation, contributor NFTs, and future perks. If that’s fine, you
					can still donate anonymously.
				</div>

				<div className="flex gap-4">
					<Button
						variant="outline"
						className="flex gap-2 justify-center items-center w-full bg-white gradient-border-btn"
						onClick={handleToggleFollow}
					>
						<Heart
							className={`h-4 w-4 ${isFollowing ? 'text-red-500 fill-red-500' : ''}`}
						/>
						{isFollowing ? 'Following' : 'Follow'}
					</Button>

					<Button
						variant="outline"
						className="flex gap-2 justify-center items-center w-full bg-white gradient-border-btn"
						onClick={handleShare}
					>
						<Share className="w-4 h-4" />
						Share
					</Button>
				</div>
				{/* Wallet status & controls */}
				<div className="p-3 mt-4 text-sm bg-white rounded-md border border-gray-200">
					<div className="flex justify-between items-center mb-2">
						<span className="font-medium">Anonymous Donor</span>
						<span className={isConnected ? 'text-green-600' : 'text-red-600'}>
							{isConnected ? 'Connected' : 'Not connected'}
						</span>
					</div>
					{isConnected ? (
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
					)}
				</div>
			</div>

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
