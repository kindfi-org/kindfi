'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Plus, Settings, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { staggerContainer } from '~/lib/constants/animations'
import { getUserCreatedProjects } from '~/lib/queries/projects/get-user-projects'

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

export function CreatorProfile({ userId, displayName }: CreatorProfileProps) {
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
	const [isLoadingBalances, setIsLoadingBalances] = useState(false)

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

		if (projects.length > 0) {
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
	const completedProjects = projectsWithBalances.filter(
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
			{/* Header with CTA */}
			<motion.div
				variants={cardVariants}
				className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
			>
				<div>
					<h2 className="text-3xl font-extrabold text-foreground">
						Your Campaigns
					</h2>
					<p className="text-muted-foreground mt-1">
						Manage and track your active fundraising campaigns
					</p>
				</div>
				<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
					<Button
						asChild
						className="bg-[#000124] hover:bg-[#000124]/90 text-white shadow-lg"
					>
						<Link href="/create-project">
							<Plus className="h-4 w-4 mr-2" />
							Create Campaign
						</Link>
					</Button>
				</motion.div>
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
								Total Campaigns
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: 'spring' }}
								className="text-4xl font-extrabold text-foreground"
							>
								{projects.length}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Active Campaigns
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.3, type: 'spring' }}
								className="text-4xl font-extrabold text-[#000124]"
							>
								{activeProjects.length}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
				<motion.div variants={cardVariants}>
					<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 relative group">
						<div className="absolute top-0 right-0 w-24 h-24 bg-[#000124]/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
						<CardHeader className="pb-3 relative z-10">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Raised
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.4, type: 'spring' }}
								className="text-4xl font-extrabold text-foreground"
							>
								${totalRaised.toLocaleString()}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Active Campaigns */}
			<AnimatePresence mode="wait">
				{isLoading ? (
					<motion.div
						key="loading"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="text-center py-12 text-muted-foreground"
					>
						Loading campaigns...
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
				) : activeProjects.length > 0 ? (
					<motion.div
						key="active"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="space-y-4"
					>
						<h3 className="text-xl font-semibold flex items-center gap-2 text-foreground">
							<motion.div
								animate={{ rotate: [0, 360] }}
								transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
							>
								<TrendingUp className="h-5 w-5 text-[#000124]" />
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

			{/* All Campaigns */}
			{projectsWithBalances.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="space-y-4"
				>
					<h3 className="text-xl font-semibold text-foreground">
						All Campaigns
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
								<ProjectCard project={project} compact />
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			)}
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
	const statusColors: Record<string, string> = {
		active: 'bg-[#000124] text-white border-0',
		review: 'bg-secondary text-secondary-foreground border-0',
		funded: 'bg-[#000124]/80 text-white border-0',
		draft: 'bg-muted text-muted-foreground border-border',
		paused: 'bg-destructive text-destructive-foreground border-0',
	}

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
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="text-lg line-clamp-2 font-bold">
							{project.title}
						</CardTitle>
						<Badge
							variant="outline"
							className={`${statusColors[project.status] || statusColors.draft} font-semibold shadow-sm`}
						>
							{project.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col gap-4 relative z-10">
					{!compact && project.description && (
						<p className="text-sm text-muted-foreground line-clamp-2">
							{project.description}
						</p>
					)}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground font-medium">Raised</span>
							<span className="font-bold text-[#000124]">
								${Number(displayRaised).toLocaleString()} / $
								{Number(project.goal).toLocaleString()}
							</span>
						</div>
						<div className="relative h-3 bg-muted rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-[#000124] rounded-full"
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
					<div className="flex gap-2 mt-auto">
						<motion.div
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="flex-1"
						>
							<Button
								asChild
								variant="outline"
								className="w-full border-border hover:bg-muted"
							>
								<Link href={`/projects/${project.slug || project.id}`}>
									View Campaign
									<ArrowRight className="h-4 w-4 ml-2" />
								</Link>
							</Button>
						</motion.div>
						<motion.div
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="flex-1"
						>
							<Button
								asChild
								variant="outline"
								className="w-full border-border hover:bg-muted"
							>
								<Link href={`/projects/${project.slug || project.id}/manage`}>
									<Settings className="h-4 w-4 mr-2" />
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
