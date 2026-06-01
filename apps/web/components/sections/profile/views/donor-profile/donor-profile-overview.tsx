'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BarChart2, Heart, Trophy } from 'lucide-react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	DonorImpactMetric,
	DonorStatCard,
	SupportedProjectCard,
} from './donor-profile-parts'
import type { useDonorProfile } from './use-donor-profile'

type DonorProfileData = ReturnType<typeof useDonorProfile>

export function DonorProfileOverview({
	supportedProjects,
	projectsWithBalances,
	stats,
	isLoading,
	error,
}: Pick<
	DonorProfileData,
	| 'supportedProjects'
	| 'projectsWithBalances'
	| 'stats'
	| 'isLoading'
	| 'error'
>) {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-foreground">Your Impact</h2>
				<p className="text-muted-foreground text-sm mt-1">
					Track your contributions and the projects you&apos;re supporting
				</p>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
				<DonorStatCard
					label="Projects Supported"
					value={String(supportedProjects.length)}
				/>
				<DonorStatCard
					label="Total Contributed"
					value={`$${stats.totalContributed.toLocaleString()}`}
				/>
				<DonorStatCard
					label="Impact Score"
					value={String(stats.impactScore)}
					icon={<Trophy className="h-5 w-5 text-primary" />}
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<BarChart2 className="h-4 w-4 text-primary" />
						Impact Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						<DonorImpactMetric
							label="Total Impact"
							value={`$${stats.totalImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
							description={`From ${projectsWithBalances.length} project${projectsWithBalances.length !== 1 ? 's' : ''}`}
						/>
						<DonorImpactMetric
							label="Active Projects"
							value={String(stats.activeProjects)}
							description="Currently supporting"
						/>
						<DonorImpactMetric
							label="Completed Projects"
							value={String(stats.completedProjects)}
							description="Successfully funded"
						/>
						<DonorImpactMetric
							label="Avg. Contribution"
							value={`$${stats.avgContribution.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
							description="Per project"
						/>
					</div>
				</CardContent>
			</Card>

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
