'use client'

import { AnimatePresence } from 'framer-motion'
import { Plus, Target } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { CreatorProjectCard } from './creator-project-card'
import type { useCreatorProfile } from './use-creator-profile'

type CreatorProfileData = ReturnType<typeof useCreatorProfile>

function CreatorStatCard({ label, value }: { label: string; value: string }) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
			</CardContent>
		</Card>
	)
}

function CreatorStatsRow({
	projectsCount,
	activeCount,
	totalRaised,
	formatCurrency,
}: {
	projectsCount: number
	activeCount: number
	totalRaised: number
	formatCurrency: (amount: number) => string
}) {
	return (
		<div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
			<CreatorStatCard label="Total Campaigns" value={String(projectsCount)} />
			<CreatorStatCard label="Active Campaigns" value={String(activeCount)} />
			<CreatorStatCard
				label="Total Raised"
				value={formatCurrency(totalRaised)}
			/>
		</div>
	)
}

function CreatorEmptyState() {
	return (
		<Card>
			<CardContent className="py-16 text-center">
				<Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
				<p className="text-muted-foreground mb-6 text-sm">
					Start your first fundraising campaign and make an impact.
				</p>
				<Button asChild>
					<Link href="/create-project">
						<Plus className="h-4 w-4 mr-2" />
						Create Your First Campaign
					</Link>
				</Button>
			</CardContent>
		</Card>
	)
}

export function CreatorCampaignsSection({
	projects,
	projectsWithBalances,
	activeProjects,
	totalRaised,
	formatCurrency,
	isLoading,
	error,
}: Pick<
	CreatorProfileData,
	| 'projects'
	| 'projectsWithBalances'
	| 'activeProjects'
	| 'totalRaised'
	| 'formatCurrency'
	| 'isLoading'
	| 'error'
>) {
	return (
		<div className="space-y-6">
			<CreatorStatsRow
				projectsCount={projects.length}
				activeCount={activeProjects.length}
				totalRaised={totalRaised}
				formatCurrency={formatCurrency}
			/>

			<div className="flex gap-3">
				<Button asChild>
					<Link href="/create-project">
						<Plus className="h-4 w-4 mr-2" />
						Create Campaign
					</Link>
				</Button>
			</div>

			<AnimatePresence mode="wait">
				{isLoading ? (
					<div className="text-center py-12 text-muted-foreground">
						Loading campaigns...
					</div>
				) : error ? (
					<Card>
						<CardContent className="py-12 text-center text-destructive">
							Error loading campaigns. Please try again.
						</CardContent>
					</Card>
				) : projectsWithBalances.length > 0 ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{projectsWithBalances.map((project) => (
							<CreatorProjectCard key={project.id} project={project} />
						))}
					</div>
				) : (
					<CreatorEmptyState />
				)}
			</AnimatePresence>
		</div>
	)
}

export function CreatorProfileOverview({
	projects,
	projectsWithBalances,
	activeProjects,
	totalRaised,
	formatCurrency,
	isLoading,
	error,
}: Pick<
	CreatorProfileData,
	| 'projects'
	| 'projectsWithBalances'
	| 'activeProjects'
	| 'totalRaised'
	| 'formatCurrency'
	| 'isLoading'
	| 'error'
>) {
	return (
		<div className="space-y-6">
			<CreatorStatsRow
				projectsCount={projects.length}
				activeCount={activeProjects.length}
				totalRaised={totalRaised}
				formatCurrency={formatCurrency}
			/>

			<div className="flex flex-wrap gap-3">
				<Button asChild>
					<Link href="/create-project">
						<Plus className="h-4 w-4 mr-2" />
						Create Campaign
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/create-foundation">
						<Plus className="h-4 w-4 mr-2" />
						Create Foundation
					</Link>
				</Button>
			</div>

			{activeProjects.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-lg font-semibold">Active Campaigns</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{activeProjects.map((project) => (
							<CreatorProjectCard key={project.id} project={project} />
						))}
					</div>
				</div>
			)}

			<AnimatePresence mode="wait">
				{isLoading ? (
					<div className="text-center py-12 text-muted-foreground">
						Loading campaigns...
					</div>
				) : error ? (
					<Card>
						<CardContent className="py-12 text-center text-destructive">
							Error loading campaigns. Please try again.
						</CardContent>
					</Card>
				) : projectsWithBalances.length > 0 ? (
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">All Campaigns</h3>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{projectsWithBalances.map((project) => (
								<CreatorProjectCard key={project.id} project={project} compact />
							))}
						</div>
					</div>
				) : !isLoading ? (
					<CreatorEmptyState />
				) : null}
			</AnimatePresence>
		</div>
	)
}
