'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
	ArrowRight,
	Building2,
	Plus,
	Settings,
	Target,
	TrendingUp,
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
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { staggerContainer } from '~/lib/constants/animations'
import { getUserCreatedProjects } from '~/lib/queries/projects/get-user-projects'
import { FoundationsSection } from './foundations-section'

interface CreatorProfileProps {
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

export function CreatorProfile({
	userId,
	displayName: _displayName,
}: CreatorProfileProps) {
	const {
		data: projects = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'user-projects',
		(client) => getUserCreatedProjects(client, userId),
		{
			additionalKeyValues: [userId],
		},
	)

	const { getMultipleBalances } = useEscrow()
	const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>(
		{},
	)
	const [_isLoadingBalances, setIsLoadingBalances] = useState(false)
	const shouldReduceMotion = useReducedMotion()

	// Fetch escrow balances for all projects that have escrow addresses
	useEffect(() => {
		const fetchBalances = async (showLoading = true) => {
			const projectsWithEscrow = projects.filter((p) => p.escrowContractAddress)
			if (projectsWithEscrow.length === 0) return

			try {
				if (showLoading) setIsLoadingBalances(true)
				const addresses = projectsWithEscrow.map(
					(p) => p.escrowContractAddress!,
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
			} finally {
				if (showLoading) setIsLoadingBalances(false)
			}
		}

		if (projects.length > 0) {
			fetchBalances(true)
			const intervalId = setInterval(() => {
				fetchBalances(false)
			}, 10000)

			return () => {
				clearInterval(intervalId)
			}
		}
	}, [projects, getMultipleBalances])

	// Create projects with escrow balances
	const projectsWithBalances = useMemo(() => {
		return projects.map((project) => {
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
	}, [projects, escrowBalances])

	const activeProjects = projectsWithBalances.filter(
		(p) => p.status === 'active' || p.status === 'review',
	)
	const _completedProjects = projectsWithBalances.filter(
		(p) => p.status === 'funded',
	)
	const totalRaised = projectsWithBalances.reduce(
		(sum, p) => sum + Number(p.raised || 0),
		0,
	)

	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			className="space-y-6"
		>
			{/* Stats Overview - Always Visible */}
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-4 md:grid-cols-3"
			>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Campaigns
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									delay: shouldReduceMotion ? 0 : 0.2,
									type: 'spring',
								}}
								className="text-4xl font-extrabold text-foreground tabular-nums"
							>
								{projects.length}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Active Campaigns
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									delay: shouldReduceMotion ? 0 : 0.3,
									type: 'spring',
								}}
								className="text-4xl font-extrabold text-[#000124] tabular-nums"
							>
								{activeProjects.length}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Raised
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									delay: shouldReduceMotion ? 0 : 0.4,
									type: 'spring',
								}}
								className="text-4xl font-extrabold text-foreground tabular-nums"
							>
								{new Intl.NumberFormat('en-US', {
									style: 'currency',
									currency: 'USD',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								}).format(totalRaised)}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Subtabs for Campaigns and Foundations */}
			<Tabs defaultValue="campaigns" className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
					<TabsList className="inline-flex h-auto items-center justify-start gap-1 bg-transparent p-0 border-0">
						<TabsTrigger
							value="campaigns"
							className="data-[state=active]:text-[#000124] data-[state=active]:border-b-[3px] data-[state=active]:border-[#000124] data-[state=active]:font-bold data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent data-[state=inactive]:font-medium transition-all duration-200 rounded-none px-6 py-3 text-base -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000124] focus-visible:ring-offset-2"
						>
							<Target className="h-4 w-4 mr-2" aria-hidden="true" />
							Campaigns
						</TabsTrigger>
						<TabsTrigger
							value="foundations"
							className="data-[state=active]:text-purple-600 data-[state=active]:border-b-[3px] data-[state=active]:border-purple-600 data-[state=active]:font-bold data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent data-[state=inactive]:font-medium transition-all duration-200 rounded-none px-6 py-3 text-base -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
						>
							<Building2 className="h-4 w-4 mr-2" aria-hidden="true" />
							Foundations
						</TabsTrigger>
					</TabsList>
					<div className="flex gap-3 flex-wrap">
						<motion.div
							whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
							whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
							className="flex-shrink-0"
						>
							<Button
								asChild
								className="bg-[#000124] hover:bg-[#000124]/90 text-white shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#000124] focus-visible:ring-offset-2"
							>
								<Link href="/create-project">
									<Plus className="h-4 w-4 mr-2" aria-hidden="true" />
									Create Campaign
								</Link>
							</Button>
						</motion.div>
						<motion.div
							whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
							whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
							className="flex-shrink-0"
						>
							<Button
								asChild
								variant="outline"
								className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:border-purple-700 shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
							>
								<Link href="/create-foundation">
									<Plus className="h-4 w-4 mr-2" aria-hidden="true" />
									Create Foundation
								</Link>
							</Button>
						</motion.div>
					</div>
				</div>

				<AnimatePresence mode="wait">
					<TabsContent value="campaigns" className="space-y-6 mt-6">
						<motion.div
							key="campaigns"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3, ease: 'easeOut' }}
						>
							{/* Active Campaigns */}
							{activeProjects.length > 0 && (
								<div className="space-y-4">
									<h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
										<motion.div
											animate={shouldReduceMotion ? {} : { rotate: [0, 360] }}
											transition={
												shouldReduceMotion
													? {}
													: { duration: 2, repeat: Infinity, ease: 'linear' }
											}
										>
											<TrendingUp
												className="h-5 w-5 text-[#000124]"
												aria-hidden="true"
											/>
										</motion.div>
										Active Campaigns
									</h3>
									<motion.div
										variants={staggerContainer}
										initial="initial"
										animate="animate"
										className="grid gap-4 md:grid-cols-2"
									>
										{activeProjects.map((project, index) => (
											<motion.div
												key={project.id}
												variants={cardVariants}
												custom={index}
											>
												<ProjectCard project={project} />
											</motion.div>
										))}
									</motion.div>
								</div>
							)}

							{/* All Campaigns */}
							{projectsWithBalances.length > 0 && (
								<div className="space-y-4">
									<h3 className="text-xl font-semibold text-foreground">
										All Campaigns
									</h3>
									<AnimatePresence mode="wait">
										{isLoading ? (
											<motion.div
												key="loading"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="text-center py-12 text-muted-foreground"
											>
												Loading campaigns…
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
														Error loading campaigns. Please try again.
													</CardContent>
												</Card>
											</motion.div>
										) : (
											<motion.div
												key="campaigns-list"
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
														<ProjectCard project={project} compact />
													</motion.div>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							)}

							{/* Empty State */}
							{projectsWithBalances.length === 0 && !isLoading && (
								<Card className="border-0 bg-muted/50">
									<CardContent className="py-16 text-center">
										<Target
											className="h-16 w-16 text-muted-foreground mx-auto mb-4"
											aria-hidden="true"
										/>
										<h3 className="text-xl font-semibold mb-2">
											No Campaigns Yet
										</h3>
										<p className="text-muted-foreground mb-6">
											Start your first fundraising campaign and make an impact.
										</p>
										<Button asChild>
											<Link href="/create-project">
												<Plus className="h-4 w-4 mr-2" aria-hidden="true" />
												Create Your First Campaign
											</Link>
										</Button>
									</CardContent>
								</Card>
							)}
						</motion.div>
					</TabsContent>

					<TabsContent value="foundations" className="space-y-6 mt-6">
						<motion.div
							key="foundations"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3, ease: 'easeOut' }}
						>
							<FoundationsSection userId={userId} />
						</motion.div>
					</TabsContent>
				</AnimatePresence>
			</Tabs>
		</motion.div>
	)
}

function ProjectCard({
	project,
	compact = false,
}: {
	project: {
		id: string
		title: string
		slug: string | null
		description: string | null
		image: string | null
		raised: number
		goal: number
		percentageComplete: number | null
		status: string
		tags: Array<{ name: string; color: string | null }>
	}
	compact?: boolean
}) {
	const percentage = project.percentageComplete ?? 0
	const displayRaised = project.raised ?? 0
	const shouldReduceMotion = useReducedMotion()
	const statusColors: Record<string, string> = {
		active: 'bg-[#000124] text-white border-0',
		review: 'bg-secondary text-secondary-foreground border-0',
		funded: 'bg-[#000124]/80 text-white border-0',
		draft: 'bg-muted text-muted-foreground border-border',
		paused: 'bg-destructive text-destructive-foreground border-0',
	}

	return (
		<motion.div
			whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="border-0 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col bg-card relative group">
				{/* Decorative overlay */}
				<div className="absolute inset-0 bg-[#000124]/0 group-hover:bg-[#000124]/5 transition-colors duration-300 pointer-events-none" />

				{project.image && (
					<motion.div
						className="relative h-48 w-full overflow-hidden"
						whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
						transition={{ duration: 0.3 }}
					>
						<Image
							src={project.image}
							alt={project.title}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							loading="lazy"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</motion.div>
				)}
				<CardHeader className="relative z-10">
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="text-lg line-clamp-2 font-bold text-wrap-balance min-w-0">
							{project.title}
						</CardTitle>
						<Badge
							variant="outline"
							className={`${statusColors[project.status] || statusColors.draft} font-semibold shadow-sm shrink-0`}
						>
							{project.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col gap-4 relative z-10">
					{!compact && project.description && (
						<p className="text-sm text-muted-foreground line-clamp-2 min-w-0">
							{project.description}
						</p>
					)}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground font-medium">Raised</span>
							<span className="font-bold text-[#000124] tabular-nums">
								{new Intl.NumberFormat('en-US', {
									style: 'currency',
									currency: 'USD',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								}).format(displayRaised)}{' '}
								/{' '}
								{new Intl.NumberFormat('en-US', {
									style: 'currency',
									currency: 'USD',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								}).format(project.goal)}
							</span>
						</div>
						<div
							className="relative h-3 bg-muted rounded-full overflow-hidden"
							role="progressbar"
							aria-valuenow={percentage}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`${percentage.toFixed(1)}% funded`}
						>
							<motion.div
								className="h-full bg-[#000124] rounded-full"
								initial={
									shouldReduceMotion
										? { width: `${percentage}%` }
										: { width: 0 }
								}
								animate={{ width: `${percentage}%` }}
								transition={{
									duration: shouldReduceMotion ? 0 : 1,
									ease: 'easeOut',
								}}
							/>
						</div>
						<p className="text-xs text-muted-foreground text-right font-medium tabular-nums">
							{percentage.toFixed(1)}% funded
						</p>
					</div>
					{project.tags.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{project.tags.slice(0, 3).map((tag) => (
								<motion.div
									key={tag.name}
									whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
									whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
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
					<div className="flex gap-2 mt-auto">
						<motion.div
							whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
							whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
							className="flex-1"
						>
							<Button
								asChild
								variant="outline"
								className="w-full border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-[#000124] focus-visible:ring-offset-2"
							>
								<Link href={`/projects/${project.slug || project.id}`}>
									View Campaign
									<ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
								</Link>
							</Button>
						</motion.div>
						<motion.div
							whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
							whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
							className="flex-1"
						>
							<Button
								asChild
								variant="outline"
								className="w-full border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-[#000124] focus-visible:ring-offset-2"
							>
								<Link href={`/projects/${project.slug || project.id}/manage`}>
									<Settings className="h-4 w-4 mr-2" aria-hidden="true" />
									Manage
								</Link>
							</Button>
						</motion.div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
