'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence } from 'framer-motion'
import { ArrowRight, Plus, Settings, Target, Trophy } from 'lucide-react'
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
import { useI18n } from '~/lib/i18n'
import { getUserCreatedProjects } from '~/lib/queries/projects/get-user-projects'
import { ProfileSectionHeader } from '../profile-section-header'
import { ProfileStatCard } from '../profile-stat-card'
import { ProfileSurfaceCard } from '../profile-surface-card'
import { FoundationsSection } from './foundations-section'
import { logger } from '@/lib/logger'

interface CreatorProfileProps {
	userId: string
	displayName: string
	showSection?: string
}

export function CreatorProfile({
	userId,
	displayName: _displayName,
	showSection = 'overview',
}: CreatorProfileProps) {
	const { t } = useI18n()
	const {
		data: projects = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'user-projects',
		(client) => getUserCreatedProjects(client, userId),
		{ additionalKeyValues: [userId] },
	)

	const { getMultipleBalances } = useEscrow()
	const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>(
		{},
	)

	// Fetch escrow balances
	useEffect(() => {
		const fetchBalances = async () => {
			const projectsWithEscrow = projects.filter((p) => p.escrowContractAddress)
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
				logger.error('Failed to fetch escrow balances', error)
			}
		}

		if (projects.length > 0) {
			fetchBalances()
			const intervalId = setInterval(fetchBalances, 10000)
			return () => clearInterval(intervalId)
		}
	}, [projects, getMultipleBalances])

	// Projects with real-time balances
	const projectsWithBalances = useMemo(() => {
		return projects.map((project) => {
			const escrowBalance =
				project.escrowContractAddress &&
				escrowBalances[project.escrowContractAddress]
			const raised = Number(escrowBalance ?? project.raised ?? 0)
			const goal = Number(project.goal ?? 0)
			const percentageComplete =
				goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
			return { ...project, raised, percentageComplete }
		})
	}, [projects, escrowBalances])

	const activeProjects = projectsWithBalances.filter(
		(p) => p.status === 'active' || p.status === 'review',
	)
	const totalRaised = projectsWithBalances.reduce(
		(sum, p) => sum + Number(p.raised || 0),
		0,
	)

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)

	// Section rendering
	if (showSection === 'gamification') {
		return <GamificationSection />
	}

	if (showSection === 'foundations') {
		return <FoundationsSection userId={userId} />
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

	if (showSection === 'campaigns') {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
					<ProfileStatCard label={t('profile.totalCampaigns')} value={String(projects.length)} />
					<ProfileStatCard
						label={t('profile.activeCampaigns')}
						value={String(activeProjects.length)}
					/>
					<ProfileStatCard label={t('profile.totalRaised')} value={formatCurrency(totalRaised)} />
				</div>

				<div className="flex gap-3">
					<Button asChild className="gradient-btn rounded-full text-white">
						<Link href="/create-project">
							<Plus className="h-4 w-4 mr-2" />
							{t('profile.createCampaign')}
						</Link>
					</Button>
				</div>

				<AnimatePresence mode="wait">
					{isLoading ? (
						<p className="py-12 text-center text-muted-foreground">
							{t('profile.loadingCampaigns')}
						</p>
					) : error ? (
						<ProfileSurfaceCard>
							<p className="py-8 text-center text-destructive">
								{t('profile.campaignsError')}
							</p>
						</ProfileSurfaceCard>
					) : projectsWithBalances.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{projectsWithBalances.map((project) => (
								<ProjectCard key={project.id} project={project} t={t} />
							))}
						</div>
					) : (
						<ProfileSurfaceCard className="py-12 text-center">
							<Target className="mx-auto mb-4 h-12 w-12 text-emerald-600/70" />
							<h3 className="mb-2 text-lg font-semibold">{t('profile.noCampaignsTitle')}</h3>
							<p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
								{t('profile.noCampaignsDescription')}
							</p>
							<Button asChild className="gradient-btn rounded-full text-white">
								<Link href="/create-project">
									<Plus className="h-4 w-4 mr-2" />
									{t('profile.createFirstCampaign')}
								</Link>
							</Button>
						</ProfileSurfaceCard>
					)}
				</AnimatePresence>
			</div>
		)
	}

	// Default: overview
	return (
		<div className="space-y-8">
			<ProfileSectionHeader
				title={t('profile.creatorOverviewTitle')}
				highlight={t('profile.creatorOverviewHighlight')}
				description={t('profile.creatorOverviewDescription')}
			/>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
				<ProfileStatCard label={t('profile.totalCampaigns')} value={String(projects.length)} />
				<ProfileStatCard
					label={t('profile.activeCampaigns')}
					value={String(activeProjects.length)}
				/>
				<ProfileStatCard label={t('profile.totalRaised')} value={formatCurrency(totalRaised)} />
			</div>

			<div className="flex flex-wrap gap-3">
				<Button asChild className="gradient-btn rounded-full text-white">
					<Link href="/create-project">
						<Plus className="h-4 w-4 mr-2" />
						{t('profile.createCampaign')}
					</Link>
				</Button>
				<Button asChild variant="outline" className="rounded-full bg-white/80">
					<Link href="/create-foundation">
						<Plus className="h-4 w-4 mr-2" />
						{t('profile.tabFoundations')}
					</Link>
				</Button>
			</div>

			{activeProjects.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">{t('profile.activeCampaignsSection')}</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{activeProjects.map((project) => (
							<ProjectCard key={project.id} project={project} t={t} />
						))}
					</div>
				</div>
			)}

			<AnimatePresence mode="wait">
				{isLoading ? (
					<p className="py-12 text-center text-muted-foreground">
						{t('profile.loadingCampaigns')}
					</p>
				) : error ? (
					<ProfileSurfaceCard>
						<p className="py-8 text-center text-destructive">
							{t('profile.campaignsError')}
						</p>
					</ProfileSurfaceCard>
				) : projectsWithBalances.length > 0 ? (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">{t('profile.allCampaignsSection')}</h3>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{projectsWithBalances.map((project) => (
								<ProjectCard key={project.id} project={project} compact t={t} />
							))}
						</div>
					</div>
				) : !isLoading ? (
					<ProfileSurfaceCard className="py-12 text-center">
						<Target className="mx-auto mb-4 h-12 w-12 text-emerald-600/70" />
						<h3 className="mb-2 text-lg font-semibold">{t('profile.noCampaignsTitle')}</h3>
						<p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
							{t('profile.noCampaignsDescription')}
						</p>
						<Button asChild className="gradient-btn rounded-full text-white">
							<Link href="/create-project">
								<Plus className="h-4 w-4 mr-2" />
								{t('profile.createFirstCampaign')}
							</Link>
						</Button>
					</ProfileSurfaceCard>
				) : null}
			</AnimatePresence>
		</div>
	)
}

/* ── Subcomponents ── */

const STATUS_COLORS: Record<string, string> = {
	active: 'bg-primary text-primary-foreground',
	review: 'bg-secondary text-secondary-foreground',
	funded: 'bg-primary/80 text-primary-foreground',
	draft: 'bg-muted text-muted-foreground',
	paused: 'bg-destructive text-destructive-foreground',
}

function ProjectCard({
	project,
	compact = false,
	t,
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
	t: (key: string) => string
}) {
	const percentage = project.percentageComplete ?? 0

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)

	return (
		<ProfileSurfaceCard padding="sm" className="group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
			{project.image && (
				<div className="relative h-44 w-full overflow-hidden">
					<Image
						src={project.image}
						alt={project.title}
						fill
						className="object-cover group-hover:scale-105 transition-transform duration-300"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						loading="lazy"
					/>
				</div>
			)}
			<CardHeader className="px-5 pb-2 pt-5">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base line-clamp-2 min-w-0">
						{project.title}
					</CardTitle>
					<Badge
						variant="outline"
						className={`${STATUS_COLORS[project.status] || STATUS_COLORS.draft} border-0 shrink-0 text-xs`}
					>
						{project.status}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
				{!compact && project.description && (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{project.description}
					</p>
				)}
				<div className="space-y-2 mt-auto">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Raised</span>
						<span className="font-semibold tabular-nums">
							{formatCurrency(project.raised)} / {formatCurrency(project.goal)}
						</span>
					</div>
					<div
						className="relative h-2 bg-muted rounded-full overflow-hidden"
						role="progressbar"
						aria-valuenow={percentage}
						aria-valuemin={0}
						aria-valuemax={100}
					>
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
					<div className="flex gap-2">
					<Button asChild variant="outline" size="sm" className="flex-1 rounded-full">
						<Link href={`/projects/${project.slug || project.id}`}>
							{t('profile.viewCampaign')}
							<ArrowRight className="h-4 w-4 ml-2" />
						</Link>
					</Button>
					<Button asChild variant="outline" size="sm" className="flex-1 rounded-full">
						<Link href={`/projects/${project.slug || project.id}/manage`}>
							<Settings className="h-4 w-4 mr-2" />
							{t('profile.manageCampaign')}
						</Link>
					</Button>
				</div>
			</CardContent>
		</ProfileSurfaceCard>
	)
}
