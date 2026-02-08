'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
	ArrowRight,
	BarChart2,
	Calendar,
	Heart,
	RefreshCw,
	Trophy,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { AchievementsGrid } from '~/components/sections/achievements/achievement-grid'
import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { staggerContainer } from '~/lib/constants/animations'
import { getUserSupportedProjects } from '~/lib/queries/projects/get-user-projects'

interface DonorProfileProps {
	userId: string
	displayName: string
}

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 12,
		},
	},
}

export function DonorProfile({
	userId,
	displayName: _displayName,
}: DonorProfileProps) {
	const [isSyncing, setIsSyncing] = useState(false)
	const {
		data: supportedProjects = [],
		isLoading,
		error,
		refresh,
	} = useSupabaseQuery(
		'user-supported-projects',
		(client) => getUserSupportedProjects(client, userId),
		{
			additionalKeyValues: [userId],
		},
	)

	const { getMultipleBalances } = useEscrow()
	const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>(
		{},
	)
	const [_isLoadingBalances, setIsLoadingBalances] = useState(false)

	// Fetch escrow balances for all supported projects that have escrow addresses
	useEffect(() => {
		const fetchBalances = async (showLoading = true) => {
			const projectsWithEscrow = supportedProjects.filter(
				(p) => p.escrowContractAddress,
			)
			if (projectsWithEscrow.length === 0) return

			try {
				if (showLoading) setIsLoadingBalances(true)
				const addresses = projectsWithEscrow.map(
					(p) => p.escrowContractAddress!,
				)
				const balances = await getMultipleBalances(
					{ addresses },
					'multi-release', // Default to multi-release, could be enhanced to detect type
				)

				// Create a map of address -> balance
				// Balances are returned in the same order as addresses
				const balanceMap: Record<string, number> = {}
				addresses.forEach((address, index) => {
					const balanceResponse = balances[index]
					if (balanceResponse?.balance !== undefined) {
						balanceMap[address] = balanceResponse.balance
					}
				})
				setEscrowBalances(balanceMap)
			} catch (error) {
				console.error('Failed to fetch escrow balances', error)
			} finally {
				if (showLoading) setIsLoadingBalances(false)
			}
		}

		if (supportedProjects.length > 0) {
			// Initial fetch with loading state
			fetchBalances(true)

			// Set up polling to refresh balances every 10 seconds (without loading state)
			const intervalId = setInterval(() => {
				fetchBalances(false)
			}, 10000) // Poll every 10 seconds

			return () => {
				clearInterval(intervalId)
			}
		}
	}, [supportedProjects, getMultipleBalances])

	// Create projects with escrow balances
	const projectsWithBalances = useMemo(() => {
		return supportedProjects.map((project) => {
			const escrowBalance =
				project.escrowContractAddress &&
				escrowBalances[project.escrowContractAddress]
			const raised = Number(escrowBalance ?? project.raised ?? 0)
			const goal = Number(project.goal ?? 0)
			const percentageComplete =
				goal > 0 ? Math.min((raised / goal) * 100, 100) : 0

			return {
				...project,
				raised,
				percentageComplete,
			}
		})
	}, [supportedProjects, escrowBalances])

	const handleSyncDonation = async () => {
		// Prompt user for donation details
		const contractId = prompt(
			'Enter the escrow contract ID (Stellar contract address):\n(Leave empty if you have the project ID)',
		)
		const projectId = prompt(
			'Enter the project ID (UUID):\n(Leave empty if you provided contract ID)',
		)

		if (!contractId && !projectId) {
			toast.error('Please provide either contract ID or project ID')
			return
		}

		const amountStr = prompt('Enter the donation amount:')
		if (!amountStr) return

		const amount = parseFloat(amountStr)
		if (isNaN(amount) || amount <= 0) {
			toast.error('Invalid amount')
			return
		}

		setIsSyncing(true)
		try {
			const response = await fetch('/api/contributions/sync', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					contractId: contractId?.trim() || undefined,
					projectId: projectId?.trim() || undefined,
					amount,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to sync donation')
			}

			toast.success('Donation synced successfully!', {
				description: `Your donation of $${amount.toLocaleString()} has been recorded.`,
			})

			// Refresh the data
			await refresh()
		} catch (error) {
			console.error('Sync error:', error)
			toast.error('Failed to sync donation', {
				description:
					error instanceof Error ? error.message : 'Please try again.',
			})
		} finally {
			setIsSyncing(false)
		}
	}

	const totalContributed = projectsWithBalances.reduce(
		(sum, p) => sum + Number(p.contributionAmount || 0),
		0,
	)
	const impactScore = projectsWithBalances.length * 10

	// Calculate impact metrics from actual donations
	const activeProjects = projectsWithBalances.filter(
		(p) => p.status === 'active' || p.status === 'funding',
	).length
	const completedProjects = projectsWithBalances.filter(
		(p) => p.status === 'completed' || p.status === 'funded',
	).length

	// Calculate average contribution per project
	const avgContribution =
		projectsWithBalances.length > 0
			? totalContributed / projectsWithBalances.length
			: 0

	// Get most recent contribution
	const _mostRecentContribution = projectsWithBalances[0]?.contributionDate
		? new Date(projectsWithBalances[0].contributionDate)
		: null

	// Calculate total impact (sum of all contributions to active/completed projects)
	const totalImpact = projectsWithBalances.reduce((sum, p) => {
		if (
			p.status === 'active' ||
			p.status === 'funding' ||
			p.status === 'completed' ||
			p.status === 'funded'
		) {
			return sum + Number(p.contributionAmount || 0)
		}
		return sum
	}, 0)

	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			className="space-y-6"
		>
			{/* Header */}
			<motion.div
				variants={cardVariants}
				className="flex items-center justify-between"
			>
				<div>
					<h2 className="text-3xl font-extrabold text-foreground">
						Your Impact
					</h2>
					<p className="text-muted-foreground mt-1">
						Track your contributions and the projects you&apos;re supporting
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleSyncDonation}
					disabled={isSyncing}
					className="flex items-center gap-2"
				>
					<RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
					{isSyncing ? 'Syncing...' : 'Sync Donation'}
				</Button>
			</motion.div>

			{/* Stats Overview */}
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-4 md:grid-cols-3"
			>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Projects Supported
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: 'spring' }}
								className="text-4xl font-extrabold text-foreground"
							>
								{supportedProjects.length}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Contributed
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.3, type: 'spring' }}
								className="text-4xl font-extrabold text-[#000124]"
							>
								${totalContributed.toLocaleString()}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Impact Score
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ delay: 0.4, type: 'spring' }}
								className="text-4xl font-extrabold flex items-center gap-2"
							>
								<motion.div
									animate={{ rotate: [0, 10, -10, 0] }}
									transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
								>
									<Trophy className="h-8 w-8 text-[#000124]" />
								</motion.div>
								<span className="text-foreground">{impactScore}</span>
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Impact Overview - Derived from actual donations */}
			<motion.div variants={cardVariants} whileHover={{ y: -2 }}>
				<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
					<div className="absolute top-0 right-0 w-40 h-40 bg-purple-50/50 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
					<CardHeader className="relative z-10">
						<CardTitle className="flex items-center gap-2 text-foreground">
							<BarChart2 className="h-5 w-5 text-[#000124]" />
							Impact Overview
						</CardTitle>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">
									Total Impact Generated
								</p>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.1, type: 'spring' }}
									className="text-3xl font-extrabold text-primary"
								>
									$
									{totalImpact.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</motion.div>
								<p className="text-xs text-muted-foreground">
									From {projectsWithBalances.length} project
									{projectsWithBalances.length !== 1 ? 's' : ''}
								</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">
									Active Projects
								</p>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2, type: 'spring' }}
									className="text-3xl font-extrabold text-foreground"
								>
									{activeProjects}
								</motion.div>
								<p className="text-xs text-muted-foreground">
									Currently supporting
								</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">
									Completed Projects
								</p>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.3, type: 'spring' }}
									className="text-3xl font-extrabold text-purple-600"
								>
									{completedProjects}
								</motion.div>
								<p className="text-xs text-muted-foreground">
									Successfully funded
								</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">
									Average Contribution
								</p>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.4, type: 'spring' }}
									className="text-3xl font-extrabold text-foreground"
								>
									$
									{avgContribution.toLocaleString(undefined, {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									})}
								</motion.div>
								<p className="text-xs text-muted-foreground">Per project</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Supported Projects */}
			<AnimatePresence mode="wait">
				{isLoading ? (
					<motion.div
						key="loading"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="text-center py-12 text-muted-foreground"
					>
						Loading supported projects...
					</motion.div>
				) : error ? (
					<motion.div
						key="error"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<Card className="border-0 bg-red-50">
							<CardContent className="py-12 text-center text-red-600">
								Error loading projects. Please try again.
							</CardContent>
						</Card>
					</motion.div>
				) : projectsWithBalances.length > 0 ? (
					<motion.div
						key="projects"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="space-y-4"
					>
						<h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
							<motion.div
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 1.5, repeat: Infinity }}
							>
								<Heart className="h-5 w-5 fill-[#000124] text-[#000124]" />
							</motion.div>
							Supported Projects
						</h3>
						<motion.div
							variants={staggerContainer}
							initial="initial"
							animate="animate"
							className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
						>
							{projectsWithBalances.map((project, index) => (
								<motion.div
									key={project.id}
									variants={cardVariants}
									custom={index}
								>
									<SupportedProjectCard project={project} />
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				) : (
					<motion.div
						key="empty"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
					></motion.div>
				)}
			</AnimatePresence>

			{/* Gamification Section */}
			<motion.div variants={cardVariants}>
				<GamificationSection />
			</motion.div>

			{/* Rewards & Achievements */}
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-6 lg:grid-cols-2"
			>
				<motion.div variants={cardVariants}>
					<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
						<div className="absolute top-0 right-0 w-40 h-40 bg-purple-50/50 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
						<CardHeader className="relative z-10">
							<CardTitle className="flex items-center gap-2 text-foreground">
								<motion.div
									animate={{ rotate: [0, 10, -10, 0] }}
									transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
								>
									<Trophy className="h-5 w-5 text-[#000124]" />
								</motion.div>
								Badges & Achievements
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<AchievementsGrid />
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={cardVariants}>
					<Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
						<div className="absolute top-0 left-0 w-40 h-40 bg-secondary/5 rounded-full -ml-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
						<CardHeader className="relative z-10">
							<CardTitle className="text-foreground">
								Donation History
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<DonationHistory donations={projectsWithBalances} />
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</motion.div>
	)
}

function DonationHistory({
	donations,
}: {
	donations: Array<{
		id: string
		title: string
		contributionAmount: string | number
		contributionDate: string | null
	}>
}) {
	if (donations.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<p>No donation history yet</p>
			</div>
		)
	}

	return (
		<div className="space-y-3 max-h-[400px] overflow-y-auto">
			{donations.map((donation) => {
				const amount = Number(donation.contributionAmount)
				const date = donation.contributionDate
					? new Date(donation.contributionDate)
					: null
				const timeAgo = date
					? formatDistanceToNow(date, { addSuffix: true })
					: 'Recently'

				return (
					<motion.div
						key={donation.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div className="p-2 rounded-full bg-[#000124]/10 flex-shrink-0">
								<Heart className="h-4 w-4 text-[#000124] fill-[#000124]" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">
									Donated to {donation.title}
								</p>
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{timeAgo}
								</p>
							</div>
						</div>
						<span className="font-bold text-[#000124] ml-4 flex-shrink-0">
							$
							{amount.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span>
					</motion.div>
				)
			})}
		</div>
	)
}

function SupportedProjectCard({
	project,
}: {
	project: {
		id: string
		title: string
		slug: string
		description: string | null
		image: string | null
		raised: number
		goal: number
		percentageComplete: number | null
		status: string
		tags: Array<{ name: string; color: string | null }>
		contributionAmount: string | number
		contributionDate: string | null
	}
}) {
	const percentage = project.percentageComplete ?? 0
	const contributionAmount = Number(project.contributionAmount)

	return (
		<motion.div
			whileHover={{ y: -8, scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="border-0 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-card relative group">
				{/* Decorative overlay */}
				<div className="absolute inset-0 bg-[#000124]/0 group-hover:bg-[#000124]/5 transition-all duration-300 pointer-events-none" />

				{project.image && (
					<motion.div
						className="relative h-48 w-full overflow-hidden"
						whileHover={{ scale: 1.05 }}
						transition={{ duration: 0.3 }}
					>
						<Image
							src={project.image}
							alt={project.title}
							fill
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</motion.div>
				)}
				<CardHeader className="relative z-10">
					<CardTitle className="text-lg line-clamp-2 font-bold">
						{project.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col gap-4 relative z-10">
					{project.description && (
						<p className="text-sm text-muted-foreground line-clamp-2">
							{project.description}
						</p>
					)}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground font-medium">
								Your Contribution
							</span>
							<span className="font-bold text-[#000124]">
								${contributionAmount.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground font-medium">
								Total Raised
							</span>
							<span className="font-bold">
								${Number(project.raised).toLocaleString()} / $
								{Number(project.goal).toLocaleString()}
							</span>
						</div>
						<div className="relative h-3 bg-muted rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-primary rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${percentage}%` }}
								transition={{ duration: 1, ease: 'easeOut' }}
							/>
						</div>
						<p className="text-xs text-muted-foreground text-right font-medium">
							{percentage.toFixed(1)}% funded
						</p>
					</div>
					{project.tags.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{project.tags.slice(0, 3).map((tag) => (
								<motion.div
									key={tag.name}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
								>
									<Badge
										variant="outline"
										className="text-xs"
										style={{
											borderColor: tag.color || undefined,
											color: tag.color || undefined,
										}}
									>
										{tag.name}
									</Badge>
								</motion.div>
							))}
						</div>
					)}
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<Button
							asChild
							variant="outline"
							className="flex-1 border-border hover:bg-muted"
						>
							<Link href={`/projects/${project.slug}`}>
								View Project
								<ArrowRight className="h-4 w-4 ml-2" />
							</Link>
						</Button>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
