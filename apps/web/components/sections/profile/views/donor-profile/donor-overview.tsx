'use client'

import { AnimatePresence } from 'framer-motion'
import { Heart, Trophy } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import { ProfileSectionHeader } from '../../profile-section-header'
import { ProfileStatCard } from '../../profile-stat-card'
import { ProfileSurfaceCard } from '../../profile-surface-card'
import { SupportedProjectCard } from './supported-project-card'
import type { DonorProjectWithBalance } from './types'

interface DonorOverviewProps {
	supportedProjectsCount: number
	projectsWithBalances: DonorProjectWithBalance[]
	stats: {
		totalContributed: number
		impactScore: number
	}
	isLoading: boolean
	error: unknown
}

export function DonorOverview({
	supportedProjectsCount,
	projectsWithBalances,
	stats,
	isLoading,
	error,
}: DonorOverviewProps) {
	const { t } = useI18n()

	return (
		<div className="space-y-8">
			<ProfileSectionHeader
				title={t('profile.donorOverviewTitle')}
				highlight={t('profile.donorOverviewHighlight')}
				description={t('profile.donorOverviewDescription')}
			/>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
				<ProfileStatCard
					label={t('profile.projectsSupported')}
					value={String(supportedProjectsCount)}
				/>
				<ProfileStatCard
					label={t('profile.totalContributed')}
					value={`$${stats.totalContributed.toLocaleString()}`}
				/>
				<ProfileStatCard
					label={t('profile.impactScore')}
					value={String(stats.impactScore)}
					icon={Trophy}
				/>
			</div>

			<AnimatePresence mode="wait">
				{isLoading ? (
					<p className="py-12 text-center text-muted-foreground">{t('profile.loadingProjects')}</p>
				) : error ? (
					<ProfileSurfaceCard>
						<p className="py-8 text-center text-destructive">{t('profile.projectsError')}</p>
					</ProfileSurfaceCard>
				) : projectsWithBalances.length > 0 ? (
					<div className="space-y-4">
						<h3 className="flex items-center gap-2 text-lg font-semibold">
							<Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" />
							{t('profile.supportedProjects')}
						</h3>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{projectsWithBalances.map((project) => (
								<SupportedProjectCard key={project.id} project={project} t={t} />
							))}
						</div>
					</div>
				) : null}
			</AnimatePresence>
		</div>
	)
}
