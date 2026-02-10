'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
	ArrowRight,
	BarChart2,
	Calendar,
	Heart,
	Trophy,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { GamificationSection } from '~/components/sections/gamification/gamification-section'
import { NFTCollection } from '~/components/sections/gamification/nft-collection'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { getUserSupportedProjects } from '~/lib/queries/projects/get-user-projects'

interface DonorProfileProps {
	userId: string
	displayName: string
	showSection?: string
}

export function DonorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: DonorProfileProps) {
	const {
		data: supportedProjects = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'user-supported-projects',
		(client) => getUserSupportedProjects(client, userId),
		{ additionalKeyValues: [userId] },
	)

	const { getMultipleBalances } = useEscrow()
	const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>({})

	// Fetch escrow balances for projects with escrow addresses
	useEffect(() => {
		const fetchBalances = async () => {
			const projectsWithEscrow = supportedProjects.filter(
				(p) => p.escrowContractAddress,
			)
			if (projectsWithEscrow.length === 0) return

			try {
				const addresses = projectsWithEscrow.map(
					(p) => p.escrowContractAddress as string,
				)
				const balances = await getMultipleBalances(
					{ addresses },
					'multi-release',
				)

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
			}
		}

		if (supportedProjects.length > 0) {
			fetchBalances()
			const intervalId = setInterval(() => fetchBalances(), 10000)
			return () => clearInterval(intervalId)
		}
	}, [supportedProjects, getMultipleBalances])

	// Projects with real-time balances
	const projectsWithBalances = useMemo(() => {
		return supportedProjects.map((project) => {
			const escrowBalance =
				project.escrowContractAddress &&
				escrowBalances[project.escrowContractAddress]
			const raised = Number(escrowBalance ?? project.raised ?? 0)
			const goal = Number(project.goal ?? 0)
			const percentageComplete =
				goal > 0 ? Math.min((raised / goal) * 100, 100) : 0

			return { ...project, raised, percentageComplete }
		})
	}, [supportedProjects, escrowBalances])

	// Derive stats in a single pass
	const stats = useMemo(() => {
		let totalContributed = 0
		let activeProjects = 0
		let completedProjects = 0
		let totalImpact = 0

		for (const p of projectsWithBalances) {
			totalContributed += Number(p.contributionAmount || 0)
			const isActive = p.status === 'active' || p.status === 'funding'
			const isCompleted = p.status === 'completed' || p.status === 'funded'
			if (isActive) activeProjects++
			if (isCompleted) completedProjects++
			if (isActive || isCompleted) {
				totalImpact += Number(p.contributionAmount || 0)
			}
		}

		const avgContribution =
			projectsWithBalances.length > 0
				? totalContributed / projectsWithBalances.length
				: 0

		return {
			totalContributed,
			activeProjects,
			completedProjects,
			totalImpact,
			avgContribution,
			impactScore: projectsWithBalances.length * 10,
		}
	}, [projectsWithBalances])

	// Section rendering
	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'donations') {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Donation History</CardTitle>
				</CardHeader>
				<CardContent>
					<DonationHistory donations={projectsWithBalances} />
				</CardContent>
			</Card>
		)
	}

	if (showSection === 'nfts') {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5 text-primary" />
						NFT Collection
					</CardTitle>
				</CardHeader>
				<CardContent>
					<NFTCollection />
				</CardContent>
			</Card>
		)
	}

	// Default: overview
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold text-foreground">Your Impact</h2>
				<p className="text-muted-foreground text-sm mt-1">
					Track your contributions and the projects you&apos;re supporting
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
				<StatCard
					label="Projects Supported"
					value={String(supportedProjects.length)}
				/>
				<StatCard
					label="Total Contributed"
					value={`$${stats.totalContributed.toLocaleString()}`}
				/>
				<StatCard
					label="Impact Score"
					value={String(stats.impactScore)}
					icon={<Trophy className="h-5 w-5 text-primary" />}
				/>
			</div>

			{/* Impact Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<BarChart2 className="h-4 w-4 text-primary" />
						Impact Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						<ImpactMetric
							label="Total Impact"
							value={`$${stats.totalImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
							description={`From ${projectsWithBalances.length} project${projectsWithBalances.length !== 1 ? 's' : ''}`}
						/>
						<ImpactMetric
							label="Active Projects"
							value={String(stats.activeProjects)}
							description="Currently supporting"
						/>
						<ImpactMetric
							label="Completed Projects"
							value={String(stats.completedProjects)}
							description="Successfully funded"
						/>
						<ImpactMetric
							label="Avg. Contribution"
							value={`$${stats.avgContribution.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
							description="Per project"
						/>
					</div>
				</CardContent>
			</Card>

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
					<Card key="error">
						<CardContent className="py-12 text-center text-destructive">
							Error loading projects. Please try again.
						</CardContent>
					</Card>
				) : projectsWithBalances.length > 0 ? (
					<div key="projects" className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Heart className="h-4 w-4 text-primary fill-primary" />
							Supported Projects
						</h3>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{projectsWithBalances.map((project) => (
								<SupportedProjectCard key={project.id} project={project} />
							))}
						</div>
					</div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

/* ── Subcomponents ── */

function StatCard({
	label,
	value,
	icon,
}: {
	label: string
	value: string
	icon?: React.ReactNode
}) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold text-foreground flex items-center gap-2">
					{icon}
					{value}
				</div>
			</CardContent>
		</Card>
	)
}

function ImpactMetric({
	label,
	value,
	description,
}: {
	label: string
	value: string
	description: string
}) {
	return (
		<div className="space-y-1">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			<p className="text-2xl font-bold text-foreground">{value}</p>
			<p className="text-xs text-muted-foreground">{description}</p>
		</div>
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
		<div className="space-y-2 max-h-[400px] overflow-y-auto">
			{donations.map((donation) => {
				const amount = Number(donation.contributionAmount)
				const date = donation.contributionDate
					? new Date(donation.contributionDate)
					: null
				const timeAgo = date
					? formatDistanceToNow(date, { addSuffix: true })
					: 'Recently'

				return (
					<div
						key={donation.id}
						className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
								<Heart className="h-4 w-4 text-primary fill-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm truncate">
									Donated to {donation.title}
								</p>
								<p className="text-xs text-muted-foreground flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{timeAgo}
								</p>
							</div>
						</div>
						<span className="font-bold text-foreground ml-4 flex-shrink-0 tabular-nums">
							${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</span>
					</div>
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
		<Card className="overflow-hidden h-full flex flex-col group hover:shadow-md transition-shadow">
			{project.image && (
				<div className="relative h-40 w-full overflow-hidden">
					<Image
						src={project.image}
						alt={project.title}
						fill
						className="object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</div>
			)}
			<CardHeader className="pb-2">
				<CardTitle className="text-base line-clamp-2">
					{project.title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col gap-3">
				{project.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{project.description}
					</p>
				)}
				<div className="space-y-2 mt-auto">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Your Contribution</span>
						<span className="font-semibold">${contributionAmount.toLocaleString()}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Total Raised</span>
						<span className="font-semibold">
							${Number(project.raised).toLocaleString()} / ${Number(project.goal).toLocaleString()}
						</span>
					</div>
					<div className="relative h-2 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all duration-500"
							style={{ width: `${percentage}%` }}
						/>
					</div>
					<p className="text-xs text-muted-foreground text-right tabular-nums">
						{percentage.toFixed(1)}% funded
					</p>
				</div>
				{project.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{project.tags.slice(0, 3).map((tag) => (
							<Badge
								key={tag.name}
								variant="outline"
								className="text-xs"
								style={{
									borderColor: tag.color || undefined,
									color: tag.color || undefined,
								}}
							>
								{tag.name}
							</Badge>
						))}
					</div>
				)}
				<Button asChild variant="outline" size="sm" className="w-full">
					<Link href={`/projects/${project.slug}`}>
						View Project
						<ArrowRight className="h-4 w-4 ml-2" />
					</Link>
				</Button>
			</CardContent>
		</Card>
	)
}
